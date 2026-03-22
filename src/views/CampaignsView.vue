<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCampaignsStore } from '../stores/campaigns';
import FateButton from '../components/shared/FateButton.vue';
import FateCard from '../components/shared/FateCard.vue';
import FateHeader from '../components/shared/FateHeader.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import { CAMPAIGN_STATUS_LABEL } from '../types';
import type { CampaignStatus } from '../types';
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
    <FateHeader title="Kampagnen">
      <FateButton variant="primary" icon="add" @click="router.push('/campaigns/new')"><span class="btn-label">Neue Kampagne</span></FateButton>
    </FateHeader>

    <div v-if="store.campaigns.length === 0" class="empty-state">
      Noch keine Kampagnen vorhanden.
    </div>

    <template v-else>
      <div v-for="group in groupedCampaigns" :key="group.status" class="status-group">
        <h2 class="status-group-title" :class="`title-${group.status}`">{{ group.label }}</h2>
        <div class="card-grid">
          <FateCard
            v-for="campaign in group.campaigns"
            :key="campaign.id"
            :color="campaign.color"
            :avatar="campaign.avatar"
            :title="campaign.name"
            clickable
            @click="router.push(`/campaigns/${campaign.id}`)"
          >
            <template v-if="campaign.description">
              {{ campaign.description }}
            </template>
            <template #meta>
              <span>
                {{ store.getCharactersForCampaign(campaign.id).filter((c) => (c.type ?? 'sc') === 'sc').length }} SC
              </span>
              <span v-if="gmModeStore.isGMMode">
                · {{ store.getCharactersForCampaign(campaign.id).filter((c) => c.type === 'nsc').length }} NSC
              </span>
              <span v-if="store.getItemsForCampaign(campaign.id).length > 0">
                · {{ store.getItemsForCampaign(campaign.id).length }} Item{{ store.getItemsForCampaign(campaign.id).length !== 1 ? 's' : '' }}
              </span>
              <span v-if="campaign.milestones.length > 0">
                · {{ campaign.milestones.length }} Meilenstein{{ campaign.milestones.length !== 1 ? 'e' : '' }}
              </span>
            </template>
            <template #actions>
              <FateButton icon="edit" variant="secondary" size="S" @click.stop="router.push(`/campaigns/${campaign.id}/edit`)" />
              <FateButton icon="delete" variant="danger" size="S" @click.stop="deleteCampaign(campaign.id, campaign.name)" />
            </template>
          </FateCard>
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

@container main (width < 480px) {
  .btn-label {
    display: none;
  }
}
</style>
