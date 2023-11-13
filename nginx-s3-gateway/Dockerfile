FROM ghcr.io/nginxinc/nginx-s3-gateway/nginx-oss-s3-gateway:latest-20230703

COPY auth.js /etc/nginx/auth.js
COPY 21-envsubst-on-nginx-conf.sh /docker-entrypoint.d
COPY default.conf.template /etc/nginx/templates
COPY nginx.conf.template /etc/nginx/nginx.conf.template

RUN chmod g+rwx -R /var/cache/nginx /var/run /var/log/nginx && \
  chgrp -R root /var/cache/nginx /var/log/nginx && \
  chmod -R g=u /etc/nginx && \
  chmod -R +x /docker-entrypoint.d && \
  addgroup nginx root

EXPOSE 8080

USER nginx
