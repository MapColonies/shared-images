FROM ghcr.io/nginxinc/nginx-s3-gateway/nginx-oss-s3-gateway:latest-20220413

ENV LISTEN_ON_PORT 8080

COPY jwt.js /etc/nginx/jwt.js
COPY header /etc/nginx/conf.d/header
COPY default.conf.template /etc/nginx/templates
COPY nginx.conf /etc/nginx/nginx.conf

# RUN sed -i 's/user  nginx;/# user  nginx;/' /etc/nginx/nginx.conf

RUN chmod g+rwx -R /var/cache/nginx /var/run /var/log/nginx && \
  chgrp -R root /var/cache/nginx /var/log/nginx && \
  chmod -R g=u /etc/nginx/conf.d 

RUN addgroup nginx root
USER nginx