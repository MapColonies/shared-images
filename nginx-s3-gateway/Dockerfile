FROM ghcr.io/nginxinc/nginx-s3-gateway/nginx-oss-s3-gateway:latest-20220413

COPY jwt.js /etc/nginx/jwt.js
COPY 15-envsubst-on-nginx-conf.sh /docker-entrypoint.d
COPY default.conf.template /etc/nginx/templates
COPY nginx.conf.template /etc/nginx/nginx.conf.template

EXPOSE 8080

RUN chmod g+rwx -R /var/cache/nginx /var/run /var/log/nginx && \
  chgrp -R root /var/cache/nginx /var/log/nginx && \
  chmod -R g=u /etc/nginx && \
  chmod -R +x /docker-entrypoint.d && \
  addgroup nginx root

USER nginx
