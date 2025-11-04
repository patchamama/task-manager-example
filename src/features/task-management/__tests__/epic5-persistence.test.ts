/**
 * EPIC 5.1: LocalStorage Persistence Tests
 * User Story 5.1: Local Storage Persistence
 *
 * Tests for localStorage persistence functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTaskStore } from '../store/task.store'
import { TaskStatus, TaskPriority } from '../types/task.types'

describe('EPIC 5.1: LocalStorage Persistence', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()

    // Reset store to initial state
    // @ts-expect-error - resetStore is a test utility
    useTaskStore.getState().resetStore()
  })

  describe('Task Persistence', () => {
    it('should persist tasks to localStorage when added', () => {
      const store = useTaskStore.getState()

      store.addTask({
        title: 'Persistent Task',
        description: 'This should be saved',
        status: TaskStatus.PENDING,
      })

      // Check that data was saved to localStorage
      const saved = localStorage.getItem('task-store')
      expect(saved).toBeTruthy()

      if (saved) {
        const parsed = JSON.parse(saved)
        expect(parsed.state.tasks).toHaveLength(1)
        expect(parsed.state.tasks[0].title).toBe('Persistent Task')
      }
    })

    it('should load tasks from localStorage on initialization', async () => {
      // Manually set data in localStorage
      const mockData = {
        state: {
          tasks: [{
            id: 'test-1',
            title: 'Loaded Task',
            description: 'From localStorage',
            status: TaskStatus.PENDING,
            priority: TaskPriority.MEDIUM,
            categoryId: null,
            tags: [],
            dueDate: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedAt: null,
          }],
          categories: [],
          currentFilter: 'all',
          sortBy: 'dateCreated',
          sortDirection: 'desc',
          searchQuery: '',
          categoryFilters: [],
          tagFilters: [],
        },
        version: 0,
      }

      localStorage.setItem('task-store', JSON.stringify(mockData))

      // Trigger rehydration
      // @ts-expect-error - accessing persist API for testing
      await useTaskStore.persist.rehydrate()

      const tasks = useTaskStore.getState().tasks

      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toBe('Loaded Task')
    })

    it('should persist task updates', () => {
      const store = useTaskStore.getState()

      store.addTask({
        title: 'Original Title',
        description: 'Original Description',
        status: TaskStatus.PENDING,
      })

      // Get fresh state after adding
      const taskId = useTaskStore.getState().tasks[0].id

      store.updateTask(taskId, {
        title: 'Updated Title',
      })

      const saved = localStorage.getItem('task-store')
      expect(saved).toBeTruthy()

      if (saved) {
        const parsed = JSON.parse(saved)
        expect(parsed.state.tasks[0].title).toBe('Updated Title')
      }
    })

    it('should persist task deletion', () => {
      const store = useTaskStore.getState()

      store.addTask({
        title: 'To Be Deleted',
        description: 'This will be removed',
        status: TaskStatus.PENDING,
      })

      // Get fresh state after adding
      const taskId = useTaskStore.getState().tasks[0].id
      store.deleteTask(taskId)

      const saved = localStorage.getItem('task-store')
      expect(saved).toBeTruthy()

      if (saved) {
        const parsed = JSON.parse(saved)
        expect(parsed.state.tasks).toHaveLength(0)
      }
    })
  })

  describe('Category Persistence', () => {
    it('should persist categories to localStorage', () => {
      const store = useTaskStore.getState()

      store.addCategory({
        name: 'Work',
        color: '#3b82f6',
      })

      const saved = localStorage.getItem('task-store')
      expect(saved).toBeTruthy()

      if (saved) {
        const parsed = JSON.parse(saved)
        expect(parsed.state.categories).toHaveLength(1)
        expect(parsed.state.categories[0].name).toBe('Work')
      }
    })

    it('should load categories from localStorage', async () => {
      const mockData = {
        state: {
          tasks: [],
          categories: [{
            id: 'cat-1',
            name: 'Personal',
            color: '#10b981',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }],
          currentFilter: 'all',
          sortBy: 'dateCreated',
          sortDirection: 'desc',
          searchQuery: '',
          categoryFilters: [],
          tagFilters: [],
        },
        version: 0,
      }

      localStorage.setItem('task-store', JSON.stringify(mockData))

      // Trigger rehydration
      // @ts-expect-error - accessing persist API for testing
      await useTaskStore.persist.rehydrate()

      const categories = useTaskStore.getState().categories

      expect(categories).toHaveLength(1)
      expect(categories[0].name).toBe('Personal')
    })
  })

  describe('Filter and Sort Persistence', () => {
    it('should persist current filter', () => {
      const store = useTaskStore.getState()

      store.setFilter('completed')

      const saved = localStorage.getItem('task-store')
      expect(saved).toBeTruthy()

      if (saved) {
        const parsed = JSON.parse(saved)
        expect(parsed.state.currentFilter).toBe('completed')
      }
    })

    it('should persist sort settings', () => {
      const store = useTaskStore.getState()

      store.setSortBy('priority')
      store.setSortDirection('asc')

      const saved = localStorage.getItem('task-store')
      expect(saved).toBeTruthy()

      if (saved) {
        const parsed = JSON.parse(saved)
        expect(parsed.state.sortBy).toBe('priority')
        expect(parsed.state.sortDirection).toBe('asc')
      }
    })

    it('should persist search query', () => {
      const store = useTaskStore.getState()

      store.setSearchQuery('important')

      const saved = localStorage.getItem('task-store')
      expect(saved).toBeTruthy()

      if (saved) {
        const parsed = JSON.parse(saved)
        expect(parsed.state.searchQuery).toBe('important')
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle corrupted localStorage data gracefully', () => {
      // Set invalid JSON in localStorage
      localStorage.setItem('task-store', 'invalid json{]')

      // Should not throw and should use initial state
      expect(() => {
        const tasks = useTaskStore.getState().tasks
        expect(tasks).toEqual([])
      }).not.toThrow()
    })

    it('should handle missing localStorage data', () => {
      // Don't set anything in localStorage
      localStorage.clear()

      const tasks = useTaskStore.getState().tasks
      expect(tasks).toEqual([])
    })
  })

  describe('Storage Quota', () => {
    it('should handle storage quota exceeded errors', () => {
      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = vi.fn(() => {
        throw new DOMException('QuotaExceededError')
      })

      const store = useTaskStore.getState()

      // Should not throw when quota is exceeded (storage error is caught)
      expect(() => {
        store.addTask({
          title: 'Large Task',
          description: 'Valid description under 500 chars',
          status: TaskStatus.PENDING,
        })
      }).not.toThrow()

      // Restore original setItem
      Storage.prototype.setItem = originalSetItem
    })
  })

  describe('Date Serialization', () => {
    it('should correctly serialize and deserialize dates', () => {
      const store = useTaskStore.getState()
      const now = new Date()

      store.addTask({
        title: 'Task with Date',
        description: 'Has creation date',
        status: TaskStatus.PENDING,
        dueDate: now,
      })

      const saved = localStorage.getItem('task-store')
      expect(saved).toBeTruthy()

      if (saved) {
        const parsed = JSON.parse(saved)
        const savedTask = parsed.state.tasks[0]

        // Dates should be serialized as ISO strings
        expect(typeof savedTask.createdAt).toBe('string')
        expect(typeof savedTask.dueDate).toBe('string')

        // Should be able to reconstruct dates
        const reconstructedDate = new Date(savedTask.dueDate)
        expect(reconstructedDate.toISOString()).toBe(now.toISOString())
      }
    })
  })
})
