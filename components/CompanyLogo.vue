<template>
  <span class="logo-slot logo-edit" :style="{ width: size + 'px', height: size + 'px', borderRadius: radius + 'px', flex: '0 0 ' + size + 'px' }" title="Clique para enviar um logo" @click.stop="pick" @pointerdown.stop @pointerup.stop>
    <img v-if="lead.logoUrl" :src="lead.logoUrl" class="logo-real" :style="{ borderRadius: radius + 'px' }" alt="" />
    <span v-else class="logo-fallback" :style="{ background: lead.logo, color: '#fff', borderRadius: radius + 'px', fontSize: (fontSize || Math.round(size * 0.4)) + 'px' }">{{ lead.initials }}</span>
    <span class="logo-add" aria-hidden="true"><Icon name="plus" :size="Math.max(12, Math.round(size * 0.36))" /></span>
    <input ref="fileInput" type="file" accept="image/*" style="display:none" @click.stop @change="onFile" />
  </span>
</template>

<script setup lang="ts">
import { resizeImage } from '~/utils/img'
const props = withDefaults(defineProps<{ lead: any; size?: number; radius?: number; fontSize?: number }>(), { size: 32, radius: 8 })
const { setLeadLogo } = useCrm()
const fileInput = ref<HTMLInputElement>()
function pick() { fileInput.value?.click() }
async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  if (!f) return
  const url = await resizeImage(f, 256)
  setLeadLogo(props.lead.id, url)
  input.value = ''
}
</script>

<style scoped>
.logo-slot { position: relative; cursor: pointer; overflow: hidden; display: inline-grid; place-items: center; }
.logo-real { width: 100%; height: 100%; object-fit: contain; background: #fff; }
.logo-add { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(17, 24, 39, .5); color: #fff; opacity: 0; transition: opacity .15s; }
.logo-slot:hover .logo-add { opacity: 1; }
</style>
