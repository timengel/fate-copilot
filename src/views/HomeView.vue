<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCharactersStore } from '../stores/characters';
import { useCampaignsStore } from '../stores/campaigns';
import { useGMModeStore } from '../stores/gmMode';
import FateButton from '../components/shared/FateButton.vue';
import FatePlusLogo from '../components/shared/FatePlusLogo.vue';

const router = useRouter();
const charactersStore = useCharactersStore();
const campaignsStore = useCampaignsStore();
const gmModeStore = useGMModeStore();

const scCount = computed(
  () => charactersStore.characters.filter((c) => (c.type ?? 'sc') === 'sc').length,
);
const nscCount = computed(() => charactersStore.characters.filter((c) => c.type === 'nsc').length);

const hasAnyData = computed(
  () => campaignsStore.campaigns.length > 0 || charactersStore.characters.length > 0,
);

const statsLine = computed(() => {
  if (!hasAnyData.value) return null;

  const parts: string[] = [];
  const campCount = campaignsStore.campaigns.length;

  if (campCount > 0) parts.push(`${campCount} Kampagne${campCount !== 1 ? 'n' : ''}`);
  if (scCount.value > 0) parts.push(`${scCount.value} SC`);
  if (gmModeStore.isGMMode && nscCount.value > 0) parts.push(`${nscCount.value} NSC`);

  return parts.join(' · ');
});

const activeCampaigns = computed(() => campaignsStore.activeCampaigns);

const recentChars = computed(() => {
  const sc = charactersStore.characters.filter((c) => (c.type ?? 'sc') === 'sc');

  if (!gmModeStore.isGMMode) return sc;

  const nsc = charactersStore.characters.filter((c) => c.type === 'nsc');
  return [...sc, ...nsc];
});

function getCharCampaign(charId: string): string | null {
  return campaignsStore.getCampaignsForCharacter(charId)[0]?.name ?? null;
}
</script>

<template>
  <div class="home-view">
    <div class="home-header">
      <div class="fate-logo"><FatePlusLogo /></div>
      <p class="fate-subtitle">Digitaler Copilot für Fate Core</p>
    </div>

    <div class="quick-actions">
      <FateButton @click="router.push('/dashboard')">Dashboard öffnen →</FateButton>
      <FateButton variant="secondary" @click="router.push('/campaigns/new')"
        >+ Neue Kampagne</FateButton
      >
      <FateButton variant="secondary" @click="router.push('/characters/new')"
        >+ Neuer Charakter</FateButton
      >
    </div>

    <p v-if="statsLine" class="stats-line">{{ statsLine }}</p>

    <div v-if="!hasAnyData" class="welcome">
      <p class="welcome-text">
        Willkommen bei FATE+ &ndash; deinem digitalen Copiloten für Fate Core.
      </p>
      <div class="welcome-cards">
        <div class="welcome-card" @click="router.push('/campaigns/new')">
          <div class="welcome-card-title">Neue Kampagne</div>
          <div class="welcome-card-desc">
            Erstelle deine erste Kampagne und lade Charaktere ein.
          </div>
        </div>
        <div class="welcome-card" @click="router.push('/characters/new')">
          <div class="welcome-card-title">Neuer Charakter</div>
          <div class="welcome-card-desc">Lege deinen ersten Spielercharakter oder NSC an.</div>
        </div>
      </div>
    </div>

    <div v-else class="home-grid">
      <section class="home-section">
        <div class="section-header">
          <h2>Aktive Kampagnen</h2>
          <FateButton variant="outline" size="S" @click.stop="router.push('/campaigns/new')"
            >+ Neu</FateButton
          >
        </div>
        <div class="section-scroll">
          <div v-if="activeCampaigns.length === 0" class="empty-state">
            Keine aktiven Kampagnen vorhanden.
          </div>
          <ul v-else class="home-list">
            <li
              v-for="campaign in activeCampaigns"
              :key="campaign.id"
              class="home-list-item"
              @click="router.push(`/campaigns/${campaign.id}`)"
            >
              <div class="item-main">
                <span class="item-name">{{ campaign.name }}</span>
                <span v-if="campaign.description" class="item-desc campaign-desc">{{
                  campaign.description
                }}</span>
              </div>
              <div class="item-meta campaign-meta">
                {{
                  (() => {
                    const chars = campaignsStore.getCharactersForCampaign(campaign.id);
                    const sc = chars.filter((c) => (c.type ?? 'sc') === 'sc').length;
                    return `${sc} SC`;
                  })()
                }}<template v-if="gmModeStore.isGMMode"><br />{{
                  (() => {
                    const chars = campaignsStore.getCharactersForCampaign(campaign.id);
                    const nsc = chars.filter((c) => c.type === 'nsc').length;
                    return `${nsc} NSC`;
                  })()
                }}</template>
              </div>
            </li>
          </ul>
        </div>
        <FateButton variant="link" @click="router.push('/campaigns')"
          >Alle Kampagnen ansehen →</FateButton
        >
      </section>

      <section class="home-section">
        <div class="section-header">
          <h2>Charaktere</h2>
          <FateButton variant="outline" size="S" @click.stop="router.push('/characters/new')"
            >+ Neu</FateButton
          >
        </div>
        <div class="section-scroll">
          <div v-if="recentChars.length === 0" class="empty-state">
            Noch keine Charaktere vorhanden.
          </div>
          <ul v-else class="home-list">
            <li
              v-for="char in recentChars"
              :key="char.id"
              class="home-list-item"
              @click="router.push(`/characters/${char.id}`)"
            >
              <div
                class="char-color-dot"
                :style="{ background: char.color || 'var(--fate-blue)' }"
              ></div>
              <div class="item-main">
                <div class="item-name-row">
                  <span class="item-name">{{ char.name || '(Unbenannt)' }}</span>
                  <span
                    class="char-type-badge"
                    :class="char.type === 'nsc' ? 'badge-nsc' : 'badge-sc'"
                    >{{ char.type === 'nsc' ? 'NSC' : 'SC' }}</span
                  >
                </div>
                <span v-if="char.highConcept" class="item-desc">{{ char.highConcept }}</span>
                <span v-if="getCharCampaign(char.id)" class="char-campaign">
                  {{ getCharCampaign(char.id) }}
                </span>
              </div>
            </li>
          </ul>
        </div>
        <FateButton variant="link" @click="router.push('/characters')"
          >Alle Charaktere ansehen →</FateButton
        >
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  padding-top: 0.5rem;
}

/* ---- Hero header ---- */

.home-header {
  text-align: center;
  padding: 2rem 0 2.5rem;
}

.fate-logo {
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--fate-blue);
  letter-spacing: -2px;
  line-height: 1;
}

.fate-subtitle {
  margin: 0.4rem 0 0;
  font-size: 1.1rem;
  color: var(--fate-text-light);
  font-weight: 400;
}

/* ---- Quick Actions ---- */

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

/* ---- Stats line ---- */

.stats-line {
  margin: 0 0 1rem;
  font-size: 0.85rem;
  color: var(--fate-text-light);
}

/* ---- Welcome (empty state) ---- */

.welcome {
  margin-top: 2rem;
  text-align: center;
}

.welcome-text {
  color: var(--fate-text-light);
  margin-bottom: 1.5rem;
}

.welcome-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  max-width: 520px;
  margin: 0 auto;
}

.welcome-card {
  background: white;
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  padding: 1.25rem;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.welcome-card:hover {
  border-color: var(--fate-blue);
  box-shadow: 0 0 0 3px var(--fate-blue-light);
}

.welcome-card-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--fate-blue);
  margin-bottom: 0.35rem;
}

.welcome-card-desc {
  font-size: 0.82rem;
  color: var(--fate-text-light);
  line-height: 1.4;
}

/* ---- Main grid ---- */

.home-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@container main (width < 640px) {
  .home-grid {
    grid-template-columns: 1fr;
  }
  .welcome-cards {
    grid-template-columns: 1fr;
  }
}

.home-section {
  background: white;
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  max-height: 520px;
}

.section-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.home-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.home-section :deep(.fate-btn--link) {
  flex-shrink: 0;
  border-top: 1px solid var(--fate-border);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--fate-blue);
  color: white;
  padding: 0.5rem 0.9rem;
  border-radius: 6px 6px 0 0;
  flex-shrink: 0;
}

.section-header h2 {
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.item-desc.campaign-desc {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  line-height: 1.4;
}

.home-list-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.55rem 0.9rem;
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

.item-main {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  flex: 1;
  min-width: 0;
}

.item-name-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.item-name {
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-desc {
  font-size: 0.78rem;
  color: var(--fate-text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  font-size: 0.78rem;
  color: var(--fate-text-light);
  white-space: nowrap;
  flex-shrink: 0;
  align-self: center;
}

.campaign-meta {
  text-align: left;
  align-self: flex-start;
  line-height: 1.6;
}

/* ---- Character specifics ---- */

.char-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.35rem;
}

.char-type-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.badge-sc {
  background: var(--fate-blue-light);
  color: var(--fate-blue);
}

.badge-nsc {
  background: #fef3cd;
  color: #856404;
}

.char-campaign {
  font-size: 0.72rem;
  color: var(--fate-blue);
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
