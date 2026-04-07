<script setup lang="ts">
import type { Item } from '@fate/types';
import FateButton from '../FateButton.vue';
import FateCard from '../FateCard.vue';

defineProps<{
  items: Item[];
  gmMode: boolean;
}>();

const emit = defineEmits<{
  open: [id: string];
  edit: [id: string];
  copy: [item: Item];
  'toggle-archived': [item: Item];
  delete: [item: Item];
}>();
</script>

<template>
  <div class="card-grid">
    <FateCard
      v-for="item in items"
      :key="item.id"
      :style="`view-transition-name: item-${item.id}`"
      :color="item.color"
      :avatar="item.avatar"
      :title="item.name || 'Unbenannt'"
      :badge-label="item.archived ? 'ARCHIV' : undefined"
      :badge-variant="item.archived ? 'status' : 'default'"
      clickable
      @click="emit('open', item.id)"
    >
      <template v-if="item.description">
        {{ item.description }}
      </template>
      <template v-if="item.redDice || item.blueDice || item.modifiers?.some((m) => m.value !== 0)" #meta>
        <span v-if="item.redDice">{{ item.redDice }} 🟥</span>
        <span v-if="item.redDice && item.blueDice"> · </span>
        <span v-if="item.blueDice">{{ item.blueDice }} 🟦</span>
        <template v-for="(mod, i) in item.modifiers?.filter((m) => m.value !== 0)" :key="i">
          <span v-if="i === 0 && (item.redDice || item.blueDice)"> · </span>
          <span v-if="i > 0"> · </span>
          <span>{{ mod.value > 0 ? '+' + mod.value : mod.value }} {{ mod.label }}</span>
        </template>
      </template>
      <template #actions>
        <FateButton icon="copy" variant="secondary" size="S" @click.stop="emit('copy', item)" />
        <FateButton icon="edit" variant="secondary" size="S" @click.stop="emit('edit', item.id)" />
        <FateButton
          :icon="item.archived ? 'unarchive' : 'archive'"
          variant="secondary"
          size="S"
          :aria-label="item.archived ? 'Gegenstand entarchivieren' : 'Gegenstand archivieren'"
          :title="item.archived ? 'Entarchivieren' : 'Archivieren'"
          @click.stop="emit('toggle-archived', item)"
        />
        <FateButton v-if="gmMode" icon="delete" variant="danger" size="S" @click.stop="emit('delete', item)" />
      </template>
    </FateCard>
  </div>
</template>
