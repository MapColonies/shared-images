FROM openquake/qgis-server:3.16.13

ARG ZX_VERSION=1.2.2

# curl, nodejs & npm
RUN apt-get update
RUN apt-get -y install curl
RUN curl -fsSL "https://deb.nodesource.com/setup_19.x" | bash - && apt-get install -y nodejs

# zx
RUN npm i -g zx@${ZX_VERSION}

# aws cli
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip && ./aws/install

USER root

WORKDIR /scripts

COPY entrypoint.sh /scripts/entrypoint.sh
RUN chmod +x /scripts/entrypoint.sh
COPY copy-projects.mjs /scripts/copy-projects.mjs
RUN chmod +x /scripts/copy-projects.mjs

ENTRYPOINT /scripts/entrypoint.sh