export type LocaleMap = Record<string, string>;

export function extractPageLocaleMap(
  localeJson: any,
  viewType: string
): LocaleMap {
  const map: LocaleMap = {};

  if (!localeJson?.PageLocale) return map;

  const entry = localeJson.PageLocale.find(
    (e: any) => e.viewType === viewType
  );

  if (!entry || !Array.isArray(entry.properties)) return map;

  // properties is an array with one object
  for (const propObj of entry.properties) {
    for (const [key, value] of Object.entries(propObj)) {
      if (typeof value === "string") {
        map[key] = value;
      }
    }
  }

  return map;
}

export function extractUILocaleMap(
  localeJson: any,
  viewType: string
): LocaleMap {
  const map: LocaleMap = {};

  if (!localeJson?.UILocale) return map;

  const baseLocale = localeJson.UILocale[0];
  for (const [key, value] of Object.entries(baseLocale)) {
      if (typeof value === "string") {
        map[key] = value;
      }
    }

  const entry = localeJson.UILocale.find(
    (e: any) => e.viewType === viewType
  );

  if (!entry || !Array.isArray(entry.properties)) return map;

  // properties is an array with one object
  for (const propObj of entry.properties) {
    for (const [key, value] of Object.entries(propObj)) {
      if (typeof value === "string") {
        map[key] = value;
      }
    }
  }

  return map;
}