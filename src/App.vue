<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { RouterView, RouterLink, useRouter } from 'vue-router';
import { onClickOutside } from '@vueuse/core';
import FatePlusLogo from './components/shared/FatePlusLogo.vue';
import FateToggle from './components/shared/FateToggle.vue';
import FateIcon from './components/shared/FateIcon.vue';
import FateToast from './components/shared/FateToast.vue';
import ConfirmDialog from './components/shared/ConfirmDialog.vue';
import { useGMModeStore } from './stores/gmMode';
import { useThemeStore } from './stores/theme';
import { useConfirmDialog } from './composables/useConfirmDialog';
import { ToggleVariant } from './types';

const navOpen = ref(false);
const headerRef = ref<HTMLElement | null>(null);
onClickOutside(headerRef, () => { navOpen.value = false; });
const router = useRouter();
const gmModeStore = useGMModeStore();
const themeStore = useThemeStore();
const settingsSpinning = ref(false);
const { confirmDialog, showConfirmDialog } = useConfirmDialog();

const themeIcon = computed(() => themeStore.isDark ? 'moon' as const : 'sun' as const);
const themeLabel = computed(() => themeStore.isDark ? 'Dunkel' : 'Hell');

function cycleTheme() {
  if (themeStore.mode === 'system') {
    showConfirmDialog(
      'Dynamisches Design deaktivieren?',
      'Du verwendest gerade das dynamische Design, basierend auf deinen Systemeinstellungen. Möchtest du das dynamische Design deaktivieren? Du kannst es jederzeit in den Einstellungen reaktivieren.',
      () => { themeStore.mode = themeStore.isDark ? 'light' : 'dark'; },
    );
  } else {
    themeStore.mode = themeStore.isDark ? 'light' : 'dark';
  }
}

function handleSettingsClick() {
  if (!settingsSpinning.value) {
    settingsSpinning.value = true;
    setTimeout(() => { settingsSpinning.value = false; }, 500);
  }
}

watch(
  () => router.currentRoute.value.path,
  () => {
    navOpen.value = false;
  },
);
</script>

<template>
  <div id="app-wrapper">
    <header ref="headerRef" class="app-header">
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
            <button class="nav-link nav-theme-toggle" :aria-label="themeLabel" @click="cycleTheme">
              <span class="theme-icon-wrap">
                <Transition name="theme-icon" mode="out-in">
                  <FateIcon :key="themeIcon" :name="themeIcon" :size="20" />
                </Transition>
              </span>
              <span class="nav-theme-label">{{ themeLabel }}</span>
            </button>
            <RouterLink to="/settings" class="nav-link nav-link-settings" aria-label="Einstellungen" @click="handleSettingsClick">
              <FateIcon name="settings" :size="20" :class="{ 'settings-spinning': settingsSpinning }" />
              <span class="nav-link-settings-label">Einstellungen</span>
            </RouterLink>
          </div>

          <Transition name="gm-toggle">
            <div v-if="gmModeStore.showGMToggle" class="nav-gm-toggle-clip">
              <div
                class="nav-gm-toggle"
                :class="{ 'gm-active': gmModeStore.isGMMode }"
                @click="gmModeStore.isGMMode = !gmModeStore.isGMMode"
              >
                <FateToggle v-model="gmModeStore.isGMMode" label="GM-Modus" :variant="ToggleVariant.Ghost" @click.stop />
              </div>
            </div>
          </Transition>
        </div>
      </nav>
    </header>

    <div class="app-scroll-area">
      <main class="app-main">
        <RouterView />
      </main>
    </div>
    <FateToast />
    <ConfirmDialog
      v-if="confirmDialog"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      confirm-variant="primary"
      @confirm="confirmDialog.onConfirm(); confirmDialog = null"
      @cancel="confirmDialog = null"
    />
  </div>
</template>

<style scoped>
#app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.app-header {
  background-color: var(--fate-header-bg);
  color: white;
  padding: 0;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  flex-shrink: 0;
  z-index: 100;
  container-type: inline-size;
  container-name: header;
}

.app-nav {
  display: flex;
  align-items: stretch;
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
  align-self: center;
}

/* Desktop: invisible flex wrapper that fills remaining space */
.nav-drawer {
  display: flex;
  flex: 1;
  align-items: stretch;
  gap: 1rem;
}

.nav-links {
  display: flex;
  gap: 0.25rem;
  flex: 1;
  margin-left: 1rem;
  align-items: stretch;
}

.nav-link {
  color: rgba(255, 255, 255, 0.85) !important;
  text-decoration: none;
  padding: 0 0.9rem;
  border-radius: 6px 6px 0 0;
  font-weight: 500;
  white-space: nowrap;
  display: flex;
  align-items: center;
  margin-top: 8px;
  transition:
    background 0.15s,
    color 0.15s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white !important;
}

.nav-link.router-link-active {
  background: var(--fate-nav-active-bg);
  color: var(--fate-nav-active-color) !important;
}

.nav-link:active {
  background: rgba(255, 255, 255, 0.22);
}

.nav-link.router-link-active:active {
  background: var(--fate-nav-active-bg);
}

.nav-theme-toggle {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 0.8rem;
}

.theme-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.theme-icon-enter-active {
  animation: theme-icon-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.theme-icon-leave-active {
  animation: theme-icon-out 0.2s ease-in;
  position: absolute;
}

@keyframes theme-icon-in {
  from { opacity: 0; transform: rotate(-90deg) scale(0.5); }
  to   { opacity: 1; transform: rotate(0deg) scale(1); }
}
@keyframes theme-icon-out {
  from { opacity: 1; transform: rotate(0deg) scale(1); }
  to   { opacity: 0; transform: rotate(90deg) scale(0.5); }
}

.nav-theme-label {
  display: none;
}

.nav-link-settings {
  margin-left: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 0.8rem;
}

.nav-link-settings-label {
  display: none;
}

.settings-spinning {
  animation: spin-once 0.5s ease-out;
}

@keyframes spin-once {
  from { transform: rotate(0deg); }
  to   { transform: rotate(180deg); }
}

.nav-gm-toggle-clip {
  overflow: hidden;
  flex-shrink: 0;
  align-self: center;
}

.nav-gm-toggle {
  padding: 0.4rem 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.nav-gm-toggle.gm-active {
  background: var(--fate-red);
  border-color: var(--fate-red);
  box-shadow: none;
}

.gm-toggle-enter-active,
.gm-toggle-leave-active {
  transition:
    max-width 0.35s ease,
    opacity 0.25s ease;
  max-width: 200px;
}

.gm-toggle-enter-from,
.gm-toggle-leave-to {
  max-width: 0;
  opacity: 0;
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
  align-self: center;
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
    background-color: var(--fate-header-bg);
    padding: 0.5rem 1rem 0.75rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 99;
    gap: 0;
  }

  .nav-drawer.nav-open {
    display: flex;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .nav-drawer .nav-links {
    flex-direction: column;
    width: 100%;
    margin-left: 0;
    gap: 0.25rem;
  }

  /* Reset tab styles for mobile drawer links */
  .nav-drawer .nav-link {
    display: flex;
    align-items: center;
    padding: 0.75rem 0.5rem 0.75rem 0.85rem;
    border-radius: 6px;
    margin-top: 0;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9) !important;
  }

  .nav-drawer .nav-link:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white !important;
  }

  .nav-drawer .nav-link.router-link-active {
    background: rgba(255, 255, 255, 0.2);
    color: white !important;
    font-weight: 600;
  }

  .nav-drawer .nav-link:active {
    transform: none;
  }

  /* Theme toggle: hidden on mobile */
  .nav-drawer .nav-theme-toggle {
    display: none;
  }

  /* Settings: show text label and reset alignment */
  .nav-drawer .nav-link-settings {
    padding: 0.75rem 0.5rem 0.75rem 0.85rem;
    gap: 0.6rem;
  }

  .nav-drawer .nav-link-settings-label {
    display: inline;
  }

  /* GM toggle: separator + full width */
  .nav-drawer .nav-gm-toggle-clip {
    width: 100%;
    max-width: none;
    margin-top: 0.5rem;
  }

  .nav-drawer .nav-gm-toggle {
    padding: 0.6rem 0.75rem;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    width: 100%;
    box-sizing: border-box;
    margin-top: 0;
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
