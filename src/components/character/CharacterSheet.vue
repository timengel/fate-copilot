<script setup lang="ts">
import type { Character } from '../../types'
import AspectFields from './AspectFields.vue'
import SkillPyramid from './SkillPyramid.vue'
import StressTrack from './StressTrack.vue'
import ConsequenceSlots from './ConsequenceSlots.vue'

defineProps<{
  character: Character
}>()
</script>

<template>
  <div class="character-sheet">

    <!-- ALLGEMEINES -->
    <section class="sheet-section allgemeines">
      <div class="sheet-section-header">ALLGEMEINES</div>
      <div class="allgemeines-grid">
        <div class="allgemeines-left">
          <div class="field-row">
            <label class="field-label">Name</label>
            <span class="field-value">{{ character.name || '—' }}</span>
          </div>
          <div class="field-row">
            <label class="field-label">Beschreibung</label>
            <span class="field-value field-description">{{ character.description || '—' }}</span>
          </div>
        </div>
        <div class="allgemeines-right">
          <div class="field-row">
            <label class="field-label">Erholungsrate</label>
            <span class="field-value refresh-value">{{ character.refresh }}</span>
          </div>
          <div class="field-row">
            <label class="field-label">Fate-Punkte</label>
            <span class="field-value fate-points">{{ character.fatePoints }}</span>
          </div>
          <div class="fate-logo-corner">
            <span class="fate-logo-plus">+</span>FATE
            <div class="fate-logo-sub">CORE SYSTEM</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ASPEKTE / FERTIGKEITEN -->
    <div class="sheet-two-col">
      <section class="sheet-section aspekte">
        <div class="sheet-section-header">ASPEKTE</div>
        <AspectFields
          :highConcept="character.highConcept"
          :trouble="character.trouble"
          :aspects="character.aspects"
          :readonly="true"
        />
      </section>

      <section class="sheet-section fertigkeiten">
        <div class="sheet-section-header">FERTIGKEITEN</div>
        <SkillPyramid
          :skills="character.skills"
          :maxLevel="character.pyramidMaxLevel ?? 5"
          :maxCols="character.pyramidMaxCols ?? 5"
          :readonly="true"
        />
      </section>
    </div>

    <!-- EXTRAS / STUNTS -->
    <div class="sheet-two-col">
      <section class="sheet-section extras">
        <div class="sheet-section-header">EXTRAS</div>
        <div class="text-area-display">{{ character.extras || '' }}</div>
      </section>

      <section class="sheet-section stunts">
        <div class="sheet-section-header">STUNTS</div>
        <div class="stunts-list">
          <div v-for="(stunt, i) in character.stunts" :key="i" class="stunt-item">
            <strong>{{ stunt.name }}</strong>
            <span v-if="stunt.description">: {{ stunt.description }}</span>
          </div>
          <div v-if="character.stunts.length === 0" class="empty-text"></div>
        </div>
      </section>
    </div>

    <!-- STRESS / KONSEQUENZEN -->
    <div class="sheet-bottom">
      <div class="stress-section">
        <StressTrack
          label="KÖRPERLICHER STRESS (KRAFT)"
          :boxes="character.stressPhysical"
          :readonly="true"
        />
        <StressTrack
          label="GEISTIGER STRESS (WILLE)"
          :boxes="character.stressMental"
          :readonly="true"
        />
      </div>

      <section class="sheet-section konsequenzen">
        <div class="sheet-section-header">KONSEQUENZEN</div>
        <ConsequenceSlots :consequences="character.consequences" :readonly="true" />
      </section>
    </div>

  </div>
</template>
