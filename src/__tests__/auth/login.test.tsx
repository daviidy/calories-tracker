import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signInWithGoogle } from '@/lib/firebase/auth';
import LoginPage from '@/app/(auth)/login/page';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/firebase/auth', () => ({
  signInWithGoogle: jest.fn(),
}));

jest.mock('@/lib/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('LoginPage', () => {
  const mockRouter = {
    replace: jest.fn(),
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({ user: null });
  });

  it('renders login page correctly', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Login to your account')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });

  it('redirects to dashboard when user is already logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { email: 'test@example.com' } });
    render(<LoginPage />);
    
    expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
  });

  it('handles Google sign in successfully', async () => {
    const mockUser = { email: 'test@example.com' };
    (signInWithGoogle as jest.Mock).mockResolvedValueOnce(mockUser);
    
    render(<LoginPage />);
    
    const signInButton = screen.getByText('Sign in with Google');
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalled();
      expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles sign in error', async () => {
    const mockError = new Error('Sign in failed');
    (signInWithGoogle as jest.Mock).mockRejectedValueOnce(mockError);
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<LoginPage />);
    
    const signInButton = screen.getByText('Sign in with Google');
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Login failed:', mockError);
    });
    
    consoleSpy.mockRestore();
  });
}); 