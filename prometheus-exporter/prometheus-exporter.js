const _ = require('underscore');

const VALID_OPS = {
  counter: ['inc'],
  gauge: ['inc', 'dec', 'set']
};

const DEFAULT_OPS = {
  counter: 'inc',
  gauge: 'set'
};

module.exports = function (RED) {
  'use strict';

  function PrometheusExporterNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    RED.log.info('Instanciating PrometheusExporterNode ' + this.id);
    this.metricConfig = RED.nodes.getNode(config.metric);
    if (this.metricConfig && this.metricConfig.mtype) {
      this.on('input', function (msg, send, done) {
        let metricLabels = {};
        let metricVal = 1;
        let metricOp = undefined;
        if (msg.payload) {
          // determine operation
          if (msg.payload.op) {
            if (VALID_OPS[this.metricConfig.mtype].includes(msg.payload.op)) {
              metricOp = msg.payload.op;
            } else {
              // RED.log.info('Invalid Operation: ' + metricOp);
              done('Invalid operation for metric specified: ' + msg.payload.op);
              return;
            }
          } else {
            // apply default operation of the metric type if no op is given
            metricOp = DEFAULT_OPS[this.metricConfig.mtype];
          }
          // apply specific value
          if (Number.isInteger(msg.payload.val)) {
            metricVal = msg.payload.val;
          } else {
            // no value is only allowed for counter
            if (this.metricConfig.mtype !== 'counter') {
              done('Missing val for metric type ' + this.metricConfig.mtype);
            }
          }
          // apply labels
          if (msg.payload.labels) {
            metricLabels = msg.payload.labels;
          }
          // update metric
          this.metricConfig.prometheusMetric[metricOp](metricLabels, metricVal);
        } else {
          // no payload is only allowed for counter
          if (this.metricConfig.mtype === 'counter') {
            // apply default operation of the metric type if no payload is given
            metricOp = DEFAULT_OPS[this.metricConfig.mtype];
            this.metricConfig.prometheusMetric[metricOp]();
          } else {
            // RED.log.info('Missing payload for metric type ' + this.metricConfig.mtype);
            done('Missing payload for metric type ' + this.metricConfig.mtype);
            return;

          }
        }
        done();
      });
    } else {
      this.error('Missing metric configuration');
    }

  }

  RED.nodes.registerType('prometheus-exporter', PrometheusExporterNode);
};
