/**
 * Task Sort Tests - EPIC 2
 * User Story 2.3: Sort Tasks
 *
 * Tests the ability to sort tasks by different criteria
 * Sort options: Date created, Priority, Title (A-Z)
 * Sort direction: Ascending/Descending
 * Persisted in LocalStorage
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTaskStore } from '../store/task.store'
import { TaskStatus } from '../types/task.types'

// Type extensions for EPIC 2
enum TaskSortBy {
  DATE_CREATED = 'dateCreated',
  PRIORITY = 'priority',
  TITLE = 'title',
}

enum TaskSortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

describe('User Story 2.3: Sort Tasks', () => {
  beforeEach(() => {
    // Reset store to initial state
    // @ts-expect-error - resetStore is a test utility
    useTaskStore.getState().resetStore()

    // Clear localStorage
    localStorage.clear()
  })

  describe('Store - Sort State Management', () => {
    it('should have default sort by DATE_CREATED', () => {
      // @ts-expect-error - sortBy property doesn't exist yet
      const sortBy = useTaskStore.getState().sortBy
      expect(sortBy).toBe(TaskSortBy.DATE_CREATED)
    })

    it('should have default sort direction DESC (newest first)', () => {
      // @ts-expect-error - sortDirection property doesn't exist yet
      const sortDirection = useTaskStore.getState().sortDirection
      expect(sortDirection).toBe(TaskSortDirection.DESC)
    })

    it('should set sort by PRIORITY', () => {
      // @ts-expect-error - setSortBy action doesn't exist yet
      useTaskStore.getState().setSortBy(TaskSortBy.PRIORITY)

      // @ts-expect-error - sortBy property doesn't exist yet
      const sortBy = useTaskStore.getState().sortBy
      expect(sortBy).toBe(TaskSortBy.PRIORITY)
    })

    it('should set sort by TITLE', () => {
      // @ts-expect-error - setSortBy action doesn't exist yet
      useTaskStore.getState().setSortBy(TaskSortBy.TITLE)

      // @ts-expect-error - sortBy property doesn't exist yet
      const sortBy = useTaskStore.getState().sortBy
      expect(sortBy).toBe(TaskSortBy.TITLE)
    })

    it('should set sort direction to ASC', () => {
      // @ts-expect-error - setSortDirection action doesn't exist yet
      useTaskStore.getState().setSortDirection(TaskSortDirection.ASC)

      // @ts-expect-error - sortDirection property doesn't exist yet
      const sortDirection = useTaskStore.getState().sortDirection
      expect(sortDirection).toBe(TaskSortDirection.ASC)
    })

    it('should toggle sort direction', () => {
      // @ts-expect-error - toggleSortDirection action doesn't exist yet
      useTaskStore.getState().toggleSortDirection()

      // @ts-expect-error - sortDirection property doesn't exist yet
      let sortDirection = useTaskStore.getState().sortDirection
      expect(sortDirection).toBe(TaskSortDirection.ASC)

      // @ts-expect-error - toggleSortDirection action doesn't exist yet
      useTaskStore.getState().toggleSortDirection()

      // @ts-expect-error - sortDirection property doesn't exist yet
      sortDirection = useTaskStore.getState().sortDirection
      expect(sortDirection).toBe(TaskSortDirection.DESC)
    })
  })

  describe('Store - Sort by Date Created', () => {
    beforeEach(() => {
      // Add tasks with different creation times
      useTaskStore.getState().addTask({ title: 'First Task' })
      // Small delay to ensure different timestamps
      vi.useFakeTimers()
      vi.advanceTimersByTime(100)

      useTaskStore.getState().addTask({ title: 'Second Task' })
      vi.advanceTimersByTime(100)

      useTaskStore.getState().addTask({ title: 'Third Task' })
      vi.useRealTimers()
    })

    it('should sort by date created DESC (newest first) by default', () => {
      // @ts-expect-error - getSortedTasks action doesn't exist yet
      const sortedTasks = useTaskStore.getState().getSortedTasks()

      expect(sortedTasks[0].title).toBe('Third Task')
      expect(sortedTasks[1].title).toBe('Second Task')
      expect(sortedTasks[2].title).toBe('First Task')
    })

    it('should sort by date created ASC (oldest first)', () => {
      // @ts-expect-error - setSortDirection action doesn't exist yet
      useTaskStore.getState().setSortDirection(TaskSortDirection.ASC)

      // @ts-expect-error - getSortedTasks action doesn't exist yet
      const sortedTasks = useTaskStore.getState().getSortedTasks()

      expect(sortedTasks[0].title).toBe('First Task')
      expect(sortedTasks[1].title).toBe('Second Task')
      expect(sortedTasks[2].title).toBe('Third Task')
    })
  })

  describe('Store - Sort by Priority', () => {
    beforeEach(() => {
      // Priority order: LOW < MEDIUM < HIGH < CRITICAL
      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Medium Task', priority: TaskPriority.MEDIUM })
      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Critical Task', priority: TaskPriority.CRITICAL })
      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Low Task', priority: TaskPriority.LOW })
      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask({ title: 'High Task', priority: TaskPriority.HIGH })
    })

    it('should sort by priority DESC (highest priority first)', () => {
      // @ts-expect-error - setSortBy action doesn't exist yet
      useTaskStore.getState().setSortBy(TaskSortBy.PRIORITY)

      // @ts-expect-error - getSortedTasks action doesn't exist yet
      const sortedTasks = useTaskStore.getState().getSortedTasks()

      expect(sortedTasks[0].title).toBe('Critical Task')
      expect(sortedTasks[1].title).toBe('High Task')
      expect(sortedTasks[2].title).toBe('Medium Task')
      expect(sortedTasks[3].title).toBe('Low Task')
    })

    it('should sort by priority ASC (lowest priority first)', () => {
      // @ts-expect-error - setSortBy action doesn't exist yet
      useTaskStore.getState().setSortBy(TaskSortBy.PRIORITY)
      // @ts-expect-error - setSortDirection action doesn't exist yet
      useTaskStore.getState().setSortDirection(TaskSortDirection.ASC)

      // @ts-expect-error - getSortedTasks action doesn't exist yet
      const sortedTasks = useTaskStore.getState().getSortedTasks()

      expect(sortedTasks[0].title).toBe('Low Task')
      expect(sortedTasks[1].title).toBe('Medium Task')
      expect(sortedTasks[2].title).toBe('High Task')
      expect(sortedTasks[3].title).toBe('Critical Task')
    })

    it('should maintain stable sort for tasks with same priority', () => {
      // Add more tasks with same priority
      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask({ title: 'High Task 2', priority: TaskPriority.HIGH })
      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask({ title: 'High Task 3', priority: TaskPriority.HIGH })

      // @ts-expect-error - setSortBy action doesn't exist yet
      useTaskStore.getState().setSortBy(TaskSortBy.PRIORITY)

      // @ts-expect-error - getSortedTasks action doesn't exist yet
      const sortedTasks = useTaskStore.getState().getSortedTasks()

      // Critical first, then all High tasks (in creation order)
      expect(sortedTasks[0].title).toBe('Critical Task')
      expect(sortedTasks[1].title).toBe('High Task')
      expect(sortedTasks[2].title).toBe('High Task 2')
      expect(sortedTasks[3].title).toBe('High Task 3')
    })
  })

  describe('Store - Sort by Title', () => {
    beforeEach(() => {
      useTaskStore.getState().addTask({ title: 'Zebra' })
      useTaskStore.getState().addTask({ title: 'Apple' })
      useTaskStore.getState().addTask({ title: 'Mango' })
      useTaskStore.getState().addTask({ title: 'Banana' })
    })

    it('should sort by title ASC (A-Z)', () => {
      // @ts-expect-error - setSortBy action doesn't exist yet
      useTaskStore.getState().setSortBy(TaskSortBy.TITLE)
      // @ts-expect-error - setSortDirection action doesn't exist yet
      useTaskStore.getState().setSortDirection(TaskSortDirection.ASC)

      // @ts-expect-error - getSortedTasks action doesn't exist yet
      const sortedTasks = useTaskStore.getState().getSortedTasks()

      expect(sortedTasks[0].title).toBe('Apple')
      expect(sortedTasks[1].title).toBe('Banana')
      expect(sortedTasks[2].title).toBe('Mango')
      expect(sortedTasks[3].title).toBe('Zebra')
    })

    it('should sort by title DESC (Z-A)', () => {
      // @ts-expect-error - setSortBy action doesn't exist yet
      useTaskStore.getState().setSortBy(TaskSortBy.TITLE)
      // @ts-expect-error - setSortDirection action doesn't exist yet
      useTaskStore.getState().setSortDirection(TaskSortDirection.DESC)

      // @ts-expect-error - getSortedTasks action doesn't exist yet
      const sortedTasks = useTaskStore.getState().getSortedTasks()

      expect(sortedTasks[0].title).toBe('Zebra')
      expect(sortedTasks[1].title).toBe('Mango')
      expect(sortedTasks[2].title).toBe('Banana')
      expect(sortedTasks[3].title).toBe('Apple')
    })

    it('should sort titles case-insensitively', () => {
      // Reset and add tasks with mixed case
      const tasks = useTaskStore.getState().tasks
      tasks.forEach((task) => useTaskStore.getState().deleteTask(task.id))

      useTaskStore.getState().addTask({ title: 'zebra' })
      useTaskStore.getState().addTask({ title: 'Apple' })
      useTaskStore.getState().addTask({ title: 'MANGO' })
      useTaskStore.getState().addTask({ title: 'banana' })

      // @ts-expect-error - setSortBy action doesn't exist yet
      useTaskStore.getState().setSortBy(TaskSortBy.TITLE)
      // @ts-expect-error - setSortDirection action doesn't exist yet
      useTaskStore.getState().setSortDirection(TaskSortDirection.ASC)

      // @ts-expect-error - getSortedTasks action doesn't exist yet
      const sortedTasks = useTaskStore.getState().getSortedTasks()

      expect(sortedTasks[0].title).toBe('Apple')
      expect(sortedTasks[1].title).toBe('banana')
      expect(sortedTasks[2].title).toBe('MANGO')
      expect(sortedTasks[3].title).toBe('zebra')
    })
  })

  describe('Store - LocalStorage Persistence', () => {
    it('should persist sort preference to localStorage', () => {
      // @ts-expect-error - setSortBy action doesn't exist yet
      useTaskStore.getState().setSortBy(TaskSortBy.PRIORITY)
      // @ts-expect-error - setSortDirection action doesn't exist yet
      useTaskStore.getState().setSortDirection(TaskSortDirection.ASC)

      const savedSort = localStorage.getItem('taskSortPreference')
      expect(savedSort).toBeTruthy()

      const parsed = JSON.parse(savedSort!)
      expect(parsed.sortBy).toBe(TaskSortBy.PRIORITY)
      expect(parsed.sortDirection).toBe(TaskSortDirection.ASC)
    })

    it('should load sort preference from localStorage on init', () => {
      // Set localStorage before store init
      localStorage.setItem(
        'taskSortPreference',
        JSON.stringify({
          sortBy: TaskSortBy.TITLE,
          sortDirection: TaskSortDirection.ASC,
        })
      )

      // Reinitialize store (in real app this would be on page load)
      // @ts-expect-error - loadSortPreference action doesn't exist yet
      useTaskStore.getState().loadSortPreference()

      // @ts-expect-error - sortBy property doesn't exist yet
      expect(useTaskStore.getState().sortBy).toBe(TaskSortBy.TITLE)
      // @ts-expect-error - sortDirection property doesn't exist yet
      expect(useTaskStore.getState().sortDirection).toBe(TaskSortDirection.ASC)
    })

    it('should use default sort when localStorage is empty', () => {
      localStorage.clear()

      // @ts-expect-error - loadSortPreference action doesn't exist yet
      useTaskStore.getState().loadSortPreference()

      // @ts-expect-error - sortBy property doesn't exist yet
      expect(useTaskStore.getState().sortBy).toBe(TaskSortBy.DATE_CREATED)
      // @ts-expect-error - sortDirection property doesn't exist yet
      expect(useTaskStore.getState().sortDirection).toBe(TaskSortDirection.DESC)
    })

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('taskSortPreference', 'invalid-json')

      // @ts-expect-error - loadSortPreference action doesn't exist yet
      expect(() => useTaskStore.getState().loadSortPreference()).not.toThrow()

      // Should use defaults
      // @ts-expect-error - sortBy property doesn't exist yet
      expect(useTaskStore.getState().sortBy).toBe(TaskSortBy.DATE_CREATED)
    })
  })

  describe('Store - Combined Sort and Filter', () => {
    beforeEach(() => {
      // Add tasks with different properties
      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask({ title: 'A Task', priority: TaskPriority.HIGH })
      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask({ title: 'B Task', priority: TaskPriority.LOW })
      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask({ title: 'C Task', priority: TaskPriority.CRITICAL })

      const tasks = useTaskStore.getState().tasks
      // Complete B Task
      useTaskStore.getState().toggleTaskComplete(tasks[1].id)
    })

    it('should apply sort to filtered results', () => {
      // Filter to active only
      // @ts-expect-error - setFilter action doesn't exist yet
      useTaskStore.getState().setFilter('active')

      // Sort by title
      // @ts-expect-error - setSortBy action doesn't exist yet
      useTaskStore.getState().setSortBy(TaskSortBy.TITLE)
      // @ts-expect-error - setSortDirection action doesn't exist yet
      useTaskStore.getState().setSortDirection(TaskSortDirection.ASC)

      // @ts-expect-error - getFilteredAndSortedTasks action doesn't exist yet
      const tasks = useTaskStore.getState().getFilteredAndSortedTasks()

      // Should only have A Task and C Task (active), sorted by title
      expect(tasks).toHaveLength(2)
      expect(tasks[0].title).toBe('A Task')
      expect(tasks[1].title).toBe('C Task')
    })

    it('should apply priority sort to filtered results', () => {
      // Filter to active only
      // @ts-expect-error - setFilter action doesn't exist yet
      useTaskStore.getState().setFilter('active')

      // Sort by priority DESC
      // @ts-expect-error - setSortBy action doesn't exist yet
      useTaskStore.getState().setSortBy(TaskSortBy.PRIORITY)

      // @ts-expect-error - getFilteredAndSortedTasks action doesn't exist yet
      const tasks = useTaskStore.getState().getFilteredAndSortedTasks()

      // Should have C Task (CRITICAL) before A Task (HIGH)
      expect(tasks[0].title).toBe('C Task')
      expect(tasks[1].title).toBe('A Task')
    })
  })
})
