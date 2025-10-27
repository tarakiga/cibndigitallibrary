/**
 * Simple ShoppingCart Tests
 * Basic tests for the ShoppingCart component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { ShoppingCart } from '../shopping-cart'

// Mocks are handled globally in jest.setup.js

describe('ShoppingCart', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when open', () => {
    render(<ShoppingCart isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<ShoppingCart isOpen={false} onClose={mockOnClose} />)
    
    expect(screen.queryByText('Shopping Cart')).not.toBeInTheDocument()
  })

  it('displays cart items', () => {
    render(<ShoppingCart isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByText('Banking Fundamentals 2024')).toBeInTheDocument()
    expect(screen.getByText('Advanced Risk Management')).toBeInTheDocument()
  })

  it('shows correct item count', () => {
    render(<ShoppingCart isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByText('2 items in your cart')).toBeInTheDocument()
  })

  it('displays total price', () => {
    render(<ShoppingCart isOpen={true} onClose={mockOnClose} />)
    
    // Should show the total including VAT (7500 + 563 = 8063)
    expect(screen.getByText('₦8,063')).toBeInTheDocument()
  })

  it('shows proceed to checkout button', () => {
    render(<ShoppingCart isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument()
  })
})
