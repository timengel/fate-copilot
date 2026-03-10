<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCharactersStore } from '../stores/characters'
import { CHARACTER_COLORS } from '../types'
import FateButton from '../components/shared/FateButton.vue'

const router = useRouter()
const store = useCharactersStore()
const search = ref('')

const filtered = computed(() =>
  store.characters.filter(c =>
    c.name.toLowerCase().includes(search.value.toLowerCase()) ||
    c.highConcept.toLowerCase().includes(search.value.toLowerCase())
  )
)

function cardHeaderStyle(colorId?: string) {
  const c = CHARACTER_COLORS.find(c => c.id === (colorId ?? 'pfau')) ?? CHARACTER_COLORS[0]!
  return { background: c.primary }
}

function deleteCharacter(id: string, name: string) {
  if (confirm(`Charakter "${name || 'Unbenannt'}" wirklich löschen?`)) {
    store.deleteCharacter(id)
  }
}
</script>

<template>
  <div class="list-view">
    <div class="list-header">
      <h1>Charaktere</h1>
      <FateButton @click="router.push('/characters/new')">+ Neuer Charakter</FateButton>
    </div>

    <input
      v-model="search"
      class="search-input"
      placeholder="Charakter suchen..."
      type="search"
    />

    <div v-if="filtered.length === 0" class="empty-state">
      {{ store.characters.length === 0 ? 'Noch keine Charaktere vorhanden.' : 'Keine Treffer gefunden.' }}
    </div>

    <div v-else class="card-grid">
      <div
        v-for="char in filtered"
        :key="char.id"
        class="character-card"
        @click="router.push(`/characters/${char.id}`)"
      >
        <div class="card-header" :style="cardHeaderStyle(char.color)">{{ char.name || '(Unbenannt)' }}</div>
        <div class="card-concept">{{ char.highConcept || '—' }}</div>
        <div class="card-trouble" v-if="char.trouble">
          <em>{{ char.trouble }}</em>
        </div>
        <div class="card-actions" @click.stop>
          <FateButton icon="edit" variant="secondary" size="S" @click="router.push(`/characters/${char.id}/edit`)">Bearbeiten</FateButton>
          <FateButton variant="danger" size="S" @click="deleteCharacter(char.id, char.name)">Löschen</FateButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.character-card,
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
}

.character-card:hover,
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
}

.card-concept {
  padding: 0.5rem 0.9rem 0.25rem;
  font-size: 0.875rem;
  color: var(--fate-text);
}

.card-trouble {
  padding: 0 0.9rem 0.25rem;
  font-size: 0.8rem;
  color: var(--fate-text-light);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem 0.75rem;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  color: var(--fate-text);
  background: white;
}
</style>
