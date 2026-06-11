<template>
  <aside class="sidebar">
    <div class="sb-brand">
      <span class="sb-logo"><img :src="'/brand/eenvo-mark.svg'" alt="" /></span>
      <img class="sb-word-img" :src="'/brand/eenvo-word-light.svg'" alt="eenvo" />
    </div>
    <nav class="sb-scroll">
      <div v-for="g in NAV" :key="g.group" class="sb-group">
        <div class="sb-label">{{ g.group }}</div>
        <NuxtLink
          v-for="it in g.items"
          :key="it.id"
          :to="it.to"
          class="nav-item"
          :class="{ active: isActive(it) }"
        >
          <Icon :name="it.icon" :size="19" />
          <span>{{ it.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { NAV } from '~/utils/protoData'

const route = useRoute()
function isActive(it: { to: string }) {
  if (it.to === '/') return route.path === '/'
  return route.path.startsWith(it.to)
}
</script>

<style scoped>
.nav-item, .nav-item:hover, .nav-item:focus { text-decoration: none; }
.sb-scroll { padding-bottom: 16px; }
</style>
