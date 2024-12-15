import { act, renderHook } from '@testing-library/react'
import { useAuth, AuthProvider } from '@/lib/context/auth-context'
import { User } from '@firebase/auth'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { auth } from '@/lib/firebase/config'

// Mock Next Router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

// Mock Firebase Config
vi.mock('@/lib/firebase/config', () => ({
  auth: {
    onAuthStateChanged: vi.fn(() => () => {}),
    signOut: vi.fn(),
  }
}))

// Mock fetch for session API calls
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ status: 'success' }),
  })
) as any

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides initial auth state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true)
  })

  it('updates auth state when user signs in', async () => {
    const mockUser: Partial<User> = {
      uid: '123',
      email: 'test@example.com',
      getIdToken: vi.fn().mockResolvedValue('mock-token'),
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    // Simulate auth state change
    await act(async () => {
      const authStateCallback = vi.mocked(auth.onAuthStateChanged).mock.calls[0][0]
      await authStateCallback(mockUser as User)
    })

    expect(result.current.user?.uid).toBe('123')
    expect(result.current.loading).toBe(false)
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/session', expect.any(Object))
  })

  it('handles sign out', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.logout()
    })

    expect(auth.signOut).toHaveBeenCalled()
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', expect.any(Object))
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
}) 