<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import ImportExportBar from './components/shared/ImportExportBar.vue'
import { initPersistence } from './composables/usePersistence'

initPersistence()
</script>

<template>
  <div id="app-wrapper">
    <header class="app-header">
      <nav class="app-nav">
        <RouterLink to="/" class="nav-logo">
          <span class="fate-plus">+</span>FATE
        </RouterLink>
        <div class="nav-links">
          <RouterLink to="/dashboard" class="nav-link">Dashboard</RouterLink>
          <RouterLink to="/campaigns" class="nav-link">Kampagnen</RouterLink>
          <RouterLink to="/characters" class="nav-link">Charaktere</RouterLink>
          <RouterLink to="/skills" class="nav-link">Fertigkeiten</RouterLink>
        </div>
        <ImportExportBar />
      </nav>
    </header>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>
