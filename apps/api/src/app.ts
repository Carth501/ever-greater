import {
  LoginRequest,
  PrintTicketRequest,
  RegisterRequest,
} from "@ever-greater/contracts";
import cors from "@fastify/cors";
import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { AuthService } from "./modules/auth/auth-service.js";
import { EconomyService } from "./modules/economy/economy-service.js";

interface EventQuery {
  token?: string;
}

function extractBearerToken(request: FastifyRequest): string | undefined {
  const authorization = request.headers.authorization;
  if (!authorization) {
    return undefined;
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    return undefined;
  }

  return token;
}

function sendUnauthorized(reply: FastifyReply): FastifyReply {
  return reply.status(401).send({ error: "Unauthorized" });
}

export function buildServer(): FastifyInstance {
  const app = Fastify();
  const authService = new AuthService();
  const economyService = new EconomyService();
  const eventClients = new Set<FastifyReply>();

  const broadcastSnapshot = (userId: string): void => {
    const snapshot = economyService.getSnapshot(userId);
    const payload = `event: game_snapshot\ndata: ${JSON.stringify({ type: "game_snapshot", payload: snapshot })}\n\n`;

    for (const client of eventClients) {
      try {
        client.raw.write(payload);
      } catch {
        eventClients.delete(client);
      }
    }
  };

  app.register(cors, {
    origin: true,
  });

  app.post<{ Body: RegisterRequest }>(
    "/auth/register",
    async (request, reply) => {
      try {
        const { email, password } = request.body;
        const session = authService.register(email, password);
        economyService.ensureUser(session.userId);

        return reply.send({
          token: session.sessionId,
          userId: session.userId,
        });
      } catch (error) {
        return reply.status(400).send({ error: (error as Error).message });
      }
    },
  );

  app.post<{ Body: LoginRequest }>("/auth/login", async (request, reply) => {
    try {
      const { email, password } = request.body;
      const session = authService.login(email, password);
      economyService.ensureUser(session.userId);

      return reply.send({
        token: session.sessionId,
        userId: session.userId,
      });
    } catch (error) {
      return reply.status(401).send({ error: (error as Error).message });
    }
  });

  app.get("/auth/me", async (request, reply) => {
    const token = extractBearerToken(request);
    if (!token) {
      return sendUnauthorized(reply);
    }

    const user = authService.getUserBySession(token);
    if (!user) {
      return sendUnauthorized(reply);
    }

    return reply.send(user);
  });

  app.get("/game/snapshot", async (request, reply) => {
    const token = extractBearerToken(request);
    if (!token) {
      return sendUnauthorized(reply);
    }

    const user = authService.getUserBySession(token);
    if (!user) {
      return sendUnauthorized(reply);
    }

    return reply.send(economyService.getSnapshot(user.userId));
  });

  app.post<{ Body: PrintTicketRequest }>(
    "/game/print-ticket",
    async (request, reply) => {
      const token = extractBearerToken(request);
      if (!token) {
        return sendUnauthorized(reply);
      }

      const user = authService.getUserBySession(token);
      if (!user) {
        return sendUnauthorized(reply);
      }

      try {
        const result = economyService.printTicket(
          user.userId,
          request.body.actionId,
          Date.now(),
        );
        broadcastSnapshot(user.userId);
        return reply.send(result);
      } catch (error) {
        return reply.status(400).send({ error: (error as Error).message });
      }
    },
  );

  app.get<{ Querystring: EventQuery }>("/events", async (request, reply) => {
    const token = request.query.token;
    if (!token) {
      return sendUnauthorized(reply);
    }

    const user = authService.getUserBySession(token);
    if (!user) {
      return sendUnauthorized(reply);
    }

    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.flushHeaders();

    eventClients.add(reply);
    const initial = economyService.getSnapshot(user.userId);
    reply.raw.write(
      `event: game_snapshot\ndata: ${JSON.stringify({ type: "game_snapshot", payload: initial })}\n\n`,
    );

    request.raw.on("close", () => {
      eventClients.delete(reply);
    });
  });

  return app;
}
