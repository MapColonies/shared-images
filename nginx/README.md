
# Nginx Docker Image & Helm Chart for Openshift

This repository consists of two things:
1. Nginx `Dockerfile` and its necessary assets for building
2. Nginx `Helm Chart` 


## Docker Image
We are using `nginxinc/nginx-unprivileged` as a base image in order to run Nginx with non-root privileges so it's possible to run in it an Openshift cluster (as we know, Openshift does not allow running containers with root privileges).
Besides that the `Dockerfile` is pretty straight forward so you can open it up and view it by yourself.

### Main Config Files
1. `/etc/nginx/conf.d/deafult.conf` - Main server configurations. This server runs on port `8080` and it should process all of incoming traffic.
2. `/etc/nginx/conf.d/status_site.conf` - This server runs on port `8081` and provides access to basic status data. You should use this server in order to make `liveness` checks on your application. This server **should not** be accessible outside the cluster.

### OpenTelemetry Support
There's support for instrumenting Nginx with OpenTelemetry (currently only for tracing), simply provide these environment variables:
| Environment Variable | Description | Default Value |
| ----|----|----|----|
| `OTEL_SERVICE_NAME` | Name of service | `nginx-proxy` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Endpoint address of OpenTelemetry Collector | `localhost:4317` |
| `OTEL_TRACES_SAMPELR` | Sampling method | `AlwaysOff` |
| `OTEL_TRACES_SAMPLER_RATIO` | Sampling ratio | `0.1` |
| `OTEL_TRACES_SAMPLER_PARENT_BASED` | Use parent-based sampling | `false` |

### Authroization Mechanism 
Since we are using [Open Policy Agent](https://www.openpolicyagent.org/) (aka `OPA`) as our gatekeeper, it's necessary to integrate Nginx with it. 
* The docker image does contains the `auth.js` file, which is responsible for handling requests that require authorization **but** the Nginx server does not actually make the authorization process - we commented the code section that's doing it.

### Log Format
The docker image provides default log format  (`/etc/nginx/log_format`). It's not possible to extend the log format, so if you'd want to add/remove certain fields you have to override it.


## Helm Chart
There is also an Helm Chart for deploying this Nginx in an Openshift environment (let alone any K8S environment).
 
### Parameters
These are the main parameters you should adjust when you deploy this Helm Chart. You can find all parameters in the `values.yaml` file.
Name | Description | Value
----|----|----|----|
`nginx.image.repository` | Docker image name | `nginx`
`nginx.image.tag` | Docker image tag | `latest`
`nginx.resources.enabled` | Use custom resources | `true`
`nginx.resources.value.limits.cpu` | Pod CPU limit | `100m`
`nginx.resources.value.limits.memory` | Pod memory limit | `128Mi`
`nginx.resources.value.requests.cpu` | Pod CPU request | `100m`
`nginx.resources.value.requests.memory` | Pod memory request | `128Mi`
`env.opentelemetry.serviceName` | OpenTelemetry service name to be associated your Nginx application | `nginx`
`env.opentelemetry.exporterEndpoint` | OpenTelemetry Collector endpoint address | `localhost:4317`
`env.opentelemetry.samplerMethod` | OpenTelemetry sampling method | `AlwaysOff`
`env.opentelemetry.ratio` | OpenTelemetry sampling ratio | `0.1`
`env.opentelemetry.parentBased` | Use OpenTelemetry parnet-based sampling | `false`
`authorization.enabled` | Use authroization mechanism | `true`
`authorization.domain` | Your authorization domain | `example`
`authorization.url` | Authorization endpoint | `http://localhost:8181/v1/data/http/authz/decision`
`route.enabled` | Expose Nginx as an Openshift route | `true`
`ingress.enabled` | Expose Nginx as an Ingress | `false`
