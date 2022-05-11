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

## Run

```
docker build -t nginx-s3-gateway:v1.0.0 .
docker tag nginx-s3-gateway:v1.0.0 <prefix>/nginx-s3-gateway:v1.0.0
```

## Installation

See: [nginx-s3-gateway-helm](https://github.com/MapColonies/nginx-s3-gateway-helm)