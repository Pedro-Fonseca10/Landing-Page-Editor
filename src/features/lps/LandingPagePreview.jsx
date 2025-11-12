/*
  Componente de pré-visualização da landing page.
  Busca a LP pelo ID na URL e exibe usando o TemplateRenderer.
*/

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import TemplateRenderer from './TemplateRenderer';
import PublicImageSaver from './PublicImageSaver';
import { fetchLandingPage } from './lpsService';

export default function LandingPagePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lp, setLp] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchLandingPage(id);
        if (!active) return;
        if (!data) {
          setError('Landing page não encontrada.');
          setLp(null);
        } else {
          setLp(data);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || 'Falha ao carregar a landing page.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-4 text-red-600">{error}</div>
        <div className="mb-4">
          <strong>ID solicitado:</strong> {id}
        </div>
        <Link className="border rounded px-3 py-2" to="/lps">
          Voltar para Landing Pages
        </Link>
      </div>
    );
  }

  if (!lp) {
    return <div className="p-6">Nenhuma landing page encontrada.</div>;
  }

  return (
    <div>
      <div className="border-b p-3 text-center">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span>Pré-visualização: {lp.titulo}</span>
          <div className="flex gap-2">
            <button
              className="border rounded px-3 py-1"
              onClick={() => navigate('/lps')}
              type="button"
            >
              Voltar
            </button>
            <Link
              className="border rounded px-3 py-1"
              to={`/lps/${lp.id}/edit`}
            >
              Editar
            </Link>
            <PublicImageSaver lp={lp} />
          </div>
        </div>
      </div>
      <TemplateRenderer lp={lp} />
    </div>
  );
}
