/**
 * Phone country options from world-countries.
 * Lazy-loaded to avoid pulling the full list into the initial bundle.
 */

export const DEFAULT_PHONE_COUNTRY = "+82";

export type PhoneCountryOption = {
  value: string;
  label: string;
};

const PREFERRED_FIRST = ["+82", "+1", "+44", "+81", "+61", "+49", "+33", "+86", "+39", "+34"];

let cached: PhoneCountryOption[] | null = null;

/**
 * Loads country options from world-countries (lazy). Cached after first load.
 */
export async function loadPhoneCountryOptions(): Promise<PhoneCountryOption[]> {
  if (cached) return cached;

  const countries = (await import("world-countries")).default as Array<{
    cca2: string;
    name: { common: string };
    idd: { root: string; suffixes: string[] };
  }>;

  const byValue = new Map<string, string>();

  for (const c of countries) {
    const root = (c.idd?.root ?? "").trim();
    const suffixes = c.idd?.suffixes ?? [];
    if (!root) continue;

    const codes =
      suffixes.length > 0
        ? suffixes.map((s) => root + s)
        : [root.startsWith("+") ? root : `+${root}`];

    const labelPart = `${c.cca2}`;
    for (const code of codes) {
      const value = code.startsWith("+") ? code : `+${code}`;
      const existing = byValue.get(value);
      if (!existing) byValue.set(value, labelPart);
      else if (!existing.includes(labelPart)) byValue.set(value, `${existing} / ${labelPart}`);
    }
  }

  const list: PhoneCountryOption[] = Array.from(byValue.entries()).map(([value, cca2s]) => ({
    value,
    label: `${value} (${cca2s})`,
  }));

  list.sort((a, b) => {
    const ai = PREFERRED_FIRST.indexOf(a.value);
    const bi = PREFERRED_FIRST.indexOf(b.value);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.label.localeCompare(b.label);
  });

  cached = list;
  return list;
}
