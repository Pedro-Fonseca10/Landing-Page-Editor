import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../features/auth/useAuth"


export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const nav = useNavigate()
  const { login } = useAuth()

  const onSubmit = (e) => {
    e.preventDefault()
    try {
      login(email, password)
      nav("/dashboard")
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm border rounded-xl p-6">
        <h1 className="text-xl mb-4">Entrar</h1>
        <form className="grid gap-3" onSubmit={onSubmit}>
          <input className="border p-2 rounded" placeholder="email@ita.br" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input className="border p-2 rounded" placeholder="senha" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button className="border p-2 rounded">Entrar</button>
          {err && <p className="text-red-600 text-sm">{err}</p>}
        </form>
      </div>
    </div>
  )
}
