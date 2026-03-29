import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useCharactersStore } from './characters';
import { SkillAction } from '../types';
import type { SkillActionInfo, SkillInfo } from '../types';

function cloneSkillAction(action: SkillActionInfo): SkillActionInfo {
  return {
    name: action.name,
    examples: action.examples,
  };
}

function cloneSkillInfo(info: SkillInfo): SkillInfo {
  return {
    description: info.description,
    actions: info.actions.map(cloneSkillAction),
  };
}

function cloneSkillInfoRecord(source: Record<string, SkillInfo>): Record<string, SkillInfo> {
  return Object.fromEntries(
    Object.entries(source).map(([name, info]) => [name, cloneSkillInfo(info)]),
  );
}

function freezeSkillInfoRecord(source: Record<string, SkillInfo>): Record<string, SkillInfo> {
  for (const info of Object.values(source)) {
    for (const action of info.actions) {
      Object.freeze(action);
    }
    Object.freeze(info.actions);
    Object.freeze(info);
  }

  return Object.freeze(source);
}

function createEmptySkillInfo(): SkillInfo {
  return {
    description: '',
    actions: [],
  };
}

function normalizeSkillInfoForNames(
  names: string[],
  source: Record<string, SkillInfo>,
): Record<string, SkillInfo> {
  return Object.fromEntries(
    names.map((name) => [name, cloneSkillInfo(source[name] ?? createEmptySkillInfo())]),
  );
}

export const DEFAULT_SKILL_INFO: Record<string, SkillInfo> = freezeSkillInfoRecord({
  Athletik: {
    description:
      'Körperliche Fitness, Körperbeherrschung und Bewegungsfähigkeit. Wichtig für alles, was mit dem eigenen Körper in Bewegung zu tun hat.',
    actions: [
      {
        name: SkillAction.Overcome,
        examples:
          'Hindernisse durch Springen, Laufen, Klettern, Schwimmen überwinden; Zonen wechseln.',
      },
      {
        name: SkillAction.CreateAdvantage,
        examples: 'Taktische Vorteile durch Akrobatik oder Positionierung.',
      },
      {
        name: SkillAction.Defend,
        examples:
          'Universelle Verteidigung in körperlichen Konflikten gegen Nah- und Fernkampfangriffe.',
      },
    ],
  },
  Charisma: {
    description:
      'Positive Beziehungen aufbauen, Wohlwollen erzeugen, Vertrauen wecken und andere dazu bringen, einen zu mögen.',
    actions: [
      {
        name: SkillAction.Overcome,
        examples: 'Jemanden überreden, etwas zu tun, oder seine Zuneigung gewinnen.',
      },
      {
        name: SkillAction.CreateAdvantage,
        examples:
          'Positive emotionale Zustände erzeugen wie „Aufgemuntert" oder „Gesprächsbereit".',
      },
      {
        name: SkillAction.Defend,
        examples: 'Ruf und Atmosphäre schützen, wenn andere versuchen, sie zu untergraben.',
      },
    ],
  },
  Diebeskünste: {
    description:
      'Dinge stehlen und in gesperrte Bereiche eindringen. In modernen Umgebungen auch Hacken und Sicherheitssysteme deaktivieren.',
    actions: [
      {
        name: SkillAction.Overcome,
        examples: 'Schlösser knacken, Fallen umgehen, Taschendiebstahl, Spuren verwischen.',
      },
      {
        name: SkillAction.CreateAdvantage,
        examples: 'Orte auskundschaften, Sicherheitslücken finden, Tatortspuren auswerten.',
      },
    ],
  },
  Empathie: {
    description:
      'Emotionale Zustände und Verhaltensänderungen anderer erkennen – wie Wahrnehmung, aber für Gefühle statt physische Details.',
    actions: [
      {
        name: SkillAction.CreateAdvantage,
        examples:
          'Emotionalen Zustand einschätzen, Charakteraspekte (besonders von NSC) aufdecken.',
      },
      {
        name: SkillAction.Defend,
        examples:
          'Täuschung aufdecken; gegen soziale Vorteile verteidigen; bei mentalen Konsequenzen helfen.',
      },
    ],
  },
  Fahren: {
    description:
      'Fahrzeuge und schnelle Fortbewegungsmittel steuern. Je nach Setting auch Reiten, Fliegen oder Pilotieren.',
    actions: [
      {
        name: SkillAction.Overcome,
        examples: 'Fahrzeug durch schwieriges Gelände navigieren, Rennen und Verfolgungsjagden.',
      },
      {
        name: SkillAction.CreateAdvantage,
        examples: 'Optimale Routen finden, taktische Positionsvorteile erarbeiten.',
      },
      {
        name: SkillAction.Defend,
        examples: 'Fahrzeugschäden abwehren, Positionierungsversuche des Gegners kontern.',
      },
    ],
  },
  Handwerk: {
    description:
      'Umgang mit Maschinen und mechanischen Systemen. Je nach Setting auch Mechanik, Reparieren oder Technik.',
    actions: [
      { name: SkillAction.Overcome, examples: 'Maschinen bauen, zerstören oder reparieren.' },
      {
        name: SkillAction.CreateAdvantage,
        examples:
          'Aspekte über Maschineneigenschaften, schnelle Sabotage oder mechanische Manipulation.',
      },
    ],
  },
  Heimlichkeit: {
    description:
      'Ungesehen und ungehört bewegen. Funktioniert gut in Kombination mit Diebeskünsten.',
    actions: [
      {
        name: SkillAction.Overcome,
        examples: 'An Wachen vorbeischleichen, Verfolgern entkommen, keine Spuren hinterlassen.',
      },
      {
        name: SkillAction.CreateAdvantage,
        examples: 'Aspekte wie „gut versteckt" oder „unbekannter Standort" erzeugen.',
      },
      {
        name: SkillAction.Defend,
        examples: 'Entdeckung durch Wahrnehmung verhindern; Spuren vor Nachforschung verschleiern.',
      },
    ],
  },
  Kämpfen: {
    description:
      'Nahkampfaktionen – unbewaffnet oder mit Waffe, innerhalb einer Zone. Für Fernkampf wird Schießen verwendet.',
    actions: [
      {
        name: SkillAction.CreateAdvantage,
        examples: 'Betäubende Schläge, schmutzige Tricks, Entwaffnung, Kampfstil analysieren.',
      },
      {
        name: SkillAction.Attack,
        examples: 'Direkte Nahkampfangriffe gegen Ziele in derselben Zone.',
      },
      {
        name: SkillAction.Defend,
        examples: 'Gegen Kämpfen-Angriffe und Vorteils-Erschaffungsversuche verteidigen.',
      },
    ],
  },
  Kontakte: {
    description:
      'Verbindungen zu Menschen und die Fähigkeit, neue Beziehungen zu knüpfen. Umfasst alle Kommunikationswege in der Spielwelt.',
    actions: [
      {
        name: SkillAction.Overcome,
        examples:
          'Bestimmte Personen durch Straßennetzwerke, Informanten oder Datenbanken aufspüren.',
      },
      {
        name: SkillAction.CreateAdvantage,
        examples:
          'Den richtigen Kontakt finden, öffentliche Meinung beeinflussen, Gerüchte streuen.',
      },
      {
        name: SkillAction.Defend,
        examples:
          'Soziale Vorteile abwehren; verhindern, dass man durch Täuschung oder Nachforschung gefunden wird.',
      },
    ],
  },
  Kraft: {
    description:
      'Rohe körperliche Stärke und Ausdauer. Pendant zu Athletik: unterscheidet „stark" von „wendig". Hohe Kraft gewährt zusätzliche Stressfelder.',
    actions: [
      {
        name: SkillAction.Overcome,
        examples:
          'Physische Hindernisse durch rohe Kraft überwinden: Türen eintreten, Barrieren entfernen.',
      },
      {
        name: SkillAction.CreateAdvantage,
        examples: 'Griffe, Ringen und körperliche Kontrolle im Nahkampf (z.B. „Schwitzkasten").',
      },
    ],
  },
  Nachforschung: {
    description:
      'Informationen durch konzentrierte Suche und sorgfältige Prüfung aufdecken. Aktiver als die passive Wahrnehmung.',
    actions: [
      {
        name: SkillAction.Overcome,
        examples: 'Tatortuntersuchung, gezielte Suche, relevante Quellen finden.',
      },
      {
        name: SkillAction.CreateAdvantage,
        examples:
          'Umfangreiche Details aufdecken: Überwachen, Akten durchsuchen, falsche Identitäten prüfen.',
      },
    ],
  },
  Provozieren: {
    description:
      'Andere in Wut versetzen und negative Emotionen wecken (Angst, Scham, Rage). Wirkt nicht gegen gefühllose Wesen.',
    actions: [
      {
        name: SkillAction.Overcome,
        examples: 'Ziele durch Einschüchterung zu emotionsgesteuerten Handlungen zwingen.',
      },
      {
        name: SkillAction.CreateAdvantage,
        examples: 'Emotionale Zustände erschaffen: „Wütend", „Erschrocken", „Zögerlich".',
      },
      {
        name: SkillAction.Attack,
        examples: 'Mentale Angriffe, die psychischen Schaden verursachen.',
      },
    ],
  },
  Ressourcen: {
    description:
      'Reichtum und die Fähigkeit, ihn einzusetzen. Kann je nach Setting Land, Gold oder Kreditwürdigkeit repräsentieren.',
    actions: [
      {
        name: SkillAction.Overcome,
        examples: 'Situationen mit Geld lösen: bestechen, Luxusgüter kaufen.',
      },
      {
        name: SkillAction.CreateAdvantage,
        examples:
          'Beziehungen durch Bestechung verbessern, Aspekte für besessene oder schnell beschaffte Gegenstände.',
      },
    ],
  },
  Schießen: {
    description:
      'Fernkampfwaffen einsetzen. Pendant zu Kämpfen für Distanzkämpfe – bis zu 2 Zonen Reichweite.',
    actions: [
      {
        name: SkillAction.CreateAdvantage,
        examples: 'Taktische Manöver: Trickschüsse, Sperrfeuer, Entwaffnen auf Distanz.',
      },
      {
        name: SkillAction.Attack,
        examples: 'Physische Angriffe gegen Ziele in bis zu 2 Zonen Entfernung.',
      },
    ],
  },
  Täuschung: {
    description:
      'Andere anlügen, in die Irre führen und durch Falschinformationen Ziele erreichen.',
    actions: [
      {
        name: SkillAction.Overcome,
        examples:
          'Bluffs glaubwürdig machen, Lügen durchsetzen, Informationen durch Falschaussagen extrahieren.',
      },
      {
        name: SkillAction.CreateAdvantage,
        examples: 'Ablenkungen, falsche Identitäten, irreführende Eindrücke erzeugen.',
      },
      {
        name: SkillAction.Defend,
        examples: 'Nachforschung abwehren; wahre Motive vor Empathie verbergen.',
      },
    ],
  },
  Wahrnehmung: {
    description:
      'Allgemeine Aufmerksamkeit und spontane Detailwahrnehmung. Schneller als Nachforschung, aber weniger tiefgreifend.',
    actions: [
      {
        name: SkillAction.Overcome,
        examples:
          'Dinge im Umfeld bemerken, undeutliche Geräusche hören, versteckte Gegenstände entdecken.',
      },
      {
        name: SkillAction.CreateAdvantage,
        examples:
          'Aspekte aus Beobachtungen: Fluchtwege, Schwachstellen, Auffälligkeiten in der Menge.',
      },
      {
        name: SkillAction.Defend,
        examples: 'Gegen Heimlichkeit; Hinterhalte verhindern; bemerken, wenn man beobachtet wird.',
      },
    ],
  },
  Wille: {
    description:
      'Mentale Ausdauer und Belastbarkeit. Mentales Pendant zu Kraft. Hoher Wille gewährt zusätzliche mentale Stressfelder.',
    actions: [
      {
        name: SkillAction.Overcome,
        examples:
          'Mentale Hindernisse überwinden: Rätsel, intellektuelle Aufgaben, bei denen Ausdauer zählt.',
      },
      {
        name: SkillAction.CreateAdvantage,
        examples: 'Aspekte für erhöhte Konzentration oder intensive Fokussierung.',
      },
      {
        name: SkillAction.Defend,
        examples: 'Primäre Verteidigung gegen mentale Angriffe und emotionale Manipulation.',
      },
    ],
  },
  Wissen: {
    description:
      'Angesammeltes Wissen und formale Bildung. Je nach Setting auch Gelehrsamkeit oder Wissenschaft.',
    actions: [
      {
        name: SkillAction.Overcome,
        examples:
          'Probleme durch Expertise lösen: alte Sprachen übersetzen, schwierige Fragen beantworten.',
      },
      {
        name: SkillAction.CreateAdvantage,
        examples:
          'Wie Nachforschung – Storyfakten oder verborgene Informationen aus Expertenwissen ableiten.',
      },
    ],
  },
});

export const DEFAULT_SKILL_NAMES = Object.freeze(Object.keys(DEFAULT_SKILL_INFO));

export const useSkillsStore = defineStore(
  'skills',
  () => {
    const skills = ref<string[]>([...DEFAULT_SKILL_NAMES]);
    const skillInfo = ref<Record<string, SkillInfo>>(cloneSkillInfoRecord(DEFAULT_SKILL_INFO));

    function addSkill(name: string) {
      const trimmed = name.trim();
      if (trimmed && !skills.value.includes(trimmed)) {
        skills.value.push(trimmed);
        if (!skillInfo.value[trimmed]) {
          skillInfo.value = {
            ...skillInfo.value,
            [trimmed]: createEmptySkillInfo(),
          };
        }
      }
    }

    function removeSkill(name: string) {
      if (!skills.value.includes(name)) {
        return;
      }

      skills.value = skills.value.filter((s) => s !== name);
      delete skillInfo.value[name];

      const charactersStore = useCharactersStore();
      for (const character of charactersStore.characters) {
        const filtered = character.skills.filter((e) => e.skill !== name);
        if (filtered.length !== character.skills.length) {
          charactersStore.updateCharacter({ ...character, skills: filtered });
        }
      }
    }

    function setSkillInfo(name: string, info: SkillInfo) {
      skillInfo.value = {
        ...skillInfo.value,
        [name]: cloneSkillInfo(info),
      };
    }

    function replaceAll(incoming: string[]) {
      skills.value = incoming;
      skillInfo.value = normalizeSkillInfoForNames(incoming, skillInfo.value);
    }

    function replaceAllWithInfo(incomingSkills: string[], incomingInfo: Record<string, SkillInfo>) {
      skills.value = incomingSkills;
      skillInfo.value = normalizeSkillInfoForNames(incomingSkills, incomingInfo);
    }

    function resetToDefaults() {
      skills.value = [...DEFAULT_SKILL_NAMES];
      skillInfo.value = cloneSkillInfoRecord(DEFAULT_SKILL_INFO);
    }

    return {
      skills,
      skillInfo,
      addSkill,
      removeSkill,
      setSkillInfo,
      replaceAll,
      replaceAllWithInfo,
      resetToDefaults,
    };
  },
  {
    persist: { key: 'fcp-skills' },
  },
);
