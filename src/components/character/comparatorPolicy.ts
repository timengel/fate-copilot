export type CompareFieldPolicy<T> = {
  mode: 'compare';
  equals: (left: T, right: T) => boolean;
};

export type IgnoreFieldPolicy = {
  mode: 'ignore';
  reason: string;
};

export type FieldPolicy<T> = CompareFieldPolicy<T> | IgnoreFieldPolicy;

export type FieldPolicyMap<T extends object> = {
  [K in keyof T]-?: FieldPolicy<T[K]>;
};

export function buildComparator<T extends object>(policyMap: FieldPolicyMap<T>) {
  return (left: T, right: T) => {
    for (const key of Object.keys(policyMap) as Array<keyof T>) {
      const policy = policyMap[key];
      if (policy.mode === 'ignore') continue;
      if (!policy.equals(left[key], right[key])) return false;
    }
    return true;
  };
}
