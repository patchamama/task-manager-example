import React from 'react'
/**
 * Task Due Dates UI Tests - EPIC 2
 * User Story 2.5: Add Due Dates
 *
 * Tests the UI for due date selection and display
 * Including date picker and overdue indicators
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { TaskForm } from '../components/TaskForm'
import { TaskItem } from '../components/TaskItem'
import { TaskList } from '../components/TaskList'
import { TaskStatus, type Task } from '../types/task.types'

// Extended Task type with due date
type TaskWithDueDate = Task & {
        priority: 'medium' as any,
  dueDate: Date | null
}

describe('User Story 2.5: Due Dates UI', () => {
  const renderWithRouter = render
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('TaskForm - Due Date Picker', () => {
    const mockOnSubmit = vi.fn()
    const mockOnCancel = vi.fn()

    it('should render due date picker in create form', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const dueDateInput = screen.getByLabelText(/due date/i)
      expect(dueDateInput).toBeInTheDocument()
    })

    it('should have date input type', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const dueDateInput = screen.getByLabelText(/due date/i)
      expect(dueDateInput).toHaveAttribute('type', 'date')
    })

    it('should mark due date as optional', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const dueDateInput = screen.getByLabelText(/due date/i)
      expect(dueDateInput).not.toHaveAttribute('required')
    })

    it('should show "Optional" text for due date field', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      expect(screen.getByText(/due date.*optional/i)).toBeInTheDocument()
    })

    it('should allow user to select a due date', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const dueDateInput = screen.getByLabelText(/due date/i)
      await user.type(dueDateInput, '2024-01-20')

      expect(dueDateInput).toHaveValue('2024-01-20')
    })

    it('should submit form with selected due date', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/title/i)
      const dueDateInput = screen.getByLabelText(/due date/i)
      const submitButton = screen.getByRole('button', { name: /create task/i })

      await user.type(titleInput, 'Task with due date')
      await user.type(dueDateInput, '2024-01-20')
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Task with due date',
        priority: 'medium' as any,
          dueDate: expect.any(Date),
        })
      )
    })

    it('should submit form without due date when not provided', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/title/i)
      const submitButton = screen.getByRole('button', { name: /create task/i })

      await user.type(titleInput, 'Task without due date')
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Task without due date',
        priority: 'medium' as any,
          dueDate: null,
        })
      )
    })

    it('should show clear button when due date is selected', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const dueDateInput = screen.getByLabelText(/due date/i)
      await user.type(dueDateInput, '2024-01-20')

      const clearButton = screen.getByRole('button', { name: /clear due date/i })
      expect(clearButton).toBeInTheDocument()
    })

    it('should clear due date when clear button is clicked', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const dueDateInput = screen.getByLabelText(/due date/i)
      await user.type(dueDateInput, '2024-01-20')

      const clearButton = screen.getByRole('button', { name: /clear due date/i })
      await user.click(clearButton)

      expect(dueDateInput).toHaveValue('')
    })

    it('should pre-fill due date when editing task', () => {
      const existingTask: TaskWithDueDate = {
        id: '1',
        title: 'Existing Task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: 'medium' as any,
        dueDate: new Date('2024-01-20'),
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          // @ts-expect-error - initialValues doesn't support dueDate yet
          initialValues={existingTask}
        />
      )

      const dueDateInput = screen.getByLabelText(/due date/i) as HTMLInputElement
      expect(dueDateInput.value).toBe('2024-01-20')
    })

    it('should validate due date is not in past', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/title/i)
      const dueDateInput = screen.getByLabelText(/due date/i)
      const submitButton = screen.getByRole('button', { name: /create task/i })

      await user.type(titleInput, 'Task')
      await user.type(dueDateInput, '2024-01-10') // Past date
      await user.click(submitButton)

      expect(screen.getByText(/due date cannot be in the past/i)).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should allow today as due date', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/title/i)
      const dueDateInput = screen.getByLabelText(/due date/i)
      const submitButton = screen.getByRole('button', { name: /create task/i })

      await user.type(titleInput, 'Task')
      await user.type(dueDateInput, '2024-01-15') // Today
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalled()
    })

    it('should set min date attribute to today', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const dueDateInput = screen.getByLabelText(/due date/i)
      expect(dueDateInput).toHaveAttribute('min', '2024-01-15')
    })
  })

  describe('TaskItem - Due Date Display', () => {
    const mockOnEdit = vi.fn()
    const mockOnDelete = vi.fn()
    const mockOnToggleComplete = vi.fn()

    it('should display due date for task with due date', () => {
      const task: TaskWithDueDate = {
        id: '1',
        title: 'Task with due date',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: 'medium' as any,
        dueDate: new Date('2024-01-20'),
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support dueDate yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      expect(screen.getByText(/due.*jan.*20/i)).toBeInTheDocument()
    })

    it('should not display due date section for task without due date', () => {
      const task: TaskWithDueDate = {
        id: '1',
        title: 'Task without due date',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: 'medium' as any,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support dueDate yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      expect(screen.queryByText(/due/i)).not.toBeInTheDocument()
    })

    it('should highlight overdue task in red', () => {
      const task: TaskWithDueDate = {
        id: '1',
        title: 'Overdue task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: 'medium' as any,
        dueDate: new Date('2024-01-10'), // Past date
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support dueDate yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const dueDateElement = screen.getByText(/due.*jan.*10/i)
      expect(dueDateElement).toHaveClass('text-red-600')
    })

    it('should show "Overdue" label for overdue tasks', () => {
      const task: TaskWithDueDate = {
        id: '1',
        title: 'Overdue task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: 'medium' as any,
        dueDate: new Date('2024-01-10'),
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support dueDate yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      expect(screen.getByText(/overdue/i)).toBeInTheDocument()
    })

    it('should not highlight completed overdue tasks', () => {
      const task: TaskWithDueDate = {
        id: '1',
        title: 'Completed overdue task',
        description: 'Description',
        status: TaskStatus.COMPLETED,
        priority: 'medium' as any,
        dueDate: new Date('2024-01-10'),
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: new Date(),
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support dueDate yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const dueDateElement = screen.getByText(/due.*jan.*10/i)
      expect(dueDateElement).not.toHaveClass('text-red-600')
    })

    it('should show relative date for tasks due soon', () => {
      const tomorrow = new Date('2024-01-16')
      const task: TaskWithDueDate = {
        id: '1',
        title: 'Task due tomorrow',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: 'medium' as any,
        dueDate: tomorrow,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support dueDate yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      expect(screen.getByText(/tomorrow/i)).toBeInTheDocument()
    })

    it('should show "Due today" for tasks due today', () => {
      const today = new Date('2024-01-15')
      const task: TaskWithDueDate = {
        id: '1',
        title: 'Task due today',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: 'medium' as any,
        dueDate: today,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support dueDate yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      expect(screen.getByText(/due today/i)).toBeInTheDocument()
    })

    it('should display calendar icon with due date', () => {
      const task: TaskWithDueDate = {
        id: '1',
        title: 'Task with due date',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: 'medium' as any,
        dueDate: new Date('2024-01-20'),
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support dueDate yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const calendarIcon = screen.getByTestId('calendar-icon')
      expect(calendarIcon).toBeInTheDocument()
    })
  })

  describe('TaskList - Due Date Sorting', () => {
    const tasks: TaskWithDueDate[] = [
      {
        id: '1',
        title: 'Task A',
        description: 'Due later',
        status: TaskStatus.PENDING,
        priority: 'medium' as any,
        dueDate: new Date('2024-01-25'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        completedAt: null,
      },
      {
        id: '2',
        title: 'Task B',
        description: 'Due soon',
        status: TaskStatus.PENDING,
        priority: 'medium' as any,
        dueDate: new Date('2024-01-18'),
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        completedAt: null,
      },
      {
        id: '3',
        title: 'Task C',
        description: 'No due date',
        status: TaskStatus.PENDING,
        priority: 'medium' as any,
        dueDate: null,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        completedAt: null,
      },
    ]

    it('should include "Due Date" in sort options', () => {
      // @ts-expect-error - tasks prop doesn't support dueDate yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const sortSelect = screen.getByLabelText(/sort by/i)
      expect(within(sortSelect).getByRole('option', { name: /due date/i })).toBeInTheDocument()
    })

    it('should sort by due date ascending (soonest first)', async () => {
      const user = userEvent.setup()
      // @ts-expect-error - tasks prop doesn't support dueDate yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'dueDate')

      const directionButton = screen.getByRole('button', { name: /sort direction/i })
      await user.click(directionButton) // Set to ASC

      const taskElements = screen.getAllByRole('article')
      expect(taskElements[0]).toHaveTextContent('Task B') // Jan 18
      expect(taskElements[1]).toHaveTextContent('Task A') // Jan 25
      expect(taskElements[2]).toHaveTextContent('Task C') // No date (last)
    })

    it('should place tasks without due date at end when sorting', async () => {
      const user = userEvent.setup()
      // @ts-expect-error - tasks prop doesn't support dueDate yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'dueDate')

      const taskElements = screen.getAllByRole('article')
      const lastTask = taskElements[taskElements.length - 1]
      expect(lastTask).toHaveTextContent('Task C')
    })
  })

  describe('Overdue Badge', () => {
    it('should show overdue count badge when there are overdue tasks', () => {
      const tasks: TaskWithDueDate[] = [
        {
          id: '1',
          title: 'Overdue 1',
          description: '',
          status: TaskStatus.PENDING,
        priority: 'medium' as any,
          dueDate: new Date('2024-01-10'),
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: null,
        },
        {
          id: '2',
          title: 'Overdue 2',
          description: '',
          status: TaskStatus.PENDING,
        priority: 'medium' as any,
          dueDate: new Date('2024-01-12'),
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: null,
        },
      ]

      // @ts-expect-error - tasks prop doesn't support dueDate yet
      renderWithRouter(<TaskList tasks={tasks} />)

      expect(screen.getByText(/2.*overdue/i)).toBeInTheDocument()
    })

    it('should not show overdue badge when no tasks are overdue', () => {
      const tasks: TaskWithDueDate[] = [
        {
          id: '1',
          title: 'Future Task',
          description: '',
          status: TaskStatus.PENDING,
        priority: 'medium' as any,
          dueDate: new Date('2024-01-20'),
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: null,
        },
      ]

      // @ts-expect-error - tasks prop doesn't support dueDate yet
      renderWithRouter(<TaskList tasks={tasks} />)

      expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible label for due date input', () => {
      const mockOnSubmit = vi.fn()
      const mockOnCancel = vi.fn()

      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const dueDateInput = screen.getByLabelText(/due date/i)
      expect(dueDateInput).toHaveAttribute('aria-label')
    })

    it('should announce overdue status to screen readers', () => {
      const mockOnEdit = vi.fn()
      const mockOnDelete = vi.fn()
      const mockOnToggleComplete = vi.fn()

      const task: TaskWithDueDate = {
        id: '1',
        title: 'Overdue task',
        description: '',
        status: TaskStatus.PENDING,
        priority: 'medium' as any,
        dueDate: new Date('2024-01-10'),
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskItem
          // @ts-expect-error - task prop doesn't support dueDate yet
          task={task}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const overdueLabel = screen.getByLabelText(/overdue/i)
      expect(overdueLabel).toHaveAttribute('aria-live', 'polite')
    })

    it('should support keyboard navigation in date picker', () => {
      const mockOnSubmit = vi.fn()
      const mockOnCancel = vi.fn()

      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const dueDateInput = screen.getByLabelText(/due date/i)
      expect(dueDateInput).not.toHaveAttribute('tabindex', '-1')
    })
  })
})
