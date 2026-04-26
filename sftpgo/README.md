# SFTPGo for OpenShift

This is a customized container image of [SFTPGo](https://sftpgo.com/), tailored specifically to run seamlessly in OpenShift and other strict security environments.

## What this container does

The default SFTPGo image expects certain permissions that are often restricted in OpenShift, which typically runs containers with arbitrary User IDs (UIDs) and blocks them from running as root.

This image extends `drakkan/sftpgo:v2.7.0` and makes the following OpenShift-compatible adjustments:
- Recursively changes ownership of `/etc/sftpgo`, `/var/lib/sftpgo`, and `/srv/sftpgo` to user and group `1001:1001`.
- Grants `777` permissions to `/var/lib/sftpgo` to ensure write capabilities regardless of the random UID assigned by OpenShift.
- Uses a custom `entrypoint.sh` script to handle initialization and runs the container explicitly under user `1001:1001`.

## Base Image
- `drakkan/sftpgo`
