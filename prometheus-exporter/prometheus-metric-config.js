module.exports = function (RED) {
  'use strict';
  const exporter = require('./prometheus-adapter');
  const PromClient = require('prom-client');
  const Registry = PromClient.Registry;

  function PrometheusMetricConfigNode(config) {
    RED.nodes.createNode(this, config);
    let node = this;
    RED.log.info('Instanciating PrometheusMetricConfigNode ' + config.name);

    node.name = config.name;
    node.help = config.help;
    node.labels = config.labels;
    node.mtype = config.mtype;

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
    if (node.mtype === 'counter') {
      let metricConfig = {
        name: node.name,
        help: node.help,
        labelNames: labelsList
      };
      return exporter.addCounter(metricConfig);
    }
    if (node.mtype === 'gauge') {
      let metricConfig = {
        name: node.name,
        help: node.help,
        labelNames: labelsList
      };
      return exporter.addGauge(metricConfig);
    }
  }

  RED.nodes.registerType('prometheus-metric-config', PrometheusMetricConfigNode);
};
