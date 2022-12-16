import { execAll } from '../db/index.js';
import { FindAndParseMetricsParams, FindStateParams,
         Metric, State } from '../definitions/db/metrics.js';


export const FindAndParseMetrics = async ({deviceId, from, to, metrics}: FindAndParseMetricsParams): Promise<Metric[]> => {
  const metricsName = Object.keys(metrics);
  const placeholders = metricsName.map(() => "?").join(",");

  const allMetrics: Metric[] = await execAll(`
      SELECT * FROM metrics
      WHERE device_id = ?
        AND metric_name IN (${placeholders})
        AND fromts >= ?
        AND tots <= ?
        order by fromts;`
    , [deviceId, ...metricsName, from, to]);

  return allMetrics;
};

const getOperatingLoad = async (deviceId: number, from: string): Promise<number> => {
  const fromDate = new Date(from);
  const yesterday: Date = new Date();
  yesterday.setDate(fromDate.getDate() - 1);
  
  const allMetrics: Metric[] = await execAll(`
      SELECT * FROM metrics
      WHERE device_id = ?
        AND metric_name = 'Psum'
        AND DATE(fromts) = DATE(?)
        ORDER BY avg DESC
        LIMIT 10;`
  , [deviceId, yesterday.toISOString()]);

  let avg = 0 ;
  for (const metric of allMetrics) {
    avg += metric.avg;
  }

  return avg !== 0 ? avg / allMetrics.length : avg;
};

const calculateState = (metric: Metric, operatingLoad: number): string => {
  const { avg } = metric;
  if (avg === 0 || !metric.avg) {
    return 'OFF';
  }
  if (avg <= 100) {
    return 'On - unloaded';
  }

  if (avg <= (operatingLoad * 0.2)) {
    return 'On - idle';
  }

  return 'On - loaded';
}

export const FindState = async (params: FindStateParams): Promise<State[]> => {
  const { deviceId, from, to } = params;
  const allMetrics: Metric[] = await execAll(`
      SELECT * FROM metrics
      WHERE device_id = ?
        AND metric_name = 'Psum'
        AND fromts >= ?
        AND tots <= ?
        order by fromts;`
  , [deviceId, from, to]);

  const operatingLoad: number = await getOperatingLoad(deviceId, from);

  const states: State[] = [];
  let currentState: State | null = null;
  for (const metric of allMetrics) {
    const metricState: string = calculateState(metric, operatingLoad);
    if (!currentState) {
      currentState = {
         state: metricState,
         from: metric.fromts,
         to: metric.tots
      }
    } else if(currentState.state !== metricState) {
      states.push(currentState);
      currentState = {
         state: metricState,
         from: metric.fromts,
         to: metric.tots
      }
    } else {
      currentState.to = metric.tots;
    }
  }

  if (currentState) states.push(currentState);

  return states;
};