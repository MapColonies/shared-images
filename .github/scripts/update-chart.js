const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

function updateCharts(imageName, newTag, workspacePath) {
  const chartsDir = path.join(workspacePath, 'helm-charts', 'charts');
  let updatedAnyChart = false;

  if (!fs.existsSync(chartsDir)) {
    throw new Error(`Charts directory not found at ${chartsDir}`);
  }

  const chartDirs = fs
    .readdirSync(chartsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const chartName of chartDirs) {
    const targetPath = path.join(chartsDir, chartName);
    const chartYamlPath = path.join(targetPath, 'Chart.yaml');
    const valuesYamlPath = path.join(targetPath, 'values.yaml');

    if (!fs.existsSync(chartYamlPath)) continue;

    let chartDoc = YAML.parseDocument(fs.readFileSync(chartYamlPath, 'utf8'));
    let valuesDoc = fs.existsSync(valuesYamlPath) ? YAML.parseDocument(fs.readFileSync(valuesYamlPath, 'utf8')) : null;

    // Track file updates independently to avoid unnecessary disk writes
    let chartDocUpdated = false;
    let valuesDocUpdated = false;

    // Strict exact matching
    const isExactMatch = chartName === imageName;
    const deps = chartDoc.get('dependencies');
    const hasDependency = deps && YAML.isSeq(deps) && deps.items.some((dep) => dep.get('name') === imageName);

    if (hasDependency) {
      if (valuesDoc && valuesDoc.hasIn([imageName, 'image', 'tag'])) {
        valuesDoc.setIn([imageName, 'image', 'tag'], newTag);
        valuesDocUpdated = true;
      } else {
        chartDoc.set('appVersion', newTag);
        chartDocUpdated = true;
      }
    } else if (isExactMatch) {
      // IMPORTANT: 'else if' prevents dual-updating when both match
      if (valuesDoc && valuesDoc.hasIn(['image', 'tag'])) {
        valuesDoc.setIn(['image', 'tag'], newTag);
        valuesDocUpdated = true;
      } else {
        chartDoc.set('appVersion', newTag);
        chartDocUpdated = true;
      }
    }

    // Only write the files that actually changed
    if (valuesDocUpdated) {
      fs.writeFileSync(valuesYamlPath, String(valuesDoc));
      updatedAnyChart = true;
    }
    if (chartDocUpdated) {
      fs.writeFileSync(chartYamlPath, String(chartDoc));
      updatedAnyChart = true;
    }
  }

  return updatedAnyChart;
}

// Only execute immediately if run directly via Node (e.g., in GitHub Actions)
if (require.main === module) {
  const imageName = process.env.IMAGE_NAME;
  const newTag = process.env.NEW_TAG;
  const workspacePath = process.env.GITHUB_WORKSPACE;

  try {
    const success = updateCharts(imageName, newTag, workspacePath);
    if (!success) console.log(`No charts required updates for '${imageName}'.`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = updateCharts; // Export for Jest
