<script setup lang="ts">
import { computed, ref } from 'vue';
import { useSkillsStore } from '../stores/skills';
import { useToastStore } from '../stores/toast';
import FateButton from '../components/shared/FateButton.vue';
import FateHeader from '../components/shared/FateHeader.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import { useConfirmDialog } from '../composables/useConfirmDialog';
import FateIcon from '../components/shared/FateIcon.vue';
import FateDropdown from '../components/shared/FateDropdown.vue';
import { useGMModeStore } from '../stores/gmMode';
import { SkillAction, DropdownVariant } from '../types';
import type { AppSkill, SkillInfo } from '../types';

const SKILL_ACTION_OPTIONS = Object.values(SkillAction).map((v) => ({ value: v, label: v }));

const store = useSkillsStore();
const toastStore = useToastStore();
const gmModeStore = useGMModeStore();
const newSkillName = ref('');
const infoSkill = ref<string | null>(null);
const { confirmDialog, showConfirmDialog } = useConfirmDialog();

const showImportDialog = ref(false);
const importJson = ref('');
const importError = ref('');

interface LegacySkillInfoImport {
  description?: string;
  actions?: { name: SkillAction; note?: string; examples?: string }[];
}

interface LegacySkillActionLike {
  name: SkillAction;
  note?: string;
  examples?: string;
}

function getActionExamples(action: LegacySkillActionLike): string {
  return action.examples ?? action.note ?? '';
}

function isSkillObject(value: unknown): value is AppSkill {
  return (
    typeof value === 'object' && value !== null && typeof (value as AppSkill).name === 'string'
  );
}

function normalizeSkillInfo(actions: LegacySkillInfoImport['actions'] = []): SkillInfo['actions'] {
  return actions
    .filter(
      (action): action is NonNullable<LegacySkillInfoImport['actions']>[number] =>
        !!action && typeof action.name === 'string',
    )
    .map((action) => ({
      name: action.name,
      examples: action.examples ?? action.note ?? '',
    }));
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(
      JSON.stringify(
        {
          skills: store.skills.map((name) => ({
            name,
            description: store.skillInfo[name]?.description ?? '',
            actions: (store.skillInfo[name]?.actions ?? []).map((action) => ({
              name: action.name,
              examples: getActionExamples(action),
            })),
          })),
        },
        null,
        2,
      ),
    );
    toastStore.show('Fertigkeiten kopiert');
  } catch {
    toastStore.show('Kopieren fehlgeschlagen');
  }
}

function openImportDialog() {
  importJson.value = '';
  importError.value = '';
  showImportDialog.value = true;
}

function handleImport() {
  importError.value = '';
  try {
    let data: unknown;
    try {
      data = JSON.parse(importJson.value);
    } catch {
      throw new Error('Ungültiges JSON-Format.');
    }
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      throw new Error('JSON muss ein Objekt sein.');
    }
    const obj = data as Record<string, unknown>;
    if (!Array.isArray(obj.skills)) {
      throw new Error('Das Feld "skills" muss ein Array sein.');
    }

    if (obj.skills.every((s) => typeof s === 'string')) {
      const legacySkillInfo = (obj.skillInfo as Record<string, LegacySkillInfoImport>) ?? {};
      const normalizedInfo = Object.fromEntries(
        Object.entries(legacySkillInfo).map(([name, info]) => [
          name,
          {
            description: info?.description ?? '',
            actions: normalizeSkillInfo(info?.actions),
          },
        ]),
      );

      store.replaceAllWithInfo(obj.skills as string[], normalizedInfo);
    } else if (obj.skills.every(isSkillObject)) {
      const importedSkills = obj.skills as AppSkill[];
      store.replaceAllWithInfo(
        importedSkills.map((skill) => skill.name),
        Object.fromEntries(
          importedSkills.map((skill) => [
            skill.name,
            {
              description: skill.description ?? '',
              actions: normalizeSkillInfo(skill.actions),
            },
          ]),
        ),
      );
    } else {
      throw new Error('Das Feld "skills" muss ein Array aus Strings oder Skill-Objekten sein.');
    }
    toastStore.show('Fertigkeiten importiert');
    showImportDialog.value = false;
  } catch (e) {
    importError.value = e instanceof Error ? e.message : 'Unbekannter Fehler.';
  }
}

const sortedSkills = computed(() => [...store.skills].sort((a, b) => a.localeCompare(b, 'de')));

function add() {
  const trimmed = newSkillName.value.trim();
  if (trimmed) {
    store.addSkill(trimmed);
    toastStore.show(`Fertigkeit "${trimmed}" hinzugefügt`);
    newSkillName.value = '';
  }
}

function resetToDefaults() {
  showConfirmDialog(
    'Fertigkeiten zurücksetzen',
    'Die Fertigkeitsliste wird auf die Fate-Core-Standardfertigkeiten zurückgesetzt. Eigene Anpassungen gehen verloren.',
    () => store.resetToDefaults(),
  );
}

function openInfo(skill: string) {
  infoSkill.value = skill;
  editing.value = false;
}

function closeInfo() {
  infoSkill.value = null;
  editing.value = false;
}

// Edit mode
const editing = ref(false);
const editDescription = ref('');
const editActions = ref<SkillInfo['actions']>([]);
const newActionName = ref<SkillAction | ''>('');
const newActionExamples = ref('');

function openEdit() {
  const info = store.skillInfo[infoSkill.value!] ?? { description: '', actions: [] };
  editDescription.value = info.description;
  editActions.value = info.actions.map((action) => ({
    name: action.name,
    examples: getActionExamples(action),
  }));
  newActionName.value = '';
  newActionExamples.value = '';
  editing.value = true;
}

function addAction() {
  const name = newActionName.value;
  if (!name) return;
  editActions.value.push({ name, examples: newActionExamples.value.trim() || undefined });
  newActionName.value = '';
  newActionExamples.value = '';
}

function saveEdit() {
  const info: SkillInfo = {
    description: editDescription.value.trim(),
    actions: editActions.value.map((a) => ({
      name: a.name,
      examples: a.examples?.trim() || undefined,
    })),
  };
  store.setSkillInfo(infoSkill.value!, info);
  editing.value = false;
}

function cancelEdit() {
  editing.value = false;
}

const selectedInfo = computed<SkillInfo>(
  () => store.skillInfo[infoSkill.value ?? ''] ?? { description: '', actions: [] },
);

const usedActionNames = computed(() => new Set(editActions.value.map((a) => a.name)));

const availableActionOptions = computed(() =>
  SKILL_ACTION_OPTIONS.filter((o) => !usedActionNames.value.has(o.value as SkillAction)),
);

const allActionsAdded = computed(() => editActions.value.length >= SKILL_ACTION_OPTIONS.length);

function actionOptionsFor(currentName: SkillAction) {
  return SKILL_ACTION_OPTIONS.filter(
    (o) => o.value === currentName || !usedActionNames.value.has(o.value as SkillAction),
  );
}
</script>

<template>
  <div class="list-view">
    <FateHeader title="Fertigkeiten">
      <div class="header-actions">
        <FateButton
          v-if="gmModeStore.isGMMode"
          variant="secondary"
          icon="paste"
          @click="openImportDialog"
          ><span class="btn-label">Importieren</span></FateButton
        >
        <FateButton variant="secondary" icon="copy" @click="handleCopy"
          ><span class="btn-label">Kopieren</span></FateButton
        >
      </div>
    </FateHeader>

    <p class="skills-hint">
      Diese Fertigkeiten stehen in der Skill-Pyramide als Dropdown-Optionen zur Verfügung.
    </p>

    <div class="skills-manage">
      <div>
        <div
          v-for="skill in sortedSkills"
          :key="skill"
          class="skill-manage-row skill-manage-row--clickable"
          @click="openInfo(skill)"
        >
          <div class="skill-manage-label">
            <span class="skill-manage-name">{{ skill }}</span>
            <FateIcon name="info" :size="14" class="skill-info-icon" />
          </div>
          <div class="skill-manage-actions">
            <FateButton
              v-if="gmModeStore.isGMMode"
              icon="close"
              variant="danger"
              size="S"
              @click.stop="store.removeSkill(skill)"
            />
          </div>
        </div>
        <div v-if="store.skills.length === 0" class="empty-state">
          Keine Fertigkeiten vorhanden.
        </div>
      </div>

      <div v-if="gmModeStore.isGMMode" class="skill-add-row">
        <input
          class="skill-add-input"
          v-model="newSkillName"
          placeholder="Neue Fertigkeit..."
          @keydown.enter="add"
        />
        <FateButton :disabled="!newSkillName.trim()" @click="add">Hinzufügen</FateButton>
      </div>
    </div>

    <div v-if="gmModeStore.isGMMode" class="reset-btn-wrapper">
      <FateButton variant="danger" icon="reset" @click="resetToDefaults">
        <span class="reset-label-full">Auf Standard zurücksetzen</span>
        <span class="reset-label-short">Zurücksetzen</span>
      </FateButton>
    </div>
  </div>

  <ConfirmDialog
    v-if="confirmDialog"
    :title="confirmDialog.title"
    :message="confirmDialog.message"
    @confirm="
      confirmDialog.onConfirm();
      confirmDialog = null;
    "
    @cancel="confirmDialog = null"
  />

  <!-- Info Modal -->
  <Teleport to="body">
    <div v-if="infoSkill" class="skill-info-overlay" @click.self="closeInfo">
      <div class="skill-info-modal">
        <div class="skill-info-header">
          <h2>{{ infoSkill }}</h2>
          <div class="skill-info-header-actions">
            <FateButton
              v-if="gmModeStore.isGMMode && !editing"
              icon="edit"
              variant="secondary"
              class="skill-edit-btn"
              @click="openEdit"
            >
              <span class="edit-label-full">Bearbeiten</span>
            </FateButton>
            <FateButton
              icon="close"
              variant="secondary"
              class="skill-info-close"
              @click="closeInfo"
            />
          </div>
        </div>

        <!-- View mode -->
        <template v-if="!editing">
          <p v-if="selectedInfo.description" class="skill-info-description">
            {{ selectedInfo.description }}
          </p>
          <p v-else class="skill-info-empty">Keine Beschreibung vorhanden.</p>

          <div v-if="selectedInfo.actions.length" class="skill-info-actions">
            <h3>Aktionen</h3>
            <ul>
              <li v-for="action in selectedInfo.actions" :key="action.name">
                <strong>{{ action.name }}</strong>
                <span v-if="getActionExamples(action)">: {{ getActionExamples(action) }}</span>
              </li>
            </ul>
          </div>
        </template>

        <!-- Edit mode -->
        <template v-else>
          <div class="skill-edit-section">
            <label class="skill-edit-label">Beschreibung</label>
            <textarea
              v-model="editDescription"
              rows="3"
              class="skill-edit-textarea"
              placeholder="Beschreibung der Fertigkeit..."
            />
          </div>

          <div class="skill-edit-section">
            <label class="skill-edit-label">Aktionen</label>
            <div v-for="(action, i) in editActions" :key="i" class="skill-edit-action-row">
              <FateDropdown
                v-model="action.name"
                :options="actionOptionsFor(action.name)"
                :variant="DropdownVariant.Subtle"
                size="S"
                style="
                  flex: 1;
                  --dropdown-width: 100%;
                  --dropdown-min-width: 0;
                  --dropdown-max-width: none;
                "
              />
              <input
                v-model="action.examples"
                class="skill-edit-input skill-edit-input--note"
                placeholder="Einsatzbeispiele"
              />
              <FateButton
                icon="close"
                variant="danger"
                size="S"
                @click="editActions.splice(i, 1)"
              />
            </div>

            <div v-if="!allActionsAdded" class="skill-edit-action-row skill-edit-add-row">
              <FateDropdown
                v-model="newActionName"
                :options="availableActionOptions"
                placeholder="Neue Aktion..."
                :variant="DropdownVariant.Subtle"
                size="S"
                style="
                  flex: 1;
                  --dropdown-width: 100%;
                  --dropdown-min-width: 0;
                  --dropdown-max-width: none;
                "
              />
              <input
                v-model="newActionExamples"
                class="skill-edit-input skill-edit-input--note"
                placeholder="Einsatzbeispiele"
                @keydown.enter="addAction"
              />
              <FateButton variant="secondary" size="S" :disabled="!newActionName" @click="addAction"
                >+</FateButton
              >
            </div>
          </div>

          <div class="skill-edit-footer">
            <FateButton variant="secondary" @click="cancelEdit">Abbrechen</FateButton>
            <FateButton @click="saveEdit">Speichern</FateButton>
          </div>
        </template>
      </div>
    </div>
  </Teleport>

  <!-- Import Dialog -->
  <Teleport to="body">
    <div v-if="showImportDialog" class="dialog-overlay" @click.self="showImportDialog = false">
      <div class="dialog-box">
        <div class="dialog-title">Fertigkeiten importieren</div>
        <div class="dialog-message">JSON einfügen (z. B. von einer KI generiert):</div>
        <textarea
          v-model="importJson"
          class="json-input"
          placeholder='{ "skills": [{ "name": "Athletik", "description": "", "actions": [{ "name": "Vorteil erschaffen", "examples": "..." }] }] }'
          spellcheck="false"
          @keydown.stop
        />
        <div v-if="importError" class="error-message">{{ importError }}</div>
        <div class="dialog-actions">
          <FateButton icon="close" variant="secondary" @click="showImportDialog = false"
            >Abbrechen</FateButton
          >
          <FateButton icon="paste" :disabled="!importJson.trim()" @click="handleImport"
            >Importieren</FateButton
          >
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.header-actions {
  display: flex;
  gap: 0.5rem;
}
.skills-hint {
  color: var(--fate-text-light);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.skills-manage {
  background: var(--fate-white);
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  overflow: hidden;
  margin: 0 auto 3rem auto;
}

@container main (width < 480px) {
  .skills-manage {
    margin-bottom: 1.5rem;
  }
}

.skill-manage-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1rem;
  border-bottom: 1px solid var(--fate-blue-light);
  transition: background 0.1s;
}

.skill-manage-row--clickable {
  cursor: pointer;
}

.skill-manage-row--clickable:hover {
  background: var(--fate-hover-bg);
}

.skill-manage-row--clickable:active {
  background: var(--fate-blue-light);
}

.skill-manage-actions {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}

/* Skill info modal */
.skill-info-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.skill-info-modal {
  background: var(--fate-white);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 640px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
}

.skill-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  border-bottom: 2px solid var(--fate-blue);
  padding-bottom: 0.5rem;
  gap: 0.5rem;
}

.skill-info-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--fate-heading);
  margin: 0;
  flex: 1;
}

.skill-info-header-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.skill-info-close {
  font-size: 1.1rem;
  color: var(--fate-muted);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}
.skill-info-close:hover {
  background: var(--fate-blue-light);
}

.skill-info-description {
  font-size: 0.9rem;
  color: var(--fate-text);
  margin: 0 0 1rem;
  line-height: 1.5;
}

.skill-info-empty {
  font-size: 0.9rem;
  color: var(--fate-text-light);
  font-style: italic;
  margin: 0 0 1rem;
}

.skill-info-actions h3 {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--fate-muted);
  margin: 0 0 0.5rem;
}

.skill-info-actions ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.skill-info-actions li {
  font-size: 0.875rem;
  color: var(--fate-text);
  padding: 0.4rem 0.6rem;
  background: var(--fate-blue-light);
  border-radius: 4px;
  line-height: 1.4;
}

.skill-info-actions li strong {
  color: var(--fate-blue);
}

.skill-manage-row:last-child {
  border-bottom: none;
}

.skill-manage-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.skill-info-icon {
  color: var(--fate-text-light);
  flex-shrink: 0;
}

.skill-manage-name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--fate-text);
}

.skill-add-row {
  display: flex;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-top: 1px solid var(--fate-border);
  background: var(--fate-blue-light);
}

.skill-add-input {
  flex: 1;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--fate-text);
  background: var(--fate-white);
  outline: none;
}

.skill-add-input:focus {
  border-color: var(--fate-blue);
}

.reset-btn-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.75rem;
}

.reset-label-short {
  display: none;
}

@container main (width < 480px) {
  .reset-label-full {
    display: none;
  }

  .reset-label-short {
    display: inline;
  }
}

/* Edit label responsive */
.edit-label-full {
  display: inline;
}

@media (max-width: 480px) {
  .edit-label-full {
    display: none;
  }

  .skill-edit-btn {
    width: 32px;
    padding: 0;
    justify-content: center;
  }
}

/* Edit mode styles */
.skill-edit-section {
  margin-bottom: 1rem;
}

.skill-edit-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--fate-muted);
  margin-bottom: 0.4rem;
}

.skill-edit-textarea {
  width: 100%;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--fate-text);
  background: var(--fate-white);
  outline: none;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.5;
}

.skill-edit-textarea:focus {
  border-color: var(--fate-blue);
}

.skill-edit-action-row {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  margin-bottom: 0.4rem;
}

.skill-edit-input {
  flex: 1;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--fate-text);
  background: var(--fate-white);
  outline: none;
  min-width: 0;
}

.skill-edit-input--note {
  flex: 2;
  min-width: 0;
}

.skill-edit-input:focus {
  border-color: var(--fate-blue);
}

.skill-edit-add-row {
  margin-top: 0.6rem;
  padding-top: 0.6rem;
  border-top: 1px dashed var(--fate-border);
}

.skill-edit-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--fate-border);
}

.dialog-overlay {
  position: fixed;
  inset: 0;
  background: var(--fate-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-box {
  background: var(--fate-white);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 560px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dialog-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--fate-text);
}

.dialog-message {
  font-size: 0.9rem;
  color: var(--fate-text-light);
}

.json-input {
  width: 100%;
  min-height: 180px;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: monospace;
  color: var(--fate-text);
  background: var(--fate-bg);
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}

.json-input:focus {
  border-color: var(--fate-blue);
}

.error-message {
  font-size: 0.85rem;
  color: var(--fate-red, #e53935);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
