/**
 * useKeyboardShortcuts Hook
 * EPIC 4.3: Keyboard Shortcuts
 *
 * Global keyboard shortcuts handler for the application
 * Supports Ctrl/Cmd modifiers and common shortcuts
 */

import { useEffect } from 'react'

export type ShortcutKey = string // e.g., 'ctrl+n', 'cmd+k', 'escape'
export type ShortcutCallback = (event: KeyboardEvent) => void

export interface KeyboardShortcuts {
  [key: string]: ShortcutCallback
}

/**
 * Check if the event target is an input element where we should ignore most shortcuts
 */
const isInputElement = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName.toLowerCase()
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  )
}

/**
 * Normalize the key to lowercase for comparison
 */
const normalizeKey = (key: string): string => {
  return key.toLowerCase()
}

/**
 * Parse a shortcut string (e.g., 'ctrl+n') and check if it matches the event
 */
const matchesShortcut = (shortcut: string, event: KeyboardEvent): boolean => {
  const parts = shortcut.toLowerCase().split('+')

  // Handle single keys (like 'escape')
  if (parts.length === 1) {
    return normalizeKey(event.key) === normalizeKey(parts[0])
  }

  // Handle modifier + key combinations
  const modifier = parts[0]
  const key = parts[1]

  const keyMatches = normalizeKey(event.key) === normalizeKey(key)

  if (modifier === 'ctrl') {
    return event.ctrlKey && keyMatches && !event.metaKey
  }

  if (modifier === 'cmd' || modifier === 'meta') {
    return event.metaKey && keyMatches && !event.ctrlKey
  }

  if (modifier === 'alt') {
    return event.altKey && keyMatches
  }

  if (modifier === 'shift') {
    return event.shiftKey && keyMatches
  }

  return false
}

/**
 * Custom hook for registering keyboard shortcuts
 *
 * @param shortcuts - Object mapping shortcut keys to callback functions
 *
 * @example
 * useKeyboardShortcuts({
 *   'ctrl+n': () => createNewTask(),
 *   'ctrl+f': () => focusSearch(),
 *   'escape': () => closeModal(),
 * })
 */
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts): void => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target

      // Always allow Escape to work, even in input fields
      const isEscape = normalizeKey(event.key) === 'escape'

      // Ignore shortcuts in input elements (except Escape)
      if (!isEscape && isInputElement(target)) {
        return
      }

      // Check each registered shortcut
      for (const [shortcut, callback] of Object.entries(shortcuts)) {
        if (matchesShortcut(shortcut, event)) {
          event.preventDefault()
          callback(event)
          break // Only trigger one shortcut per keypress
        }
      }
    }

    // Register global listener
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts])
}
