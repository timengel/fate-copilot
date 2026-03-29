import type { Character, Item, StressBox, StressTrack } from '../types';

export const PHYSICAL_STRESS_LABEL = 'KÖRPERLICHER STRESS (KRAFT)';
export const MENTAL_STRESS_LABEL = 'GEISTIGER STRESS (WILLE)';

function cloneBoxes(boxes: StressBox[] = []): StressBox[] {
  return boxes.map((box) => ({ ...box }));
}

function cloneTracks(tracks: StressTrack[] = []): StressTrack[] {
  return tracks.map((track) => ({
    label: track.label,
    boxes: cloneBoxes(track.boxes),
  }));
}

function tracksFromLegacyStress(stressPhysical?: StressBox[], stressMental?: StressBox[]): StressTrack[] {
  const tracks: StressTrack[] = [];

  if ((stressPhysical ?? []).length > 0) {
    tracks.push({ label: PHYSICAL_STRESS_LABEL, boxes: cloneBoxes(stressPhysical) });
  }

  if ((stressMental ?? []).length > 0) {
    tracks.push({ label: MENTAL_STRESS_LABEL, boxes: cloneBoxes(stressMental) });
  }

  return tracks;
}

export function normalizeCharacterStress(character: Character): Character {
  const { stressTracks, stressPhysical, stressMental, ...rest } = character;

  return {
    ...rest,
    stressTracks:
      stressTracks !== undefined
        ? cloneTracks(stressTracks)
        : tracksFromLegacyStress(stressPhysical, stressMental),
  };
}

export function normalizeItemStress(item: Item): Item {
  const { stressTracks, stressPhysical, stressMental, ...rest } = item;

  return {
    ...rest,
    stressTracks:
      stressTracks !== undefined
        ? cloneTracks(stressTracks)
        : tracksFromLegacyStress(stressPhysical, stressMental),
  };
}
