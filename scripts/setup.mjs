import { randomBytes } from 'node:crypto';
import { mkdir, writeFile, readFile, chmod, copyFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const secrets = path.join(root, '.secrets');
await mkdir(secrets, { recursive: true, mode: 0o700 });
if (process.platform !== 'win32') await chmod(secrets, 0o700);
for (const name of ['mongo-app-password', 'mongo-root-password']) {
  const target = path.join(secrets, name);
  try {
    // O diretório privado protege os arquivos no host; a API lê o arquivo montado com UID 1000.
    await writeFile(target, randomBytes(32).toString('hex') + '\n', { flag: 'wx', mode: 0o644 });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    if (!(await readFile(target, 'utf8')).trim()) throw new Error('Segredo vazio: ' + name);
  }
}
try {
  await copyFile(path.join(root, '.env.example'), path.join(root, '.env'), constants.COPYFILE_EXCL);
} catch (error) { if (error.code !== 'EEXIST') throw error; }
console.log('Configuração pronta. Senhas e .env existentes foram preservados.');
