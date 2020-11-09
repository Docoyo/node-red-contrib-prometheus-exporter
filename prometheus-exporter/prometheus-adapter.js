const PromClient = require('prom-client');
const registry = PromClient.Registry;
const DEFAULT_PROMETHEUS_METRICS_PATH = '/metrics';

let isInitialized = false;

function initialize(RED) {
  RED.log.info('Initializing Prometheus exporter');
  if (process.env.PROMETHEUS_COLLECT_DEFAULT_METRICS) {
    // default metrics
    const collectDefaultMetrics = PromClient.collectDefaultMetrics;
    collectDefaultMetrics({
      timeout: 5000
    });
  }
  // add request handler
  let callback = function (req, res) {
    res.set('Content-Type', PromClient.register.contentType);
    res.end(PromClient.register.metrics());
  };
  let path = process.env.PROMETHEUS_METRICS_PATH || DEFAULT_PROMETHEUS_METRICS_PATH;
  RED.httpNode.get(path, callback);
  RED.log.info(`Prometheus metrics are available at path ${path}`);
  red = RED;
}

module.exports = {
  register: function (RED) {
    if (!isInitialized) {
      initialize(RED);
      isInitialized = true;
    }
  },
  addCounter: function (metricConfig) {
    const counter = new PromClient.Counter(metricConfig);
    red.log.info('Added Prometheus Counter ' + metricConfig.name + ' ' + JSON.stringify(metricConfig, null, 2));
    return counter;
  },
  addGauge: function (metricConfig) {
    const counter = new PromClient.Gauge(metricConfig);
    red.log.info('Added Prometheus Gauge ' + metricConfig.name+ ' ' + JSON.stringify(metricConfig, null, 2));
    return counter;
  },
  removeMetric: function (metricName) {
    registry.globalRegistry.removeSingleMetric(metricName);
    red.log.info('Removed Prometheus metric ' + metricName);
  }
};
