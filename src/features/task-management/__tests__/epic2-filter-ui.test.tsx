import React from 'react'
/**
 * Task Filter UI Tests - EPIC 2
 * User Story 2.2: Filter Tasks by Status
 *
 * Tests the UI for filtering tasks
 * Including URL state persistence
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { TaskList } from '../components/TaskList'
import { TaskStatus, type Task } from '../types/task.types'

// Mock useSearchParams for URL state testing
const mockSetSearchParams = vi.fn()
vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
}))

describe('User Story 2.2: Filter Tasks UI', () => {
  const renderWithRouter = render
  const pendingTask1: Task = {
    id: '1',
    title: 'Pending Task 1',
    description: 'Description 1',
    status: TaskStatus.PENDING,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    completedAt: null,
  }

  const pendingTask2: Task = {
    id: '2',
    title: 'Pending Task 2',
    description: 'Description 2',
    status: TaskStatus.PENDING,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    completedAt: null,
  }

  const completedTask1: Task = {
    id: '3',
    title: 'Completed Task 1',
    description: 'Description 3',
    status: TaskStatus.COMPLETED,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    completedAt: new Date('2024-01-03'),
  }

  const completedTask2: Task = {
    id: '4',
    title: 'Completed Task 2',
    description: 'Description 4',
    status: TaskStatus.COMPLETED,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
    completedAt: new Date('2024-01-04'),
  }

  const allTasks = [pendingTask1, pendingTask2, completedTask1, completedTask2]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Filter Controls', () => {
    it('should render filter buttons: All, Active, Completed', () => {
      renderWithRouter(<TaskList tasks={allTasks} />)

      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /active/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /completed/i })).toBeInTheDocument()
    })

    it('should show All filter as active by default', () => {
      renderWithRouter(<TaskList tasks={allTasks} />)

      const allButton = screen.getByRole('button', { name: /all/i })
      expect(allButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('should show task count for each filter', () => {
      renderWithRouter(<TaskList tasks={allTasks} />)

      // All: 4 tasks
      const allButton = screen.getByRole('button', { name: /all.*4/i })
      expect(allButton).toBeInTheDocument()

      // Active: 2 tasks
      const activeButton = screen.getByRole('button', { name: /active.*2/i })
      expect(activeButton).toBeInTheDocument()

      // Completed: 2 tasks
      const completedButton = screen.getByRole('button', { name: /completed.*2/i })
      expect(completedButton).toBeInTheDocument()
    })

    it('should highlight active filter button', () => {
      renderWithRouter(<TaskList tasks={allTasks} />)

      const allButton = screen.getByRole('button', { name: /all/i })
      expect(allButton).toHaveClass('bg-blue-500')
    })

    it('should not highlight inactive filter buttons', () => {
      renderWithRouter(<TaskList tasks={allTasks} />)

      const activeButton = screen.getByRole('button', { name: /active/i })
      const completedButton = screen.getByRole('button', { name: /completed/i })

      expect(activeButton).not.toHaveClass('bg-blue-500')
      expect(completedButton).not.toHaveClass('bg-blue-500')
    })
  })

  describe('Filter Interaction', () => {
    it('should show all tasks by default', () => {
      renderWithRouter(<TaskList tasks={allTasks} />)

      expect(screen.getByText('Pending Task 1')).toBeInTheDocument()
      expect(screen.getByText('Pending Task 2')).toBeInTheDocument()
      expect(screen.getByText('Completed Task 1')).toBeInTheDocument()
      expect(screen.getByText('Completed Task 2')).toBeInTheDocument()
    })

    it('should filter to show only active tasks when Active is clicked', async () => {
      const user = userEvent.setup()
      renderWithRouter(<TaskList tasks={allTasks} />)

      const activeButton = screen.getByRole('button', { name: /active/i })
      await user.click(activeButton)

      // Should show pending tasks
      expect(screen.getByText('Pending Task 1')).toBeInTheDocument()
      expect(screen.getByText('Pending Task 2')).toBeInTheDocument()

      // Should not show completed tasks
      expect(screen.queryByText('Completed Task 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Completed Task 2')).not.toBeInTheDocument()
    })

    it('should filter to show only completed tasks when Completed is clicked', async () => {
      const user = userEvent.setup()
      renderWithRouter(<TaskList tasks={allTasks} />)

      const completedButton = screen.getByRole('button', { name: /completed/i })
      await user.click(completedButton)

      // Should show completed tasks
      expect(screen.getByText('Completed Task 1')).toBeInTheDocument()
      expect(screen.getByText('Completed Task 2')).toBeInTheDocument()

      // Should not show pending tasks
      expect(screen.queryByText('Pending Task 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Pending Task 2')).not.toBeInTheDocument()
    })

    it('should return to showing all tasks when All is clicked', async () => {
      const user = userEvent.setup()
      renderWithRouter(<TaskList tasks={allTasks} />)

      // Click Active first
      const activeButton = screen.getByRole('button', { name: /active/i })
      await user.click(activeButton)

      // Then click All
      const allButton = screen.getByRole('button', { name: /all/i })
      await user.click(allButton)

      // Should show all tasks again
      expect(screen.getByText('Pending Task 1')).toBeInTheDocument()
      expect(screen.getByText('Pending Task 2')).toBeInTheDocument()
      expect(screen.getByText('Completed Task 1')).toBeInTheDocument()
      expect(screen.getByText('Completed Task 2')).toBeInTheDocument()
    })

    it('should update filter button styling when filter changes', async () => {
      const user = userEvent.setup()
      renderWithRouter(<TaskList tasks={allTasks} />)

      const activeButton = screen.getByRole('button', { name: /active/i })
      await user.click(activeButton)

      expect(activeButton).toHaveClass('bg-blue-500')
      expect(activeButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('should update filter immediately without delay', async () => {
      const user = userEvent.setup()
      renderWithRouter(<TaskList tasks={allTasks} />)

      const completedButton = screen.getByRole('button', { name: /completed/i })
      await user.click(completedButton)

      // Should update immediately
      expect(screen.getByText('Completed Task 1')).toBeInTheDocument()
      expect(screen.queryByText('Pending Task 1')).not.toBeInTheDocument()
    })
  })

  describe('URL State Persistence', () => {
    it('should update URL when filter changes to Active', async () => {
      const user = userEvent.setup()
      renderWithRouter(<TaskList tasks={allTasks} />)

      const activeButton = screen.getByRole('button', { name: /active/i })
      await user.click(activeButton)

      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.objectContaining({ filter: 'active' })
      )
    })

    it('should update URL when filter changes to Completed', async () => {
      const user = userEvent.setup()
      renderWithRouter(<TaskList tasks={allTasks} />)

      const completedButton = screen.getByRole('button', { name: /completed/i })
      await user.click(completedButton)

      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.objectContaining({ filter: 'completed' })
      )
    })

    it('should update URL when filter changes to All', async () => {
      const user = userEvent.setup()
      renderWithRouter(<TaskList tasks={allTasks} />)

      // First set to Active
      const activeButton = screen.getByRole('button', { name: /active/i })
      await user.click(activeButton)

      // Then back to All
      const allButton = screen.getByRole('button', { name: /all/i })
      await user.click(allButton)

      expect(mockSetSearchParams).toHaveBeenLastCalledWith(
        expect.objectContaining({ filter: 'all' })
      )
    })

    it('should read filter from URL on mount', () => {
      // Mock URL with active filter
      const mockSearchParams = new URLSearchParams('filter=active')
      vi.mocked(vi.requireMock('react-router-dom').useSearchParams).mockReturnValue([
        mockSearchParams,
        mockSetSearchParams,
      ])

      renderWithRouter(<TaskList tasks={allTasks} />)

      // Should show only active tasks
      expect(screen.getByText('Pending Task 1')).toBeInTheDocument()
      expect(screen.queryByText('Completed Task 1')).not.toBeInTheDocument()

      // Active button should be highlighted
      const activeButton = screen.getByRole('button', { name: /active/i })
      expect(activeButton).toHaveClass('bg-blue-500')
    })

    it('should default to All filter when URL has no filter param', () => {
      const mockSearchParams = new URLSearchParams('')
      vi.mocked(vi.requireMock('react-router-dom').useSearchParams).mockReturnValue([
        mockSearchParams,
        mockSetSearchParams,
      ])

      renderWithRouter(<TaskList tasks={allTasks} />)

      // Should show all tasks
      expect(screen.getByText('Pending Task 1')).toBeInTheDocument()
      expect(screen.getByText('Completed Task 1')).toBeInTheDocument()
    })

    it('should handle invalid filter value in URL gracefully', () => {
      const mockSearchParams = new URLSearchParams('filter=invalid')
      vi.mocked(vi.requireMock('react-router-dom').useSearchParams).mockReturnValue([
        mockSearchParams,
        mockSetSearchParams,
      ])

      renderWithRouter(<TaskList tasks={allTasks} />)

      // Should default to All
      expect(screen.getByText('Pending Task 1')).toBeInTheDocument()
      expect(screen.getByText('Completed Task 1')).toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('should show "No active tasks" when Active filter has no results', async () => {
      const user = userEvent.setup()
      const onlyCompletedTasks = [completedTask1, completedTask2]

      renderWithRouter(<TaskList tasks={onlyCompletedTasks} />)

      const activeButton = screen.getByRole('button', { name: /active/i })
      await user.click(activeButton)

      expect(screen.getByText(/no active tasks/i)).toBeInTheDocument()
    })

    it('should show "No completed tasks" when Completed filter has no results', async () => {
      const user = userEvent.setup()
      const onlyPendingTasks = [pendingTask1, pendingTask2]

      renderWithRouter(<TaskList tasks={onlyPendingTasks} />)

      const completedButton = screen.getByRole('button', { name: /completed/i })
      await user.click(completedButton)

      expect(screen.getByText(/no completed tasks/i)).toBeInTheDocument()
    })

    it('should show generic empty message when All filter has no results', () => {
      renderWithRouter(<TaskList tasks={[]} />)

      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
    })

    it('should show filter count of 0 for empty filters', () => {
      const onlyPendingTasks = [pendingTask1]

      renderWithRouter(<TaskList tasks={onlyPendingTasks} />)

      const completedButton = screen.getByRole('button', { name: /completed.*0/i })
      expect(completedButton).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for filter buttons', () => {
      renderWithRouter(<TaskList tasks={allTasks} />)

      expect(screen.getByRole('button', { name: /all/i })).toHaveAttribute('aria-label')
      expect(screen.getByRole('button', { name: /active/i })).toHaveAttribute('aria-label')
      expect(screen.getByRole('button', { name: /completed/i })).toHaveAttribute('aria-label')
    })

    it('should use aria-pressed for active filter state', () => {
      renderWithRouter(<TaskList tasks={allTasks} />)

      const allButton = screen.getByRole('button', { name: /all/i })
      const activeButton = screen.getByRole('button', { name: /active/i })

      expect(allButton).toHaveAttribute('aria-pressed', 'true')
      expect(activeButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('should have a landmark role for filter controls', () => {
      renderWithRouter(<TaskList tasks={allTasks} />)

      const filterSection = screen.getByRole('group', { name: /filter/i })
      expect(filterSection).toBeInTheDocument()
    })
  })
})
