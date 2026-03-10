<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCharactersStore } from '../stores/characters'
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
        <div class="card-header">{{ char.name || '(Unbenannt)' }}</div>
        <div class="card-concept">{{ char.highConcept || '—' }}</div>
        <div class="card-trouble" v-if="char.trouble">
          <em>{{ char.trouble }}</em>
        </div>
        <div class="card-actions" @click.stop>
          <FateButton variant="secondary" size="sm" @click="router.push(`/characters/${char.id}/edit`)">Bearbeiten</FateButton>
          <FateButton variant="danger" size="sm" @click="deleteCharacter(char.id, char.name)">Löschen</FateButton>
        </div>
      </div>
    </div>
  </div>
</template>
