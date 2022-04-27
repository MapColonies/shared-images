# nginx-s3-gateway Openshift Compatible Image

## Why?

`nginxinc/nginx-s3-gateway` image is listening on port 80 and runs with user nginx,
therefore we need to change the port and remove the user.

## What does the script do?

1. Clones `nginxinc/nginx-s3-gateway` git repo (configurable)
2. Adds `listen 8080` command
3. Comments out `user nginx`
4. Builds the openshift compatible image
5. **OPTIONAL** tag image

## Run

**DON'T FORGET TO RUN**
```sh
npm i
```

Running the script
```
npx zx index.mjs
```

## Configurable options
| ENV                      | Default Value                                    | Description                                                 | mandatory? |
|--------------------------|--------------------------------------------------|-------------------------------------------------------------|------------|
| IMAGE_TAG                |                                                  | The version of the image                                    | yes        |
| IMAGE_REPO               |                                                  | The name of the image                                       | yes        |
| NGINX_S3_GATEWAY_COMMIT  |                                                  | The `nginxinc/nginx-s3-gateway` version                     | no         |
| IMAGE_DOCKER_REGISTRY    |                                                  | If set it will tag image with registry prefix               | no         |
| NGINX_S3_GATEWAY_GIT_URL | https://github.com/nginxinc/nginx-s3-gateway.git | The https url of the git repo                               | no         |
| PORT                     | 8080                                             | Nginx port number                                           | no         |
| WORK_DIR                 | /tmp/nginx-s3-gateway                            | The folder where the script temporarily clones the git repo | no         |

## Installation

Use this helm: https://github.com/MapColonies/nginx-s3-gateway-helm
