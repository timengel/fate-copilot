<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharactersStore } from '../stores/characters'
import { useCampaignsStore } from '../stores/campaigns'
import CharacterSheet from '../components/character/CharacterSheet.vue'
import FateButton from '../components/shared/FateButton.vue'
import ConfirmDialog from '../components/shared/ConfirmDialog.vue'
import type { Character, CharacterType } from '../types'
import { createDefaultCharacter } from '../composables/useCharacterDefaults'
import { useConfirmDialog } from '../composables/useConfirmDialog'
import { useToastStore } from '../stores/toast'

const props = defineProps<{
  isNew?: boolean
  editMode?: boolean
}>()

const route = useRoute()
const router = useRouter()
const charactersStore = useCharactersStore()
const campaignsStore = useCampaignsStore()

const id = computed(() => route.params.id as string)
const isEditing = ref(props.isNew || props.editMode || false)
const { confirmDialog, showConfirmDialog } = useConfirmDialog()
const toastStore = useToastStore()

const character = computed(() => {
  if (props.isNew) {
    const type = (route.query.type as CharacterType) ?? 'sc'
    return createDefaultCharacter(type)
  }
  return charactersStore.getById(id.value)
})

const backPath = computed(() => {
  if (props.isNew) {
    return route.query.type === 'nsc' ? '/characters?tab=nsc' : '/characters'
  }
  return (character.value?.type ?? 'sc') === 'nsc' ? '/characters?tab=nsc' : '/characters'
})

const characterCampaigns = computed(() =>
  character.value ? campaignsStore.getCampaignsForCharacter(character.value.id) : []
)

const availableCampaigns = computed(() =>
  campaignsStore.campaigns.filter(c =>
    !characterCampaigns.value.some(cc => cc.id === c.id)
  )
)

function handleSave(updated: Character) {
  if (props.isNew) {
    charactersStore.addCharacter(updated)
    router.replace(`/characters/${updated.id}`)
  } else {
    charactersStore.updateCharacter(updated)
    isEditing.value = false
  }
  toastStore.show('Charakter gespeichert')
}

function handleCancel() {
  if (props.isNew) {
    router.push(backPath.value)
  } else {
    isEditing.value = false
  }
}

function toggleEdit() {
  isEditing.value = !isEditing.value
}

function deleteCharacter() {
  if (!character.value) return
  showConfirmDialog(
    'Charakter löschen',
    `Charakter "${character.value.name || 'Unbenannt'}" wirklich löschen?`,
    () => {
      charactersStore.deleteCharacter(character.value!.id)
      router.push(backPath.value)
    },
  )
}

function assignToCampaign(campaignId: string) {
  if (!character.value) return
  campaignsStore.assignCharacter(campaignId, character.value.id)
}

function unassignFromCampaign(campaignId: string) {
  if (!character.value) return
  campaignsStore.unassignCharacter(campaignId, character.value.id)
}
</script>

<template>
  <div class="detail-view">
    <div v-if="!character && !isNew" class="not-found">
      Charakter nicht gefunden.
      <FateButton variant="link" @click="router.push(backPath)">← Zurück</FateButton>
    </div>

    <template v-else-if="character">
      <div class="detail-toolbar">
        <FateButton variant="link" @click="router.push(backPath)">← Charaktere</FateButton>
        <div class="toolbar-actions">
          <template v-if="!isNew">
            <FateButton v-if="!isEditing" icon="edit" @click="toggleEdit">Bearbeiten</FateButton>
            <FateButton variant="danger-outline" @click="deleteCharacter">Löschen</FateButton>
          </template>
        </div>
      </div>

      <CharacterSheet
        v-if="isEditing"
        mode="edit"
        :key="character.id"
        :character="character"
        @save="handleSave"
        @cancel="handleCancel"
      />

      <template v-else>
        <CharacterSheet :character="character" @save="handleSave" />

        <!-- KAMPAGNEN-ZUORDNUNG -->
        <section class="sheet-section campaigns-section">
          <div class="sheet-section-header">KAMPAGNEN</div>
          <div class="campaign-assignments">
            <div v-if="characterCampaigns.length === 0" class="empty-text">
              Keiner Kampagne zugeordnet.
            </div>
            <div v-for="campaign in characterCampaigns" :key="campaign.id" class="assignment-row">
              <span class="assignment-name" @click="router.push(`/campaigns/${campaign.id}`)">
                {{ campaign.name }}
              </span>
              <FateButton variant="danger" size="S" @click="unassignFromCampaign(campaign.id)">Entfernen</FateButton>
            </div>

            <div v-if="availableCampaigns.length > 0" class="assign-row">
              <select class="assign-select" @change="assignToCampaign(($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                <option value="">Kampagne zuordnen...</option>
                <option v-for="c in availableCampaigns" :key="c.id" :value="c.id">
                  {{ c.name }}
                </option>
              </select>
            </div>
          </div>
        </section>
      </template>
    </template>
  </div>

  <ConfirmDialog
    v-if="confirmDialog"
    :title="confirmDialog.title"
    :message="confirmDialog.message"
    @confirm="confirmDialog.onConfirm(); confirmDialog = null"
    @cancel="confirmDialog = null"
  />
</template>

<style scoped>
.not-found {
  padding: 2rem;
  text-align: center;
  color: var(--fate-text-light);
}

.campaigns-section {
  margin-top: 1rem;
  background: white;
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  overflow: hidden;
}

.campaign-assignments {
  padding: 0.5rem 0.75rem;
}

.assignment-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--fate-blue-light);
}

.assignment-row:last-of-type {
  border-bottom: none;
}

.assignment-name {
  cursor: pointer;
  color: var(--fate-blue);
  font-weight: 500;
}

.assignment-name:hover {
  text-decoration: underline;
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
</style>
