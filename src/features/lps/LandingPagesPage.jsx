import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Repo } from "../../lib/repo"
import { TEMPLATES } from "../templates/catalog"
import { exportLandingPageZip } from "./exporter"
import { generateUniqueId } from "../../lib/uid"

export default function LandingPagesPage() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [list, setList] = useState([])
  const [form, setForm] = useState({ id: null, titulo: "", id_cliente: "", id_template: "saas" })
  const [error, setError] = useState(null)

  const reload = () => {
    const clientesData = Repo.list("clientes")
    const lpsData = Repo.list("lps")
    setClientes(clientesData)
    setList(lpsData)
  }
  useEffect(() => { reload() }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    setError(null)
    
    if (!form.titulo.trim()) {
      setError("Por favor, insira um título para a landing page")
      return
    }
    
    if (!form.id_cliente) {
      setError("Por favor, selecione um cliente")
      return
    }

    if (form.id) {
      // Editando landing page existente
      Repo.update("lps", form.id, form)
    } else {
      // Criando nova landing page com ID garantidamente único
      const existingIds = list.map(lp => lp.id)
      const newId = generateUniqueId(existingIds)
      const novaLP = { ...form, id: newId, content: undefined }
      Repo.add("lps", novaLP)
    }
    
    setForm({ id: null, titulo: "", id_cliente: "", id_template: "saas" })
    reload()
  }

  const delOne = (lpId) => { 
    Repo.remove("lps", lpId)
    reload()
  }

  const clientesById = useMemo(
    () => Object.fromEntries(clientes.map(c => [String(c.id), c])),
    [clientes]
  )
  const templateName = (id) => TEMPLATES.find(t => t.id === id)?.nome ?? id

  return (
    <div className="p-6 grid gap-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl">Landing Pages</h1>
        <button className="border rounded px-3 py-1" onClick={() => navigate(-1)} type="button">Voltar</button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid gap-3 max-w-lg">
        <input className="border p-2 rounded" placeholder="Título da página"
               value={form.titulo} onChange={(e)=>setForm({ ...form, titulo: e.target.value })}/>
        <select className="border p-2 rounded" value={form.id_cliente}
                onChange={(e)=>setForm({ ...form, id_cliente: e.target.value })}>
          <option value="">Vincular a cliente…</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <select className="border p-2 rounded" value={form.id_template}
                onChange={(e)=>setForm({ ...form, id_template: e.target.value })}>
          {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
        <div className="flex gap-2">
          <button className="border rounded px-3 py-2">{form.id ? "Salvar" : "Adicionar"}</button>
          {form.id && (
            <button type="button" className="border rounded px-3 py-2"
                    onClick={()=>setForm({ id:null, titulo:"", id_cliente:"", id_template:"saas" })}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="grid gap-2">
        {list.length === 0 && <div className="text-sm text-gray-600">Sem landing pages ainda.</div>}
        {list.map(lp => (
          <div key={lp.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{lp.titulo}</div>
              <div className="text-sm text-gray-600">
                Cliente: {clientesById[String(lp.id_cliente)]?.nome ?? "—"} · Template: {templateName(lp.id_template)}
              </div>
              <div className="text-xs text-gray-500">ID: {lp.id}</div>
            </div>
            <div className="flex gap-2">
              <Link className="border rounded px-3 py-1" to={`/lps/${lp.id}/edit`}>Editar</Link>
              <Link className="border rounded px-3 py-1" to={`/preview/${lp.id}`}>Visualizar</Link>
              <button className="border rounded px-3 py-1" onClick={() => exportLandingPageZip(lp)}>Exportar</button>
              <button className="border rounded px-3 py-1" onClick={() => delOne(lp.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
