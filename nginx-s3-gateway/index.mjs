#!/usr/bin/env zx

const [, , , imageName] = process.argv;
let IMAGE_TAG;
let IMAGE_REPO;
let NGINX_S3_GATEWAY_COMMIT;
let IMAGE_DOCKER_REGISTRY;
const NGINX_S3_GATEWAY_GIT_URL = 'https://github.com/nginxinc/nginx-s3-gateway.git';
const PORT = '8080';
const WORK_DIR = '/tmp/nginx-s3-gateway';

try {
  
  const nginxDockerfilePath = `${WORK_DIR}/Dockerfile.oss`;
  const nginxConfPath = `${WORK_DIR}/common/etc/nginx/nginx.conf`;
  const defaultConfTemplatePath = `${WORK_DIR}/common/etc/nginx/templates/default.conf.template`;

  await $`git clone ${NGINX_S3_GATEWAY_GIT_URL} ${WORK_DIR}`;
  console.log(chalk.blue('Cloned nginx-s3-gateway Git Repo'));
  await $`sed -i 's/server {/server {\\n    listen ${PORT};/' ${defaultConfTemplatePath}`;
  console.log(chalk.blue(`Added LISTEN ${PORT} declaration`));
  await $`sed -i 's/user  nginx;/# user  nginx;/' ${nginxConfPath}`;
  console.log(chalk.blue('Commented out USER NGINX declaration'));
  console.log(chalk.blue('Build Modified NGINX Image'));
  await $`docker build -q -f ${nginxDockerfilePath} -t ${imageName} ${WORK_DIR}`;
  console.log(chalk.blue(`NGINX Docker Image is ready: ${imageName}`));

  console.log(IMAGE_DOCKER_REGISTRY ?? '');
  if (IMAGE_DOCKER_REGISTRY) {
    const taggedImageName = `${IMAGE_DOCKER_REGISTRY}/${imageName}`;
    await $`docker tag ${imageName} ${taggedImageName}`;
    console.log(chalk.blue(`Tagged Docker Image as: ${taggedImageName}`));
  }

  console.log(chalk.magenta('We did it!! 🐧🐧🐧🐧🐧'));

} catch(e) {
  console.log(chalk.red('Oh no! 😢'));
  console.error(e);
} finally {
  await $`rm -rf ${WORK_DIR}`;
}
