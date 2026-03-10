<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCharactersStore } from '../stores/characters'
import { useCampaignsStore } from '../stores/campaigns'
import FateButton from '../components/shared/FateButton.vue'

const router = useRouter()
const charactersStore = useCharactersStore()
const campaignsStore = useCampaignsStore()

const recentCharacters = computed(() => charactersStore.characters.slice(-4).reverse())
const activeCampaigns = computed(() => campaignsStore.activeCampaigns.slice(0, 4))
</script>

<template>
  <div class="home-view">
    <div class="home-header">
      <div class="fate-logo">
        <span class="fate-plus">+</span>FATE
      </div>
      <h1>Fate Copilot</h1>
      <p class="subtitle">Digitale Charakterverwaltung für Fate Core</p>
    </div>

    <div class="home-grid">
      <section class="home-section">
        <div class="section-header">
          <h2>Kampagnen</h2>
          <FateButton @click="router.push('/campaigns/new')">+ Neu</FateButton>
        </div>
        <div v-if="activeCampaigns.length === 0" class="empty-state">
          Keine aktiven Kampagnen vorhanden.
        </div>
        <ul v-else class="home-list">
          <li v-for="campaign in activeCampaigns" :key="campaign.id"
              class="home-list-item" @click="router.push(`/campaigns/${campaign.id}`)">
            <span class="item-name">{{ campaign.name }}</span>
            <span class="item-meta">{{ campaignsStore.getCharactersForCampaign(campaign.id).length }} Charaktere</span>
          </li>
        </ul>
        <FateButton variant="link" @click="router.push('/campaigns')">Alle Kampagnen ansehen →</FateButton>
      </section>

      <section class="home-section">
        <div class="section-header">
          <h2>Charaktere</h2>
          <FateButton @click="router.push('/characters/new')">+ Neu</FateButton>
        </div>
        <div v-if="recentCharacters.length === 0" class="empty-state">
          Noch keine Charaktere vorhanden.
        </div>
        <ul v-else class="home-list">
          <li v-for="char in recentCharacters" :key="char.id"
              class="home-list-item" @click="router.push(`/characters/${char.id}`)">
            <span class="item-name">{{ char.name || '(Unbenannt)' }}</span>
            <span class="item-meta">{{ char.highConcept || '—' }}</span>
          </li>
        </ul>
        <FateButton variant="link" @click="router.push('/characters')">Alle Charaktere ansehen →</FateButton>
      </section>
    </div>
  </div>
</template>
