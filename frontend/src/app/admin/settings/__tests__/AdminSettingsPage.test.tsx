import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminSettingsPage from '../page';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the components
jest.mock('../components/LibraryManager', () => ({
  __esModule: true,
  default: () => <div data-testid="library-manager">Library Manager</div>,
}));

jest.mock('../components/PaymentsSection', () => ({
  __esModule: true,
  default: () => <div data-testid="payments-section">Payments Section</div>,
}));

describe('AdminSettingsPage', () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.Mock;
  const mockUseAuth = useAuth as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush });
  });

  it('renders loading state', () => {
    mockUseAuth.mockReturnValue({ isLoading: true });
    render(<AdminSettingsPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: false });
    render(<AdminSettingsPage />);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('renders the admin dashboard when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { name: 'Admin User', role: 'admin' },
    });

    render(<AdminSettingsPage />);
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome, Admin User')).toBeInTheDocument();
    expect(screen.getByTestId('library-manager')).toBeInTheDocument();
  });

  it('switches between tabs', async () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { name: 'Admin User', role: 'admin' },
    });

    render(<AdminSettingsPage />);
    
    // Click on the Payments tab
    fireEvent.click(screen.getByText('Payments'));
    await waitFor(() => {
      expect(screen.getByTestId('payments-section')).toBeInTheDocument();
    });
  });
});
