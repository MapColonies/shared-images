# Use Ubuntu as the base image
FROM --platform=linux/amd64 ubuntu:22.04

# Set environment variables
ENV NODE_EXPORTER_VERSION=1.8.2
ENV NODE_EXPORTER_ROOT="/var/lib/node_exporter"
ENV TEXT_FILES_ROOT="${NODE_EXPORTER_ROOT}/textfile_collector"
ENV TEXT_FILES_SCRIPTS_ROOT="${NODE_EXPORTER_ROOT}/script"

# Install necessary packages
RUN apt update && apt install cron curl -y && \
    # Download Node Exporter
    curl -LO https://github.com/prometheus/node_exporter/releases/download/v${NODE_EXPORTER_VERSION}/node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz && \
    # Extract and move the binary
    tar xzf node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz && \
    mv node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64/node_exporter /usr/local/bin/ && \
    # Clean up
    rm -rf node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64*

RUN mkdir -p ${TEXT_FILES_ROOT} && \
    mkdir -p ${TEXT_FILES_SCRIPTS_ROOT} && \
    chmod -R 777 ${TEXT_FILES_ROOT}

COPY ./subdir_sizes.sh ${TEXT_FILES_SCRIPTS_ROOT}/subdir_sizes.sh

RUN chmod 755 ${TEXT_FILES_SCRIPTS_ROOT}/subdir_sizes.sh

COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh

# Expose the default port for Node Exporter
EXPOSE 9100
ENTRYPOINT [ "/usr/local/bin/entrypoint.sh" ]
