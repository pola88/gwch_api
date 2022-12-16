import Fastify, { FastifyInstance } from "fastify";
import cors from '@fastify/cors';
import devicesRoutes from "./routes/devices";
import metricsRoutes from "./routes/metrics";
// import { loadData } from './db/index.js';

const fastify: FastifyInstance = Fastify({
  logger: {
    serializers: {
      res(reply) {
        return {
          statusCode: reply.statusCode,
        };
      },
      req(request) {
        return {
          method: request.method,
          url: request.url,
        };
      },
    },
  },
});

fastify.register(cors);
fastify.register(devicesRoutes);
fastify.register(metricsRoutes, { prefix: '/devices/:id'});

const start = async () => {
  try {
    // await loadData();
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();