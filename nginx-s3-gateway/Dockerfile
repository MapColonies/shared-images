FROM ghcr.io/nginxinc/nginx-s3-gateway/nginx-oss-s3-gateway:latest-20220413
ENV LISTEN_ON_PORT 8080
COPY default.conf.template /etc/nginx/templates
COPY nginx.conf /etc/nginx/nginx.conf
# RUN sed -i 's/user  nginx;/# user  nginx;/' /etc/nginx/nginx.conf
RUN chmod g+rwx -R /var/cache/nginx /var/run /var/log/nginx 
RUN chgrp -R root /var/cache/nginx /var/log/nginx
RUN chmod -R g=u /etc/nginx/conf.d 

RUN addgroup nginx root
USER nginx