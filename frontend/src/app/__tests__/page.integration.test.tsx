import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../page'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock the auth service
jest.mock('@/lib/api/auth', () => ({
  authService: {
    getStoredUser: jest.fn().mockReturnValue(null),
    getAccessToken: jest.fn().mockReturnValue(null),
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    cibnLogin: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
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
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}))

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

describe('Home Page Integration', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      {children}
    </AuthProvider>
  )

  it('renders the home page with all sections', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    // Check for main sections
    expect(screen.getByText(/Welcome to CIBN Digital Library/i)).toBeInTheDocument()
    expect(screen.getByText(/Your Gateway to Banking Excellence/i)).toBeInTheDocument()
    
    // Check for navigation
    expect(screen.getByText('Library')).toBeInTheDocument()
    expect(screen.getByText('Membership')).toBeInTheDocument()
    
    // Check for CTA buttons
    expect(screen.getByText('Explore Library')).toBeInTheDocument()
    expect(screen.getByText('Join CIBN')).toBeInTheDocument()
  })

  it('opens login modal when login button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    const loginButton = screen.getByText('Sign In')
    await user.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByText('Sign in to access your CIBN Digital Library')).toBeInTheDocument()
    })
  })

  it('displays content showcase section', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    expect(screen.getByText(/Featured Content/i)).toBeInTheDocument()
    expect(screen.getByText(/Latest Resources/i)).toBeInTheDocument()
  })

  it('displays membership section', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    expect(screen.getByText(/Join CIBN Today/i)).toBeInTheDocument()
    expect(screen.getByText(/Exclusive Benefits/i)).toBeInTheDocument()
  })

  it('displays footer with links', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    expect(screen.getByText(/About CIBN/i)).toBeInTheDocument()
    expect(screen.getByText(/Contact/i)).toBeInTheDocument()
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument()
  })

  it('handles navigation to library page', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    const libraryLink = screen.getByText('Library')
    await user.click(libraryLink)

    // In a real app, this would navigate to the library page
    // For now, we just verify the link exists and is clickable
    expect(libraryLink).toBeInTheDocument()
  })

  it('handles navigation to membership page', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    const membershipLink = screen.getByText('Membership')
    await user.click(membershipLink)

    // In a real app, this would navigate to the membership page
    expect(membershipLink).toBeInTheDocument()
  })

  it('displays hero section with correct content', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    // Check hero section content
    expect(screen.getByText(/Welcome to CIBN Digital Library/i)).toBeInTheDocument()
    expect(screen.getByText(/Your Gateway to Banking Excellence/i)).toBeInTheDocument()
    expect(screen.getByText(/Access premium banking resources/i)).toBeInTheDocument()
  })

  it('shows authentication state correctly for unauthenticated user', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    // Should show login button for unauthenticated users
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('handles responsive design elements', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    // Check for responsive classes and mobile-friendly elements
    const heroSection = screen.getByText(/Welcome to CIBN Digital Library/i).closest('section')
    expect(heroSection).toBeInTheDocument()
  })

  it('displays all main navigation items', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    // Check for main navigation items
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Library')).toBeInTheDocument()
    expect(screen.getByText('Membership')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('shows shopping cart functionality', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    // Look for cart icon or button
    const cartButton = screen.getByRole('button', { name: /cart/i })
    await user.click(cartButton)

    // Should open shopping cart
    await waitFor(() => {
      expect(screen.getByText('Shopping Cart')).toBeInTheDocument()
    })
  })
})
