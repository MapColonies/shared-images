#!/usr/bin/env bash

POSTGRES_CERTIFICATES_PATH=/.postgresql

if [ "$POSTGRES_ENABLE_SSL_AUTH" = "true" ]
then
  cp $POSTGRES_CERTS_MOUNT_PATH/* $POSTGRES_CERTIFICATES_PATH
  chmod 400 $POSTGRES_CERTIFICATES_PATH/*.pk8
fi

if [ "$TELEMETRY_TRACING_ENABLED" = "true" ]
then
  export JAVA_OPTS="${JAVA_OPTS} -javaagent:/otel/opentelemetry-javaagent.jar"
fi

if [ "$TELEMETRY_METRICS_ENABLED" = "true" ]
then
  export JAVA_OPTS="${JAVA_OPTS} -javaagent:/jmx/jmx_prometheus_javaagent.jar=12345:/jmx/config.yaml"

fi

if [ "$ADD_ROOT_CERTS" = "true" ]
then
  FILES="${ROOT_CERTS_PATH}/*"
  for f in $FILES
  do
    keytool -import -noprompt -file $f -keystore mystore -alias $f -storepass changeit
  done

  export JAVA_OPTS="${JAVA_OPTS} -Djavax.net.ssl.trustStore=mystore -Djavax.net.ssl.trustStorePassword=changeit"
fi



/scripts/entrypoint.sh
