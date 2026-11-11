# Grafana with Pre-installed Plugins

This is a customized container image of [Grafana](https://grafana.com/), extending the official image to include pre-installed plugins.

## What this container does

The default Grafana image allows installing plugins at runtime via environment variables (e.g., `GF_INSTALL_PLUGINS`). However, downloading plugins at runtime can increase startup time, introduce dependencies on external network availability, and fail in air-gapped environments.

This image extends `grafana/grafana` with the following adjustments:

- Installs plugins during the build process using the `grafana cli`.
- Pre-installs plugins defined in `plugins.txt`.
- Bakes the plugins into the `/var/lib/grafana-plugins` directory.
- Configures `GF_PATHS_PLUGINS` to point to the pre-installed plugins directory.
- Disables Grafana's background plugin preinstallation and auto-updates with `GF_PLUGINS_PREINSTALL_DISABLED=true`.

## Configuration

### Plugins List (`plugins.txt`)

To update or add new plugins, modify the `plugins.txt` file and rebuild the image. The file supports two formats:

1. **Standard Plugins:** One plugin name per line (optionally followed by a version).
   ```text
   redis-datasource 2.2.0
   redis-app 2.3.2
   ```
2. **Custom URL Plugins:** Use the format `url;folder[;sha256]`. When a SHA-256 is given, the build verifies the downloaded ZIP before extracting it and fails if the checksum does not match. The ZIP must contain a top-level `folder/plugin.json`.
   ```text
   https://github.com/example/plugin/releases/download/v1.0.0/plugin.zip;plugin-folder-name;<sha256>
   ```

Pin every catalog plugin version and include a checksum for custom URLs so rebuilds use the verified plugin releases. Plugins are installed at build time; Grafana's background installer does not download or auto-update them at runtime.

Grafana's update checks are separate from plugin installation. Air-gapped deployments can also set `analytics.check_for_updates=false` and `analytics.check_for_plugin_updates=false` in `grafana.ini` to disable those checks.

### Pre-installed Plugins

Currently, this image includes:

- **Data Sources:** `redis-datasource`, `redis-app`
- **Panels:** `magnesium-wordcloud-panel`, `mapcolonies-maplibre-panel` (unsigned, from [MapColonies/maplibre-panel](https://github.com/MapColonies/maplibre-panel); Grafana must allow it via `allow_loading_unsigned_plugins`)
- **Core / App Plugins:** `grafana-pyroscope-app`, `grafana-exploretraces-app`, `grafana-metricsdrilldown-app`, `grafana-lokiexplore-app`

## Base Image

- `grafana/grafana`

### Grafana 13 upgrade

The Grafana 12.3.1 to 13.2.5 upgrade also updates these bundled app plugins. The versions in `plugins.txt` are pinned to those verified for this upgrade:

| Plugin                       | Grafana 12.3.1 image | Grafana 13.2.5 image |
| ---------------------------- | -------------------- | -------------------- |
| grafana-exploretraces-app    | 2.2.1                | 3.2.0                |
| grafana-lokiexplore-app      | 2.6.0                | 3.1.0                |
| grafana-metricsdrilldown-app | 2.5.1                | 3.0.0                |
| grafana-pyroscope-app        | 2.3.1                | 3.1.0                |
