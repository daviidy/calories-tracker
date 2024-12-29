/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { handleSignOut } from '@/lib/firebase/auth';
import DashboardPage from '@/app/(dashboard)/dashboard/page';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/firebase/auth', () => ({
  handleSignOut: jest.fn(),
}));

jest.mock('@/lib/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('DashboardPage', () => {
  const mockRouter = {
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('redirects to login when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<DashboardPage />);
    
    expect(mockRouter.replace).toHaveBeenCalledWith('/login');
  });

  it('renders dashboard when user is authenticated', () => {
    const mockUser = { email: 'test@example.com' };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    
    render(<DashboardPage />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes(mockUser.email))).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('handles logout successfully', async () => {
    const mockUser = { email: 'test@example.com' };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (handleSignOut as jest.Mock).mockResolvedValueOnce(undefined);
    
    render(<DashboardPage />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(handleSignOut).toHaveBeenCalled();
      expect(mockRouter.replace).toHaveBeenCalledWith('/login');
    });
  });

  it('handles logout error', async () => {
    const mockUser = { email: 'test@example.com' };
    const mockError = new Error('Logout failed');
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (handleSignOut as jest.Mock).mockRejectedValueOnce(mockError);
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<DashboardPage />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(handleSignOut).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Logout failed:', mockError);
    });
    
    consoleSpy.mockRestore();
  });
}); 