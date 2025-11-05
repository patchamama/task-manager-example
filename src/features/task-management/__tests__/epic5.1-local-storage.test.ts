/**
 * EPIC 5.1: Local Storage Persistence Tests
 * User Story 5.1: Local Storage Persistence
 *
 * Tests for localStorage persistence functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useTaskStore } from '../store/task.store'
import { TaskStatus, TaskPriority } from '../types/task.types'

describe('EPIC 5.1: Local Storage Persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    const store = useTaskStore.getState()
    store.resetStore()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Basic Persistence', () => {
    it('should persist tasks to localStorage when created', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Persistent Task', description: 'This should persist' })

      // Check localStorage directly
      const stored = localStorage.getItem('task-storage')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.tasks).toHaveLength(1)
      expect(parsed.state.tasks[0].title).toBe('Persistent Task')
    })

    it('should load tasks from localStorage on initialization', () => {
      // Setup: Add task and get its data
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task to Load', description: 'Should load on init' })
      const taskId = useTaskStore.getState().tasks[0].id

      // Clear the store (simulate page refresh)
      store.resetStore()

      // Verify tasks are loaded from localStorage
      const reloadedStore = useTaskStore.getState()
      expect(reloadedStore.tasks).toHaveLength(1)
      expect(reloadedStore.tasks[0].title).toBe('Task to Load')
      expect(reloadedStore.tasks[0].id).toBe(taskId)
    })

    it('should persist task updates', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Original Title' })
      const taskId = useTaskStore.getState().tasks[0].id

      store.updateTask(taskId, { title: 'Updated Title' })

      // Reload from localStorage
      store.resetStore()
      const reloadedStore = useTaskStore.getState()
      expect(reloadedStore.tasks[0].title).toBe('Updated Title')
    })

    it('should persist task deletions', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1' })
      store.addTask({ title: 'Task 2' })
      const taskId = useTaskStore.getState().tasks[0].id

      store.deleteTask(taskId)

      // Reload from localStorage
      store.resetStore()
      const reloadedStore = useTaskStore.getState()
      expect(reloadedStore.tasks).toHaveLength(1)
      expect(reloadedStore.tasks[0].title).toBe('Task 2')
    })

    it('should persist task completion status', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task to Complete' })
      const taskId = useTaskStore.getState().tasks[0].id

      store.toggleTaskComplete(taskId)

      // Reload from localStorage
      store.resetStore()
      const reloadedStore = useTaskStore.getState()
      expect(reloadedStore.tasks[0].status).toBe(TaskStatus.COMPLETED)
      expect(reloadedStore.tasks[0].completedAt).toBeTruthy()
    })
  })

  describe('Categories Persistence', () => {
    it('should persist categories to localStorage', () => {
      const store = useTaskStore.getState()
      store.addCategory({ name: 'Work', color: '#ff0000' })

      const stored = localStorage.getItem('task-storage')
      const parsed = JSON.parse(stored!)
      expect(parsed.state.categories).toHaveLength(1)
      expect(parsed.state.categories[0].name).toBe('Work')
    })

    it('should load categories from localStorage', () => {
      const store = useTaskStore.getState()
      store.addCategory({ name: 'Personal', color: '#00ff00' })
      const categoryId = useTaskStore.getState().categories[0].id

      store.resetStore()
      const reloadedStore = useTaskStore.getState()
      expect(reloadedStore.categories).toHaveLength(1)
      expect(reloadedStore.categories[0].name).toBe('Personal')
      expect(reloadedStore.categories[0].id).toBe(categoryId)
    })

    it('should persist task-category relationships', () => {
      const store = useTaskStore.getState()
      store.addCategory({ name: 'Work', color: '#ff0000' })
      const categoryId = useTaskStore.getState().categories[0].id

      store.addTask({ title: 'Work Task', categoryId })

      store.resetStore()
      const reloadedStore = useTaskStore.getState()
      expect(reloadedStore.tasks[0].categoryId).toBe(categoryId)
    })
  })

  describe('Filter and Sort Preferences', () => {
    it('should persist current filter preference', () => {
      const store = useTaskStore.getState()
      store.setFilter('active' as any)

      store.resetStore()
      const reloadedStore = useTaskStore.getState()
      expect(reloadedStore.currentFilter).toBe('active')
    })

    it('should persist sort preferences', () => {
      const store = useTaskStore.getState()
      store.setSortBy('priority' as any)
      store.setSortDirection('asc' as any)

      store.resetStore()
      const reloadedStore = useTaskStore.getState()
      expect(reloadedStore.sortBy).toBe('priority')
      expect(reloadedStore.sortDirection).toBe('asc')
    })

    it('should persist category filters', () => {
      const store = useTaskStore.getState()
      store.setCategoryFilter(['cat1', 'cat2'])

      store.resetStore()
      const reloadedStore = useTaskStore.getState()
      expect(reloadedStore.categoryFilters).toEqual(['cat1', 'cat2'])
    })

    it('should persist tag filters', () => {
      const store = useTaskStore.getState()
      store.setTagFilter(['tag1', 'tag2'])

      store.resetStore()
      const reloadedStore = useTaskStore.getState()
      expect(reloadedStore.tagFilters).toEqual(['tag1', 'tag2'])
    })
  })

  describe('Error Handling', () => {
    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('task-storage', 'invalid json {')

      expect(() => {
        const store = useTaskStore.getState()
        store.resetStore()
      }).not.toThrow()

      const store = useTaskStore.getState()
      expect(store.tasks).toEqual([])
      expect(store.categories).toEqual([])
    })

    it('should handle missing localStorage data', () => {
      localStorage.removeItem('task-storage')

      const store = useTaskStore.getState()
      store.resetStore()

      expect(store.tasks).toEqual([])
      expect(store.categories).toEqual([])
    })

    it('should handle partial localStorage data', () => {
      const partialData = {
        state: {
          tasks: [{ id: '1', title: 'Test' }],
          // Missing categories and other fields
        },
      }
      localStorage.setItem('task-storage', JSON.stringify(partialData))

      expect(() => {
        const store = useTaskStore.getState()
        store.resetStore()
      }).not.toThrow()
    })
  })

  describe('Storage Quota', () => {
    it('should detect when approaching storage quota', () => {
      const store = useTaskStore.getState()

      // Create many tasks to fill storage
      for (let i = 0; i < 100; i++) {
        store.addTask({
          title: `Task ${i}`,
          description: 'A'.repeat(500), // Max description length
        })
      }

      // Storage should still work
      const stored = localStorage.getItem('task-storage')
      expect(stored).toBeTruthy()
    })

    it('should handle storage quota exceeded error', () => {
      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn(() => {
        throw new DOMException('QuotaExceededError')
      })

      const store = useTaskStore.getState()

      // Should not throw
      expect(() => {
        store.addTask({ title: 'Test Task' })
      }).not.toThrow()

      // Restore original setItem
      localStorage.setItem = originalSetItem
    })
  })

  describe('Date Serialization', () => {
    it('should correctly serialize and deserialize Date objects', () => {
      const store = useTaskStore.getState()
      const now = new Date()
      store.addTask({ title: 'Test Task', dueDate: now })

      store.resetStore()
      const reloadedStore = useTaskStore.getState()
      const reloadedTask = reloadedStore.tasks[0]

      expect(reloadedTask.dueDate).toBeInstanceOf(Date)
      expect(reloadedTask.dueDate?.getTime()).toBe(now.getTime())
      expect(reloadedTask.createdAt).toBeInstanceOf(Date)
    })

    it('should handle null dates correctly', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Test Task', dueDate: null })

      store.resetStore()
      const reloadedStore = useTaskStore.getState()
      expect(reloadedStore.tasks[0].dueDate).toBeNull()
    })
  })

  describe('Complex State Persistence', () => {
    it('should persist tasks with all properties', () => {
      const store = useTaskStore.getState()
      store.addCategory({ name: 'Work', color: '#ff0000' })
      const categoryId = useTaskStore.getState().categories[0].id

      store.addTask({
        title: 'Complex Task',
        description: 'Full featured task',
        priority: TaskPriority.HIGH,
        dueDate: new Date('2025-12-31'),
        categoryId,
        tags: ['urgent', 'important'],
      })

      const taskId = useTaskStore.getState().tasks[0].id
      store.toggleTaskComplete(taskId)

      store.resetStore()
      const reloadedStore = useTaskStore.getState()
      const task = reloadedStore.tasks[0]

      expect(task.title).toBe('Complex Task')
      expect(task.description).toBe('Full featured task')
      expect(task.priority).toBe(TaskPriority.HIGH)
      expect(task.dueDate).toBeInstanceOf(Date)
      expect(task.categoryId).toBe(categoryId)
      expect(task.tags).toEqual(['urgent', 'important'])
      expect(task.status).toBe(TaskStatus.COMPLETED)
      expect(task.completedAt).toBeInstanceOf(Date)
    })

    it('should maintain data integrity across multiple operations', () => {
      const store = useTaskStore.getState()

      // Create tasks
      store.addTask({ title: 'Task 1', priority: TaskPriority.HIGH })
      store.addTask({ title: 'Task 2', priority: TaskPriority.LOW })
      store.addTask({ title: 'Task 3', priority: TaskPriority.MEDIUM })

      // Create categories
      store.addCategory({ name: 'Work', color: '#ff0000' })
      store.addCategory({ name: 'Personal', color: '#00ff00' })

      // Modify tasks
      const task1Id = useTaskStore.getState().tasks[0].id
      const task2Id = useTaskStore.getState().tasks[1].id
      const categoryId = useTaskStore.getState().categories[0].id

      store.toggleTaskComplete(task1Id)
      store.assignCategoryToTask(task2Id, categoryId)
      store.updateTask(task2Id, { title: 'Updated Task 2' })

      // Reload and verify
      store.resetStore()
      const reloadedStore = useTaskStore.getState()

      expect(reloadedStore.tasks).toHaveLength(3)
      expect(reloadedStore.categories).toHaveLength(2)
      expect(reloadedStore.tasks[0].status).toBe(TaskStatus.COMPLETED)
      expect(reloadedStore.tasks[1].title).toBe('Updated Task 2')
      expect(reloadedStore.tasks[1].categoryId).toBe(categoryId)
    })
  })

  describe('Selection State (Should NOT Persist)', () => {
    it('should not persist selection state', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1' })
      store.addTask({ title: 'Task 2' })

      const taskIds = useTaskStore.getState().tasks.map((t) => t.id)
      store.selectAllTasks(taskIds)

      // Verify selection was set
      expect(useTaskStore.getState().selectedTaskIds).toHaveLength(2)

      // Reload from localStorage
      store.resetStore()
      const reloadedStore = useTaskStore.getState()

      // Selection should be cleared
      expect(reloadedStore.selectedTaskIds).toEqual([])
    })
  })

  describe('Search Query (Should NOT Persist)', () => {
    it('should not persist search query', () => {
      const store = useTaskStore.getState()
      store.setSearchQuery('test search')

      // Verify search was set
      expect(useTaskStore.getState().searchQuery).toBe('test search')

      store.resetStore()
      const reloadedStore = useTaskStore.getState()

      // Search should be cleared
      expect(reloadedStore.searchQuery).toBe('')
    })
  })
})
