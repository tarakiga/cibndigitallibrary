import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { authService } from '@/lib/api/auth'

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('AuthContext', () => {
  const TestComponent = () => {
    const { user, isAuthenticated, isLoading } = useAuth()
    return (
      <div>
        <div data-testid="auth-provider">Auth Provider Test</div>
        <div data-testid="user">{user ? user.email : 'No user'}</div>
        <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
        <div data-testid="is-loading">{isLoading.toString()}</div>
      </div>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders without crashing', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
  })

  it('provides initial unauthenticated state', async () => {
    jest.spyOn(authService, 'getStoredUser').mockReturnValue(null)
    jest.spyOn(authService, 'getAccessToken').mockReturnValue(null)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('user')).toHaveTextContent('No user')
    })
  })

  it('initializes with stored user data', async () => {
    const mockUser = { id: 1, email: 'test@example.com', role: 'subscriber' }
    const mockToken = 'mock-token'

    jest.spyOn(authService, 'getStoredUser').mockReturnValue(mockUser)
    jest.spyOn(authService, 'getAccessToken').mockReturnValue(mockToken)
    jest.spyOn(authService, 'getCurrentUser').mockResolvedValue(mockUser)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })
  })

  it('handles token expiration during initialization', async () => {
    const mockUser = { id: 1, email: 'test@example.com', role: 'subscriber' }
    const mockToken = 'expired-token'

    jest.spyOn(authService, 'getStoredUser').mockReturnValue(mockUser)
    jest.spyOn(authService, 'getAccessToken').mockReturnValue(mockToken)
    jest.spyOn(authService, 'getCurrentUser').mockRejectedValue(new Error('Token expired'))
    jest.spyOn(authService, 'clearAuthData').mockImplementation(() => {})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(authService.clearAuthData).toHaveBeenCalled()
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false')
    })
  })

  it('handles logout event', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Simulate logout event
    act(() => {
      window.dispatchEvent(new Event('auth:logout'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false')
    })
  })
})
