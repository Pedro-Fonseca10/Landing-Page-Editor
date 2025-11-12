import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TemplateRenderer from './TemplateRenderer';
import { fetchLandingPageBySlug } from './lpsService';
import { findLpBySlug } from './public';

export default function PublicPage() {
  const { slug } = useParams();
  const [lp, setLp] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!slug) {
        setLp(null);
        setError('Slug inválido.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const data = await fetchLandingPageBySlug(slug);
        if (!active) return;
        if (data) {
          setLp(data);
        } else {
          const fallback = findLpBySlug(slug);
          if (fallback) {
            setLp(fallback);
          } else {
            setLp(null);
            setError('Página não encontrada.');
          }
        }
      } catch (err) {
        if (!active) return;
        const fallback = findLpBySlug(slug);
        if (fallback) {
          setLp(fallback);
        } else {
          setLp(null);
          setError(err?.message || 'Página não encontrada.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) return <div className="p-6">Carregando...</div>;
  if (!lp) return <div className="p-6">{error || 'Página não encontrada.'}</div>;
  return <TemplateRenderer lp={lp} />;
}
