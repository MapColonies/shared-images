#!/usr/bin/env bash

# Exit immediately if a pipeline returns a non-zero status
set -e 

echo "Starting Dockerfile linting..."

find . -type f -name '*Dockerfile*' -print0 | xargs -0 -I {} sh -c 'echo "Linting {}" && docker run --rm -i hadolint/hadolint < {}'

echo "Docker linting complete!"
