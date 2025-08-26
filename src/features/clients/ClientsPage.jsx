import { useEffect, useState } from "react"
import { load, save } from "../../lib/storage"
import { uid } from "../../lib/uid"

export default function ClientsPage() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ id: null, nome: "", setor: "" })

  useEffect(() => setList(load("clientes", [])), [])
  const persist = (next) => { setList(next); save("clientes", next) }

  const onSubmit = (e) => {
    e.preventDefault()
    if (!form.nome.trim()) return
    if (form.id) {
      persist(list.map(c => c.id === form.id ? { ...c, ...form } : c))
    } else {
      persist([{ id: uid(), nome: form.nome, setor: form.setor }, ...list])
    }
    setForm({ id: null, nome: "", setor: "" })
  }
  const edit = (c) => setForm(c)
  const del = (id) => {
    const next = list.filter(c => c.id !== id)
    persist(next)
  }

  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-2xl">Clientes</h1>
      <form onSubmit={onSubmit} className="grid gap-3 max-w-lg">
        <input className="border p-2 rounded" placeholder="Nome" value={form.nome}
               onChange={(e)=>setForm({...form, nome:e.target.value})}/>
        <input className="border p-2 rounded" placeholder="Setor (opcional)" value={form.setor}
               onChange={(e)=>setForm({...form, setor:e.target.value})}/>
        <div className="flex gap-2">
          <button className="border rounded px-3 py-2">{form.id ? "Salvar" : "Adicionar"}</button>
          {form.id && <button type="button" className="border rounded px-3 py-2"
                               onClick={()=>setForm({ id:null, nome:"", setor:"" })}>Cancelar</button>}
        </div>
      </form>

      <div className="grid gap-2">
        {list.length === 0 && <div className="text-sm text-gray-600">Sem clientes ainda.</div>}
        {list.map(c => (
          <div key={c.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{c.nome}</div>
              {c.setor && <div className="text-sm text-gray-600">{c.setor}</div>}
              {/* Aqui você pode listar as landingpages do cliente, se existirem */}
              {Array.isArray(c.landingpages) && c.landingpages.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-semibold mb-1">Landing Pages:</div>
                  <ul className="list-disc ml-5">
                    {c.landingpages.map(lp => (
                      <li key={lp.id} className="flex items-center justify-between">
                        <span>{lp.nome}</span>
                        <button
                          className="ml-2 border rounded px-2 py-1 text-xs"
                          onClick={() => {
                            // Remove apenas a landingpage selecionada deste cliente
                            const nextList = list.map(client =>
                              client.id === c.id
                                ? { ...client, landingpages: client.landingpages.filter(l => l.id !== lp.id) }
                                : client
                            );
                            persist(nextList);
                          }}
                        >
                          Remover Landingpage
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button className="border rounded px-3 py-1" onClick={()=>edit(c)}>Editar</button>
              <button className="border rounded px-3 py-1" onClick={()=>del(c.id)}>Excluir Cliente</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
