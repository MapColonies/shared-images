FROM openquake/qgis-server:ltr

RUN apt-get update
RUN apt-get -y install \
    curl \
    nodejs \
    npm

RUN npm install -g n
RUN n latest
RUN npm install -g npm

RUN npm i -g zx@1.2.2

# aws cli
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip
RUN ./aws/install && aws --version

ARG aws_access_key_id
ENV AWS_ACCESS_KEY_ID=${aws_access_key_id}
ARG aws_secret_access_key
ENV AWS_SECRET_ACCESS_KEY=${aws_secret_access_key}

USER root

# RUN chgrp -R 0 ${QGIS_PLUGINPATH} ${QGIS_HOME} ${QGIS_FONTS_DIR} ${QGIS_DATA_DIR} /scripts /var/tmp \
#     /io/plugins /var/lib/qgis /usr/share/fonts/ /io/data
# RUN chmod -R g=u ${QGIS_PLUGINPATH} ${QGIS_HOME} ${QGIS_FONTS_DIR} ${QGIS_DATA_DIR} /scripts /var/tmp \
#     /io/plugins /var/lib/qgis /usr/share/fonts/ /io/data

WORKDIR /scripts

COPY entrypoint.sh /scripts/entrypoint.sh
RUN chmod +x /scripts/entrypoint.sh
COPY copy-projects.mjs /scripts/copy-projects.mjs
RUN chmod +x /scripts/copy-projects.mjs

ENTRYPOINT [ "/scripts/entrypoint.sh" ]