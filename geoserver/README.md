# GeoServer Openshift Compatible Image

## Why?

`Kartoza/geoserver` image runs the command `VOLUME []` which "locks" the folder and makes it immutable.
Therefore we cant change the owner of the folder to the random generated user which is under the root group.

## What does the script do?

1. Clones `kartoza/geoserver` git repo on default (configurable)
2. Removes the `VOLUME []` command from the Dockerfile
3. Builds the image
4. Builds the openshift compatible image
5. **OPTIONAL** tag image

## Run the script

**DON'T FORGET TO RUN**
```sh
npm i
```

Running the script
```
npx zx index.mjs
```

## Configurable options
| ENV                          | Default Value                               | Description                                                         | mandatory? |
|------------------------------|---------------------------------------------|---------------------------------------------------------------------|------------|
| IMAGE_REPO                   |                                             | The name of the docker image                                        | yes        |
| GEOSERVER_VERSION            |                                             | The `kartoza/geoserver` version                                     | yes        |
| WORK_DIR                     | /tmp/geoserver                              | The folder where the script clones the `kartoza/geoserver` git repo | no         |
| IMAGE_DOCKER_REGISTRY        |                                             | If set it will tag image with the registry prefix                   | no         |
| POSTGRES_ENABLE_SSL_AUTH     |                                             | If set it will load postgres ssl auth certs to the required location| no         |
| POSTGRES_CERTS_MOUNT_PATH    |                                             | The location where the postgres certs are mounted                   |            |
| ADD_ROOT_CERTS | | enable adding certs to geoserver
| ROOT_CERTS_PATH | | path to load the certs from
| TELEMETRY_TRACING_ENABLED||set to true if you want the app to be traced
| TELEMETRY_METRICS_ENABLED||set to true if you want JVM metrics exported for prometheus. port is 12345
| LOG4J_VERSION ||used for json logging, defaults to 2.17.2

## Postgres SSL authentication

The required file in order to connect to postgres using ssl mode are as follows:
- `postgresql.crt`
- `postgresql.pk8`
- `root.ca`

To convert a standard private key to PKCS8 you can use the following openssl command:

`openssl pkcs8 -topk8 -inform PEM -outform DER -in postgresql.key -out postgresql.pk8 -nocrypt`
