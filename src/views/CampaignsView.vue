<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaignsStore } from '../stores/campaigns'
import FateButton from '../components/shared/FateButton.vue'
import ConfirmDialog from '../components/shared/ConfirmDialog.vue'
import type { Campaign, CampaignStatus } from '../types'
import { CHARACTER_COLORS } from '../types'

function colorVarsFor(campaign: Campaign) {
  const c = CHARACTER_COLORS.find(c => c.id === campaign.color) ?? CHARACTER_COLORS[0]!
  return { '--fate-blue': c.primary, '--fate-blue-dark': c.dark, '--fate-blue-light': c.light }
}

const router = useRouter()
const store = useCampaignsStore()
const confirmDialog = ref<{ title: string; message: string; onConfirm: () => void } | null>(null)

const STATUS_LABEL: Record<CampaignStatus, string> = {
  active: 'Aktiv',
  inactive: 'Inaktiv',
  completed: 'Abgeschlossen',
}

function deleteCampaign(id: string, name: string) {
  confirmDialog.value = {
    title: 'Kampagne löschen',
    message: `Kampagne "${name}" wirklich löschen?`,
    onConfirm: () => store.deleteCampaign(id),
  }
}
</script>

<template>
  <div class="list-view">
    <div class="list-header">
      <h1>Kampagnen</h1>
      <FateButton @click="router.push('/campaigns/new')">+ Neue Kampagne</FateButton>
    </div>

    <div v-if="store.campaigns.length === 0" class="empty-state">
      Noch keine Kampagnen vorhanden.
    </div>

    <div v-else class="card-grid">
      <div
        v-for="campaign in store.campaigns"
        :key="campaign.id"
        class="campaign-card"
        :style="colorVarsFor(campaign)"
        @click="router.push(`/campaigns/${campaign.id}`)"
      >
        <div class="card-header">{{ campaign.name }}</div>
        <div class="card-status" :class="`status-${campaign.status}`">
          {{ STATUS_LABEL[campaign.status] }}
        </div>
        <div class="card-description" v-if="campaign.description">{{ campaign.description }}</div>
        <div class="card-meta">
          {{ store.getCharactersForCampaign(campaign.id).length }} Charaktere
        </div>
        <div class="card-actions" @click.stop>
          <FateButton icon="edit" variant="secondary" size="S" @click="router.push(`/campaigns/${campaign.id}/edit`)">Bearbeiten</FateButton>
          <FateButton variant="danger" size="S" @click="deleteCampaign(campaign.id, campaign.name)">Löschen</FateButton>
        </div>
      </div>
    </div>
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
.campaign-card {
  background: white;
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  padding: 0;
  cursor: pointer;
  transition:
    box-shadow 0.15s,
    border-color 0.15s;
  overflow: hidden;
}

.campaign-card:hover {
  box-shadow: 0 2px 12px rgba(28, 158, 214, 0.15);
  border-color: var(--fate-blue);
}

.card-header {
  background: var(--fate-blue);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  padding: 0.6rem 0.9rem;
}

.card-status {
  padding: 0.25rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-description {
  padding: 0.25rem 0.9rem;
  font-size: 0.8rem;
  color: var(--fate-text-light);
}

.card-meta {
  padding: 0.25rem 0.9rem;
  font-size: 0.8rem;
  color: var(--fate-text-light);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem 0.75rem;
}
</style>
