#!/usr/bin/env zx

const [, , , imageName] = process.argv;

const WORK_DIR = '/tmp/nginx-s3-gateway';
const NGINX_S3_GATEWAY_DOCKER_IMAGE_GIT_URL = 'https://github.com/nginxinc/nginx-s3-gateway.git';

try {
  const nginxDockerfilePath = `${WORK_DIR}/Dockerfile.oss`;
  const nginxConfPath = `${WORK_DIR}/common/etc/nginx/nginx.conf`;
  const defaultConfTemplatePath = `${WORK_DIR}/common/etc/nginx/templates/default.conf.template`;

  try {
    await $`docker rmi ${imageName}`;
  } catch(e) {
    console.log(chalk.blue('No image found...'));
  }

  await $`git clone ${NGINX_S3_GATEWAY_DOCKER_IMAGE_GIT_URL} ${WORK_DIR}`;
  console.log(chalk.blue('Cloned nginx-s3-gateway Git Repo'));
  await $`sed -i 's/server {/server {\\n    listen 3001;/' ${defaultConfTemplatePath}`;
  console.log(chalk.blue('Added LISTEN 3001 declaration'));
  await $`sed -i 's/user  nginx;/# user  nginx;/' ${nginxConfPath}`;
  console.log(chalk.blue('Removed USER NGINX declaration'));
  console.log(chalk.blue('Build Modified GeoServer Image'));
  await $`docker build -q -f ${nginxDockerfilePath} -t ${imageName} ${WORK_DIR}`;
  console.log(chalk.blue('Openshift Geoserver Docker Image is ready'));
  console.log(chalk.magenta('We did it!! 🐧🐧🐧🐧'));
} catch(e) {
  console.log(chalk.red('Oh no! 😢'));
  console.error(e);
} finally {
  await $`rm -rf ${WORK_DIR}`;
}
