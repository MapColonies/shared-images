# We use an ARG to dynamically set the base version from CI
ARG GRAFANA_VERSION=12.3.1

# --- Stage 1: Downloader ---
FROM alpine:3.19 AS downloader

# Install tools needed to parse YAML and extract zips
RUN apk add --no-cache curl yq unzip

WORKDIR /downloads
COPY plugins.yaml .

# Parse the YAML file and download/extract each plugin
RUN mkdir -p /plugins && \
    yq e '.plugins[] | .name + " " + .version' plugins.yaml | while read plugin version; do \
      echo "Downloading $plugin version $version..."; \
      curl -L -o "/tmp/${plugin}.zip" "https://grafana.com/api/plugins/${plugin}/versions/${version}/download"; \
      unzip -q "/tmp/${plugin}.zip" -d "/plugins/${plugin}"; \
      rm "/tmp/${plugin}.zip"; \
    done

# --- Stage 2: Final Image ---
FROM grafana/grafana:${GRAFANA_VERSION}

USER root

# Copy only the extracted plugins from the downloader stage
COPY --from=downloader /plugins /opt/grafana/plugins

# Ensure Grafana owns the plugins directory
RUN chown -R 472:0 /opt/grafana/plugins

USER grafana
