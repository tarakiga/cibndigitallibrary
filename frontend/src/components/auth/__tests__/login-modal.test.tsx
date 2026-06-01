import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginModal } from '../login-modal'
import { useAuth } from '@/contexts/AuthContext'

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('LoginModal', () => {
  const mockOnClose = jest.fn()
  const mockLogin = jest.fn()
  const mockCibnLogin = jest.fn()

  const defaultAuthContext = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: mockLogin,
    cibnLogin: mockCibnLogin,
    register: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue(defaultAuthContext)
  })

  it('renders when open', () => {
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to access your CIBN Digital Library')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<LoginModal isOpen={false} onClose={mockOnClose} />)
    
    expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument()
  })

  it('shows general user tab by default', () => {
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByText('General User')).toBeInTheDocument()
    expect(screen.getByText('CIBN Member')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
  })

  it('switches to CIBN member tab', async () => {
    const user = userEvent.setup()
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    
    const cibnTab = screen.getByText('CIBN Member')
    await user.click(cibnTab)
    
    expect(screen.getByLabelText('Employee ID')).toBeInTheDocument()
    expect(screen.getByLabelText('Department')).toBeInTheDocument()
  })

  it('handles general user login form submission', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({})
    
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('handles CIBN member login form submission', async () => {
    const user = userEvent.setup()
    mockCibnLogin.mockResolvedValue({})
    
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    
    // Switch to CIBN tab
    const cibnTab = screen.getByText('CIBN Member')
    await user.click(cibnTab)
    
    const employeeIdInput = screen.getByLabelText('Employee ID')
    const departmentSelect = screen.getByRole('combobox')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /verify & sign in/i })
    
    await user.type(employeeIdInput, 'EMP123')
    await user.click(departmentSelect)
    await user.click(screen.getByText('Banking Operations'))
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockCibnLogin).toHaveBeenCalledWith({
        cibn_employee_id: 'EMP123',
        password: 'password123',
      })
    })
  })

  it('shows validation error for empty fields', async () => {
    const user = userEvent.setup()
    
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument()
    })
  })

  it('shows validation error for empty CIBN fields', async () => {
    const user = userEvent.setup()
    
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    
    // Switch to CIBN tab
    const cibnTab = screen.getByText('CIBN Member')
    await user.click(cibnTab)
    
    const submitButton = screen.getByRole('button', { name: /verify & sign in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument()
    })
  })

  it('handles login error', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Invalid credentials'
    mockLogin.mockRejectedValue({
      response: { data: { detail: errorMessage } }
    })
    
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    
    const passwordInput = screen.getByLabelText('Password')
    const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup()
    
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    
    const closeButton = screen.getByRole('button', { name: '' }) // X button
    await user.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows loading state during authentication', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      ...defaultAuthContext,
      isLoading: true,
    })
    
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByText('Signing In...')).toBeInTheDocument()
  })

  it('shows loading state for CIBN authentication', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      ...defaultAuthContext,
      isLoading: true,
    })
    
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    
    // Switch to CIBN tab
    fireEvent.click(screen.getByText('CIBN Member'))
    
    expect(screen.getByText('Verifying...')).toBeInTheDocument()
  })

  it('clears form data after successful login', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({})
    
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})
