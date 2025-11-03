/**
 * TaskItem Component Tests
 * EPIC 1: Task Management Core
 *
 * User Story 1.4: Delete Task
 * User Story 1.5: Mark Task Complete
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskItem } from '../components/TaskItem'
import { TaskStatus, type Task } from '../types/task.types'

describe('TaskItem Component', () => {
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnToggleComplete = vi.fn()

  const pendingTask: Task = {
    id: '1',
    title: 'Pending Task',
    description: 'This is a pending task',
    status: TaskStatus.PENDING,
    createdAt: new Date('2024-01-01T10:00:00'),
    updatedAt: new Date('2024-01-01T10:00:00'),
    completedAt: null,
  }

  const completedTask: Task = {
    id: '2',
    title: 'Completed Task',
    description: 'This is a completed task',
    status: TaskStatus.COMPLETED,
    createdAt: new Date('2024-01-01T10:00:00'),
    updatedAt: new Date('2024-01-01T11:00:00'),
    completedAt: new Date('2024-01-01T11:00:00'),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('User Story 1.5: Display Task Completion', () => {
    it('should render checkbox for task completion', () => {
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('should show unchecked checkbox for pending task', () => {
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('should show checked checkbox for completed task', () => {
      render(
        <TaskItem
          task={completedTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('should apply strikethrough style to completed task title', () => {
      render(
        <TaskItem
          task={completedTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const title = screen.getByText('Completed Task')
      expect(title).toHaveClass('line-through')
    })

    it('should not apply strikethrough to pending task title', () => {
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const title = screen.getByText('Pending Task')
      expect(title).not.toHaveClass('line-through')
    })

    it('should apply visual distinction to completed task (opacity)', () => {
      render(
        <TaskItem
          task={completedTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const taskContainer = screen.getByRole('article')
      expect(taskContainer).toHaveClass(/opacity/)
    })
  })

  describe('User Story 1.5: Toggle Task Completion', () => {
    it('should call onToggleComplete when checkbox is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(mockOnToggleComplete).toHaveBeenCalledWith('1')
      expect(mockOnToggleComplete).toHaveBeenCalledTimes(1)
    })

    it('should call onToggleComplete when checkbox is clicked on completed task', async () => {
      const user = userEvent.setup()
      render(
        <TaskItem
          task={completedTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(mockOnToggleComplete).toHaveBeenCalledWith('2')
    })

    it('should have accessible label for checkbox', () => {
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAccessibleName(/mark.*complete/i)
    })
  })

  describe('User Story 1.5: Display Completion Timestamp', () => {
    it('should display completion timestamp for completed task', () => {
      render(
        <TaskItem
          task={completedTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      expect(screen.getByText(/completed on/i)).toBeInTheDocument()
    })

    it('should not display completion timestamp for pending task', () => {
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      expect(screen.queryByText(/completed on/i)).not.toBeInTheDocument()
    })

    it('should format completion timestamp correctly', () => {
      render(
        <TaskItem
          task={completedTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      // Check for completion date specifically
      expect(screen.getByText(/completed on:/i)).toBeInTheDocument()
      expect(screen.getAllByText(/jan 1, 2024/i).length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('User Story 1.4: Display Delete Button', () => {
    it('should render delete button', () => {
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      expect(deleteButton).toBeInTheDocument()
    })

    it('should have accessible label for delete button', () => {
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      expect(deleteButton).toHaveAccessibleName()
    })

    it('should display delete icon', () => {
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      expect(deleteButton.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('User Story 1.4: Delete Task Action', () => {
    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      expect(mockOnDelete).toHaveBeenCalledWith('1')
      expect(mockOnDelete).toHaveBeenCalledTimes(1)
    })

    it('should pass correct task id to onDelete', async () => {
      const user = userEvent.setup()
      render(
        <TaskItem
          task={completedTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      expect(mockOnDelete).toHaveBeenCalledWith('2')
    })
  })

  describe('Edit Task Action', () => {
    it('should render edit button', () => {
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const editButton = screen.getByRole('button', { name: /edit/i })
      expect(editButton).toBeInTheDocument()
    })

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      expect(mockOnEdit).toHaveBeenCalledWith(pendingTask)
      expect(mockOnEdit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Task Information Display', () => {
    it('should display task title', () => {
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      expect(screen.getByText('Pending Task')).toBeInTheDocument()
    })

    it('should display task description', () => {
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      expect(screen.getByText('This is a pending task')).toBeInTheDocument()
    })

    it('should display creation date', () => {
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      expect(screen.getByText(/created/i)).toBeInTheDocument()
    })

    it('should display status badge', () => {
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      // Check for status badge using role
      const statusBadge = screen.getByRole('status')
      expect(statusBadge).toBeInTheDocument()
      expect(statusBadge).toHaveTextContent(/pending/i)
    })
  })

  describe('Accessibility', () => {
    it('should use article element with accessible name', () => {
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const article = screen.getByRole('article')
      expect(article).toBeInTheDocument()
      expect(article).toHaveAccessibleName()
    })

    it('should have proper button labels', () => {
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      expect(screen.getByRole('button', { name: /edit/i })).toHaveAccessibleName()
      expect(screen.getByRole('button', { name: /delete/i })).toHaveAccessibleName()
    })

    it('should have proper heading structure', () => {
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Pending Task')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should allow keyboard interaction with checkbox', async () => {
      const user = userEvent.setup()
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      checkbox.focus()
      await user.keyboard(' ')

      expect(mockOnToggleComplete).toHaveBeenCalledWith('1')
    })

    it('should allow keyboard interaction with edit button', async () => {
      const user = userEvent.setup()
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const editButton = screen.getByRole('button', { name: /edit/i })
      editButton.focus()
      await user.keyboard('{Enter}')

      expect(mockOnEdit).toHaveBeenCalled()
    })

    it('should allow keyboard interaction with delete button', async () => {
      const user = userEvent.setup()
      render(
        <TaskItem
          task={pendingTask}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      deleteButton.focus()
      await user.keyboard('{Enter}')

      expect(mockOnDelete).toHaveBeenCalled()
    })
  })
})
