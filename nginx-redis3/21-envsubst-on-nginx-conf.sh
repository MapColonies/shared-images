#!/bin/sh
envsubst '${NGINX_WORKER_PROCESSES}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf