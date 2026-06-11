<template>
  <div>
    <svg width="100%" :height="h" :viewBox="`0 0 ${w} ${h}`" preserveAspectRatio="none" style="display:block">
      <defs>
        <linearGradient :id="gid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" :stop-color="color" stop-opacity="0.22" />
          <stop offset="1" :stop-color="color" stop-opacity="0" />
        </linearGradient>
      </defs>
      <line v-for="(y, i) in grid" :key="i" x1="0" :y1="y" :x2="w" :y2="y" stroke="#EDEEF1" stroke-width="1" vector-effect="non-scaling-stroke" />
      <path :d="area" :fill="`url(#${gid})`" />
      <path :d="line" fill="none" :stroke="color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
    </svg>
    <div class="chart-x"><span v-for="(d, i) in data" :key="i">{{ d.l }}</span></div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ data: { l: string; v: number }[]; color?: string; h?: number }>(), {
  color: '#8E3FC4', h: 210
})
const w = 680
const gid = 'mrrgrad'
const geom = computed(() => {
  const padTop = 18, padBot = 6
  const vals = props.data.map((d) => d.v)
  const max = Math.max(...vals), min = Math.min(...vals), rng = (max - min) || 1
  const top = max + rng * 0.3, bot = Math.max(0, min - rng * 0.5), R = (top - bot) || 1
  const step = w / (props.data.length - 1)
  const X = (i: number) => i * step
  const Y = (v: number) => padTop + (1 - (v - bot) / R) * (props.h - padTop - padBot)
  const pts = props.data.map((d, i) => [X(i), Y(d.v)])
  let line = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], mx = (x0 + x1) / 2
    line += ` C ${mx.toFixed(1)} ${y0.toFixed(1)}, ${mx.toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`
  }
  const grid = [0, 1, 2, 3].map((i) => padTop + i * ((props.h - padTop - padBot) / 3))
  return { line, area: line + ` L ${w} ${props.h} L 0 ${props.h} Z`, grid }
})
const line = computed(() => geom.value.line)
const area = computed(() => geom.value.area)
const grid = computed(() => geom.value.grid)
</script>
