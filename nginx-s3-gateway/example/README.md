# Example Deployment with Docker Compose**

In the `example` folder, you'll find a Docker Compose file (`docker-compose.yml`) along with NGINX configuration files (`nginx.conf` and `default.conf`) and redis configuration files (key handling files). This example demonstrates a simplified deployment of NGINX-S3-Gateway with Redis integration.

### Prerequisites

Make sure you have Docker and Docker Compose installed on your system.


### Deployment Steps

Just navigate to the `example` folder and run:
```bash
docker-compose up -d
```

The docker-compose file contains 4 containers:
1. nginx-s3-gateway - with all the required env for redis and S3.
2. redis - for cache
3. minio
4. createBucketAndObjectsOnS3 - for creating bucket and objects in S3 (Optional).

Make sure that every change are set in all containers (.e.g username for S3) and you got yourself nginx-redis3 to play with ;)
