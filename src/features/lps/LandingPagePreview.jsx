/*
  Componente de pré-visualização da landing page.
  Busca a LP pelo ID na URL e exibe usando o TemplateRenderer.
*/

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { Repo } from '../../lib/repo';
import TemplateRenderer from './TemplateRenderer';
import PublicImageSaver from './PublicImageSaver';

export default function LandingPagePreview() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [lp, setLp] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Usar ref para garantir que não haja problemas de closure
  const currentIdRef = useRef(null);
  const searchAttemptsRef = useRef(0);
  const componentMountedRef = useRef(false);

  // Gerar uma chave única para o componente baseada no ID
  const componentKey = useMemo(() => `preview-${id}-${Date.now()}`, [id]);

  // Função de busca completamente isolada
  const findLandingPage = useCallback((targetId) => {
    // Verificar se já estamos buscando este ID
    if (currentIdRef.current === targetId) {
      return null;
    }

    currentIdRef.current = targetId;
    searchAttemptsRef.current++;

    /* 
      O trecho seguinte existe pois estava tendo problemas de cache com o Repo
      Assim, fazemos a busca diretamente no localStorage
      Evitando efeitos de deleção em cascata ou problemas de cache
    */
    try {
      // Busca direta no localStorage para evitar cache
      const rawData = localStorage.getItem('plp:lps');

      if (!rawData) {
        return { error: 'Nenhuma landing page encontrada no sistema' };
      }

      const allLps = JSON.parse(rawData);

      // Busca pela landing page específica
      const foundLp = allLps.find((x) => String(x.id) === String(targetId));

      if (!foundLp) {
        return {
          error: `Landing page não encontrada para ID: ${targetId}`,
          availableIds: allLps.map((lp) => lp.id),
        };
      }

      // Validação rigorosa do ID
      if (String(foundLp.id) !== String(targetId)) {
        return {
          error: 'Erro de correspondência de ID',
          details: {
            expected: targetId,
            found: foundLp.id,
            expectedType: typeof targetId,
            foundType: typeof foundLp.id,
          },
        };
      }

      return { lp: foundLp };
    } catch (error) {
      return { error: `Erro ao carregar dados: ${error.message}` };
    }
  }, []);

  // Efeito de montagem do componente
  useEffect(() => {
    componentMountedRef.current = true;
    return () => {
      componentMountedRef.current = false;
    };
  }, [componentKey]);

  // Efeito principal para buscar a landing page
  useEffect(() => {
    if (!componentMountedRef.current) {
      return;
    }

    const targetId = String(id);

    // Reset completo do estado
    setLp(null);
    setError(null);
    setLoading(true);

    // Pequeno delay para garantir que o estado anterior foi limpo
    const timer = setTimeout(() => {
      // Verificar se o componente ainda está montado
      if (!componentMountedRef.current) {
        return;
      }

      // Busca a landing page
      const result = findLandingPage(targetId);

      if (result && result.error) {
        setError(result.error);
      } else if (result && result.lp) {
        setLp(result.lp);
      } else {
        setError('Erro inesperado na busca');
      }

      setLoading(false);
    }, 100);

    return () => {
      clearTimeout(timer);
      currentIdRef.current = null;
    };
  }, [id, findLandingPage, componentKey, state?.lpId]);

  // Verificação de segurança: se o ID mudou mas a LP não corresponde, redirecionar
  useEffect(() => {
    if (lp && String(lp.id) !== String(id)) {
      navigate(`/preview/${lp.id}`, { replace: true });
    }
  }, [lp, id, navigate]);

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 mb-4">{error}</div>
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
    <div key={componentKey}>
      <div className="p-3 text-center border-b">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
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
