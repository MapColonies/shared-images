# Elastic Alertmanager Connector

A Python-based Flask application that acts as a webhook receiver for Prometheus Alertmanager. It receives incoming alerts and indexes them directly into Elasticsearch for long-term storage and analysis.

The application runs using Gunicorn on port `8080`.

## Configuration

The application is configured using the following environment variables:

| Variable          | Default                                           | Description                                              |
|-------------------|---------------------------------------------------|----------------------------------------------------------|
| `INDEX_NAME`      | `webhook-data`                                    | The Elasticsearch index where alerts are stored.         |
| `ES_HOST`         | `http://localhost:9200`                           | The URL of the Elasticsearch cluster.                    |
| `ES_USERNAME`     | _(optional)_                                      | Username for Elasticsearch authentication.               |
| `ES_PASSWORD`     | _(optional)_                                      | Password for Elasticsearch authentication.               |
| `ES_VERIFY_CERTS` | `false`                                           | Whether to verify TLS/SSL certificates (`true`/`false`). |
| `ES_CERT_PATH`    | `/opt/bitnami/elasticsearch/config/certs/ca.cert` | Path to the CA certificate for TLS verification.         |

## Usage

Send a POST request to the `/alert` endpoint with JSON payload to index an alert:

```bash
curl -X POST http://localhost:8080/alert -H "Content-Type: application/json" -d '{"status": "firing", "alerts": []}'
```
