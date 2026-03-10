<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCampaignsStore } from '../stores/campaigns'

const router = useRouter()
const store = useCampaignsStore()

const STATUS_LABEL: Record<string, string> = {
  active: 'Aktiv',
  inactive: 'Inaktiv',
  completed: 'Abgeschlossen',
}

function deleteCampaign(id: string, name: string) {
  if (confirm(`Kampagne "${name}" wirklich löschen?`)) {
    store.deleteCampaign(id)
  }
}
</script>

<template>
  <div class="list-view">
    <div class="list-header">
      <h1>Kampagnen</h1>
      <button class="btn-primary" @click="router.push('/campaigns/new')">+ Neue Kampagne</button>
    </div>

    <div v-if="store.campaigns.length === 0" class="empty-state">
      Noch keine Kampagnen vorhanden.
    </div>

    <div v-else class="card-grid">
      <div
        v-for="campaign in store.campaigns"
        :key="campaign.id"
        class="campaign-card"
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
          <button class="btn-sm" @click="router.push(`/campaigns/${campaign.id}`)">Ansehen</button>
          <button class="btn-sm btn-danger" @click="deleteCampaign(campaign.id, campaign.name)">Löschen</button>
        </div>
      </div>
    </div>
  </div>
</template>
