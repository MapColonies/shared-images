FROM ghcr.io/nginxinc/nginx-s3-gateway/nginx-oss-s3-gateway:unprivileged-oss-20231025

USER root

# Replace nginx.conf file with our own
COPY nginx.conf.template /etc/nginx
COPY 21-envsubst-on-nginx-conf.sh /docker-entrypoint.d
RUN chmod +x /docker-entrypoint.d/21-envsubst-on-nginx-conf.sh

# Define the version of NGINX OTel module
ARG OPENTELEMETRY_CPP_VERSION=1.0.3

# Define the search path for shared libraries used when compiling and running NGINX
ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/opt/opentelemetry-webserver-sdk/sdk_lib/lib

# 1. Download the latest version of Consul template and the OTel C++ web server module, otel-webserver-module
ADD https://github.com/open-telemetry/opentelemetry-cpp-contrib/releases/download/webserver%2Fv${OPENTELEMETRY_CPP_VERSION}/opentelemetry-webserver-sdk-x64-linux.tgz /tmp

RUN apt-get update \
  && apt-get install -y --no-install-recommends dumb-init unzip \
# 2. Extract the module files
  && tar xvfz /tmp/opentelemetry-webserver-sdk-x64-linux.tgz -C /opt \
  && rm -rf /tmp/opentelemetry-webserver-sdk-x64-linux.tgz \
# 3. Install
  && /opt/opentelemetry-webserver-sdk/install.sh 

# 4. Copy in the configuration file for the NGINX OTel module
COPY opentelemetry_module.conf /etc/nginx/conf.d

USER nginx

EXPOSE 8080
