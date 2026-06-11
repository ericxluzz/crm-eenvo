<template>
  <span class="badge" :style="{ background: chip[0], color: chip[1] }"><span class="dot" :style="{ background: chip[1] }" />{{ name }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{ stage: string }>()
const { stageName, stageChip } = useCrm()
const name = computed(() => stageName(props.stage))
const chip = computed(() => stageChip(props.stage))
</script>
