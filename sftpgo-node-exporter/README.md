# Node Exporter with Custom Subdirectory Size Metrics

This image runs Prometheus `node_exporter` and adds a custom metric file for directory sizes under `/mnt` using the textfile collector.

## What this container does

The container starts two processes:

1. **`subdir_sizes.sh`**
   - runs in the background
   - scans the parent directory (default: `/mnt`)
   - calculates the total size of the parent directory
   - calculates the size of each immediate subdirectory under it
   - writes the results in Prometheus textfile format to:

   `/var/lib/node_exporter/textfile_collector/subdir_sizes.prom`

2. **`node_exporter`**
   - runs in the foreground
   - exposes standard node metrics on port `9100`
   - also exposes the custom metrics written by `subdir_sizes.sh` through the textfile collector

---

## Directory layout inside the container

- `/var/lib/node_exporter/textfile_collector`  
  Directory read by node_exporter textfile collector

- `/var/lib/node_exporter/script/subdir_sizes.sh`  
  Background script that generates the custom metrics

- `/var/lib/node_exporter/textfile_collector/subdir_sizes.prom`  
  Generated Prometheus metrics file

- `/var/lib/node_exporter/textfile_collector/subdirs.log`  
  Simple execution log written by the script

---

