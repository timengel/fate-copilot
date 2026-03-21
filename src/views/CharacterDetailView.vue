<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCharactersStore } from '../stores/characters';
import { useCampaignsStore } from '../stores/campaigns';
import CharacterSheet from '../components/character/CharacterSheet.vue';
import FateButton from '../components/shared/FateButton.vue';
import FateCampaignSection from '../components/shared/FateCampaignSection.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import type { Character, CharacterType } from '../types';
import { createDefaultCharacter } from '../composables/useCharacterDefaults';
import { useConfirmDialog } from '../composables/useConfirmDialog';
import { useToastStore } from '../stores/toast';

const props = defineProps<{
  isNew?: boolean;
  editMode?: boolean;
}>();

const route = useRoute();
const router = useRouter();
const charactersStore = useCharactersStore();
const campaignsStore = useCampaignsStore();

const id = computed(() => {
  const param = route.params.id;
  return Array.isArray(param) ? (param[0] ?? '') : (param ?? '');
});
const isEditing = ref(props.isNew || props.editMode || false);
const charSheetRef = ref<InstanceType<typeof CharacterSheet> | null>(null);
const { confirmDialog, showConfirmDialog } = useConfirmDialog();
const toastStore = useToastStore();

const character = computed(() => {
  if (props.isNew) {
    return createDefaultCharacter(queryCharacterType());
  }
  return charactersStore.getById(id.value);
});

const backPath = computed(() => {
  if (props.isNew) {
    return route.query.type === 'nsc' ? '/characters?tab=nsc' : '/characters';
  }
  return (character.value?.type ?? 'sc') === 'nsc' ? '/characters?tab=nsc' : '/characters';
});

const characterCampaigns = computed(() =>
  character.value ? campaignsStore.getCampaignsForCharacter(character.value.id) : [],
);

const availableCampaigns = computed(() =>
  campaignsStore.campaigns.filter((c) => !characterCampaigns.value.some((cc) => cc.id === c.id)),
);

function handleSave(updated: Character) {
  if (props.isNew) {
    charactersStore.addCharacter(updated);
    router.replace(`/characters/${updated.id}`);
  } else {
    charactersStore.updateCharacter(updated);
    isEditing.value = false;
    if (props.editMode) router.replace(`/characters/${updated.id}`);
  }
  toastStore.show('Charakter gespeichert');
}

function handleCancel() {
  if (props.isNew) {
    router.push(backPath.value);
  } else {
    isEditing.value = false;
    if (props.editMode) router.replace(`/characters/${id.value}`);
  }
}

function toggleEdit() {
  isEditing.value = !isEditing.value;
}

function deleteCharacter() {
  if (!character.value) return;
  showConfirmDialog(
    'Charakter löschen',
    `Charakter "${character.value.name || 'Unbenannt'}" wirklich löschen?`,
    () => {
      charactersStore.deleteCharacter(character.value!.id);
      router.push(backPath.value);
    },
  );
}

const VALID_CHARACTER_TYPES: CharacterType[] = ['sc', 'nsc'];
function isCharacterType(value: unknown): value is CharacterType {
  return VALID_CHARACTER_TYPES.some((t) => t === value);
}
function queryCharacterType(): CharacterType {
  return isCharacterType(route.query.type) ? route.query.type : 'sc';
}

</script>

<template>
  <div class="detail-view">
    <div v-if="!character && !isNew" class="not-found">
      Charakter nicht gefunden.
      <FateButton variant="link" @click="router.push(backPath)">← Zurück</FateButton>
    </div>

    <template v-else-if="character">
      <div class="detail-toolbar">
        <div class="back-btn">
          <FateButton variant="secondary" icon="arrow-left" @click="router.push(backPath)">Charaktere</FateButton>
        </div>
      </div>

      <CharacterSheet
        v-if="isEditing"
        ref="charSheetRef"
        mode="edit"
        :isNew="isNew"
        :key="character.id"
        :character="character"
        :hideActions="true"
        @save="handleSave"
        @cancel="handleCancel"
      >
        <template #edit-bar-actions="{ isDirty }">
          <FateButton icon="close" variant="outline" size="M" @click="handleCancel"><span class="btn-label">Abbrechen</span></FateButton>
          <FateButton icon="check" variant="outline" size="M" :disabled="!isDirty" @click="charSheetRef?.save()"><span class="btn-label">Speichern</span></FateButton>
        </template>
      </CharacterSheet>

      <template v-else>
        <CharacterSheet :character="character">
          <template v-if="!isNew" #name-bar-actions>
            <FateButton icon="edit" variant="outline" size="M" @click="toggleEdit"><span class="btn-label">Bearbeiten</span></FateButton>
            <FateButton icon="delete" variant="danger" size="M" @click="deleteCharacter" />
          </template>
        </CharacterSheet>

        <!-- KAMPAGNEN-ZUORDNUNG -->
        <FateCampaignSection
          :assigned-campaigns="characterCampaigns"
          :available-campaigns="availableCampaigns"
          @assign="(id) => campaignsStore.assignCharacter(id, character!.id)"
          @unassign="(id) => campaignsStore.unassignCharacter(id, character!.id)"
          @navigate="(id) => router.push(`/campaigns/${id}`)"
        />
      </template>
    </template>
  </div>

  <ConfirmDialog
    v-if="confirmDialog"
    :title="confirmDialog.title"
    :message="confirmDialog.message"
    @confirm="
      confirmDialog.onConfirm();
      confirmDialog = null;
    "
    @cancel="confirmDialog = null"
  />
</template>

<style scoped>
.back-btn {
  --fate-blue: #1c9ed6;
  --fate-blue-dark: #1480b0;
  --fate-blue-light: #e8f4fb;
}

.not-found {
  padding: 2rem;
  text-align: center;
  color: var(--fate-text-light);
}
</style>
