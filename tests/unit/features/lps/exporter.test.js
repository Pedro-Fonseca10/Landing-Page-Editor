import { describe, it, expect } from 'vitest';
import { buildExportDocument } from '../../../../src/features/lps/exporter';

describe('buildExportDocument', () => {
  it('renderiza o template SaaS com o mesmo markup do sistema', () => {
    const doc = buildExportDocument({
      id: 'lp-saas',
      cliente_id: 'cli-1',
      id_template: 'saas',
      titulo: 'LP SaaS',
    });
    expect(doc.html).toContain('max-w-5xl'); // classe tailwind original
    expect(doc.html).not.toContain('fixed bottom-5 right-5'); // SignupButton oculto
  });

  it('captura automaticamente os assets presentes no template D2C', () => {
    const doc = buildExportDocument({
      id: 'd2c-1',
      id_template: 'd2c',
      titulo: 'Produto',
    });
    expect(doc.assets.length).toBeGreaterThan(0);
    expect(doc.assets.some((asset) => asset.url.includes('unsplash'))).toBe(true);
  });

  it('escreve atributos data-remote-src para fallback remoto', () => {
    const doc = buildExportDocument({
      id: 'wait-1',
      id_template: 'waitlist',
      titulo: 'Beta fechado',
    });
    expect(doc.html).toContain('data-remote-src');
  });

  it('inclui o CSS compilado do Tailwind no bundle', () => {
    const doc = buildExportDocument({
      id: 'evento-1',
      id_template: 'evento',
      titulo: 'Evento',
    });
    expect(doc.css.length).toBeGreaterThan(1000);
    expect(doc.css).toContain('.flex');
  });
});
