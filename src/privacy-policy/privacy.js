// privacy.js — renders the Privacy & Cookie Policy page.
//
// ALL page text lives in the JSON files below. To change the policy wording,
// edit ONLY these files (no HTML changes needed):
//   src/locales/privacy-en.json  — English
//   src/locales/privacy-uk.json  — Ukrainian

import privacyEn from '../locales/privacy-en.json';
import privacyUk from '../locales/privacy-uk.json';

const POLICIES = {
  en: privacyEn.privacyPolicy,
  uk: privacyUk.privacyPolicy,
};

const SITE_NAME = 'Photon Digital';

// /privacy-policy/uk/ -> uk, /privacy-policy/en/ -> en
function detectLanguage() {
  const segments = window.location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => segment.toLowerCase());

  return segments.includes('uk') ? 'uk' : 'en';
}

// Bare emails / URLs inside the JSON text become real links.
function linkify(root) {
  const pattern = /(https?:\/\/[^\s<>"']*[^\s<>"'.,;:)]|[\w.+-]+@[\w-]+\.[\w.-]*[\w])/g;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.parentElement.closest('a')) {
      nodes.push(node);
    }
  }

  nodes.forEach((node) => {
    const text = node.nodeValue;
    const matches = Array.from(text.matchAll(pattern));
    if (!matches.length) return;

    const fragment = document.createDocumentFragment();
    let cursor = 0;

    matches.forEach((match) => {
      const value = match[0];
      fragment.appendChild(document.createTextNode(text.slice(cursor, match.index)));

      const link = document.createElement('a');
      link.textContent = value;
      if (value.includes('@')) {
        link.href = `mailto:${value}`;
      } else {
        link.href = value;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      fragment.appendChild(link);

      cursor = match.index + value.length;
    });

    fragment.appendChild(document.createTextNode(text.slice(cursor)));
    node.parentNode.replaceChild(fragment, node);
  });
}

// Wide policy tables need to scroll horizontally on mobile.
function makeTablesResponsive(root) {
  root.querySelectorAll('table').forEach((table) => {
    table.classList.add('table', 'table-bordered', 'align-middle');

    const wrapper = document.createElement('div');
    wrapper.className = 'table-responsive';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
}

// Cookiebot renders the live cookie list into <div id="CookieDeclarationContainer">.
function renderCookieDeclaration(root, config) {
  if (!config || !config.declarationScriptSrc) return;

  const container = root.querySelector('#CookieDeclarationContainer');
  if (!container) return;

  const script = document.createElement('script');
  script.id = config.scriptId || 'CookieDeclaration';
  script.src = config.declarationScriptSrc;
  script.async = config.async !== false;
  if (config.culture) {
    script.setAttribute('data-culture', config.culture.toUpperCase());
  }
  container.appendChild(script);
}

function render() {
  const mount = document.getElementById('privacy-content');
  if (!mount) return;

  const lang = detectLanguage();
  const policy = POLICIES[lang] || POLICIES.en;

  document.title = `${SITE_NAME} - ${policy.title}`;
  document.documentElement.lang = policy.language || lang;

  mount.innerHTML = policy.contentHtml;

  linkify(mount);
  makeTablesResponsive(mount);
  renderCookieDeclaration(mount, policy.cookieDeclaration);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', render);
} else {
  render();
}
