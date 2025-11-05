/**
 * Keyboard Shortcuts Help Modal
 * EPIC 4.3: Keyboard Shortcuts
 *
 * Modal displaying all available keyboard shortcuts
 */

import React from 'react'

interface Shortcut {
  keys: string[]
  description: string
  category: string
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts: Shortcut[] = [
  {
    keys: ['Ctrl', 'N'],
    description: 'Create new task',
    category: 'Tasks',
  },
  {
    keys: ['Ctrl', 'F'],
    description: 'Focus search',
    category: 'Navigation',
  },
  {
    keys: ['Ctrl', 'K'],
    description: 'Open keyboard shortcuts help',
    category: 'General',
  },
  {
    keys: ['Esc'],
    description: 'Close modal or cancel form',
    category: 'General',
  },
  {
    keys: ['?'],
    description: 'Show this help',
    category: 'General',
  },
]

const KeyboardKey: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
    {children}
  </kbd>
)

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 id="shortcuts-title" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            aria-label="Close shortcuts help"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg
              className="w-6 h-6 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {categories.map((category) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <KeyboardKey>{key}</KeyboardKey>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-gray-400 dark:text-gray-500 text-xs mx-1">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press <KeyboardKey>Esc</KeyboardKey> or click outside to close
          </p>
        </div>
      </div>
    </div>
  )
}
