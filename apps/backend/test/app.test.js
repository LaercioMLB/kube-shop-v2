import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { readConfig } from "../src/config.js";

let server, base;
const rows = [];
let database = true;
const state = { initialized: true, shuttingDown: false };
before(async () => {
  const repository = {
    ping: async () => {
      if (!database) throw new Error("offline");
      return true;
    },
    create: async (order) => {
      const row = { ...order, id: String(rows.length + 1) };
      rows.push(row);
      return row;
    },
    list: async () => {
      if (!database) throw new Error("offline");
      return rows;
    },
  };
  const { app } = createApp({
    config: readConfig({}),
    repository,
    logger: () => {},
    state,
  });
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(
  () =>
    new Promise((resolve) => {
      server.closeAllConnections();
      server.close(resolve);
    }),
);

test("catálogo previsível; preços definidos no servidor e request-id propagado", async () => {
  const response = await fetch(`${base}/api/products`, {
    headers: { "x-request-id": "aula-1" },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-request-id"), "aula-1");
  const { products } = await response.json();
  assert.equal(products.length, 6);
  assert.equal(products[0].id, "headphones");
});
test("cria/lista pedido; ignora total adulterado pelo cliente", async () => {
  const response = await fetch(`${base}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ productId: "headphones", quantity: 2 }],
      totalCents: 1,
    }),
  });
  assert.equal(response.status, 201);
  const { order } = await response.json();
  assert.equal(order.totalCents, 37980);
  assert.equal(order.fictional, true);
  assert.equal(
    (await (await fetch(`${base}/api/orders`)).json()).orders[0].id,
    order.id,
  );
});
test("rejeita itens inválidos, duplicados, quantidades fracionárias e JSON malformado", async () => {
  for (const body of [
    {},
    { items: [] },
    { items: [null] },
    { items: [{ productId: "x", quantity: 1 }] },
    { items: [{ productId: "mouse", quantity: 1.5 }] },
    {
      items: [
        { productId: "mouse", quantity: 1 },
        { productId: "mouse", quantity: 1 },
      ],
    },
  ]) {
    assert.equal(
      (
        await fetch(`${base}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      ).status,
      400,
    );
  }
  assert.equal(
    (
      await fetch(`${base}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      })
    ).status,
    400,
  );
});
test("banco indisponível não altera liveness; readiness e pedidos falham sem revelar erro", async () => {
  database = false;
  try {
    assert.equal((await fetch(`${base}/api/health/live`)).status, 200);
    assert.equal((await fetch(`${base}/api/health/ready`)).status, 503);
    const response = await fetch(`${base}/api/orders`);
    assert.equal(response.status, 503);
    assert.equal(
      (await response.json()).error,
      "Serviço temporariamente indisponível.",
    );
  } finally {
    database = true;
  }
});
test("inicialização e desligamento retiram prontidão sem falhar liveness", async () => {
  state.initialized = false;
  assert.equal((await fetch(base + "/api/health/startup")).status, 503);
  assert.equal((await fetch(base + "/api/health/ready")).status, 503);
  state.initialized = true;
  state.shuttingDown = true;
  assert.equal((await fetch(base + "/api/health/ready")).status, 503);
  assert.equal((await fetch(base + "/api/health/live")).status, 200);
  state.shuttingDown = false;
  assert.equal((await fetch(base + "/api/health/ready")).status, 200);
});

test("info retorna versão sem metadados de Kubernetes", async () => {
  const info = await (await fetch(base + "/api/info")).json();
  assert.equal(info.version, "1.0.0");
  assert.ok(info.timestamp);
  assert.equal(info.podName, undefined);
  assert.equal(info.labMode, undefined);
});

test("rotas de métricas e carga não fazem parte da aplicação extraída", async () => {
  for (const route of ["/api/metrics", "/api/lab/cpu", "/nao-existe/123"])
    assert.equal((await fetch(base + route)).status, 404);
});

test("configuração valida credenciais e limites sem incluir segredos no erro", () => {
  assert.throws(() => readConfig({ MONGO_USERNAME: "demo" }), /juntos/);
  assert.throws(() => readConfig({ PORT: "70000" }), /inválido/);
  assert.match(
    readConfig({ MONGO_USERNAME: "u@", MONGO_PASSWORD: "p#" }).mongoUri,
    /u%40:p%23/,
  );
});

test("lê Docker secret e rejeita configurações ambíguas, arquivos vazios ou ausentes", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "kube-shop-secret-"));
  const file = path.join(directory, "password");
  try {
    writeFileSync(file, "p#@ss\n");
    const config = readConfig({ MONGO_USERNAME: "shop", MONGO_PASSWORD_FILE: file });
    assert.match(config.mongoUri, /shop:p%23%40ss@/);
    assert.match(config.mongoUri, /authSource=kubeshop/);
    assert.throws(() => readConfig({ MONGO_USERNAME: "shop", MONGO_PASSWORD: "x", MONGO_PASSWORD_FILE: file }), /apenas um/);
    writeFileSync(file, "\n");
    assert.throws(() => readConfig({ MONGO_USERNAME: "shop", MONGO_PASSWORD_FILE: file }), /vazio/);
    assert.throws(
      () => readConfig({ MONGO_USERNAME: "shop", MONGO_PASSWORD_FILE: path.join(directory, "missing") }),
      /Não foi possível ler/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
