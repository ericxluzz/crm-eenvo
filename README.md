# CRM eenvo

CRM interno construído com **Nuxt 3 + Vue 3 + PrimeVue (v4)**, **Supabase** (banco, auth e storage) e deploy na **Vercel**. Identidade visual roxa (violet) com cinza escuro, operando em **modo light**.

## Stack

| Camada            | Tecnologia                                   |
| ----------------- | -------------------------------------------- |
| Framework         | Nuxt 3 (App/Pages) + TypeScript              |
| UI                | PrimeVue 4 + `@primeuix/themes` (preset Aura)|
| Ícones            | PrimeIcons                                   |
| Banco / Auth      | Supabase (PostgreSQL + RLS)                  |
| Validação         | Zod                                          |
| Deploy            | Vercel                                       |

## Pré-requisitos

- Node.js 20+ (recomendado 22)
- Conta no Supabase e na Vercel

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# preencha SUPABASE_URL, SUPABASE_KEY e SUPABASE_SERVICE_ROLE_KEY

# 3. Rodar em desenvolvimento
npm run dev
```

App em `http://localhost:3000`.

## Banco de dados

A migration inicial está em `supabase/migrations/0001_init.sql` (tabelas `profiles`, `clientes`, `contatos`, `negocios`, `atividades`, todas com RLS).

Aplique com a CLI do Supabase:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

Ou cole o SQL no **SQL Editor** do painel Supabase.

Gerar os tipos TypeScript a partir do banco:

```bash
npm run db:types   # grava em types/database.types.ts
```

## Variáveis de ambiente

| Variável                    | Onde é usada | Segura no cliente? |
| --------------------------- | ------------ | ------------------ |
| `SUPABASE_URL`              | cliente + servidor | ✅ |
| `SUPABASE_KEY` (anon)       | cliente + servidor | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | **só servidor** (`server/`) | ❌ NUNCA |

A `service_role` ignora o RLS — só pode ser usada em `server/`. Nunca prefixe com `NUXT_PUBLIC_`.

## Deploy na Vercel

1. Importe o repositório na Vercel (framework detectado: **Nuxt**, config em `vercel.json`).
2. Em *Settings → Environment Variables*, adicione `SUPABASE_URL`, `SUPABASE_KEY` e `SUPABASE_SERVICE_ROLE_KEY`.
3. No Supabase, em *Authentication → URL Configuration*, adicione a URL de produção da Vercel às *Redirect URLs*.

## Módulos implementados (Discovery Invo)

As 9 telas do Discovery estão construídas:

- **Autenticação** — `pages/login.vue` (login + recuperação de senha).
- **Dashboard** — `pages/index.vue` (KPIs, funil por estágio, atividades do dia, atalhos).
- **Clientes** — `pages/clientes/index.vue` (busca/filtro) e `pages/clientes/[id].vue` (tabs Contatos / Negócios / Histórico, CRUD).
- **Pipeline** — `pages/negocios/index.vue` (Kanban 6 colunas com drag-and-drop) e `pages/negocios/[id].vue` (estágio, ganho/perdido com motivo, atividades).
- **Agenda** — `pages/atividades/index.vue` (lista + filtros) e `components/NovaAtividadeDialog.vue` (tela 5.1).
- **Conta e configurações** — `pages/configuracoes.vue` (perfil, senha, integração Google, estágios, equipe V2).

A camada de dados fica em `composables/` (useClientes, useNegocios, useAtividades, useDashboard) e fala direto com o Supabase sob RLS.

### Dados de exemplo
Após cadastrar o primeiro usuário, rode `supabase/seed.sql` (CLI `supabase db reset` ou SQL Editor) para popular clientes, negócios e atividades de demonstração.

## Integração Google Agenda (unidirecional)

OAuth tratado em `server/api/google/*` (refresh token guardado server-side em `integracoes_google`, fora do alcance do cliente via RLS). Para ativar:

1. Crie um OAuth 2.0 Client no Google Cloud e habilite a **Google Calendar API**.
2. Preencha `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `GOOGLE_REDIRECT_URI` no `.env`.
3. Em Configurações → Google Agenda, clique em **Conectar Google**.

Sem essas variáveis o app funciona normalmente; apenas a criação de eventos fica indisponível. Sync reverso (Google → CRM) é **V2**.

## Tema

O preset da marca está em `themes/eenvo-preset.ts` (primário violet, superfícies em slate, modo light fixo). Para ajustar a cor, edite o bloco `semantic.primary`.

## Estrutura

Veja `ARQUITETURA.md` para a explicação completa de pastas, módulos, RLS e decisões.
