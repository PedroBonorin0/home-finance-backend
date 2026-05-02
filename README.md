# 💰 Finanças API

API NestJS para controle de finanças pessoais com Supabase.

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)

## Configuração

### 1. Banco de dados (Supabase)

1. Crie um projeto no Supabase
2. Acesse **SQL Editor** no painel
3. Execute o arquivo `supabase-migration.sql` para criar as tabelas

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Preencha o `.env` com os dados do seu projeto Supabase:

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_KEY=sua-anon-key-ou-service-role-key
PORT=3000
FRONTEND_URL=http://localhost:5173
```

> As chaves estão em: **Project Settings → API** no painel do Supabase.

### 3. Instalar e rodar

```bash
npm install
npm run start:dev
```

## Endpoints

### Categorias (`/api/categories`)

| Método | Rota                  | Descrição                              |
|--------|-----------------------|----------------------------------------|
| GET    | `/api/categories`     | Listar todas (filtro: `?type=income`)  |
| GET    | `/api/categories/:id` | Buscar por ID                          |
| POST   | `/api/categories`     | Criar nova categoria                   |
| PATCH  | `/api/categories/:id` | Atualizar categoria                    |
| DELETE | `/api/categories/:id` | Remover categoria                      |

### Registros (`/api/records`)

| Método | Rota                 | Descrição                                         |
|--------|----------------------|---------------------------------------------------|
| GET    | `/api/records`       | Listar registros (filtros abaixo)                 |
| GET    | `/api/records/summary` | Resumo: total receitas, despesas e saldo        |
| GET    | `/api/records/:id`   | Buscar por ID                                     |
| POST   | `/api/records`       | Criar novo registro                               |
| PATCH  | `/api/records/:id`   | Atualizar registro                                |
| DELETE | `/api/records/:id`   | Remover registro                                  |

#### Filtros disponíveis em `GET /api/records`

| Parâmetro     | Tipo   | Exemplo            |
|---------------|--------|--------------------|
| `category_id` | UUID   | `?category_id=...` |
| `method`      | Enum   | `?method=Pix`      |
| `date_from`   | Date   | `?date_from=2024-01-01` |
| `date_to`     | Date   | `?date_to=2024-12-31`   |

## Documentação interativa

Acesse `http://localhost:3000/api/docs` para ver o Swagger UI.

## Estrutura do projeto

```
src/
├── supabase/
│   ├── supabase.module.ts     # Módulo global do Supabase
│   └── supabase.service.ts    # Cliente Supabase injetável
├── categories/
│   ├── categories.dto.ts      # DTOs + validações
│   ├── categories.service.ts  # Lógica de negócio
│   ├── categories.controller.ts
│   └── categories.module.ts
├── records/
│   ├── records.dto.ts
│   ├── records.service.ts
│   ├── records.controller.ts
│   └── records.module.ts
├── app.module.ts
└── main.ts
```

## Tipos

### CategoryType
- `income` — Receita
- `outcome` — Despesa

### PaymentMethod
- `Pix`
- `Credit`
- `Debit`
