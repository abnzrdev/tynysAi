import 'server-only';

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  ru: () => import('./dictionaries/ru.json').then((module) => module.default),
  kz: () => import('./dictionaries/kz.json').then((module) => module.default),
};

export const getDictionary = async (locale: keyof typeof dictionaries) => {
  return dictionaries[locale]();
};

