/**
 * Authentication API Service
 * Enhanced authentication service with token management and role-based utilities
 */

import apiClient from './client'

// Type definitions
export interface LoginCredentials {
  email: string
  password: string
}

export interface CIBNLoginCredentials {
  cibn_employee_id: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  phone?: string
  role?: 'subscriber' | 'cibn_member'
  cibn_employee_id?: string
}

export type UserRole = 'subscriber' | 'cibn_member' | 'admin'

export interface User {
  id: number
  email: string
  full_name: string
  phone?: string
  role: UserRole
  cibn_employee_id?: string
  arrears?: string | number
  annual_subscription?: string | number
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at?: string
  last_login?: string
}

export interface AuthResponse {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in?: number
  user: User
}

// Token storage keys
const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'

/**
 * Authentication service with token management and role-based utilities
 */
export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Demo fallbacks (dev only)
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO === '1') {
      // Admin demo
      if (credentials.email === 'admin@demo.local' && credentials.password === 'Admin123!') {
        const demoAdmin: AuthResponse = {
          access_token: 'demo-admin-token',
          refresh_token: 'demo-refresh-token',
          token_type: 'bearer',
          expires_in: 3600,
          user: {
            id: 1,
            email: 'admin@demo.local',
            full_name: 'Demo Admin',
            role: 'admin',
            is_active: true,
            is_verified: true,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
          },
        }
        this.setAuthData(demoAdmin)
        return demoAdmin
      }
      
      // Regular user demo
      if (credentials.email === 'user@demo.local' && credentials.password === 'User123!') {
        const demoUser: AuthResponse = {
          access_token: 'demo-user-token',
          refresh_token: 'demo-refresh-token',
          token_type: 'bearer',
          expires_in: 3600,
          user: {
            id: 2,
            email: 'user@demo.local',
            full_name: 'Demo User',
            role: 'subscriber',
            is_active: true,
            is_verified: true,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
          },
        }
        this.setAuthData(demoUser)
        return demoUser
      }
    }

    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
      this.setAuthData(response.data)
      return response.data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  },

  /**
   * Login with CIBN employee ID
   */
  async cibnLogin(credentials: CIBNLoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/cibn-login', credentials)
      this.setAuthData(response.data)
      return response.data
    } catch (error) {
      console.error('CIBN login failed:', error)
      throw error
    }
  },

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<User> {
    try {
      const response = await apiClient.post<{ user: User }>('/auth/register', data)
      return response.data.user
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  },

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/forgot-password', { email })
    } catch (error) {
      console.error('Password reset request failed:', error)
      throw error
    }
  },

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', { token, new_password: newPassword })
    } catch (error) {
      console.error('Password reset failed:', error)
      throw error
    }
  },

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me')
      this.setUserData(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      throw error
    }
  },

  /**
   * Refresh access token
   * @returns The new access token or null if refresh failed
   */
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        console.warn('No refresh token available')
        return null
      }

      console.log('Attempting to refresh access token...')
      const response = await apiClient.post<{ access_token: string }>('/auth/refresh', {
        refresh_token: refreshToken,
      })
      
      if (response?.data?.access_token) {
        const { access_token } = response.data
        console.log('Successfully refreshed access token')
        this.setAccessToken(access_token)
        return access_token
      }
      
      console.warn('No access token in refresh response')
      return null
    } catch (error) {
      console.error('Failed to refresh token:', error)
      this.clearAuthData()
      return null
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Optional: Call backend to invalidate token
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearAuthData()
      window.dispatchEvent(new Event('auth:logout'))
    }
  },

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    const user = this.getStoredUser()
    return user?.role === role
  },

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getStoredUser()
    return user ? roles.includes(user.role) : false
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getAccessToken() !== null
  },

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  },

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null
    
    const userStr = localStorage.getItem(USER_KEY)
    if (!userStr) return null
    
    try {
      return JSON.parse(userStr)
    } catch (error) {
      console.error('Failed to parse user data:', error)
      return null
    }
  },

  // Private helper methods
  private setAuthData(authData: AuthResponse): void {
    if (typeof window === 'undefined') return
    
    const { access_token, refresh_token, user } = authData
    
    if (access_token) {
      localStorage.setItem(TOKEN_KEY, access_token)
    }
    
    if (refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token)
    }
    
    if (user) {
      this.setUserData(user)
    }
  },
  
  private setUserData(user: User): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  
  private setAccessToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_KEY, token)
  },
  
  private clearAuthData(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

export default authService
