<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCampaignsStore } from '../stores/campaigns';
import { useCharactersStore } from '../stores/characters';
import { useItemsStore } from '../stores/items';
import { useGMModeStore } from '../stores/gmMode';
import CampaignForm from '../components/campaign/CampaignForm.vue';
import MilestoneTimeline from '../components/campaign/MilestoneTimeline.vue';
import FateButton from '../components/shared/FateButton.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import type { Campaign, Milestone } from '../types';
import { CAMPAIGN_STATUS_LABEL } from '../types';
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

const campaignItems = computed(() =>
  campaign.value ? campaignsStore.getItemsForCampaign(campaign.value.id) : [],
);

const availableItems = computed(() =>
  itemsStore.items.filter((i) => !campaignItems.value.some((ci) => ci.id === i.id)),
);

function onAssignItem(e: Event) {
  if (e.target instanceof HTMLSelectElement) {
    campaignsStore.assignItem(campaign.value!.id, e.target.value);
    e.target.value = '';
  }
}

function unassignItem(itemId: string) {
  if (!campaign.value) return;
  campaignsStore.unassignItem(campaign.value.id, itemId);
}

function assignCharacter(characterId: string) {
  if (!campaign.value) return;
  campaignsStore.assignCharacter(campaign.value.id, characterId);
}

function onAssignCharacter(e: Event) {
  if (e.target instanceof HTMLSelectElement) {
    assignCharacter(e.target.value);
    e.target.value = '';
  }
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
</script>

<template>
  <div class="detail-view" :style="colorVars">
    <div v-if="!campaign && !isNew" class="not-found">
      Kampagne nicht gefunden.
      <FateButton variant="link" @click="router.push('/campaigns')">← Zurück</FateButton>
    </div>

    <template v-else-if="campaign">
      <div class="detail-toolbar">
        <FateButton variant="link" @click="router.push('/campaigns')">← Kampagnen</FateButton>
        <div class="toolbar-actions">
          <template v-if="!isNew && !isEditing">
            <FateButton icon="edit" @click="isEditing = true">Bearbeiten</FateButton>
            <FateButton variant="danger-outline" @click="deleteCampaign">Löschen</FateButton>
          </template>
        </div>
      </div>

      <CampaignForm
        v-if="isEditing"
        :campaign="campaign"
        @save="handleSave"
        @cancel="handleCancel"
      />

      <template v-else>
        <div class="campaign-detail">
          <div class="campaign-detail-header">
            <h1>{{ campaign.name }}</h1>
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
                <div v-for="char in scCharacters" :key="char.id" class="assignment-row">
                  <div class="assignment-avatar" :style="{ background: getColorVars(char.color)['--fate-blue'] }">{{ char.avatar }}</div>
                  <div class="assignment-info" @click="router.push(`/characters/${char.id}`)">
                    <strong :style="{ color: getColorVars(char.color)['--fate-blue'] }">{{ char.name || '(Unbenannt)' }}</strong>
                    <span v-if="char.highConcept" class="assignment-concept">{{
                      char.highConcept
                    }}</span>
                  </div>
                  <FateButton variant="danger" size="S" @click="unassignCharacter(char.id)"
                    >Entfernen</FateButton
                  >
                </div>

                <template v-if="gmModeStore.isGMMode">
                  <div class="char-group-header">Nicht-Spieler-Charaktere (NSC)</div>
                  <div v-if="nscCharacters.length === 0" class="empty-text">
                    Keine NSC zugeordnet.
                  </div>
                  <div v-for="char in nscCharacters" :key="char.id" class="assignment-row">
                    <div class="assignment-avatar" :style="{ background: getColorVars(char.color)['--fate-blue'] }">{{ char.avatar }}</div>
                    <div class="assignment-info" @click="router.push(`/characters/${char.id}`)">
                      <strong :style="{ color: getColorVars(char.color)['--fate-blue'] }">{{ char.name || '(Unbenannt)' }}</strong>
                      <span v-if="char.highConcept" class="assignment-concept">{{
                        char.highConcept
                      }}</span>
                    </div>
                    <FateButton variant="danger" size="S" @click="unassignCharacter(char.id)"
                      >Entfernen</FateButton
                    >
                  </div>
                </template>
              </template>

              <div v-if="availableCharacters.length > 0" class="assign-row">
                <select
                  class="assign-select"
                  @change="onAssignCharacter"
                >
                  <option value="">Charakter hinzufügen...</option>
                  <optgroup v-if="availableSc.length > 0" label="Spielercharaktere (SC)">
                    <option v-for="c in availableSc" :key="c.id" :value="c.id">
                      {{ c.name || '(Unbenannt)' }}
                    </option>
                  </optgroup>
                  <optgroup
                    v-if="gmModeStore.isGMMode && availableNsc.length > 0"
                    label="Nicht-Spieler-Charaktere (NSC)"
                  >
                    <option v-for="c in availableNsc" :key="c.id" :value="c.id">
                      {{ c.name || '(Unbenannt)' }}
                    </option>
                  </optgroup>
                </select>
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
              <div v-for="item in campaignItems" :key="item.id" class="assignment-row">
                <div class="assignment-avatar" :style="{ background: getColorVars(item.color)['--fate-blue'] }">{{ item.avatar }}</div>
                <div class="assignment-info" @click="router.push(`/items/${item.id}`)">
                  <strong :style="{ color: getColorVars(item.color)['--fate-blue'] }">{{ item.name || '(Unbenannt)' }}</strong>
                  <span v-if="item.description" class="assignment-concept">{{ item.description }}</span>
                </div>
                <FateButton variant="danger" size="S" @click="unassignItem(item.id)">Entfernen</FateButton>
              </div>

              <div v-if="availableItems.length > 0" class="assign-row">
                <select class="assign-select" @change="onAssignItem">
                  <option value="">Gegenstand hinzufügen...</option>
                  <option v-for="i in availableItems" :key="i.id" :value="i.id">
                    {{ i.name || '(Unbenannt)' }}
                  </option>
                </select>
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

.campaign-detail-header h1 {
  font-size: 1.75rem;
  color: var(--fate-blue);
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
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--fate-blue-light);
}

.assignment-avatar {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  line-height: 1;
}

.assignment-row:last-of-type {
  border-bottom: none;
}

.assignment-info {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  flex: 1;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  transition: background 0.1s;
}

.assignment-info:hover {
  background: var(--fate-hover-bg);
}


.assignment-concept {
  font-size: 0.8rem;
  color: var(--fate-text-light);
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

.assign-select {
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--fate-text);
  background: white;
  cursor: pointer;
}

.assign-select:focus {
  outline: none;
  border-color: var(--fate-blue);
}

@container main (width < 480px) {
  .campaign-detail-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}
</style>
