#!/bin/sh

whoami
addgroup --system --gid 101 nginx || true \
adduser --system --disabled-login --ingroup nginx --no-create-home --home /nonexistent --gecos "nginx user" --shell /bin/false --uid 101 nginx || true
chown -R 101:0 /var/cache/nginx
chmod -R g+w /var/cache/nginx
chown -R 101:0 /etc/nginx
chmod -R g+w /etc/nginx

# chgrp -R 0 /etc/nginx
# chmod -R g=u /etc/nginx
# chmod -R a+rwx /etc/nginx

# useradd -ms /bin/bash appuser
# usermod -a -G root appuser
# su appuser