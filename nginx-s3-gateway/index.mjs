#!/usr/bin/env zx

import 'dotenv/config';
require('dotenv').config();

const {
  IMAGE_TAG,
  IMAGE_REPO,
  NGINX_S3_GATEWAY_COMMIT,
  IMAGE_DOCKER_REGISTRY,
  NGINX_S3_GATEWAY_GIT_URL = 'https://github.com/nginxinc/nginx-s3-gateway.git',
  PORT = '8080',
  WORK_DIR = '/tmp/nginx-s3-gateway'
} = process.env;

try {
  
  const packageVersion = await require('./package.json').version;
  let imageName = `${IMAGE_REPO}:v${IMAGE_TAG || packageVersion}`;
  const nginxDockerfilePath = `${WORK_DIR}/Dockerfile.oss`;
  const nginxConfPath = `${WORK_DIR}/common/etc/nginx/nginx.conf`;
  const defaultConfTemplatePath = `${WORK_DIR}/common/etc/nginx/templates/default.conf.template`;

  console.log(chalk.blue(`\nClone '${IMAGE_REPO}' git repo:`));
  await $`git clone ${NGINX_S3_GATEWAY_GIT_URL} ${WORK_DIR}`;
  await $`cd ${WORK_DIR}`;
  if (NGINX_S3_GATEWAY_COMMIT) {
    imageName = `${imageName}-${NGINX_S3_GATEWAY_COMMIT}`;
    await $`git checkout ${NGINX_S3_GATEWAY_COMMIT}`;
  } else {
    let shortCommitHash = await $`git rev-parse --short HEAD`;
    shortCommitHash = shortCommitHash.toString().trim();
    imageName = `${imageName}-${shortCommitHash}`;
  }
  console.log(chalk.blue(`Cloned OK!`));
  console.log(chalk.blue(`\nModify git repo:`));
  await $`sed -i 's/server {/server {\\n    listen ${PORT};/' ${defaultConfTemplatePath}`;
  console.log(chalk.blue(`Added 'listen ${PORT};' declaration`));
  await $`sed -i 's/user  nginx;/# user  nginx;/' ${nginxConfPath}`;
  console.log(chalk.blue(`Commented out 'user nginx;' declaration`));
  console.log(chalk.blue(`\nBuild modified nginx image:`));
  await $`docker build -q -f ${nginxDockerfilePath} -t ${imageName} ${WORK_DIR}`;
  console.log(chalk.blue(`Docker image '${imageName}' is READY!`));

  if (IMAGE_DOCKER_REGISTRY) {
    const taggedImageName = `${IMAGE_DOCKER_REGISTRY}/${imageName}`;
    console.log(chalk.blue(`\nTag image '${imageName}':`));
    await $`docker tag ${imageName} ${taggedImageName}`;
    console.log(chalk.blue(`Tagged as '${taggedImageName}'!`));
  }

  console.log(chalk.magenta('\nWe did it!!! 🐧🐧🐧🐧🐧\n'));

} catch(e) {
  console.log(chalk.red('\nOh no! 😢\n'));
  console.error(e);
} finally {
  await $`rm -rf ${WORK_DIR}`;
}
