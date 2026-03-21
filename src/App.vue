<script setup lang="ts">
import { ref, watch } from 'vue';
import { RouterView, RouterLink, useRouter } from 'vue-router';
import FatePlusLogo from './components/shared/FatePlusLogo.vue';
import FateToggle from './components/shared/FateToggle.vue';
import FateIcon from './components/shared/FateIcon.vue';
import FateToast from './components/shared/FateToast.vue';
import { useGMModeStore } from './stores/gmMode';
import { ToggleVariant } from './types';

const navOpen = ref(false);
const router = useRouter();
const gmModeStore = useGMModeStore();

watch(
  () => router.currentRoute.value.path,
  () => {
    navOpen.value = false;
  },
);
</script>

<template>
  <div id="app-wrapper">
    <header class="app-header">
      <nav class="app-nav">
        <RouterLink to="/" class="nav-logo">
          <FatePlusLogo class="fate-plus-logo"/>
        </RouterLink>

        <button
          class="nav-hamburger"
          :class="{ 'nav-open': navOpen }"
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
            <RouterLink to="/items" class="nav-link">Gegenstände</RouterLink>
            <RouterLink to="/skills" class="nav-link">Fertigkeiten</RouterLink>
            <RouterLink to="/settings" class="nav-link nav-link-settings" aria-label="Einstellungen">
              <FateIcon name="settings" :size="20" />
              <span class="nav-link-settings-label">Einstellungen</span>
            </RouterLink>
          </div>

          <div
            v-if="gmModeStore.showGMToggle"
            class="nav-gm-toggle"
            :class="{ 'gm-active': gmModeStore.isGMMode }"
            @click="gmModeStore.isGMMode = !gmModeStore.isGMMode"
          >
            <FateToggle v-model="gmModeStore.isGMMode" label="GM-Modus" :variant="ToggleVariant.Ghost" @click.stop />
          </div>
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

<style scoped>
#app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.app-header {
  background-color: var(--fate-blue);
  color: white;
  padding: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  position: relative;
  flex-shrink: 0;
  z-index: 100;
  container-type: inline-size;
  container-name: header;
}

.app-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.5rem;
  height: 56px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: 900;
  color: white !important;
  letter-spacing: -1px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 1px;
}

/* Desktop: invisible flex wrapper that fills remaining space */
.nav-drawer {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 1rem;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  margin-left: 1rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9) !important;
  text-decoration: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-weight: 500;
  transition: background 0.15s;
  white-space: nowrap;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  color: white !important;
}

.nav-link:active {
  background: rgba(255, 255, 255, 0.28);
  transform: scale(0.97);
}

.nav-link-settings {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.55rem;
}

.nav-link-settings-label {
  display: none;
}

.nav-link-settings:active svg {
  animation: spin-once 0.8s ease-out;
}

@keyframes spin-once {
  from { transform: rotate(0deg); }
  to   { transform: rotate(180deg); }
}

.nav-gm-toggle {
  padding: 0.4rem 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  flex-shrink: 0;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.nav-gm-toggle.gm-active {
  background: var(--fate-red);
  border-color: var(--fate-red);
  box-shadow: none;
}

/* Hamburger: hidden on desktop */
.nav-hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  flex: 1;
  height: 100%;
  -webkit-tap-highlight-color: transparent;
}

.nav-hamburger:active {
  background: transparent;
}

.hamburger-bar {
  display: block;
  width: 22px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
  transform-origin: center;
}

.nav-hamburger.nav-open .hamburger-bar:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.nav-hamburger.nav-open .hamburger-bar:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.nav-hamburger.nav-open .hamburger-bar:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

@container header (width < 1130px) {
  .nav-hamburger {
    display: flex;
  }

  .nav-drawer {
    display: none;
    flex-direction: column;
    align-items: stretch;
    position: absolute;
    top: 56px;
    left: 0;
    right: 0;
    background-color: var(--fate-blue);
    padding: 0.5rem 1rem 0.75rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 99;
    gap: 0;
  }

  .nav-drawer.nav-open {
    display: flex;
    border-top: 1px solid white;
  }

  .nav-drawer .nav-links {
    flex-direction: column;
    width: 100%;
    margin-left: 0;
    gap: 0.25rem;
  }

  /* Full-width touch targets */
  .nav-drawer .nav-link {
    display: flex;
    align-items: center;
    padding: 0.75rem 0.5rem 0.75rem 0.85rem;
    border-radius: 6px;
  }

  .nav-drawer .nav-link:active {
    transform: none;
  }

  /* Settings: show text label and reset alignment */
  .nav-drawer .nav-link-settings {
    margin-left: 0;
    padding: 0.75rem 0.5rem 0.75rem 0.85rem;
    gap: 0.6rem;
  }

  .nav-drawer .nav-link-settings-label {
    display: inline;
  }

  /* GM toggle: separator + full width */
  .nav-drawer .nav-gm-toggle {
    margin-top: 0.5rem;
    padding: 0.6rem 0.75rem;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    width: 100%;
    box-sizing: border-box;
  }
}

@container header (width < 360px) {
  .nav-logo {
    font-size: 1.25rem;
  }
}

.app-scroll-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  width: 100%;
  container-type: inline-size;
  container-name: main;
}

@media (max-width: 480px) {
  .app-main {
    padding: 0.75rem;
  }
}
@media (max-width: 360px) {
  .app-main {
    padding: 0.5rem;
  }
}
</style>
