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

- Node.js (versão LTS recomendada)
- MySQL Server
- NPM ou Yarn

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente copiando o arquivo de exemplo:

```bash
cp .env.example .env
```

4. Configure as variáveis no arquivo `.env` de acordo com seu ambiente

5. Execute as migrações do banco de dados:

```bash
npm run prisma:migrate
```

6. Gere os tipos do Prisma:

```bash
npm run prisma:generate
```

## Documentação da API

A documentação completa da API está disponível em `/api-docs` quando o servidor está em execução.
