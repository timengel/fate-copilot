// ============================================================
// UI Types
// ============================================================

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

export type ButtonSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'

export type ButtonIcon =
  | 'delete'
  | 'edit'
  | 'add'
  | 'close'
  | 'check'
  | 'info'
  | 'arrow-left'
  | 'arrow-right'
  | 'download'
  | 'upload'

// ============================================================
// Domain Types
// ============================================================

export type CampaignStatus = 'active' | 'inactive' | 'completed'

export type MilestoneType = 'small' | 'significant' | 'major'

export type ConsequenceLabel = 'mild' | 'moderate' | 'severe' | 'extreme'

export type ConsequenceSeverity = 2 | 4 | 6 | 8

export type SkillLevel = number

export type AppDataVersion = '1.0' | '1.1'

export type CharacterType = 'sc' | 'nsc'

// ============================================================
// Interfaces
// ============================================================

export interface SkillEntry {
  skill: string
  level: SkillLevel
}

export interface Stunt {
  name: string
  description: string
}

export interface StressBox {
  value: number // 1, 2, 3, or 4
  checked: boolean
}

export interface Consequence {
  severity: ConsequenceSeverity // 2=Leicht, 4=Mittel, 6=Schwer, 8=Extrem
  label: ConsequenceLabel
  value: string
}

export interface Character {
  id: string
  type?: CharacterType
  name: string
  description: string
  highConcept: string
  trouble: string
  aspects: string[] // up to 3 additional aspects beyond highConcept + trouble
  skills: SkillEntry[]
  stunts: Stunt[]
  extras: string
  refresh: number
  fatePoints: number
  stressPhysical: StressBox[]
  stressMental: StressBox[]
  consequences: Consequence[]
  notes: string
  pyramidMaxLevel?: number
  pyramidMaxCols?: number
  color?: string
}

export interface Milestone {
  id: string
  type: MilestoneType
  description: string
}

export interface Campaign {
  id: string
  name: string
  description: string
  status: CampaignStatus
  notes: string
  color?: string
  milestones?: Milestone[]
}

export interface CampaignCharacterAssignment {
  campaignId: string
  characterId: string
}

export interface AppData {
  formatVersion: AppDataVersion
  exportDate: string
  campaigns: Campaign[]
  characters: Character[]
  campaignCharacterAssignments: CampaignCharacterAssignment[]
  skills?: string[] // optional für Rückwärtskompatibilität mit v1.0
}

export interface SkillInfo {
  description: string
  actions: { name: string; note?: string }[]
}

export interface CharacterColor {
  id: string
  label: string
  primary: string
  dark: string
  light: string
}

// ============================================================
// Constants
// ============================================================

export const CHARACTER_COLORS: CharacterColor[] = [
  { id: 'pfau',        label: 'Pfau',        primary: '#1c9ed6', dark: '#1480b0', light: '#e8f4fb' },
  { id: 'heidelbeere', label: 'Heidelbeere', primary: '#3F51B5', dark: '#2C3E8C', light: '#E8EAF6' },
  { id: 'lavendel',    label: 'Lavendel',    primary: '#7986CB', dark: '#5C6BC0', light: '#EDE7F6' },
  { id: 'weintraube',  label: 'Weintraube',  primary: '#8E24AA', dark: '#6A1B7A', light: '#F3E5F5' },
  { id: 'tomate',      label: 'Tomate',      primary: '#D50000', dark: '#B71C1C', light: '#FDECEA' },
  { id: 'flamingo',    label: 'Flamingo',    primary: '#E67C73', dark: '#C0392B', light: '#FCE8E6' },
  { id: 'mandarine',   label: 'Mandarine',   primary: '#E67A17', dark: '#BF6010', light: '#FEF3E2' },
  { id: 'banane',      label: 'Banane',      primary: '#C9A84C', dark: '#A07830', light: '#FEF9E3' },
  { id: 'salbei',      label: 'Salbei',      primary: '#57A05C', dark: '#3D7A41', light: '#EAF5EA' },
  { id: 'basilikum',   label: 'Basilikum',   primary: '#0B8043', dark: '#076030', light: '#E6F4EC' },
]

export const SKILL_LEVEL_LABELS: Record<number, string> = {
  1: 'Durchschnittlich',
  2: 'Ordentlich',
  3: 'Gut',
  4: 'Großartig',
  5: 'Hervorragend',
  6: 'Fantastisch',
  7: 'Episch',
  8: 'Legendär',
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
]
