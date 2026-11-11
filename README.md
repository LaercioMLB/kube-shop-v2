# KubeShop

Loja demonstrativa extraída do projeto minikube-lab para executar em uma VM com Docker Compose.

Três serviços: frontend React compilado e servido por Nginx, API Node.js/Express e MongoDB autenticado com armazenamento persistente. Catálogo, carrinho e criação/consulta de pedidos foram preservados. Os pedidos são fictícios e compartilhados; não há login de clientes nem pagamentos reais.

## Requisitos

- Docker Engine com contêineres Linux e Docker Compose v2.20 ou superior.
- Git para clonar e atualizar.
- Acesso aos registries Docker e npm na primeira construção.
- Porta TCP 8080 disponível, ou outra configurada em HTTP_PORT.

Node.js não precisa estar instalado na VM. O preparo e o build usam imagens Docker.

## Instalação em Linux

```sh
git clone https://github.com/LaercioMLB/kube-shop-v2.git
cd kube-shop-v2
sh scripts/setup.sh
docker compose up -d --build --wait --wait-timeout 240
```

Abra **http://IP-DA-VM:8080**. Libere a porta configurada no firewall da VM, se necessário.

## Instalação no Windows

Use Docker Desktop com o mecanismo de contêineres Linux. No PowerShell:

```powershell
git clone https://github.com/LaercioMLB/kube-shop-v2.git
cd kube-shop-v2
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup.ps1
docker compose up -d --build --wait --wait-timeout 240
```

Abra **http://localhost:8080**.

## Configuração

Os scripts setup geram senhas aleatórias em .secrets/ e criam .env a partir de .env.example. Executá-los novamente preserva os arquivos existentes. A API recebe apenas a senha do usuário readWrite do banco kubeshop; a senha administrativa fica somente no MongoDB.

| Variável em .env | Padrão | Finalidade |
|---|---|---|
| BIND_ADDRESS | 0.0.0.0 | Interfaces da VM que recebem conexões |
| HTTP_PORT | 8080 | Porta HTTP publicada |
| APP_VERSION | 1.0.0 | Versão das imagens e da API |

Para acesso apenas local, use BIND_ADDRESS=127.0.0.1. Depois de alterar .env, execute novamente docker compose up -d --build --wait.

Somente o frontend publica uma porta no host. API e banco se comunicam em redes Docker; o banco usa uma rede interna. A entrada padrão é HTTP. Se o ambiente exigir HTTPS, use o proxy TLS já adotado na infraestrutura apontando para a porta da loja.

As credenciais do MongoDB são inicializadas quando o volume está vazio. Preserve .secrets/ junto com os volumes: substituir os arquivos de senha não altera usuários de um banco já inicializado. .env, .secrets/ e dados de execução ficam fora do Git e do contexto de build.

## Verificação

```sh
docker compose ps
docker compose exec -T api node /app/scripts/smoke.mjs
```

O smoke test acessa o frontend pelo Nginx, verifica a API e cria/consulta um pedido fictício. Não gera carga.

## Operação

```sh
# Logs com rotação configurada por serviço
docker compose logs --tail=100 -f

# Parar os serviços
docker compose stop

# Iniciar novamente
docker compose up -d --wait

# Atualizar código e reconstruir
git pull --ff-only
docker compose up -d --build --wait --wait-timeout 240

# Remover contêineres e redes, preservando volumes
docker compose down
```

Os volumes mongo-data e mongo-config mantêm os dados entre recriações dos contêineres. O comando down com a opção --volumes remove esses dados. A instalação tem uma única instância de cada serviço; atualizações e falhas da VM podem interromper o acesso.

O Docker reinicia processos encerrados conforme restart: unless-stopped. Healthchecks indicam prontidão e controlam a ordem inicial; um estado unhealthy não provoca reinício automático por si só.

## Desenvolvimento e testes

Para trabalhar no código fora dos contêineres, use Node.js 24.15+ da linha 24 e npm:

```sh
npm ci
npm test
npm run build
```

Os testes de navegador usam Google Chrome instalado e a loja em execução:

```sh
npm run test:e2e
```

E2E_BASE_URL permite apontar para outra porta, por exemplo http://127.0.0.1:18080. Os testes criam pedidos fictícios.

## Estrutura

```text
apps/frontend/       interface, testes, Nginx e Dockerfile
apps/backend/        API, catálogo, persistência, testes e Dockerfile
docker/mongodb/      criação do usuário da aplicação e healthcheck
scripts/setup.*      preparo de configuração e credenciais
scripts/smoke.mjs    verificação funcional pelo proxy
tests/browser/       testes desktop e celular
compose.yaml         serviços, redes, volumes e secrets
```

O build dos Dockerfiles usa a raiz do repositório como contexto, pois as aplicações são workspaces npm e compartilham package-lock.json. As versões JavaScript diretas e as imagens base mantêm a referência da extração. A dependência transitiva body-parser foi atualizada para 2.4.0 para corrigir o aviso identificado durante a validação.

## API

| Método | Rota | Uso |
|---|---|---|
| GET | /api/products | Catálogo fixo |
| POST | /api/orders | Criar pedido fictício |
| GET | /api/orders | Consultar os 100 pedidos mais recentes |
| GET | /api/info | Versão e horário |
| GET | /api/health/live | Processo ativo |
| GET | /api/health/startup | Inicialização concluída |
| GET | /api/health/ready | API pronta e banco acessível |

O servidor valida os produtos e quantidades e calcula os preços em centavos. O carrinho permanece na memória do navegador até a confirmação. Não há chave de idempotência para POST de pedidos.

## Origem e escopo

Origem: [LaercioMLB/minikube-lab](https://github.com/LaercioMLB/minikube-lab), diretório kubeshop-lab/.

A instalação extraída não inclui Kubernetes, Helm, Minikube, monitoramento, geradores de carga, simulações de falha ou tarefas do laboratório. Não houve migração de pedidos existentes. Veja [VALIDATION.md](VALIDATION.md) para as verificações executadas nesta extração.
