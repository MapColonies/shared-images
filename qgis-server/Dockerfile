FROM openquake/qgis-server:3.16.13

WORKDIR /scripts

# curl, nodejs (npx) and aws cli
RUN apt-get -y update && apt-get -y install curl && curl -fsSL "https://deb.nodesource.com/setup_19.x" | bash - && apt-get install -y nodejs && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip && ./aws/install

COPY ./entrypoint.sh /scripts/entrypoint.sh
COPY ./copy-projects.mjs /scripts/copy-projects.mjs
RUN chmod +x /scripts/entrypoint.sh && chmod +x /scripts/copy-projects.mjs

ENTRYPOINT /scripts/entrypoint.sh