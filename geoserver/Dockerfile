ARG GEOSERVER_BASE_IMAGE

FROM ${GEOSERVER_BASE_IMAGE}

ARG OTEL_VERSION
ARG LOG4J_VERSION
ARG JMX_PROMETHEUS_VERSION

ENV OTEL_SERVICE_NAME=geoserver

USER root

RUN wget --directory-prefix=/otel https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/${OTEL_VERSION}/opentelemetry-javaagent.jar \
    && wget --directory-prefix=${CATALINA_HOME}/webapps/geoserver/WEB-INF/lib https://search.maven.org/remotecontent?filepath=org/apache/logging/log4j/log4j-layout-template-json/${LOG4J_VERSION}/log4j-layout-template-json-${LOG4J_VERSION}.jar \
    && wget --directory-prefix=/jmx https://repo1.maven.org/maven2/io/prometheus/jmx/jmx_prometheus_javaagent/${JMX_PROMETHEUS_VERSION}/jmx_prometheus_javaagent-${JMX_PROMETHEUS_VERSION}.jar \
    && mv /jmx/jmx_prometheus_javaagent-${JMX_PROMETHEUS_VERSION}.jar /jmx/jmx_prometheus_javaagent.jar

RUN chgrp -R 0 ${CATALINA_HOME} ${FOOTPRINTS_DATA_DIR} \
    ${GEOSERVER_DATA_DIR} /scripts ${CERT_DIR} ${FONTS_DIR} /tmp/ /home/geoserveruser/ /community_plugins/ \
    /plugins ${GEOSERVER_HOME} ${EXTRA_CONFIG_DIR} /usr/share/fonts/ /opt/geoserver/data_dir
RUN chmod -R g=u ${CATALINA_HOME} ${FOOTPRINTS_DATA_DIR} \
    ${GEOSERVER_DATA_DIR} /scripts ${CERT_DIR} ${FONTS_DIR} /tmp/ /home/geoserveruser/ /community_plugins/ \
    /plugins ${GEOSERVER_HOME} ${EXTRA_CONFIG_DIR} /usr/share/fonts/ /opt/geoserver/data_dir

RUN mkdir /.postgresql && chmod g+w /.postgresql

COPY jmx_config.yaml /jmx/config.yaml
COPY cert-start.sh /scripts/cert-start.sh

CMD ["/bin/bash", "/scripts/cert-start.sh"]
