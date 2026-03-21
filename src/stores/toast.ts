import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastType = 'success' | 'error';

export const useToastStore = defineStore('toast', () => {
  const message = ref('');
  const visible = ref(false);
  const type = ref<ToastType>('success');
  let timer: ReturnType<typeof setTimeout> | null = null;

  function show(msg: string, duration = 2500, toastType: ToastType = 'success') {
    message.value = msg;
    type.value = toastType;
    visible.value = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      visible.value = false;
    }, duration);
  }

  return { message, visible, type, show };
});
