<script setup lang="ts">
import { ref } from 'vue';
import { DropdownVariant, type Milestone, type MilestoneType, type TagColor } from '../../types';
import FateButton from '../shared/FateButton.vue';
import FateDropdown from '../shared/FateDropdown.vue';
import FateTag from '../shared/FateTag.vue';

const props = defineProps<{
  milestones: Milestone[];
  readonly?: boolean;
}>();

const emit = defineEmits<{
  add: [milestone: Milestone];
  remove: [id: string];
  update: [milestone: Milestone];
}>();

const TYPE_LABELS: Record<MilestoneType, string> = {
  small: 'Kleiner Meilenstein',
  significant: 'Bedeutender Meilenstein',
  major: 'Großer Meilenstein',
};

const TYPE_COLORS: Record<MilestoneType, TagColor> = {
  small: 'gray',
  significant: 'pfau',
  major: 'banane',
};

const TYPE_OPTIONS = [
  { value: 'small', label: 'Kleiner Meilenstein' },
  { value: 'significant', label: 'Bedeutender Meilenstein' },
  { value: 'major', label: 'Großer Meilenstein' },
] as const;

const newType = ref<MilestoneType>('small');
const newDescription = ref('');

const editingId = ref<string | null>(null);
const editType = ref<MilestoneType>('small');
const editDescription = ref('');

function submit() {
  const desc = newDescription.value.trim();
  if (!desc) return;
  emit('add', {
    id: crypto.randomUUID(),
    type: newType.value,
    description: desc,
  });
  newDescription.value = '';
}

function startEdit(m: Milestone) {
  editingId.value = m.id;
  editType.value = m.type;
  editDescription.value = m.description;
}

function saveEdit(id: string) {
  const desc = editDescription.value.trim();
  if (!desc) return;
  emit('update', { id, type: editType.value, description: desc });
  editingId.value = null;
}

function cancelEdit() {
  editingId.value = null;
}
</script>

<template>
  <div class="milestone-timeline">
    <div v-if="milestones.length === 0 && readonly" class="milestone-empty">
      Noch keine Meilensteine eingetragen.
    </div>

    <div v-if="milestones.length > 0" class="timeline-list">
      <div v-for="(m, i) in milestones" :key="m.id" class="timeline-entry">
        <div class="timeline-line-col">
          <div class="timeline-dot" :class="`dot--${editingId === m.id ? editType : m.type}`"></div>
          <div v-if="i < milestones.length - 1" class="timeline-line"></div>
        </div>

        <!-- Edit mode -->
        <div v-if="!readonly && editingId === m.id" class="timeline-content timeline-content--edit">
          <FateDropdown
            v-model="editType"
            class="milestone-type-select"
            :options="TYPE_OPTIONS"
            size="S"
            :variant="DropdownVariant.Secondary"
          />
          <input
            v-model="editDescription"
            class="milestone-desc-input"
            @keydown.enter="saveEdit(m.id)"
            @keydown.escape="cancelEdit"
          />
          <FateButton icon="check" variant="add" size="S" class="milestone-save" @click="saveEdit(m.id)"></FateButton>
          <FateButton icon="close" variant="ghost" size="S" class="milestone-remove" @click="cancelEdit"></FateButton>
        </div>

        <!-- View mode -->
        <div v-else class="timeline-content">
          <FateTag :color="TYPE_COLORS[m.type]" :label="TYPE_LABELS[m.type]" />
          <span class="milestone-desc">{{ m.description }}</span>
          <FateButton
            v-if="!readonly && i === milestones.length - 1"
            variant="danger-outline"
            size="S"
            icon="close"
            class="milestone-remove"
            @click="emit('remove', m.id)">
            </FateButton>
          <FateButton
            v-if="!readonly"
            variant="ghost"
            icon="edit"
            size="S"
            class="milestone-edit"
            @click="startEdit(m)"
            ></FateButton
          >
        </div>
      </div>
    </div>

    <div v-if="!readonly" class="milestone-add-form">
      <FateDropdown
        v-model="newType"
        class="milestone-type-select"
        :options="TYPE_OPTIONS"
        size="S"
        :variant="DropdownVariant.Secondary"
      />
      <input
        v-model="newDescription"
        class="milestone-desc-input"
        placeholder="Beschreibung..."
        @keydown.enter="submit"
      />
      <FateButton variant="add" icon="add" size="S" :disabled="newDescription === ''" @click="submit"></FateButton>
    </div>
  </div>
</template>

<style scoped>
.milestone-timeline {
  padding: 0.5rem 0.75rem;
  container-type: inline-size;
}

.milestone-empty {
  font-size: 0.8rem;
  color: var(--fate-text-muted);
  padding: 0.25rem 0;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.75rem;
}

.timeline-entry {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
}

.timeline-line-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 12px;
  flex-shrink: 0;
  align-self: stretch;
  padding-top: 6px;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot--small {
  background: #888;
}
.dot--significant {
  background: var(--fate-blue);
}
.dot--major {
  background: #c9a84c;
}

.timeline-line {
  width: 2px;
  flex: 1;
  min-height: 12px;
  background: var(--fate-border);
  margin: 3px 0;
}

.timeline-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  padding-bottom: 10px;
  flex-wrap: wrap;
}

.milestone-desc {
  font-size: 0.82rem;
  color: var(--fate-text);
  flex: 1;
}

.milestone-remove {
  color: #888;
  font-size: 0.7rem;
}
.milestone-remove:hover {
  color: var(--fate-red);
}

.milestone-edit {
  color: #888;
}
.milestone-edit:hover {
  color: var(--fate-blue);
}

.timeline-content--edit {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex: 1;
  flex-wrap: wrap;
}

.milestone-add-form {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
  padding-top: 0.25rem;
}

.milestone-type-select {
  --dropdown-min-width: 10.5rem;
  --dropdown-max-width: 14rem;
  flex-shrink: 0;
}

.milestone-desc-input {
  flex: 1;
  min-width: 120px;
  font-size: 0.8rem;
  padding: 3px 6px;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  background: transparent;
  color: var(--fate-text);
  font-family: inherit;
}
.milestone-desc-input:focus {
  outline: none;
  border-color: var(--fate-blue);
}

@container (width < 480px) {
  .milestone-type-select {
    flex: 1 1 100%;
    --dropdown-max-width: 100%;
    flex-shrink: 1;
  }

  .milestone-desc-input {
    min-width: 80px;
  }
}

@container (width < 380px) {
  .timeline-content :deep(.fate-tag) {
    flex: 1 1 100%;
    margin-top: 3px;
  }
}
</style>
