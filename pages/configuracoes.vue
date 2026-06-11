<template>
  <div class="screen content-pad">
    <div class="page-head"><div class="pt"><h1>Configurações</h1><p class="sub">Gerencie seu perfil, o funil e as preferências do CRM.</p></div></div>

    <div class="settings-layout">
      <aside class="set-nav">
        <button v-for="s in SECTIONS" :key="s.k" class="set-navitem" :class="{ on: sec === s.k }" @click="sec = s.k"><Icon :name="s.ic" :size="17" />{{ s.l }}</button>
      </aside>

      <div class="set-panel">
        <div v-if="sec === 'perfil'" class="card card-pad">
          <h3 class="set-h">Perfil</h3>
          <p class="set-p">Como você aparece para o time no CRM.</p>
          <div class="flex aic gap16" style="margin:4px 0 22px">
            <EAvatar :name="me.name" :photo="me.photo" :size="72" ring />
            <div class="flex gap8">
              <button class="btn btn-secondary btn-sm"><Icon name="edit" :size="15" /> Trocar foto</button>
              <button class="btn btn-ghost btn-sm">Remover</button>
            </div>
          </div>
          <div class="field-grid">
            <div class="field"><label>Nome completo</label><input value="Diego Martins" /></div>
            <div class="field"><label>Cargo</label><input value="Head Comercial" /></div>
            <div class="field"><label>E-mail</label><input value="diego@eenvo.com.br" /></div>
            <div class="field"><label>Telefone</label><input value="+55 11 98400-1190" /></div>
            <div class="field"><label>Fuso horário</label><input value="Brasília (GMT-3)" /></div>
            <div class="field"><label>Idioma</label><input value="Português (Brasil)" /></div>
          </div>
          <div class="flex gap8" style="margin-top:8px">
            <button class="btn btn-primary"><Icon name="check" :size="16" /> Salvar alterações</button>
            <button class="btn btn-ghost">Cancelar</button>
          </div>
        </div>

        <div v-else-if="sec === 'funil'" class="card card-pad">
          <h3 class="set-h">Etapas do funil</h3>
          <p class="set-p">Arraste para reordenar as etapas do pipeline.</p>
          <div class="flex" style="flex-direction:column;gap:8px">
            <div v-for="s in STAGES" :key="s.id" class="flex aic gap12" style="padding:11px 13px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface-2)">
              <Icon name="more" :size="16" style="color:var(--ink-3);cursor:grab" />
              <span :style="{ width: '10px', height: '10px', borderRadius: '99px', background: s.color, flex: '0 0 10px' }" />
              <span style="font-size:13.5px;font-weight:500">{{ s.name }}</span>
              <span style="margin-left:auto;font-size:12px;color:var(--ink-3);font-family:var(--font-mono)">{{ countStage(s.id) }} leads</span>
              <button class="icon-btn" style="width:30px;height:30px;border:0;background:transparent"><Icon name="edit" :size="15" /></button>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" style="margin-top:14px"><Icon name="plus" :size="15" /> Nova etapa</button>
        </div>

        <div v-else class="card card-pad">
          <h3 class="set-h">Preferências</h3>
          <p class="set-p">Notificações e formatos.</p>
          <div v-for="p in prefList" :key="p.k" class="set-row">
            <div class="grow"><div class="nm">{{ p.t }}</div><div class="ds">{{ p.d }}</div></div>
            <button class="toggle" :class="{ on: prefs[p.k] }" @click="prefs[p.k] = !prefs[p.k]" />
          </div>
          <div class="field-grid" style="margin-top:18px">
            <div class="field"><label>Moeda</label><input value="Real (R$)" /></div>
            <div class="field"><label>Formato de data</label><input value="DD/MM/AAAA" /></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { STAGES, LEADS, me } from '~/utils/protoData'

const sec = ref('perfil')
const SECTIONS = [{ k: 'perfil', l: 'Perfil', ic: 'users' }, { k: 'funil', l: 'Etapas do funil', ic: 'kanban' }, { k: 'prefs', l: 'Preferências', ic: 'bell' }]
const prefs = ref<Record<string, boolean>>({ resumo: true, novoLead: true, tarefa: false, semanal: true })
const prefList = [
  { k: 'resumo', t: 'Resumo diário por e-mail', d: 'Receba um panorama do pipeline toda manhã.' },
  { k: 'novoLead', t: 'Novo lead captado', d: 'Avise quando um lead entrar em qualquer ambiente.' },
  { k: 'tarefa', t: 'Lembrete de tarefa', d: 'Notificação antes do vencimento de uma ação.' },
  { k: 'semanal', t: 'Relatório semanal', d: 'Desempenho por ambiente e região, toda segunda.' }
]
const countStage = (id: string) => LEADS.filter((l) => l.stage === id).length
</script>
