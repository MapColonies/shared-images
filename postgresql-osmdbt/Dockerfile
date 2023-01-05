FROM bitnami/postgresql:14.6.0 as build
USER root
WORKDIR /app
RUN apt update -y && apt install -y git build-essential cmake
RUN git clone https://github.com/openstreetmap/osmdbt.git &&  \
  cd osmdbt && \
  git checkout d3af909f3d81a57b98211f6600c49d7dcda8e2d7 && \
  mkdir ./postgresql-plugin/build && \
  cd ./postgresql-plugin/build && \
  cmake .. && \
  cmake --build .

FROM bitnami/postgresql:14.6.0
COPY --from=build /app/osmdbt/postgresql-plugin/build/osm-logical.so /opt/bitnami/postgresql/lib/osm-logical.so
