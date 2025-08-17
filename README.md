# Voxly API

## Tecnologias

- Node.js
- Express
- TypeScript
- Prisma ORM
- MySQL
- JWT para autenticação
- Swagger para documentação
- Jest para testes

## Modelo de Dados

Consulte o arquivo `prisma/schema.prisma` para ver o modelo de dados atualizado e suas relações.

## Pré-requisitos

- Docker e suas dependências

## Instalação

1. Clone o repositório

2. Configure as variáveis de ambiente copiando o arquivo de exemplo:

```bash
cp .env.example .env
```

3. Configure as variáveis no arquivo `.env` na raiz do projeto de acordo com seu ambiente

4. Inicie os conteiners do Docker compose:

```bash
docker compose up --watch
```

## Documentação da API

A documentação completa da API está disponível em `/api-docs` quando o servidor está em execução.
