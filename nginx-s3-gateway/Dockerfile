FROM ghcr.io/nginxinc/nginx-s3-gateway/nginx-oss-s3-gateway:unprivileged-oss-20231102

USER root

# Replace nginx.conf file with our own
COPY nginx.conf.template /etc/nginx
COPY 21-envsubst-on-nginx-conf.sh /docker-entrypoint.d
RUN chmod +x /docker-entrypoint.d/21-envsubst-on-nginx-conf.sh

ARG OPENTELEMETRY_CPP_VERSION=1.0.4
ADD https://github.com/open-telemetry/opentelemetry-cpp-contrib/releases/download/webserver%2Fv${OPENTELEMETRY_CPP_VERSION}/opentelemetry-webserver-sdk-x64-linux.tgz /tmp

RUN apt-get update \
  && apt-get install -y --no-install-recommends dumb-init tar gzip \
  && mkdir -p /opt/opentelemetry-webserver-sdk \
  && gzip -dc /tmp/opentelemetry-webserver-sdk-x64-linux.tgz | tar -xvzf - -C /opt \
  && rm -rf /tmp/opentelemetry-webserver-sdk-x64-linux.tgz \
  && /opt/opentelemetry-webserver-sdk/install.sh 

ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/opt/opentelemetry-webserver-sdk/sdk_lib/lib
RUN echo "load_module /opt/opentelemetry-webserver-sdk/WebServerModule/Nginx/1.25.3/ngx_http_opentelemetry_module.so;\n$(cat /etc/nginx/nginx.conf)" > /etc/nginx/nginx.conf
COPY opentelemetry_module.conf /etc/nginx/conf.d

USER nginx

EXPOSE 8080
