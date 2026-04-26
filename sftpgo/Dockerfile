FROM drakkan/sftpgo:v2.7.0
USER root
RUN chown -R 1001:1001 /etc/sftpgo && \
    chown 1001:1001 /var/lib/sftpgo /srv/sftpgo
RUN chmod -R 777 /var/lib/sftpgo
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod 0755 /usr/local/bin/entrypoint.sh
USER 1001:1001
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["sftpgo", "serve"]