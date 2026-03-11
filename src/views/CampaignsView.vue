<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCampaignsStore } from '../stores/campaigns';
import FateButton from '../components/shared/FateButton.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import { CAMPAIGN_STATUS_LABEL } from '../types';
import type { CampaignStatus } from '../types';
import { getColorVars } from '../composables/useColorVars';
import { useConfirmDialog } from '../composables/useConfirmDialog';
import { useGMModeStore } from '../stores/gmMode';

const router = useRouter();
const store = useCampaignsStore();
const gmModeStore = useGMModeStore();
const { confirmDialog, showConfirmDialog } = useConfirmDialog();

const STATUS_ORDER: CampaignStatus[] = ['active', 'inactive', 'completed'];

const groupedCampaigns = computed(() =>
  STATUS_ORDER.filter((status) => status === 'active' || gmModeStore.isGMMode)
    .map((status) => ({
      status,
      label: CAMPAIGN_STATUS_LABEL[status],
      campaigns: store.campaigns.filter((c) => c.status === status),
    }))
    .filter((group) => group.campaigns.length > 0),
);

function deleteCampaign(id: string, name: string) {
  showConfirmDialog('Kampagne löschen', `Kampagne "${name}" wirklich löschen?`, () =>
    store.deleteCampaign(id),
  );
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

    <template v-else>
      <div v-for="group in groupedCampaigns" :key="group.status" class="status-group">
        <h2 class="status-group-title" :class="`title-${group.status}`">{{ group.label }}</h2>
        <div class="card-grid">
          <div
            v-for="campaign in group.campaigns"
            :key="campaign.id"
            class="campaign-card"
            :style="getColorVars(campaign.color)"
            @click="router.push(`/campaigns/${campaign.id}`)"
          >
            <div class="card-header">{{ campaign.name }}</div>
            <div class="card-description" v-if="campaign.description">
              {{ campaign.description }}
            </div>
            <div class="card-meta">
              {{ store.getCharactersForCampaign(campaign.id).length }} Charaktere
            </div>
            <div class="card-actions" @click.stop>
              <FateButton icon="edit" variant="secondary" size="S" @click="router.push(`/campaigns/${campaign.id}/edit`)" />
              <FateButton icon="delete" variant="danger" size="S" @click="deleteCampaign(campaign.id, campaign.name)" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <ConfirmDialog
    v-if="confirmDialog"
    :title="confirmDialog.title"
    :message="confirmDialog.message"
    @confirm="
      confirmDialog.onConfirm();
      confirmDialog = null;
    "
    @cancel="confirmDialog = null"
  />
</template>

<style scoped>
.status-group {
  margin-bottom: 2rem;
}

.status-group-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 0.75rem;
  padding-bottom: 0.35rem;
  border-bottom: 2px solid currentColor;
}

.title-active,
.title-inactive,
.title-completed {
  color: var(--fate-blue);
}

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
  display: flex;
  flex-direction: column;
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
  margin-bottom: 0.25rem;
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
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem 0.75rem;
  margin-top: auto;
}
</style>
