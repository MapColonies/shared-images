# GeoServer Openshift Compatabile Image

## Why?

`Kartoza/geoserver` image runs the command `VOLUME []` which "locks" the folder and makes it immutable.
therefore we cant change the owner of the folder to the random generated user which is under the root group/

## What does the script do?

1. Clones `kartoza/geoserver` git repo on default (configurable)
2. Removes the `VOLUME []` command from the Dockerfile
3. builds the image
4. builds the openshift compatabile image
5. **OPTIONAL** tag image

## Run the script

**DON'T FORGET TO RUN **
```sh
npm i
```

running the script
```
npx zx index.mjs
```

## Configurable options
| ENV                          | Default Value                               | Description                                                       | mandatory? |
|------------------------------|---------------------------------------------|-------------------------------------------------------------------|------------|
| IMAGE_REPO                   |                                             | The name of the docker image                                      | yes        |
| GEOSERVER_VERSION            |                                             | the `kartoza/geoserver` version                                   | yes        |
| WORK_DIR                     | /tmp/geoserver                              | the folder where the script clones the kartoza/geoserver git repo | no         |
| KARTOZA_DOCKER_IMAGE_GIT_URL | https://github.com/kartoza/docker-geoserver | The https url of the git repo                                     | no         |
| IMAGE_DOCKER_REGISTRY        |                                             | If set it will tag image with the registry prefix                 | no         |
