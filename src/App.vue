<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterView, RouterLink, useRouter } from 'vue-router'
import ImportExportBar from './components/shared/ImportExportBar.vue'
import FateToggle from './components/shared/FateToggle.vue'
import FateToast from './components/shared/FateToast.vue'
import { initPersistence } from './composables/usePersistence'
import { useGMModeStore } from './stores/gmMode'

initPersistence()

const navOpen = ref(false)
const router = useRouter()
const gmModeStore = useGMModeStore()

watch(() => router.currentRoute.value.path, () => { navOpen.value = false })
</script>

<template>
  <div id="app-wrapper">
    <header class="app-header">
      <nav class="app-nav">
        <RouterLink to="/" class="nav-logo">
          <span class="fate-plus">FATE+</span>
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

        <div class="nav-gm-toggle">
          <FateToggle v-model="gmModeStore.isGMMode" label="GM-Modus" />
        </div>
      </nav>
    </header>

    <div class="app-scroll-area">
      <main class="app-main">
        <RouterView />
      </main>
    </div>
    <FateToast />
  </div>
</template>

<style>
.nav-gm-toggle {
  padding: 0.4rem 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  flex-shrink: 0;
}
</style>
