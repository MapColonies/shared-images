
  

# NGINX Docker Image & Helm Chart for Openshift

  

This repository consists of two things:

1. NGINX `Dockerfile` and its necessary assets for building

2. NGINX `Helm Chart` including `NGINX Prometheus Exporter`.

  
  

## Docker Image

We are using `nginxinc/nginx-unprivileged` as a base image in order to run NGINX with non-root privileges so it's possible to run it in an Openshift cluster (as we know, Openshift does not allow running containers with root privileges).

Besides that the `Dockerfile` is pretty straight forward so you can check it out yourself.

  

### Main Config Files

1.  `/etc/nginx/conf.d/deafult.conf` - Main server configurations. This server runs on port `8080` and it should process all of incoming traffic.

2.  `/etc/nginx/conf.d/status_site.conf` - This server runs on port `8081` and provides access to basic status data. You should use this server in order to make `liveness` checks on your application. This server **should not** be accessible outside the cluster.

  

### OpenTelemetry Support

There's support for instrumenting NGINX with OpenTelemetry (currently only for tracing), simply provide these environment variables:

  

| Environment Variable | Description | Default Value |
| ---------------------------- | ---------------------------------------------- | ---- |
| `OTEL_SERVICE_NAME` | Name of service | `nginx-proxy` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Endpoint address of OpenTelemetry Collector | `localhost:4317` |
| `OTEL_TRACES_SAMPELR` | Sampling method | `AlwaysOff` |
| `OTEL_TRACES_SAMPLER_RATIO` | Sampling ratio | `0.1` |
| `OTEL_TRACES_SAMPLER_PARENT_BASED` | Use parent-based sampling | `false` |

  

### Authroization Mechanism

Since we are using [Open Policy Agent](https://www.openpolicyagent.org/) (aka `OPA`) as our gatekeeper, it's necessary to integrate NGINX with it.

* The docker image contains the `auth.js` file, which is responsible for handling requests that require authorization **but** the NGINX server does not actually handle the authorization process - we commented the code section responsible for this logic.

  

### Log Format

The docker image provides default log format (`/etc/nginx/log_format`). It's not possible to extend the log format, so if you'd want to add/remove certain fields you have to override it.

  
  

## Helm Chart

There is also an Helm Chart for deploying this NGINX in an Openshift environment (let alone any K8S environment). 
Besides NGINX, this Helm Chart also deploys (on deamend) a Prometheus exporter for NGINX using [nginx-prometheus-exporter](https://github.com/nginxinc/nginx-prometheus-exporter/). Follow the parameters below in order to configure NGINX and its Prometheus exporter as you wish.

### Parameters

These are the main parameters you should adjust when you deploy this Helm Chart. You can find all parameters in the `values.yaml` file.

  #### NGINX Parameters

| Name | Description | Value |
| ------------------------------------ | ----------------------------------------------------------- | ------- |
`nginx.image.repository` | Docker image name | `nginx`
`nginx.image.tag` | Docker image tag | `latest`
`nginx.resources.enabled` | Use custom resources | `true`
`nginx.resources.value.limits.cpu` | Pod CPU limit | `100m`
`nginx.resources.value.limits.memory` | Pod memory limit | `128Mi`
`nginx.resources.value.requests.cpu` | Pod CPU request | `100m`
`nginx.resources.value.requests.memory` | Pod memory request | `128Mi`
`env.opentelemetry.serviceName` | OpenTelemetry service name to be associated your NGINX application | `nginx`
`env.opentelemetry.exporterEndpoint` | OpenTelemetry Collector endpoint address | `localhost:4317`
`env.opentelemetry.samplerMethod` | OpenTelemetry sampling method | `AlwaysOff`
`env.opentelemetry.ratio` | OpenTelemetry sampling ratio | `0.1`
`env.opentelemetry.parentBased` | Use OpenTelemetry parnet-based sampling | `false`
`authorization.enabled` | Use authroization mechanism | `true`
`authorization.domain` | Your authorization domain | `example`
`authorization.url` | Authorization endpoint | `http://localhost:8181/v1/data/http/authz/decision`
`route.enabled` | Expose NGINX as an Openshift route | `true`
`ingress.enabled` | Expose NGINX as an Ingress | `false`
`additionalPodAnnotations.prometheus.io/scrape` | Should Prometheus scrape the NGINX Pod | `true`
`additionalPodAnnotations.prometheus.io/port` | The port in which the prometheus-exporter runs on | `false`

#### Overriding NGINX configuration files (nginx.conf, deafult.conf, log_format.conf)
If you wish to override the default configuration files, you need to change their value in the `values.yaml`.
For example, let's say I want to override the default `log_format.conf` file - I'll then go to the `nginx.logFormat` property and replace its value with my custom log format:
```
nginx:
  # ... multiple configurations ...

  logFormat: |- 
    log_format main escape=json 
    '{'
      '"Attributes":{'
          '"foo":"bar"'
      '}'
    '}';
```

#### Adding Custom Annotations
There's an option to dynamically add annotations to the pod. You might find it useful if you operate on different environments and need to custom your annotations. It can be done by editing the `additionalPodAnnotations` parameter.

  #### NGINX-Prometheus-Exporter Parameters
  | Name | Description | Value |
| ------------------------------------ | ----------------------------------------------------------- | ------- |
`prometheusExporter.enabled` | Enable / Disable the Prometheus exporter | `false`
`prometheusExporter.image.repostiory` | Prometheus exporter Docker image name | `nginx/nginx-prometheus-exporter`
`prometheusExporter.image.tag` | Prometheus exporter Docker image tag | `true`
`prometheusExporter.image.pullPolicy` | Image pull policy | `100m`
`prometheusExporter.resources.enabled` | Use custom resources | `100m`
`prometheusExporter.resources.value.limits.cpu` | Pod CPU limit | `100m`
`prometheusExporter.resources.value.limits.memory` | Pod memory limit | `128Mi`
`prometheusExporter.resources.value.requests.cpu` | Pod CPU request | `100m`
`prometheusExporter.resources.value.requests.memory` | Pod memory request | `128Mi`
