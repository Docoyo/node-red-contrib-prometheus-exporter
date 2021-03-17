# node-red-contrib-prometheus-exporter
A NodeRED node which allows exporting Prometheus metrics from within flows.

Using this node for NodeRED, you can define your own Prometheus metrics which will become available over an HTTP endpoint. The endpoint can be polled from a Prometheus agent or Telegraf.

Supported metric types:

* Counter
* Gauge

Labels are supported for both metric types.

## How to install

The preferred way of installing the node is to use the Palette Manager in NodeRED. Just seek for `node-red-contrib-prometheus-exporter` and follow the instructions.

Alternatively, you can also manually install the node permanently into your embedded NodeRED application with npm:

```bash
npm install node-red-contrib-prometheus-exporter
```

## How to use

### Configure a metric

From the Palette Manager, pull the node "prometheus out" in the __network__ section into your flow.

In the editor of the metric node, create a new metric by clicking the pencil button next to the "Metric" drop down box. The config node editor will fire up.

In the config node editor, define the metric as you like. Name, help, and metric type are mandatory. Label names are optional. To learn more about Prometheus metrics, please refer to the [Prometheus documentation](https://prometheus.io/docs/concepts/metric_types/).

### Using the metric in a flow

After you have defined the metric, you can now feed the metric with values to actually populate the metrics output.

The node expects a `message.payload` as input with the following structure:

```json
{
    "op": "inc",
    "val": 5,
    "labels": {
        "tag_1": "computer_123"
    }
}
```

Choose the `op` property from one of the following values:

* For metrics of type __Counter__:
  * `inc` - Increases the counter by `val` (without specifying `val`, defaults to `1`)
* For metrics of type __Gauge__:
  * `set` - Sets the gauge to `val` (which is mandatory for this operation)
  * `inc` - Increases the gauge by `val` (without specifying `val`, defaults to `1`)
  * `dec` - Decreases the gauge by `val` (without specifying `val`, defaults to `1`)

As described above, the `val` property is mandatory or optional depending on the selected `op` and the metric type.

Labels are always optional. Make sure, you only use label keys, which you have defined in the configuration of the node as "Labels".

### Check the metrics output

Deploy the flow, open up the browser and access the `/metrics` endpoint of your NodeRED server.

The output should look like this:

```
# HELP example_counter This is an example Counter
# TYPE example_counter counter
example_counter 10

# HELP example_gauge This is an example Gauge
# TYPE example_gauge gauge
example_gauge{tag_1="computer_123"} 5
example_gauge 5
```

### Changing the path

You can manually change the path under which the metrics are exposed. Just set the environment variable `PROMETHEUS_METRICS_PATH` to a path of your choice.

### Expose default metrics

You can easily collect and expose a useful set of pre-defined metrics about the node.js process hosting the NodeRED environment. These metrics are disabled by default, but you can activate them by setting the environment variable `PROMETHEUS_COLLECT_DEFAULT_METRICS` to `true`.

## License

This library is licensed under Apache 2.0.

## Credits

[NodeRED](https://nodered.org) is an awsome and carefully-written low-code environment for node.js. This library has been written and tested against NodeRED v1.2.

Under the hood, this library is built on top of the [prom-client](https://github.com/siimon/prom-client), a mature Prometheus client for node.js.

This project is sponsored by [docoyo](https://www.docoyo.com).
