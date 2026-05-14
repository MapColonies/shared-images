# Grafana with Pre-installed Plugins

This is a customized container image of [Grafana](https://grafana.com/), extending the official image to include pre-installed plugins.

## What this container does

The default Grafana image allows installing plugins at runtime via environment variables (e.g., `GF_INSTALL_PLUGINS`). However, downloading plugins at runtime can increase startup time, introduce dependencies on external network availability, and fail in air-gapped environments.

This image extends `grafana/grafana` with the following adjustments:

- Uses a multi-stage build to download and extract plugins defined in `plugins.yaml`.
- Bakes the extracted plugins directly into the `/var/lib/grafana/plugins` directory of the final image.
- Ensures the correct permissions (`472:0`) are applied so Grafana can read the plugins seamlessly.

To update or add new plugins, modify the `plugins.yaml` file and rebuild the image.

## Base Image

- `grafana/grafana`
