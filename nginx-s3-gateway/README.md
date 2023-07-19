# nginx-s3-gateway Openshift Compatible Image

Configuring `nginxinc/nginx-s3-gateway` image to act as an authenticating and caching gateway for read-only requests (GET/HEAD) to the S3 API.

## Why?

* Providing an authentication gateway using an alternative authentication system to S3
* Caching frequently accessed S3 objects for lower latency delivery and protection against S3 outages
* For internal/micro services that can't authenticate against the S3 API (e.g. don't have libraries available) the gateway can provide a means to accessing S3 objects without authentication
* Compressing objects (gzip, brotli) from gateway to end user
* Protecting S3 bucket from arbitrary public access and traversal
* Rate limiting S3 objects
* Protecting a S3 bucket with a WAF
* Serving static assets from a S3 bucket alongside a dynamic application endpoints all in a single RESTful directory structure

## Build

```
docker image build -t <prefix>/nginx-s3-gateway:v1.0.0 .
```

```
docker image push <prefix>/nginx-s3-gateway:v1.0.0
```

## Run

```
docker container run --rm --name nginx-s3-gateway \
  --network host \
  -e S3_BUCKET_NAME=<bucket> \
  -e S3_SERVER=10.8.0.9 \
  -e S3_SERVER_PORT=9000 \
  -e S3_SERVER_PROTO=http \
  -e S3_REGION=us-east-1 \
  -e S3_STYLE=path \
  -e ALLOW_DIRECTORY_LIST=true \
  -e AWS_SIGS_VERSION=4 \
  -e AWS_ACCESS_KEY_ID=<user> \
  -e AWS_SECRET_ACCESS_KEY=<password> \
  -e CORS_ENABLED=true \
  -e NGINX_WORKER_PROCESSES=4 \
  -e PROXY_CACHE_MAX_SIZE=10g \
  -e PROXY_CACHE_INACTIVE=60m \
  -e PROXY_CACHE_VALID_OK=1h \
  -e PROXY_CACHE_VALID_NOTFOUND=1m \
  -e PROXY_CACHE_VALID_FORBIDDEN=30s \
  <prefix>/nginx-s3-gateway:v1.0.0 -d
```

```
docker container exec -it nginx-s3-gateway /bin/bash
```

```
docker container stop nginx-s3-gateway
```

## Install

See: [MapColonies/nginx-s3-gateway](https://github.com/MapColonies/nginx-s3-gateway)