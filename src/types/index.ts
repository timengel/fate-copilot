// ============================================================
// UI Types
// ============================================================

export enum ToggleVariant {
  Primary = 'primary',
  Ghost = 'ghost',
  Danger = 'danger',
}

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'danger-outline'
  | 'link'
  | 'outline'
  | 'add'
  | 'info'
  | 'counter'
  | 'ghost'
  | 'subtle';

export enum DropdownVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Danger = 'danger',
  DangerOutline = 'danger-outline',
  Link = 'link',
  Outline = 'outline',
  Add = 'add',
  Ghost = 'ghost',
  Subtle = 'subtle',
}

export type ButtonSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type ButtonIcon =
  | 'delete'
  | 'edit'
  | 'grip'
  | 'archive'
  | 'unarchive'
  | 'minus'
  | 'plus'
  | 'add'
  | 'close'
  | 'check'
  | 'play'
  | 'pause'
  | 'info'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'die-plus'
  | 'die-blank'
  | 'die-minus'
  | 'chevron-left'
  | 'chevron-right'
  | 'download'
  | 'upload'
  | 'copy'
  | 'paste'
  | 'settings'
  | 'reset'
  | 'chevrons-down'
  | 'chevrons-up'
  | 'sun'
  | 'moon'
  | 'monitor'
  | 'clock';

// ============================================================
// Domain Types
// ============================================================

export type CampaignStatus = 'active' | 'inactive' | 'completed';

export type MilestoneType = 'small' | 'significant' | 'major';

export type ConsequenceLabel = 'mild' | 'moderate' | 'severe' | 'extreme';

export type ConsequenceSeverity = 2 | 4 | 6 | 8;

export type SkillLevel = number;

export type AppDataVersion = '1.0' | '1.1';

export type CharacterType = 'sc' | 'nsc';

// ============================================================
// Interfaces
// ============================================================

export interface SkillEntry {
  skill: string;
  level: SkillLevel;
}

export interface Stunt {
  name: string;
  description: string;
}

export interface StressBox {
  value: number; // 1, 2, 3, or 4
  checked: boolean;
}

export interface StressTrack {
  label: string;
  boxes: StressBox[];
}

export interface Consequence {
  severity: ConsequenceSeverity; // 2=Leicht, 4=Mittel, 6=Schwer, 8=Extrem
  label: ConsequenceLabel;
  value: string;
}

export interface Modifier {
  label: string;
  value: number;
}

export interface Character {
  id: string;
  type?: CharacterType;
  archived?: boolean;
  name: string;
  description: string;
  highConcept: string;
  trouble: string;
  aspects: string[]; // up to 3 additional aspects beyond highConcept + trouble
  skills: SkillEntry[];
  stunts: Stunt[];
  extras: string;
  refresh: number;
  fatePoints: number;
  stressTracks?: StressTrack[];
  /** @deprecated use stressTracks instead */
  stressPhysical?: StressBox[];
  /** @deprecated use stressTracks instead */
  stressMental?: StressBox[];
  consequences: Consequence[];
  notes: string;
  gmNotes?: string;
  pyramidMaxLevel?: number;
  pyramidMaxCols?: number;
  color?: string;
  avatar?: string;
  redDice?: number;
  blueDice?: number;
  modifiers?: Modifier[];
  /** @deprecated use modifiers instead */
  pureDamage?: number;
  /** @deprecated use modifiers instead */
  deflection?: number;
}

export interface Item {
  id: string;
  type: 'item';
  archived?: boolean;
  name: string;
  description: string;
  aspects: string[];
  stunts: Stunt[];
  extras: string;
  stressTracks?: StressTrack[];
  /** @deprecated use stressTracks instead */
  stressPhysical?: StressBox[];
  /** @deprecated use stressTracks instead */
  stressMental?: StressBox[];
  gmNotes?: string;
  hidden?: boolean;
  color?: string;
  avatar?: string;
  redDice: number;
  blueDice: number;
  modifiers?: Modifier[];
  /** @deprecated use modifiers instead */
  pureDamage?: number;
  /** @deprecated use modifiers instead */
  deflection?: number;
  consequences?: Consequence[];
}

export interface Milestone {
  id: string;
  type: MilestoneType;
  description: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  notes: string;
  gmNotes?: string;
  color?: string;
  avatar?: string;
  milestones: Milestone[];
}

export interface CampaignCharacterAssignment {
  campaignId: string;
  characterId: string;
}

export interface CampaignItemAssignment {
  campaignId: string;
  itemId: string;
}

export interface CharacterItemAssignment {
  characterId: string;
  itemId: string;
}

export interface AppData {
  formatVersion: AppDataVersion;
  exportDate: string;
  campaigns: Campaign[];
  characters: Character[];
  items?: Item[]; // optional für Rückwärtskompatibilität
  campaignCharacterAssignments: CampaignCharacterAssignment[];
  campaignItemAssignments?: CampaignItemAssignment[]; // optional für Rückwärtskompatibilität
  characterItemAssignments?: CharacterItemAssignment[]; // optional für Rückwärtskompatibilität
  skills?: AppSkill[] | string[]; // optional für Rückwärtskompatibilität mit v1.0
}

export enum SkillAction {
  Overcome = 'Überwinden',
  CreateAdvantage = 'Vorteil erschaffen',
  Attack = 'Angreifen',
  Defend = 'Verteidigen',
}

export interface SkillActionInfo {
  name: SkillAction;
  examples?: string;
}

export interface SkillInfo {
  description: string;
  actions: SkillActionInfo[];
}

export interface AppSkillAction {
  name: SkillAction;
  examples: string;
}

export interface AppSkill {
  name: string;
  description: string;
  actions: AppSkillAction[];
}

export interface CharacterColor {
  id: string;
  label: string;
  primary: string;
  dark: string;
  light: string;
}

// ============================================================
// Constants
// ============================================================

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  active: 'Aktiv',
  inactive: 'Inaktiv',
  completed: 'Abgeschlossen',
};

export type TagColor =
  | 'pfau'
  | 'heidelbeere'
  | 'lavendel'
  | 'weintraube'
  | 'tomate'
  | 'erdbeere'
  | 'lachs'
  | 'koralle'
  | 'flamingo'
  | 'mandarine'
  | 'bernstein'
  | 'banane'
  | 'limette'
  | 'salbei'
  | 'basilikum'
  | 'hellgrau'
  | 'schiefer'
  | 'gray'
  | 'haselnuss'
  | 'zimt'
  | 'türkis'
  | 'rose';

export const CHARACTER_COLORS: CharacterColor[] = [
  { id: 'tomate', label: 'Tomate', primary: '#D50000', dark: '#B71C1C', light: '#FDECEA' },
  { id: 'erdbeere', label: 'Erdbeere', primary: '#E53935', dark: '#C62828', light: '#FDEBEB' },
  { id: 'lachs', label: 'Lachs', primary: '#F28B82', dark: '#D96C63', light: '#FFF1EF' },
  { id: 'koralle', label: 'Koralle', primary: '#FF7043', dark: '#E64A19', light: '#FBE9E7' },
  { id: 'mandarine', label: 'Mandarine', primary: '#E67A17', dark: '#BF6010', light: '#FEF3E2' },
  { id: 'bernstein', label: 'Bernstein', primary: '#FFB300', dark: '#FF8F00', light: '#FFF8E1' },
  { id: 'banane', label: 'Banane', primary: '#C9A84C', dark: '#A07830', light: '#FEF9E3' },
  { id: 'limette', label: 'Limette', primary: '#7CB342', dark: '#558B2F', light: '#F1F8E9' },
  { id: 'salbei', label: 'Salbei', primary: '#57A05C', dark: '#3D7A41', light: '#EAF5EA' },
  { id: 'basilikum', label: 'Basilikum', primary: '#0B8043', dark: '#076030', light: '#E6F4EC' },
  { id: 'türkis', label: 'Türkis', primary: '#00ACC1', dark: '#00838F', light: '#E0F7FA' },
  { id: 'pfau', label: 'Pfau', primary: '#0288D1', dark: '#01579B', light: '#E1F5FE' },
  {
    id: 'heidelbeere',
    label: 'Heidelbeere',
    primary: '#3F51B5',
    dark: '#2C3E8C',
    light: '#E8EAF6',
  },
  { id: 'lavendel', label: 'Lavendel', primary: '#7986CB', dark: '#5C6BC0', light: '#EDE7F6' },
  { id: 'weintraube', label: 'Weintraube', primary: '#8E24AA', dark: '#6A1B7A', light: '#F3E5F5' },
  { id: 'flamingo', label: 'Flamingo', primary: '#F06292', dark: '#E91E63', light: '#FCE4EC' },
  { id: 'rose', label: 'Rose', primary: '#C2185B', dark: '#880E4F', light: '#FCE4EC' },
  { id: 'hellgrau', label: 'Hellgrau', primary: '#9EADB5', dark: '#7F919A', light: '#EEF2F4' },
  { id: 'schiefer', label: 'Schiefer', primary: '#78909C', dark: '#546E7A', light: '#E8EEF1' },
  { id: 'gray', label: 'Graphit', primary: '#546E7A', dark: '#37474F', light: '#E3E9EC' },
  { id: 'haselnuss', label: 'Haselnuss', primary: '#8D6E63', dark: '#6D4C41', light: '#EFEBE9' },
  { id: 'zimt', label: 'Zimt', primary: '#6D4C41', dark: '#3E2723', light: '#ECE3DF' },
];

export type CheckLadderLevel = -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type PositiveCheckLadderLevel = Exclude<CheckLadderLevel, -2 | -1 | 0>;

export interface CheckLadderEntry {
  level: CheckLadderLevel;
  value: string;
  label: string;
}

export const CHECK_LADDER: CheckLadderEntry[] = [
  { level: 8, value: '+8', label: 'Legendär' },
  { level: 7, value: '+7', label: 'Episch' },
  { level: 6, value: '+6', label: 'Fantastisch' },
  { level: 5, value: '+5', label: 'Hervorragend' },
  { level: 4, value: '+4', label: 'Großartig' },
  { level: 3, value: '+3', label: 'Gut' },
  { level: 2, value: '+2', label: 'Ordentlich' },
  { level: 1, value: '+1', label: 'Durchschnitt' },
  { level: 0, value: '0', label: 'Mäßig' },
  { level: -1, value: '-1', label: 'Armselig' },
  { level: -2, value: '-2', label: 'Grauenhaft' },
];

export const POSITIVE_CHECK_LADDER_LABELS: Record<PositiveCheckLadderLevel, string> = {
  1: 'Durchschnitt',
  2: 'Ordentlich',
  3: 'Gut',
  4: 'Großartig',
  5: 'Hervorragend',
  6: 'Fantastisch',
  7: 'Episch',
  8: 'Legendär',
};

export function getPositiveCheckLadderLabel(level: number): string {
  return POSITIVE_CHECK_LADDER_LABELS[level as PositiveCheckLadderLevel] ?? '';
}

export const SKILL_LIST = [
  'Athletik',
  'Charisma',
  'Diebeskünste',
  'Empathie',
  'Fahren',
  'Handwerk',
  'Heimlichkeit',
  'Kämpfen',
  'Kontakte',
  'Kraft',
  'Nachforschung',
  'Provozieren',
  'Ressourcen',
  'Schießen',
  'Täuschung',
  'Wahrnehmung',
  'Wille',
  'Wissen',
];
