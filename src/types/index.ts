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

export type ButtonSize = 'sm' | 'md'

// ============================================================
// Domain Types
// ============================================================

export type CampaignStatus = 'active' | 'inactive' | 'completed'

export type MilestoneType = 'small' | 'significant' | 'major'

export type ConsequenceLabel = 'mild' | 'moderate' | 'severe' | 'extreme'

export type ConsequenceSeverity = 2 | 4 | 6 | 8

export type SkillLevel = 1 | 2 | 3 | 4 | 5

export type AppDataVersion = '1.0' | '1.1'

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

// ============================================================
// Constants
// ============================================================

export const SKILL_LEVEL_LABELS: Record<number, string> = {
  1: 'Durchschnittlich',
  2: 'Ordentlich',
  3: 'Gut',
  4: 'Großartig',
  5: 'Hervorragend',
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
