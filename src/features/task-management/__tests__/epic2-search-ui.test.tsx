import React from 'react'
/**
 * Task Search UI Tests - EPIC 2
 * User Story 2.4: Search Tasks
 *
 * Tests the UI for searching tasks
 * Including debounced input and clear button
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { TaskList } from '../components/TaskList'
import { TaskStatus, type Task } from '../types/task.types'

describe('User Story 2.4: Search Tasks UI', () => {
  const renderWithRouter = render
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Buy groceries',
      description: 'Milk and bread from store',
      status: TaskStatus.PENDING,
      priority: 'medium' as any,
      dueDate: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      completedAt: null,
    },
    {
      id: '2',
      title: 'Call dentist',
      description: 'Schedule annual checkup',
      status: TaskStatus.PENDING,
      priority: 'medium' as any,
      dueDate: null,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      completedAt: null,
    },
    {
      id: '3',
      title: 'Fix bug in code',
      description: 'Urgent issue with login',
      status: TaskStatus.PENDING,
      priority: 'medium' as any,
      dueDate: null,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      completedAt: null,
    },
    {
      id: '4',
      title: 'Write blog post',
      description: 'About testing best practices',
      status: TaskStatus.PENDING,
      priority: 'medium' as any,
      dueDate: null,
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-04'),
      completedAt: null,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Search Input', () => {
    it('should render search input field', () => {
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      expect(searchInput).toBeInTheDocument()
    })

    it('should have placeholder text', () => {
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByPlaceholderText(/search tasks/i)
      expect(searchInput).toBeInTheDocument()
    })

    it('should have accessible label', () => {
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByLabelText(/search/i)
      expect(searchInput).toBeInTheDocument()
    })

    it('should allow typing in search input', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'groceries')

      expect(searchInput).toHaveValue('groceries')
    })

    it('should show search icon', () => {
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchIcon = screen.getByTestId('search-icon')
      expect(searchIcon).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('should filter tasks by title in real-time', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'groceries')

      // Advance timers to trigger debounce
      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument()
        expect(screen.queryByText('Call dentist')).not.toBeInTheDocument()
        expect(screen.queryByText('Fix bug in code')).not.toBeInTheDocument()
      })
    })

    it('should filter tasks by description', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'testing')

      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(screen.getByText('Write blog post')).toBeInTheDocument()
        expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument()
      })
    })

    it('should perform case-insensitive search', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'BUG')

      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(screen.getByText('Fix bug in code')).toBeInTheDocument()
        expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument()
      })
    })

    it('should show all tasks when search is empty', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'test')

      vi.advanceTimersByTime(300)

      await user.clear(searchInput)

      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument()
        expect(screen.getByText('Call dentist')).toBeInTheDocument()
        expect(screen.getByText('Fix bug in code')).toBeInTheDocument()
        expect(screen.getByText('Write blog post')).toBeInTheDocument()
      })
    })

    it('should find multiple matching tasks', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'e') // Common letter

      vi.advanceTimersByTime(300)

      await waitFor(() => {
        const taskElements = screen.getAllByRole('article')
        expect(taskElements.length).toBeGreaterThan(1)
      })
    })
  })

  describe('Debounced Search', () => {
    it('should debounce search input by 300ms', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'gro')

      // Before debounce time
      vi.advanceTimersByTime(200)

      // Should still show all tasks
      expect(screen.getByText('Buy groceries')).toBeInTheDocument()
      expect(screen.getByText('Call dentist')).toBeInTheDocument()

      // After debounce time
      vi.advanceTimersByTime(100)

      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument()
        expect(screen.queryByText('Call dentist')).not.toBeInTheDocument()
      })
    })

    it('should reset debounce timer on each keystroke', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')

      // Type 'g'
      await user.type(searchInput, 'g')
      vi.advanceTimersByTime(200)

      // Type 'r' (resets timer)
      await user.type(searchInput, 'r')
      vi.advanceTimersByTime(200)

      // Type 'o' (resets timer)
      await user.type(searchInput, 'o')

      // Only 200ms have passed since last keystroke
      // Should not have filtered yet
      expect(screen.getByText('Call dentist')).toBeInTheDocument()

      // Complete the debounce
      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(screen.queryByText('Call dentist')).not.toBeInTheDocument()
      })
    })

    it('should not trigger search before debounce completes', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'groceries')

      // Immediately check - should still show all tasks
      expect(screen.getByText('Call dentist')).toBeInTheDocument()

      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(screen.queryByText('Call dentist')).not.toBeInTheDocument()
      })
    })
  })

  describe('Clear Search Button', () => {
    it('should render clear button when search has value', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'test')

      const clearButton = screen.getByRole('button', { name: /clear search/i })
      expect(clearButton).toBeInTheDocument()
    })

    it('should not render clear button when search is empty', () => {
      renderWithRouter(<TaskList tasks={tasks} />)

      const clearButton = screen.queryByRole('button', { name: /clear search/i })
      expect(clearButton).not.toBeInTheDocument()
    })

    it('should clear search when clear button is clicked', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'groceries')

      vi.advanceTimersByTime(300)

      const clearButton = screen.getByRole('button', { name: /clear search/i })
      await user.click(clearButton)

      expect(searchInput).toHaveValue('')
    })

    it('should show all tasks after clearing search', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'groceries')

      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(screen.queryByText('Call dentist')).not.toBeInTheDocument()
      })

      const clearButton = screen.getByRole('button', { name: /clear search/i })
      await user.click(clearButton)

      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(screen.getByText('Call dentist')).toBeInTheDocument()
        expect(screen.getByText('Buy groceries')).toBeInTheDocument()
      })
    })

    it('should focus search input after clearing', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'test')

      const clearButton = screen.getByRole('button', { name: /clear search/i })
      await user.click(clearButton)

      expect(searchInput).toHaveFocus()
    })
  })

  describe('No Results Message', () => {
    it('should show "no results" message when search returns no matches', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'nonexistent-task')

      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(screen.getByText(/no tasks found/i)).toBeInTheDocument()
      })
    })

    it('should show search term in no results message', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'xyz')

      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(screen.getByText(/no tasks found.*xyz/i)).toBeInTheDocument()
      })
    })

    it('should not show no results message when search is empty', () => {
      renderWithRouter(<TaskList tasks={[]} />)

      // Should show generic empty state, not search-specific
      expect(screen.queryByText(/no tasks found/i)).not.toBeInTheDocument()
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
    })
  })

  describe('Search Result Count', () => {
    it('should display count of search results', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'a') // Common letter

      vi.advanceTimersByTime(300)

      await waitFor(() => {
        const countText = screen.getByText(/found.*\d+.*task/i)
        expect(countText).toBeInTheDocument()
      })
    })

    it('should update count as search changes', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')

      // First search
      await user.type(searchInput, 'bug')
      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(screen.getByText(/found 1 task/i)).toBeInTheDocument()
      })

      // Clear and search again
      await user.clear(searchInput)
      await user.type(searchInput, 'e')
      vi.advanceTimersByTime(300)

      await waitFor(() => {
        const countText = screen.getByText(/found.*task/i)
        expect(countText).not.toHaveTextContent('found 1 task')
      })
    })

    it('should not show count when no search is active', () => {
      renderWithRouter(<TaskList tasks={tasks} />)

      expect(screen.queryByText(/found.*task/i)).not.toBeInTheDocument()
    })
  })

  describe('Combined with Filters', () => {
    it('should apply search to filtered tasks', async () => {
      const user = userEvent.setup({ delay: null })
      const completedTask: Task = {
        id: '5',
        title: 'Buy office supplies',
        description: 'Completed purchase',
        status: TaskStatus.COMPLETED,
        priority: 'medium' as any,
        dueDate: null,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
        completedAt: new Date('2024-01-05'),
      }

      renderWithRouter(<TaskList tasks={[...tasks, completedTask]} />)

      // Filter to active
      const activeButton = screen.getByRole('button', { name: /active/i })
      await user.click(activeButton)

      // Search for "buy"
      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'buy')

      vi.advanceTimersByTime(300)

      await waitFor(() => {
        // Should only show "Buy groceries" (active)
        expect(screen.getByText('Buy groceries')).toBeInTheDocument()
        // Should not show "Buy office supplies" (completed)
        expect(screen.queryByText('Buy office supplies')).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      expect(searchInput).toHaveAttribute('aria-label')
    })

    it('should announce search results to screen readers', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'groceries')

      vi.advanceTimersByTime(300)

      await waitFor(() => {
        const liveRegion = screen.getByRole('status')
        expect(liveRegion).toBeInTheDocument()
        expect(liveRegion).toHaveAttribute('aria-live', 'polite')
      })
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      await user.tab()
      const searchInput = screen.getByRole('searchbox')

      expect(searchInput).toHaveFocus()
    })

    it('should support Escape key to clear search', async () => {
      const user = userEvent.setup({ delay: null })
      renderWithRouter(<TaskList tasks={tasks} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'test')

      await user.keyboard('{Escape}')

      expect(searchInput).toHaveValue('')
    })
  })

  describe('Performance', () => {
    it('should not trigger multiple searches during typing', async () => {
      const searchSpy = vi.fn()
      const user = userEvent.setup({ delay: null })

      renderWithRouter(<TaskList tasks={tasks} onSearch={searchSpy} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'groceries')

      // Should only call search once after debounce
      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(searchSpy).toHaveBeenCalledTimes(1)
      })
    })
  })
})
