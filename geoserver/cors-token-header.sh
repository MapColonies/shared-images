#!/usr/bin/env bash

# Add access token header on cors settings
WEB_XML_LOCATION = ${CATALINA_HOME}/conf/web.xml
sed -i 's/X-Requested-With/X-Requested-With,X-Api-Key/' $WEB_XML_LOCATION