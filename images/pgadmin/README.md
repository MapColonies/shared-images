# pgAdmin 4 for OpenShift

This is a customized container image of [pgAdmin 4](https://www.pgadmin.org/), specifically modified to run in OpenShift environments.

## What this container does

OpenShift restricts containers from running as root and assigns random user IDs (UIDs) to them. The default pgAdmin 4 container expects certain permissions and attempts to run background services that aren't OpenShift-compatible out-of-the-box.

This image extends `dpage/pgadmin4` with the following adjustments:

- Recursively grants `777` permissions to `/venv`, `/pgadmin4`, and `/var/lib/pgadmin` so the application can run properly regardless of the assigned UID.
- Ensures the Python runtime is accessible by the root group (`chown 0:0 /usr/local/bin/python3.14`).
- Sets `PGADMIN_DISABLE_POSTFIX=1` to disable the Postfix mail server, avoiding unnecessary privilege escalation and background process failures.

## Base Image

- `dpage/pgadmin4`
