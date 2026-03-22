<script setup lang="ts">
import FateButton from './FateButton.vue';

interface Campaign {
  id: string;
  name: string;
}

const props = defineProps<{
  assignedCampaigns: Campaign[];
  availableCampaigns: Campaign[];
}>();

const emit = defineEmits<{
  assign: [campaignId: string];
  unassign: [campaignId: string];
  navigate: [campaignId: string];
}>();

function onSelectChange(e: Event) {
  if (!(e.target instanceof HTMLSelectElement)) return;
  emit('assign', e.target.value);
  e.target.value = '';
}
</script>

<template>
  <section class="sheet-section campaigns-section">
    <div class="sheet-section-header">KAMPAGNEN</div>
    <div class="campaign-assignments">
      <div v-if="props.assignedCampaigns.length === 0" class="empty-text">
        Keiner Kampagne zugeordnet.
      </div>
      <div
        v-for="campaign in props.assignedCampaigns"
        :key="campaign.id"
        class="assignment-row"
      >
        <span class="assignment-name" @click="emit('navigate', campaign.id)">
          {{ campaign.name }}
        </span>
        <FateButton variant="danger" size="M" icon="close" @click="emit('unassign', campaign.id)">
          <span class="btn-label">Entfernen</span>
        </FateButton>
      </div>

      <div v-if="props.availableCampaigns.length > 0" class="assign-row">
        <select class="assign-select" @change="onSelectChange">
          <option value="">Kampagne zuordnen...</option>
          <option v-for="c in props.availableCampaigns" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
      </div>
    </div>
  </section>
</template>

<style scoped>
.campaigns-section {
  margin-top: 1rem;
  background: var(--fate-white);
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  overflow: hidden;
}

.campaign-assignments {
  padding: 0.5rem 0.75rem;
}

.assignment-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--fate-blue-light);
}

.assignment-row:last-of-type {
  border-bottom: none;
}

.assignment-name {
  cursor: pointer;
  color: var(--fate-blue);
  font-weight: 500;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.assignment-name:hover {
  text-decoration: underline;
}

.assign-row {
  padding-top: 0.5rem;
}

.assign-select {
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--fate-text);
  background: var(--fate-white);
  cursor: pointer;
}

.assign-select:focus {
  outline: none;
  border-color: var(--fate-blue);
}

@container (width < 480px) {
  .btn-label {
    display: none;
  }
}
</style>
