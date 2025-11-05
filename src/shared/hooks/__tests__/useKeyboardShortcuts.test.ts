/**
 * useKeyboardShortcuts Hook Tests
 * EPIC 4.3: Keyboard Shortcuts
 *
 * Tests for global keyboard shortcuts hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '../useKeyboardShortcuts'

describe('EPIC 4.3: Keyboard Shortcuts - useKeyboardShortcuts Hook', () => {
  beforeEach(() => {
    // Clear any event listeners before each test
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Shortcut Registration', () => {
    it('should register keyboard shortcuts', () => {
      const callback = vi.fn()

      renderHook(() => useKeyboardShortcuts({
        'ctrl+n': callback,
      }))

      const event = new KeyboardEvent('keydown', {
        key: 'n',
        ctrlKey: true,
        bubbles: true,
      })

      document.dispatchEvent(event)

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should handle Cmd key on Mac (metaKey)', () => {
      const callback = vi.fn()

      renderHook(() => useKeyboardShortcuts({
        'cmd+n': callback,
      }))

      const event = new KeyboardEvent('keydown', {
        key: 'n',
        metaKey: true,
        bubbles: true,
      })

      document.dispatchEvent(event)

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple shortcuts', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      renderHook(() => useKeyboardShortcuts({
        'ctrl+n': callback1,
        'ctrl+f': callback2,
      }))

      // Test first shortcut
      const event1 = new KeyboardEvent('keydown', {
        key: 'n',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event1)
      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).not.toHaveBeenCalled()

      // Test second shortcut
      const event2 = new KeyboardEvent('keydown', {
        key: 'f',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event2)
      expect(callback2).toHaveBeenCalledTimes(1)
      expect(callback1).toHaveBeenCalledTimes(1) // Still 1
    })

    it('should handle Escape key', () => {
      const callback = vi.fn()

      renderHook(() => useKeyboardShortcuts({
        'escape': callback,
      }))

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      })

      document.dispatchEvent(event)

      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('Event Prevention', () => {
    it('should prevent default behavior for registered shortcuts', () => {
      const callback = vi.fn()

      renderHook(() => useKeyboardShortcuts({
        'ctrl+n': callback,
      }))

      const event = new KeyboardEvent('keydown', {
        key: 'n',
        ctrlKey: true,
        bubbles: true,
      })

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      document.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('Input Element Handling', () => {
    it('should not trigger shortcuts when typing in input fields', () => {
      const callback = vi.fn()

      renderHook(() => useKeyboardShortcuts({
        'ctrl+n': callback,
      }))

      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      const event = new KeyboardEvent('keydown', {
        key: 'n',
        ctrlKey: true,
        bubbles: true,
      })

      input.dispatchEvent(event)

      // Ctrl+N in input should be ignored (except for specific shortcuts like Escape)
      expect(callback).not.toHaveBeenCalled()
    })

    it('should trigger Escape even in input fields', () => {
      const callback = vi.fn()

      renderHook(() => useKeyboardShortcuts({
        'escape': callback,
      }))

      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      })

      input.dispatchEvent(event)

      // Escape should work everywhere
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should not trigger shortcuts when typing in textarea', () => {
      const callback = vi.fn()

      renderHook(() => useKeyboardShortcuts({
        'ctrl+f': callback,
      }))

      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      textarea.focus()

      const event = new KeyboardEvent('keydown', {
        key: 'f',
        ctrlKey: true,
        bubbles: true,
      })

      textarea.dispatchEvent(event)

      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('Cleanup', () => {
    it('should cleanup event listeners on unmount', () => {
      const callback = vi.fn()

      const { unmount } = renderHook(() => useKeyboardShortcuts({
        'ctrl+n': callback,
      }))

      // Trigger before unmount
      const event1 = new KeyboardEvent('keydown', {
        key: 'n',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event1)
      expect(callback).toHaveBeenCalledTimes(1)

      // Unmount
      unmount()

      // Trigger after unmount - should not call callback
      const event2 = new KeyboardEvent('keydown', {
        key: 'n',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event2)
      expect(callback).toHaveBeenCalledTimes(1) // Still 1, not 2
    })
  })

  describe('Case Sensitivity', () => {
    it('should handle case-insensitive key matching', () => {
      const callback = vi.fn()

      renderHook(() => useKeyboardShortcuts({
        'ctrl+k': callback,
      }))

      const event = new KeyboardEvent('keydown', {
        key: 'K', // Uppercase
        ctrlKey: true,
        bubbles: true,
      })

      document.dispatchEvent(event)

      expect(callback).toHaveBeenCalledTimes(1)
    })
  })
})
