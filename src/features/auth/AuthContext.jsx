import { createContext, useContext, useState } from "react"

const AuthCtx = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const login = (email, password) => {
    if (email === "admin@ita.br" && password === "123456") setUser({ email, role: "admin" })
    else if (email === "membro@ita.br" && password === "123456") setUser({ email, role: "member" })
    else throw new Error("Credenciais inválidas")
  }
  const logout = () => setUser(null)
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
}
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthCtx)
