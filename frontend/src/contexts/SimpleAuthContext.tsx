'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface SimpleAuthContextType {
  user: any | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  cibnLogin: (credentials: { cibn_employee_id: string; password: string }) => Promise<void>
  register: (data: { full_name: string; email: string; password: string; phone?: string }) => Promise<void>
  logout: () => void
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined)

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true)
    try {
      // Simulate login
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUser({ id: 1, email: credentials.email, full_name: 'Test User' })
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const cibnLogin = async (credentials: { cibn_employee_id: string; password: string }) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUser({ id: 2, email: `${credentials.cibn_employee_id}@cibn.local`, full_name: 'CIBN Member' })
    } catch (error) {
      console.error('CIBN Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: { full_name: string; email: string; password: string; phone?: string }) => {
    setIsLoading(true)
    try {
      // Simulate register then auto-login
      await new Promise(resolve => setTimeout(resolve, 1200))
      setUser({ id: 3, email: data.email, full_name: data.full_name, phone: data.phone })
    } catch (error) {
      console.error('Register error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <SimpleAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        cibnLogin,
        register,
        logout,
      }}
    >
      {children}
    </SimpleAuthContext.Provider>
  )
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext)
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider')
  }
  return context
}
