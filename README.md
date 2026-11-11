# KubeShop

O KubeShop é um projeto didático para o Laboratório de Engenharia de Software do professor Laercio. O objetivo é praticar o deploy de uma aplicação em nuvem, desde a preparação do ambiente até a publicação e a verificação dos serviços.

A aplicação simula uma loja virtual com catálogo, carrinho e histórico de pedidos. Ela reúne uma interface em React servida pelo Nginx, uma API em Node.js/Express e um banco MongoDB com armazenamento persistente. Essa estrutura permite trabalhar com containers, comunicação entre serviços, configuração do ambiente e persistência de dados durante as atividades do laboratório.

Os produtos e pedidos são fictícios e o histórico é compartilhado entre os usuários da loja. Não há login de clientes nem pagamentos reais.

## Como rodar localmente

### 1. Prepare o ambiente

- Instale o [Git](https://git-scm.com/).
- Instale e inicie o Docker, com suporte a containers Linux e Docker Compose v2.20 ou superior. No Windows, use o [Docker Desktop](https://www.docker.com/products/docker-desktop/) com o mecanismo de containers Linux.
- Deixe a porta `8080` disponível. A primeira execução precisa de internet para baixar as imagens e dependências.

Não é necessário instalar Node.js ou MongoDB no computador: o preparo e a execução usam Docker.

### 2. Clone o repositório

```sh
git clone https://github.com/LaercioMLB/kube-shop-v2.git
cd kube-shop-v2
```

Execute os próximos comandos dentro dessa pasta.

### 3. Gere a configuração e as credenciais

No **Windows**, pelo PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup.ps1
```

No **Linux**:

```sh
sh scripts/setup.sh
```

O script cria o arquivo `.env` e gera as senhas do banco na pasta `.secrets/`. Se esses arquivos já existirem, serão preservados.

### 4. Configure o acesso local

Abra o arquivo `.env` e ajuste estas variáveis:

```dotenv
BIND_ADDRESS=127.0.0.1
HTTP_PORT=8080
```

Assim, a loja fica acessível apenas pelo seu computador. Se a porta `8080` estiver ocupada, escolha outra em `HTTP_PORT` e use essa porta no endereço de acesso.

### 5. Suba os serviços

```sh
docker compose up -d --build --wait --wait-timeout 240
```

O comando constrói as imagens e inicia o frontend, a API e o MongoDB. Aguarde os três serviços ficarem saudáveis (`healthy`).

### 6. Abra a loja

Acesse **[http://localhost:8080](http://localhost:8080)** no navegador.

Explore o catálogo, adicione um produto à sacola e confirme um pedido fictício. Depois, consulte o resultado em **Meus pedidos**.

### 7. Verifique o funcionamento

Confira o estado dos serviços:

```sh
docker compose ps
```

Execute o teste funcional:

```sh
docker compose exec -T api node /app/scripts/smoke.mjs
```

O teste verifica a página inicial, a API, o catálogo e a criação e consulta de um pedido fictício. O resultado esperado é `"result":"PASS"`.

## Consultar logs e encerrar

Para acompanhar os logs:

```sh
docker compose logs --tail=100 -f
```

Use `Ctrl+C` para sair da visualização dos logs. Os serviços continuam em execução.

Para desligar o projeto:

```sh
docker compose down
```

Esse comando remove os containers e as redes do projeto, preservando os volumes com os pedidos. Mantenha também a pasta `.secrets/`, pois ela contém as credenciais do banco. A opção `--volumes` remove os dados persistidos.

Para iniciar novamente, execute o comando do passo 5.
