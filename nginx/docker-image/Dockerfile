FROM nginxinc/nginx-unprivileged:1.21.4
USER root

ENV OTEL_SERVICE_NAME=nginx-proxy
ENV OTEL_EXPORTER_OTLP_ENDPOINT=localhost:4317
ENV OTEL_TRACES_SAMPELR=AlwaysOff
ENV OTEL_TRACES_SAMPLER_RATIO=0.1
ENV OTEL_TRACES_SAMPLER_PARENT_BASED=false

RUN mkdir /otel
COPY subset.sh /docker-entrypoint.d/
COPY nginx-config/nginx.conf /etc/nginx/
COPY nginx-config/log_format.conf /etc/nginx/
COPY nginx-config/auth.js /etc/nginx/
COPY nginx-config/default.conf /etc/nginx/conf.d/ 
COPY nginx-config/status_site.conf /etc/nginx/conf.d/ 
COPY otel-assets/* /otel/

RUN chmod 777 /otel && \
    chmod +x /docker-entrypoint.d/subset.sh

USER nginx
