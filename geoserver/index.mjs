#!/usr/bin/env zx

const {
    GEOSERVER_VERSION = '2.19.1',
    IMAGE_DOCKER_REGISTRY = 'acrarolibotnonprod.azurecr.io',
    IMAGE_REPO = 'geoserver-os',
    WORK_DIR = '/tmp/geoserver',
    KARTOZA_DOCKER_IMAGE_GIT_URL = 'https://github.com/kartoza/docker-geoserver'
} = process.env;


try {
    const packageVersion = await require('./package.json').version;
    const imageName = `${IMAGE_REPO}:v${packageVersion}-${GEOSERVER_VERSION}`;
    const tempGeoserverBaseImageName = `geoserver-base:${GEOSERVER_VERSION}`;
    const kartozaDockerfilePath = `${WORK_DIR}/Dockerfile`;

    await $`git clone ${KARTOZA_DOCKER_IMAGE_GIT_URL} ${WORK_DIR}`;
    console.log(chalk.blue('Cloned Kartoza Geoserver Git Repo'));
    await $`docker build -q --build-arg GS_VERSION=${GEOSERVER_VERSION} -f ${kartozaDockerfilePath} -t ${tempGeoserverBaseImageName} ${WORK_DIR}`;
    console.log(chalk.blue('Build Kartoza Modified GeoServer Image'));
    await $`docker build -q --build-arg GEOSERVER_BASE_IMAGE=${tempGeoserverBaseImageName} -f Dockerfile -t ${imageName} .`;
    console.log(chalk.blue('Builds Openshift ready Geoserver Image'));

    console.log(IMAGE_DOCKER_REGISTRY);
    if (IMAGE_DOCKER_REGISTRY) {
        const taggedImageName = `${IMAGE_DOCKER_REGISTRY}/${imageName}`;
        await $`docker tag ${imageName} ${taggedImageName}`;
        console.log(chalk.blue(`Tagged Docker Image as ${taggedImageName}`));
    }
    console.log(chalk.magenta('We did it!! 🐧🐧🐧🐧🐧'));
} catch(e) {
    console.log(chalk.red('Oh no! 😢'));
    console.error(e);
} finally {
    await $`rm -rf ${WORK_DIR}`;
}
