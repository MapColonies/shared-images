const mock = require('mock-fs');
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const updateCharts = require('./update-chart');

describe('updateCharts script', () => {
  const workspacePath = '/fake/workspace';

  afterEach(() => {
    mock.restore();
  });

  test('if there are no dependencies, should update image.tag', () => {
    // Arrange
    mock({
      '/fake/workspace/helm-charts/charts/grafana': {
        'Chart.yaml': `
            name: grafana
            appVersion: 1.0.0
        `,
        'values.yaml': `
            image:
              tag: 1.0.0
        `,
      },
    });

    // Act
    const result = updateCharts('grafana', 'v2.0.0', workspacePath);

    const values = YAML.parse(fs.readFileSync('/fake/workspace/helm-charts/charts/grafana/values.yaml', 'utf8'));
    const chart = YAML.parse(fs.readFileSync('/fake/workspace/helm-charts/charts/grafana/Chart.yaml', 'utf8'));
    // Assert
    expect(result).toBe(true);
    expect(values.image.tag).toBe('v2.0.0');
    expect(chart.appVersion).toBe('1.0.0');
  });

  test('if there are no dependencies and no tag in values, should update appVersion', () => {
    // Arrange
    mock({
      '/fake/workspace/helm-charts/charts/my-app': {
        'Chart.yaml': `
            name: my-app
            appVersion: 1.0.0
        `,
        'values.yaml': `# empty`,
      },
    });

    // Act
    const result = updateCharts('my-app', 'v2.0.0', workspacePath);

    const chart = YAML.parse(fs.readFileSync('/fake/workspace/helm-charts/charts/my-app/Chart.yaml', 'utf8'));
    const values = YAML.parse(fs.readFileSync('/fake/workspace/helm-charts/charts/my-app/values.yaml', 'utf8'));
    // Assert
    expect(result).toBe(true);
    expect(chart.appVersion).toBe('v2.0.0');
    expect(values).toEqual(null); // Ensure values.yaml remains unchanged
  });

  test('if image name matches a dependency, should update dependency tag', () => {
    // Arrange
    mock({
      '/fake/workspace/helm-charts/charts/bla': {
        'Chart.yaml': `
            name: bla
            version: 1.0.0
            appVersion: 1.0.0
            dependencies:
              - name: sftpgo-node-exporter
                version: 1.0.0
              - name: sftpgo
                version: 1.0.0
        `,
        'values.yaml': `
            sftpgo-node-exporter:
              image:
                  tag: "old-tag"
            sftpgo:
              image:
                tag: "old-tag"
        `,
      },
    });

    // Act
    const result = updateCharts('sftpgo-node-exporter', 'v2.0.0', workspacePath);

    const values = YAML.parse(fs.readFileSync('/fake/workspace/helm-charts/charts/bla/values.yaml', 'utf8'));
    const chart = YAML.parse(fs.readFileSync('/fake/workspace/helm-charts/charts/bla/Chart.yaml', 'utf8'));
    // Assert
    expect(result).toBe(true);
    expect(values['sftpgo-node-exporter'].image.tag).toBe('v2.0.0');
    expect(values.sftpgo.image.tag).toBe('old-tag');
    expect(chart.appVersion).toBe('1.0.0');
  });

  test('if image name matches both dependency and chart name, should update only dependency tag', () => {
    // Arrange
    mock({
      '/fake/workspace/helm-charts/charts/sftpgo': {
        'Chart.yaml': `
            name: sftpgo
            version: 1.0.0
            appVersion: "1.0.0"
            dependencies:
              - name: sftpgo-node-exporter
                version: 1.0.0
              - name: sftpgo
                version: 1.0.0
        `,
        'values.yaml': `
            sftpgo-node-exporter:
              image:
                tag: "old-tag"
            sftpgo:
              image:
                tag: "old-tag"
        `,
      },
    });

    // Act
    const result = updateCharts('sftpgo', 'v2.0.0', workspacePath);

    const values = YAML.parse(fs.readFileSync('/fake/workspace/helm-charts/charts/sftpgo/values.yaml', 'utf8'));
    const chart = YAML.parse(fs.readFileSync('/fake/workspace/helm-charts/charts/sftpgo/Chart.yaml', 'utf8'));
    // Assert
    expect(result).toBe(true);
    expect(values['sftpgo'].image.tag).toBe('v2.0.0');
    expect(values['sftpgo-node-exporter'].image.tag).toBe('old-tag');
    expect(chart.appVersion).toBe('1.0.0');
  });

  test('if image name matches a dependency and no tag in values, should update root appVersion', () => {
    // Arrange
    mock({
      '/fake/workspace/helm-charts/charts/sftpgo': {
        'Chart.yaml': `
          name: sftpgo
          version: 1.0.0
          appVersion: "1.0.0"
          dependencies:
            - name: sftpgo-node-exporter
              version: 1.0.0
        `,
        'values.yaml': `
          sftpgo:
            image:
              tag: "old-tag"
        `,
      },
    });

    // Act
    const result = updateCharts('sftpgo-node-exporter', 'v2.0.0', workspacePath);

    const chart = YAML.parse(fs.readFileSync('/fake/workspace/helm-charts/charts/sftpgo/Chart.yaml', 'utf8'));
    const values = YAML.parse(fs.readFileSync('/fake/workspace/helm-charts/charts/sftpgo/values.yaml', 'utf8'));
    // Assert
    expect(result).toBe(true);
    expect(chart.appVersion).toBe('v2.0.0');
    expect(values.sftpgo.image.tag).toBe('old-tag');
  });

  test('if image name matches more than one dependency, should update all matching dependency tags', () => {
    // Arrange
    mock({
      '/fake/workspace/helm-charts/charts/sftpgo': {
        'Chart.yaml': `
          name: sftpgo
          version: 1.0.0
          appVersion: "1.0.0"
          dependencies:
            - name: sftpgo-node-exporter
              version: 1.0.0
        `,
        'values.yaml': `
          sftpgo-node-exporter:
            image:
              tag: "old-tag"
        `,
      },
      '/fake/workspace/helm-charts/charts/grafana': {
        'Chart.yaml': `
          name: grafana
          version: 1.0.0
          appVersion: "1.0.0"
          dependencies:
            - name: sftpgo-node-exporter
              version: 1.0.0
        `,
        'values.yaml': `
          sftpgo-node-exporter:
            image:
              tag: "old-tag"
        `,
      },
    });

    // Act
    const result = updateCharts('sftpgo-node-exporter', 'v2.0.0', workspacePath);

    const sftpgoChart = YAML.parse(fs.readFileSync('/fake/workspace/helm-charts/charts/sftpgo/Chart.yaml', 'utf8'));
    const sftpgoValues = YAML.parse(fs.readFileSync('/fake/workspace/helm-charts/charts/sftpgo/values.yaml', 'utf8'));
    const grafanaChart = YAML.parse(fs.readFileSync('/fake/workspace/helm-charts/charts/grafana/Chart.yaml', 'utf8'));
    const grafanaValues = YAML.parse(fs.readFileSync('/fake/workspace/helm-charts/charts/grafana/values.yaml', 'utf8'));
    // Assert
    expect(result).toBe(true);
    expect(sftpgoChart.appVersion).toBe('1.0.0');
    expect(sftpgoValues['sftpgo-node-exporter'].image.tag).toBe('v2.0.0');
    expect(grafanaChart.appVersion).toBe('1.0.0');
    expect(grafanaValues['sftpgo-node-exporter'].image.tag).toBe('v2.0.0');
  });

  test('if image name does not match any chart or dependency, should not update anything', () => {
    // Arrange
    mock({
      '/fake/workspace/helm-charts/charts/grafana': {
        'Chart.yaml': `
            name: grafana
            appVersion: 1.0.0
        `,
        'values.yaml': `
            image:
              tag: 1.0.0
        `,
      },
    });

    // Act
    const result = updateCharts('non-existent-image', 'v2.0.0', workspacePath);

    const chart = YAML.parse(fs.readFileSync('/fake/workspace/helm-charts/charts/grafana/Chart.yaml', 'utf8'));
    const values = YAML.parse(fs.readFileSync('/fake/workspace/helm-charts/charts/grafana/values.yaml', 'utf8'));
    // Assert
    expect(result).toBe(false);
    expect(chart.appVersion).toBe('1.0.0');
    expect(values.image.tag).toBe('1.0.0');
  });
});
