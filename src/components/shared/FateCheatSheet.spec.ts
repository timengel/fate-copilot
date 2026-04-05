import { fireEvent, render, screen, within } from '@testing-library/vue';
import { describe, it, expect } from 'vitest';
import FateCheatSheet from './FateCheatSheet.vue';
import { CHECK_LADDER } from '../../types';

const GM_HEADINGS = ['4 Aktionen', 'Challenges', 'Wettstreite', 'Meilensteine', 'Szenen-Setup-Checkliste'];
const BASIC_HEADINGS = ['4 Aktionen', 'Aspektarten', 'Niederlage einräumen', 'Konsequenzen'];

describe('FateCheatSheet', () => {
  it('renders the gm variant by default and gates cards by variant', () => {
    render(FateCheatSheet, { props: { variant: 'gm' } });

    for (const heading of GM_HEADINGS) {
      expect(screen.getByRole('heading', { level: 2, name: heading })).toBeTruthy();
    }
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(GM_HEADINGS.length);

    for (const heading of BASIC_HEADINGS) {
      if (heading === '4 Aktionen') continue;
      expect(screen.queryByRole('heading', { level: 2, name: heading })).toBeNull();
    }
  });

  it('renders the basic variant and card payload structure', () => {
    render(FateCheatSheet, {
      props: {
        variant: 'basic',
      },
    });

    for (const heading of BASIC_HEADINGS) {
      expect(screen.getByRole('heading', { level: 2, name: heading })).toBeTruthy();
    }
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(BASIC_HEADINGS.length);

    for (const heading of GM_HEADINGS) {
      if (heading === '4 Aktionen') continue;
      expect(screen.queryByRole('heading', { level: 2, name: heading })).toBeNull();
    }

    const aspectCard = screen.getByRole('heading', { level: 2, name: 'Aspektarten' }).closest('article');
    expect(aspectCard).toBeTruthy();
    expect(aspectCard ? within(aspectCard).getAllByRole('listitem') : []).toHaveLength(5);

    const concedeCard = screen.getByRole('heading', { level: 2, name: 'Niederlage einräumen' }).closest('article');
    expect(concedeCard).toBeTruthy();
    expect(concedeCard ? within(concedeCard).getAllByRole('listitem') : []).toHaveLength(2);

    const consequencesCard = screen.getByRole('heading', { level: 2, name: 'Konsequenzen' }).closest('article');
    expect(consequencesCard).toBeTruthy();
    expect(consequencesCard ? within(consequencesCard).getAllByRole('listitem') : []).toHaveLength(4);

    expect(screen.getByRole('table', { name: 'Stufenleiter für Proben' })).toBeTruthy();
    expect(screen.getByRole('table', { name: 'Wahrscheinlichkeiten für 4dF' })).toBeTruthy();
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
