FROM ghcr.io/nginxinc/nginx-s3-gateway/nginx-oss-s3-gateway:latest-20220413

# users are not allowed to listen on priviliged ports
RUN sed -i.bak 's/listen\(.*\)80;/listen 8080;/' /etc/nginx/conf.d/default.conf
EXPOSE 8080

RUN chmod g+rwx -R /var/cache/nginx /var/run /var/log/nginx && \
  chgrp -R root /var/cache/nginx /var/log/nginx && \
  chmod -R g=u /etc/nginx/conf.d && \
  addgroup nginx root

USER nginx