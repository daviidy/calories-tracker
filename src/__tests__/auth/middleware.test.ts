import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'
import { middleware } from '@/middleware'
import { RequestCookies } from 'next/dist/server/web/spec-extension/cookies'

vi.mock('next/server', () => {
  return {
    NextResponse: {
      redirect: vi.fn(),
      next: vi.fn(),
    },
    NextRequest: vi.fn().mockImplementation((url) => ({
      url,
      nextUrl: new URL(url),
      cookies: {
        get: vi.fn(),
      },
    })),
  }
})

describe('Auth Middleware', () => {
  let mockRedirect: ReturnType<typeof vi.fn>
  let mockNext: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockRedirect = vi.mocked(NextResponse.redirect)
    mockNext = vi.mocked(NextResponse.next)
  })

  it('redirects to login when accessing protected route without auth', () => {
    const nextUrl = new URL('http://localhost:3000/dashboard')
    const request = {
      url: 'http://localhost:3000/dashboard',
      nextUrl,
      cookies: {
        get: () => undefined,
      },
    }

    middleware(request)

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'http://localhost:3000/login?from=%2Fdashboard'
      })
    )
  })

  it('redirects to dashboard when accessing login while authenticated', () => {
    const nextUrl = new URL('http://localhost:3000/login')
    const request = {
      url: 'http://localhost:3000/login',
      nextUrl,
      cookies: {
        get: () => ({ value: 'valid-session' }),
      },
    }

    middleware(request)

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'http://localhost:3000/dashboard'
      })
    )
  })

  it('allows access to protected routes when authenticated', () => {
    const nextUrl = new URL('http://localhost:3000/dashboard')
    const request = {
      url: 'http://localhost:3000/dashboard',
      nextUrl,
      cookies: {
        get: () => ({ value: 'valid-session' }),
      },
    }

    middleware(request)

    expect(mockNext).toHaveBeenCalled()
  })

  it('allows access to public routes when not authenticated', () => {
    const nextUrl = new URL('http://localhost:3000/login')
    const request = {
      url: 'http://localhost:3000/login',
      nextUrl,
      cookies: {
        get: () => undefined,
      },
    }

    middleware(request)

    expect(mockNext).toHaveBeenCalled()
  })

  it('handles other routes correctly', () => {
    const nextUrl = new URL('http://localhost:3000/about')
    const request = {
      url: 'http://localhost:3000/about',
      nextUrl,
      cookies: {
        get: () => undefined,
      },
    }

    middleware(request)

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'http://localhost:3000/login?from=%2Fabout'
      })
    )
  })
}) 