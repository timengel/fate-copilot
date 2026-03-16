import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import DashboardView from '../views/DashboardView.vue';

const CharactersView = () => import('../views/CharactersView.vue');
const CharacterDetailView = () => import('../views/CharacterDetailView.vue');
const CampaignsView = () => import('../views/CampaignsView.vue');
const CampaignDetailView = () => import('../views/CampaignDetailView.vue');
const ItemsView = () => import('../views/ItemsView.vue');
const ItemDetailView = () => import('../views/ItemDetailView.vue');
const SkillsView = () => import('../views/SkillsView.vue');
const SettingsView = () => import('../views/SettingsView.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/dashboard', component: DashboardView },
    { path: '/characters', component: CharactersView },
    { path: '/characters/new', component: CharacterDetailView, props: { isNew: true } },
    { path: '/characters/:id', component: CharacterDetailView },
    { path: '/characters/:id/edit', component: CharacterDetailView, props: { editMode: true } },
    { path: '/campaigns', component: CampaignsView },
    { path: '/campaigns/new', component: CampaignDetailView, props: { isNew: true } },
    { path: '/campaigns/:id', component: CampaignDetailView },
    { path: '/campaigns/:id/edit', component: CampaignDetailView, props: { editMode: true } },
    { path: '/items', component: ItemsView },
    { path: '/items/new', component: ItemDetailView, props: { isNew: true } },
    { path: '/items/:id', component: ItemDetailView },
    { path: '/items/:id/edit', component: ItemDetailView, props: { editMode: true } },
    { path: '/skills', component: SkillsView },
    { path: '/settings', component: SettingsView },
  ],
});

export default router;
