/**
 * Task Priority UI Tests - EPIC 2
 * User Story 2.1: Add Task Priority
 *
 * Tests the UI for priority selection and display
 * Including color coding and accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskForm } from '../components/TaskForm'
import { TaskItem } from '../components/TaskItem'
import { TaskStatus, type Task } from '../types/task.types'

// Type extensions for EPIC 2
enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Extended Task type with priority
type TaskWithPriority = Task & {
  priority: TaskPriority
}

describe('User Story 2.1: Priority UI Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('TaskForm - Priority Selection', () => {
    const mockOnSubmit = vi.fn()
    const mockOnCancel = vi.fn()

    it('should render priority selector in create form', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const prioritySelect = screen.getByLabelText(/priority/i)
      expect(prioritySelect).toBeInTheDocument()
    })

    it('should show all priority options: Low, Medium, High, Critical', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      expect(screen.getByRole('option', { name: /low/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /medium/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /high/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /critical/i })).toBeInTheDocument()
    })

    it('should default to Medium priority', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const prioritySelect = screen.getByLabelText(/priority/i) as HTMLSelectElement
      expect(prioritySelect.value).toBe('medium')
    })

    it('should allow user to select Low priority', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const prioritySelect = screen.getByLabelText(/priority/i)
      await user.selectOptions(prioritySelect, 'low')

      expect(prioritySelect).toHaveValue('low')
    })

    it('should allow user to select High priority', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const prioritySelect = screen.getByLabelText(/priority/i)
      await user.selectOptions(prioritySelect, 'high')

      expect(prioritySelect).toHaveValue('high')
    })

    it('should allow user to select Critical priority', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const prioritySelect = screen.getByLabelText(/priority/i)
      await user.selectOptions(prioritySelect, 'critical')

      expect(prioritySelect).toHaveValue('critical')
    })

    it('should submit form with selected priority', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/title/i)
      const prioritySelect = screen.getByLabelText(/priority/i)
      const submitButton = screen.getByRole('button', { name: /create task/i })

      await user.type(titleInput, 'High priority task')
      await user.selectOptions(prioritySelect, 'high')
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'High priority task',
          priority: 'high',
        })
      )
    })

    it('should pre-fill priority when editing task', () => {
      const existingTask: TaskWithPriority = {
        id: '1',
        title: 'Existing Task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.CRITICAL,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          // @ts-expect-error - initialValues doesn't support priority yet
          initialValues={existingTask}
        />
      )

      const prioritySelect = screen.getByLabelText(/priority/i) as HTMLSelectElement
      expect(prioritySelect.value).toBe('critical')
    })

    it('should allow changing priority when editing', async () => {
      const user = userEvent.setup()
      const existingTask: TaskWithPriority = {
        id: '1',
        title: 'Existing Task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.LOW,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          // @ts-expect-error - initialValues doesn't support priority yet
          initialValues={existingTask}
        />
      )

      const prioritySelect = screen.getByLabelText(/priority/i)
      await user.selectOptions(prioritySelect, 'high')

      const submitButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'high',
        })
      )
    })
  })

  describe('TaskItem - Priority Display', () => {
    const mockOnEdit = vi.fn()
    const mockOnDelete = vi.fn()
    const mockOnToggleComplete = vi.fn()

    it('should display priority badge for LOW priority task', () => {
      const task: TaskWithPriority = {
        id: '1',
        title: 'Low Priority Task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.LOW,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support priority yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const priorityBadge = screen.getByText(/low/i)
      expect(priorityBadge).toBeInTheDocument()
    })

    it('should display priority badge for MEDIUM priority task', () => {
      const task: TaskWithPriority = {
        id: '1',
        title: 'Medium Priority Task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support priority yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const priorityBadge = screen.getByText(/medium/i)
      expect(priorityBadge).toBeInTheDocument()
    })

    it('should display priority badge for HIGH priority task', () => {
      const task: TaskWithPriority = {
        id: '1',
        title: 'High Priority Task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support priority yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const priorityBadge = screen.getByText(/high/i)
      expect(priorityBadge).toBeInTheDocument()
    })

    it('should display priority badge for CRITICAL priority task', () => {
      const task: TaskWithPriority = {
        id: '1',
        title: 'Critical Priority Task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.CRITICAL,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support priority yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const priorityBadge = screen.getByText(/critical/i)
      expect(priorityBadge).toBeInTheDocument()
    })

    it('should apply color coding to LOW priority (text-blue-600 bg-blue-50)', () => {
      const task: TaskWithPriority = {
        id: '1',
        title: 'Low Priority Task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.LOW,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support priority yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const priorityBadge = screen.getByText(/low/i)
      expect(priorityBadge).toHaveClass('text-blue-600', 'bg-blue-50')
    })

    it('should apply color coding to MEDIUM priority (text-green-600 bg-green-50)', () => {
      const task: TaskWithPriority = {
        id: '1',
        title: 'Medium Priority Task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support priority yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const priorityBadge = screen.getByText(/medium/i)
      expect(priorityBadge).toHaveClass('text-green-600', 'bg-green-50')
    })

    it('should apply color coding to HIGH priority (text-orange-600 bg-orange-50)', () => {
      const task: TaskWithPriority = {
        id: '1',
        title: 'High Priority Task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support priority yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const priorityBadge = screen.getByText(/high/i)
      expect(priorityBadge).toHaveClass('text-orange-600', 'bg-orange-50')
    })

    it('should apply color coding to CRITICAL priority (text-red-600 bg-red-50)', () => {
      const task: TaskWithPriority = {
        id: '1',
        title: 'Critical Priority Task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.CRITICAL,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support priority yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const priorityBadge = screen.getByText(/critical/i)
      expect(priorityBadge).toHaveClass('text-red-600', 'bg-red-50')
    })

    it('should include icon with priority badge for accessibility (not color-only)', () => {
      const task: TaskWithPriority = {
        id: '1',
        title: 'High Priority Task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support priority yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      // Check for icon element within priority badge
      const priorityBadge = screen.getByText(/high/i).closest('[data-testid*="priority"]')
      expect(priorityBadge).toBeInTheDocument()

      // Icon should be present (using aria-hidden for decorative icon)
      const icon = priorityBadge?.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })

    it('should have accessible label for priority', () => {
      const task: TaskWithPriority = {
        id: '1',
        title: 'Critical Priority Task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.CRITICAL,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support priority yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      // Priority should have aria-label or similar
      const priorityElement = screen.getByLabelText(/priority.*critical/i)
      expect(priorityElement).toBeInTheDocument()
    })
  })
})
