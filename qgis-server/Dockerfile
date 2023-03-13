FROM openquake/qgis-server:3.16.13

ENV ZX_VERSION=1.2.2

# curl, nodejs & npm
RUN apt-get update
RUN apt-get -y install \
    curl \
    nodejs \
    npm
RUN npm install -g n
RUN n latest
RUN npm install -g npm

# zx
RUN npm i -g zx@${ZX_VERSION}

# aws cli
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip
RUN ./aws/install && aws --version

ARG aws_access_key_id
ARG aws_secret_access_key
ARG aws_endpoint_url
ARG aws_bucket_name

ENV AWS_ACCESS_KEY_ID=${aws_access_key_id}
ENV AWS_SECRET_ACCESS_KEY=${aws_secret_access_key}
ENV AWS_ENDPOINT_URL=${aws_endpoint_url}
ENV AWS_BUCKET_NAME=${aws_bucket_name}

USER root

WORKDIR /scripts

COPY entrypoint.sh /scripts/entrypoint.sh
RUN chmod +x /scripts/entrypoint.sh
COPY copy-projects.mjs /scripts/copy-projects.mjs
RUN chmod +x /scripts/copy-projects.mjs

ENTRYPOINT /scripts/entrypoint.sh