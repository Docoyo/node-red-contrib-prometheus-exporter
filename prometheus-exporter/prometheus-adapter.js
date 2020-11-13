const client = require('prom-client');
const Registry = client.Registry;
const DEFAULT_PROMETHEUS_METRICS_PATH = '/metrics';

let isInitialized = false;
let customRegistry = new Registry();

function initialize(RED) {
  RED.log.info('Initializing Prometheus exporter');
  if (process.env.PROMETHEUS_COLLECT_DEFAULT_METRICS) {
    // default metrics
    try {
      client.collectDefaultMetrics({register: customRegistry});
    } catch (error) {
      RED.log.error(error);
    }
  }
  // add request handler
  let callback = function (req, res) {
    res.set('Content-Type', customRegistry.contentType);
    res.end(customRegistry.metrics());
  };
  let path = process.env.PROMETHEUS_METRICS_PATH || DEFAULT_PROMETHEUS_METRICS_PATH;
  RED.httpNode.get(path, callback);
  RED.log.info(`Prometheus metrics are available at path ${path}`);
  red = RED;
}

module.exports = {
  init: function (RED) {
    if (!isInitialized) {
      initialize(RED);
      isInitialized = true;
    }
  },
  addCounter: function (metricConfig) {
    const metric = new client.Counter(metricConfig);
    customRegistry.registerMetric(metric);
    red.log.info('Added Prometheus Counter ' + metricConfig.name + ' ' + JSON.stringify(metricConfig, null, 2));
    return metric;
  },
  addGauge: function (metricConfig) {
    const metric = new client.Gauge(metricConfig);
    customRegistry.registerMetric(metric);
    red.log.info('Added Prometheus Gauge ' + metricConfig.name+ ' ' + JSON.stringify(metricConfig, null, 2));
    return metric;
  },
  removeMetric: function (metricName) {
    customRegistry.removeSingleMetric(metricName);
    red.log.info('Removed Prometheus metric ' + metricName);
  },
  getRegistry: function() {
    return customRegistry;
  }
};
