#!/usr/bin/env python3
"""
OpenShift/Kubernetes Resource Scaler
Scales down/up Deployments and StatefulSets based on action parameter,
using the official Kubernetes Python client (no shell commands).
"""

import argparse
import os
import json
import logging
import sys
import time
from urllib import request as urlrequest, error as urlerror
from typing import Any, Dict, List, Optional, Set

from kubernetes import client, config
from kubernetes.client import ApiException


class OpenShiftScaler:
    def __init__(self, namespace: str = "monitoring"):
        self.namespace = namespace
        self.logger = self._setup_logging()
        self.apps = None  # type: Optional[client.AppsV1Api]
        self.core = None  # type: Optional[client.CoreV1Api]

    def _setup_logging(self) -> logging.Logger:
        """Setup logging configuration."""
        log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        
        logging.basicConfig(
            level=logging.INFO,
            format=log_format,
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        logger = logging.getLogger(__name__)
        if not logger.handlers:
            handler = logging.StreamHandler(sys.stdout)
            handler.setFormatter(
                logging.Formatter(log_format)
            )
            logger.addHandler(handler)
            logger.setLevel(logging.INFO)
        return logger

    # ------------------------- Auth / Client Setup -------------------------

    def ensure_login(self) -> None:
        """
        Initialize Kubernetes client:
        - Try in-cluster service account
        - Fallback to local kubeconfig
        """
        try:
            config.load_incluster_config()
            self.logger.info("Authenticated using in-cluster service account.")
        except Exception:
            self.logger.info("In-cluster config unavailable. Trying local kubeconfig...")
            try:
                config.load_kube_config()
                self.logger.info("Authenticated using local kubeconfig.")
            except Exception as e:
                self.logger.error(f"Failed to load Kubernetes config: {e}")
                raise

        self.apps = client.AppsV1Api()
        self.core = client.CoreV1Api()

        # Quick sanity-check: attempt to read namespace (no RBAC = will raise)
        try:
            _ = self.core.read_namespace(self.namespace)
            self.logger.info(f"Connected. Namespace '{self.namespace}' is accessible.")
        except ApiException as e:
            if e.status == 404:
                self.logger.error(f"Namespace '{self.namespace}' not found.")
            else:
                self.logger.error(
                    f"Failed to access namespace '{self.namespace}': {e.status} {e.reason}"
                )
            raise

    # ------------------------- Helpers -------------------------

    @staticmethod
    def _resource_key(kind: str, name: str) -> str:
        """Return a normalized 'kind/name' key (kind in lowercase)."""
        base = kind.lower()
        if base.startswith("deploy"):
            base = "deployment"
        elif base.startswith("statefulset"):
            base = "statefulset"
        return f"{base}/{name}"

    # ------------------------- Discovery -------------------------

    def _get_releases(self) -> Set[str]:
        """Get all releases (app.kubernetes.io/instance) in the namespace.
        This is used for actual scaling to avoid duplicate processing.
        """
        self.logger.info(f"Getting releases in namespace '{self.namespace}'")
        releases: Set[str] = set()

        try:
            dpls = self.apps.list_namespaced_deployment(self.namespace)
            for d in dpls.items:
                inst = (d.metadata.labels or {}).get("app.kubernetes.io/instance")
                if inst:
                    releases.add(inst)
        except ApiException as e:
            self.logger.error(f"Failed to list Deployments: {e}")

        try:
            ssets = self.apps.list_namespaced_stateful_set(self.namespace)
            for s in ssets.items:
                inst = (s.metadata.labels or {}).get("app.kubernetes.io/instance")
                if inst:
                    releases.add(inst)
        except ApiException as e:
            self.logger.error(f"Failed to list StatefulSets: {e}")

        self.logger.info(f"Found releases: {sorted(releases)}")
        return releases

    def discover_releases(self) -> Dict[str, Any]:
        """Discover all release labels (including duplicates) and provide counts.
        Returns a dictionary with totals and lists for diagnostics/dry-run.
        """
        totals = {
            "deployments_total": 0,
            "deployments_labeled": 0,
            "statefulsets_total": 0,
            "statefulsets_labeled": 0,
            "all_releases": [],  # type: List[str]
        }
        all_labels: List[str] = []

        try:
            dpls = self.apps.list_namespaced_deployment(self.namespace)
            totals["deployments_total"] = len(dpls.items)
            for d in dpls.items:
                inst = (d.metadata.labels or {}).get("app.kubernetes.io/instance")
                if inst:
                    totals["deployments_labeled"] += 1
                    all_labels.append(inst)
        except ApiException as e:
            self.logger.error(f"Failed to list Deployments: {e}")

        try:
            ssets = self.apps.list_namespaced_stateful_set(self.namespace)
            totals["statefulsets_total"] = len(ssets.items)
            for s in ssets.items:
                inst = (s.metadata.labels or {}).get("app.kubernetes.io/instance")
                if inst:
                    totals["statefulsets_labeled"] += 1
                    all_labels.append(inst)
        except ApiException as e:
            self.logger.error(f"Failed to list StatefulSets: {e}")

        totals["all_releases"] = all_labels
        return totals

    def _get_resources_for_release(self, release: str, resource_type: str) -> List[str]:
        """Return resource identifiers ('deployment/name' or 'statefulset/name') for a release."""
        label_selector = f"app.kubernetes.io/instance={release}"
        names: List[str] = []
        try:
            if resource_type == "deployment":
                resp = self.apps.list_namespaced_deployment(
                    self.namespace, label_selector=label_selector
                )
                for d in resp.items:
                    names.append(self._resource_key("deployment", d.metadata.name))
            elif resource_type == "statefulset":
                resp = self.apps.list_namespaced_stateful_set(
                    self.namespace, label_selector=label_selector
                )
                for s in resp.items:
                    names.append(self._resource_key("statefulset", s.metadata.name))
        except ApiException as e:
            self.logger.error(f"Failed to list {resource_type}s for {release}: {e}")
        return names

    # ------------------------- Read / Annotate -------------------------

    def _get_object(self, resource_name: str):
        """Fetch the k8s object (Deployment/StatefulSet)."""
        kind, name = resource_name.split("/", 1)
        try:
            if kind == "deployment":
                return self.apps.read_namespaced_deployment(name, self.namespace)
            elif kind == "statefulset":
                return self.apps.read_namespaced_stateful_set(name, self.namespace)
            else:
                raise ValueError(f"Unsupported kind: {kind}")
        except ApiException as e:
            self.logger.error(f"Failed to read {resource_name}: {e}")
            return None

    def _has_skip_annotation(self, resource_name: str) -> bool:
        """Check if resource has scaling.skip=true annotation."""
        obj = self._get_object(resource_name)
        if not obj:
            return False
        ann = obj.metadata.annotations or {}
        return str(ann.get("scaling.skip", "false")).lower() == "true"

    def _get_current_replicas(self, resource_name: str) -> Optional[int]:
        """Get current desired replicas for a resource."""
        obj = self._get_object(resource_name)
        if not obj:
            return None
        # spec.replicas can be None (defaults to 1); treat None as 1 to be safe
        replicas = obj.spec.replicas if obj.spec.replicas is not None else 1
        return int(replicas)

    def _get_previous_size_annotation(self, resource_name: str) -> Optional[int]:
        obj = self._get_object(resource_name)
        if not obj:
            return None
        ann = obj.metadata.annotations or {}
        val = ann.get("previous-size")
        if val and str(val).isdigit():
            return int(val)
        return None

    def _patch_annotations(self, resource_name: str, annotations: Dict[str, Optional[str]]) -> bool:
        """
        Patch annotations. Use 'key: None' to remove an annotation.
        """
        kind, name = resource_name.split("/", 1)
        body = {"metadata": {"annotations": annotations}}
        try:
            if kind == "deployment":
                self.apps.patch_namespaced_deployment(name, self.namespace, body=body)
            elif kind == "statefulset":
                self.apps.patch_namespaced_stateful_set(name, self.namespace, body=body)
            else:
                raise ValueError(f"Unsupported kind: {kind}")
            return True
        except ApiException as e:
            self.logger.error(f"Failed to patch annotations on {resource_name}: {e}")
            return False

    def _annotate_resource(self, resource_name: str, key: str, value: str) -> bool:
        return self._patch_annotations(resource_name, {key: value})

    def _remove_annotation(self, resource_name: str, key: str) -> bool:
        return self._patch_annotations(resource_name, {key: None})

    # ------------------------- Scale -------------------------

    def _scale_resource(self, resource_name: str, replicas: int) -> bool:
        """Scale resource to a specified replica count."""
        kind, name = resource_name.split("/", 1)
        body = {"spec": {"replicas": replicas}}
        try:
            if kind == "deployment":
                self.apps.patch_namespaced_deployment_scale(name, self.namespace, body=body)
            elif kind == "statefulset":
                # patch scale subresource for statefulsets as well
                self.apps.patch_namespaced_stateful_set_scale(name, self.namespace, body=body)
            else:
                raise ValueError(f"Unsupported kind: {kind}")
            self.logger.info(f"Scaled {resource_name} to {replicas} replicas")
            return True
        except ApiException as e:
            if e.status == 403:
                self.logger.error(f"Forbidden: No permission to scale {resource_name}.")
            else:
                self.logger.error(f"Failed to scale {resource_name}: {e.status} {e.reason}")
            return False

    # ------------------------- Slack -------------------------

    def _notify_slack(self, webhook_url: Optional[str], message: str) -> None:
        if not webhook_url:
            self.logger.debug("No Slack webhook URL provided, skipping notification")
            return
        payload = {"text": message}
        data = json.dumps(payload).encode("utf-8")
        req = urlrequest.Request(webhook_url, data=data, headers={"Content-Type": "application/json"})
        try:
            with urlrequest.urlopen(req, timeout=10) as resp:
                self.logger.debug(f"Slack notification sent, status {resp.status}")
        except urlerror.HTTPError as e:
            self.logger.error(f"Failed to send Slack notification: HTTP {e.code} - {e.read().decode(errors='ignore')}")
        except Exception as e:
            self.logger.error(f"Failed to send Slack notification: {e}")

    def _format_summary(
        self,
        action: str,
        namespace: str,
        release: Optional[str],
        successes: int,
        failures: int,
        duration_sec: float,
        failed_releases: Optional[Set[str]] = None,
    ) -> str:
        target = release or "all releases"
        failed_text = (
            f"Failed releases: {', '.join(sorted(failed_releases))}" if failed_releases else "Failed releases: none"
        )
        return (
            f"Scaler {action} completed in {duration_sec:.1f}s for {target} in ns '{namespace}'.\n"
            f"Successes: {successes}, Failures: {failures}. {failed_text}"
        )

    def _process_resource(self, action: str, resource_name: str) -> Optional[bool]:
        """Process a single resource for the given action.
        Returns True on success, False on failure, None if skipped/no-op.
        """
        # Respect skip annotation for both directions
        if self._has_skip_annotation(resource_name):
            self.logger.info(f"    Skipping {resource_name} - has scaling.skip=true")
            return None

        if action == "down":
            current_replicas = self._get_current_replicas(resource_name)
            if current_replicas is None:
                self.logger.warning(f"    Could not get replicas for {resource_name}, skipping")
                return None
            if current_replicas == 0:
                self.logger.info(f"    Skipping {resource_name} - already at 0")
                return None

            # Annotate first, then scale
            if self._annotate_resource(resource_name, "previous-size", str(current_replicas)):
                if self._scale_resource(resource_name, 0):
                    self.logger.info(f"    Scaled {resource_name} {current_replicas} → 0")
                    return True
                else:
                    self.logger.error(f"    Failed to scale {resource_name}")
                    # rollback annotation if scaling failed
                    self._remove_annotation(resource_name, "previous-size")
                    return False
            else:
                self.logger.error(f"    Failed to annotate {resource_name}")
                return False

        elif action == "up":
            previous_size = self._get_previous_size_annotation(resource_name)
            if previous_size is None:
                self.logger.info(f"    No previous-size annotation on {resource_name}, skipping")
                return None
            if self._scale_resource(resource_name, int(previous_size)):
                self._remove_annotation(resource_name, "previous-size")
                self.logger.info(f"    Restored {resource_name} to {previous_size} replicas")
                return True
            else:
                self.logger.error(f"    Failed to scale {resource_name} to {previous_size}")
                return False
        else:
            raise ValueError("action must be 'down' or 'up'")

    def scale(self, action: str, target_release: Optional[str] = None) -> Dict[str, Any]:
        """Unified scaling handler for both 'down' and 'up'."""
        if action not in {"down", "up"}:
            raise ValueError("action must be 'down' or 'up'")

        successes = 0
        failures = 0
        failed_releases: Set[str] = set()
        start = time.time()

        releases = {target_release} if target_release else self._get_releases()
        if not releases:
            # Return a consistent summary dict even when nothing to process
            duration = time.time() - start
            summary = self._format_summary(
                action,
                self.namespace,
                target_release,
                0,
                0,
                duration,
                set(),
            )
            self.logger.info(summary)
            return {
                "summary": summary,
                "successes": 0,
                "failures": 0,
                "failed_releases": set(),
                "duration_sec": duration,
            }

        for release in sorted(releases):
            self.logger.info(f"Processing release '{release}':")
            release_had_failure = False

            for resource_type in ["deployment", "statefulset"]:
                resources = self._get_resources_for_release(release, resource_type)
                if not resources:
                    continue
                self.logger.info(f"  Processing {resource_type}s for release '{release}':")

                for resource_name in resources:
                    result = self._process_resource(action, resource_name)
                    if result is True:
                        successes += 1
                    elif result is False:
                        failures += 1
                        release_had_failure = True
                    # None => skipped; no counters updated

            if release_had_failure:
                failed_releases.add(release)
            self.logger.info(f"  Completed scaling {action} release '{release}'")

        duration = time.time() - start
        summary = self._format_summary(
            action, self.namespace, target_release, successes, failures, duration, failed_releases
        )
        self.logger.info(summary)
        return {
            "summary": summary,
            "successes": successes,
            "failures": failures,
            "failed_releases": failed_releases,
            "duration_sec": duration,
        }

    def scale_all(self, action: str) -> Dict[str, Any]:
        """Scale all Deployments and StatefulSets in the namespace (ignoring release labels).
        Respects scaling.skip annotation and previous-size logic.
        """
        if action not in {"down", "up"}:
            raise ValueError("action must be 'down' or 'up'")

        successes = 0
        failures = 0
        start = time.time()

        resources: List[str] = []
        try:
            dpls = self.apps.list_namespaced_deployment(self.namespace)
            for d in dpls.items:
                resources.append(self._resource_key("deployment", d.metadata.name))
        except ApiException as e:
            self.logger.error(f"Failed to list Deployments: {e}")

        try:
            ssets = self.apps.list_namespaced_stateful_set(self.namespace)
            for s in ssets.items:
                resources.append(self._resource_key("statefulset", s.metadata.name))
        except ApiException as e:
            self.logger.error(f"Failed to list StatefulSets: {e}")

        if not resources:
            # Return a consistent summary dict even when nothing to process
            duration = time.time() - start
            summary = self._format_summary(
                action,
                self.namespace,
                None,
                0,
                0,
                duration,
                None,
            )
            self.logger.info(summary)
            return {
                "summary": summary,
                "successes": 0,
                "failures": 0,
                "failed_releases": set(),
                "duration_sec": duration,
            }

        self.logger.info(f"Processing all resources in ns '{self.namespace}': {len(resources)} items")
        for resource_name in resources:
            result = self._process_resource(action, resource_name)
            if result is True:
                successes += 1
            elif result is False:
                failures += 1

        duration = time.time() - start
        summary = self._format_summary(action, self.namespace, None, successes, failures, duration, None)
        self.logger.info(summary)
        return {
            "summary": summary,
            "successes": successes,
            "failures": failures,
            "failed_releases": set(),
            "duration_sec": duration,
        }

    # ------------------------- Actions -------------------------

    def scale_down(self, target_release: Optional[str] = None):
        """Wrapper for scaling down using the unified handler."""
        return self.scale("down", target_release=target_release)

    def scale_up(self, target_release: Optional[str] = None):
        """Wrapper for scaling up using the unified handler."""
        return self.scale("up", target_release=target_release)


def main():
    parser = argparse.ArgumentParser(description="Kubernetes Resource Scaler (Python client)")
    parser.add_argument("action", choices=["up", "down"], help="Action to perform")
    # Allow multiple --namespace flags; also accept comma-separated values per flag
    parser.add_argument(
        "--namespace",
        dest="namespaces",
        action="append",
        help="Target namespace. Repeat flag for multiple or pass comma-separated list. Default: monitoring",
    )
    parser.add_argument("--debug", action="store_true", help="Enable debug logging")
    parser.add_argument("--dry-run", action="store_true", help="Discovery only; no changes applied")
    parser.add_argument("--release", help="Only operate on a specific release (e.g., infra-monitoring)")
    parser.add_argument("--all", action="store_true", help="Process all resources (ignores release labels).")
    parser.add_argument("--slack-webhook", dest="slack_webhook", help="Slack Incoming Webhook URL (overrides env SLACK_WEBHOOK_URL)")
    args = parser.parse_args()

    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)

    logger = logging.getLogger(__name__)
    logger.info("=== Resource Scaler Started ===")
    logger.info(f"Action: {args.action}")
    logger.info(f"Debug mode: {args.debug}")
    if args.dry_run:
        logger.info("Dry-run mode: will not annotate or scale any resources")
    if args.release:
        logger.info(f"Targeting release: {args.release}")

    # Build namespace list
    raw_namespaces = args.namespaces or ["monitoring"]
    namespaces: List[str] = []
    for item in raw_namespaces:
        if item:
            # support comma-separated values in a single flag
            parts = [p.strip() for p in item.split(",") if p.strip()]
            namespaces.extend(parts if parts else [item])
    if not namespaces:
        namespaces = ["monitoring"]
    logger.info(f"Target namespaces: {namespaces}")

    start_time = time.time()
    slack_url = args.slack_webhook or os.environ.get("SLACK_WEBHOOK_URL")
    all_summaries: List[str] = []
    total_successes: int = 0
    total_failures: int = 0
    aggregated_failed_releases: Set[str] = set()
    namespaces_processed: List[str] = []
    try:
        for ns in namespaces:
            logger.info(f"--- Processing namespace: {ns} ---")
            scaler = OpenShiftScaler(namespace=ns)
            try:
                scaler.ensure_login()
            except Exception:
                logger.error(f"Skipping namespace '{ns}' due to authentication/authorization failure")
                continue

            if args.dry_run:
                # Discovery-only: print counts and continue
                info = scaler.discover_releases()
                total_labels = len(info["all_releases"])  # may include duplicates
                unlabeled_deployments = info["deployments_total"] - info["deployments_labeled"]
                unlabeled_statefulsets = info["statefulsets_total"] - info["statefulsets_labeled"]
                logger.info(
                    "DRY RUN: ns='%s' releases: total-labels=%d | deployments total=%d labeled=%d unlabeled=%d | statefulsets total=%d labeled=%d unlabeled=%d",
                    ns,
                    total_labels,
                    info["deployments_total"],
                    info["deployments_labeled"],
                    unlabeled_deployments,
                    info["statefulsets_total"],
                    info["statefulsets_labeled"],
                    unlabeled_statefulsets,
                )
            else:
                try:
                    # Collect per-namespace metrics without notifying Slack yet
                    if args.all:
                        result = scaler.scale_all(args.action)
                    else:
                        if args.action == "down":
                            result = scaler.scale_down(target_release=args.release)
                        else:
                            result = scaler.scale_up(target_release=args.release)
                    # Accumulate metrics for final notification
                    all_summaries.append(result["summary"])  # keep per-namespace summary for logs
                    total_successes += int(result.get("successes", 0))
                    total_failures += int(result.get("failures", 0))
                    aggregated_failed_releases.update(result.get("failed_releases", set()))
                    namespaces_processed.append(ns)
                except Exception as e:
                    logger.error(f"Namespace '{ns}' scaling operation failed: {e}", exc_info=True)
                    # continue to next namespace
                    continue

        # Send a single summary Slack message across all namespaces
        try:
            if not args.dry_run and all_summaries:
                total_duration = time.time() - start_time
                ns_text = ", ".join([f"'{n}'" for n in namespaces_processed])
                failed_text = (
                    f"Failed releases: {', '.join(sorted(aggregated_failed_releases))}" if aggregated_failed_releases else "Failed releases: none"
                )
                final_summary = (
                    f"Scaler {args.action} completed in {total_duration:.1f}s for all releases in {ns_text}.\n"
                    f"Successes: {total_successes}, Failures: {total_failures}. {failed_text}"
                )
                logger.info(final_summary)
                if slack_url:
                    # Use a temporary scaler to reuse Slack notification helper
                    temp_scaler = OpenShiftScaler(namespace=namespaces_processed[0] if namespaces_processed else "monitoring")
                    temp_scaler._notify_slack(slack_url, final_summary)
        except Exception as e:
            logger.error(f"Failed to send final Slack summary: {e}")

        logger.info(f"=== Completed in {time.time() - start_time:.2f}s ===")
    except Exception as e:
        logger.error(f"Scaling operation failed: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
