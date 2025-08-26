import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { load, save } from "../../lib/storage"
import { uid } from "../../lib/uid"
import { TEMPLATES } from "../templates/catalog"

export default function LandingPagesPage() {
  const [clientes, setClientes] = useState([])
  const [list, setList] = useState([])
  const [form, setForm] = useState({ id: null, titulo: "", id_cliente: "", id_template: "saas" })

  useEffect(() => {
    setClientes(load("clientes", []))
    setList(load("lps", []))
  }, [])

  const persist = (next) => {
    setList(next)
    save("lps", next)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (!form.titulo.trim() || !form.id_cliente) return
    if (form.id) {
      persist(list.map(lp => (lp.id === form.id ? { ...lp, ...form } : lp)))
    } else {
      persist([{ id: uid(), ...form, content: undefined }, ...list])
    }
    setForm({ id: null, titulo: "", id_cliente: "", id_template: "saas" })
  }
  
  const delOne = (lpId) => persist(list.filter(lp => lp.id !== lpId))

  const clientesById = useMemo(
    () => Object.fromEntries(clientes.map(c => [c.id, c])),
    [clientes]
  )
  const templateName = (id) => TEMPLATES.find(t => t.id === id)?.nome ?? id

  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-2xl">Landing Pages</h1>

      <form onSubmit={onSubmit} className="grid gap-3 max-w-lg">
        <input
          className="border p-2 rounded"
          placeholder="Título da página"
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
        />
        <select
          className="border p-2 rounded"
          value={form.id_cliente}
          onChange={(e) => setForm({ ...form, id_cliente: e.target.value })}
        >
          <option value="">Vincular a cliente…</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <select
          className="border p-2 rounded"
          value={form.id_template}
          onChange={(e) => setForm({ ...form, id_template: e.target.value })}
        >
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>{t.nome}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button className="border rounded px-3 py-2">
            {form.id ? "Salvar" : "Adicionar"}
          </button>
          {form.id && (
            <button
              type="button"
              className="border rounded px-3 py-2"
              onClick={() => setForm({ id: null, titulo: "", id_cliente: "", id_template: "saas" })}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="grid gap-2">
        {list.length === 0 && (
          <div className="text-sm text-gray-600">Sem landing pages ainda.</div>
        )}
        {list.map((lp) => (
          <div key={lp.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{lp.titulo}</div>
              <div className="text-sm text-gray-600">
                Cliente: {clientesById[lp.id_cliente]?.nome ?? "—"} · Template: {templateName(lp.id_template)}
              </div>
            </div>
            <div className="flex gap-2">
              <Link className="border rounded px-3 py-1" to={`/lps/${lp.id}/edit`}>Editar</Link>
              <Link className="border rounded px-3 py-1" to={`/preview/${lp.id}`}>Visualizar</Link>
              <button className="border rounded px-3 py-1" onClick={() => delOne(lp.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
