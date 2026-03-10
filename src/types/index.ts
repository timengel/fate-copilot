export interface SkillEntry {
  skill: string
  level: number // 1=Durchschnittlich, 2=Ordentlich, 3=Gut, 4=Großartig, 5=Hervorragend
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
  severity: 2 | 4 | 6 | 8 // 2=Leicht, 4=Mittel, 6=Schwer, 8=Extrem
  label: 'mild' | 'moderate' | 'severe' | 'extreme'
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
  type: 'small' | 'significant' | 'major'
  description: string
}

export interface Campaign {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'completed'
  notes: string
  milestones?: Milestone[]
}

export interface CampaignCharacterAssignment {
  campaignId: string
  characterId: string
}

export interface AppData {
  formatVersion: '1.0' | '1.1'
  exportDate: string
  campaigns: Campaign[]
  characters: Character[]
  campaignCharacterAssignments: CampaignCharacterAssignment[]
  skills?: string[] // optional für Rückwärtskompatibilität mit v1.0
}

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
