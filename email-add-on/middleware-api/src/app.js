import Fastify from "fastify";
import { config } from "./config.js";
import fastifyCors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";

import authRoutes from "./routes/auth.js";
import { verifyJWT } from "./utils/jwtAuth.js";
import implementacaoRoutes from "./routes/implementacao.js";
import categoriaRoutes from "./routes/categoria.js";
import keywordRoutes from "./routes/keyword.js";
import emailRoutes from "./routes/email.js";

const fastify = Fastify({
  logger: true,
  connectionTimeout: 10000,
  bodyLimit: 1048576,
});

// CORS
fastify.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-secret"],
});

// Rate limit for auth
fastify.register(rateLimit, {
  max: 5,             // máximo de requests
  timeWindow: "1 minute", // por minuto
  keyGenerator: (request) => {
    return request.ip; // limita por IP
  },
  allowList: [],
  errorResponseBuilder: (req, context) => {
    return {
      statusCode: 429,
      error: "Too Many Requests"
    };
  },
});

// Public routes
fastify.register(authRoutes, { prefix: "/api/plugin" });

// Protected routes
fastify.register(async (fastify) => {
  fastify.addHook("onRequest", verifyJWT);
  fastify.register(implementacaoRoutes);
  fastify.register(categoriaRoutes);
  fastify.register(keywordRoutes);
  fastify.register(emailRoutes);
}, { prefix: "/api/plugin" });

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  reply.code(500).send({ error: "Internal Server Error" });
});

const start = async () => {
  try {
    await fastify.listen({ port: config.port, host: "0.0.0.0" });
    fastify.log.info(`API listening on ${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
