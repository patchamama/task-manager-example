/**
 * EPIC 4.5: Bulk Actions Tests
 * User Story 4.5: Bulk Actions
 *
 * Tests for bulk task operations functionality
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useTaskStore } from '../store/task.store'
import { TaskStatus, TaskPriority } from '../types/task.types'

describe('EPIC 4.5: Bulk Actions', () => {
  beforeEach(() => {
    const store = useTaskStore.getState()
    store.resetStore()
  })

  describe('Selection State Management', () => {
    it('should initialize with empty selection', () => {
      const store = useTaskStore.getState()
      expect(store.selectedTaskIds).toEqual([])
    })

    it('should add task to selection', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      const taskId = useTaskStore.getState().tasks[0].id

      store.selectTask(taskId)

      expect(useTaskStore.getState().selectedTaskIds).toContain(taskId)
    })

    it('should remove task from selection', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      const taskId = useTaskStore.getState().tasks[0].id

      store.selectTask(taskId)
      store.deselectTask(taskId)

      expect(useTaskStore.getState().selectedTaskIds).not.toContain(taskId)
    })

    it('should toggle task selection', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      const taskId = useTaskStore.getState().tasks[0].id

      store.toggleTaskSelection(taskId)
      expect(useTaskStore.getState().selectedTaskIds).toContain(taskId)

      store.toggleTaskSelection(taskId)
      expect(useTaskStore.getState().selectedTaskIds).not.toContain(taskId)
    })

    it('should select all tasks', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 3', status: TaskStatus.PENDING })

      const taskIds = useTaskStore.getState().tasks.map((t) => t.id)
      store.selectAllTasks(taskIds)

      expect(useTaskStore.getState().selectedTaskIds).toHaveLength(3)
      expect(useTaskStore.getState().selectedTaskIds).toEqual(taskIds)
    })

    it('should deselect all tasks', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })

      const taskIds = useTaskStore.getState().tasks.map((t) => t.id)
      store.selectAllTasks(taskIds)
      store.clearSelection()

      expect(useTaskStore.getState().selectedTaskIds).toEqual([])
    })

    it('should get selection count', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })

      const taskIds = useTaskStore.getState().tasks.map((t) => t.id)
      store.selectTask(taskIds[0])
      store.selectTask(taskIds[1])

      expect(store.getSelectionCount()).toBe(2)
    })

    it('should check if all tasks are selected', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })

      const taskIds = useTaskStore.getState().tasks.map((t) => t.id)

      expect(store.areAllTasksSelected(taskIds)).toBe(false)

      store.selectAllTasks(taskIds)
      expect(store.areAllTasksSelected(taskIds)).toBe(true)
    })
  })

  describe('Bulk Complete Tasks', () => {
    it('should mark multiple tasks as complete', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 3', status: TaskStatus.PENDING })

      const taskIds = useTaskStore.getState().tasks.slice(0, 2).map((t) => t.id)
      store.bulkCompleteTask(taskIds)

      const tasks = useTaskStore.getState().tasks
      expect(tasks[0].status).toBe(TaskStatus.COMPLETED)
      expect(tasks[1].status).toBe(TaskStatus.COMPLETED)
      expect(tasks[2].status).toBe(TaskStatus.PENDING)
    })

    it('should set completedAt timestamp for bulk completed tasks', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })

      const taskIds = useTaskStore.getState().tasks.map((t) => t.id)
      store.bulkCompleteTask(taskIds)

      const tasks = useTaskStore.getState().tasks
      expect(tasks[0].completedAt).not.toBeNull()
      expect(tasks[1].completedAt).not.toBeNull()
    })

    it('should clear selection after bulk complete', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })

      const taskIds = useTaskStore.getState().tasks.map((t) => t.id)
      store.selectAllTasks(taskIds)
      store.bulkCompleteTask(taskIds)

      expect(useTaskStore.getState().selectedTaskIds).toEqual([])
    })

    it('should handle empty selection gracefully', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })

      expect(() => {
        store.bulkCompleteTask([])
      }).not.toThrow()
    })
  })

  describe('Bulk Delete Tasks', () => {
    it('should delete multiple tasks', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 3', status: TaskStatus.PENDING })

      const taskIds = useTaskStore.getState().tasks.slice(0, 2).map((t) => t.id)
      store.bulkDeleteTasks(taskIds)

      const tasks = useTaskStore.getState().tasks
      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toBe('Task 3')
    })

    it('should clear selection after bulk delete', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })

      const taskIds = useTaskStore.getState().tasks.map((t) => t.id)
      store.selectAllTasks(taskIds)
      store.bulkDeleteTasks(taskIds)

      expect(useTaskStore.getState().selectedTaskIds).toEqual([])
    })

    it('should handle deleting non-existent tasks gracefully', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })

      expect(() => {
        store.bulkDeleteTasks(['non-existent-id'])
      }).not.toThrow()
    })

    it('should handle empty selection gracefully', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })

      expect(() => {
        store.bulkDeleteTasks([])
      }).not.toThrow()
    })
  })

  describe('Bulk Change Category', () => {
    it('should change category for multiple tasks', () => {
      const store = useTaskStore.getState()

      // Create category
      store.addCategory({ name: 'Work', color: '#ff0000' })
      const categoryId = useTaskStore.getState().categories[0].id

      // Create tasks
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 3', status: TaskStatus.PENDING })

      const taskIds = useTaskStore.getState().tasks.slice(0, 2).map((t) => t.id)
      store.bulkChangeCategory(taskIds, categoryId)

      const tasks = useTaskStore.getState().tasks
      expect(tasks[0].categoryId).toBe(categoryId)
      expect(tasks[1].categoryId).toBe(categoryId)
      expect(tasks[2].categoryId).toBeNull()
    })

    it('should remove category from multiple tasks', () => {
      const store = useTaskStore.getState()

      // Create category
      store.addCategory({ name: 'Work', color: '#ff0000' })
      const categoryId = useTaskStore.getState().categories[0].id

      // Create tasks with category
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING, categoryId })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING, categoryId })

      const taskIds = useTaskStore.getState().tasks.map((t) => t.id)
      store.bulkChangeCategory(taskIds, null)

      const tasks = useTaskStore.getState().tasks
      expect(tasks[0].categoryId).toBeNull()
      expect(tasks[1].categoryId).toBeNull()
    })

    it('should clear selection after bulk category change', () => {
      const store = useTaskStore.getState()

      store.addCategory({ name: 'Work', color: '#ff0000' })
      const categoryId = useTaskStore.getState().categories[0].id

      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })

      const taskIds = useTaskStore.getState().tasks.map((t) => t.id)
      store.selectAllTasks(taskIds)
      store.bulkChangeCategory(taskIds, categoryId)

      expect(useTaskStore.getState().selectedTaskIds).toEqual([])
    })

    it('should handle empty selection gracefully', () => {
      const store = useTaskStore.getState()
      store.addCategory({ name: 'Work', color: '#ff0000' })
      const categoryId = useTaskStore.getState().categories[0].id

      expect(() => {
        store.bulkChangeCategory([], categoryId)
      }).not.toThrow()
    })

    it('should handle invalid category ID gracefully', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      const taskId = useTaskStore.getState().tasks[0].id

      // Should not throw, but also should not change category
      store.bulkChangeCategory([taskId], 'non-existent-category')

      const task = useTaskStore.getState().tasks[0]
      expect(task.categoryId).toBeNull()
    })
  })

  describe('Selection Persistence', () => {
    it('should clear selection when tasks are deleted individually', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })

      const taskIds = useTaskStore.getState().tasks.map((t) => t.id)
      store.selectAllTasks(taskIds)

      store.deleteTask(taskIds[0])

      expect(useTaskStore.getState().selectedTaskIds).not.toContain(taskIds[0])
      expect(useTaskStore.getState().selectedTaskIds).toHaveLength(1)
    })

    it('should maintain selection when toggling task completion', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      const taskId = useTaskStore.getState().tasks[0].id

      store.selectTask(taskId)
      store.toggleTaskComplete(taskId)

      expect(useTaskStore.getState().selectedTaskIds).toContain(taskId)
    })
  })

  describe('Get Selected Tasks', () => {
    it('should return array of selected tasks', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 3', status: TaskStatus.PENDING })

      const taskIds = useTaskStore.getState().tasks.slice(0, 2).map((t) => t.id)
      store.selectTask(taskIds[0])
      store.selectTask(taskIds[1])

      const selectedTasks = store.getSelectedTasks()
      expect(selectedTasks).toHaveLength(2)
      expect(selectedTasks[0].title).toBe('Task 1')
      expect(selectedTasks[1].title).toBe('Task 2')
    })

    it('should return empty array when no tasks selected', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })

      const selectedTasks = store.getSelectedTasks()
      expect(selectedTasks).toEqual([])
    })
  })
})
