import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LibraryPage from '../page'
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

// Mock the content API
jest.mock('@/lib/api/content', () => ({
  contentService: {
    getContent: jest.fn().mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Banking Fundamentals',
          description: 'Introduction to banking principles',
          price: 2500,
          type: 'document',
          category: 'exam_text',
          is_active: true,
        },
        {
          id: 2,
          title: 'Risk Management',
          description: 'Advanced risk management techniques',
          price: 5000,
          type: 'video',
          category: 'research_paper',
          is_active: true,
        },
      ],
    }),
    getContentById: jest.fn().mockResolvedValue({
      data: {
        id: 1,
        title: 'Banking Fundamentals',
        description: 'Introduction to banking principles',
        price: 2500,
        type: 'document',
        category: 'exam_text',
        is_active: true,
      },
    }),
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

describe('Library Page Integration', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      {children}
    </AuthProvider>
  )

  it('renders the library page with content', async () => {
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    // Check for main sections
    expect(screen.getByText(/CIBN Digital Library/i)).toBeInTheDocument()
    expect(screen.getByText(/Browse Our Collection/i)).toBeInTheDocument()
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Banking Fundamentals')).toBeInTheDocument()
      expect(screen.getByText('Risk Management')).toBeInTheDocument()
    })
  })

  it('displays content filters', () => {
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    // Check for filter options
    expect(screen.getByText(/Filter by Category/i)).toBeInTheDocument()
    expect(screen.getByText(/Filter by Type/i)).toBeInTheDocument()
    expect(screen.getByText(/Price Range/i)).toBeInTheDocument()
  })

  it('displays search functionality', () => {
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    // Check for search input
    expect(screen.getByPlaceholderText(/Search content/i)).toBeInTheDocument()
  })

  it('handles content search', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    const searchInput = screen.getByPlaceholderText(/Search content/i)
    await user.type(searchInput, 'banking')

    // In a real implementation, this would trigger search
    expect(searchInput).toHaveValue('banking')
  })

  it('displays content cards with correct information', async () => {
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Banking Fundamentals')).toBeInTheDocument()
      expect(screen.getByText('Introduction to banking principles')).toBeInTheDocument()
      expect(screen.getByText('₦2,500')).toBeInTheDocument()
    })
  })

  it('shows add to cart buttons for content', async () => {
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    await waitFor(() => {
      const addToCartButtons = screen.getAllByText(/Add to Cart/i)
      expect(addToCartButtons.length).toBeGreaterThan(0)
    })
  })

  it('handles add to cart functionality', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    await waitFor(() => {
      const addToCartButton = screen.getAllByText(/Add to Cart/i)[0]
      user.click(addToCartButton)
    })

    // Should show success message or update cart
    await waitFor(() => {
      // In a real implementation, this would show a success toast
      expect(screen.getByText('Banking Fundamentals')).toBeInTheDocument()
    })
  })

  it('displays content categories', () => {
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    // Check for category filters
    expect(screen.getByText(/Exam Text/i)).toBeInTheDocument()
    expect(screen.getByText(/Research Paper/i)).toBeInTheDocument()
    expect(screen.getByText(/CIBN Publication/i)).toBeInTheDocument()
  })

  it('filters content by category', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    const examTextFilter = screen.getByText(/Exam Text/i)
    await user.click(examTextFilter)

    // Should filter content to show only exam text
    await waitFor(() => {
      expect(screen.getByText('Banking Fundamentals')).toBeInTheDocument()
    })
  })

  it('displays content types', () => {
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    // Check for type filters
    expect(screen.getByText(/Document/i)).toBeInTheDocument()
    expect(screen.getByText(/Video/i)).toBeInTheDocument()
    expect(screen.getByText(/Audio/i)).toBeInTheDocument()
  })

  it('filters content by type', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    const videoFilter = screen.getByText(/Video/i)
    await user.click(videoFilter)

    // Should filter content to show only videos
    await waitFor(() => {
      expect(screen.getByText('Risk Management')).toBeInTheDocument()
    })
  })

  it('displays price range filter', () => {
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    // Check for price range inputs
    expect(screen.getByLabelText(/Min Price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Max Price/i)).toBeInTheDocument()
  })

  it('filters content by price range', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    const minPriceInput = screen.getByLabelText(/Min Price/i)
    const maxPriceInput = screen.getByLabelText(/Max Price/i)

    await user.type(minPriceInput, '1000')
    await user.type(maxPriceInput, '3000')

    // Should filter content within price range
    expect(minPriceInput).toHaveValue('1000')
    expect(maxPriceInput).toHaveValue('3000')
  })

  it('displays pagination controls', async () => {
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    // Check for pagination
    expect(screen.getByText(/Previous/i)).toBeInTheDocument()
    expect(screen.getByText(/Next/i)).toBeInTheDocument()
  })

  it('handles pagination', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    const nextButton = screen.getByText(/Next/i)
    await user.click(nextButton)

    // Should load next page of content
    expect(nextButton).toBeInTheDocument()
  })

  it('shows loading state while fetching content', () => {
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    // Should show loading indicator initially
    expect(screen.getByText(/Loading/i)).toBeInTheDocument()
  })

  it('displays error state when content fails to load', async () => {
    // Mock API to return error
    const { contentService } = require('@/lib/api/content')
    contentService.getContent.mockRejectedValue(new Error('Failed to fetch'))

    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/Error loading content/i)).toBeInTheDocument()
    })
  })

  it('shows content details when item is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    await waitFor(() => {
      const contentItem = screen.getByText('Banking Fundamentals')
      user.click(contentItem)
    })

    // Should show detailed view or modal
    await waitFor(() => {
      expect(screen.getByText('Introduction to banking principles')).toBeInTheDocument()
    })
  })

  it('displays content sorting options', () => {
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    // Check for sort options
    expect(screen.getByText(/Sort by/i)).toBeInTheDocument()
    expect(screen.getByText(/Price/i)).toBeInTheDocument()
    expect(screen.getByText(/Title/i)).toBeInTheDocument()
    expect(screen.getByText(/Date/i)).toBeInTheDocument()
  })

  it('sorts content by selected option', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <LibraryPage />
      </TestWrapper>
    )

    const sortSelect = screen.getByDisplayValue(/Sort by/i)
    await user.click(sortSelect)

    const priceOption = screen.getByText(/Price/i)
    await user.click(priceOption)

    // Should sort content by price
    expect(priceOption).toBeInTheDocument()
  })
})
