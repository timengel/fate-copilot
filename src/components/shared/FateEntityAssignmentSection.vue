<script setup lang="ts">
import { ref } from 'vue';
import FateAvatar from './FateAvatar.vue';
import FateButton from './FateButton.vue';
import FateDropdown from './FateDropdown.vue';
import { DropdownVariant } from '../../types';

interface AssignmentEntity {
  id: string;
  name: string;
  subtitle?: string;
  avatar?: string;
  color?: string;
}

interface AssignmentOption {
  value: string;
  label: string;
}

const props = defineProps<{
  title: string;
  emptyText: string;
  addPlaceholder: string;
  assignedEntities: AssignmentEntity[];
  availableOptions: AssignmentOption[];
  editable?: boolean;
}>();

const emit = defineEmits<{
  assign: [id: string];
  unassign: [id: string];
  navigate: [id: string];
}>();

const selectedId = ref('');

function onAssign(id: string) {
  if (!id) return;
  selectedId.value = '';
  emit('assign', id);
}
</script>

<template>
  <section class="sheet-section entity-assignment-section">
    <div class="sheet-section-header">{{ title }}</div>
    <div class="entity-assignments">
      <div v-if="props.assignedEntities.length === 0" class="empty-text">
        {{ emptyText }}
      </div>

      <div
        v-for="entity in props.assignedEntities"
        :key="entity.id"
        class="assignment-row"
      >
        <button
          type="button"
          class="assignment-main assignment-main--clickable"
          @click="emit('navigate', entity.id)"
        >
          <FateAvatar
            class="assignment-avatar"
            :value="entity.avatar"
            size="S"
            :background="entity.color"
          />
          <div class="assignment-info">
            <strong :style="{ color: entity.color }">{{ entity.name || 'Unbenannt' }}</strong>
            <span v-if="entity.subtitle" class="assignment-concept">{{ entity.subtitle }}</span>
          </div>
        </button>

        <div v-if="editable" class="assignment-actions">
          <FateButton variant="danger" size="S" icon="close" @click="emit('unassign', entity.id)" />
        </div>
      </div>

      <div v-if="editable && props.availableOptions.length > 0" class="assign-row">
        <FateDropdown
          v-model="selectedId"
          :options="props.availableOptions"
          :variant="DropdownVariant.Secondary"
          size="S"
          :placeholder="addPlaceholder"
          @update:model-value="onAssign"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.entity-assignment-section {
  margin-top: 1rem;
  background: var(--fate-white);
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  overflow: hidden;
}

.entity-assignments {
  padding: 0.5rem 0.75rem;
}

.assignment-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.4rem;
  border-bottom: 1px solid var(--fate-blue-light);
}

.assignment-row:last-of-type {
  border-bottom: none;
}

.assignment-main {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.assignment-main--clickable {
  appearance: none;
  border: none;
  background: transparent;
  width: 100%;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
  transition: background 0.1s;
}

.assignment-main--clickable:hover {
  background: var(--fate-hover-bg);
}

.assignment-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.assignment-info strong {
  font-size: 0.9rem;
  line-height: 1.3;
}

.assignment-concept {
  color: var(--fate-text-light);
  font-size: 0.8rem;
  line-height: 1.35;
}

.assignment-actions {
  flex-shrink: 0;
}

.assign-row {
  padding-top: 0.5rem;
}
</style>
