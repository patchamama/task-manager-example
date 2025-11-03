/**
 * TaskList Component Tests
 * EPIC 1: Task Management Core
 *
 * User Story 1.2: View Task List
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskList } from '../components/TaskList'
import { TaskStatus, type Task } from '../types/task.types'

describe('TaskList Component', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'First Task',
      description: 'This is the first task description',
      status: TaskStatus.PENDING,
      createdAt: new Date('2024-01-03T10:00:00'),
      updatedAt: new Date('2024-01-03T10:00:00'),
      completedAt: null,
    },
    {
      id: '2',
      title: 'Second Task',
      description: 'This is the second task description that is quite a bit longer and should be truncated in the preview',
      status: TaskStatus.COMPLETED,
      createdAt: new Date('2024-01-02T10:00:00'),
      updatedAt: new Date('2024-01-02T10:00:00'),
      completedAt: new Date('2024-01-02T11:00:00'),
    },
    {
      id: '3',
      title: 'Third Task',
      description: '',
      status: TaskStatus.PENDING,
      createdAt: new Date('2024-01-01T10:00:00'),
      updatedAt: new Date('2024-01-01T10:00:00'),
      completedAt: null,
    },
  ]

  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnToggleComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('User Story 1.2: Empty State', () => {
    it('should display empty state when no tasks exist', () => {
      render(
        <TaskList
          tasks={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
    })

    it('should display message to create first task in empty state', () => {
      render(
        <TaskList
          tasks={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      expect(screen.getByText(/create your first task/i)).toBeInTheDocument()
    })

    it('should not display task items when tasks array is empty', () => {
      render(
        <TaskList
          tasks={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      expect(screen.queryByRole('article')).not.toBeInTheDocument()
    })
  })

  describe('User Story 1.2: Display Tasks', () => {
    it('should display all tasks in a list', () => {
      render(
        <TaskList
          tasks={mockTasks}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      expect(screen.getByText('First Task')).toBeInTheDocument()
      expect(screen.getByText('Second Task')).toBeInTheDocument()
      expect(screen.getByText('Third Task')).toBeInTheDocument()
    })

    it('should display task titles', () => {
      render(
        <TaskList
          tasks={mockTasks}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const taskItems = screen.getAllByRole('article')
      expect(taskItems).toHaveLength(3)
    })

    it('should display task description preview', () => {
      render(
        <TaskList
          tasks={mockTasks}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      expect(screen.getByText(/This is the first task description/)).toBeInTheDocument()
    })

    it('should truncate long descriptions in preview', () => {
      render(
        <TaskList
          tasks={mockTasks}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      // Description should be truncated (e.g., max 100 chars with ellipsis)
      const descriptionPreview = screen.getByText(/This is the second task description/i)
      expect(descriptionPreview.textContent!.length).toBeLessThanOrEqual(103) // 100 chars + "..."
    })

    it('should display placeholder when task has no description', () => {
      render(
        <TaskList
          tasks={mockTasks}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      expect(screen.getByText(/no description/i)).toBeInTheDocument()
    })

    it('should display task status', () => {
      render(
        <TaskList
          tasks={mockTasks}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const completedBadges = screen.getAllByText(/completed/i)
      expect(completedBadges.length).toBeGreaterThan(0)
    })

    it('should display pending status for incomplete tasks', () => {
      render(
        <TaskList
          tasks={mockTasks}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const pendingBadges = screen.getAllByText(/pending/i)
      expect(pendingBadges.length).toBe(2) // Two pending tasks
    })
  })

  describe('User Story 1.2: Display Creation Date', () => {
    it('should display creation date for each task', () => {
      render(
        <TaskList
          tasks={mockTasks}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      // Should display formatted dates
      // Note: Some dates may appear multiple times (created + completed on same day)
      expect(screen.getByText(/jan 1, 2024/i)).toBeInTheDocument()
      expect(screen.getAllByText(/jan 2, 2024/i).length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText(/jan 3, 2024/i)).toBeInTheDocument()
    })

    it('should display creation time or relative time', () => {
      const recentTask: Task = {
        id: '4',
        title: 'Recent Task',
        description: '',
        status: TaskStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      render(
        <TaskList
          tasks={[recentTask]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      // Should show "just now", "5 minutes ago", etc.
      expect(screen.getByText(/just now|ago/i)).toBeInTheDocument()
    })
  })

  describe('User Story 1.2: Sort by Creation Date (Newest First)', () => {
    it('should display tasks sorted by creation date with newest first', () => {
      render(
        <TaskList
          tasks={mockTasks}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const taskItems = screen.getAllByRole('article')
      const firstTaskTitle = taskItems[0].querySelector('h3')?.textContent
      const lastTaskTitle = taskItems[2].querySelector('h3')?.textContent

      // First Task (2024-01-03) should be displayed first
      expect(firstTaskTitle).toBe('First Task')
      // Third Task (2024-01-01) should be displayed last
      expect(lastTaskTitle).toBe('Third Task')
    })

    it('should maintain sort order when tasks are already sorted', () => {
      const sortedTasks = [...mockTasks].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )

      render(
        <TaskList
          tasks={sortedTasks}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const taskItems = screen.getAllByRole('article')
      const titles = taskItems.map((item) => item.querySelector('h3')?.textContent)

      expect(titles).toEqual(['First Task', 'Second Task', 'Third Task'])
    })
  })

  describe('User Story 1.2: Task Actions', () => {
    it('should display edit button for each task', () => {
      render(
        <TaskList
          tasks={mockTasks}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      expect(editButtons).toHaveLength(3)
    })

    it('should display delete button for each task', () => {
      render(
        <TaskList
          tasks={mockTasks}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      expect(deleteButtons).toHaveLength(3)
    })

    it('should display checkbox for each task', () => {
      render(
        <TaskList
          tasks={mockTasks}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(3)
    })
  })

  describe('Accessibility', () => {
    it('should use semantic list markup', () => {
      render(
        <TaskList
          tasks={mockTasks}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const list = screen.getByRole('list')
      expect(list).toBeInTheDocument()
    })

    it('should mark each task as an article with accessible name', () => {
      render(
        <TaskList
          tasks={mockTasks}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const articles = screen.getAllByRole('article')
      articles.forEach((article) => {
        expect(article).toHaveAccessibleName()
      })
    })

    it('should have accessible labels for action buttons', () => {
      render(
        <TaskList
          tasks={mockTasks}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
        />
      )

      const editButton = screen.getAllByRole('button', { name: /edit/i })[0]
      const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0]

      expect(editButton).toHaveAccessibleName()
      expect(deleteButton).toHaveAccessibleName()
    })
  })

  describe('Loading State', () => {
    it('should display loading state when isLoading prop is true', () => {
      render(
        <TaskList
          tasks={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
          isLoading={true}
        />
      )

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should display skeleton items while loading', () => {
      render(
        <TaskList
          tasks={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleComplete={mockOnToggleComplete}
          isLoading={true}
        />
      )

      const skeletons = screen.getAllByTestId('task-skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })
})
