FROM dpage/pgadmin4:9.12

USER root

RUN chmod -R 777 /venv /pgadmin4 /var/lib/pgadmin
RUN chown 0:0 /usr/local/bin/python3.14

# Disable postfix
ENV PGADMIN_DISABLE_POSTFIX=1
