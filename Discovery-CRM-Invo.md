# Discovery — CRM eenvo (Cliente: Invo)

> Padrão Fraktal Softwares · Ambiente único: **App interno (Web)** · Single-tenant
> Decisões travadas: Kanban com 6 estágios (Ganho/Perdido separados) · Google Agenda **unidirecional** no MVP · Gestão de equipe (5 usuários) em **V2**.

---

## A. Estratégia

### A.1 Descrição do produto
CRM interno da Invo para centralizar a operação comercial: cadastro de clientes e contatos, gestão do pipeline de negócios em kanban, registro de atividades e follow-ups, e agendamento integrado ao Google Agenda. Substitui o controle hoje espalhado em planilhas e na agenda pessoal de cada vendedor, dando visão única do funil e da taxa de conversão.

### A.2 Desafio central + definição de sucesso
- **Desafio:** a Invo não tem visibilidade do funil — não sabe quantos negócios estão em cada estágio, qual a taxa de ganho/perda, nem o que precisa de follow-up hoje. Informação fragmentada entre planilhas e agendas individuais.
- **Sucesso:** pipeline único e atualizado; taxa de conversão (ganho vs. perdido) visível no dashboard; nenhuma atividade comercial "esquecida" (tudo com data e dono); agendamentos refletidos no Google Agenda do responsável.

### A.3 Business Model Canvas (recorte de produto)
- **Segmento:** equipe comercial interna da Invo (MVP: 1 operador principal; V2: 5 usuários).
- **Proposta de valor [MVP]:** visão única do funil + follow-ups que não caem; conversão mensurável.
- **Atividades-chave [MVP]:** cadastro de clientes, movimentação do pipeline, registro de atividades, agendamento.
- **Integrações [MVP]:** Google Agenda (criação de eventos, unidirecional).
- **Integração bidirecional Google [V2]** · **Gestão de equipe e permissões [V2]** · **Relatórios avançados/exportação [V2]**.

### A.4 Personas
- **Rafael — Vendedor (32)** · proficiência tecnológica 3/5. Dia a dia: prospecta, liga, manda proposta, agenda reuniões. Hoje usa planilha + WhatsApp + agenda do celular. Objetivo: não perder follow-up e fechar mais. Dor: perde o fio da meada entre muitos leads.
- **Carla — Gestora comercial (41)** · proficiência 3/5. Dia a dia: acompanha o time, cobra pipeline, reporta resultado. Hoje pede status por mensagem. Objetivo: enxergar funil e conversão sem caçar informação. Dor: falta de visão consolidada (relevante já no MVP via dashboard; gestão multiusuário em V2).

---

## B. Horas e escopo (Seção A do board)

Ambiente único — **App interno (Web)**.

| Ambiente | Módulo | Descrição | Modalidade | Disc. | UI | Total |
|---|---|---|---|---|---|---|
| App interno | 1. Autenticação | Login e acesso | Web | 0.5h | 1.0h | 1.5h |
| App interno | 2. Dashboard | KPIs e funil comercial | Web | 2.5h | 3.5h | 6.0h |
| App interno | 3. Clientes | Cadastro, listagem e detalhe | Web | 4.0h | 5.5h | 9.5h |
| App interno | 4. Negócios (Pipeline) | Kanban + detalhe do negócio | Web | 5.0h | 7.0h | 12.0h |
| App interno | 5. Atividades & Agenda | Calendário, follow-ups, Google Agenda | Web | 2.5h | 4.0h | 6.5h |
| App interno | 6. Conta e configurações | Perfil e preferências | Web | 1.0h | 1.5h | 2.5h |

### B.1 Resumo e volumetria
| | Discovery | UI | Total |
|---|---|---|---|
| **App interno (Web)** | **15.5h** | **22.5h** | **38.0h** |

> ⚠️ **Risco de escopo:** comparar com as horas contratadas do projeto Invo (não informadas). Se o contrato for ≥ 38h, escopo cabe; abaixo disso, há estouro a negociar. Me passe o contratado para eu sinalizar.

---

## C. Planejamento de rounds

| Round | Data | Pautas | Status |
|---|---|---|---|
| R1 | DD/MM | Validar estratégia + escopo; iniciar Autenticação e Dashboard | Pendente |
| R2 | DD/MM | Arquitetura do módulo Clientes (listagem + detalhe) | Pendente |
| R3 | DD/MM | Arquitetura do módulo Negócios (Kanban + detalhe) | Pendente |
| R4 | DD/MM | Atividades & Agenda (Google unidirecional) + Configurações; revisão geral | Pendente |

---

## D. Discovery — Mapeamento de módulos e telas (Seção B)

**9 telas · numeração global e contínua.**

---

### MÓDULO 1 — AUTENTICAÇÃO — App interno — Web — (0.5h Discovery)

**[1] Login (0.5h)**
→ Inserir e-mail e senha
→ Entrar no sistema
→ Recuperar senha (link "Esqueci minha senha", envia e-mail de redefinição) ¹
→ Ver mensagem de erro em credencial inválida

**Anotações p/ UI e dev:**
¹ Fluxo de recuperação via Supabase Auth (e-mail mágico/redefinição) — sem tela dedicada no MVP.

**Fluxo visual:** `[1] → [2]`

---

### MÓDULO 2 — DASHBOARD — App interno — Web — (2.5h Discovery)

**[2] Dashboard (2.5h)**
→ Ver KPIs do topo, mostrando:
   - Clientes ativos
   - Negócios abertos (em andamento)
   - Valor total em pipeline (R$)
   - Taxa de conversão (Ganho ÷ (Ganho + Perdido)) ¹
→ Ver funil de negócios por estágio (quantidade e valor por coluna do kanban) ²
→ Ver lista de atividades do dia (vencendo hoje), com link → 5
→ Filtrar período do dashboard (este mês / mês passado / personalizado)
→ Acessar atalhos rápidos: novo cliente → 3.1, novo negócio → 4.1

**Anotações p/ UI e dev:**
¹ Conversão calculada sobre negócios em estágio terminal (Ganho/Perdido) no período filtrado.
² Gráfico de funil/barras alimentado por `negocios.estagio`; valores em DECIMAL, nunca float.

**Fluxo visual:** `[2] → [3]` · `[2] → [4]` · `[2] → [5]`

---

### MÓDULO 3 — CLIENTES — App interno — Web — (4.0h Discovery)

**[3] Clientes (1.5h)**
→ Ver lista/tabela de clientes, mostrando:
   - Nome
   - E-mail
   - Telefone
   - Nº de negócios vinculados
   - Data de criação
→ Pesquisar cliente por nome, e-mail ou telefone
→ Filtrar por: possui negócio aberto (sim/não), responsável ¹
→ Ordenar por nome ou data de criação
→ Cadastrar novo cliente → 3.1
→ Ver detalhe de um cliente → 3.1

**[3.1] Detalhe do cliente (2.5h)**
→ Ver/editar dados do cliente: nome, e-mail, telefone
→ Ver tabs: **Contatos** (3.1a) / **Negócios** (3.1b)
→ Tab Contatos (3.1a): ver lista de contatos (nome, cargo, e-mail, telefone); adicionar, editar e remover contato
→ Tab Negócios (3.1b): ver negócios vinculados ao cliente (título, estágio, valor); abrir negócio → 4.1; criar negócio já vinculado → 4.1
→ Ver histórico de atividades do cliente (últimas interações) → 5
→ Excluir cliente (com confirmação) ²

**Anotações p/ UI e dev:**
¹ Filtro por responsável já previsto na UI; seleção entre múltiplos usuários só fica ativa em V2 (MVP single-user).
² Exclusão restrita ao dono (`owner_id`) conforme RLS; bloquear/confirmar quando houver negócios vinculados.

**Fluxo visual:** `[3] → [3.1] → (tabs 3.1a / 3.1b) → [4.1]`

---

### MÓDULO 4 — NEGÓCIOS (PIPELINE) — App interno — Web — (5.0h Discovery)

**[4] Pipeline / Kanban (3.0h)**
→ Ver board kanban com 6 colunas: **Novo lead → Em contato → Proposta enviada → Negociação → Ganho / Perdido** ¹
→ Ver em cada card: título do negócio, cliente, valor (R$), responsável
→ Arrastar card entre colunas para mudar o estágio ²
→ Ver, no topo de cada coluna, total de negócios e soma de valor
→ Pesquisar negócio por título ou cliente
→ Filtrar por responsável e por faixa de valor
→ Criar novo negócio → 4.1
→ Abrir detalhe do negócio → 4.1

**[4.1] Detalhe do negócio (2.0h)**
→ Ver/editar dados do negócio: título, cliente vinculado (→ 3.1), valor, estágio
→ Mover de estágio pelo seletor (espelha o kanban)
→ Ver/registrar atividades do negócio (ligação, e-mail, reunião, tarefa) → 5.1
→ Agendar próxima ação (cria atividade + evento no Google) → 5.1 ³
→ Marcar como **Ganho** ou **Perdido**, registrando motivo ⁴
→ Excluir negócio (com confirmação)

**Anotações p/ UI e dev:**
¹ Estágios mapeiam `negocios.estagio`: novo, em_contato, proposta, negociacao, ganho, perdido.
² Drag-and-drop atualiza `estagio` via update; otimista na UI com rollback em erro.
³ Agendamento dispara criação de evento no Google Agenda (unidirecional) — ver módulo 5, anotação ¹.
⁴ Motivo de perda em lista padronizada (preço, timing, concorrente, sem resposta, outro) para alimentar análise de conversão.

**Fluxo visual:** `[4] → [4.1] → [5.1]` · `[4.1] → (Ganho/Perdido)`

---

### MÓDULO 5 — ATIVIDADES & AGENDA — App interno — Web — (2.5h Discovery)

**[5] Agenda / Atividades (2.0h)**
→ Ver calendário (mês/semana) com as atividades agendadas
→ Ver lista de atividades pendentes, mostrando: tipo (tarefa/ligação/e-mail/reunião), título, cliente/negócio vinculado, data de vencimento, status
→ Filtrar por tipo, por status (pendente/concluída) e por período
→ Marcar atividade como concluída
→ Criar nova atividade → 5.1
→ Ver indicação visual de atividades atrasadas
→ Conectar conta Google (autorizar) ¹

**[5.1] Nova atividade / agendamento (0.5h)**
→ Selecionar tipo: tarefa, ligação, e-mail, reunião
→ Inserir título e descrição
→ Vincular a cliente e/ou negócio (opcional)
→ Definir data/hora de vencimento
→ Marcar "criar evento no Google Agenda" (quando reunião) ¹
→ Salvar atividade

**Anotações p/ UI e dev:**
¹ **Integração Google Agenda — unidirecional (CRM → Google) no MVP.** Ao salvar atividade do tipo reunião com a opção marcada, criar evento no calendário do usuário via Google Calendar API (OAuth). Sync reverso (Google → CRM), atualização e exclusão de eventos externos ficam para **V2**. Guardar `google_event_id` para permitir evolução futura.

**Fluxo visual:** `[5] → [5.1]` · `[4.1] → [5.1]`

---

### MÓDULO 6 — CONTA E CONFIGURAÇÕES — App interno — Web — (1.0h Discovery)

**[6] Conta e configurações (1.0h)**
→ Ver/editar dados do perfil: nome, e-mail
→ Alterar senha
→ Conectar / desconectar conta Google (status da integração) ¹
→ Definir estágios padrão do pipeline (rótulos das 6 colunas) ²
→ Sair do sistema (logout)
→ **[V2]** Gerenciar usuários e permissões (até 5 usuários, papéis admin/membro) ³

**Anotações p/ UI e dev:**
¹ Mostra estado da conexão OAuth Google; reaproveita o fluxo do módulo 5.
² Rótulos editáveis, mas a semântica dos estágios terminais (Ganho/Perdido) é fixa para preservar o cálculo de conversão.
³ Base já suporta (`profiles.papel`); módulo de gestão de equipe entra em V2 sem refação.

**Fluxo visual:** `[1] → [6]`

---

## E. Fluxo macro — App interno (Web)

```
Autenticação [1] → Dashboard [2]
Dashboard [2] → Clientes [3] → Detalhe cliente [3.1]
Dashboard [2] → Pipeline [4] → Detalhe negócio [4.1]
Dashboard [2] → Agenda [5] → Nova atividade [5.1]
Detalhe negócio [4.1] → Nova atividade [5.1]  (agenda próxima ação)
Detalhe cliente [3.1] → Detalhe negócio [4.1] (negócio vinculado)
Autenticação [1] → Conta e configurações [6]
```

---

## F. Itens explicitamente fora do MVP (V2)
- Sync **bidirecional** com Google Agenda (Google → CRM, edição/exclusão de eventos externos).
- **Gestão de equipe**: múltiplos usuários, papéis e permissões (até 5 usuários).
- Relatórios avançados e exportação (CSV/PDF) do funil.
- Filtro/atribuição por responsável com múltiplos vendedores (UI já preparada; ativação em V2).
