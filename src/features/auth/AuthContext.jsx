import { createContext, useContext, useState } from "react"

const AuthCtx = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const login = (email, password) => {
    if (email === "admin@ita.br" && password === "123456") {
      setUser({ email, role: "admin" })
      return true
    } else if (email === "membro@ita.br" && password === "123456") {
      setUser({ email, role: "member" })
      return true
    } else {
      return false // Não lança erro, apenas retorna false
    }
  }
  const logout = () => setUser(null)
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
}
export const useAuth = () => useContext(AuthCtx)
