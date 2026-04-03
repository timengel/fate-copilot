<script setup lang="ts">
import ImportExportBar from '../components/shared/ImportExportBar.vue';
import FateHeader from '../components/shared/FateHeader.vue';
import FateToggle from '../components/shared/FateToggle.vue';
import FateButton from '../components/shared/FateButton.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import { useGMModeStore } from '../stores/gmMode';
import { useThemeStore, type ThemeMode } from '../stores/theme';
import { useCampaignsStore } from '../stores/campaigns';
import { useCharactersStore } from '../stores/characters';
import { useItemsStore } from '../stores/items';
import { useSkillsStore } from '../stores/skills';
import { useDashboardPreferencesStore } from '../stores/dashboardPreferences';
import { useToastStore } from '../stores/toast';
import { useCharacterItemsStore } from '../stores/characterItems';
import { useConfirmDialog } from '../composables/useConfirmDialog';
import { useRouter } from 'vue-router';
import { ToggleVariant } from '@fate/types';
import FateIcon from '../components/shared/FateIcon.vue';
import type { ButtonIcon } from '../types';

const gmModeStore = useGMModeStore();
const themeStore = useThemeStore();

const themeOptions: { value: ThemeMode; label: string; icon: ButtonIcon }[] = [
  { value: 'light', label: 'Hell', icon: 'sun' },
  { value: 'dark', label: 'Dunkel', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'monitor' },
];
const campaignsStore = useCampaignsStore();
const charactersStore = useCharactersStore();
const itemsStore = useItemsStore();
const skillsStore = useSkillsStore();
const dashboardStore = useDashboardPreferencesStore();
const characterItemsStore = useCharacterItemsStore();
const toastStore = useToastStore();
const router = useRouter();
const { confirmDialog, showConfirmDialog } = useConfirmDialog();

function handleConfirm() {
  confirmDialog.value?.onConfirm();
  confirmDialog.value = null;
}

function handleCancel() {
  confirmDialog.value = null;
}

function clearAllData() {
  showConfirmDialog(
    'Wirklich alle Daten löschen?',
    'Alle Kampagnen, Charaktere, Gegenstände und Einstellungen werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.',
    () => {
      localStorage.clear();
      sessionStorage.clear();
      campaignsStore.reset();
      charactersStore.reset();
      itemsStore.reset();
      characterItemsStore.reset();
      skillsStore.resetToDefaults();
      gmModeStore.reset();
      dashboardStore.reset();
      toastStore.show('Alle Daten wurden gelöscht');
      router.push('/');
    },
  );
}
</script>

<template>
  <div class="settings-view list-view">
    <FateHeader title="Einstellungen" />

    <section class="settings-section">
      <h2>Oberfläche</h2>
      <div class="settings-row">
        <div class="settings-row-label">
          <span>Erscheinungsbild</span>
          <span class="settings-row-description">Wähle zwischen hellem, dunklem oder systembasiertem Design.</span>
        </div>
        <div class="theme-selector" role="group" aria-label="Erscheinungsbild">
          <button
            v-for="opt in themeOptions"
            :key="opt.value"
            class="theme-btn"
            :class="{ 'theme-btn--active': themeStore.mode === opt.value }"
            @click="themeStore.mode = opt.value"
          >
            <FateIcon :name="opt.icon" :size="14" />
            {{ opt.label }}
          </button>
        </div>
      </div>
      <div class="settings-row">
        <div class="settings-row-label">
          <span>Sichtbarkeit des GM-Modus-Toggle</span>
          <span class="settings-row-description">Zeigt den GM-Modus-Toggle in der Navigationsleiste an.</span>
        </div>
        <FateToggle v-model="gmModeStore.showGMToggle" :variant="ToggleVariant.Danger" />
      </div>
    </section>

    <section class="settings-section">
      <h2>Daten</h2>
      <p class="settings-description">
        Exportiere alle Daten als JSON-Datei oder kopiere sie als JSON-String in die
        Zwischenablage. Importiere eine Sicherung über eine Datei oder per Einfügen.
      </p>
      <ImportExportBar />
    </section>

    <section class="settings-section settings-section--danger">
      <h2>Gefahrenzone</h2>
      <div class="settings-row">
        <div class="settings-row-label">
          <span>Alle Daten löschen</span>
          <span class="settings-row-description">Löscht alle Kampagnen, Charaktere, Gegenstände und Einstellungen unwiderruflich.</span>
        </div>
        <FateButton variant="danger" @click="clearAllData">Zurücksetzen</FateButton>
      </div>
    </section>

    <ConfirmDialog
      v-if="confirmDialog"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.settings-view {
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.settings-section {
  background: var(--fate-white);
  border: 1px solid var(--fate-border);
  border-radius: 8px;
  padding: 1.25rem 1.5rem 1.25rem;
}

.settings-section h2 {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fate-heading);
  margin: 0 0 1rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--fate-light-border);
}

.settings-description {
  font-size: 0.875rem;
  color: var(--fate-text-light);
  margin: 0 0 1rem;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0;
}

.settings-row + .settings-row {
  border-top: 1px solid var(--fate-light-border);
}

.settings-row-label {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.9rem;
}

.settings-row-description {
  font-size: 0.8rem;
  color: var(--fate-text-light);
}

.settings-section--danger {
  border-color: var(--fate-red);
}

.settings-section--danger h2 {
  color: var(--fate-red);
}

.theme-selector {
  display: flex;
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.theme-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  font-family: inherit;
  background: var(--fate-white);
  color: var(--fate-text-light);
  border: none;
  border-right: 1px solid var(--fate-border);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.theme-btn:last-child {
  border-right: none;
}

.theme-btn:hover:not(.theme-btn--active) {
  background: var(--fate-hover-bg);
  color: var(--fate-text);
}

.theme-btn--active {
  background: var(--fate-btn-primary-bg, var(--fate-blue));
  color: white;
  font-weight: 600;
}

@container main (max-width: 480px) {
  .settings-section {
    padding: 1rem;
  }

  .settings-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
