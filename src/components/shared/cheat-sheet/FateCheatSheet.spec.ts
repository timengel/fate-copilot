import { fireEvent, render, screen, within } from '@testing-library/vue';
import { describe, it, expect } from 'vitest';
import FateCheatSheet from './FateCheatSheet.vue';
import { CHECK_LADDER } from '@fate/types';

describe('FateCheatSheet', () => {
  it('shows consequences card content only in basic variant', async () => {
    const { rerender } = render(FateCheatSheet, { props: { variant: 'gm' } });

    expect(screen.queryByText(/bleibende Aspekte/i)).toBeNull();

    await rerender({ variant: 'basic' });

    const consequencesCard = screen
      .getByRole('heading', { level: 2, name: 'Konsequenzen' })
      .closest('article');
    expect(consequencesCard?.textContent).toContain('bleibende Aspekte');
    expect(consequencesCard?.textContent).toContain('Leicht: 1 Szene');
    expect(consequencesCard?.textContent).toContain('Mittel: 1 Sitzung');
    expect(consequencesCard?.textContent).toContain('Schwer: 1 Szenario');
  });

  it('renders ladder and chance data tables from their configured datasets', () => {
    render(FateCheatSheet, { props: { variant: 'gm' } });

    const ladderTable = screen.getByRole('table', { name: 'Stufenleiter für Proben' });
    const ladderRows = within(ladderTable).getAllByRole('row');
    expect(ladderRows).toHaveLength(CHECK_LADDER.length + 1);

    const chancesTable = screen.getByRole('table', { name: 'Wahrscheinlichkeiten für 4dF' });
    const chanceRows = within(chancesTable).getAllByRole('row');
    expect(chanceRows).toHaveLength(6);
  });

  it('supports action accordion state transitions', async () => {
    render(FateCheatSheet);

    const overcomeButton = screen.getByRole('button', { name: /Überwinden/i });
    const defenseButton = screen.getByRole('button', { name: /Verteidigung/i });

    const expandedButtonsBefore = screen
      .getAllByRole('button')
      .filter((button) => button.getAttribute('aria-expanded') === 'true');
    expect(expandedButtonsBefore).toHaveLength(1);

    await fireEvent.click(overcomeButton);
    expect(overcomeButton.getAttribute('aria-expanded')).toBe('false');

    await fireEvent.click(defenseButton);
    const expandedButtonsAfter = screen
      .getAllByRole('button')
      .filter((button) => button.getAttribute('aria-expanded') === 'true');
    expect(expandedButtonsAfter).toHaveLength(1);
    expect(defenseButton.getAttribute('aria-expanded')).toBe('true');
    expect(overcomeButton.getAttribute('aria-expanded')).toBe('false');
  });
});
