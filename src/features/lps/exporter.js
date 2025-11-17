/*
  Exporta a landing page exatamente como renderizada no sistema.
  Renderizamos o TemplateRenderer em memória, aplicamos Tailwind compilado
  e empacotamos os assets utilizados no markup final.
*/

import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { renderToString } from 'react-dom/server.browser';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import TemplateRenderer from './TemplateRenderer';
import exportedTailwindCss from './exported-tailwind.txt?raw';


const FORM_HELPER_SCRIPT = `<script>(function(){document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll("form[data-export-form]").forEach(function(form){form.addEventListener("submit",function(ev){ev.preventDefault();form.reset();alert("Formulario enviado! Personalize o envio quando publicar.");});});});})();</script>`;
const FALLBACK_IMAGE_SCRIPT = `<script>(function(){document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll('img[data-remote-src],source[data-remote-src],video[data-remote-src]').forEach(function(el){el.addEventListener('error',function(){if(el.dataset.remoteTried==='1')return;el.dataset.remoteTried='1';var remote=el.getAttribute('data-remote-src');if(remote)el.setAttribute('src',remote);});});});})();</script>`;

export async function exportLandingPageZip(lp) {
  const safeLp = lp || {};
  const { html, css, assets } = buildExportDocument(safeLp);
  const zip = new JSZip();
  const missingAssets = [];

  if (assets.length > 0) {
    const downloads = await Promise.all(
      assets.map(async (asset) => {
        try {
          const response = await fetch(asset.url);
          if (!response.ok) throw new Error(`status ${response.status}`);
          const blob = await response.blob();
          return { ...asset, blob };
        } catch (error) {
          console.warn(`[exporter] Failed to fetch asset ${asset.url}`, error);
          return { ...asset, error };
        }
      }),
    );
    downloads.forEach((asset) => {
      if (asset.blob && !asset.error) {
        zip.file(asset.path, asset.blob);
      } else {
        missingAssets.push(asset);
      }
    });
  }

  if (missingAssets.length > 0) {
    const instructions = [
      'Algumas imagens não puderam ser baixadas automaticamente. Baixe-as manualmente e salve nos caminhos listados abaixo:',
      '',
      ...missingAssets.map(
        (asset, index) =>
          `${index + 1}. ${asset.path} ← ${asset.url}${
            asset.label ? ` (origem: ${asset.label})` : ''
          }`,
      ),
      '',
      'Após mover os arquivos, abra o index.html novamente para validar.',
    ].join('\n');
    zip.file('assets/INSTRUCOES_IMAGENS.txt', instructions);
  }

  zip.file('index.html', html);
  zip.file('styles.css', css);

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, sanitize(`${safeLp.titulo || 'landing-page'}.zip`));
}

export function buildExportDocument(lp = {}) {
  const markup = renderTemplateMarkup(lp);
  const { markup: hydratedMarkup, assets } = rewriteAssetReferences(markup, lp);
  const pageTitle = escapeHtml(lp.titulo || lp.content?.hero?.title || 'Landing Page');
  const metaDescription = escapeHtml(
    plainText(
      lp.content?.hero?.subtitle ||
        lp.content?.subhead ||
        lp.content?.body ||
        lp.content?.description ||
        '',
    ),
  );

  const html = `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${pageTitle}</title>
<meta name="description" content="${metaDescription}" />
<link rel="stylesheet" href="./styles.css" />
</head>
<body>
<div id="root">${hydratedMarkup}</div>
${FORM_HELPER_SCRIPT}
${assets.length ? FALLBACK_IMAGE_SCRIPT : ''}
</body>
</html>`;

  return { html, css: exportedTailwindCss, assets };
}

function renderTemplateMarkup(lp) {
  try {
    const element = createElement(
      MemoryRouter,
      { initialEntries: [`/${lp?.slug || 'export'}`] },
      createElement(TemplateRenderer, {
        lp,
        showSignupButton: false,
      }),
    );
    return renderToString(element);
  } catch (error) {
    console.error('[exporter] Failed to render template', error);
    return `<main class="p-6"><h1>${escapeHtml(lp?.titulo || 'Landing Page')}</h1><p>Nao foi possivel renderizar a página para exportacao.</p></main>`;
  }
}

function rewriteAssetReferences(markup, lp) {
  const doc = document.implementation.createHTMLDocument('export');
  doc.body.innerHTML = markup;
  const assets = [];
  const assetMap = new Map();
  const base = sanitizeFilename(lp?.slug || lp?.titulo || lp?.id || 'lp');

  const register = (url, hint, label = '') => {
    const normalized = normalizeAssetUrl(url);
    if (!normalized) return null;
    if (normalized.startsWith('data:') || normalized.startsWith('blob:')) return null;
    if (assetMap.has(normalized)) return assetMap.get(normalized);

    const extension = guessExtension(normalized);
    const baseName = sanitizeFilename(hint || `asset-${assets.length + 1}`) || `asset-${assets.length + 1}`;
    let filename = extension ? `${baseName}.${extension}` : baseName;
    let path = `assets/${filename}`;
    let attempt = 2;
    while (assets.some((item) => item.path === path)) {
      filename = `${baseName}-${attempt}${extension ? `.${extension}` : ''}`;
      path = `assets/${filename}`;
      attempt += 1;
    }

    const entry = { url: normalized, path, label };
    assets.push(entry);
    assetMap.set(normalized, entry);
    return entry;
  };

  const mediaNodes = doc.querySelectorAll('img, video, source, audio');
  mediaNodes.forEach((node, index) => {
    const src = node.getAttribute('src');
    const hint = `${base || 'lp'}-${node.tagName.toLowerCase()}-${index + 1}`;
    const label = node.getAttribute('alt') || node.getAttribute('aria-label') || node.tagName.toLowerCase();
    const asset = register(src, hint, label);
    if (asset) {
      node.setAttribute('data-remote-src', asset.url);
      node.setAttribute('src', asset.path);
    }
  });

  doc.querySelectorAll('form').forEach((form) => {
    form.setAttribute('data-export-form', 'true');
  });

  return { markup: doc.body.innerHTML, assets };
}

function normalizeAssetUrl(input) {
  if (!isNonEmptyString(input)) return null;
  try {
    const url = new URL(input, window.location.href);
    if (!/^https?:/i.test(url.protocol)) return null;
    return url.href;
  } catch {
    return null;
  }
}

function guessExtension(url) {
  try {
    const clean = String(url || '').split(/[?#]/)[0];
    const lastPart = clean.split('/').pop() || '';
    const dotIndex = lastPart.lastIndexOf('.');
    if (dotIndex === -1) return null;
    const ext = lastPart.slice(dotIndex + 1).toLowerCase();
    return /^[a-z0-9]{2,8}$/.test(ext) ? ext : null;
  } catch {
    return null;
  }
}

function sanitizeFilename(name) {
  const base = String(name || 'asset')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'asset';
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function plainText(input) {
  if (Array.isArray(input)) return input.map(plainText).join(' ');
  return String(input || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(s = '') {
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        m
      ],
  );
}

function sanitize(s = '') {
  return s
    .replace(/[^\p{L}\p{N}\-_. ]/gu, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}
