// main.js

const i18n = {
  translations: {},
  currentLang: 'en',

  // strict detection: /en or /uk
  detectLanguage() {
    const seg = (window.location.pathname.split('/')[1] || '').toLowerCase();
    if (seg === 'uk') return 'uk';
    return 'en';
  },

  // Build a correct URL for locales for BOTH:
  // - localhost:1234/en, localhost:1234/uk
  // - deployments with subfolders (public-url ./)
  // We assume locales folder is at site root OR alongside your dist root.
  getLocalesUrl(langFile) {
    // Example:
    // current page: http://localhost:1234/en
    // want:        http://localhost:1234/locales/en.json
    //
    // Using origin + /locales works on localhost/domain root hosting.
    // But for relative hosting (e.g. GitHub Pages /myrepo/),
    // you can swap to a relative base (see comment below).
    const { origin } = window.location;
    return `${origin}/locales/${langFile}.json`;
  },

  async loadTranslations(lang) {
    const langFile = lang === 'uk' ? 'uk' : 'en';

    try {
      const url = this.getLocalesUrl(langFile);
      const response = await fetch(url, { cache: 'no-cache' });

      if (!response.ok) {
        throw new Error(`Failed to load ${url} (${response.status})`);
      }

      this.translations = await response.json();
      this.currentLang = lang;
      return this.translations;
    } catch (error) {
      console.error('Error loading translations:', error);
      this.translations = {};
      return {};
    }
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
