# NGINX-S3-Gateway with Redis Feature

This Dockerfile enhances the NGINX-S3-Gateway image by adding Redis support using OpenResty. The resulting image provides a powerful and extensible NGINX setup for S3 gateway functionality with the added benefits of Lua scripting and Redis integration.

## Build Process Overview

1. **Base Image Setup:**
   - The Dockerfile starts from the Debian base image, which is the foundation for the NGINX-S3-Gateway.

2. **Installation of Build Dependencies:**
   - Essential packages, including `wget`, `build-essential`, and required libraries, are installed to facilitate the subsequent build process.

3. **Workspace Configuration:**
   - A working directory named "work" is created to organize and execute the build process.

4. **NGINX Compilation with OpenResty Modules:**
   - The OpenResty NGINX modules (e.g., lua-nginx-module and srcache-nginx-module) are cloned into the workspace.
   - LuaJIT is cloned and installed, and environment variables (`LUAJIT_LIB` and `LUAJIT_INC`) are set to ensure correct library paths.
   - NGINX is configured using the `./configure` script with various modules and options, including dynamic modules for OpenResty.
   - NGINX is then compiled (`make`) and installed (`make install`).

5. **Add-ons Installation:**
   - Additional Lua modules that do not require compilation (e.g., lua-resty-redis) are cloned and installed.

6. **Integration with NGINX-S3-Gateway Image:**
   - The NGINX-S3-Gateway image is used as the base for further modifications.
   - LuaJIT environment variables are set to maintain consistency.
   - The compiled NGINX modules, libraries, and additional Lua modules are copied from the build stage to the NGINX-S3-Gateway image.

7. **Configuration and Entrypoint:**
   - Custom configuration files (`nginx.conf.template` and `default.conf.template`) are copied to their respective locations.
   - The entrypoint script is set as executable.

## Building the Docker Image

To build the Docker image with the Redis feature:

```bash
docker build -t nginx-redis3 .
```

## Running the Container

To run a container based on the newly created image:

```bash
docker container run -p 8080:8080 nginx-redis3 -e S3_BUCKET_NAME=redis3 \
    -e S3_SERVER=127.0.0.1 -e S3_SERVER_PORT=9000 -e S3_SERVER_PROTO=http \
    -e S3_REGION=us-east-1 -e S3_STYLE=path -e ALLOW_DIRECTORY_LIST=true -e AWS_SIGS_VERSION=4 \
    -e AWS_ACCESS_KEY_ID=minioadmin -e AWS_SECRET_ACCESS_KEY=minioadmin \
    -e CORS_ENABLED=true   -e NGINX_WORKER_PROCESSES=4   -e PROXY_CACHE_MAX_SIZE=10g \
    -e PROXY_CACHE_INACTIVE=60m -e PROXY_CACHE_VALID_OK=1h -e PROXY_CACHE_VALID_NOTFOUND=1m \
    -e PROXY_CACHE_VALID_FORBIDDEN=30s
```

This command will expose NGINX, providing access to the S3 gateway with Redis integration.

## Customization

Feel free to customize the NGINX configuration files (`nginx.conf` and `default.conf`) and environment variables to suit your specific requirements.

## Testing

The Dockerfile has been tested locally to ensure proper integration of the Redis feature. Comprehensive testing includes both unit tests and manual testing to validate functionality.

## Future Considerations

This Dockerfile provides a solid foundation for NGINX with Redis support. Future enhancements may include additional Redis-related configurations and features based on project requirements (e.g., prometheus).
