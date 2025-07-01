# Voxly API

API de gerenciamento de entidades (clientes) e usuários (vendedores) com autenticação.

## Tecnologias

- Node.js
- Express
- TypeScript
- Prisma ORM
- MySQL
- JWT para autenticação

## Estrutura do Projeto

```
src/
  ├── controllers/     # Controladores da aplicação
  ├── lib/            # Bibliotecas e utilitários
  ├── middlewares/    # Middlewares Express
  ├── routes/         # Definição de rotas
  ├── services/       # Lógica de negócio
  ├── types/          # Definições de tipos e interfaces
  ├── utils/          # Funções utilitárias
  ├── app.ts          # Configuração do Express
  └── server.ts       # Ponto de entrada da aplicação
prisma/
  └── schema.prisma   # Esquema do banco de dados
```

## Modelo de Dados

- **Entity**: Representa um cliente (loja) que utiliza o sistema
- **User**: Representa um usuário (vendedor) vinculado a uma entidade
- **UserSession**: Registra as sessões de login/logout dos usuários

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
DATABASE_URL="mysql://user:password@localhost:3306/voxly"
JWT_SECRET="seu_segredo_jwt"
ADMIN_PASSWORD="alguma_senha"
PORT="3000"
```

4. Execute as migrações do banco de dados:

```bash
npm run prisma:migrate
```

5. Gere os tipos do Prisma:

```bash
npm run prisma:generate
```

## Desenvolvimento

Para iniciar o servidor em modo de desenvolvimento:

```bash
npm run dev
```

## Produção

Para compilar e iniciar em produção:

```bash
npm run build
npm start
```