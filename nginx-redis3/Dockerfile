FROM debian as BUILDER

RUN apt update && apt install -y wget build-essential git zlib1g-dev curl libpcre2-dev libssl-dev

WORKDIR /work

## BASE NGINX 
RUN wget https://openresty.org/download/nginx-1.25.3.tar.gz \
    && tar -xzvf nginx-1.25.3.tar.gz

## LUA JIT
RUN git clone https://github.com/openresty/luajit2 \
    && cd luajit2 \
    && make \
    && make install

ENV LUAJIT_LIB=/usr/local/lib/
ENV LUAJIT_INC=/usr/local/include/luajit-2.1

## CLONE OPENRESTY REPOS
RUN git clone https://github.com/vision5/ngx_devel_kit \
    && cd /work \
    && git clone https://github.com/openresty/lua-nginx-module.git \
    && cd /work \
    && git clone https://github.com/openresty/srcache-nginx-module.git \
    && cd /work \
    && git clone https://github.com/openresty/set-misc-nginx-module.git \
    && cd /work \
    && git clone https://github.com/openresty/headers-more-nginx-module.git

## COMPILE NGINX FOR THE DYNAMIC MODULES
RUN cd nginx-1.25.3 \
    && ./configure --prefix=/etc/nginx \
    --sbin-path=/usr/sbin/nginx --modules-path=/usr/lib/nginx/modules --conf-path=/etc/nginx/nginx.conf --error-log-path=/var/log/nginx/error.log \
    --http-log-path=/var/log/nginx/access.log --pid-path=/var/run/nginx.pid --lock-path=/var/run/nginx.lock \
    --http-client-body-temp-path=/var/cache/nginx/client_temp --http-proxy-temp-path=/var/cache/nginx/proxy_temp \
    --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp \
    --http-scgi-temp-path=/var/cache/nginx/scgi_temp --user=nginx --group=nginx --with-compat --with-file-aio --with-threads \
    --with-http_addition_module --with-http_auth_request_module --with-http_dav_module --with-http_flv_module --with-http_gunzip_module \
    --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module --with-http_realip_module --with-http_secure_link_module \
    --with-http_slice_module --with-http_ssl_module --with-http_stub_status_module --with-http_sub_module --with-http_v2_module --with-http_v3_module \
    --with-mail --with-mail_ssl_module --with-stream --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module \
    --with-cc-opt='-g -O2 -ffile-prefix-map=/data/builder/debuild/nginx-1.25.3/debian/debuild-base/nginx-1.25.3=. -fstack-protector-strong -Wformat -Werror=format-security -Wp,-D_FORTIFY_SOURCE=2 -fPIC' \
    --with-ld-opt='-Wl,-z,relro -Wl,-z,now -Wl,-rpath,/usr/local/lib,--as-needed -pie' \
    --add-dynamic-module=/work/ngx_devel_kit \
    --add-dynamic-module=/work/lua-nginx-module \
    --add-dynamic-module=/work/srcache-nginx-module \
    --add-dynamic-module=/work/set-misc-nginx-module \
    --add-dynamic-module=/work/headers-more-nginx-module \
    && make -j2 \
    && make install

## ADD-ONS THAT DOES NOT NEED COMPLIATION
RUN git clone https://github.com/openresty/lua-resty-core.git \
    && cd lua-resty-core \
    && make install PREFIX=/etc/nginx \
    && cd /work \
    && git clone https://github.com/openresty/lua-resty-lrucache.git \
    && cd lua-resty-lrucache \
    && make install PREFIX=/etc/nginx \
    && cd /work \
    && git clone https://github.com/openresty/lua-resty-redis.git \
    && cd lua-resty-redis \
    && make install PREFIX=/etc/nginx


## NGINX-S3-GATEWAY

FROM ghcr.io/nginxinc/nginx-s3-gateway/nginx-oss-s3-gateway:unprivileged-oss-20231102

USER root

## EXPORT PATHS OF LUA
ENV LUAJIT_LIB=/usr/local/lib/
ENV LUAJIT_INC=/usr/local/include/luajit-2.1

## COPY THE MODULES FROM BUILDER STAGE TO NGINX-S3-GATEWAY
COPY --from=BUILDER /work/nginx-1.25.3/objs/*.so /etc/nginx/modules/
COPY --from=BUILDER /etc/nginx/lib /etc/nginx/lib
COPY --from=BUILDER /usr/local/lib/ /usr/local/lib

COPY 21-envsubst-on-nginx-conf.sh /docker-entrypoint.d
COPY nginx.conf /etc/nginx/nginx.conf.template
COPY default.conf /etc/nginx/templates/default.conf.template

RUN chmod +x /docker-entrypoint.d/21-envsubst-on-nginx-conf.sh

EXPOSE 8080

USER nginx