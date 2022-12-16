import { FastifyInstance } from "fastify";
import { FastifyReply, FastifyRequest } from "fastify";
import { execAll, findDevice } from '../db/index.js';
import { responseDevicesShema, responseStateShema, queryStringGetStateSchema } from '../definitions/devices';
import { FindState } from '../db/metrics';

async function devicesRoutes(fastify: FastifyInstance) {
  fastify.get('/devices', {
    schema: {
      response: {
        200: responseDevicesShema
      }
    }
  },async function (request: FastifyRequest, reply: FastifyReply) {
    const devices = await execAll('SELECT * FROM devices;')

    reply
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({ devices });
  });

  fastify.get('/devices/:id/state', {
    schema: {
      querystring: queryStringGetStateSchema,
      response: {
        200: responseStateShema
      }
    }
  }, async function (request: FastifyRequest<{Params: { id: string }, Querystring: { from: string, to: string}}>, reply: FastifyReply) {
    const device = await findDevice(request.params.id)
    if (!device) {
      return reply.code(404).send({ device: 'Device not found' });
    }
    
    const { from, to } = request.query;

    const states = await FindState({
      from,
      to,
      deviceId: device.id
    });

    reply
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({ states });
  })
}

export default devicesRoutes;
