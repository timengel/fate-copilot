import { render, screen } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, it, expect } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import App from './App.vue';
import { useGMModeStore } from './stores/gmMode';

describe('App navigation', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  async function setup(initialPath = '/', gmMode = false) {
    const pinia = createPinia();
    setActivePinia(pinia);
    useGMModeStore().isGMMode = gmMode;

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
});
