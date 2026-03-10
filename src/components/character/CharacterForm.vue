<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { Character, Stunt } from '../../types'
import { CHARACTER_COLORS } from '../../types'
import AspectFields from './AspectFields.vue'
import SkillPyramid from './SkillPyramid.vue'
import StressTrack from './StressTrack.vue'
import ConsequenceSlots from './ConsequenceSlots.vue'
import FateButton from '../shared/FateButton.vue'

const props = defineProps<{ character: Character; hideActions?: boolean }>()
const emit = defineEmits<{ save: [character: Character]; cancel: [] }>()

const form = reactive<Character>(JSON.parse(JSON.stringify(props.character)))

watch(() => props.character, (val) => {
  Object.assign(form, JSON.parse(JSON.stringify(val)))
}, { deep: true })

function addStunt() {
  form.stunts.push({ name: '', description: '' })
}

function removeStunt(index: number) {
  form.stunts.splice(index, 1)
}

function updateStunt(index: number, field: keyof Stunt, value: string) {
  const stunt = form.stunts[index]
  if (stunt) stunt[field] = value
}

function save() {
  emit('save', JSON.parse(JSON.stringify(form)))
}

const colorVars = computed(() => {
  const found = CHARACTER_COLORS.find(c => c.id === (form.color ?? 'pfau'))
  const c = found ?? CHARACTER_COLORS[0]!
  return {
    '--fate-blue': c.primary,
    '--fate-blue-dark': c.dark,
    '--fate-blue-light': c.light,
  }
})

defineExpose({ save })
</script>

<template>
  <div class="character-form character-sheet" :style="colorVars">

    <!-- ALLGEMEINES -->
    <section class="sheet-section allgemeines">
      <div class="sheet-section-header">ALLGEMEINES</div>
      <div class="allgemeines-grid">
        <div class="allgemeines-left">
          <div class="field-row">
            <label class="field-label">Name</label>
            <input class="field-input" v-model="form.name" placeholder="Charaktername" />
          </div>
          <div class="field-row">
            <label class="field-label">Beschreibung</label>
            <textarea class="field-input field-textarea" v-model="form.description" placeholder="Kurzbeschreibung" />
          </div>
          <div class="field-row">
            <label class="field-label">Farbe</label>
            <div class="color-picker">
              <button
                v-for="c in CHARACTER_COLORS"
                :key="c.id"
                class="color-swatch"
                :class="{ active: (form.color ?? 'pfau') === c.id }"
                :style="{ background: c.primary }"
                :title="c.label"
                type="button"
                @click="form.color = c.id"
              />
            </div>
          </div>
        </div>
        <div class="allgemeines-right">
          <div class="field-row">
            <label class="field-label">Erholungsrate</label>
            <input class="field-input field-number" type="number" v-model.number="form.refresh" min="1" max="10" />
          </div>
          <div class="field-row">
            <label class="field-label">Fate-Punkte</label>
            <div class="fate-points-ctrl">
              <FateButton variant="counter" @click="form.fatePoints = Math.max(0, form.fatePoints - 1)">−</FateButton>
              <span class="fate-points">{{ form.fatePoints }}</span>
              <FateButton variant="counter" @click="form.fatePoints++">+</FateButton>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ASPEKTE / FERTIGKEITEN -->
    <div class="sheet-two-col">
      <section class="sheet-section aspekte">
        <div class="sheet-section-header">ASPEKTE</div>
        <AspectFields
          :highConcept="form.highConcept"
          :trouble="form.trouble"
          :aspects="form.aspects"
          @update:highConcept="form.highConcept = $event"
          @update:trouble="form.trouble = $event"
          @update:aspects="form.aspects = $event"
        />
      </section>

      <section class="sheet-section fertigkeiten">
        <div class="sheet-section-header">FERTIGKEITEN</div>
        <SkillPyramid
          :skills="form.skills"
          :maxLevel="form.pyramidMaxLevel ?? 5"
          :maxCols="form.pyramidMaxCols ?? 5"
          @update="form.skills = $event"
          @updateLayout="(p) => { form.pyramidMaxLevel = p.maxLevel; form.pyramidMaxCols = p.maxCols }"
        />
      </section>
    </div>

    <!-- EXTRAS / STUNTS -->
    <div class="sheet-two-col">
      <section class="sheet-section extras">
        <div class="sheet-section-header">EXTRAS</div>
        <textarea class="text-area-input" v-model="form.extras" placeholder="Extras beschreiben..." />
      </section>

      <section class="sheet-section stunts">
        <div class="sheet-section-header">STUNTS</div>
        <div class="stunts-list">
          <div v-for="(stunt, i) in form.stunts" :key="i" class="stunt-edit-row">
            <div class="stunt-edit-fields">
              <input
                class="stunt-name-input"
                :value="stunt.name"
                placeholder="Name des Stunts"
                @input="updateStunt(i, 'name', ($event.target as HTMLInputElement).value)"
              />
              <textarea
                class="stunt-desc-textarea"
                :value="stunt.description"
                placeholder="Beschreibung"
                rows="1"
                @input="updateStunt(i, 'description', ($event.target as HTMLTextAreaElement).value)"
              />
            </div>
            <FateButton variant="danger" size="S" @click="removeStunt(i)">✕</FateButton>
          </div>
          <FateButton variant="add" @click="addStunt">+ Stunt hinzufügen</FateButton>
        </div>
      </section>
    </div>

    <!-- STRESS / KONSEQUENZEN -->
    <div class="sheet-bottom">
      <div class="stress-section">
        <StressTrack
          label="KÖRPERLICHER STRESS (KRAFT)"
          :boxes="form.stressPhysical"
          @update="form.stressPhysical = $event"
        />
        <StressTrack
          label="GEISTIGER STRESS (WILLE)"
          :boxes="form.stressMental"
          @update="form.stressMental = $event"
        />
      </div>

      <section class="sheet-section konsequenzen">
        <div class="sheet-section-header">KONSEQUENZEN</div>
        <ConsequenceSlots
          :consequences="form.consequences"
          @update="form.consequences = $event"
        />
      </section>
    </div>

    <!-- FORM ACTIONS -->
    <div v-if="!hideActions" class="form-actions">
      <FateButton variant="secondary" @click="emit('cancel')">Abbrechen</FateButton>
      <FateButton @click="save">Speichern</FateButton>
    </div>

  </div>
</template>
