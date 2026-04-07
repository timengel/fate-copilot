import { render, screen, fireEvent } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import App from './App.vue';
import { useGMModeStore } from './stores/gmMode';
import { useTimerStore } from './stores/timer';

describe('App navigation', () => {
  let visibilityStateMock: DocumentVisibilityState = 'visible';

  beforeEach(() => {
    setActivePinia(createPinia());
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => visibilityStateMock,
    });
    visibilityStateMock = 'visible';
  });

  afterEach(() => {
    vi.useRealTimers();
    visibilityStateMock = 'visible';
    delete (window as Window & { documentPictureInPicture?: unknown }).documentPictureInPicture;
    const timerStore = useTimerStore();
    timerStore.clearTimerInterval();
    timerStore.reset();
    timerStore.closePopover();
  });

  async function setup(initialPath = '/', gmMode = false, timerSetup?: (store: ReturnType<typeof useTimerStore>) => void) {
    const pinia = createPinia();
    setActivePinia(pinia);
    useGMModeStore().isGMMode = gmMode;
    const timerStore = useTimerStore();
    timerSetup?.(timerStore);

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
        { path: '/campaigns', component: { template: '<div>Campaigns</div>' } },
        { path: '/characters', component: { template: '<div>Characters</div>' } },
        { path: '/items', component: { template: '<div>Items</div>' } },
        { path: '/skills', component: { template: '<div>Skills</div>' } },
        { path: '/cheat-sheet', component: { template: '<div>Cheat Sheet</div>' } },
        { path: '/settings', component: { template: '<div>Settings</div>' } },
      ],
    });

    await router.push(initialPath);
    await router.isReady();

    return {
      router,
      ...render(App, {
        global: {
          plugins: [pinia, router],
          stubs: {
            FatePlusLogo: { template: '<div>Logo</div>' },
            FateToggle: { template: '<div />' },
            FateIcon: { template: '<div />' },
            FateTimer: {
              emits: ['close'],
              template:
                '<section aria-label="Timer Popover"><button aria-label="Timer schließen" @click="$emit(\'close\')">X</button></section>',
            },
            FateToast: { template: '<div />' },
            ConfirmDialog: { template: '<div />' },
          },
        },
      }),
    };
  }

  it('always shows the cheat sheet link regardless of GM mode', async () => {
    await setup();

    const link = screen.getByRole('link', { name: 'Cheat Sheet' });
    expect(link.getAttribute('href')).toBe('/cheat-sheet');
  });

  it('shows the cheat sheet link in the navbar when GM mode is on', async () => {
    await setup('/', true);

    const link = screen.getByRole('link', { name: 'Cheat Sheet' });
    expect(link.getAttribute('href')).toBe('/cheat-sheet');
  });

  it('marks the cheat sheet link active on the cheat sheet route', async () => {
    await setup('/cheat-sheet', true);

    const link = screen.getByRole('link', { name: 'Cheat Sheet' });
    expect(link.classList.contains('router-link-active')).toBe(true);
  });

  it('renders the desktop timer nav shortcut button', async () => {
    await setup();

    expect(screen.getByRole('button', { name: 'Timer' })).toBeTruthy();
  });

  it('toggles timer popover state when clicking the desktop timer nav shortcut', async () => {
    await setup();
    const timerStore = useTimerStore();
    const timerButton = screen.getByRole('button', { name: 'Timer' });
    const mobileTimerButton = screen.getByRole('button', { name: 'Timer (Menü)' });

    expect(timerStore.isPopoverOpen).toBe(false);
    expect(timerButton.classList.contains('nav-timer-toggle--active')).toBe(false);
    expect(mobileTimerButton.classList.contains('nav-timer-toggle--active')).toBe(false);
    expect(document.body.classList.contains('timer-modal-open')).toBe(false);

    await fireEvent.click(timerButton);
    expect(timerStore.isPopoverOpen).toBe(true);
    expect(timerButton.classList.contains('nav-timer-toggle--active')).toBe(true);
    expect(mobileTimerButton.classList.contains('nav-timer-toggle--active')).toBe(true);
    expect(document.body.classList.contains('timer-modal-open')).toBe(true);

    await fireEvent.click(timerButton);
    expect(timerStore.isPopoverOpen).toBe(false);
    expect(timerButton.classList.contains('nav-timer-toggle--active')).toBe(false);
    expect(mobileTimerButton.classList.contains('nav-timer-toggle--active')).toBe(false);
    expect(document.body.classList.contains('timer-modal-open')).toBe(false);
  });

  it('closes the nav drawer when clicking the mobile timer nav action', async () => {
    const { container } = await setup();
    const drawer = container.querySelector('.nav-drawer') as HTMLElement;
    const hamburger = screen.getByRole('button', { name: 'Navigation öffnen' });
    const mobileTimerButton = screen.getByRole('button', { name: 'Timer (Menü)' });

    expect(drawer.classList.contains('nav-open')).toBe(false);

    await fireEvent.click(hamburger);
    expect(drawer.classList.contains('nav-open')).toBe(true);

    await fireEvent.click(mobileTimerButton);
    expect(drawer.classList.contains('nav-open')).toBe(false);
  });

  it('opens timer PiP when tab gets hidden while timer is running', async () => {
    const pipDoc = document.implementation.createHTMLDocument('Timer PiP');
    const pipWindow = {
      document: pipDoc,
      closed: false,
      close: vi.fn(function close() {
        this.closed = true;
      }),
      addEventListener: vi.fn(),
    } as unknown as Window;
    const requestWindow = vi.fn().mockResolvedValue(pipWindow);
    (window as Window & { documentPictureInPicture?: { requestWindow: typeof requestWindow } }).documentPictureInPicture = {
      requestWindow,
    };

    await setup('/', false, (store) => {
      store.remainingSeconds = 60;
      store.hasStarted = true;
      store.isRunning = true;
    });

    visibilityStateMock = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));
    await Promise.resolve();
    await Promise.resolve();

    expect(requestWindow).toHaveBeenCalledTimes(1);
  });

  it('does not open timer PiP when timer is not running', async () => {
    const requestWindow = vi.fn();
    (window as Window & { documentPictureInPicture?: { requestWindow: typeof requestWindow } }).documentPictureInPicture = {
      requestWindow,
    };

    await setup('/', false, (store) => {
      store.remainingSeconds = 60;
      store.hasStarted = false;
      store.isRunning = false;
    });

    visibilityStateMock = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));
    await Promise.resolve();

    expect(requestWindow).not.toHaveBeenCalled();
  });

  it('closes timer PiP when tab becomes visible again', async () => {
    const pipDoc = document.implementation.createHTMLDocument('Timer PiP');
    const pipWindow = {
      document: pipDoc,
      closed: false,
      close: vi.fn(function close() {
        this.closed = true;
      }),
      addEventListener: vi.fn(),
    } as unknown as Window;
    const requestWindow = vi.fn().mockResolvedValue(pipWindow);
    (window as Window & { documentPictureInPicture?: { requestWindow: typeof requestWindow } }).documentPictureInPicture = {
      requestWindow,
    };

    await setup('/', false, (store) => {
      store.remainingSeconds = 60;
      store.hasStarted = true;
      store.isRunning = true;
    });

    visibilityStateMock = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));
    await Promise.resolve();
    await Promise.resolve();

    visibilityStateMock = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));

    expect((pipWindow.close as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(1);
  });

  it('closes timer PiP when app window gets focus', async () => {
    const pipDoc = document.implementation.createHTMLDocument('Timer PiP');
    const pipWindow = {
      document: pipDoc,
      closed: false,
      close: vi.fn(function close() {
        this.closed = true;
      }),
      addEventListener: vi.fn(),
    } as unknown as Window;
    const requestWindow = vi.fn().mockResolvedValue(pipWindow);
    (window as Window & { documentPictureInPicture?: { requestWindow: typeof requestWindow } }).documentPictureInPicture = {
      requestWindow,
    };

    await setup('/', false, (store) => {
      store.remainingSeconds = 60;
      store.hasStarted = true;
      store.isRunning = true;
    });

    visibilityStateMock = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));
    await Promise.resolve();
    await Promise.resolve();

    window.dispatchEvent(new Event('focus'));

    expect((pipWindow.close as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(1);
  });

  it('closes timer PiP when running timer stops', async () => {
    const pipDoc = document.implementation.createHTMLDocument('Timer PiP');
    const pipWindow = {
      document: pipDoc,
      closed: false,
      close: vi.fn(function close() {
        this.closed = true;
      }),
      addEventListener: vi.fn(),
    } as unknown as Window;
    const requestWindow = vi.fn().mockResolvedValue(pipWindow);
    (window as Window & { documentPictureInPicture?: { requestWindow: typeof requestWindow } }).documentPictureInPicture = {
      requestWindow,
    };

    await setup('/', false, (store) => {
      store.remainingSeconds = 60;
      store.hasStarted = true;
      store.isRunning = true;
    });

    visibilityStateMock = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));
    await Promise.resolve();
    await Promise.resolve();

    const timerStore = useTimerStore();
    timerStore.isRunning = false;
    await Promise.resolve();

    expect((pipWindow.close as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(1);
  });

  it('does not throw without Document PiP support', async () => {
    await setup('/', false, (store) => {
      store.remainingSeconds = 60;
      store.hasStarted = true;
      store.isRunning = true;
    });

    visibilityStateMock = 'hidden';
    expect(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    }).not.toThrow();
  });
});
