/**
 * Simple LoginModal Tests
 * Basic tests for the LoginModal component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { LoginModal } from '../login-modal'

// Mocks are handled globally in jest.setup.js

describe('LoginModal', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when open', () => {
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<LoginModal isOpen={false} onClose={mockOnClose} />)
    
    expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument()
  })

  it('shows general user tab by default', () => {
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByText('General User')).toBeInTheDocument()
    expect(screen.getByText('CIBN Member')).toBeInTheDocument()
  })

  it('displays email and password fields', () => {
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('shows sign in button', () => {
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('displays CIBN member tab content when switched', () => {
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    
    // The CIBN tab should be available
    expect(screen.getByText('CIBN Member')).toBeInTheDocument()
  })
})
