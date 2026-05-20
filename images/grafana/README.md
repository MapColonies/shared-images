# Grafana with Pre-installed Plugins

This is a customized container image of [Grafana](https://grafana.com/), extending the official image to include pre-installed plugins.

## What this container does

The default Grafana image allows installing plugins at runtime via environment variables (e.g., `GF_INSTALL_PLUGINS`). However, downloading plugins at runtime can increase startup time, introduce dependencies on external network availability, and fail in air-gapped environments.

This image extends `grafana/grafana` with the following adjustments:

- Installs plugins during the build process using the `grafana cli`.
- Pre-installs plugins defined in `plugins.txt`.
- Bakes the plugins into the `/var/lib/grafana-plugins` directory.
- Configures `GF_PATHS_PLUGINS` to point to the pre-installed plugins directory.

## Configuration

### Plugins List (`plugins.txt`)

To update or add new plugins, modify the `plugins.txt` file and rebuild the image. The file supports two formats:

1.  **Standard Plugins:** One plugin name per line (optionally followed by a version).
    ```text
    redis-datasource
    redis-app 2.1.0
    ```
2.  **Custom URL Plugins:** Use the format `url;folder`.
    ```text
    https://github.com/example/plugin/releases/download/v1.0.0/plugin.zip;plugin-folder-name
    ```

### Pre-installed Plugins

Currently, this image includes:

- **Data Sources:** `redis-datasource`, `redis-app`
- **Panels:** `magnesium-wordcloud-panel`
- **Core / App Plugins:** `grafana-pyroscope-app`, `grafana-exploretraces-app`, `grafana-metricsdrilldown-app`, `grafana-lokiexplore-app`

## Base Image

- `grafana/grafana`
