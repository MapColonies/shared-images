#!/bin/sh
# Directory to analyze
PARENT_DIR="${PARENT_DIR:-/mnt}"
OUTPUT_FILE="${SUBDIR_SIZES_OUTPUT_FILE:-/var/lib/node_exporter/textfile_collector/subdir_sizes.prom}"
# 1800 seconds = 30 minutes
SLEEP_TIME="${SLEEP_TIME:-1800}"
TEXT_FILES_ROOT_DIR="/var/lib/node_exporter/textfile_collector"
LOG_FILE_NAME="subdirs.log"

LOG_FILE="${TEXT_FILES_ROOT_DIR}/${LOG_FILE_NAME}"
TMP_FILE="${OUTPUT_FILE}.tmp"

touch "$LOG_FILE"

while true; do
	# Generate metrics
	echo "# HELP subdir_size_bytes Size of subdirectories in bytes" >"$TMP_FILE"
	echo "# TYPE subdir_size_bytes gauge" >>"$TMP_FILE"
	echo "Script executed at $(date)" >"$LOG_FILE"
	echo "PARENT_DIR=$PARENT_DIR" >>"$LOG_FILE"
	echo "OUTPUT_FILE=$OUTPUT_FILE" >>"$LOG_FILE"

	parent_dir_name=$(basename "$PARENT_DIR")
	parent_dir_size=$(du -sb "$PARENT_DIR" | awk '{print $1}')
	echo "subdir_size_bytes{directory=\"$parent_dir_name\",subdir=\"false\"} $parent_dir_size" >>"$TMP_FILE"

	for dir in "$PARENT_DIR"/*/; do
		if [ -d "$dir" ]; then
			size=$(du -sb "$dir" | awk '{print $1}')
			name=$(basename "$dir")
			echo "subdir_size_bytes{directory=\"$name\",subdir=\"true\"} $size" >>"$TMP_FILE"
		fi
	done

	mv "$TMP_FILE" "$OUTPUT_FILE"
	sleep "$SLEEP_TIME"
done
