/*
  Componente responsável por renderizar as diferentes templates
*/

import { useEffect } from 'react';
import { logEvent } from '../analytics/analytics';
import SaaSTemplate from '../templates/saas/SaaSTemplate';
import EventoTemplate from '../templates/evento/EventoTemplate';
import D2CTemplate from '../templates/d2c/D2CTemplate';
import WaitlistTemplate from '../templates/waitlist/WaitlistTemplate';
import SignupButton from './SignupButton';

export default function TemplateRenderer({ lp, showSignupButton = true }) {
  useEffect(() => {
    if (lp?.id) logEvent('page_view', { lp_id: lp.id });
  }, [lp?.id]);
  if (!lp) return null;

  const signup =
    showSignupButton && lp?.id && lp?.slug ? (
      <SignupButton
        lpId={lp.id}
        lpSlug={lp.slug}
        clientId={lp.cliente_id}
      />
    ) : null;

  switch (lp.id_template) {
    case 'saas':
      return (
        <>
          <SaaSTemplate lp={lp} />
          {signup}
        </>
      );
    case 'evento':
      return (
        <>
          <EventoTemplate lp={lp} />
          {signup}
        </>
      );
    case 'd2c':
      return (
        <>
          <D2CTemplate lp={lp} />
          {signup}
        </>
      );
    case 'waitlist':
      return (
        <>
          <WaitlistTemplate lp={lp} />
          {signup}
        </>
      );
    default: {
      const c = lp.content || {};
      return (
        <div className="min-h-screen bg-white">
          <header className="p-6" style={{ background: c.theme || '#0ea5e9' }}>
            <div className="max-w-5xl mx-auto text-white">
              <h1 className="text-3xl font-semibold">
                {c.headline || 'Título'}
              </h1>
              <p className="opacity-90">{c.subhead || ''}</p>
            </div>
          </header>
          <main className="max-w-5xl mx-auto p-6 grid gap-6">
            {c.heroUrl && (
              <img
                src={c.heroUrl}
                alt=""
                className="w-full rounded-xl border"
              />
            )}
            <p className="text-lg">{c.body}</p>
            <a
              href={c.ctaHref || '#'}
              className="inline-block px-4 py-3 rounded-lg border"
              style={{
                borderColor: c.theme || '#0ea5e9',
                color: c.theme || '#0ea5e9',
              }}
            >
              {c.ctaText || 'Saiba mais'}
            </a>
          </main>
          <footer className="max-w-5xl mx-auto p-6 text-sm text-gray-500">
            © {new Date().getFullYear()}
          </footer>
          {signup}
        </div>
      );
    }
  }
}
