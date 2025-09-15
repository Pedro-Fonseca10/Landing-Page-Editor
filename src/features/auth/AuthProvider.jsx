/*
  Gerencia o estado do usuário e fornece funções de login, registro e logout.
*/

import { useState } from "react"  


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const login = (email, password) => {
    if (email === "Pedro" && password === "123") setUser({ email, role: "admin" })
    else if (email === "membro" && password === "123") setUser({ email, role: "member" })
    else throw new Error("Credenciais inválidas")
  }
  const register = (email, password) => {
    // Registro simplificado: cria usuário com role "customer"
    if (!email || !password) throw new Error("Preencha e-mail e senha")
    setUser({ email, role: "customer" })
  }
  const logout = () => setUser(null)
  return <AuthCtx.Provider value={{ user, login, register, logout }}>{children}</AuthCtx.Provider>
}
