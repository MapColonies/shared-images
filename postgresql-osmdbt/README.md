# postgresql-osmdbt
This container is a modification of the [bitnami/postgresql container](https://github.com/bitnami/containers/tree/main/bitnami/postgresql) so it contains the [osmdbt postgresql plugin](https://github.com/openstreetmap/osmdbt) for the replication slot.

In order to deploy the image on Openshift you should use the [bitnami/postgresql](https://github.com/bitnami/charts/tree/main/bitnami/postgresql) helm chart with the modifications present in the `values.yaml` file.

* Those values are only to make the new image work on openshift. For production deployment, please check the chart documentation at bitnami * 