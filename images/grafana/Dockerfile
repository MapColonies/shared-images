# https://grafana.com/docs/grafana/latest/setup-grafana/configure-docker/#build-a-grafana-docker-image-with-pre-installed-plugins
# https://github.com/grafana/grafana/blob/main/packaging/docker/custom/Dockerfile

ARG GRAFANA_VERSION=12.3.1

FROM grafana/grafana:${GRAFANA_VERSION}

ARG GF_GID="0"

ENV GF_PATHS_PLUGINS="/var/lib/grafana-plugins"

USER root

# Create the plugins directory with all permissions since Grafana will need to write to it when installing plugins, and we want to avoid permission issues
RUN mkdir -p "$GF_PATHS_PLUGINS" && \
    chown -R grafana:${GF_GID} "$GF_PATHS_PLUGINS" && \
    chmod -R 777 "$GF_PATHS_PLUGINS"

USER grafana

# Copy the plugins list into a temporary location in the container
COPY plugins.txt /tmp/plugins.txt

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
        # Handle custom plugin URLs (url;folder)
        pluginUrl=$(echo "$plugin" | cut -d';' -f 1); \
        pluginInstallFolder=$(echo "$plugin" | cut -d';' -f 2); \
        grafana cli --pluginUrl "${pluginUrl}" --pluginsDir "${GF_PATHS_PLUGINS}" plugins install "${pluginInstallFolder}"; \
      else \
        # If the file contains "plugin version" (space separated), map it to "plugin@version"
        formattedPlugin=$(echo "$plugin" | awk '{if ($2) print $1"@"$2; else print $1}'); \
        grafana cli --pluginsDir "${GF_PATHS_PLUGINS}" plugins install "${formattedPlugin}"; \
      fi; \
    done < /tmp/plugins.txt
