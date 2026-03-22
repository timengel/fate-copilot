<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCharactersStore } from '../stores/characters';
import { useCampaignsStore } from '../stores/campaigns';
import { useGMModeStore } from '../stores/gmMode';
import { useImportExport } from '../composables/useImportExport';
import { useToastStore } from '../stores/toast';
import FateButton from '../components/shared/FateButton.vue';
import FateIcon from '../components/shared/FateIcon.vue';
import FatePlusLogo from '../components/shared/FatePlusLogo.vue';
import FateTag from '../components/shared/FateTag.vue';

const router = useRouter();
const charactersStore = useCharactersStore();
const campaignsStore = useCampaignsStore();
const gmModeStore = useGMModeStore();
const { importFromString, applyImport } = useImportExport();
const toastStore = useToastStore();

async function loadDemoData() {
  const res = await fetch(`${import.meta.env.BASE_URL}demo.json`);
  const text = await res.text();
  applyImport(importFromString(text));
  toastStore.show('Demo-Daten geladen!');
}

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
      <p class="fate-subtitle">
        Digitaler Copilot für Fate Core
      </p>
    </div>

    <div v-if="hasAnyData" class="quick-actions">
      <FateButton icon="arrow-right" @click="router.push('/dashboard')">Dashboard öffnen</FateButton>
      <FateButton variant="secondary" icon="add" @click="router.push('/campaigns/new')"
        >Neue Kampagne</FateButton
      >
      <FateButton variant="secondary" icon="add" @click="router.push('/characters/new')"
        >Neuer Charakter</FateButton
      >
      <FateButton variant="secondary" icon="add" @click="router.push('/items/new')"
        >Neuer Gegenstand</FateButton
      >
    </div>

    <p v-if="statsLine" class="stats-line">{{ statsLine }}</p>

    <div v-if="!hasAnyData" class="welcome">
      <div class="welcome-cards">
        <div class="welcome-card" @click="router.push('/campaigns/new')">
          <div class="welcome-card-title">Neue Kampagne <FateIcon name="plus" :size="14" /></div>
          <div class="welcome-card-desc">
            Erstelle deine erste Kampagne.
          </div>
        </div>
        <div class="welcome-card" @click="router.push('/characters/new')">
          <div class="welcome-card-title">Neuer Charakter <FateIcon name="plus" :size="14" /></div>
          <div class="welcome-card-desc">Lege deinen ersten Charakter an.</div>
        </div>
        <div class="welcome-card" @click="router.push('/items/new')">
          <div class="welcome-card-title">Neuer Gegenstand <FateIcon name="plus" :size="14" /></div>
          <div class="welcome-card-desc">Erstelle deinen ersten Gegenstand.</div>
        </div>
        <div class="welcome-card welcome-card--demo" @click="loadDemoData">
          <div class="welcome-card-title">
            Demo Daten laden <FateIcon name="arrow-up" :size="14" />
          </div>
          <div class="welcome-card-desc">Lade Beispieldaten, um die App zu testen.</div>
        </div>
      </div>
    </div>

    <div v-else class="home-grid">
      <section class="home-section">
        <div class="section-header">
          <h2>Aktive Kampagnen</h2>
          <FateButton variant="outline" size="S" icon="add" @click.stop="router.push('/campaigns/new')"
            >Neu</FateButton
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
                {{ campaignsStore.characterCountsForCampaign(campaign.id).sc }} SC
                <template v-if="gmModeStore.isGMMode">
                  <br />{{ campaignsStore.characterCountsForCampaign(campaign.id).nsc }} NSC
                </template>
              </div>
            </li>
          </ul>
        </div>
        <FateButton variant="link" icon="arrow-right" @click="router.push('/campaigns')"
          >Alle Kampagnen ansehen</FateButton
        >
      </section>

      <section class="home-section">
        <div class="section-header">
          <h2>Charaktere</h2>
          <FateButton variant="outline" size="S" icon="add" @click.stop="router.push('/characters/new')"
            >Neu</FateButton
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
                  <span class="item-name">{{ char.name || 'Unbenannt' }}</span>
                  <FateTag
                    :color="char.type === 'nsc' ? 'banane' : 'pfau'"
                    :label="char.type === 'nsc' ? 'NSC' : 'SC'"
                  />
                </div>
                <span v-if="char.highConcept" class="item-desc">{{ char.highConcept }}</span>
                <span v-if="getCharCampaign(char.id)" class="char-campaign">
                  {{ getCharCampaign(char.id) }}
                </span>
              </div>
            </li>
          </ul>
        </div>
        <FateButton variant="link" icon="arrow-right" @click="router.push('/characters')"
          >Alle Charaktere ansehen</FateButton
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
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
  text-align: center;
}

.welcome-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  max-width: 640px;
  margin: 0 auto;
}

.welcome-card {
  display: flex;
  flex-direction: column;
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
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--fate-blue);
  margin-bottom: 0.35rem;
}

.welcome-card-desc {
  font-size: 0.82rem;
  color: var(--fate-text-light);
  line-height: 1.4;
  height: calc(0.82rem * 1.4);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.demo-action {
  margin-top: 1.25rem;
  display: flex;
  justify-content: center;
}

/* ---- Main grid ---- */

.home-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.home-section {
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  max-height: 520px;
  min-width: 0;
}

.section-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

@container main (width < 640px) {
  .home-grid {
    grid-template-columns: 1fr;
  }

  .item-name,
  .item-desc,
  .char-campaign {
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
  }

  .welcome-cards {
    grid-template-columns: 1fr;
  }

  .home-header {
    padding: 1rem 0 1.5rem;
  }

  .fate-logo {
    font-size: 2.5rem;
  }

  .fate-subtitle {
    font-size: 0.95rem;
  }

  .quick-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .home-section {
    max-height: none;
    width: 100%;
  }

  .home-section .section-scroll {
    flex: none;
    overflow-y: visible;
    min-height: auto;
  }
}

.home-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.home-section :deep(.fate-btn--link) {
  flex-shrink: 0;
  border-top: 1px solid var(--fate-light-border);
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
  background: var(--fate-hover-bg);
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

.char-campaign {
  font-size: 0.72rem;
  color: var(--fate-blue);
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
