# qgis-server Openshift Compatible Image

Configuring `openquake/qgis-server` image which exposes a QGIS Server on Ubuntu.

## Why?

QGIS Server is an open source web mapping software that allows you to publish QGIS projects as OGC-compliant map services (Open Geospatial Consortium standards).  
It supports open standards such as OGC WMS, WMTS, WFS, WCS and CSW.  
QGIS-Server allows you to customize your map services to suit your specific needs. You can choose which layers to include, set layer styles and labels, and control how the map is displayed.

## Run

```
docker build \
      --build-arg aws_access_key_id=avi \
      --build-arg aws_secret_access_key=aviPassword \
      --build-arg aws_endpoint_url=http://localhost:9000 \
      --build-arg aws_bucket_name=bucket-name \
      -t qgis-server:latest .
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
      qgis-server:latest
```

## Installation

See: [qgis-server-helm](https://github.com/MapColonies/qgis-server-helm)