<template>
  <svg width="100%" :height="h" :viewBox="`0 0 ${w} ${h}`" preserveAspectRatio="none" style="display:block">
    <defs>
      <linearGradient :id="gid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="color" stop-opacity="0.20" />
        <stop offset="1" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path :d="area" :fill="`url(#${gid})`" />
    <path :d="line" fill="none" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ points: number[]; color?: string; w?: number; h?: number }>(), {
  color: '#16A34A', w: 130, h: 36
})
const gid = computed(() => 'ms' + props.color.replace('#', '') + props.points.join('').slice(0, 6))
const geom = computed(() => {
  const pts = props.points
  const max = Math.max(...pts), min = Math.min(...pts), rng = (max - min) || 1
  const step = props.w / (pts.length - 1)
  const P = pts.map((p, i) => [i * step, props.h - 3 - ((p - min) / rng) * (props.h - 8)])
  let line = `M ${P[0][0]} ${P[0][1]}`
  for (let i = 0; i < P.length - 1; i++) {
    const [x0, y0] = P[i], [x1, y1] = P[i + 1], mx = (x0 + x1) / 2
    line += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`
  }
  return { line, area: line + ` L ${props.w} ${props.h} L 0 ${props.h} Z` }
})
const line = computed(() => geom.value.line)
const area = computed(() => geom.value.area)
</script>
