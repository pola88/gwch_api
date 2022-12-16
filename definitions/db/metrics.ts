import { MetricPost } from '../metrics.js';

export type Metric = {
  id: number;
  device_id: number;
  metric_name: string;
  fromts: string
  tots: string;
  avg: number;
  max: number;
  min: number;
};

export type FindStateParams = {
  deviceId: number;
  from: string;
  to: string;
};

export type FindAndParseMetricsParams = MetricPost & {deviceId: number};

export type State = {
  state: string;
  from: string;
  to: string;
};