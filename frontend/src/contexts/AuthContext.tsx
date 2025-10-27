'use client'

/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, User, LoginCredentials, CIBNLoginCredentials, RegisterData } from '@/lib/api/auth'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  lastError: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  cibnLogin: (credentials: CIBNLoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastError, setLastError] = useState<string | null>(null)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = authService.getStoredUser()
        const token = authService.getAccessToken()
        
        console.log('AuthContext init:', { storedUser, token })
        
        if (storedUser && token) {
          console.log('Setting user from localStorage:', storedUser)
          setUser(storedUser)
          
          // Skip API refresh for test tokens (dev/demo mode)
          if (token.startsWith('test-token') || token.startsWith('demo-')) {
            console.log('Test/demo token detected - skipping API validation')
            setIsLoading(false)
            return // Exit early for test tokens
          }
          
          // Optionally refresh user data from API
          authService.getCurrentUser()
            .then(setUser)
            .catch((error) => {
              // Silently handle - token might be expired or backend down
              // Only log in development
              if (process.env.NODE_ENV === 'development') {
                console.warn('Could not refresh user data:', error.response?.status || error.message)
              }
              // Clear expired auth data
              authService.clearAuthData()
              setUser(null)
            })
            .finally(() => setIsLoading(false))
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for logout events
    const handleLogout = () => {
      setUser(null)
    }

    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials)
      console.log('Login response:', response)
      setUser(response.user)
      setLastError(null)
      toast.success('Login successful!')
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed. Please check your credentials.'
      setLastError(errorMessage)
      toast.error(errorMessage)
      throw error
    }
  }

  const cibnLogin = async (credentials: CIBNLoginCredentials) => {
    try {
      const response = await authService.cibnLogin(credentials)
      setUser(response.user)
      setLastError(null)
      toast.success('Welcome, CIBN Member!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed. Please check your credentials.'
      setLastError(errorMessage)
      toast.error(errorMessage)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      await authService.register(data)
      toast.success('Registration successful! Please login.')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Registration failed. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setLastError(null)
    toast.success('Logged out successfully')
  }

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      logout()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        cibnLogin,
        register,
        logout,
        refreshUser,
        lastError,
      }}
    >
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#059669] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
