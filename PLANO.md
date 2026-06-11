# Plano de execução — CRM eenvo (Invo)

Estado atual: scaffold + as 9 telas do Discovery construídas e validadas estaticamente, **ainda sem build executado**. Este plano leva do código atual até o MVP no ar, em fases ordenadas por dependência.

---

## Fase 0 — Colocar de pé (hoje) · ~1–2h

Objetivo: rodar `npm run dev` sem erros e navegar pelas telas com dados reais.

- [x] Conferir Node 20+ (recomendado 22) — `node -v` → v24.15.0
- [x] `npm install` na pasta do projeto
- [x] Criar projeto no Supabase (região mais próxima) → ref `pfljmxhtmzjcyvmkpkbq`
- [x] Copiar `.env.example` → `.env` e preencher `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [x] Aplicar a migration `supabase/migrations/0001_init.sql` (via SQL Editor)
- [x] Cadastrar o primeiro usuário (eric.luz@fraktalsoftwares.com.br → trigger criou o `profile`)
- [x] Rodar `supabase/seed.sql` para dados de demonstração (via `scripts/seed.mjs`, mesma lógica por REST)
- [x] `npm run dev` e corrigir eventuais ajustes do primeiro build → sobe limpo em :3000

**Pronto quando:** login funciona, dashboard mostra os KPIs do seed, kanban arrasta cards.

---

## Fase 1 — Fundação técnica e qualidade · ~4–6h

Objetivo: travar versões, proteger rotas e garantir que o projeto siga os padrões de engenharia.

- [ ] `middleware/auth.global.ts` explícito (reforça o redirect do `@nuxtjs/supabase`)
- [ ] `.nvmrc` + `engines` no `package.json` (travar versão do Node)
- [ ] ESLint + Prettier (`@nuxt/eslint`) e script `lint`
- [ ] Gerar os tipos reais do banco: `npm run db:types` → tipar os composables (remover os `as unknown as`)
- [ ] Rodar `npm run typecheck` e zerar erros de tipo
- [ ] Revisar estados de loading / erro / vazio em todas as telas (form duplo-submit já tratado)
- [ ] `get_advisors` do Supabase (security + performance) e corrigir alertas de RLS/índice

**Pronto quando:** `typecheck` e `lint` passam limpos; advisors do Supabase sem alertas críticos.

---

## Fase 2 — Fechar o MVP funcional · ~6–8h

Objetivo: cada uma das 9 telas atende ao que o Discovery especifica, ponta a ponta.

- [ ] Dashboard: filtro de período (este mês / mês passado / personalizado) ligado às queries
- [ ] Clientes: filtro "com negócio aberto" considerando estágio (não só contagem)
- [ ] Pipeline: persistir reordenação visual e confirmar rollback otimista em erro de rede
- [ ] Negócio: validar regra de motivo obrigatório ao marcar Perdido (UI + check no banco)
- [ ] Agenda: visão de calendário (mês/semana) além da lista — avaliar `FullCalendar` ou `DatePicker` inline
- [ ] Atividades atrasadas com destaque consistente em todas as telas
- [ ] Mensagens de erro amigáveis (mapear erros do Supabase para texto pt-BR)

**Pronto quando:** percorrer as 9 telas cobrindo o fluxo macro do Discovery sem becos sem saída.

---

## Fase 3 — Integração Google Agenda (unidirecional) · ~3–4h

Objetivo: criar eventos reais no Google ao agendar reuniões.

- [ ] Criar OAuth 2.0 Client no Google Cloud + habilitar **Google Calendar API**
- [ ] Preencher `GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI` no `.env`
- [ ] Testar o fluxo: Conectar → consentir → criar reunião com a opção marcada → conferir evento no Google
- [ ] Tratar expiração/erro de token sem derrubar a criação da atividade (já há fallback; validar)
- [ ] Guardar `google_event_id` (já implementado) para habilitar o sync reverso na V2

**Pronto quando:** uma reunião criada no CRM aparece no Google Agenda do usuário.

---

## Fase 4 — Deploy na Vercel · ~2h

Objetivo: ambiente de produção acessível.

- [ ] Repositório no Git + importar na Vercel (preset Nuxt já em `vercel.json`)
- [ ] Cadastrar as env vars na Vercel (Supabase + Google)
- [ ] Atualizar `GOOGLE_REDIRECT_URI` para a URL da Vercel e ajustar no Google Cloud
- [ ] Adicionar a URL de produção em Supabase → Auth → Redirect URLs
- [ ] Smoke test em produção (login, criar cliente/negócio, agendar)

**Pronto quando:** o time consegue logar e operar pela URL pública.

---

## Fase 5 — QA e validação com a Invo · ~paralelo aos rounds

- [ ] Checklist de segurança final: RLS em todas as tabelas, `service_role` só no server, nenhum secret no front (já validado estaticamente — reconfirmar)
- [ ] Teste de permissão: usuário não-autenticado não acessa dados
- [ ] Rounds R1–R4 do Discovery para validar telas com o cliente
- [ ] Ajustes de UI/copy conforme feedback

---

## Fase 6 — Backlog V2 (após o MVP no ar)

- Sync **bidirecional** com Google Agenda (Google → CRM, edição/exclusão)
- **Gestão de equipe**: até 5 usuários, papéis/permissões, atribuição por responsável (base `profiles.papel` já pronta)
- Relatórios e exportação (CSV/PDF) do funil
- Módulo de Notificações
- Testes automatizados (unit + e2e) cobrindo o fluxo comercial

---

## Prioridade imediata (o que fazer agora)

1. **Fase 0** — subir o projeto localmente (bloqueia tudo).
2. **Fase 1** — middleware de rotas, tipos do Supabase e typecheck.
3. **Fase 3** — Google, se o agendamento for crítico para a demo do cliente.

## Caminho crítico
`Fase 0 → Fase 1 → Fase 2 → Fase 4` é o mínimo para um MVP utilizável. Google (Fase 3) e QA com cliente (Fase 5) correm em paralelo a partir da Fase 2.
