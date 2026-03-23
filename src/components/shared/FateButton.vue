<script setup lang="ts">
import { useSlots } from 'vue';
import type { ButtonVariant, ButtonSize, ButtonIcon } from '../../types';
import FateIcon from './FateIcon.vue';

const slots = useSlots();

withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    type?: 'button' | 'submit' | 'reset';
    icon?: ButtonIcon;
    disabled?: boolean;
  }>(),
  {
    variant: 'primary',
    size: 'M',
    type: 'button',
    disabled: false,
  },
);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'fate-btn',
      `fate-btn--${variant}`,
      `fate-btn--${size}`,
      { 'fate-btn--icon-only': icon && !slots.default },
    ]"
  >
    <FateIcon v-if="icon" :name="icon" />
    <slot />
  </button>
</template>

<style scoped>
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  transition:
    background 0.15s,
    opacity 0.15s,
    box-shadow 0.15s;
  line-height: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  user-select: none;
}

.fate-btn--primary {
  background: var(--fate-btn-primary-bg, var(--fate-blue));
  color: white;
}
.fate-btn--primary:hover {
  background: color-mix(in srgb, var(--fate-btn-primary-bg, var(--fate-blue)) 80%, white);
}

.fate-btn--secondary {
  background: var(--fate-btn-secondary-bg);
  color: var(--fate-text);
}
.fate-btn--secondary:hover {
  background: var(--fate-btn-secondary-hover);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.fate-btn--danger-outline {
  background: var(--fate-btn-danger-outline-bg);
  color: var(--fate-red);
}
.fate-btn--danger-outline:hover {
  background: var(--fate-btn-danger-outline-hover);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.fate-btn--danger {
  background: var(--fate-red);
  color: white;
}
.fate-btn--danger:hover {
  background: var(--fate-btn-danger-hover);
}

/* SIZE CLASSES – control padding, font-size, height and --btn-size */
.fate-btn--XS {
  padding: 0 0.3rem;
  font-size: 0.7rem;
  --btn-size: 20px;
  height: var(--btn-size);
}
.fate-btn--S {
  padding: 0 0.6rem;
  font-size: 0.8rem;
  --btn-size: 24px;
  height: var(--btn-size);
}
.fate-btn--M {
  padding: 0 1rem;
  font-size: 0.875rem;
  --btn-size: 32px;
  height: var(--btn-size);
}
.fate-btn--L {
  padding: 0 1.25rem;
  font-size: 1rem;
  --btn-size: 40px;
  height: var(--btn-size);
}
.fate-btn--XL {
  padding: 0 1.6rem;
  font-size: 1.1rem;
  --btn-size: 48px;
  height: var(--btn-size);
}
.fate-btn--XXL {
  padding: 0 2rem;
  font-size: 1.2rem;
  --btn-size: 56px;
  height: var(--btn-size);
}

.fate-btn--icon-only {
  padding: 0;
  width: var(--btn-size, 32px);
  height: var(--btn-size, 32px);
  justify-content: center;
}

.fate-btn--add {
  background: var(--fate-btn-add-bg, var(--fate-blue-light));
  color: var(--fate-btn-add-color, var(--fate-blue));
}
.fate-btn--add:hover {
  background: var(--fate-btn-add-hover, color-mix(in srgb, var(--fate-blue-light) 60%, var(--fate-blue) 40%));
}

.fate-btn--link {
  background: transparent;
  color: var(--fate-blue);
}
.fate-btn--link:hover {
  text-decoration: underline;
}

.fate-btn--outline {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.fate-btn--outline:hover {
  background: rgba(255, 255, 255, 0.28);
}

.fate-btn--ghost {
  background: none;
  border: none;
  cursor: pointer;
  line-height: 1;
  flex-shrink: 0;
}
.fate-btn--ghost:hover {
  opacity: 0.7;
}

.fate-btn--subtle {
  background: none;
  box-shadow: none;
}
.fate-btn--subtle:hover {
  background: rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.fate-btn--counter {
  background: var(--fate-blue);
  color: white;
  border: none;
  border-radius: 50%;
  width: var(--btn-size, 32px);
  height: var(--btn-size, 32px);
  font-size: 1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.fate-btn--counter:hover {
  background: var(--fate-blue-dark);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.fate-btn--info {
  background: var(--fate-blue);
  color: white;
}

.fate-btn--info:hover {
  background: var(--fate-blue-dark);
}
</style>
