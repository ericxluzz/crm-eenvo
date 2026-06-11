<template>
  <span class="badge" :class="'badge-' + cls"><span class="dot" />{{ name }}</span>
</template>

<script setup lang="ts">
import { STAGES } from '~/utils/protoData'
const props = defineProps<{ stage: string }>()
const MAP: Record<string, string> = { mapeado: 'gray', contatado: 'info', reuniao: 'purple', apresentado: 'info', proposta: 'warn', perdido: 'neg' }
const cls = computed(() => MAP[props.stage] || 'gray')
const name = computed(() => STAGES.find((s) => s.id === props.stage)?.name || props.stage)
</script>
