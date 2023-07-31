#!/usr/bin/env zx

const {
  GEOSERVER_VERSION,
  IMAGE_DOCKER_REGISTRY,
  IMAGE_REPO,
  WORK_DIR = '/tmp/geoserver',
  OTEL_VERSION = 'v1.28.0',
  LOG4J_VERSION = '2.17.2',
  JMX_PROMETHEUS_VERSION = '0.19.0'
} = process.env;

try {
  const packageVersion = await require('./package.json').version;
  const imageName = `${IMAGE_REPO}:v${packageVersion}-${GEOSERVER_VERSION}`;
  const geoserverBaseImageName = `kartoza/geoserver:${GEOSERVER_VERSION}`;

  await $`docker build -q --build-arg OTEL_VERSION=${OTEL_VERSION} --build-arg LOG4J_VERSION=${LOG4J_VERSION} --build-arg JMX_PROMETHEUS_VERSION=${JMX_PROMETHEUS_VERSION} --build-arg GEOSERVER_BASE_IMAGE=${geoserverBaseImageName} -f Dockerfile -t ${imageName} .`;

  console.log(chalk.blue('Builds Openshift ready Geoserver Image'));
  console.log(IMAGE_DOCKER_REGISTRY);

  if (IMAGE_DOCKER_REGISTRY) {
    const taggedImageName = `${IMAGE_DOCKER_REGISTRY}/${imageName}`;
    await $`docker tag ${imageName} ${taggedImageName}`;
    console.log(chalk.blue(`Tagged Docker Image as ${taggedImageName}`));
  }
  console.log(chalk.magenta('We did it!! 🐧🐧🐧🐧🐧'));
} catch (e) {
  console.log(chalk.red('Oh no! 😢'));
  console.error(e);
} finally {
  await $`rm -rf ${WORK_DIR}`;
}
