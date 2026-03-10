<script setup lang="ts">
import { ref } from 'vue'
import type { Milestone, MilestoneType } from '../../types'
import FateButton from '../shared/FateButton.vue'

const props = defineProps<{
  milestones: Milestone[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  add: [milestone: Milestone]
  remove: [id: string]
  update: [milestone: Milestone]
}>()

const TYPE_LABELS: Record<MilestoneType, string> = {
  small: 'Kleiner Meilenstein',
  significant: 'Bedeutender Meilenstein',
  major: 'Großer Meilenstein',
}

const newType = ref<MilestoneType>('small')
const newDescription = ref('')

const editingId = ref<string | null>(null)
const editType = ref<MilestoneType>('small')
const editDescription = ref('')

function submit() {
  const desc = newDescription.value.trim()
  if (!desc) return
  emit('add', {
    id: crypto.randomUUID(),
    type: newType.value,
    description: desc,
  })
  newDescription.value = ''
}

function startEdit(m: Milestone) {
  editingId.value = m.id
  editType.value = m.type
  editDescription.value = m.description
}

function saveEdit(id: string) {
  const desc = editDescription.value.trim()
  if (!desc) return
  emit('update', { id, type: editType.value, description: desc })
  editingId.value = null
}

function cancelEdit() {
  editingId.value = null
}
</script>

<template>
  <div class="milestone-timeline">
    <div v-if="milestones.length === 0 && readonly" class="milestone-empty">
      Noch keine Meilensteine eingetragen.
    </div>

    <div v-if="milestones.length > 0" class="timeline-list">
      <div
        v-for="(m, i) in milestones"
        :key="m.id"
        class="timeline-entry"
      >
        <div class="timeline-line-col">
          <div class="timeline-dot" :class="`dot--${editingId === m.id ? editType : m.type}`"></div>
          <div v-if="i < milestones.length - 1" class="timeline-line"></div>
        </div>

        <!-- Edit mode -->
        <div v-if="!readonly && editingId === m.id" class="timeline-content timeline-content--edit">
          <select v-model="editType" class="milestone-type-select">
            <option value="small">Kleiner Meilenstein</option>
            <option value="significant">Bedeutender Meilenstein</option>
            <option value="major">Großer Meilenstein</option>
          </select>
          <input
            v-model="editDescription"
            class="milestone-desc-input"
            @keydown.enter="saveEdit(m.id)"
            @keydown.escape="cancelEdit"
          />
          <FateButton variant="add" size="S" @click="saveEdit(m.id)">✓</FateButton>
          <FateButton variant="ghost" size="S" class="milestone-remove" @click="cancelEdit">✕</FateButton>
        </div>

        <!-- View mode -->
        <div v-else class="timeline-content">
          <span class="milestone-badge" :class="`badge--${m.type}`">{{ TYPE_LABELS[m.type] }}</span>
          <span class="milestone-desc">{{ m.description }}</span>
          <FateButton v-if="!readonly && i === milestones.length - 1" variant="danger-outline" size="S" class="milestone-remove" @click="emit('remove', m.id)">✕</FateButton>
          <FateButton v-if="!readonly" variant="ghost" size="S" class="milestone-edit" @click="startEdit(m)">✎</FateButton>
        </div>
      </div>
    </div>

    <div v-if="!readonly" class="milestone-add-form">
      <select v-model="newType" class="milestone-type-select">
        <option value="small">Kleiner Meilenstein</option>
        <option value="significant">Bedeutender Meilenstein</option>
        <option value="major">Großer Meilenstein</option>
      </select>
      <input
        v-model="newDescription"
        class="milestone-desc-input"
        placeholder="Beschreibung..."
        @keydown.enter="submit"
      />
      <FateButton variant="add" @click="submit">+ Hinzufügen</FateButton>
    </div>
  </div>
</template>
