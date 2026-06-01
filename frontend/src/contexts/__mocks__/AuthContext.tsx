import React from 'react'

export const useAuth = jest.fn(() => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: jest.fn(),
  cibnLogin: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  refreshUser: jest.fn(),
}))

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="auth-provider">{children}</div>
}

export default {
  useAuth,
  AuthProvider,
}
