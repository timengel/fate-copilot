<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCampaignsStore } from '../stores/campaigns'
import { useCharactersStore } from '../stores/characters'
import CampaignForm from '../components/campaign/CampaignForm.vue'
import MilestoneTimeline from '../components/campaign/MilestoneTimeline.vue'
import FateButton from '../components/shared/FateButton.vue'
import type { Campaign, CampaignStatus, Milestone } from '../types'

const props = defineProps<{
  isNew?: boolean
}>()

const route = useRoute()
const router = useRouter()
const campaignsStore = useCampaignsStore()
const charactersStore = useCharactersStore()

const id = computed(() => route.params.id as string)
const isEditing = ref(props.isNew || false)

const campaign = computed(() => {
  if (props.isNew) {
    return {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      status: 'active' as const,
      notes: '',
    }
  }
  return campaignsStore.getById(id.value)
})

const campaignCharacters = computed(() =>
  campaign.value ? campaignsStore.getCharactersForCampaign(campaign.value.id) : []
)

const availableCharacters = computed(() =>
  charactersStore.characters.filter(c =>
    !campaignCharacters.value.some(cc => cc.id === c.id)
  )
)

const STATUS_LABEL: Record<CampaignStatus, string> = {
  active: 'Aktiv',
  inactive: 'Inaktiv',
  completed: 'Abgeschlossen',
}

function handleSave(updated: Campaign) {
  if (props.isNew) {
    campaignsStore.addCampaign(updated)
    router.push('/campaigns')
  } else {
    campaignsStore.updateCampaign(updated)
    isEditing.value = false
  }
}

function handleCancel() {
  if (props.isNew) {
    router.push('/campaigns')
  } else {
    isEditing.value = false
  }
}

function deleteCampaign() {
  if (!campaign.value) return
  if (confirm(`Kampagne "${campaign.value.name}" wirklich löschen?`)) {
    campaignsStore.deleteCampaign(campaign.value.id)
    router.push('/campaigns')
  }
}

function assignCharacter(characterId: string) {
  if (!campaign.value) return
  campaignsStore.assignCharacter(campaign.value.id, characterId)
}

function unassignCharacter(characterId: string) {
  if (!campaign.value) return
  campaignsStore.unassignCharacter(campaign.value.id, characterId)
}

function addMilestone(milestone: Milestone) {
  if (!campaign.value) return
  campaignsStore.addMilestone(campaign.value.id, milestone)
}

function removeMilestone(milestoneId: string) {
  if (!campaign.value) return
  campaignsStore.removeMilestone(campaign.value.id, milestoneId)
}

function updateMilestone(milestone: Milestone) {
  if (!campaign.value) return
  campaignsStore.updateMilestone(campaign.value.id, milestone)
}
</script>

<template>
  <div class="detail-view">
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
              {{ STATUS_LABEL[campaign.status] }}
            </span>
          </div>

          <p v-if="campaign.description" class="campaign-description">{{ campaign.description }}</p>

          <div v-if="campaign.notes" class="campaign-notes">
            <strong>Notizen:</strong>
            <p>{{ campaign.notes }}</p>
          </div>

          <!-- MEILENSTEINE -->
          <section class="sheet-section">
            <div class="sheet-section-header">MEILENSTEINE</div>
            <MilestoneTimeline
              :milestones="campaign.milestones ?? []"
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
              <div v-for="char in campaignCharacters" :key="char.id" class="assignment-row">
                <div class="assignment-info" @click="router.push(`/characters/${char.id}`)">
                  <strong>{{ char.name || '(Unbenannt)' }}</strong>
                  <span v-if="char.highConcept" class="assignment-concept">{{ char.highConcept }}</span>
                </div>
                <FateButton variant="danger" size="S" @click="unassignCharacter(char.id)">Entfernen</FateButton>
              </div>

              <div v-if="availableCharacters.length > 0" class="assign-row">
                <select class="assign-select" @change="assignCharacter(($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                  <option value="">Charakter hinzufügen...</option>
                  <option v-for="c in availableCharacters" :key="c.id" :value="c.id">
                    {{ c.name || '(Unbenannt)' }}
                  </option>
                </select>
              </div>
            </div>
          </section>
        </div>
      </template>
    </template>
  </div>
</template>
