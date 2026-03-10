<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCharactersStore } from '../stores/characters'
import { useCampaignsStore } from '../stores/campaigns'
import FateButton from '../components/shared/FateButton.vue'

const router = useRouter()
const charactersStore = useCharactersStore()
const campaignsStore = useCampaignsStore()

const recentSc = computed(() =>
  charactersStore.characters.filter(c => (c.type ?? 'sc') === 'sc').slice(-3).reverse()
)
const recentNsc = computed(() =>
  charactersStore.characters.filter(c => c.type === 'nsc').slice(-3).reverse()
)
const hasCharacters = computed(() => recentSc.value.length > 0 || recentNsc.value.length > 0)
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
        <div v-if="!hasCharacters" class="empty-state">
          Noch keine Charaktere vorhanden.
        </div>
        <template v-else>
          <div class="char-group-label">SC</div>
          <div v-if="recentSc.length === 0" class="empty-state empty-state--small">Keine Spielercharaktere.</div>
          <ul v-else class="home-list">
            <li v-for="char in recentSc" :key="char.id"
                class="home-list-item" @click="router.push(`/characters/${char.id}`)">
              <span class="item-name">{{ char.name || '(Unbenannt)' }}</span>
              <span class="item-meta">{{ char.highConcept || '—' }}</span>
            </li>
          </ul>
          <div class="char-group-label">NSC</div>
          <div v-if="recentNsc.length === 0" class="empty-state empty-state--small">Keine Nicht-Spieler-Charaktere.</div>
          <ul v-else class="home-list">
            <li v-for="char in recentNsc" :key="char.id"
                class="home-list-item" @click="router.push(`/characters/${char.id}`)">
              <span class="item-name">{{ char.name || '(Unbenannt)' }}</span>
              <span class="item-meta">{{ char.highConcept || '—' }}</span>
            </li>
          </ul>
        </template>
        <FateButton variant="link" @click="router.push('/characters')">Alle Charaktere ansehen →</FateButton>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  padding-top: 0.5rem;
}

.home-header {
  text-align: center;
  padding: 2rem 0 1.5rem;
}

.fate-logo {
  font-size: 3rem;
  font-weight: 900;
  color: var(--fate-blue);
  letter-spacing: -2px;
  line-height: 1;
}

.fate-logo .fate-plus {
  color: var(--fate-blue);
}

.home-header h1 {
  font-size: 1.25rem;
  color: var(--fate-text-light);
  font-weight: 400;
  margin-top: 0.25rem;
}

.subtitle {
  color: var(--fate-text-light);
  font-size: 0.9rem;
  margin: 0;
}

.home-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1rem;
}

@container main (width < 640px) {
  .home-grid {
    grid-template-columns: 1fr;
  }
}

.home-section {
  background: white;
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--fate-blue);
  color: white;
  padding: 0.6rem 0.9rem;
}

.section-header h2 {
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.home-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.home-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--fate-blue-light);
  cursor: pointer;
  transition: background 0.1s;
}

.home-list-item:hover {
  background: var(--fate-blue-light);
}
.home-list-item:last-child {
  border-bottom: none;
}

.item-name {
  font-weight: 600;
  font-size: 0.9rem;
}
.item-meta {
  font-size: 0.8rem;
  color: var(--fate-text-light);
}

.char-group-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fate-text-light);
  padding: 0.35rem 0.9rem;
  background: var(--fate-blue-light);
  border-bottom: 1px solid var(--fate-border);
}

.empty-state--small {
  padding: 0.4rem 0.9rem;
  font-size: 0.8rem;
}
</style>
