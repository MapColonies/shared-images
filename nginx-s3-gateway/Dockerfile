FROM ghcr.io/nginxinc/nginx-s3-gateway/nginx-oss-s3-gateway:unprivileged-oss-20231102

USER root

COPY 21-envsubst-on-nginx-conf.sh /docker-entrypoint.d
COPY nginx.conf.template /etc/nginx

RUN chmod +x /docker-entrypoint.d/21-envsubst-on-nginx-conf.sh

EXPOSE 8080

USER nginx
