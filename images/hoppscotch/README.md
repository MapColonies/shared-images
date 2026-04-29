# Hoppscotch for OpenShift

This is a customized container image of [Hoppscotch](https://hoppscotch.io/), tailored specifically to run seamlessly in OpenShift environments.

## What this container does

OpenShift runs containers using randomly assigned user IDs (UIDs) for security reasons. However, the default Hoppscotch image expects to be run with specific privileges or as root.

This image extends `hoppscotch/hoppscotch` and modifies the directory permissions to be OpenShift-compatible:

- Recursively changes the group ownership of `/site` and `/dist/backend` to `0` (root group).
- Grants read, write, and execute permissions to the root group for these directories.

This ensures that the container can read and write to its necessary directories regardless of the random UID assigned by OpenShift.

## Base Image

- `hoppscotch/hoppscotch`
