<template>
  <span
    class="avatar" :class="{ ring }"
    :style="{ width: size + 'px', height: size + 'px', fontSize: Math.round(size * 0.38) + 'px', background: (photo && !err) ? '#E6E2F0' : color }"
  >
    <img v-if="photo && !err" :src="photo" :alt="name" loading="lazy" @error="err = true" />
    <template v-else>{{ ini }}</template>
  </span>
</template>

<script setup lang="ts">
import { initials } from '~/utils/protoData'
const props = withDefaults(defineProps<{ name?: string; photo?: string | null; size?: number; ring?: boolean; color?: string }>(), {
  name: '', photo: null, size: 32, ring: false, color: '#8E3FC4'
})
const err = ref(false)
const ini = computed(() => initials(props.name || '?'))
</script>
