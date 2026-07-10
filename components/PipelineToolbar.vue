<template>
  <div class="pp-toolbar">
    <div class="flex aic gap8" style="flex-wrap:wrap">
      <div class="segmented">
        <button :class="{ on: view === 'board' }" @click="$emit('update:view', 'board')"><Icon name="kanban" :size="15" /> Quadro</button>
        <button :class="{ on: view === 'list' }" @click="$emit('update:view', 'list')"><Icon name="list" :size="15" /> Lista</button>
      </div>

      <div class="pp-search">
        <Icon name="search" :size="15" style="color:var(--ink-3)" />
        <input :value="q" placeholder="Buscar empresa ou contato…" @input="$emit('update:q', ($event.target as HTMLInputElement).value)">
        <button v-if="q" class="pp-clear" @click="$emit('update:q', '')"><Icon name="x" :size="14" /></button>
      </div>

      <button class="btn btn-secondary btn-sm" :class="{ 'pp-on': showFilters }" @click="$emit('update:showFilters', !showFilters)">
        <Icon name="filter" :size="15" /> Filtros
        <span v-if="activeCount" class="pp-fbadge">{{ activeCount }}</span>
      </button>

      <div class="pp-sort">
        <Icon name="arrow-down" :size="14" style="color:var(--ink-3)" />
        <select :value="sort" @change="$emit('update:sort', ($event.target as HTMLSelectElement).value)">
          <option value="value">Maior valor</option>
          <option value="recent">Mais recente</option>
          <option value="company">Empresa A-Z</option>
        </select>
      </div>

      <div v-if="view === 'board'" class="flex aic gap8" style="margin-left:6px">
        <span class="muted" style="font-size:12.5px">Agrupar por</span>
        <div class="segmented sm">
          <button v-for="g in groups" :key="g.k" :class="{ on: groupBy === g.k }" @click="$emit('update:groupBy', g.k)">{{ g.l }}</button>
        </div>
      </div>

      <button class="btn btn-primary btn-sm" style="margin-left:auto" @click="$emit('new')"><Icon name="plus" :size="16" /> Novo lead</button>
    </div>

    <Transition name="pp-exp">
      <div v-if="showFilters" class="pp-filters">
        <div class="pp-frow">
          <span class="pp-flabel">Ambiente</span>
          <button class="chip" :class="{ active: ambFilter === 'todos' }" @click="$emit('update:ambFilter', 'todos')">Todos</button>
          <button v-for="a in ambientes" :key="a.id" class="chip" :class="{ active: ambFilter === a.id }" @click="$emit('update:ambFilter', a.id)">
            <Icon :name="a.icon" :size="14" :style="{ color: ambFilter === a.id ? 'var(--brand-700)' : a.color }" />{{ a.short }}
          </button>
        </div>

        <div class="pp-frow">
          <span class="pp-flabel">Estágio</span>
          <button v-for="s in stages" :key="s.id" class="chip" :class="{ active: stageSel.includes(s.id) }" @click="$emit('toggle-stage', s.id)">
            <span class="pp-dot" :style="{ background: s.color }" />{{ s.name }}
          </button>
        </div>

        <div class="pp-frow">
          <span class="pp-flabel">Região</span>
          <button v-for="r in regioes" :key="r" class="chip" :class="{ active: regiaoSel.includes(r) }" @click="$emit('toggle-regiao', r)">{{ r }}</button>
        </div>

        <div class="pp-frow">
          <span class="pp-flabel">Temperatura</span>
          <button v-for="t in temps" :key="t.id" class="chip" :class="{ active: tempSel.includes(t.id) }" @click="$emit('toggle-temp', t.id)">
            <span class="pp-dot" :style="{ background: t.c }" />{{ t.l }}
          </button>
          <button v-if="activeCount" class="btn btn-ghost btn-sm" style="margin-left:auto" @click="$emit('clear')"><Icon name="refresh" :size="14" /> Limpar filtros</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  view: string; showFilters: boolean; sort: string; groupBy: string
  q: string; ambFilter: string; stageSel: string[]; regiaoSel: string[]; tempSel: string[]
  ambientes: any[]; stages: any[]; regioes: string[]
  groups: { k: string; l: string }[]; activeCount: number
}>()
defineEmits([
  'update:view', 'update:showFilters', 'update:sort', 'update:groupBy', 'update:q', 'update:ambFilter',
  'toggle-stage', 'toggle-regiao', 'toggle-temp', 'clear', 'new'
])
const temps = [{ id: 'quente', l: 'Quente', c: '#DC2626' }, { id: 'morno', l: 'Morno', c: '#D97706' }, { id: 'frio', l: 'Frio', c: '#2563EB' }]
</script>

<style scoped>
.pp-toolbar { margin-bottom: 16px }
.pp-sort { display: flex; align-items: center; gap: 6px; height: 32px; padding: 0 10px; border: 1px solid var(--line); border-radius: var(--r-sm); background: var(--surface) }
.pp-sort select { border: 0; background: transparent; font: inherit; font-size: 13px; color: var(--ink); cursor: pointer; outline: none }
.btn.pp-on { border-color: var(--brand); color: var(--brand-700); background: var(--brand-soft) }
.pp-fbadge { display: inline-grid; place-items: center; min-width: 17px; height: 17px; padding: 0 4px; border-radius: 9px; background: var(--brand); color: #fff; font-size: 11px; font-weight: 700 }
.pp-filters { margin-top: 12px; padding: 14px; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface-2); display: flex; flex-direction: column; gap: 11px; overflow: hidden }
.pp-frow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap }
.pp-flabel { font-size: 12px; font-weight: 600; color: var(--ink-3); width: 84px; flex: none }
.pp-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block }
.pp-search { display: flex; align-items: center; gap: 8px; flex: 1 1 220px; min-width: 180px; max-width: 360px; height: 32px; padding: 0 12px; border: 1px solid var(--line); border-radius: var(--r-sm); background: var(--surface) }
.pp-search input { flex: 1; border: 0; background: transparent; font: inherit; font-size: 13.5px; color: var(--ink); outline: none }
.pp-clear { border: 0; background: transparent; cursor: pointer; color: var(--ink-3); display: grid; place-items: center; padding: 2px }
.pp-clear:hover { color: var(--ink) }
.pp-exp-enter-active, .pp-exp-leave-active { transition: opacity .18s ease, transform .18s ease }
.pp-exp-enter-from, .pp-exp-leave-to { opacity: 0; transform: translateY(-6px) }
</style>
