# qgis-server Openshift Compatible Image

Configuring `openquake/qgis-server` image which exposes a QGIS Server on Ubuntu.

## Why?

QGIS Server is an open source web mapping software that allows you to publish QGIS projects as OGC-compliant map services (Open Geospatial Consortium standards).  
It supports open standards such as OGC WMS, WMTS, WFS, WCS and CSW.  
QGIS-Server allows you to customize your map services to suit your specific needs. You can choose which layers to include, set layer styles and labels, and control how the map is displayed.

## Run

```
docker build \
      --build-arg aws_access_key_id=raster \
      --build-arg aws_secret_access_key=rasterPassword \
      --build-arg aws_endpoint_url=http://10.8.0.9:9000 \
      --build-arg aws_bucket_name=dem-int \
      -t qgis-server:v1.0.0 .
```
```
docker container run -d --rm --name qgis-server \
      --network host \
      -e SKIP_NGINX=0 \
      -e QGIS_SERVER_LOG_FILE=/var/tmp/qgisserver.log \
      -e QGIS_SERVER_LOG_LEVEL=0 \
      -v /docker/qgis/data:/io/data \
      -v /docker/qgis/fonts:/usr/share/fonts \
      -v /docker/qgis/plugins:/io/plugins \
      qgis-server:v1.0.0
```

## Installation

See: [qgis-server-helm](https://github.com/MapColonies/qgis-server-helm)