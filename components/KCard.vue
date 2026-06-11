<template>
  <div
    class="kcard" :class="{ dragging }" draggable="true"
    @pointerdown="onDown" @pointerup="onUp"
    @dragstart="onDragStart" @dragend="$emit('dragend')"
  >
    <div class="top">
      <CompanyLogo :lead="lead" :size="36" :radius="10" :font-size="14" />
      <div class="grow">
        <div class="co">{{ lead.company }}</div>
        <div class="seg">{{ lead.seg }}</div>
      </div>
      <span class="temp" :style="{ color: TEMPC[lead.temp] }" :title="lead.temp"><span class="fl" :style="{ background: TEMPC[lead.temp] }" /></span>
    </div>
    <div class="valrow">
      <div class="val">{{ fmtBRL(lead.value) }}<span>/mês</span></div>
      <span style="font-size:11.5px;color:var(--ink-3)">{{ lead.shipments }}</span>
    </div>
    <div class="kc-origin">
      <AmbienteTag :id="lead.ambiente" size="sm" />
      <span class="uf-pill"><Icon name="pin" :size="11" />{{ lead.estado }} · {{ lead.regiao }}</span>
    </div>
    <div v-if="lead.ambiente === 'indicacao' && lead.indicadoPor" class="kc-ref">
      <Icon name="arrow-up-right" :size="13" /> Indicado por <b>{{ lead.indicadoPor.name.split(' ')[0] }}</b>
    </div>
    <div v-if="lead.next && lead.next.label !== '—'" class="next" :class="{ due: lead.next.due }">
      <Icon :name="lead.next.due ? 'clock' : 'calendar'" :size="14" />
      <span class="truncate">{{ lead.next.label }}</span>
    </div>
    <div class="meta">
      <EAvatar :name="lead.contact.name" :photo="lead.contact.photo" :size="22" />
      <span style="font-size:12px;color:var(--ink-2)" class="truncate">{{ lead.contact.name.split(' ')[0] }}</span>
      <span style="margin-left:auto;font-size:11.5px;color:var(--ink-3);font-family:var(--font-mono)">{{ lead.id }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fmtBRL } from '~/utils/protoData'
const props = defineProps<{ lead: any; dragging?: boolean }>()
const emit = defineEmits(['open', 'dragstart', 'dragend'])
const TEMPC: Record<string, string> = { quente: '#DC2626', morno: '#D97706', frio: '#2563EB' }

// Cards são draggable; o evento `click` nativo é engolido pelo HTML5 drag.
// Usamos pointer events com limite de movimento para distinguir clique de arraste.
let downX = 0, downY = 0, didDrag = false
function onDown(e: PointerEvent) { downX = e.clientX; downY = e.clientY; didDrag = false }
function onDragStart() { didDrag = true; emit('dragstart', props.lead) }
function onUp(e: PointerEvent) {
  if (didDrag) return
  if (Math.hypot(e.clientX - downX, e.clientY - downY) < 6) emit('open', props.lead.id)
}
</script>
