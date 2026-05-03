#!/bin/bash

echo "Running ${TEXT_FILES_SCRIPTS_ROOT}/subdir_sizes.sh..."
nohup "${TEXT_FILES_SCRIPTS_ROOT}"/subdir_sizes.sh >/dev/stdout 2>&1 &
# ${TEXT_FILES_SCRIPTS_ROOT}/subdir_sizes.sh &
SUBDIRS_PID="$!"
echo "SUBDIRS_PID=$SUBDIRS_PID"

echo "Running node exporter..."
exec /usr/local/bin/node_exporter "$@"
