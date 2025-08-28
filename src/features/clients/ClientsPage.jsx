import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { load, save } from "../../lib/storage"
import { uid } from "../../lib/uid"

export default function ClientsPage() {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [form, setForm] = useState({ id: null, nome: "", setor: "" })
  const [error, setError] = useState(null)

  useEffect(() => setList(load("clientes", [])), [])
  
  const persist = (next) => { 
    setList(next)
    save("clientes", next)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    setError(null)
    
    if (!form.nome.trim()) {
      setError("Por favor, insira um nome para o cliente")
      return
    }
    
    if (form.id) {
      // Editando cliente existente
      const updatedList = list.map(c => c.id === form.id ? { ...c, ...form } : c)
      persist(updatedList)
    } else {
      // Criando novo cliente
      const newId = uid()
      const novoCliente = { id: newId, nome: form.nome, setor: form.setor }
      persist([novoCliente, ...list])
    }
    
    setForm({ id: null, nome: "", setor: "" })
  }
  
  const edit = (c) => {
    setForm(c)
  }
  
  const del = (id) => {
    const next = list.filter(c => c.id !== id)
    persist(next)
  }

  return (
    <div className="p-6 grid gap-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl">Clientes</h1>
        <button className="border rounded px-3 py-1" onClick={() => navigate(-1)} type="button">Voltar</button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
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
              <div className="text-xs text-gray-500">ID: {c.id}</div>
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
