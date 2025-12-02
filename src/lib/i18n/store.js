// i18n store for ShamirLab
import { writable, derived } from 'svelte/store';

// Load translations
import enTranslations from './locales/en.json';
import ruTranslations from './locales/ru.json';

const translations = {
  en: enTranslations,
  ru: ruTranslations
};

// Get initial language from localStorage or default to 'en'
function getInitialLanguage() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('shamirlab-language');
    if (saved && ['en', 'ru'].includes(saved)) {
      return saved;
    }
  }
  return 'en';
}

// Create locale store
export const locale = writable(getInitialLanguage());

// Save language preference
locale.subscribe((value) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('shamirlab-language', value);
  }
});

// Simple translation function (for non-reactive use)
export function t(key, currentLang = null) {
  const lang = currentLang || getInitialLanguage();
  const keys = key.split('.');
  let value = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

// Reactive translation store
export const tStore = derived(locale, ($locale) => {
  return (key) => {
    const keys = key.split('.');
    let value = translations[$locale];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };
});

// Available languages
export const languages = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' }
];

