# Validação da extração

Executada em 11/11/2026 com Docker Desktop 28.5.1, Compose 2.40.2, contêineres Linux e Node.js 24.15.0.

O ambiente de teste usou o projeto Compose isolado kube-shop-validation, publicado apenas em 127.0.0.1:18080. O banco foi inicializado vazio; nenhum pedido ou credencial do Kubernetes foi copiado.

| Verificação | Resultado |
|---|---|
| npm ci com lockfile atualizado | PASS |
| Testes da API | PASS: 9 testes |
| Testes da interface | PASS: 4 testes |
| Build Vite local e dentro do Docker | PASS |
| docker compose config --quiet | PASS |
| Build das imagens API e frontend | PASS |
| Inicialização autenticada do MongoDB | PASS |
| Healthchecks dos três serviços | PASS |
| Smoke pelo Nginx: HTML, catálogo, saúde e criação/consulta de pedido | PASS |
| Ausência das rotas de métricas e carga | PASS: HTTP 404 |
| Navegador Chrome desktop e celular | PASS: 2 testes |
| Pedido consultado após recarregar o navegador | PASS |
| Banco parado: liveness 200, readiness 503 e pedidos 503 | PASS |
| Reconexão ao banco após reinício | PASS |
| Pedido preservado após compose down e nova criação dos três serviços | PASS |
| MongoDB rejeita consultas sem autenticação | PASS |
| API e MongoDB sem portas publicadas no host | PASS |
| API e frontend sem root e com filesystem somente leitura | PASS |
| Setup repetido preserva os arquivos de senha | PASS |
| npm audit --omit=dev | PASS: zero vulnerabilidades reportadas |

A primeira construção identificou GHSA-27r3-jxmh-p828 em body-parser, dependência transitiva do Express. O lockfile foi atualizado para body-parser 2.4.0, as imagens foram reconstruídas e os testes foram repetidos com a correção. As versões diretas das aplicações foram preservadas.

Os testes de navegação finais foram executados com a instalação estável, após concluir as interrupções deliberadas do teste de persistência.

## Reprodução funcional

Prepare as credenciais conforme README.md e execute:

```sh
docker compose up -d --build --wait --wait-timeout 240
docker compose ps
docker compose exec -T api node /app/scripts/smoke.mjs
```

Com Node.js 24 e Google Chrome instalados no host:

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

## Limites da evidência

A validação comprova o funcionamento local do conjunto Docker e a persistência dos volumes. A instalação em uma VM remota, regras de firewall externas e terminação HTTPS não foram executadas. Não houve teste de carga, HA ou migração de dados. Cada serviço possui uma instância.
