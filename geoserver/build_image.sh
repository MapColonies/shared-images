!#/bin/sh

GEOSERVER_VERSION=2.19.1

git clone git://github.com/kartoza/docker-geoserver ./geoserver-base

docker build --build-arg GS_VERSION=2.19.1 -f ./geoserver-base/Dockerfile -t geoserver-base:2.19.1 ./geoserver-base
docker build --build-arg GEOSERVER_BASE_IMAGE=geoserver-base:2.19.1 -f Dockerfile  -t geoserver-os:2.19.1 .
