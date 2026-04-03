<script setup lang="ts">
import ActionsCard from './cards/ActionsCard.vue';
import AspektartenCard from './cards/AspektartenCard.vue';
import ChallengesCard from './cards/ChallengesCard.vue';
import CheckLadderCard from './cards/CheckLadderCard.vue';
import ChancesCard from './cards/ChancesCard.vue';
import ConsequencesBasicCard from './cards/KonsequenzenBasicCard.vue';
import ContestsCard from './cards/ContestsCard.vue';
import MilestonesCard from './cards/MilestonesCard.vue';
import NiederlageEinraeumenCard from './cards/NiederlageEinraeumenCard.vue';
import SceneSetupChecklistCard from './cards/SceneSetupChecklistCard.vue';

type CheatSheetVariant = 'basic' | 'gm';

const props = withDefaults(
  defineProps<{
    variant?: CheatSheetVariant;
  }>(),
  {
    variant: 'gm',
  },
);
</script>

<template>
  <div class="cheat-sheet-page" :class="`cheat-sheet-page-${props.variant}`">
    <div class="sheet-content">
      <section class="cheat-grid" aria-label="Fate cheat sheet">
        <CheckLadderCard class="cheat-card-slot cheat-card-ladder" />
        <ActionsCard class="cheat-card-slot cheat-card-actions" />
        <ChancesCard class="cheat-card-slot cheat-card-rule rule-area-chances" />

        <template v-if="props.variant === 'basic'">
          <AspektartenCard class="cheat-card-slot cheat-card-rule rule-area-aspect-types" />
          <NiederlageEinraeumenCard class="cheat-card-slot cheat-card-rule rule-area-concede" />
          <ConsequencesBasicCard class="cheat-card-slot cheat-card-rule rule-area-consequences-basic" />
        </template>

        <template v-else>
          <ChallengesCard class="cheat-card-slot cheat-card-rule rule-area-challenges" />
          <ContestsCard class="cheat-card-slot cheat-card-rule rule-area-contests" />
          <MilestonesCard class="cheat-card-slot cheat-card-rule rule-area-milestones" />
          <SceneSetupChecklistCard class="cheat-card-slot cheat-card-rule rule-area-scene-setup" />
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.cheat-sheet-page {
  width: min(100%, 1200px);
  max-width: 100%;
  margin-inline: auto;
}

.sheet-content {
  width: 100%;
  max-width: none;
  container-type: inline-size;
  container-name: cheatsheet;
}

.cheat-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  align-items: start;
}

.cheat-card-slot {
  background: var(--fate-white);
  border: 1px solid var(--fate-border);
  border-radius: 10px;
  padding: 0.95rem;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  min-width: 0;
}

.cheat-card-actions {
  grid-column: auto;
}

@container cheatsheet (max-width: 34rem) {
  .cheat-card-slot {
    padding: 0.85rem;
  }
}

@container cheatsheet (min-width: 35rem) {
  .cheat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@container cheatsheet (min-width: 62rem) {
  .cheat-sheet-page {
    padding: 0.9rem;
    border: 1px solid color-mix(in srgb, var(--fate-border) 80%, white);
    border-radius: 12px;
    background: color-mix(in srgb, var(--fate-white) 86%, var(--fate-blue-light) 14%);
    box-shadow:
      0 2px 6px rgba(15, 23, 42, 0.08),
      0 16px 36px rgba(15, 23, 42, 0.12);
    overflow: hidden;
  }

  .cheat-grid {
    grid-template-columns: minmax(11.5rem, 13rem) repeat(3, minmax(0, 1fr));
    grid-template-areas:
      'leiter aktionen aktionen aktionen'
      'leiter challenges scene-setup milestones'
      'chances contests scene-setup milestones'
      'chances contests scene-setup milestones';
    gap: 0.5rem;
  }

  .cheat-card-ladder {
    grid-area: leiter;
    align-self: start;
  }

  .cheat-card-actions {
    grid-area: aktionen;
    display: flex;
    flex-direction: column;
  }

  .cheat-card-actions :deep(.table-wrap) {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
  }

  .cheat-card-actions :deep(.action-table) {
    height: 100%;
  }

  .rule-area-challenges {
    grid-area: challenges;
  }

  .rule-area-contests {
    grid-area: contests;
  }

  .rule-area-milestones {
    grid-area: milestones;
  }

  .rule-area-chances {
    grid-area: chances;
  }

  .rule-area-scene-setup {
    grid-area: scene-setup;
  }

  .cheat-sheet-page-basic .cheat-grid {
    grid-template-columns: minmax(11.5rem, 13rem) repeat(3, minmax(0, 1fr));
    grid-template-areas:
      'leiter aktionen aktionen aktionen'
      'leiter aspekte aspekte x'
      'chance y z u';
  }

  .cheat-sheet-page-basic .rule-area-aspect-types {
    grid-area: aspekte;
  }

  .cheat-sheet-page-basic .rule-area-chances {
    grid-area: chance;
  }

  .cheat-sheet-page-basic .rule-area-concede {
    grid-area: z;
  }

  .cheat-sheet-page-basic .rule-area-consequences-basic {
    grid-area: y;
  }
}
</style>
