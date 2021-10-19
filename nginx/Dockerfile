#FROM nginx:1.19.7-alpine
FROM ubuntu/nginx:1.18-20.04_beta
ENV OTEL_SERVICE_NAME=nginx-proxy
ENV OTEL_EXPORTER_OTLP_ENDPOINT=localhost:4317
# support running as arbitrary user which belogs to the root group
#RUN chmod g+rwx /var/cache/nginx /var/run /var/log/nginx
RUN mkdir /otel
RUN chmod g+rwx -R /var/lib/nginx /var/run /var/log/nginx /otel
#RUN chgrp -R root /var/cache/nginx
RUN chgrp -R root /var/lib/nginx /var/log/nginx
#RUN apk update & apk add libc6-compat libstdc++ gcompat 
COPY subset.sh /docker-entrypoint.d/
COPY nginx.conf /etc/nginx/
COPY *_site.conf /etc/nginx/conf.d/ 
COPY otel* /otel/
RUN chmod +x docker-entrypoint.d/subset.sh
# users are not allowed to listen on priviliged ports
#RUN sed -i.bak 's/listen\(.*\)80;/listen 8080;/' /etc/nginx/conf.d/default.conf
EXPOSE 8080

# comment user directive as master process is run as user in OpenShift anyhow
#RUN sed -i.bak 's/^user/#user/' /etc/nginx/nginx.conf

RUN chmod -R g=u /etc/nginx/conf.d 

RUN addgroup nginx root
USER nginx
