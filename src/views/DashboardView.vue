<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCampaignsStore } from '../stores/campaigns'
import { useCharactersStore } from '../stores/characters'
import CharacterSheet from '../components/character/CharacterSheet.vue'
import CharacterForm from '../components/character/CharacterForm.vue'
import FateButton from '../components/shared/FateButton.vue'
import type { Character } from '../types'

const campaignsStore = useCampaignsStore()
const charactersStore = useCharactersStore()

const editingId = ref<string | null>(null)
const formRef = ref<InstanceType<typeof CharacterForm>[]>([])

const characters = computed(() => {
  const seen = new Set<string>()
  const result = []
  for (const campaign of campaignsStore.activeCampaigns) {
    for (const character of campaignsStore.getCharactersForCampaign(campaign.id)) {
      if (!seen.has(character.id)) {
        seen.add(character.id)
        result.push(character)
      }
    }
  }
  return result
})

function handleSave(updated: Character) {
  charactersStore.updateCharacter(updated)
  editingId.value = null
}

function saveEditing() {
  formRef.value?.[0]?.save()
}
</script>

<template>
  <div class="dashboard-view">
    <div v-if="characters.length === 0" class="dashboard-empty">
      Keine Charaktere in aktiven Kampagnen gefunden.
    </div>
    <div v-else class="dashboard-stack">
      <div v-for="character in characters" :key="character.id" class="dashboard-entry">
        <div class="dashboard-entry-toolbar">
          <template v-if="editingId === character.id">
            <FateButton variant="secondary" size="S" @click="editingId = null">Abbrechen</FateButton>
            <FateButton variant="primary" size="S" @click="saveEditing">Speichern</FateButton>
          </template>
          <template v-else>
            <FateButton icon="edit" variant="secondary" size="S" @click="editingId = character.id">Bearbeiten</FateButton>
          </template>
        </div>
        <CharacterForm
          v-if="editingId === character.id"
          ref="formRef"
          :character="character"
          :hideActions="true"
          @save="handleSave"
          @cancel="editingId = null"
        />
        <CharacterSheet v-else :character="character" />
      </div>
    </div>
  </div>
</template>
