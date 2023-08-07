FROM nginxinc/nginx-unprivileged:1.24.0
USER root

ENV OTEL_SERVICE_NAME=nginx-proxy
ENV OTEL_EXPORTER_OTLP_ENDPOINT=localhost:4317
ENV OTEL_TRACES_AS_ERROR=OFF

RUN apt-get update && apt-get install unzip

RUN mkdir /otel
COPY otel-assets/opentelemetry-webserver-sdk.zip /otel

RUN cd /otel && \
    unzip opentelemetry-webserver-sdk.zip && \
    cd opentelemetry-webserver-sdk && \
    ./install.sh

ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/otel/opentelemetry-webserver-sdk/sdk_lib/lib

COPY config/auth.js /etc/nginx
COPY config/nginx.conf /etc/nginx
COPY config/log_format.conf /etc/nginx
COPY config/default.conf /etc/nginx/conf.d
COPY config/status_site.conf /etc/nginx/conf.d
COPY otel-assets/opentelemetry_module.conf.template /etc/nginx/templates/

USER nginx
