FROM openquake/qgis-server:ltr

# RUN chmod g+rwx -R /var/cache/nginx /var/run /var/log/nginx 
# RUN chgrp -R root /var/cache/nginx /var/log/nginx
# RUN chmod -R g=u /etc/nginx/conf.d 

# RUN addgroup nginx root
# USER nginx

USER root

RUN chgrp -R 0 ${QGIS_PLUGINPATH} ${QGIS_HOME} ${QGIS_FONTS_DIR} ${QGIS_DATA_DIR} /scripts /var/tmp \
    /io/plugins /var/lib/qgis /usr/share/fonts/ /io/data
RUN chmod -R g=u ${QGIS_PLUGINPATH} ${QGIS_HOME} ${QGIS_FONTS_DIR} ${QGIS_DATA_DIR} /scripts /var/tmp \
    /io/plugins /var/lib/qgis /usr/share/fonts/ /io/data

COPY entrypoint.sh /scripts/entrypoint.sh

CMD ["/bin/bash", "/scripts/entrypoint.sh"]