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
      -e SKIP_NGINX=0 \
      -e QGIS_SERVER_LOG_FILE=/var/tmp/qgisserver.log \
      -e QGIS_SERVER_LOG_LEVEL=0 \
      -e AWS_ACCESS_KEY_ID=raster \
      -e AWS_SECRET_ACCESS_KEY=rasterPassword \
      -e AWS_ENDPOINT_URL=http://10.8.0.9:9000 \
      -e AWS_BUCKET_NAME=dem-int \
      -v /docker/qgis/data:/io/data \
      -v /docker/qgis/fonts:/usr/share/fonts \
      -v /docker/qgis/plugins:/io/plugins \
      qgis-server:v1.0.0 -d
```

The following variables can be customized during container deployment:

- `SKIP_NGINX`: default is _unset_ (do not skip Nginx startup)*
- `QGIS_SERVER_LOG_FILE`: default is `/var/tmp/qgisserver.log`
- `QGIS_SERVER_LOG_LEVEL`: default is `1`
- `QGIS_SERVER_MAX_THREADS`: default is `2`

*When `SKIP_NGINX` is set to a different value than `0` or `false` the embedded copy of Nginx will not be started and an external reverse proxy is then required to access the FastCGI QGIS backend.
  
## Installation

See: [qgis-server-helm](https://github.com/MapColonies/qgis-server-helm)