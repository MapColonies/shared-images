ARG GEOSERVER_BASE_IMAGE

FROM ${GEOSERVER_BASE_IMAGE}

USER root

RUN chgrp -R 0 ${CATALINA_HOME} ${FOOTPRINTS_DATA_DIR} \
    ${GEOSERVER_DATA_DIR} /scripts ${CERT_DIR} ${FONTS_DIR} /tmp/ /home/geoserveruser/ /community_plugins/ \
    /plugins ${GEOSERVER_HOME} ${EXTRA_CONFIG_DIR} /usr/share/fonts/ /opt/geoserver/data_dir
RUN chmod -R g=u ${CATALINA_HOME} ${FOOTPRINTS_DATA_DIR} \
    ${GEOSERVER_DATA_DIR} /scripts ${CERT_DIR} ${FONTS_DIR} /tmp/ /home/geoserveruser/ /community_plugins/ \
    /plugins ${GEOSERVER_HOME} ${EXTRA_CONFIG_DIR} /usr/share/fonts/ /opt/geoserver/data_dir

RUN mkdir /.postgresql && chmod g+w /.postgresql

COPY cert-start.sh /scripts/cert-start.sh

CMD ["/bin/bash", "/scripts/cert-start.sh"]
