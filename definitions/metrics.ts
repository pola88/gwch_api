export type MetricPost = {
  from: string,
  to: string
  metrics: {
    [key: string]: string[]
  }
};

export const paramSchema = {
  type: 'object',
  additionalProperties: false,
  required: [ 'id' ],
  properties: { id: { type: 'string'} }
};

export const bodySchema = {
  type: 'object',
  additionalProperties: true,
  required: [ 'from', 'to' ],
  properties: {
    from: { type: 'string'},
    to: { type: 'string'},
  }
};

export const responseShema = {
  metrics: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number'},
        device_id: { type: 'number'},
        metric_name: { type: 'string'},
        fromts: { type: 'string'},
        tots: { type: 'string'},
        avg: { type: 'number'},
        max: { type: 'number'},
        min: { type: 'number'}
      }
    }
  }
}
