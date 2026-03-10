import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'
import CharactersView from '../views/CharactersView.vue'
import CharacterDetailView from '../views/CharacterDetailView.vue'
import CampaignsView from '../views/CampaignsView.vue'
import CampaignDetailView from '../views/CampaignDetailView.vue'
import SkillsView from '../views/SkillsView.vue'

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
    { path: '/skills', component: SkillsView },
  ],
})

export default router
