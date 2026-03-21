<script setup lang="ts">
import FateTag from './FateTag.vue';

defineProps<{ modelValue?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value;
  const segments = [...new Intl.Segmenter().segment(val)];
  const first = segments[0]?.segment ?? '';
  emit('update:modelValue', first);
  (e.target as HTMLInputElement).value = first;
}
</script>

<template>
  <div class="avatar-picker">
    <input class="avatar-input" :value="modelValue" placeholder="?" @input="onInput" />
    <span class="avatar-hint">Use <FateTag color="gray" label="control + ⌘ + space" /> to open the emoji picker!</span>
  </div>
</template>

<style scoped>
.avatar-picker {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.avatar-input {
  width: 3rem;
  text-align: center;
  font-size: 1rem;
  border: none;
  border-bottom: 1px solid var(--fate-border, #d0d0d0);
  padding: 2px 4px;
  font-family: inherit;
  color: var(--fate-text, #333);
  background: transparent;
  outline: none;
}

.avatar-input:focus {
  border-bottom-color: var(--fate-blue, #1c9ed6);
}

.avatar-hint {
  font-size: 0.7rem;
  color: var(--fate-text-light, #999);
}

@container (width < 768px) {
  .avatar-hint {
    display: none;
  }
}
</style>
