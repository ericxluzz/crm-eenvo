<template>
  <span v-if="a" class="amb-tag" :class="{ sm: size === 'sm' }" :style="{ background: a.color + '1A', color: a.color }">
    <Icon :name="a.icon" :size="size === 'sm' ? 12 : 13" /> {{ a.short }}
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ id: string; size?: string }>(), { size: 'md' })
const { ambById } = useCrm()
const a = computed(() => ambById(props.id))
</script>
