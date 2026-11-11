import express from "express";
import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { products, validateOrder } from "./catalog.js";

export function createApp({
  config,
  repository,
  logger = (entry) => console.log(JSON.stringify(entry)),
  state = { initialized: true, shuttingDown: false },
} = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    const incomingId = req.get("x-request-id") || "";
    req.requestId = /^[a-zA-Z0-9._-]{1,64}$/.test(incomingId) ? incomingId : randomUUID();
    res.set({
      "X-Request-Id": req.requestId,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    });
    const start = performance.now();
    res.on("finish", () => {
      const route = typeof req.route?.path === "string" ? req.route.path : "unmatched";
      if (!route.startsWith("/api/health/")) logger({
        level: "info", event: "http", requestId: req.requestId,
        method: req.method, route, status: res.statusCode,
        durationMs: Math.round(performance.now() - start),
      });
    });
    next();
  });
  app.use(express.json({ limit: "16kb", strict: true }));
  app.get("/api/info", (_req, res) => res.json({
    version: config.version, timestamp: new Date().toISOString(),
  }));
  app.get("/api/products", (_req, res) => res.json({ products }));
  app.get("/api/health/live", (_req, res) => res.json({ alive: true }));
  app.get("/api/health/startup", (_req, res) => res
    .status(state.initialized ? 200 : 503).json({ initialized: state.initialized }));
  app.get("/api/health/ready", async (_req, res) => {
    let database = false;
    try { database = await repository.ping(); } catch { /* Banco indisponível. */ }
    const ready = Boolean(database && state.initialized && !state.shuttingDown);
    res.status(ready ? 200 : 503).json({ ready, database: Boolean(database) });
  });
  app.get("/api/orders", async (_req, res) => res.json({ orders: await repository.list() }));
  app.post("/api/orders", async (req, res) => {
    let order;
    try { order = validateOrder(req.body); } catch (error) {
      return res.status(400).json({ error: error.message, requestId: req.requestId });
    }
    const created = await repository.create({ ...order, createdAt: new Date().toISOString() });
    res.status(201).json({ order: created });
  });
  app.use((_req, res) => res.status(404).json({ error: "Rota não encontrada." }));
  app.use((error, req, res, _next) => {
    const status = error.type === "entity.too.large" ? 413
      : error instanceof SyntaxError && "body" in error ? 400 : 503;
    logger({ level: "error", event: "request_failed", requestId: req.requestId,
      status, errorType: error.name });
    res.status(status).json({
      error: status === 400 ? "JSON inválido." : status === 413
        ? "Corpo da requisição muito grande." : "Serviço temporariamente indisponível.",
      requestId: req.requestId,
    });
  });
  return { app, state };
}
