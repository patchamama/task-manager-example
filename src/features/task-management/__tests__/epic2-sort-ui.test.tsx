import React from 'react'
/**
 * Task Sort UI Tests - EPIC 2
 * User Story 2.3: Sort Tasks
 *
 * Tests the UI for sorting tasks
 * Including sort dropdown and visual indicators
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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

type TaskWithPriority = Task & {
  priority: TaskPriority
}

describe('User Story 2.3: Sort Tasks UI', () => {
  const renderWithRouter = render
  const tasks: TaskWithPriority[] = [
    {
      id: '1',
      title: 'Zebra Task',
      description: 'Last alphabetically',
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      completedAt: null,
    },
    {
      id: '2',
      title: 'Alpha Task',
      description: 'First alphabetically',
      status: TaskStatus.PENDING,
      priority: TaskPriority.CRITICAL,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      completedAt: null,
    },
    {
      id: '3',
      title: 'Middle Task',
      description: 'Middle alphabetically',
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      completedAt: null,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Sort Controls', () => {
    it('should render sort dropdown', () => {
      renderWithRouter(<TaskList tasks={tasks} />)

      const sortSelect = screen.getByLabelText(/sort by/i)
      expect(sortSelect).toBeInTheDocument()
    })

    it('should have sort options: Date Created, Priority, Title', () => {
      renderWithRouter(<TaskList tasks={tasks} />)

      expect(screen.getByRole('option', { name: /date created/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /priority/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /title/i })).toBeInTheDocument()
    })

    it('should default to Date Created sort', () => {
      renderWithRouter(<TaskList tasks={tasks} />)

      const sortSelect = screen.getByLabelText(/sort by/i) as HTMLSelectElement
      expect(sortSelect.value).toBe('dateCreated')
    })

    it('should render sort direction toggle button', () => {
      renderWithRouter(<TaskList tasks={tasks} />)

      const directionButton = screen.getByRole('button', { name: /sort direction/i })
      expect(directionButton).toBeInTheDocument()
    })

    it('should show descending icon by default', () => {
      renderWithRouter(<TaskList tasks={tasks} />)

      const directionButton = screen.getByRole('button', { name: /sort direction/i })
      expect(directionButton).toHaveAttribute('aria-label', expect.stringContaining('descending'))
    })
  })

  describe('Sort by Date Created', () => {
    it('should display tasks in newest-first order by default', () => {
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const taskElements = screen.getAllByRole('article')
      expect(taskElements[0]).toHaveTextContent('Middle Task') // Jan 3
      expect(taskElements[1]).toHaveTextContent('Alpha Task') // Jan 2
      expect(taskElements[2]).toHaveTextContent('Zebra Task') // Jan 1
    })

    it('should display tasks in oldest-first order when direction toggled', async () => {
      const user = userEvent.setup()
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const directionButton = screen.getByRole('button', { name: /sort direction/i })
      await user.click(directionButton)

      const taskElements = screen.getAllByRole('article')
      expect(taskElements[0]).toHaveTextContent('Zebra Task') // Jan 1
      expect(taskElements[1]).toHaveTextContent('Alpha Task') // Jan 2
      expect(taskElements[2]).toHaveTextContent('Middle Task') // Jan 3
    })
  })

  describe('Sort by Priority', () => {
    it('should sort by priority when selected', async () => {
      const user = userEvent.setup()
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'priority')

      const taskElements = screen.getAllByRole('article')
      // DESC: CRITICAL > HIGH > LOW
      expect(taskElements[0]).toHaveTextContent('Alpha Task') // Critical
      expect(taskElements[1]).toHaveTextContent('Middle Task') // High
      expect(taskElements[2]).toHaveTextContent('Zebra Task') // Low
    })

    it('should sort by priority ascending when direction toggled', async () => {
      const user = userEvent.setup()
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'priority')

      const directionButton = screen.getByRole('button', { name: /sort direction/i })
      await user.click(directionButton)

      const taskElements = screen.getAllByRole('article')
      // ASC: LOW > HIGH > CRITICAL
      expect(taskElements[0]).toHaveTextContent('Zebra Task') // Low
      expect(taskElements[1]).toHaveTextContent('Middle Task') // High
      expect(taskElements[2]).toHaveTextContent('Alpha Task') // Critical
    })
  })

  describe('Sort by Title', () => {
    it('should sort by title alphabetically when selected', async () => {
      const user = userEvent.setup()
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'title')

      const directionButton = screen.getByRole('button', { name: /sort direction/i })
      await user.click(directionButton) // Change to ASC for A-Z

      const taskElements = screen.getAllByRole('article')
      expect(taskElements[0]).toHaveTextContent('Alpha Task')
      expect(taskElements[1]).toHaveTextContent('Middle Task')
      expect(taskElements[2]).toHaveTextContent('Zebra Task')
    })

    it('should sort by title reverse alphabetically when descending', async () => {
      const user = userEvent.setup()
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'title')
      // Keep default DESC for Z-A

      const taskElements = screen.getAllByRole('article')
      expect(taskElements[0]).toHaveTextContent('Zebra Task')
      expect(taskElements[1]).toHaveTextContent('Middle Task')
      expect(taskElements[2]).toHaveTextContent('Alpha Task')
    })
  })

  describe('Sort Direction Toggle', () => {
    it('should toggle sort direction when button clicked', async () => {
      const user = userEvent.setup()
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const directionButton = screen.getByRole('button', { name: /sort direction/i })

      // Default is descending
      expect(directionButton).toHaveAttribute('aria-label', expect.stringContaining('descending'))

      // Click to toggle
      await user.click(directionButton)
      expect(directionButton).toHaveAttribute('aria-label', expect.stringContaining('ascending'))

      // Click again to toggle back
      await user.click(directionButton)
      expect(directionButton).toHaveAttribute('aria-label', expect.stringContaining('descending'))
    })

    it('should show ascending icon when direction is ascending', async () => {
      const user = userEvent.setup()
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const directionButton = screen.getByRole('button', { name: /sort direction/i })
      await user.click(directionButton)

      // Check for ascending icon (data-testid or class)
      const icon = directionButton.querySelector('[data-icon="arrow-up"]')
      expect(icon).toBeInTheDocument()
    })

    it('should show descending icon when direction is descending', () => {
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const directionButton = screen.getByRole('button', { name: /sort direction/i })

      // Check for descending icon
      const icon = directionButton.querySelector('[data-icon="arrow-down"]')
      expect(icon).toBeInTheDocument()
    })

    it('should immediately re-sort tasks when direction changes', async () => {
      const user = userEvent.setup()
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      let taskElements = screen.getAllByRole('article')
      const firstTaskBefore = taskElements[0].textContent

      const directionButton = screen.getByRole('button', { name: /sort direction/i })
      await user.click(directionButton)

      taskElements = screen.getAllByRole('article')
      const firstTaskAfter = taskElements[0].textContent

      expect(firstTaskAfter).not.toBe(firstTaskBefore)
    })
  })

  describe('Visual Indicators', () => {
    it('should highlight current sort option in dropdown', async () => {
      const user = userEvent.setup()
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'priority')

      expect(sortSelect).toHaveValue('priority')
    })

    it('should show sort label indicating current sort', () => {
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const sortLabel = screen.getByText(/sorted by.*date created/i)
      expect(sortLabel).toBeInTheDocument()
    })

    it('should update sort label when sort changes', async () => {
      const user = userEvent.setup()
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'title')

      const sortLabel = screen.getByText(/sorted by.*title/i)
      expect(sortLabel).toBeInTheDocument()
    })
  })

  describe('LocalStorage Persistence', () => {
    it('should save sort preference to localStorage when changed', async () => {
      const user = userEvent.setup()
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'priority')

      const saved = localStorage.getItem('taskSortPreference')
      expect(saved).toBeTruthy()

      const parsed = JSON.parse(saved!)
      expect(parsed.sortBy).toBe('priority')
    })

    it('should save sort direction to localStorage when toggled', async () => {
      const user = userEvent.setup()
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const directionButton = screen.getByRole('button', { name: /sort direction/i })
      await user.click(directionButton)

      const saved = localStorage.getItem('taskSortPreference')
      const parsed = JSON.parse(saved!)
      expect(parsed.sortDirection).toBe('asc')
    })

    it('should load sort preference from localStorage on mount', () => {
      localStorage.setItem(
        'taskSortPreference',
        JSON.stringify({
          sortBy: 'title',
          sortDirection: 'asc',
        })
      )

      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const sortSelect = screen.getByLabelText(/sort by/i) as HTMLSelectElement
      expect(sortSelect.value).toBe('title')

      // Tasks should be sorted by title ASC
      const taskElements = screen.getAllByRole('article')
      expect(taskElements[0]).toHaveTextContent('Alpha Task')
    })
  })

  describe('Combined with Filters', () => {
    it('should apply sort to filtered results', async () => {
      const user = userEvent.setup()
      const tasksWithCompleted = [
        ...tasks,
        {
          id: '4',
          title: 'Beta Task',
          description: 'Completed task',
          status: TaskStatus.COMPLETED,
          priority: TaskPriority.HIGH,
          createdAt: new Date('2024-01-04'),
          updatedAt: new Date('2024-01-04'),
          completedAt: new Date('2024-01-04'),
        },
      ]

      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasksWithCompleted} />)

      // Filter to active
      const activeButton = screen.getByRole('button', { name: /active/i })
      await user.click(activeButton)

      // Sort by title
      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'title')

      const directionButton = screen.getByRole('button', { name: /sort direction/i })
      await user.click(directionButton) // ASC

      // Should show only active tasks, sorted by title
      const taskElements = screen.getAllByRole('article')
      expect(taskElements).toHaveLength(3) // No Beta Task (completed)
      expect(taskElements[0]).toHaveTextContent('Alpha Task')
      expect(taskElements[1]).toHaveTextContent('Middle Task')
      expect(taskElements[2]).toHaveTextContent('Zebra Task')
    })
  })

  describe('Accessibility', () => {
    it('should have accessible label for sort select', () => {
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const sortSelect = screen.getByLabelText(/sort by/i)
      expect(sortSelect).toHaveAttribute('aria-label')
    })

    it('should have accessible label for direction button', () => {
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const directionButton = screen.getByRole('button', { name: /sort direction/i })
      expect(directionButton).toHaveAttribute('aria-label')
    })

    it('should announce current sort to screen readers', () => {
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      const sortRegion = screen.getByRole('region', { name: /sort controls/i })
      expect(sortRegion).toHaveAttribute('aria-live', 'polite')
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      // @ts-expect-error - tasks prop doesn't support priority yet
      renderWithRouter(<TaskList tasks={tasks} />)

      // Tab to sort select
      await user.tab()
      const sortSelect = screen.getByLabelText(/sort by/i)
      expect(sortSelect).toHaveFocus()

      // Tab to direction button
      await user.tab()
      const directionButton = screen.getByRole('button', { name: /sort direction/i })
      expect(directionButton).toHaveFocus()
    })
  })

  describe('Empty State', () => {
    it('should handle sorting empty task list', () => {
      renderWithRouter(<TaskList tasks={[]} />)

      const sortSelect = screen.getByLabelText(/sort by/i)
      expect(sortSelect).toBeInTheDocument()

      // Should not crash
      expect(screen.getByText(/no tasks/i)).toBeInTheDocument()
    })
  })
})
