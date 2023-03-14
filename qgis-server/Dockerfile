FROM openquake/qgis-server:3.16.13

RUN sed -i 's/user www-data;/# user www-data;/' /etc/nginx/nginx.conf && \
    sed -i 's/80/8080/g' /etc/nginx/nginx.conf

WORKDIR /scripts

# curl, nodejs (npx) and aws cli
RUN apt-get -y update && apt-get -y install curl && curl -fsSL "https://deb.nodesource.com/setup_19.x" | bash - && apt-get install -y nodejs && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip && ./aws/install && npm install -g npm@9.6.1

COPY ./entrypoint.sh /scripts/entrypoint.sh
COPY ./copy-projects.mjs /scripts/copy-projects.mjs
RUN chmod +x /scripts/entrypoint.sh && chmod +x /scripts/copy-projects.mjs

RUN chgrp -R 0 /tmp /var/cache /var/log/nginx /var/lib/nginx /var/lib/qgis
RUN chmod -R g=u /tmp /var/cache /var/log/nginx /var/lib/nginx /var/lib/qgis

# Uncomment while developing to make sure the docker runs on openshift
# RUN useradd -ms /bin/bash user && usermod -a -G root user
# USER user

ENTRYPOINT /scripts/entrypoint.sh