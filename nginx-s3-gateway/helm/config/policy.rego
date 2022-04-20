package envoy.authz

import input.attributes.request.http as http_request
import input.parsed_query as query_params
import input.attributes.request.http.headers as request_headers

default allow = false

jwt_token = token {
  token := io.jwt.decode(query_params.token[0])
}

{{- if .Values.authentication.opa.customHeaderName }}
jwt_token = token {
  token := io.jwt.decode(http_request.headers[{{ .Values.authentication.opa.customHeaderName | quote }}])
}
{{- end }}

# Allow health-checks
# allow {
#   split(http_request.host, ":")[1] == "8282"
#   split(http_request.host, ":")[0] == "localhost"
# }

allow {
  [header, payload, sig] := jwt_token
  payload.ao[_] = http_request.headers.origin
}

allow {
  [header, payload, sig] := jwt_token
  http_request.headers.origin == payload.ao
}

allow {
  [header, payload, sig] := jwt_token
  not payload.ao
}
