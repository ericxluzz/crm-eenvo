# Arquitetura — CRM eenvo

Documento de referência da estrutura, decisões técnicas e modelo de dados.

## 1. Visão geral

App interno **single-tenant**: uma única organização, vários usuários internos. Não há isolamento multi-tenant por empresa — o controle de acesso é por usuário autenticado, via RLS do Supabase. A estrutura comporta evoluir para multi-tenant depois (basta adicionar `org_id` às tabelas e ajustar as policies).

```
Usuário (auth.users) ──1:1── profiles (papel: admin | membro)
                                   │ owner_id
        ┌──────────────┬──────────┴───────────┬──────────────┐
     clientes       negocios               atividades      (storage)
        │ 1:N           │ N:1 cliente            │ N:1 cliente/negocio
     contatos        ────┘                    ────┘
```

## 2. Stack e por quê

- **Nuxt 3 + Vue 3** — full-stack Vue com SSR, roteamento por arquivos e camada de servidor (`server/`) para lógica que exige a `service_role`.
- **PrimeVue 4 + `@primeuix/themes`** — biblioteca de componentes rica (DataTable, formulários, overlays) com sistema de temas baseado em design tokens. Auto-import via `@primevue/nuxt-module`.
- **Supabase** — PostgreSQL gerenciado + Auth + Storage + RLS. Integração via `@nuxtjs/supabase`, que já injeta `useSupabaseClient()` e `useSupabaseUser()` e cuida do redirecionamento de rotas protegidas.
- **Vercel** — deploy com preset Nuxt nativo.

## 3. Estrutura de pastas

```
.
├── nuxt.config.ts          # módulos, tema PrimeVue, config Supabase
├── vercel.json             # preset de deploy
├── themes/
│   └── eenvo-preset.ts     # tema da marca (roxo/violet, modo light)
├── assets/css/main.css     # estilos globais + variáveis da marca
├── app.vue                 # entrada; monta layout + Toast/ConfirmDialog
├── layouts/
│   ├── default.vue         # shell autenticado (sidebar + topbar)
│   └── auth.vue            # tela centralizada de login
├── components/
│   ├── AppSidebar.vue      # navegação (cinza escuro)
│   └── AppTopbar.vue       # cabeçalho + usuário + logout
├── pages/                  # rotas (file-based routing)
│   ├── index.vue           # dashboard
│   ├── login.vue
│   ├── clientes/index.vue
│   ├── negocios/index.vue
│   └── atividades/index.vue
├── composables/
│   └── useAuth.ts          # login/registro/logout (cliente, chave anon)
├── server/
│   └── utils/supabaseAdmin.ts  # cliente service_role (SÓ servidor)
├── types/
│   └── database.types.ts   # tipos gerados pelo Supabase CLI
└── supabase/
    └── migrations/0001_init.sql
```

## 4. Modelo de dados

| Tabela       | Papel | Campos principais |
| ------------ | ----- | ----------------- |
| `profiles`   | 1:1 com `auth.users`; papel do usuário | `id`, `nome`, `papel` |
| `clientes`   | empresas/pessoas atendidas | `nome`, `email`, `telefone`, `owner_id` |
| `contatos`   | pessoas dentro de um cliente | `cliente_id`, `nome`, `cargo` |
| `negocios`   | oportunidades / pipeline | `cliente_id`, `titulo`, `valor` (DECIMAL), `estagio` |
| `atividades` | tarefas e follow-ups | `tipo`, `titulo`, `concluida`, `vence_em` |

Convenções aplicadas: `id uuid default gen_random_uuid()`, `created_at`/`updated_at` (com trigger de atualização), FKs com `ON DELETE` explícito, índices em FKs e campos de filtro/ordenção, e **valores monetários em `DECIMAL(19,4)`** (nunca float).

## 5. Autorização (RLS)

RLS está **habilitado em todas as tabelas**. Modelo adotado (app interno):

- **Leitura**: qualquer usuário autenticado vê os registros (`auth.role() = 'authenticated'`).
- **Inserção**: o registro é criado com `owner_id = auth.uid()`.
- **Exclusão**: restrita ao dono (`auth.uid() = owner_id`).
- `profiles`: cada usuário só lê/edita o próprio.

Um trigger em `auth.users` cria automaticamente o `profile` no cadastro.

> Para restringir a visão por dono (cada vendedor vê só os seus), troque as policies de SELECT para `auth.uid() = owner_id`. Para multi-tenant, adicione `org_id` e filtre por ele.

## 6. Segurança (checklist aplicado)

- RLS habilitado em todas as tabelas — nenhum `DISABLE ROW LEVEL SECURITY`.
- Apenas a chave **anon** vai ao cliente; **`service_role` só em `server/`** (`supabaseAdmin.ts`), nunca com prefixo público.
- Segredos só em variáveis de ambiente (`.env` no `.gitignore`; `.env.example` versionado).
- Formulários com proteção contra duplo submit e estados de erro.
- Validação de input com Zod nas rotas de servidor (adicionar conforme criar endpoints).

## 7. Identidade visual

Roxo (paleta **violet**) como cor primária, superfícies em **slate** (cinza), navegação em cinza escuro (`surface.900`). Modo **light fixo**: o `darkModeSelector` aponta para `.app-dark`, classe nunca aplicada. Tokens centralizados em `themes/eenvo-preset.ts`.

## 8. Riscos / pontos de atenção

1. **`service_role` vazando para o cliente** — manter o uso restrito a `server/`; qualquer import em página/componente é uma falha crítica.
2. **Policies RLS amplas demais** — o padrão atual deixa todo autenticado ler tudo; revisar antes de dados sensíveis ou multi-equipe.
3. **Versões das libs** — `package.json` usa faixas (`^`); rodar `npm install` e `npm run typecheck` para fixar e validar antes do primeiro deploy.

## 9. Próximos passos sugeridos

1. `npm install` e `npm run dev`.
2. Aplicar a migration no Supabase e gerar os tipos (`npm run db:types`).
3. Implementar CRUD real de clientes (formulário + `insert`/`update`).
4. Criar rotas de servidor em `server/api/` para ações que exigem `service_role`.
5. Configurar variáveis de ambiente na Vercel e fazer o primeiro deploy.
