<script setup lang="ts">
import { Comment, Fragment, Text, computed, useSlots, type VNode } from 'vue';
import FateAvatar from './FateAvatar.vue';
import { getColorVars } from '../../composables/useColorVars';
import type { CharacterColor } from '@fate/types';

const props = withDefaults(
  defineProps<{
    color?: CharacterColor['id'] | string;
    avatar?: string;
    title: string;
    badgeLabel?: string;
    badgeVariant?: 'default' | 'gm' | 'status';
    clickable?: boolean;
    maxTitleLines?: 1 | 2 | 3;
    maxBodyLines?: 1 | 2 | 3;
  }>(),
  {
    color: undefined,
    avatar: undefined,
    badgeLabel: undefined,
    badgeVariant: 'default',
    clickable: false,
    maxTitleLines: 2,
    maxBodyLines: 3,
  },
);

const emit = defineEmits<{
  click: [];
}>();

const slots = useSlots();
const colorVars = computed(() => getColorVars(props.color));
const headerStyle = computed(() => ({ background: colorVars.value['--fate-blue'] }));
const titleClampStyle = computed(() => ({ '--fate-card-title-lines': String(props.maxTitleLines) }));
const bodyClampStyle = computed(() => ({ '--fate-card-body-lines': String(props.maxBodyLines) }));
const hasBody = computed(() => hasRenderableSlot('default'));
const hasMeta = computed(() => hasRenderableSlot('meta'));
const hasActions = computed(() => hasRenderableSlot('actions'));
const hasHeaderBadge = computed(() => Boolean(slots['header-badge']) || props.badgeLabel);

function handleClick() {
  emit('click');
}

function hasRenderableSlot(name: 'default' | 'meta' | 'actions' | 'header-badge') {
  const content = slots[name]?.() ?? [];
  return content.some(isRenderableNode);
}

function isRenderableNode(node: VNode): boolean {
  if (node.type === Comment) return false;
  if (node.type === Text) return String(node.children ?? '').trim().length > 0;
  if (node.type === Fragment) return (node.children as VNode[]).some(isRenderableNode);
  return true;
}
</script>

<template>
  <div
    class="fate-card"
    :class="{ 'fate-card--clickable': clickable, 'fate-card--with-actions': hasActions }"
    :style="colorVars"
  >
    <component
      :is="clickable ? 'button' : 'div'"
      class="fate-card__main"
      :class="{ 'fate-card__main--clickable': clickable }"
      :type="clickable ? 'button' : undefined"
      @click="clickable ? handleClick() : undefined"
    >
      <div class="fate-card__header" :style="headerStyle">
        <FateAvatar v-if="avatar" :value="avatar" size="S" />
        <span class="fate-card__title" :style="titleClampStyle">{{ title }}</span>
        <slot v-if="slots['header-badge']" name="header-badge" />
        <span
          v-else-if="hasHeaderBadge && badgeLabel"
          class="fate-card__badge"
          :class="`fate-card__badge--${badgeVariant}`"
        >
          {{ badgeLabel }}
        </span>
      </div>

      <div v-if="hasBody" class="fate-card__body" :style="bodyClampStyle">
        <slot />
      </div>

      <div v-if="hasMeta" class="fate-card__meta">
        <slot name="meta" />
      </div>
    </component>

    <div v-if="hasActions" class="fate-card__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.fate-card {
  background: color-mix(in srgb, var(--fate-card-mix-base) 45%, var(--fate-blue-light) 55%);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 210px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    box-shadow 0.15s;
}

.fate-card--clickable:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

.fate-card__main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.fate-card__main--clickable {
  appearance: none;
  border: none;
  background: transparent;
  width: 100%;
  padding: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.fate-card__header {
  color: white;
  font-weight: 700;
  font-size: 1rem;
  padding: 0.6rem 0.9rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.fate-card__title {
  min-width: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: var(--fate-card-title-lines, 2);
  line-clamp: var(--fate-card-title-lines, 2);
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 0.1rem;
}

.fate-card__body {
  padding: 0.25rem 0.9rem;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--fate-text);
  display: -webkit-box;
  -webkit-line-clamp: var(--fate-card-body-lines, 3);
  line-clamp: var(--fate-card-body-lines, 3);
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.fate-card__meta {
  display: flex;
  flex-wrap: nowrap;
  gap: 0 0.25rem;
  padding: 0.25rem 0.9rem;
  font-size: 0.8rem;
  color: var(--fate-text-light);
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.fate-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem 0.75rem;
  margin-top: auto;
}

.fate-card__badge {
  margin-left: auto;
  margin-top: 0.25rem;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.fate-card__badge--default {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.fate-card__badge--gm {
  background: rgba(0, 0, 0, 0.3);
  color: white;
}

.fate-card__badge--status {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

@media (pointer: coarse) {
  .fate-card__actions :deep(.fate-btn) {
    --btn-size: 36px;
  }
}

:global([data-theme="dark"] .fate-card) {
  background: var(--fate-white);
}

@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme="light"]) .fate-card) {
    background: var(--fate-white);
  }
}
</style>
