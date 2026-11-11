import { readFileSync } from "node:fs";

function integer(value, fallback, min, max, name) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max)
    throw new Error(name + " inválido");
  return parsed;
}

export function readConfig(env = process.env) {
  const user = env.MONGO_USERNAME;
  let password = env.MONGO_PASSWORD;
  if (password && env.MONGO_PASSWORD_FILE)
    throw new Error("Use MONGO_PASSWORD ou MONGO_PASSWORD_FILE, apenas um");
  if (env.MONGO_PASSWORD_FILE) {
    try { password = readFileSync(env.MONGO_PASSWORD_FILE, "utf8").trim(); }
    catch { throw new Error("Não foi possível ler MONGO_PASSWORD_FILE"); }
    if (!password) throw new Error("MONGO_PASSWORD_FILE está vazio");
  }
  if (Boolean(user) !== Boolean(password))
    throw new Error("Informe usuário e senha MongoDB juntos");
  const database = env.MONGO_DATABASE || "kubeshop";
  if (!/^[a-zA-Z0-9_-]+$/.test(database))
    throw new Error("MONGO_DATABASE inválido");
  const host = env.MONGO_HOST || "127.0.0.1";
  if (!/^[a-zA-Z0-9.-]+$/.test(host)) throw new Error("MONGO_HOST inválido");
  const mongoPort = integer(env.MONGO_PORT, 27017, 1, 65535, "MONGO_PORT");
  const credentials = user
    ? encodeURIComponent(user) + ":" + encodeURIComponent(password) + "@" : "";
  return {
    port: integer(env.PORT, 3000, 0, 65535, "PORT"),
    host: env.HOST || "0.0.0.0",
    database,
    mongoUri: env.MONGODB_URI ||
      "mongodb://" + credentials + host + ":" + mongoPort + "/" + database +
      "?authSource=" + encodeURIComponent(env.MONGO_AUTH_SOURCE || database),
    version: env.APP_VERSION || "1.0.0",
  };
}
