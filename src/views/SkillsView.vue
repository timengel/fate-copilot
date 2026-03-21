<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSkillsStore } from '../stores/skills';
import { useToastStore } from '../stores/toast';
import FateButton from '../components/shared/FateButton.vue';
import FateHeader from '../components/shared/FateHeader.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import { useConfirmDialog } from '../composables/useConfirmDialog';
import { useGMModeStore } from '../stores/gmMode';
import type { SkillInfo } from '../types';

const store = useSkillsStore();
const toastStore = useToastStore();
const gmModeStore = useGMModeStore();
const newSkillName = ref('');
const infoSkill = ref<string | null>(null);
const { confirmDialog, showConfirmDialog } = useConfirmDialog();

const sortedSkills = computed(() => [...store.skills].sort((a, b) => a.localeCompare(b, 'de')));

function add() {
  const trimmed = newSkillName.value.trim();
  if (trimmed) {
    store.addSkill(trimmed);
    toastStore.show(`Fertigkeit "${trimmed}" hinzugefügt`);
    newSkillName.value = '';
  }
}

function resetToDefaults() {
  showConfirmDialog(
    'Fertigkeiten zurücksetzen',
    'Die Fertigkeitsliste wird auf die Fate-Core-Standardfertigkeiten zurückgesetzt. Eigene Anpassungen gehen verloren.',
    () => store.resetToDefaults(),
  );
}

const SKILL_INFO: Record<string, SkillInfo> = {
  Athletik: {
    description:
      'Körperliche Fitness, Körperbeherrschung und Bewegungsfähigkeit. Wichtig für alles, was mit dem eigenen Körper in Bewegung zu tun hat.',
    actions: [
      {
        name: 'Überwinden',
        note: 'Hindernisse durch Springen, Laufen, Klettern, Schwimmen überwinden; Zonen wechseln.',
      },
      {
        name: 'Vorteil erschaffen',
        note: 'Taktische Vorteile durch Akrobatik oder Positionierung.',
      },
      {
        name: 'Verteidigen',
        note: 'Universelle Verteidigung in körperlichen Konflikten gegen Nah- und Fernkampfangriffe.',
      },
    ],
  },
  Charisma: {
    description:
      'Positive Beziehungen aufbauen, Wohlwollen erzeugen, Vertrauen wecken und andere dazu bringen, einen zu mögen.',
    actions: [
      {
        name: 'Überwinden',
        note: 'Jemanden überreden, etwas zu tun, oder seine Zuneigung gewinnen.',
      },
      {
        name: 'Vorteil erschaffen',
        note: 'Positive emotionale Zustände erzeugen wie „Aufgemuntert" oder „Gesprächsbereit".',
      },
      {
        name: 'Verteidigen',
        note: 'Ruf und Atmosphäre schützen, wenn andere versuchen, sie zu untergraben.',
      },
    ],
  },
  Diebeskünste: {
    description:
      'Dinge stehlen und in gesperrte Bereiche eindringen. In modernen Umgebungen auch Hacken und Sicherheitssysteme deaktivieren.',
    actions: [
      {
        name: 'Überwinden',
        note: 'Schlösser knacken, Fallen umgehen, Taschendiebstahl, Spuren verwischen.',
      },
      {
        name: 'Vorteil erschaffen',
        note: 'Orte auskundschaften, Sicherheitslücken finden, Tatortspuren auswerten.',
      },
    ],
  },
  Empathie: {
    description:
      'Emotionale Zustände und Verhaltensänderungen anderer erkennen – wie Wahrnehmung, aber für Gefühle statt physische Details.',
    actions: [
      {
        name: 'Vorteil erschaffen',
        note: 'Emotionalen Zustand einschätzen, Charakteraspekte (besonders von NSC) aufdecken.',
      },
      {
        name: 'Verteidigen',
        note: 'Täuschung aufdecken; gegen soziale Vorteile verteidigen; bei mentalen Konsequenzen helfen.',
      },
    ],
  },
  Fahren: {
    description:
      'Fahrzeuge und schnelle Fortbewegungsmittel steuern. Je nach Setting auch Reiten, Fliegen oder Pilotieren.',
    actions: [
      {
        name: 'Überwinden',
        note: 'Fahrzeug durch schwieriges Gelände navigieren, Rennen und Verfolgungsjagden.',
      },
      {
        name: 'Vorteil erschaffen',
        note: 'Optimale Routen finden, taktische Positionsvorteile erarbeiten.',
      },
      {
        name: 'Verteidigen',
        note: 'Fahrzeugschäden abwehren, Positionierungsversuche des Gegners kontern.',
      },
    ],
  },
  Handwerk: {
    description:
      'Umgang mit Maschinen und mechanischen Systemen. Je nach Setting auch Mechanik, Reparieren oder Technik.',
    actions: [
      { name: 'Überwinden', note: 'Maschinen bauen, zerstören oder reparieren.' },
      {
        name: 'Vorteil erschaffen',
        note: 'Aspekte über Maschineneigenschaften, schnelle Sabotage oder mechanische Manipulation.',
      },
    ],
  },
  Heimlichkeit: {
    description:
      'Ungesehen und ungehört bewegen. Funktioniert gut in Kombination mit Diebeskünsten.',
    actions: [
      {
        name: 'Überwinden',
        note: 'An Wachen vorbeischleichen, Verfolgern entkommen, keine Spuren hinterlassen.',
      },
      {
        name: 'Vorteil erschaffen',
        note: 'Aspekte wie „gut versteckt" oder „unbekannter Standort" erzeugen.',
      },
      {
        name: 'Verteidigen',
        note: 'Entdeckung durch Wahrnehmung verhindern; Spuren vor Nachforschung verschleiern.',
      },
    ],
  },
  Kämpfen: {
    description:
      'Nahkampfaktionen – unbewaffnet oder mit Waffe, innerhalb einer Zone. Für Fernkampf wird Schießen verwendet.',
    actions: [
      {
        name: 'Vorteil erschaffen',
        note: 'Betäubende Schläge, schmutzige Tricks, Entwaffnung, Kampfstil analysieren.',
      },
      { name: 'Angreifen', note: 'Direkte Nahkampfangriffe gegen Ziele in derselben Zone.' },
      {
        name: 'Verteidigen',
        note: 'Gegen Kämpfen-Angriffe und Vorteils-Erschaffungsversuche verteidigen.',
      },
    ],
  },
  Kontakte: {
    description:
      'Verbindungen zu Menschen und die Fähigkeit, neue Beziehungen zu knüpfen. Umfasst alle Kommunikationswege in der Spielwelt.',
    actions: [
      {
        name: 'Überwinden',
        note: 'Bestimmte Personen durch Straßennetzwerke, Informanten oder Datenbanken aufspüren.',
      },
      {
        name: 'Vorteil erschaffen',
        note: 'Den richtigen Kontakt finden, öffentliche Meinung beeinflussen, Gerüchte streuen.',
      },
      {
        name: 'Verteidigen',
        note: 'Soziale Vorteile abwehren; verhindern, dass man durch Täuschung oder Nachforschung gefunden wird.',
      },
    ],
  },
  Kraft: {
    description:
      'Rohe körperliche Stärke und Ausdauer. Pendant zu Athletik: unterscheidet „stark" von „wendig". Hohe Kraft gewährt zusätzliche Stressfelder.',
    actions: [
      {
        name: 'Überwinden',
        note: 'Physische Hindernisse durch rohe Kraft überwinden: Türen eintreten, Barrieren entfernen.',
      },
      {
        name: 'Vorteil erschaffen',
        note: 'Griffe, Ringen und körperliche Kontrolle im Nahkampf (z.B. „Schwitzkasten").',
      },
    ],
  },
  Nachforschung: {
    description:
      'Informationen durch konzentrierte Suche und sorgfältige Prüfung aufdecken. Aktiver als die passive Wahrnehmung.',
    actions: [
      { name: 'Überwinden', note: 'Tatortuntersuchung, gezielte Suche, relevante Quellen finden.' },
      {
        name: 'Vorteil erschaffen',
        note: 'Umfangreiche Details aufdecken: Überwachen, Akten durchsuchen, falsche Identitäten prüfen.',
      },
    ],
  },
  Provozieren: {
    description:
      'Andere in Wut versetzen und negative Emotionen wecken (Angst, Scham, Rage). Wirkt nicht gegen gefühllose Wesen.',
    actions: [
      {
        name: 'Überwinden',
        note: 'Ziele durch Einschüchterung zu emotionsgesteuerten Handlungen zwingen.',
      },
      {
        name: 'Vorteil erschaffen',
        note: 'Emotionale Zustände erschaffen: „Wütend", „Erschrocken", „Zögerlich".',
      },
      { name: 'Angreifen', note: 'Mentale Angriffe, die psychischen Schaden verursachen.' },
    ],
  },
  Ressourcen: {
    description:
      'Reichtum und die Fähigkeit, ihn einzusetzen. Kann je nach Setting Land, Gold oder Kreditwürdigkeit repräsentieren.',
    actions: [
      { name: 'Überwinden', note: 'Situationen mit Geld lösen: bestechen, Luxusgüter kaufen.' },
      {
        name: 'Vorteil erschaffen',
        note: 'Beziehungen durch Bestechung verbessern, Aspekte für besessene oder schnell beschaffte Gegenstände.',
      },
    ],
  },
  Schießen: {
    description:
      'Fernkampfwaffen einsetzen. Pendant zu Kämpfen für Distanzkämpfe – bis zu 2 Zonen Reichweite.',
    actions: [
      {
        name: 'Vorteil erschaffen',
        note: 'Taktische Manöver: Trickschüsse, Sperrfeuer, Entwaffnen auf Distanz.',
      },
      { name: 'Angreifen', note: 'Physische Angriffe gegen Ziele in bis zu 2 Zonen Entfernung.' },
    ],
  },
  Täuschung: {
    description:
      'Andere anlügen, in die Irre führen und durch Falschinformationen Ziele erreichen.',
    actions: [
      {
        name: 'Überwinden',
        note: 'Bluffs glaubwürdig machen, Lügen durchsetzen, Informationen durch Falschaussagen extrahieren.',
      },
      {
        name: 'Vorteil erschaffen',
        note: 'Ablenkungen, falsche Identitäten, irreführende Eindrücke erzeugen.',
      },
      { name: 'Verteidigen', note: 'Nachforschung abwehren; wahre Motive vor Empathie verbergen.' },
    ],
  },
  Wahrnehmung: {
    description:
      'Allgemeine Aufmerksamkeit und spontane Detailwahrnehmung. Schneller als Nachforschung, aber weniger tiefgreifend.',
    actions: [
      {
        name: 'Überwinden',
        note: 'Dinge im Umfeld bemerken, undeutliche Geräusche hören, versteckte Gegenstände entdecken.',
      },
      {
        name: 'Vorteil erschaffen',
        note: 'Aspekte aus Beobachtungen: Fluchtwege, Schwachstellen, Auffälligkeiten in der Menge.',
      },
      {
        name: 'Verteidigen',
        note: 'Gegen Heimlichkeit; Hinterhalte verhindern; bemerken, wenn man beobachtet wird.',
      },
    ],
  },
  Wille: {
    description:
      'Mentale Ausdauer und Belastbarkeit. Mentales Pendant zu Kraft. Hoher Wille gewährt zusätzliche mentale Stressfelder.',
    actions: [
      {
        name: 'Überwinden',
        note: 'Mentale Hindernisse überwinden: Rätsel, intellektuelle Aufgaben, bei denen Ausdauer zählt.',
      },
      {
        name: 'Vorteil erschaffen',
        note: 'Aspekte für erhöhte Konzentration oder intensive Fokussierung.',
      },
      {
        name: 'Verteidigen',
        note: 'Primäre Verteidigung gegen mentale Angriffe und emotionale Manipulation.',
      },
    ],
  },
  Wissen: {
    description:
      'Angesammeltes Wissen und formale Bildung. Je nach Setting auch Gelehrsamkeit oder Wissenschaft.',
    actions: [
      {
        name: 'Überwinden',
        note: 'Probleme durch Expertise lösen: alte Sprachen übersetzen, schwierige Fragen beantworten.',
      },
      {
        name: 'Vorteil erschaffen',
        note: 'Wie Nachforschung – Storyfakten oder verborgene Informationen aus Expertenwissen ableiten.',
      },
    ],
  },
};

const selectedInfo = computed<SkillInfo | null>(() =>
  infoSkill.value ? (SKILL_INFO[infoSkill.value] ?? null) : null,
);
</script>

<template>
  <div class="list-view">
    <FateHeader title="Fertigkeiten">
      <FateButton v-if="gmModeStore.isGMMode" variant="danger" @click="resetToDefaults">Auf Standard zurücksetzen</FateButton>
    </FateHeader>

    <p class="skills-hint">
      Diese Fertigkeiten stehen in der Skill-Pyramide als Dropdown-Optionen zur Verfügung.
    </p>

    <div class="skills-manage">
      <div>
        <div v-for="skill in sortedSkills" :key="skill" class="skill-manage-row">
          <div class="skill-manage-label">
            <span class="skill-manage-name">{{ skill }}</span>
            <FateButton
              v-if="SKILL_INFO[skill]"
              icon="info"
              variant="secondary"
              size="S"
              :title="`Info zu ${skill}`"
              @click="infoSkill = skill"
            />
          </div>
          <div class="skill-manage-actions">
            <FateButton
              v-if="gmModeStore.isGMMode"
              icon="close"
              variant="danger"
              size="S"
              @click="store.removeSkill(skill)"
            />
          </div>
        </div>
        <div v-if="store.skills.length === 0" class="empty-state">
          Keine Fertigkeiten vorhanden.
        </div>
      </div>

      <div v-if="gmModeStore.isGMMode" class="skill-add-row">
        <input
          class="skill-add-input"
          v-model="newSkillName"
          placeholder="Neue Fertigkeit..."
          @keydown.enter="add"
        />
        <FateButton :disabled="!newSkillName.trim()" @click="add">Hinzufügen</FateButton>
      </div>
    </div>
  </div>

  <ConfirmDialog
    v-if="confirmDialog"
    :title="confirmDialog.title"
    :message="confirmDialog.message"
    @confirm="confirmDialog.onConfirm(); confirmDialog = null"
    @cancel="confirmDialog = null"
  />

  <!-- Info Modal -->
  <Teleport to="body">
    <div v-if="infoSkill && selectedInfo" class="skill-info-overlay" @click.self="infoSkill = null">
      <div class="skill-info-modal">
        <div class="skill-info-header">
          <h2>{{ infoSkill }}</h2>
          <FateButton icon="close" variant="secondary" class="skill-info-close" @click="infoSkill = null"></FateButton
          >
        </div>
        <p class="skill-info-description">{{ selectedInfo.description }}</p>
        <div class="skill-info-actions">
          <h3>Aktionen</h3>
          <ul>
            <li v-for="action in selectedInfo.actions" :key="action.name">
              <strong>{{ action.name }}</strong>
              <span v-if="action.note">: {{ action.note }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.skills-hint {
  color: var(--fate-text-light);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.skills-manage {
  background: white;
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  overflow: hidden;
  margin: 0 auto 6rem auto;
}

.skill-manage-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1rem;
  border-bottom: 1px solid var(--fate-blue-light);
}

.skill-manage-row:hover {
  background: var(--fate-hover-bg);
}

.skill-manage-actions {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}

/* Skill info modal */
.skill-info-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.skill-info-modal {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 480px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
}

.skill-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  border-bottom: 2px solid var(--fate-blue);
  padding-bottom: 0.5rem;
}

.skill-info-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--fate-blue);
  margin: 0;
}

.skill-info-close {
  font-size: 1.1rem;
  color: var(--fate-muted);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}
.skill-info-close:hover {
  background: var(--fate-blue-light);
}

.skill-info-description {
  font-size: 0.9rem;
  color: var(--fate-text);
  margin: 0 0 1rem;
  line-height: 1.5;
}

.skill-info-actions h3 {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--fate-muted);
  margin: 0 0 0.5rem;
}

.skill-info-actions ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.skill-info-actions li {
  font-size: 0.875rem;
  color: var(--fate-text);
  padding: 0.4rem 0.6rem;
  background: var(--fate-blue-light);
  border-radius: 4px;
  line-height: 1.4;
}

.skill-info-actions li strong {
  color: var(--fate-blue);
}

.skill-manage-row:last-child {
  border-bottom: none;
}

.skill-manage-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.skill-manage-name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--fate-text);
}

.skill-add-row {
  display: flex;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-top: 1px solid var(--fate-border);
  background: var(--fate-blue-light);
}

.skill-add-input {
  flex: 1;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--fate-text);
  background: white;
  outline: none;
}

.skill-add-input:focus {
  border-color: var(--fate-blue);
}
</style>
