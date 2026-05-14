FROM hoppscotch/hoppscotch:2026.2.0

RUN chgrp -R 0 /site && \
    chmod -R g+rwX /site

RUN chgrp -R 0 /dist/backend && \
    chmod -R g+rwX /dist/backend

USER 1001
