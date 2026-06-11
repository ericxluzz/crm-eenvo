<template>
  <div class="card stat">
    <div class="stat-top">
      <span class="ic" :style="{ background: iconBg, color: iconFg }"><Icon :name="icon" :size="19" /></span>
      <span v-if="delta != null" class="delta-pill" :class="up ? 'up' : 'down'">
        <Icon :name="up ? 'arrow-up' : 'arrow-down'" :size="13" />{{ Math.abs(delta) }}%
      </span>
    </div>
    <div class="num">{{ value }}</div>
    <div class="stat-lbl">{{ label }}</div>
    <div v-if="foot" class="foot">{{ foot }}</div>
    <div v-if="spark" class="stat-spark"><MiniSpark :points="spark" :h="26" :color="up ? '#16A34A' : '#DC2626'" /></div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  icon: string; iconBg: string; iconFg: string; label: string
  value: string | number; delta?: number | null; foot?: string; spark?: number[]
}>(), { delta: null })
const up = computed(() => props.delta == null || props.delta >= 0)
</script>
