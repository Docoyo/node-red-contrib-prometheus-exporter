const client = require('prom-client');
const Registry = client.Registry;
const DEFAULT_PROMETHEUS_METRICS_PATH = '/metrics';

let isInitialized = false;
let customRegistry = new Registry();
let red;

function initialize(RED) {
  RED.log.info('Initializing Prometheus exporter');
  if (process.env.PROMETHEUS_COLLECT_DEFAULT_METRICS) {
    // default metrics
    try {
      client.collectDefaultMetrics({ register: customRegistry });
    } catch (error) {
      RED.log.error(error);
    }
  }
  // add request handler
  let callback = async function (req, res) {
    res.set('Content-Type', customRegistry.contentType);
    res.end(await customRegistry.metrics());
  };
  let path = process.env.PROMETHEUS_METRICS_PATH || DEFAULT_PROMETHEUS_METRICS_PATH;
  RED.httpNode.get(path, callback);
  RED.log.info(`Prometheus metrics are available at path ${path}`);
  red = RED;
}

module.exports = {
  init: function (RED) {
    if (!isInitialized) {
      isInitialized = true;
      initialize(RED);
    }
  },
  addCounter: function (metricConfig) {
    metricConfig.registers = [customRegistry];
    if (customRegistry._metrics[metricConfig.name]) {
      const metric = customRegistry._metrics[metricConfig.name];
      red.log.info('Reusing Prometheus Counter ' + metricConfig.name);
      return metric;
    } else {
      const metric = new client.Counter(metricConfig);
      red.log.info('Added Prometheus Counter ' + metricConfig.name);
      return metric;
    }
  },
  addGauge: function (metricConfig) {
    metricConfig.registers = [customRegistry];
    if (customRegistry._metrics[metricConfig.name]) {
      const metric = customRegistry._metrics[metricConfig.name];
      red.log.info('Reusing Prometheus Gauge ' + metricConfig.name);
      metric.reset();
      return metric;
    } else {
      const metric = new client.Gauge(metricConfig);
      red.log.info('Added Prometheus Gauge ' + metricConfig.name);
      return metric;
    }
  },
  addHistogram: function (metricConfig) {
    metricConfig.registers = [customRegistry];
    if (customRegistry._metrics[metricConfig.name]) {
      const metric = customRegistry._metrics[metricConfig.name];
      red.log.info('Reusing Prometheus Histogram ' + metricConfig.name);
      metric.reset();
      return metric;
    } else {
      const metric = new client.Histogram(metricConfig);
      red.log.info('Added Prometheus Histogram ' + metricConfig.name);
      return metric;
    }
  },
  addSummary: function (metricConfig) {
    metricConfig.registers = [customRegistry];
    if (customRegistry._metrics[metricConfig.name]) {
      const metric = customRegistry._metrics[metricConfig.name];
      red.log.info('Reusing Prometheus Summary ' + metricConfig.name);
      metric.reset();
      return metric;
    } else {
      const metric = new client.Summary(metricConfig);
      red.log.info('Added Prometheus Summary ' + metricConfig.name);
      return metric;
    }
  },
  removeMetric: function (metricName) {
    customRegistry.removeSingleMetric(metricName);
    red.log.info('Removed Prometheus metric ' + metricName);
  },
  getRegistry: function () {
    return customRegistry;
  }
};
