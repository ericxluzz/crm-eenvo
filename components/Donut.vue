<template>
  <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
    <circle :cx="cx" :cy="cy" :r="r" fill="none" stroke="#EEF0F3" stroke-width="16" />
    <circle
      v-for="(s, i) in arcs" :key="i"
      :cx="cx" :cy="cy" :r="r" fill="none" :stroke="s.c" stroke-width="16"
      :stroke-dasharray="`${s.len} ${C - s.len}`" :stroke-dashoffset="-s.off"
      stroke-linecap="butt" :transform="`rotate(-90 ${cx} ${cy})`"
    />
    <text :x="cx" :y="cy - 3" text-anchor="middle" font-size="26" font-weight="600" fill="#1A1A1A" font-family="var(--font-mono)">{{ total }}</text>
    <text :x="cx" :y="cy + 15" text-anchor="middle" font-size="11" fill="#8A8F99">{{ label }}</text>
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ segments: { v: number; c: string }[]; size?: number; label?: string }>(), {
  size: 150, label: 'leads'
})
const r = computed(() => props.size / 2 - 14)
const cx = computed(() => props.size / 2)
const cy = computed(() => props.size / 2)
const C = computed(() => 2 * Math.PI * r.value)
const total = computed(() => props.segments.reduce((a, s) => a + s.v, 0) || 1)
const arcs = computed(() => {
  let off = 0
  return props.segments.map((s) => {
    const len = C.value * (s.v / total.value)
    const a = { c: s.c, len, off }
    off += len
    return a
  })
})
</script>
