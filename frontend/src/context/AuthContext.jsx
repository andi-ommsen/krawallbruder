import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken'))

  const login = (t) => {
    localStorage.setItem('adminToken', t)
    setToken(t)
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
