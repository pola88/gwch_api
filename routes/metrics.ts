import { FastifyInstance } from "fastify";
import { FastifyReply, FastifyRequest } from "fastify";
import { findDevice } from '../db/index.js';
import { FindAndParseMetrics } from '../db/metrics';
import { MetricPost, paramSchema, responseShema, bodySchema } from '../definitions/metrics';

declare module 'fastify' {
  interface FastifyRequest {
    device: {
      id: number,
      name: string
    }
  }
}

async function metricRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', async (request: FastifyRequest<{Params: { id: string }}>, reply: FastifyReply) => {
    const device = await findDevice(request.params.id)
    if (!device) {
      return reply.code(404).send({ device: 'Device not found' });
    }

    request.device = device;
  })

  fastify.post('/metrics', { schema: { body: bodySchema, params: paramSchema, response: { 200: responseShema }} }, async function (request: FastifyRequest, reply: FastifyReply) {
    const { from, to, metrics } = request.body as MetricPost;
    const allMetrics = await FindAndParseMetrics({
      from,
      to,
      metrics,
      deviceId: request.device.id
    });

    return reply
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({ metrics: allMetrics });
  })
}

export default metricRoutes;
