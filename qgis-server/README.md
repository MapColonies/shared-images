# qgis-server Openshift Compatible Image

Configuring `openquake/qgis-server` image which exposes a QGIS Server on Ubuntu.
  
## Why?

QGIS Server is an open source web mapping software that allows you to publish QGIS projects as OGC-compliant map services (Open Geospatial Consortium standards).  
It supports open standards such as OGC WMS, WMTS, WFS, WCS and CSW.  
QGIS-Server allows you to customize your map services to suit your specific needs. You can choose which layers to include, set layer styles and labels, and control how the map is displayed.
  
## Run

```
docker image build -t qgis-server:v1.0.0 .
```
```
docker container run --rm --name qgis-server \
      --network host \
      -e QGIS_SERVER_LOG_FILE=/var/tmp/qgisserver.log \
      -e QGIS_SERVER_LOG_LEVEL=0 \
      -e AWS_ACCESS_KEY_ID=raster \
      -e AWS_SECRET_ACCESS_KEY=rasterPassword \
      -e AWS_ENDPOINT_URL=http://10.8.0.9:9000 \
      -e AWS_BUCKET_NAME=dem-int \
      -e RAW_DATA_PROXY_URL=https://client-int-qgis-integration-nginx-s3-gateway-route-integration.apps.j1lk3njp.eastus.aroapp.io \
      -v /docker/qgis/data:/io/data \
      -v /docker/qgis/fonts:/usr/share/fonts \
      -v /docker/qgis/plugins:/io/plugins \
      qgis-server:v1.0.0 -d
```
  
The following variables can be customized during container deployment:

- `QGIS_SERVER_LOG_FILE`: default is `/var/tmp/qgisserver.log`
- `QGIS_SERVER_LOG_LEVEL`: default is `0`
- `RAW_DATA_PROXY_URL`: default is http://client-int-dem-integration-nginx-s3-gateway:8080
  
## Installation

See: [qgis-server-helm](https://github.com/MapColonies/qgis-server-helm)