/*
  Funções para landing pages (LPs).
*/

import { load } from '../../lib/storage';
export function findLpBySlug(slug) {
  const lps = load('lps', []);
  return lps.find((x) => x.slug === slug) ?? null;
}
export function makeSlug(title, id) {
  const base = (title || 'lp')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${id.slice(0, 6)}`;
}
