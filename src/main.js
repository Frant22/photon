// main.js
//
// Translations are bundled by Parcel at build time (no runtime fetch —
// src/locales is not copied to the build output, so /locales/*.json 404s).

import en from './locales/en.json';
import uk from './locales/uk.json';

const LOCALES = { en, uk };

const i18n = {
  translations: {},
  currentLang: 'en',

  // strict detection: /en, /uk and nested pages like /privacy-policy/uk/
  detectLanguage() {
    const segments = window.location.pathname
      .split('/')
      .filter(Boolean)
      .map((segment) => segment.toLowerCase());

    return segments.includes('uk') ? 'uk' : 'en';
  },

  loadTranslations(lang) {
    this.currentLang = lang === 'uk' ? 'uk' : 'en';
    this.translations = LOCALES[this.currentLang];
    return this.translations;
  },

  getNestedValue(obj, path) {
    return path.split('.').reduce(
      (current, key) => (current && current[key] !== undefined ? current[key] : null),
      obj,
    );
  },

  t(key, fallback = '') {
    return this.getNestedValue(this.translations, key) ?? fallback ?? key;
  },

  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (!key) return;

      const translation = this.t(key, element.textContent);
      element.textContent = translation;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      const key = element.getAttribute('data-i18n-placeholder');
      if (!key) return;

      const translation = this.t(key, element.getAttribute('placeholder') || '');
      element.setAttribute('placeholder', translation);
    });

    document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
      const key = element.getAttribute('data-i18n-alt');
      if (!key) return;

      const translation = this.t(key, element.getAttribute('alt') || '');
      element.setAttribute('alt', translation);
    });

    document.documentElement.lang = this.currentLang === 'uk' ? 'uk' : 'en';
  },

  // Make language switch actually change URL to /en or /uk
  bindLanguageSwitch() {
    document.querySelectorAll('.lang-link[data-lang]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const lang = link.getAttribute('data-lang'); // "en" or "uk"
        if (!lang) return;

        e.preventDefault();

        const target = lang === 'uk' ? '/uk' : '/en';
        if (window.location.pathname === target || window.location.pathname.startsWith(`${target}/`)) {
          return;
        }
        window.location.assign(target);
      });
    });
  },

  updateLanguageLinks() {
    document.querySelectorAll('.lang-link').forEach((link) => {
      const linkLang = link.getAttribute('data-lang'); // "en" or "uk"
      const isActive = (linkLang === 'en' && this.currentLang === 'en')
          || (linkLang === 'uk' && this.currentLang === 'uk');

      link.classList.toggle('active', isActive);
    });
  },

  async init() {
    this.currentLang = this.detectLanguage();
    await this.loadTranslations(this.currentLang);
    this.applyTranslations();
    this.updateLanguageLinks();
    this.bindLanguageSwitch();
  },
};

document.addEventListener('DOMContentLoaded', () => {
  i18n.init();
});
