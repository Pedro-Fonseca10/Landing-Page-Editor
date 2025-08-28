import { createContext, useState } from "react"  // remova o useContext daqui

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const login = (email, password) => {
    if (email === "admin" && password === "123") setUser({ email, role: "admin" })
    else if (email === "membro" && password === "123") setUser({ email, role: "member" })
    else throw new Error("Credenciais inválidas")
  }
  const logout = () => setUser(null)
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
}

export { AuthCtx }
