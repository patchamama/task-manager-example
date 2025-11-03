/**
 * ConfirmationModal Component Tests
 * EPIC 1: Task Management Core
 *
 * User Story 1.4: Delete Task - Confirmation Modal
 * Scope: Global (shared component, used by 2+ features)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmationModal } from '../ConfirmationModal'

describe('ConfirmationModal Component', () => {
  const mockOnConfirm = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('User Story 1.4: Modal Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(
        <ConfirmationModal
          isOpen={false}
          title="Confirm Action"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Confirm Action"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should render as modal dialog', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Confirm Action"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })
  })

  describe('User Story 1.4: Modal Content', () => {
    it('should display title', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure you want to delete this task?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Delete Task')).toBeInTheDocument()
    })

    it('should display message', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="This action cannot be undone."
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
    })

    it('should display confirm button', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Confirm Action"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
    })

    it('should display cancel button', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Confirm Action"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('should allow custom confirm button text', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          confirmText="Delete"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    })

    it('should allow custom cancel button text', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          cancelText="Keep Task"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByRole('button', { name: 'Keep Task' })).toBeInTheDocument()
    })
  })

  describe('User Story 1.4: Confirmation Action', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      await user.click(confirmButton)

      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })

    it('should not call onCancel when confirm button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      await user.click(confirmButton)

      expect(mockOnCancel).not.toHaveBeenCalled()
    })
  })

  describe('User Story 1.4: Cancellation Action', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should not call onConfirm when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockOnConfirm).not.toHaveBeenCalled()
    })

    it('should call onCancel when close icon is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should call onCancel when Escape key is pressed', async () => {
      const user = userEvent.setup()
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      await user.keyboard('{Escape}')

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should call onCancel when backdrop is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const backdrop = screen.getByTestId('modal-backdrop')
      await user.click(backdrop)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('Variant Styling', () => {
    it('should apply default variant styling', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Confirm Action"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      expect(confirmButton).toHaveClass(/bg-blue/i)
    })

    it('should apply danger variant styling for destructive actions', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="This action cannot be undone."
          variant="danger"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      expect(confirmButton).toHaveClass(/bg-red/i)
    })

    it('should apply warning variant styling', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Warning"
          message="This may have consequences."
          variant="warning"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      expect(confirmButton).toHaveClass(/bg-yellow/i)
    })
  })

  describe('Accessibility', () => {
    it('should have accessible label from title', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAccessibleName('Delete Task')
    })

    it('should have accessible description from message', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="This action cannot be undone."
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAccessibleDescription()
    })

    it('should trap focus within modal when open', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      const confirmButton = screen.getByRole('button', { name: /confirm/i })

      // First focusable element should receive focus
      expect(document.activeElement).toBe(cancelButton)
    })

    it('should have visible focus indicators', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      expect(confirmButton).toHaveClass(/focus:/)
    })

    it('should prevent background scroll when modal is open', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      expect(document.body).toHaveStyle({ overflow: 'hidden' })
    })

    it('should restore background scroll when modal is closed', () => {
      const { rerender } = render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      rerender(
        <ConfirmationModal
          isOpen={false}
          title="Delete Task"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      expect(document.body).not.toHaveStyle({ overflow: 'hidden' })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should allow tabbing between buttons', async () => {
      const user = userEvent.setup()
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      const confirmButton = screen.getByRole('button', { name: /confirm/i })

      cancelButton.focus()
      expect(document.activeElement).toBe(cancelButton)

      await user.keyboard('{Tab}')
      expect(document.activeElement).toBe(confirmButton)
    })

    it('should allow Enter key to activate focused button', async () => {
      const user = userEvent.setup()
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      confirmButton.focus()
      await user.keyboard('{Enter}')

      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })
  })

  describe('Loading State', () => {
    it('should display loading state on confirm button', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          isLoading={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      expect(confirmButton).toBeDisabled()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should disable cancel button during loading', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          isLoading={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).toBeDisabled()
    })

    it('should prevent onConfirm when loading', async () => {
      const user = userEvent.setup()
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message="Are you sure?"
          isLoading={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      await user.click(confirmButton)

      expect(mockOnConfirm).not.toHaveBeenCalled()
    })
  })
})
