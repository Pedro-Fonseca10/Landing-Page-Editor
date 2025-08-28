import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { useLocation, useParams, Link, useNavigate } from "react-router-dom"
import { Repo } from "../../lib/repo"
import TemplateRenderer from "./TemplateRenderer"

export default function LandingPagePreview() {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [lp, setLp] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Usar ref para garantir que não haja problemas de closure
  const currentIdRef = useRef(null)
  const searchAttemptsRef = useRef(0)
  const componentMountedRef = useRef(false)

  // Gerar uma chave única para o componente baseada no ID
  const componentKey = useMemo(() => `preview-${id}-${Date.now()}`, [id])

  // Função de busca completamente isolada
  const findLandingPage = useCallback((targetId) => {
    // Verificar se já estamos buscando este ID
    if (currentIdRef.current === targetId) {
      console.log(`Já buscando ID: ${targetId}, ignorando busca duplicada`)
      return null
    }
    
    currentIdRef.current = targetId
    searchAttemptsRef.current++
    
    console.log(`=== BUSCA #${searchAttemptsRef.current} PARA ID: ${targetId} ===`)
    console.log(`Componente montado: ${componentMountedRef.current}`)
    
    try {
      // Busca direta no localStorage para evitar cache
      const rawData = localStorage.getItem('plp:lps')
      console.log("Raw localStorage data length:", rawData ? rawData.length : 0)
      
      if (!rawData) {
        console.error("Nenhum dado encontrado no localStorage")
        return { error: "Nenhuma landing page encontrada no sistema" }
      }
      
      const allLps = JSON.parse(rawData)
      console.log(`Total de LPs no storage: ${allLps.length}`)
      console.log("IDs disponíveis:", allLps.map(lp => lp.id))
      
      // Busca pela landing page específica
      const foundLp = allLps.find(x => String(x.id) === String(targetId))
      
      if (!foundLp) {
        console.error(`Landing page não encontrada para ID: ${targetId}`)
        console.error("IDs disponíveis:", allLps.map(lp => lp.id))
        return { 
          error: `Landing page não encontrada para ID: ${targetId}`,
          availableIds: allLps.map(lp => lp.id)
        }
      }
      
      console.log("Landing page encontrada:", {
        id: foundLp.id,
        titulo: foundLp.titulo,
        template: foundLp.id_template,
        cliente: foundLp.id_cliente
      })
      
      // Validação rigorosa do ID
      if (String(foundLp.id) !== String(targetId)) {
        console.error("ERRO CRÍTICO: ID não corresponde!", {
          expected: targetId,
          found: foundLp.id,
          expectedType: typeof targetId,
          foundType: typeof foundLp.id
        })
        return { 
          error: "Erro de correspondência de ID",
          details: {
            expected: targetId,
            found: foundLp.id,
            expectedType: typeof targetId,
            foundType: typeof foundLp.id
          }
        }
      }
      
      return { lp: foundLp }
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      return { error: `Erro ao carregar dados: ${error.message}` }
    }
  }, [])

  // Efeito de montagem do componente
  useEffect(() => {
    componentMountedRef.current = true
    console.log(`=== COMPONENTE MONTADO - KEY: ${componentKey} ===`)
    
    return () => {
      componentMountedRef.current = false
      console.log(`=== COMPONENTE DESMONTADO - KEY: ${componentKey} ===`)
    }
  }, [componentKey])

  // Efeito principal para buscar a landing page
  useEffect(() => {
    if (!componentMountedRef.current) {
      console.log("Componente ainda não montado, aguardando...")
      return
    }
    
    const targetId = String(id)
    console.log(`=== PREVIEW EFFECT TRIGGERED ===`)
    console.log(`ID da URL: ${targetId}`)
    console.log(`State lpId: ${state?.lpId}`)
    console.log(`Current ID ref: ${currentIdRef.current}`)
    console.log(`Component Key: ${componentKey}`)
    
    // Reset completo do estado
    setLp(null)
    setError(null)
    setLoading(true)
    
    // Pequeno delay para garantir que o estado anterior foi limpo
    const timer = setTimeout(() => {
      // Verificar se o componente ainda está montado
      if (!componentMountedRef.current) {
        console.log("Componente foi desmontado durante a busca, cancelando...")
        return
      }
      
      // Busca a landing page
      const result = findLandingPage(targetId)
      
      if (result && result.error) {
        console.error("Erro na busca:", result.error)
        if (result.availableIds) {
          console.error("IDs disponíveis:", result.availableIds)
        }
        if (result.details) {
          console.error("Detalhes do erro:", result.details)
        }
        setError(result.error)
      } else if (result && result.lp) {
        console.log("Landing page encontrada e definida no estado:", {
          id: result.lp.id,
          titulo: result.lp.titulo,
          template: result.lp.id_template
        })
        setLp(result.lp)
      } else {
        console.error("Resultado inesperado da busca:", result)
        setError("Erro inesperado na busca")
      }
      
      setLoading(false)
    }, 100)
    
    return () => {
      clearTimeout(timer)
      currentIdRef.current = null
    }
  }, [id, findLandingPage, componentKey, state?.lpId])

  // Log do estado atual para debug
  useEffect(() => {
    console.log("Estado atual:", { lp: lp?.id, error, loading, componentKey })
  }, [lp, error, loading, componentKey])

  // Verificação de segurança: se o ID mudou mas a LP não corresponde, redirecionar
  useEffect(() => {
    if (lp && String(lp.id) !== String(id)) {
      console.error("INCONSISTÊNCIA DETECTADA: ID da URL não corresponde ao ID da LP!")
      console.error("Redirecionando para a LP correta...")
      navigate(`/preview/${lp.id}`, { replace: true })
    }
  }, [lp, id, navigate])

  if (loading) {
    return <div className="p-6">Carregando...</div>
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 mb-4">{error}</div>
        <div className="mb-4">
          <strong>ID solicitado:</strong> {id}
        </div>
        <Link className="border rounded px-3 py-2" to="/lps">Voltar para Landing Pages</Link>
      </div>
    )
  }

  if (!lp) {
    return <div className="p-6">Nenhuma landing page encontrada.</div>
  }

  return (
    <div key={componentKey}>
      <div className="p-3 text-center border-b">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <span>Pré-visualização: {lp.titulo}</span>
          <div className="flex gap-2">
            <button
              className="border rounded px-3 py-1"
              onClick={() => navigate(-1)}
              type="button"
            >
              Voltar
            </button>
            <Link className="border rounded px-3 py-1" to={`/lps/${lp.id}/edit`}>Editar</Link>
            <Link className="border rounded px-3 py-1" to="/lps">Lista de LPs</Link>
          </div>
        </div>
      </div>
      <TemplateRenderer lp={lp} />
    </div>
  )
}
