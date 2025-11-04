/**
 * Theme Provider Tests - EPIC 4.1
 * User Story 4.1: Dark Mode
 *
 * Tests theme context, provider, and dark mode functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Components to be implemented
import { ThemeProvider, useTheme } from '../ThemeProvider'

// Test component that uses the theme hook
const ThemeConsumer = () => {
  const { theme, toggleTheme, setTheme } = useTheme()

  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button onClick={toggleTheme} data-testid="toggle-theme">
        Toggle Theme
      </button>
      <button onClick={() => setTheme('light')} data-testid="set-light">
        Set Light
      </button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">
        Set Dark
      </button>
    </div>
  )
}

describe('EPIC 4.1: Dark Mode - ThemeProvider', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Reset document class
    document.documentElement.className = ''
    // Mock matchMedia - default to light mode (no system preference)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false, // Default: no dark mode preference
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Theme Context', () => {
    it('should provide theme context to children', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toBeInTheDocument()
    })

    it('should throw error when useTheme is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<ThemeConsumer />)
      }).toThrow('useTheme must be used within a ThemeProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('Initial Theme', () => {
    it('should default to light theme', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    })

    it('should respect system dark mode preference', () => {
      // Mock system preference for dark mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })

    it('should load theme from localStorage if available', () => {
      localStorage.setItem('theme', 'dark')

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })

    it('should prioritize localStorage over system preference', () => {
      localStorage.setItem('theme', 'light')

      // Mock system preference for dark mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    })
  })

  describe('Toggle Theme', () => {
    it('should toggle from light to dark', async () => {
      const user = userEvent.setup()

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')

      await user.click(screen.getByTestId('toggle-theme'))

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })

    it('should toggle from dark to light', async () => {
      const user = userEvent.setup()
      localStorage.setItem('theme', 'dark')

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')

      await user.click(screen.getByTestId('toggle-theme'))

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    })
  })

  describe('Set Theme', () => {
    it('should set theme to light', async () => {
      const user = userEvent.setup()
      localStorage.setItem('theme', 'dark')

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )

      await user.click(screen.getByTestId('set-light'))

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    })

    it('should set theme to dark', async () => {
      const user = userEvent.setup()

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )

      await user.click(screen.getByTestId('set-dark'))

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })
  })

  describe('LocalStorage Persistence', () => {
    it('should save theme to localStorage when changed', async () => {
      const user = userEvent.setup()

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )

      await user.click(screen.getByTestId('toggle-theme'))

      expect(localStorage.getItem('theme')).toBe('dark')
    })

    it('should update localStorage when theme is set directly', async () => {
      const user = userEvent.setup()

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )

      await user.click(screen.getByTestId('set-dark'))

      expect(localStorage.getItem('theme')).toBe('dark')
    })
  })

  describe('DOM Class Management', () => {
    it('should add dark class to document element in dark mode', async () => {
      const user = userEvent.setup()

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )

      await user.click(screen.getByTestId('set-dark'))

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should remove dark class in light mode', async () => {
      const user = userEvent.setup()
      localStorage.setItem('theme', 'dark')

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )

      // Should start with dark class
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      await user.click(screen.getByTestId('set-light'))

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('should apply dark class on initial mount if theme is dark', () => {
      localStorage.setItem('theme', 'dark')

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  describe('System Preference Changes', () => {
    it('should listen for system theme changes when no preference is stored', () => {
      const addEventListenerSpy = vi.fn()

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: addEventListenerSpy,
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )

      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function))
    })
  })
})
