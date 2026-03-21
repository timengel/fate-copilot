import { describe, it, expect } from 'vitest';
import { reactive } from 'vue';
import { deepClone } from './deepClone';

describe('deepClone', () => {
  it('returns primitives unchanged', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
    expect(deepClone(true)).toBe(true);
    expect(deepClone(null)).toBe(null);
    expect(deepClone(undefined)).toBe(undefined);
  });

  it('deep-clones a plain object (no shared reference)', () => {
    const original = { name: 'Alice', refresh: 3 };
    const result = deepClone(original);
    expect(result).toEqual(original);
    expect(result).not.toBe(original);
  });

  it('deep-clones nested objects', () => {
    const original = { a: { b: { c: 42 } } };
    const result = deepClone(original);
    expect(result).toEqual(original);
    expect(result.a).not.toBe(original.a);
    expect(result.a.b).not.toBe(original.a.b);
  });

  it('deep-clones arrays (new array, cloned items)', () => {
    const original = [{ skill: 'Athletik', level: 2 }, { skill: 'Kämpfen', level: 3 }];
    const result = deepClone(original);
    expect(result).toEqual(original);
    expect(result).not.toBe(original);
    expect(result[0]).not.toBe(original[0]);
  });

  it('strips a top-level Vue reactive proxy', () => {
    const plain = { name: 'Alice', fatePoints: 3 };
    const proxy = reactive(plain);
    const result = deepClone(proxy);
    expect(result).toEqual(plain);
    // result must not be a proxy — structuredClone must not throw
    expect(() => structuredClone(result)).not.toThrow();
  });

  it('strips nested Vue reactive proxies', () => {
    const form = reactive({
      name: 'Bob',
      skills: [{ skill: 'Wille', level: 1 }],
    });
    // Simulate what SkillPyramid does: spread a reactive array, creating a new array
    // whose items are still Vue Proxy objects from the reactive form
    const reactiveSkills = form.skills;
    form.skills = [...reactiveSkills];

    const result = deepClone(form);
    expect(result.skills[0]).toEqual({ skill: 'Wille', level: 1 });
    expect(() => structuredClone(result)).not.toThrow();
  });

  it('strips proxies inside arrays', () => {
    const inner = reactive({ value: 99 });
    const arr = [inner, inner];
    const result = deepClone(arr);
    expect(result[0]).toEqual({ value: 99 });
    expect(result[1]).toEqual({ value: 99 });
    expect(() => structuredClone(result)).not.toThrow();
  });

  // ─── Regression: the DataCloneError scenario ───────────────────────────────
  // When SkillPyramid emits a filtered array of reactive SkillEntry objects,
  // CharacterSheet assigns form.skills = $event. Those items are Vue Proxies.
  // structuredClone(toRaw(form)) would throw; deepClone(form) must not.

  it('handles the full form-save scenario without throwing', () => {
    const form = reactive({
      name: 'Hero',
      skills: [
        { skill: 'Athletik', level: 3 },
        { skill: 'Kämpfen', level: 2 },
      ],
      stunts: [{ name: 'Sprint', description: 'Fast' }],
      consequences: [{ severity: 2, label: 'mild', value: '' }],
    });

    // Simulate SkillPyramid emitting a reactive-proxied array
    const emitted = form.skills.filter((s) => s.skill !== 'Kämpfen');
    form.skills = emitted; // items are still reactive proxies

    const saved = deepClone(form);
    expect(saved.skills).toHaveLength(1);
    expect(saved.skills[0]).toEqual({ skill: 'Athletik', level: 3 });
    expect(() => structuredClone(saved)).not.toThrow();
  });
});
