module.exports = function (RED) {
  'use strict';
  const exporter = require('./prometheus-adapter');

  function PrometheusMetricConfigNode(config) {
    RED.nodes.createNode(this, config);
    let node = this;
    RED.log.info('Instanciating PrometheusMetricConfigNode ' + config.name);

    node.name = config.name;
    node.help = config.help;
    node.labels = config.labels;
    node.mtype = config.mtype;
    node.buckets = config.buckets;
    node.percentiles = config.percentiles;
    node.maxAgeSeconds = config.maxAgeSeconds;
    node.ageBuckets = config.ageBuckets;
    node.compressCount = config.compressCount;

    if (RED.settings.httpNodeRoot !== false) {
      exporter.init(RED);
      node.prometheusMetric = registerMetric(node);
    }

    this.on('close', function () {
      RED.log.info('Closing PrometheusMetricConfigNode ' + config.name);
      try {
        exporter.removeMetric(node.name);
      } catch (error) {
        RED.log.error(error);
      }
    });
  }

  function registerMetric(node) {
    RED.log.info('PrometheusMetricConfigNode.registerMetric ' + node.name);
    let labelsList = [];
    if (node.labels) {
      let splitLabels = node.labels.split(',');
      labelsList = splitLabels.map((item) => item.trim());
    }
    let metricConfig = {
      name: node.name,
      help: node.help,
      labelNames: labelsList
    };
    switch (node.mtype) {
      case 'counter':
        return exporter.addCounter(metricConfig);
      case 'gauge':
        return exporter.addGauge(metricConfig);
      case 'histogram':
        if (node.buckets) {
          let splitBuckets = node.buckets.split(',');
          metricConfig.buckets = splitBuckets.map((item) => Number(item.trim()));
        }
        return exporter.addHistogram(metricConfig);
      case 'summary':
        if (node.percentiles) {
          let splitPercentiles = node.percentiles.split(',');
          metricConfig.percentiles = splitPercentiles.map((item) => Number(item.trim()));
        }
        if (node.maxAgeSeconds) {
          metricConfig.maxAgeSeconds = Number(node.maxAgeSeconds);
        }
        if (node.ageBuckets) {
          metricConfig.ageBuckets = Number(node.ageBuckets);
        }
        if (node.compressCount) {
          metricConfig.compressCount = Number(node.compressCount);
        }
        return exporter.addSummary(metricConfig);
      default:
        RED.log.error('Invalid metric type ' + node.mtype);
        return;
    }
  }

  RED.nodes.registerType('prometheus-metric-config', PrometheusMetricConfigNode);
};
