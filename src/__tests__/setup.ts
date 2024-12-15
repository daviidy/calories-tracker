import '@testing-library/jest-dom'
import { expect, vi } from 'vitest'

// Mock console.error to avoid noisy test output
vi.spyOn(console, 'error').mockImplementation(() => {})

// Add custom matchers
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null
    return {
      pass,
      message: () => `expected element to ${pass ? 'not ' : ''}be in the document`,
    }
  },
}) 