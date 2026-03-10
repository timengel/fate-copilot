<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterView, RouterLink, useRouter } from 'vue-router'
import ImportExportBar from './components/shared/ImportExportBar.vue'
import { initPersistence } from './composables/usePersistence'

initPersistence()

const navOpen = ref(false)
const router = useRouter()
watch(() => router.currentRoute.value.path, () => { navOpen.value = false })
</script>

<template>
  <div id="app-wrapper">
    <header class="app-header">
      <nav class="app-nav">
        <RouterLink to="/" class="nav-logo">
          <span class="fate-plus">+</span>FATE
        </RouterLink>

        <button
          class="nav-hamburger"
          :aria-expanded="navOpen"
          aria-label="Navigation öffnen"
          @click="navOpen = !navOpen"
        >
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
        </button>

        <div class="nav-drawer" :class="{ 'nav-open': navOpen }">
          <div class="nav-links">
            <RouterLink to="/dashboard" class="nav-link">Dashboard</RouterLink>
            <RouterLink to="/campaigns" class="nav-link">Kampagnen</RouterLink>
            <RouterLink to="/characters" class="nav-link">Charaktere</RouterLink>
            <RouterLink to="/skills" class="nav-link">Fertigkeiten</RouterLink>
          </div>
          <ImportExportBar />
        </div>
      </nav>
    </header>

    <div class="app-scroll-area">
      <main class="app-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>
