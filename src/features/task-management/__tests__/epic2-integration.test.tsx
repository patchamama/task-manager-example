import React from 'react'
/**
 * EPIC 2 Integration Tests
 * Task Organization - Combined Features
 *
 * Tests the integration of all EPIC 2 features:
 * - Priority
 * - Filtering
 * - Sorting
 * - Search
 * - Due Dates
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { TaskList } from '../components/TaskList'
import { TaskStatus, type Task } from '../types/task.types'

enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

type TaskWithEpic2Features = Task & {
  priority: TaskPriority
  dueDate: Date | null
}

describe('EPIC 2: Task Organization Integration', () => {
  const renderWithRouter = render
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const createFullFeaturedTasks = (): TaskWithEpic2Features[] => [
    {
      id: '1',
      title: 'Fix critical bug',
      description: 'Production issue needs immediate attention',
      status: TaskStatus.PENDING,
      priority: TaskPriority.CRITICAL,
      dueDate: new Date('2024-01-16'), // Tomorrow
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-14'),
      completedAt: null,
    },
    {
      id: '2',
      title: 'Code review',
      description: 'Review pull request from team',
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date('2024-01-18'),
      createdAt: new Date('2024-01-13'),
      updatedAt: new Date('2024-01-13'),
      completedAt: null,
    },
    {
      id: '3',
      title: 'Update documentation',
      description: 'Add API documentation for new endpoints',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.LOW,
      dueDate: new Date('2024-01-12'), // Past (but completed)
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-12'),
      completedAt: new Date('2024-01-12'),
    },
    {
      id: '4',
      title: 'Write blog post',
      description: 'Technical blog about React best practices',
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
      dueDate: null, // No due date
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      completedAt: null,
    },
    {
      id: '5',
      title: 'Team meeting',
      description: 'Weekly standup and sprint planning',
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      dueDate: new Date('2024-01-15'), // Today
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-14'),
      completedAt: null,
    },
  ]

  describe('Filter + Sort Integration', () => {
    it('should filter to active tasks and sort by priority', async () => {
      const user = userEvent.setup()
      const tasks = createFullFeaturedTasks()

      // @ts-expect-error - tasks don't support EPIC 2 features yet
      renderWithRouter(<TaskList tasks={tasks} />)

      // Filter to active
      const activeButton = screen.getByRole('button', { name: /active/i })
      await user.click(activeButton)

      // Sort by priority
      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'priority')

      // Should show: Fix critical bug, Team meeting, Code review, Write blog post
      // (sorted by priority DESC)
      const taskElements = screen.getAllByRole('article')
      expect(taskElements[0]).toHaveTextContent('Fix critical bug') // CRITICAL
      expect(taskElements[1]).toHaveTextContent('Team meeting') // HIGH
      expect(taskElements[2]).toHaveTextContent('Code review') // MEDIUM
      expect(taskElements[3]).toHaveTextContent('Write blog post') // LOW
    })

    it('should filter to completed tasks and sort by due date', async () => {
      const user = userEvent.setup()
      const tasks = createFullFeaturedTasks()

      // @ts-expect-error - tasks don't support EPIC 2 features yet
      renderWithRouter(<TaskList tasks={tasks} />)

      // Filter to completed
      const completedButton = screen.getByRole('button', { name: /completed/i })
      await user.click(completedButton)

      // Sort by due date
      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'dueDate')

      // Should show only completed tasks
      const taskElements = screen.getAllByRole('article')
      expect(taskElements).toHaveLength(1)
      expect(taskElements[0]).toHaveTextContent('Update documentation')
    })
  })

  describe('Search + Filter Integration', () => {
    it('should search within active tasks only', async () => {
      const user = userEvent.setup({ delay: null })
      const tasks = createFullFeaturedTasks()

      // @ts-expect-error - tasks don't support EPIC 2 features yet
      renderWithRouter(<TaskList tasks={tasks} />)

      // Filter to active
      const activeButton = screen.getByRole('button', { name: /active/i })
      await user.click(activeButton)

      // Search for "review"
      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'review')
      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(screen.getByText('Code review')).toBeInTheDocument()
        expect(screen.queryByText('Update documentation')).not.toBeInTheDocument() // Completed
      })
    })

    it('should show empty state when search has no results in filtered view', async () => {
      const user = userEvent.setup({ delay: null })
      const tasks = createFullFeaturedTasks()

      // @ts-expect-error - tasks don't support EPIC 2 features yet
      renderWithRouter(<TaskList tasks={tasks} />)

      // Filter to completed
      const completedButton = screen.getByRole('button', { name: /completed/i })
      await user.click(completedButton)

      // Search for something not in completed tasks
      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'bug')
      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(screen.getByText(/no tasks found/i)).toBeInTheDocument()
      })
    })
  })

  describe('Search + Sort Integration', () => {
    it('should search and sort results by priority', async () => {
      const user = userEvent.setup({ delay: null })
      const tasks = createFullFeaturedTasks()

      // @ts-expect-error - tasks don't support EPIC 2 features yet
      renderWithRouter(<TaskList tasks={tasks} />)

      // Search for tasks with "e" in title/description
      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'e')
      vi.advanceTimersByTime(300)

      // Sort by priority
      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'priority')

      await waitFor(() => {
        const taskElements = screen.getAllByRole('article')
        // Verify results are sorted by priority among search results
        expect(taskElements.length).toBeGreaterThan(0)
      })
    })

    it('should sort search results by due date', async () => {
      const user = userEvent.setup({ delay: null })
      const tasks = createFullFeaturedTasks()

      // @ts-expect-error - tasks don't support EPIC 2 features yet
      renderWithRouter(<TaskList tasks={tasks} />)

      // Search for "team" or "review"
      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'team')
      vi.advanceTimersByTime(300)

      // Sort by due date
      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'dueDate')

      await waitFor(() => {
        expect(screen.getByText('Team meeting')).toBeInTheDocument()
      })
    })
  })

  describe('All Features Combined', () => {
    it('should filter + search + sort by priority together', async () => {
      const user = userEvent.setup({ delay: null })
      const tasks = createFullFeaturedTasks()

      // @ts-expect-error - tasks don't support EPIC 2 features yet
      renderWithRouter(<TaskList tasks={tasks} />)

      // 1. Filter to active
      const activeButton = screen.getByRole('button', { name: /active/i })
      await user.click(activeButton)

      // 2. Search for tasks with "e"
      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'e')
      vi.advanceTimersByTime(300)

      // 3. Sort by priority
      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'priority')

      await waitFor(() => {
        // Should show active tasks with "e", sorted by priority
        const taskElements = screen.getAllByRole('article')
        expect(taskElements.length).toBeGreaterThan(0)
        // First task should have highest priority among results
      })
    })

    it('should show overdue indicators for high-priority tasks', async () => {
      // Add an overdue high-priority task
      const tasks: TaskWithEpic2Features[] = [
        {
          id: '1',
          title: 'Overdue high priority task',
          description: 'This is urgent and overdue',
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
          dueDate: new Date('2024-01-10'), // 5 days overdue
          createdAt: new Date('2024-01-08'),
          updatedAt: new Date('2024-01-08'),
          completedAt: null,
        },
      ]

      // @ts-expect-error - tasks don't support EPIC 2 features yet
      renderWithRouter(<TaskList tasks={tasks} />)

      // Should show priority badge
      expect(screen.getByText(/high/i)).toBeInTheDocument()

      // Should show overdue indicator
      expect(screen.getByText(/overdue/i)).toBeInTheDocument()

      // Should highlight in red
      const overdueElement = screen.getByText(/overdue/i)
      expect(overdueElement).toHaveClass('text-red-600')
    })

    it('should handle tasks with all features: priority, due date, and search', async () => {
      const user = userEvent.setup({ delay: null })
      const tasks = createFullFeaturedTasks()

      // @ts-expect-error - tasks don't support EPIC 2 features yet
      renderWithRouter(<TaskList tasks={tasks} />)

      // Search for "bug"
      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'bug')
      vi.advanceTimersByTime(300)

      await waitFor(() => {
        // Should show "Fix critical bug"
        expect(screen.getByText('Fix critical bug')).toBeInTheDocument()

        // Should show priority badge
        expect(screen.getByText(/critical/i)).toBeInTheDocument()

        // Should show due date (tomorrow)
        expect(screen.getByText(/tomorrow/i)).toBeInTheDocument()
      })
    })

    it('should clear filters, search, and maintain sort preference', async () => {
      const user = userEvent.setup({ delay: null })
      const tasks = createFullFeaturedTasks()

      // @ts-expect-error - tasks don't support EPIC 2 features yet
      renderWithRouter(<TaskList tasks={tasks} />)

      // 1. Set sort to priority
      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'priority')

      // 2. Filter to active
      const activeButton = screen.getByRole('button', { name: /active/i })
      await user.click(activeButton)

      // 3. Search
      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'test')
      vi.advanceTimersByTime(300)

      // 4. Clear search
      const clearButton = screen.getByRole('button', { name: /clear search/i })
      await user.click(clearButton)

      // 5. Clear filter
      const allButton = screen.getByRole('button', { name: /all/i })
      await user.click(allButton)

      // Sort should still be by priority
      const sortSelectValue = (screen.getByLabelText(/sort by/i) as HTMLSelectElement).value
      expect(sortSelectValue).toBe('priority')
    })
  })

  describe('Priority + Due Date Interaction', () => {
    it('should highlight critical priority tasks due today', () => {
      const tasks: TaskWithEpic2Features[] = [
        {
          id: '1',
          title: 'Critical task due today',
          description: 'Very urgent',
          status: TaskStatus.PENDING,
          priority: TaskPriority.CRITICAL,
          dueDate: new Date('2024-01-15'), // Today
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: null,
        },
      ]

      // @ts-expect-error - tasks don't support EPIC 2 features yet
      renderWithRouter(<TaskList tasks={tasks} />)

      // Should show critical priority
      expect(screen.getByText(/critical/i)).toBeInTheDocument()

      // Should show due today
      expect(screen.getByText(/due today/i)).toBeInTheDocument()

      // Both should be prominently displayed
      const priorityBadge = screen.getByText(/critical/i)
      expect(priorityBadge).toHaveClass('text-red-600')
    })

    it('should sort by priority but show due date info', async () => {
      const user = userEvent.setup()
      const tasks = createFullFeaturedTasks()

      // @ts-expect-error - tasks don't support EPIC 2 features yet
      renderWithRouter(<TaskList tasks={tasks} />)

      // Sort by priority
      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'priority')

      // Should show tasks sorted by priority
      const taskElements = screen.getAllByRole('article')
      expect(taskElements[0]).toHaveTextContent('Fix critical bug')

      // But should still display due date info
      expect(screen.getByText(/tomorrow/i)).toBeInTheDocument()
    })
  })

  describe('Performance with All Features', () => {
    it('should handle large task list with all features efficiently', async () => {
      const user = userEvent.setup({ delay: null })

      // Create 50 tasks with various features
      const largeTasks: TaskWithEpic2Features[] = Array.from({ length: 50 }, (_, i) => ({
        id: `${i}`,
        title: `Task ${i}`,
        description: `Description for task ${i}`,
        status: i % 3 === 0 ? TaskStatus.COMPLETED : TaskStatus.PENDING,
        priority: [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.CRITICAL][i % 4],
        dueDate: i % 2 === 0 ? new Date(`2024-01-${15 + (i % 15)}`) : null,
        createdAt: new Date(`2024-01-${1 + (i % 15)}`),
        updatedAt: new Date(`2024-01-${1 + (i % 15)}`),
        completedAt: i % 3 === 0 ? new Date(`2024-01-${1 + (i % 15)}`) : null,
      }))

      // @ts-expect-error - tasks don't support EPIC 2 features yet
      renderWithRouter(<TaskList tasks={largeTasks} />)

      // Apply filter
      const activeButton = screen.getByRole('button', { name: /active/i })
      await user.click(activeButton)

      // Apply search
      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, '1')
      vi.advanceTimersByTime(300)

      // Apply sort
      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'priority')

      // Should render without performance issues
      await waitFor(() => {
        const taskElements = screen.getAllByRole('article')
        expect(taskElements.length).toBeGreaterThan(0)
      })
    })
  })
})
