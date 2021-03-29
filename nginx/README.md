# nginx working image for openshit
This image is a version of nginx that works in openshit environment.
All the permissions were changed so a user under the group `root` can run the container.

## Using environment variables in nginx configuration
The nginx image supports substituting variables in the configuration with env  variables.

So if you place `templates/default.conf.template` file, which contains variable references like this:
```
	listen       ${NGINX_PORT};
```
outputs to `/etc/nginx/conf.d/default.conf` like this:
```
	listen       80;
```
for more information: https://github.com/docker-library/docs/tree/master/nginx#using-environment-variables-in-nginx-configuration-new-in-119