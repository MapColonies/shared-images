# Changelog

## [2.0.0](https://github.com/MapColonies/shared-images/compare/grafana-v1.1.1...grafana-v2.0.0) (2026-11-11)


### ⚠ BREAKING CHANGES

* **grafana:** Grafana 13 migrates dashboards in the database on first start. Rolling back to a 12.x image requires restoring a pre-upgrade database backup.

### Features

* **grafana:** upgrade to Grafana 13.2.5 and add MapLibre panel plugin (MAPCO-12583) ([#20](https://github.com/MapColonies/shared-images/issues/20)) ([ef68105](https://github.com/MapColonies/shared-images/commit/ef6810518da5132a5af5db743f0291a62fc817ee))

## [1.1.1](https://github.com/MapColonies/shared-images/compare/grafana-v1.1.0...grafana-v1.1.1) (2026-05-20)


### Bug Fixes

* **grafana:** fix plugin dir permissions ([#18](https://github.com/MapColonies/shared-images/issues/18)) ([95d677b](https://github.com/MapColonies/shared-images/commit/95d677b2d7ef69c95b99e2c0ff6e7875100a6ad9))

## [1.1.0](https://github.com/MapColonies/shared-images/compare/grafana-v1.0.0...grafana-v1.1.0) (2026-05-20)


### Features

* **grafana:** add grafana ([#16](https://github.com/MapColonies/shared-images/issues/16)) ([6406393](https://github.com/MapColonies/shared-images/commit/6406393558ddb70567029ad607c80e8d6c5a2791))
