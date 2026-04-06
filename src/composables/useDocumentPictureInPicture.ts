import { computed, onBeforeUnmount, ref } from 'vue';

type DocumentPictureInPictureApi = {
  requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>;
};

export type DocumentPipOpenOptions = {
  width?: number;
  height?: number;
  title?: string;
  copyStylesFromMainDocument?: boolean;
  setupDocument?: (doc: Document) => void;
  mount: (context: { pipWindow: Window; doc: Document; mountNode: HTMLElement }) => void | (() => void);
};

export function useDocumentPictureInPicture() {
  const pipWindow = ref<Window | null>(null);
  const isOpening = ref(false);
  let cleanupMount: (() => void) | null = null;

  function getApi() {
    const win = window as Window & { documentPictureInPicture?: DocumentPictureInPictureApi };
    return win.documentPictureInPicture;
  }

  const isSupported = computed(
    () => typeof window !== 'undefined' && typeof document !== 'undefined' && !!getApi(),
  );

  const isOpen = computed(() => !!pipWindow.value && !pipWindow.value.closed);

  function copyStylesToDocument(targetDoc: Document) {
    const sourceNodes = Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]'));
    sourceNodes.forEach((node) => {
      targetDoc.head.appendChild(node.cloneNode(true));
    });
  }

  function close() {
    if (cleanupMount) {
      cleanupMount();
      cleanupMount = null;
    }

    if (pipWindow.value && !pipWindow.value.closed) {
      pipWindow.value.close();
    }
    pipWindow.value = null;
  }

  async function open(options: DocumentPipOpenOptions) {
    if (!isSupported.value) return false;
    if (isOpen.value || isOpening.value) return false;

    const pipApi = getApi();
    if (!pipApi) return false;

    isOpening.value = true;
    try {
      const nextWindow = await pipApi.requestWindow({
        width: options.width,
        height: options.height,
      });
      pipWindow.value = nextWindow;

      nextWindow.addEventListener(
        'pagehide',
        () => {
          close();
        },
        { once: true },
      );

      const pipDoc = nextWindow.document;
      if (options.title) {
        pipDoc.title = options.title;
      }
      if (options.copyStylesFromMainDocument !== false) {
        copyStylesToDocument(pipDoc);
      }

      options.setupDocument?.(pipDoc);

      const mountNode = pipDoc.createElement('div');
      pipDoc.body.appendChild(mountNode);
      const maybeCleanup = options.mount({
        pipWindow: nextWindow,
        doc: pipDoc,
        mountNode,
      });
      cleanupMount = typeof maybeCleanup === 'function' ? maybeCleanup : null;

      return true;
    } catch {
      close();
      return false;
    } finally {
      isOpening.value = false;
    }
  }

  onBeforeUnmount(() => {
    close();
  });

  return {
    pipWindow,
    isSupported,
    isOpen,
    isOpening,
    open,
    close,
  };
}
