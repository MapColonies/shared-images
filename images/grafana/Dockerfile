# https://grafana.com/docs/grafana/latest/setup-grafana/configure-docker/#build-a-grafana-docker-image-with-pre-installed-plugins
# https://github.com/grafana/grafana/blob/main/packaging/docker/custom/Dockerfile

ARG GRAFANA_VERSION=13.2.5

FROM grafana/grafana:${GRAFANA_VERSION}

ARG GF_GID="0"

# Plugins are baked into the image; disable runtime preinstallation and updates.
ENV GF_PATHS_PLUGINS="/var/lib/grafana-plugins" \
    GF_PLUGINS_PREINSTALL_DISABLED="true"

USER root

# Create the plugins directory with all permissions since Grafana will need to write to it when installing plugins, and we want to avoid permission issues
RUN mkdir -p "$GF_PATHS_PLUGINS" && \
    chown -R grafana:${GF_GID} "$GF_PATHS_PLUGINS" && \
    chmod -R 777 "$GF_PATHS_PLUGINS"

USER grafana

# Copy the plugins list into a temporary location in the container
COPY plugins.txt /tmp/plugins.txt

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Loop through the file and install each plugin
RUN set -e; \
    while IFS= read -r line || [ -n "$line" ]; do \
      # Strip leading/trailing whitespace
      plugin=$(echo "$line" | xargs); \
      # Skip empty lines or comments
      case "$plugin" in \
        ""|\#*) continue ;; \
      esac; \
      \
      if echo "$plugin" | grep -q ';'; then \
        # Handle custom plugin URLs (url;folder[;sha256])
        pluginUrl=$(echo "$plugin" | cut -d';' -f 1); \
        pluginInstallFolder=$(echo "$plugin" | cut -d';' -f 2); \
        pluginSha256=$(echo "$plugin" | cut -d';' -f 3); \
        if [ -n "$pluginSha256" ]; then \
          pluginZip=$(mktemp /tmp/grafana-plugin.XXXXXX); \
          curl --fail --location --silent --show-error "$pluginUrl" --output "$pluginZip"; \
          echo "$pluginSha256  $pluginZip" | sha256sum -c -; \
          unzip -q "$pluginZip" -d "$GF_PATHS_PLUGINS"; \
          rm "$pluginZip"; \
          test -f "$GF_PATHS_PLUGINS/$pluginInstallFolder/plugin.json"; \
        else \
          grafana cli --pluginUrl "${pluginUrl}" --pluginsDir "${GF_PATHS_PLUGINS}" plugins install "${pluginInstallFolder}"; \
        fi; \
      else \
        # The CLI expects the plugin ID and optional version as separate arguments.
        read -r pluginId pluginVersion <<< "$plugin"; \
        if [ -n "$pluginVersion" ]; then \
          grafana cli --pluginsDir "$GF_PATHS_PLUGINS" plugins install "$pluginId" "$pluginVersion"; \
        else \
          grafana cli --pluginsDir "$GF_PATHS_PLUGINS" plugins install "$pluginId"; \
        fi; \
      fi; \
    done < /tmp/plugins.txt
