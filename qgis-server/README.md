# qgis-server Openshift Compatible Image

Configuring `openquake/qgis-server` image which exposes a QGIS Server on Ubuntu.

## Why?

QGIS Server is an open source web mapping software that allows you to publish QGIS projects as OGC-compliant map services (Open Geospatial Consortium standards).  
It supports open standards such as OGC WMS, WMTS, WFS, WCS and CSW.  
QGIS-Server allows you to customize your map services to suit your specific needs. You can choose which layers to include, set layer styles and labels, and control how the map is displayed.

## Run

```
docker image build -t qgis-server:latest .
```
```
docker container run --rm --name qgis-server \
      --network host \
      -e SKIP_NGINX=0 \
      -e QGIS_SERVER_LOG_FILE=/var/tmp/qgisserver.log \
      -e QGIS_SERVER_LOG_LEVEL=0 \
      -e AWS_ACCESS_KEY_ID=avi \
      -e AWS_SECRET_ACCESS_KEY=aviPassword \
      -e AWS_ENDPOINT_URL=http://localhost:9000 \
      -e AWS_BUCKET_NAME=bucket-name \
      -v /docker/qgis/data:/io/data \
      -v /docker/qgis/fonts:/usr/share/fonts \
      -v /docker/qgis/plugins:/io/plugins \
      qgis-server:latest -d
```

## Installation

See: [qgis-server-helm](https://github.com/MapColonies/qgis-server-helm)