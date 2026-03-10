import { CHARACTER_COLORS } from '../types'

export function getColorVars(colorId?: string) {
  const c = CHARACTER_COLORS.find(c => c.id === colorId) ?? CHARACTER_COLORS[0]!
  return { '--fate-blue': c.primary, '--fate-blue-dark': c.dark, '--fate-blue-light': c.light }
}
