import { ref } from 'vue'

export function useConfirmDialog() {
  const confirmDialog = ref<{ title: string; message: string; onConfirm: () => void } | null>(null)

  function showConfirmDialog(title: string, message: string, onConfirm: () => void) {
    confirmDialog.value = { title, message, onConfirm }
  }

  return { confirmDialog, showConfirmDialog }
}
