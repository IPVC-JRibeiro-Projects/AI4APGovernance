import jwt from "jsonwebtoken";
import { config } from "../config.js";

export default async function authRoutes(fastify) {
  fastify.post("/auth/token", async (req, reply) => {
    const apiSecret = req.headers["x-api-secret"];

    if (!apiSecret || apiSecret !== config.apiSecret) {
      return reply.code(401).send({ error: "Invalid API secret" });
    }

    const payload = {
      iss: "email-plugin",
      scope: "plugin",
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    return { token };
  });
}
