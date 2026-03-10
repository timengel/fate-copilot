<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharactersStore } from '../stores/characters'
import { useCampaignsStore } from '../stores/campaigns'
import CharacterSheet from '../components/character/CharacterSheet.vue'
import CharacterForm from '../components/character/CharacterForm.vue'
import type { Character } from '../types'
import { createDefaultCharacter } from '../composables/useCharacterDefaults'

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

const character = computed(() => {
  if (props.isNew) return createDefaultCharacter()
  return charactersStore.getById(id.value)
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
}

function handleCancel() {
  if (props.isNew) {
    router.push('/characters')
  } else {
    isEditing.value = false
  }
}

function toggleEdit() {
  isEditing.value = !isEditing.value
}

function deleteCharacter() {
  if (!character.value) return
  if (confirm(`Charakter "${character.value.name || 'Unbenannt'}" wirklich löschen?`)) {
    charactersStore.deleteCharacter(character.value.id)
    router.push('/characters')
  }
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
      <button class="btn-link" @click="router.push('/characters')">← Zurück</button>
    </div>

    <template v-else-if="character">
      <div class="detail-toolbar">
        <button class="btn-link" @click="router.push('/characters')">← Charaktere</button>
        <div class="toolbar-actions">
          <template v-if="!isNew">
            <button v-if="!isEditing" class="btn-primary" @click="toggleEdit">Bearbeiten</button>
            <button class="btn-danger-outline" @click="deleteCharacter">Löschen</button>
          </template>
        </div>
      </div>

      <CharacterForm
        v-if="isEditing"
        :character="character"
        @save="handleSave"
        @cancel="handleCancel"
      />

      <template v-else>
        <CharacterSheet :character="character" />

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
              <button class="btn-sm btn-danger" @click="unassignFromCampaign(campaign.id)">Entfernen</button>
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
</template>
