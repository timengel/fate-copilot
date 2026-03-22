<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCampaignsStore } from '../stores/campaigns';
import { useCharactersStore } from '../stores/characters';
import { useItemsStore } from '../stores/items';
import { useGMModeStore } from '../stores/gmMode';
import CampaignForm from '../components/campaign/CampaignForm.vue';
import MilestoneTimeline from '../components/campaign/MilestoneTimeline.vue';
import FateAvatar from '../components/shared/FateAvatar.vue';
import FateButton from '../components/shared/FateButton.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import FateDropdown from '../components/shared/FateDropdown.vue';
import type { Campaign, Milestone } from '../types';
import { CAMPAIGN_STATUS_LABEL, DropdownVariant } from '../types';
import { getColorVars } from '../composables/useColorVars';
import { useConfirmDialog } from '../composables/useConfirmDialog';
import { createDefaultCampaign } from '../composables/useCharacterDefaults';

const props = defineProps<{
  isNew?: boolean;
  editMode?: boolean;
}>();

const route = useRoute();
const router = useRouter();
const campaignsStore = useCampaignsStore();
const charactersStore = useCharactersStore();
const itemsStore = useItemsStore();
const gmModeStore = useGMModeStore();

const id = computed(() => {
  const param = route.params.id;
  return Array.isArray(param) ? (param[0] ?? '') : (param ?? '');
});
const isEditing = ref(props.isNew || props.editMode || false);
const selectedCharacterId = ref('');
const selectedItemId = ref('');
const { confirmDialog, showConfirmDialog } = useConfirmDialog();

const colorVars = computed(() => getColorVars(campaign.value?.color));

const campaign = computed(() => {
  if (props.isNew) return createDefaultCampaign();
  return campaignsStore.getById(id.value);
});

const campaignCharacters = computed(() =>
  campaign.value ? campaignsStore.getCharactersForCampaign(campaign.value.id) : [],
);

const scCharacters = computed(() =>
  campaignCharacters.value.filter((c) => (c.type ?? 'sc') === 'sc'),
);
const nscCharacters = computed(() => campaignCharacters.value.filter((c) => c.type === 'nsc'));

const availableCharacters = computed(() =>
  charactersStore.characters.filter((c) => !campaignCharacters.value.some((cc) => cc.id === c.id)),
);
const availableSc = computed(() =>
  availableCharacters.value.filter((c) => (c.type ?? 'sc') === 'sc'),
);
const availableNsc = computed(() => availableCharacters.value.filter((c) => c.type === 'nsc'));
const availableCharacterGroups = computed(() => [
  {
    label: 'Spielercharaktere (SC)',
    options: availableSc.value.map((c) => ({ value: c.id, label: c.name || 'Unbenannt' })),
  },
  {
    label: 'Nicht-Spieler-Charaktere (NSC)',
    options: availableNsc.value.map((c) => ({ value: c.id, label: c.name || 'Unbenannt' })),
  },
].filter((group) => group.options.length > 0));
const availableItemOptions = computed(() =>
  availableItems.value.map((i) => ({ value: i.id, label: i.name || 'Unbenannt' })),
);

function handleSave(updated: Campaign) {
  if (props.isNew) {
    campaignsStore.addCampaign(updated);
    router.push('/campaigns');
  } else {
    campaignsStore.updateCampaign(updated);
    isEditing.value = false;
  }
}

function handleCancel() {
  if (props.isNew) {
    router.push('/campaigns');
  } else {
    isEditing.value = false;
  }
}

function deleteCampaign() {
  if (!campaign.value) return;
  showConfirmDialog(
    'Kampagne löschen',
    `Kampagne "${campaign.value.name}" wirklich löschen?`,
    () => {
      campaignsStore.deleteCampaign(campaign.value!.id);
      router.push('/campaigns');
    },
  );
}

const campaignItems = computed(() => {
  const items = campaign.value ? campaignsStore.getItemsForCampaign(campaign.value.id) : [];
  return items.filter((i) => !i.archived && (gmModeStore.isGMMode || !i.hidden));
});

const availableItems = computed(() =>
  itemsStore.items.filter(
    (i) => !i.archived && !campaignItems.value.some((ci) => ci.id === i.id) && (gmModeStore.isGMMode || !i.hidden),
  ),
);

function onAssignItem(itemId: string) {
  if (!campaign.value || !itemId) return;
  campaignsStore.assignItem(campaign.value.id, itemId);
  selectedItemId.value = '';
}

function unassignItem(itemId: string) {
  if (!campaign.value) return;
  campaignsStore.unassignItem(campaign.value.id, itemId);
}

function assignCharacter(characterId: string) {
  if (!campaign.value) return;
  campaignsStore.assignCharacter(campaign.value.id, characterId);
}

function onAssignCharacter(characterId: string) {
  if (!characterId) return;
  assignCharacter(characterId);
  selectedCharacterId.value = '';
}

function unassignCharacter(characterId: string) {
  if (!campaign.value) return;
  campaignsStore.unassignCharacter(campaign.value.id, characterId);
}

function addMilestone(milestone: Milestone) {
  if (!campaign.value) return;
  campaignsStore.addMilestone(campaign.value.id, milestone);
}

function removeMilestone(milestoneId: string) {
  if (!campaign.value) return;
  campaignsStore.removeMilestone(campaign.value.id, milestoneId);
}

function updateMilestone(milestone: Milestone) {
  if (!campaign.value) return;
  campaignsStore.updateMilestone(campaign.value.id, milestone);
}

function navigateToAssignment(path: string) {
  router.push(path);
}
</script>

<template>
  <div class="detail-view" :style="colorVars">
    <div v-if="!campaign && !isNew" class="not-found">
      Kampagne nicht gefunden.
      <FateButton variant="link" @click="router.push('/campaigns')">← Zurück</FateButton>
    </div>

    <template v-else-if="campaign">
      <div class="detail-toolbar">
        <div class="back-btn">
          <FateButton variant="secondary" icon="arrow-left" @click="router.push('/campaigns')"><span class="btn-label">Kampagnen</span></FateButton>
        </div>
        <div class="toolbar-actions">
          <template v-if="!isNew && !isEditing">
            <FateButton variant="secondary" icon="edit" @click="isEditing = true" />
            <FateButton variant="danger" icon="delete" @click="deleteCampaign" />
          </template>
        </div>
      </div>

      <CampaignForm
        v-if="isEditing"
        :isNew="isNew"
        :campaign="campaign"
        @save="handleSave"
        @cancel="handleCancel"
      />

      <template v-else>
        <div class="campaign-detail">
          <div class="campaign-detail-header">
            <div class="campaign-title">
              <FateAvatar :value="campaign.avatar" :background="colorVars['--fate-blue']" />
              <h1>{{ campaign.name }}</h1>
            </div>
            <span class="badge" :class="`status-${campaign.status}`">
              {{ CAMPAIGN_STATUS_LABEL[campaign.status] }}
            </span>
          </div>

          <p v-if="campaign.description" class="campaign-description">{{ campaign.description }}</p>

          <div v-if="campaign.notes" class="campaign-notes">
            <strong>Notizen:</strong>
            <p>{{ campaign.notes }}</p>
          </div>

          <div v-if="gmModeStore.isGMMode && campaign.gmNotes" class="campaign-gm-notes">
            <strong>GM-Notizen:</strong>
            <p>{{ campaign.gmNotes }}</p>
          </div>

          <!-- MEILENSTEINE -->
          <section class="sheet-section">
            <div class="sheet-section-header">MEILENSTEINE</div>
            <MilestoneTimeline
              :milestones="campaign.milestones"
              @add="addMilestone"
              @remove="removeMilestone"
              @update="updateMilestone"
            />
          </section>

          <!-- CHARAKTERE -->
          <section class="sheet-section">
            <div class="sheet-section-header">CHARAKTERE</div>
            <div class="campaign-characters">
              <div v-if="campaignCharacters.length === 0" class="empty-text">
                Noch keine Charaktere zugeordnet.
              </div>

              <template v-else>
                <div class="char-group-header">Spielercharaktere (SC)</div>
                <div v-if="scCharacters.length === 0" class="empty-text">Keine SC zugeordnet.</div>
                <div
                  v-for="char in scCharacters"
                  :key="char.id"
                  class="assignment-row"
                >
                  <button
                    type="button"
                    class="assignment-main assignment-main--clickable"
                    @click="navigateToAssignment(`/characters/${char.id}`)"
                  >
                    <FateAvatar
                      class="assignment-avatar"
                      :value="char.avatar"
                      size="S"
                      :background="getColorVars(char.color)['--fate-blue']"
                    />
                    <div class="assignment-info">
                      <strong :style="{ color: getColorVars(char.color)['--fate-blue'] }">{{ char.name || 'Unbenannt' }}</strong>
                      <span v-if="char.highConcept" class="assignment-concept">{{
                        char.highConcept
                      }}</span>
                    </div>
                  </button>
                  <div v-if="gmModeStore.isGMMode" class="assignment-actions">
                    <FateButton variant="danger" size="S" icon="close" @click="unassignCharacter(char.id)"
                      ><span class="btn-label">Entfernen</span></FateButton
                    >
                  </div>
                </div>

                <template v-if="gmModeStore.isGMMode">
                  <div class="char-group-header">Nicht-Spieler-Charaktere (NSC)</div>
                  <div v-if="nscCharacters.length === 0" class="empty-text">
                    Keine NSC zugeordnet.
                  </div>
                  <div
                    v-for="char in nscCharacters"
                    :key="char.id"
                    class="assignment-row"
                  >
                    <button
                      type="button"
                      class="assignment-main assignment-main--clickable"
                      @click="navigateToAssignment(`/characters/${char.id}`)"
                    >
                      <FateAvatar
                        class="assignment-avatar"
                        :value="char.avatar"
                        size="S"
                        :background="getColorVars(char.color)['--fate-blue']"
                      />
                      <div class="assignment-info">
                        <strong :style="{ color: getColorVars(char.color)['--fate-blue'] }">{{ char.name || 'Unbenannt' }}</strong>
                        <span v-if="char.highConcept" class="assignment-concept">{{
                          char.highConcept
                        }}</span>
                      </div>
                    </button>
                    <div class="assignment-actions">
                      <FateButton variant="danger" size="S" icon="close" @click="unassignCharacter(char.id)"
                        ><span class="btn-label">Entfernen</span></FateButton
                      >
                    </div>
                  </div>
                </template>
              </template>

              <div v-if="gmModeStore.isGMMode && availableCharacters.length > 0" class="assign-row">
                <FateDropdown
                  v-model="selectedCharacterId"
                  class="assign-dropdown"
                  size="S"
                  :variant="DropdownVariant.Secondary"
                  placeholder="Charakter hinzufügen..."
                  :groups="availableCharacterGroups"
                  @change="onAssignCharacter"
                />
              </div>
            </div>
          </section>

          <!-- ITEMS -->
          <section class="sheet-section">
            <div class="sheet-section-header">ITEMS</div>
            <div class="campaign-characters">
              <div v-if="campaignItems.length === 0" class="empty-text">
                Noch keine Gegenstände zugeordnet.
              </div>
              <div
                v-for="item in campaignItems"
                :key="item.id"
                class="assignment-row"
              >
                <button
                  type="button"
                  class="assignment-main assignment-main--clickable"
                  @click="navigateToAssignment(`/items/${item.id}`)"
                >
                  <FateAvatar
                    class="assignment-avatar"
                    :value="item.avatar"
                    size="S"
                    :background="getColorVars(item.color)['--fate-blue']"
                  />
                  <div class="assignment-info">
                    <strong :style="{ color: getColorVars(item.color)['--fate-blue'] }">{{ item.name || 'Unbenannt' }}</strong>
                    <span v-if="item.description" class="assignment-concept">{{ item.description }}</span>
                  </div>
                </button>
                <div v-if="gmModeStore.isGMMode" class="assignment-actions">
                  <FateButton variant="danger" size="S" icon="close" @click="unassignItem(item.id)"><span class="btn-label">Entfernen</span></FateButton>
                </div>
              </div>

              <div v-if="gmModeStore.isGMMode && availableItems.length > 0" class="assign-row">
                <FateDropdown
                  v-model="selectedItemId"
                  class="assign-dropdown"
                  size="S"
                  :variant="DropdownVariant.Secondary"
                  placeholder="Gegenstand hinzufügen..."
                  :options="availableItemOptions"
                  @change="onAssignItem"
                />
              </div>
            </div>
          </section>
        </div>
      </template>
    </template>
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
</template>

<style scoped>
.back-btn {
  --fate-blue: #1c9ed6;
  --fate-blue-dark: #1480b0;
  --fate-blue-light: #e8f4fb;
}

.not-found {
  padding: 2rem;
  text-align: center;
  color: var(--fate-text-light);
}

.campaign-detail-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.campaign-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.campaign-detail-header h1 {
  font-size: 1.75rem;
  color: var(--fate-blue);
  margin: 0;
}

.badge {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-active {
  background: #d4edda;
  color: var(--fate-green);
}
.status-inactive {
  background: #f0f0f0;
  color: #666;
}
.status-completed {
  background: #d1ecf1;
  color: #0c5460;
}

.campaign-description {
  color: var(--fate-text);
  margin-bottom: 0.75rem;
}

.campaign-notes {
  background: #fffbea;
  border-left: 3px solid #f0c040;
  padding: 0.5rem 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.campaign-gm-notes {
  background: #f0f4ff;
  border-left: 3px solid var(--fate-blue);
  padding: 0.5rem 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.campaign-characters,
.campaign-assignments {
  padding: 0.5rem 0.75rem;
}

.assignment-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.4rem;
  border-bottom: 1px solid var(--fate-blue-light);
}

.assignment-row:last-of-type {
  border-bottom: none;
}

.assignment-main {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.assignment-main--clickable {
  appearance: none;
  border: none;
  background: transparent;
  width: 100%;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
  transition: background 0.1s;
}

.assignment-main--clickable:hover {
  background: var(--fate-blue-light);
}

.assignment-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.assignment-actions {
  flex-shrink: 0;
}


.assignment-info strong {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.assignment-concept {
  font-size: 0.8rem;
  color: var(--fate-text-light);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.char-group-header {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fate-text-light);
  padding: 0.5rem 0 0.25rem;
  border-bottom: 1px solid var(--fate-border);
  margin-bottom: 0.25rem;
}

.char-group-header:first-child {
  padding-top: 0;
}

.assign-row {
  padding-top: 0.5rem;
}

.assign-dropdown {
  min-width: min(100%, 15rem);
}

.sheet-section {
  margin-bottom: 1rem;
}

@container main (width < 480px) {
  .campaign-detail-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .detail-toolbar {
    flex-wrap: nowrap;
  }

  .btn-label {
    display: none;
  }

  .assignment-actions :deep(.fate-btn) {
    padding: 0;
    width: var(--btn-size, 32px);
    justify-content: center;
  }
}
</style>
