export const responseDevicesShema = {
  type: 'object',
  properties: {
    devices: {
      type: 'array',
      items: {
        type: 'object',
        required:  ['id', 'name'],
        properties: {
          id: { type: 'number' },
          name: { type: 'string' }
        }
      }
    }
  }
};

export const responseStateShema = {
  type: 'object',
  properties: {
    states: {
      type: 'array',
      items: {
        type: 'object',
        required:  ['state', 'from', 'to'],
        properties: {
          state: { type: 'string' },
          from: { type: 'string' },
          to: { type: 'string' }
        }
      }
    }
  }
}
export const queryStringGetStateSchema = {
  type: 'object',
  properties: {
    from: { type: 'string' },
    to: {type: 'string'}
  }
};
