import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginPage from '@/app/login/page'
import { useAuth } from '@/lib/context/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { User } from '@firebase/auth'

// Mock the hooks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(),
  })),
}))

vi.mock('@/lib/context/auth-context', () => ({
  useAuth: vi.fn(),
}))

describe('LoginPage', () => {
  const mockSignInWithGoogle = vi.fn()
  const mockRouter = { 
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock useAuth implementation
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      logout: vi.fn(),
    })

    // Mock useRouter implementation
    vi.mocked(useRouter).mockReturnValue(mockRouter)

    // Mock useSearchParams implementation
    vi.mocked(useSearchParams).mockReturnValue({
      get: () => '/dashboard',
      getAll: () => ['/dashboard'],
      has: () => true,
      entries: () => new URLSearchParams([['from', '/dashboard']]).entries(),
      keys: () => new URLSearchParams([['from', '/dashboard']]).keys(),
      values: () => new URLSearchParams([['from', '/dashboard']]).values(),
      forEach: () => {},
      toString: () => 'from=/dashboard',
      [Symbol.iterator]: function* () {
        yield ['from', '/dashboard'];
        return undefined;
      },
      append: () => {},
      delete: () => {},
      set: () => {},
      sort: () => {},
      size: 1,
    })
  })

  it('renders login page correctly', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
  })

  it('shows loading spinner when authentication is in progress', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      signInWithGoogle: mockSignInWithGoogle,
      logout: vi.fn(),
    })

    render(<LoginPage />)
    
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('redirects to dashboard when user is authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: '123', email: 'test@example.com' } as User,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      logout: vi.fn(),
    })

    render(<LoginPage />)
    
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
  })

  it('handles Google sign-in click', async () => {
    render(<LoginPage />)
    
    const signInButton = screen.getByText('Sign in with Google')
    fireEvent.click(signInButton)

    expect(mockSignInWithGoogle).toHaveBeenCalled()
  })

  it('handles sign-in error gracefully', async () => {
    const mockError = new Error('Sign-in failed')
    mockSignInWithGoogle.mockRejectedValue(mockError)

    render(<LoginPage />)
    
    const signInButton = screen.getByText('Sign in with Google')
    fireEvent.click(signInButton)

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Failed to sign in:', mockError)
    })
  })
}) 