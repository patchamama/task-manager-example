/**
 * Task Management Integration Tests
 * EPIC 1: Task Management Core
 *
 * Integration tests covering complete user flows across all User Stories
 * Tests user journeys from start to finish
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskManagementPage } from '../pages/TaskManagementPage'

describe('Task Management Integration', () => {
  beforeEach(() => {
    // Reset store or use test wrapper
  })

  describe('User Journey: Complete Task Lifecycle', () => {
    it('should allow user to create, view, edit, complete, and delete a task', async () => {
      const user = userEvent.setup()
      render(<TaskManagementPage />)

      // Step 1: Initially shows empty state (User Story 1.2)
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()

      // Step 2: User clicks create task button
      const createButton = screen.getByRole('button', { name: /new task/i })
      await user.click(createButton)

      // Step 3: User fills out task form (User Story 1.1)
      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)

      await user.type(titleInput, 'Complete project documentation')
      await user.type(descriptionInput, 'Write comprehensive README and API docs')

      // Step 4: User submits the form
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)

      // Step 5: Task appears in the list (User Story 1.2)
      expect(screen.getByText('Complete project documentation')).toBeInTheDocument()
      expect(screen.getByText(/Write comprehensive README/i)).toBeInTheDocument()

      // Step 6: User edits the task (User Story 1.3)
      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      const editTitleInput = screen.getByLabelText(/title/i)
      await user.clear(editTitleInput)
      await user.type(editTitleInput, 'Complete project documentation and tests')

      const updateButton = screen.getByRole('button', { name: /update task/i })
      await user.click(updateButton)

      // Step 7: Updated task appears in list
      expect(screen.getByText('Complete project documentation and tests')).toBeInTheDocument()

      // Step 8: User marks task as complete (User Story 1.5)
      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      // Step 9: Task shows as completed
      expect(checkbox).toBeChecked()
      const taskTitle = screen.getByText('Complete project documentation and tests')
      expect(taskTitle).toHaveClass('line-through')

      // Step 10: User deletes the task (User Story 1.4)
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      // Step 11: Confirmation modal appears
      const confirmationModal = screen.getByRole('dialog')
      expect(confirmationModal).toBeInTheDocument()
      expect(within(confirmationModal).getByText(/delete task/i)).toBeInTheDocument()

      // Step 12: User confirms deletion
      const confirmButton = within(confirmationModal).getByRole('button', { name: /confirm|delete/i })
      await user.click(confirmButton)

      // Step 13: Task is removed and empty state returns
      expect(screen.queryByText('Complete project documentation and tests')).not.toBeInTheDocument()
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
    })
  })

  describe('User Journey: Managing Multiple Tasks', () => {
    it('should allow creating and managing multiple tasks', async () => {
      const user = userEvent.setup()
      render(<TaskManagementPage />)

      // Create first task
      const createButton = screen.getByRole('button', { name: /new task/i })
      await user.click(createButton)

      let titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Task 1')
      await user.click(screen.getByRole('button', { name: /create task/i }))

      // Create second task
      await user.click(createButton)
      titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Task 2')
      await user.click(screen.getByRole('button', { name: /create task/i }))

      // Create third task
      await user.click(createButton)
      titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Task 3')
      await user.click(screen.getByRole('button', { name: /create task/i }))

      // All tasks should be visible
      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.getByText('Task 2')).toBeInTheDocument()
      expect(screen.getByText('Task 3')).toBeInTheDocument()

      // Tasks should be sorted by creation date (newest first)
      const taskItems = screen.getAllByRole('article')
      expect(taskItems).toHaveLength(3)

      // Complete middle task
      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1])

      // Verify completed count
      expect(screen.getByText(/1.*completed/i)).toBeInTheDocument()
    })
  })

  describe('User Journey: Form Validation', () => {
    it('should validate form inputs and show appropriate errors', async () => {
      const user = userEvent.setup()
      render(<TaskManagementPage />)

      const createButton = screen.getByRole('button', { name: /new task/i })
      await user.click(createButton)

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)

      // Should show validation error
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()

      // Type a very long title
      const titleInput = screen.getByLabelText(/title/i)
      const longTitle = 'a'.repeat(101)
      await user.type(titleInput, longTitle)
      await user.click(submitButton)

      // Should show length validation error
      expect(screen.getByText(/title must not exceed 100 characters/i)).toBeInTheDocument()

      // Clear and type valid title
      await user.clear(titleInput)
      await user.type(titleInput, 'Valid Task')

      // Type a very long description
      const descriptionInput = screen.getByLabelText(/description/i)
      const longDescription = 'a'.repeat(501)
      await user.type(descriptionInput, longDescription)
      await user.click(submitButton)

      // Should show description length validation error
      expect(screen.getByText(/description must not exceed 500 characters/i)).toBeInTheDocument()
    })
  })

  describe('User Journey: Canceling Actions', () => {
    it('should allow canceling task creation', async () => {
      const user = userEvent.setup()
      render(<TaskManagementPage />)

      const createButton = screen.getByRole('button', { name: /new task/i })
      await user.click(createButton)

      // Start filling form
      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Task to Cancel')

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      // Form should close without creating task
      expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument()
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
    })

    it('should allow canceling task deletion', async () => {
      const user = userEvent.setup()
      render(<TaskManagementPage />)

      // Create a task first
      const createButton = screen.getByRole('button', { name: /new task/i })
      await user.click(createButton)

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Task to Keep')
      await user.click(screen.getByRole('button', { name: /create task/i }))

      // Click delete
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      // Confirmation modal appears
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      // Click cancel
      const cancelModalButton = within(screen.getByRole('dialog')).getByRole('button', { name: /cancel/i })
      await user.click(cancelModalButton)

      // Task should still be in list
      expect(screen.getByText('Task to Keep')).toBeInTheDocument()
    })

    it('should allow canceling task edit', async () => {
      const user = userEvent.setup()
      render(<TaskManagementPage />)

      // Create a task
      const createButton = screen.getByRole('button', { name: /new task/i })
      await user.click(createButton)

      let titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Original Task')
      await user.click(screen.getByRole('button', { name: /create task/i }))

      // Click edit
      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      // Modify title
      titleInput = screen.getByLabelText(/title/i)
      await user.clear(titleInput)
      await user.type(titleInput, 'Modified Task')

      // Cancel edit
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      // Original task should remain unchanged
      expect(screen.getByText('Original Task')).toBeInTheDocument()
      expect(screen.queryByText('Modified Task')).not.toBeInTheDocument()
    })
  })

  describe('User Journey: Toggle Task Completion', () => {
    it('should allow toggling task completion status multiple times', async () => {
      const user = userEvent.setup()
      render(<TaskManagementPage />)

      // Create a task
      const createButton = screen.getByRole('button', { name: /new task/i })
      await user.click(createButton)

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Toggle Task')
      await user.click(screen.getByRole('button', { name: /create task/i }))

      const checkbox = screen.getByRole('checkbox')

      // Initially unchecked
      expect(checkbox).not.toBeChecked()

      // Complete task
      await user.click(checkbox)
      expect(checkbox).toBeChecked()
      expect(screen.getByText(/completed on/i)).toBeInTheDocument()

      // Uncomplete task
      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
      expect(screen.queryByText(/completed on/i)).not.toBeInTheDocument()

      // Complete again
      await user.click(checkbox)
      expect(checkbox).toBeChecked()
    })
  })

  describe('User Journey: Character Count Feedback', () => {
    it('should show real-time character count while typing', async () => {
      const user = userEvent.setup()
      render(<TaskManagementPage />)

      const createButton = screen.getByRole('button', { name: /new task/i })
      await user.click(createButton)

      // Initial character count
      expect(screen.getByText(/0\/100/)).toBeInTheDocument()
      expect(screen.getByText(/0\/500/)).toBeInTheDocument()

      // Type in title
      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Hello')
      expect(screen.getByText(/5\/100/)).toBeInTheDocument()

      // Type in description
      const descriptionInput = screen.getByLabelText(/description/i)
      await user.type(descriptionInput, 'Description here')
      expect(screen.getByText(/16\/500/)).toBeInTheDocument()
    })
  })

  describe('Accessibility: Keyboard Navigation', () => {
    it('should allow keyboard-only task management', async () => {
      const user = userEvent.setup()
      render(<TaskManagementPage />)

      // Tab to create button and press Enter
      await user.keyboard('{Tab}')
      await user.keyboard('{Enter}')

      // Fill form using keyboard
      await user.keyboard('My Task{Tab}')
      await user.keyboard('My Description{Tab}')

      // Submit form
      await user.keyboard('{Enter}')

      // Task should be created
      expect(screen.getByText('My Task')).toBeInTheDocument()

      // Navigate to checkbox and toggle
      const checkbox = screen.getByRole('checkbox')
      checkbox.focus()
      await user.keyboard(' ')

      // Should be checked
      expect(checkbox).toBeChecked()
    })

    it('should close modal with Escape key', async () => {
      const user = userEvent.setup()
      render(<TaskManagementPage />)

      const createButton = screen.getByRole('button', { name: /new task/i })
      await user.click(createButton)

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()

      await user.keyboard('{Escape}')

      expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument()
    })
  })
})
