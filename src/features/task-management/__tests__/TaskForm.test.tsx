/**
 * TaskForm Component Tests
 * EPIC 1: Task Management Core
 *
 * User Story 1.1: Create Task
 * User Story 1.3: Edit Task
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskForm } from '../components/TaskForm'
import type { Task } from '../types/task.types'
import { TaskStatus } from '../types/task.types'

describe('TaskForm Component', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('User Story 1.1: Create Task - Form Rendering', () => {
    it('should render create form with title input', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/title/i)
      expect(titleInput).toBeInTheDocument()
      expect(titleInput).toHaveAttribute('type', 'text')
    })

    it('should render create form with description textarea', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const descriptionInput = screen.getByLabelText(/description/i)
      expect(descriptionInput).toBeInTheDocument()
      expect(descriptionInput.tagName).toBe('TEXTAREA')
    })

    it('should render submit button', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const submitButton = screen.getByRole('button', { name: /create task/i })
      expect(submitButton).toBeInTheDocument()
    })

    it('should render cancel button', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).toBeInTheDocument()
    })

    it('should show "Create Task" as heading in create mode', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const heading = screen.getByRole('heading', { name: /create task/i })
      expect(heading).toBeInTheDocument()
    })

    it('should mark title as required field', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/title/i)
      expect(titleInput).toHaveAttribute('required')
    })

    it('should not mark description as required', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const descriptionInput = screen.getByLabelText(/description/i)
      expect(descriptionInput).not.toHaveAttribute('required')
    })
  })

  describe('User Story 1.1: Create Task - User Interaction', () => {
    it('should allow user to input task title', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'New Task Title')
      

      expect(titleInput).toHaveValue('New Task Title')
    })

    it('should allow user to input task description', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const descriptionInput = screen.getByLabelText(/description/i)
      await user.type(descriptionInput, 'Task description here')

      expect(descriptionInput).toHaveValue('Task description here')
    })

    it('should call onSubmit with task data when form is submitted', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const submitButton = screen.getByRole('button', { name: /create task/i })

      await user.type(titleInput, 'My Task')
      await user.type(descriptionInput, 'My Description')
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'My Task',
        description: 'My Description',
        priority: 'medium',
        dueDate: null,
      })
    })

    it('should call onSubmit with empty description when not provided', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/title/i)
      const submitButton = screen.getByRole('button', { name: /create task/i })

      await user.type(titleInput, 'My Task')
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'My Task',
        description: '',
        priority: 'medium',
        dueDate: null,
      })
    })

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const submitButton = screen.getByRole('button', { name: /create task/i })

      await user.type(titleInput, 'Task Title')
      await user.type(descriptionInput, 'Task Description')
      await user.click(submitButton)

      expect(titleInput).toHaveValue('')
      expect(descriptionInput).toHaveValue('')
    })
  })

  describe('User Story 1.1: Create Task - Validation', () => {
    it('should show error when submitting without title', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)

      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should show error when title exceeds 100 characters', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/title/i)
      const longTitle = 'a'.repeat(101)

      await user.type(titleInput, longTitle)
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)

      expect(screen.getByText(/title must not exceed 100 characters/i)).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should allow title with exactly 100 characters', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/title/i)
      const maxTitle = 'a'.repeat(100)

      await user.type(titleInput, maxTitle)
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalled()
    })

    it('should show error when description exceeds 500 characters', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const longDescription = 'a'.repeat(501)

      await user.type(titleInput, 'Task')
      await user.type(descriptionInput, longDescription)
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)

      expect(screen.getByText(/description must not exceed 500 characters/i)).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should allow description with exactly 500 characters', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const maxDescription = 'a'.repeat(500)

      await user.type(titleInput, 'Task')
      await user.type(descriptionInput, maxDescription)
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalled()
    })

    it('should show character count for title', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      expect(screen.getByText(/0\/100/)).toBeInTheDocument()
    })

    it('should update character count as user types title', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Hello')

      expect(screen.getByText(/5\/100/)).toBeInTheDocument()
    })

    it('should show character count for description', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      expect(screen.getByText(/0\/500/)).toBeInTheDocument()
    })

    it('should update character count as user types description', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const descriptionInput = screen.getByLabelText(/description/i)
      await user.type(descriptionInput, 'Hello World')

      expect(screen.getByText(/11\/500/)).toBeInTheDocument()
    })
  })

  describe('User Story 1.3: Edit Task - Pre-filled Form', () => {
    const existingTask: Task = {
      id: '1',
      title: 'Existing Task',
      description: 'Existing Description',
      status: TaskStatus.PENDING,
      priority: 'medium' as any,
      dueDate: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      completedAt: null,
    }

    it('should render edit form with "Edit Task" heading', () => {
      render(
        <TaskForm
          task={existingTask}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const heading = screen.getByRole('heading', { name: /edit task/i })
      expect(heading).toBeInTheDocument()
    })

    it('should pre-fill title input with existing task title', () => {
      render(
        <TaskForm
          task={existingTask}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const titleInput = screen.getByLabelText(/title/i)
      expect(titleInput).toHaveValue('Existing Task')
    })

    it('should pre-fill description input with existing task description', () => {
      render(
        <TaskForm
          task={existingTask}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const descriptionInput = screen.getByLabelText(/description/i)
      expect(descriptionInput).toHaveValue('Existing Description')
    })

    it('should show "Update Task" button in edit mode', () => {
      render(
        <TaskForm
          task={existingTask}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const submitButton = screen.getByRole('button', { name: /update task/i })
      expect(submitButton).toBeInTheDocument()
    })

    it('should show correct character count for pre-filled title', () => {
      render(
        <TaskForm
          task={existingTask}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      // "Existing Task" = 13 characters
      expect(screen.getByText(/13\/100/)).toBeInTheDocument()
    })

    it('should show correct character count for pre-filled description', () => {
      render(
        <TaskForm
          task={existingTask}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      // "Existing Description" = 20 characters
      expect(screen.getByText(/20\/500/)).toBeInTheDocument()
    })
  })

  describe('User Story 1.3: Edit Task - Updating', () => {
    const existingTask: Task = {
      id: '1',
      title: 'Existing Task',
      description: 'Existing Description',
      status: TaskStatus.PENDING,
      priority: 'medium' as any,
      dueDate: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      completedAt: null,
    }

    it('should allow modifying the title', async () => {
      const user = userEvent.setup()
      render(
        <TaskForm
          task={existingTask}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const titleInput = screen.getByLabelText(/title/i)
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Task Title')

      expect(titleInput).toHaveValue('Updated Task Title')
    })

    it('should allow modifying the description', async () => {
      const user = userEvent.setup()
      render(
        <TaskForm
          task={existingTask}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const descriptionInput = screen.getByLabelText(/description/i)
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'Updated Description')

      expect(descriptionInput).toHaveValue('Updated Description')
    })

    it('should call onSubmit with updated data', async () => {
      const user = userEvent.setup()
      render(
        <TaskForm
          task={existingTask}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const submitButton = screen.getByRole('button', { name: /update task/i })

      await user.clear(titleInput)
      await user.type(titleInput, 'New Title')
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'New Description')
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Title',
        description: 'New Description',
        priority: 'medium',
        dueDate: null,
      })
    })

    it('should allow updating only the title', async () => {
      const user = userEvent.setup()
      render(
        <TaskForm
          task={existingTask}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const titleInput = screen.getByLabelText(/title/i)
      const submitButton = screen.getByRole('button', { name: /update task/i })

      await user.clear(titleInput)
      await user.type(titleInput, 'Only Title Changed')
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Only Title Changed',
        description: 'Existing Description',
        priority: 'medium',
        dueDate: null,
      })
    })

    it('should allow updating only the description', async () => {
      const user = userEvent.setup()
      render(
        <TaskForm
          task={existingTask}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const descriptionInput = screen.getByLabelText(/description/i)
      const submitButton = screen.getByRole('button', { name: /update task/i })

      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'Only Description Changed')
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Existing Task',
        description: 'Only Description Changed',
        priority: 'medium',
        dueDate: null,
      })
    })

    it('should not reset form after update submission in edit mode', async () => {
      const user = userEvent.setup()
      render(
        <TaskForm
          task={existingTask}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const titleInput = screen.getByLabelText(/title/i)
      const submitButton = screen.getByRole('button', { name: /update task/i })

      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Title')
      await user.click(submitButton)

      expect(titleInput).toHaveValue('Updated Title')
    })
  })

  describe('User Story 1.3: Edit Task - Cancellation', () => {
    const existingTask: Task = {
      id: '1',
      title: 'Existing Task',
      description: 'Existing Description',
      status: TaskStatus.PENDING,
      priority: 'medium' as any,
      dueDate: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      completedAt: null,
    }

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TaskForm
          task={existingTask}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should not submit when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TaskForm
          task={existingTask}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const titleInput = screen.getByLabelText(/title/i)
      await user.clear(titleInput)
      await user.type(titleInput, 'Changed Title')

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)

      expect(titleInput).toHaveAccessibleName()
      expect(descriptionInput).toHaveAccessibleName()
    })

    it('should associate error messages with inputs', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)

      const titleInput = screen.getByLabelText(/title/i)
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()

      expect(titleInput).toHaveAccessibleDescription()
      expect(titleInput).toHaveAttribute('aria-invalid', 'true')
    })
  })
})
