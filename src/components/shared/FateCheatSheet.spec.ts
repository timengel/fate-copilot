import { fireEvent, render, screen, within } from '@testing-library/vue';
import { describe, it, expect } from 'vitest';
import FateCheatSheet from './FateCheatSheet.vue';
import { CHECK_LADDER } from '../../types';

describe('FateCheatSheet', () => {
  it('renders sections and cards', () => {
    render(FateCheatSheet);

    expect(screen.getByRole('heading', { level: 2, name: '4 Aktionen' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Challenges' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Wettstreite' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Meilensteine' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Szenen-Setup-Checkliste' })).toBeTruthy();
    expect(screen.queryByRole('heading', { level: 2, name: 'Aspektarten' })).toBeNull();
    expect(screen.queryByRole('heading', { level: 2, name: 'Chances' })).toBeNull();
    expect(screen.queryByRole('heading', { level: 2, name: 'Konflikt' })).toBeNull();

    expect(screen.getByText('Was steht auf dem Spiel?')).toBeTruthy();
    expect(screen.getByText('Welche 2-3 Situationsaspekte gibt es?')).toBeTruthy();
    expect(screen.getByText('Wie sind die Zonen aufgeteilt?')).toBeTruthy();
    expect(screen.getByText('Wer steht wem gegenüber?')).toBeTruthy();
    expect(
      screen.getByText('Ist das ein Konflikt, eine Herausforderung oder nur ein einzelner Wurf?'),
    ).toBeTruthy();
  });

  it('hides GM-only cards in basic variant', () => {
    render(FateCheatSheet, {
      props: {
        variant: 'basic',
      },
    });

    expect(screen.getByRole('heading', { level: 2, name: '4 Aktionen' })).toBeTruthy();
    expect(screen.queryByRole('heading', { level: 2, name: 'Challenges' })).toBeNull();
    expect(screen.queryByRole('heading', { level: 2, name: 'Wettstreite' })).toBeNull();
    expect(screen.queryByRole('heading', { level: 2, name: 'Meilensteine' })).toBeNull();
    expect(screen.queryByRole('heading', { level: 2, name: 'Szenen-Setup-Checkliste' })).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: 'Aspektarten' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Niederlage einräumen' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Konsequenzen' })).toBeTruthy();
    expect(screen.getByText('Spielaspekte: Permanent.')).toBeTruthy();
    expect(screen.getByText('Charakteraspekte: Permanent.')).toBeTruthy();
    expect(
      screen.getByText('Situationsaspekte: Halten an bis Ende der Szene oder bis irrelevant.'),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Boosts: Halten an bis Ende der Szene, bis irrelevant oder bis einmal genutzt.',
      ),
    ).toBeTruthy();
    expect(screen.getByText('Konsequenzen: Halten an, bis sie erholt wurden.')).toBeTruthy();
    expect(
      screen.getByText('Vor Wurf: Gegner bekommt, was er will, er siegt, Du überlebst aber.'),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Du bekommst 1 FP, plus 1 weiteren pro Konsequenz, die Du erlitten hattest.',
      ),
    ).toBeTruthy();
    expect(
      screen.getByText('Mild (+2), Moderat (+4), Schwer (+6) reduzieren die Shifts eines Treffers.'),
    ).toBeTruthy();
    expect(screen.getByText('Der Gegner erhält auf jede neue Konsequenz 1 freien Invoke.')).toBeTruthy();

    expect(screen.getByRole('table', { name: 'Stufenleiter für Proben' })).toBeTruthy();
    expect(screen.getByRole('table', { name: 'Wahrscheinlichkeiten für 4dF' })).toBeTruthy();
  });

  it('renders ladder rows and concise chances table', () => {
    render(FateCheatSheet);

    const ladderTable = screen.getByRole('table', { name: 'Stufenleiter für Proben' });
    expect(within(ladderTable).getByRole('columnheader', { name: 'Wert' })).toBeTruthy();
    expect(within(ladderTable).getByRole('columnheader', { name: 'Bezeichnung' })).toBeTruthy();

    for (const entry of CHECK_LADDER) {
      expect(within(ladderTable).getByText(entry.value)).toBeTruthy();
      expect(within(ladderTable).getByText(entry.label)).toBeTruthy();
    }

    const chancesTable = screen.getByRole('table', { name: 'Wahrscheinlichkeiten für 4dF' });
    expect(within(chancesTable).getByRole('columnheader', { name: 'Wurf' })).toBeTruthy();
    expect(within(chancesTable).getByRole('columnheader', { name: 'Chance' })).toBeTruthy();
    expect(within(chancesTable).getByRole('cell', { name: '0' })).toBeTruthy();
    expect(within(chancesTable).getByRole('cell', { name: '+/-1' })).toBeTruthy();
    expect(within(chancesTable).getByRole('cell', { name: '+/-2' })).toBeTruthy();
    expect(within(chancesTable).getByRole('cell', { name: '+/-3' })).toBeTruthy();
    expect(within(chancesTable).getByRole('cell', { name: '+/-4' })).toBeTruthy();
    expect(within(chancesTable).queryByText('-1')).toBeNull();
    expect(within(chancesTable).queryByText('-2')).toBeNull();
    expect(within(chancesTable).queryByText('-3')).toBeNull();
    expect(within(chancesTable).queryByText('-4')).toBeNull();
  });

  it('supports action accordion toggling', async () => {
    render(FateCheatSheet);

    expect(screen.getByRole('rowheader', { name: 'Überwinden' })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'Vorteil verschaffen' })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'Angriff' })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'Verteidigung' })).toBeTruthy();

    const overcomeButton = screen.getByRole('button', { name: /Überwinden/i });
    const defenseButton = screen.getByRole('button', { name: /Verteidigung/i });

    expect(overcomeButton.getAttribute('aria-expanded')).toBe('true');
    expect(defenseButton.getAttribute('aria-expanded')).toBe('false');

    await fireEvent.click(overcomeButton);
    expect(overcomeButton.getAttribute('aria-expanded')).toBe('false');

    await fireEvent.click(defenseButton);
    expect(defenseButton.getAttribute('aria-expanded')).toBe('true');
    expect(overcomeButton.getAttribute('aria-expanded')).toBe('false');
  });
});
