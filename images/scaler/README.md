# Scaler (Container Image)

Containerized scaler that sets Deployments/StatefulSets to 0 on “down” and restores on “up”.
It records/restores replicas via the `previous-size` annotation and skips resources with `scaling.skip: "true"`.
Uses the Kubernetes Python client in-cluster or with your local kubeconfig.

## Contents

- Dockerfile (builds an image that runs `/app/scaler.py` as the entrypoint)

## Build and push

```bash
# From the scale-cronJobs directory
docker build -t <REGISTRY>/<PROJECT>/scaler:<TAG> .
docker push <REGISTRY>/<PROJECT>/scaler:<TAG>
```

## Run locally (Docker)

```bash
# Use your local kubeconfig inside the container
docker run --rm \
  -v "$HOME/.kube:/root/.kube:ro" \
  -e KUBECONFIG=/root/.kube/config \
  -e SLACK_WEBHOOK_URL='https://hooks.slack.com/services/XXX/YYY/ZZZ' \
  <REGISTRY>/<PROJECT>/scaler:<TAG> down \
  --namespace projectName --namespace otherProject --dry-run
```

## Run in Kubernetes

Minimal CronJob example:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: scaler-down
  namespace: projectName
spec:
  schedule: '30 19 * * 4' # Thu 19:30
  jobTemplate:
    spec:
      template:
        spec:
          serviceAccountName: scaling-sa
          restartPolicy: OnFailure
          containers:
            - name: scaler
              image: <REGISTRY>/<PROJECT>/scaler:<TAG>
              args:
                - down
                - --namespace
                - projectName
                - --namespace
                - otherProject
              env:
                - name: SLACK_WEBHOOK_URL
                  valueFrom:
                    secretKeyRef:
                      name: slack-webhook
                      key: webhook-url
```

RBAC note: the service account must be able to get/list/patch Deployments/StatefulSets and their `/scale` subresources in each target namespace.

## CLI reference

Entry: `python3 /app/scaler.py`

```
python3 scaler.py {up,down} \
  --namespace <ns> [--namespace <ns> ...] \
  [--release <name>] [--all] [--dry-run] [--debug] \
  [--slack-webhook <url>]
```

- `--namespace`: repeat for multiple, or pass comma-separated list.
- `--release`: operate on a specific Helm release label (`app.kubernetes.io/instance`).
- `--all`: process every Deployment/StatefulSet in the namespace (ignore labels).
- `--dry-run`: discovery only; no changes applied.
- `--slack-webhook` or `SLACK_WEBHOOK_URL` env for notifications.

## Behavior

- On down: stores current replicas in `previous-size`, then scales to 0.
- On up: restores replicas from `previous-size` and removes the annotation.
- Skips if `scaling.skip: "true"` is set or replicas already 0 (for down).
