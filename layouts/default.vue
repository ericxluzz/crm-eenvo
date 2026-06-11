<template>
  <div class="app">
    <AppSidebar />
    <div class="main">
      <AppTopbar />
      <div class="content">
        <slot />
      </div>
    </div>
    <AppOverlays />
  </div>
</template>

<script setup lang="ts">
// Shell do CRM eenvo (porte do protótipo): sidebar escura + topbar + conteúdo.
</script>
