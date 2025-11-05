/**
 * EPIC 4.4: Drag and Drop Reorder Tests
 * User Story 4.4: Drag and Drop Reorder
 *
 * Tests for drag and drop task reordering functionality
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useTaskStore } from '../store/task.store'
import { TaskStatus, TaskPriority } from '../types/task.types'

describe('EPIC 4.4: Drag and Drop Reorder', () => {
  beforeEach(() => {
    const store = useTaskStore.getState()
    store.resetStore()
  })

  describe('Custom Order Field', () => {
    it('should initialize new tasks with customOrder based on current task count', () => {
      const store = useTaskStore.getState()

      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 3', status: TaskStatus.PENDING })

      const tasks = useTaskStore.getState().tasks
      expect(tasks[0].customOrder).toBe(0)
      expect(tasks[1].customOrder).toBe(1)
      expect(tasks[2].customOrder).toBe(2)
    })

    it('should maintain customOrder when tasks are deleted', () => {
      const store = useTaskStore.getState()

      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 3', status: TaskStatus.PENDING })

      const task2Id = useTaskStore.getState().tasks[1].id
      store.deleteTask(task2Id)

      const tasks = useTaskStore.getState().tasks
      expect(tasks).toHaveLength(2)
      expect(tasks[0].customOrder).toBe(0)
      expect(tasks[1].customOrder).toBe(2) // Order preserved
    })
  })

  describe('Reorder Tasks', () => {
    it('should reorder tasks based on provided task IDs array', () => {
      const store = useTaskStore.getState()

      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 3', status: TaskStatus.PENDING })

      const tasks = useTaskStore.getState().tasks
      const taskIds = [tasks[2].id, tasks[0].id, tasks[1].id] // Reorder: 3, 1, 2

      store.reorderTasks(taskIds)

      const reorderedTasks = useTaskStore.getState().tasks
      expect(reorderedTasks[0].title).toBe('Task 3')
      expect(reorderedTasks[0].customOrder).toBe(0)
      expect(reorderedTasks[1].title).toBe('Task 1')
      expect(reorderedTasks[1].customOrder).toBe(1)
      expect(reorderedTasks[2].title).toBe('Task 2')
      expect(reorderedTasks[2].customOrder).toBe(2)
    })

    it('should update updatedAt timestamp when reordering', () => {
      const store = useTaskStore.getState()

      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })

      const tasks = useTaskStore.getState().tasks
      const originalTimestamp = tasks[0].updatedAt

      // Wait a bit to ensure timestamp difference
      const taskIds = [tasks[1].id, tasks[0].id]
      store.reorderTasks(taskIds)

      const reorderedTasks = useTaskStore.getState().tasks
      expect(reorderedTasks[0].updatedAt.getTime()).toBeGreaterThan(originalTimestamp.getTime())
    })

    it('should handle reordering with partial task ID array', () => {
      const store = useTaskStore.getState()

      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 3', status: TaskStatus.PENDING })

      const tasks = useTaskStore.getState().tasks
      // Only provide IDs for tasks 2 and 3, omitting task 1
      const taskIds = [tasks[1].id, tasks[2].id]

      store.reorderTasks(taskIds)

      const reorderedTasks = useTaskStore.getState().tasks
      expect(reorderedTasks).toHaveLength(3)
    })
  })

  describe('Move Task Up (Keyboard Accessibility)', () => {
    it('should move a task up one position', () => {
      const store = useTaskStore.getState()

      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 3', status: TaskStatus.PENDING })

      const task3Id = useTaskStore.getState().tasks[2].id
      store.moveTaskUp(task3Id)

      const tasks = useTaskStore.getState().tasks
      expect(tasks[0].title).toBe('Task 1')
      expect(tasks[1].title).toBe('Task 3')
      expect(tasks[2].title).toBe('Task 2')
    })

    it('should not move first task up', () => {
      const store = useTaskStore.getState()

      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })

      const task1Id = useTaskStore.getState().tasks[0].id
      store.moveTaskUp(task1Id)

      const tasks = useTaskStore.getState().tasks
      expect(tasks[0].title).toBe('Task 1')
      expect(tasks[1].title).toBe('Task 2')
    })

    it('should handle moving up non-existent task gracefully', () => {
      const store = useTaskStore.getState()

      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })

      expect(() => {
        store.moveTaskUp('non-existent-id')
      }).not.toThrow()
    })
  })

  describe('Move Task Down (Keyboard Accessibility)', () => {
    it('should move a task down one position', () => {
      const store = useTaskStore.getState()

      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 3', status: TaskStatus.PENDING })

      const task1Id = useTaskStore.getState().tasks[0].id
      store.moveTaskDown(task1Id)

      const tasks = useTaskStore.getState().tasks
      expect(tasks[0].title).toBe('Task 2')
      expect(tasks[1].title).toBe('Task 1')
      expect(tasks[2].title).toBe('Task 3')
    })

    it('should not move last task down', () => {
      const store = useTaskStore.getState()

      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })

      const task2Id = useTaskStore.getState().tasks[1].id
      store.moveTaskDown(task2Id)

      const tasks = useTaskStore.getState().tasks
      expect(tasks[0].title).toBe('Task 1')
      expect(tasks[1].title).toBe('Task 2')
    })

    it('should handle moving down non-existent task gracefully', () => {
      const store = useTaskStore.getState()

      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })

      expect(() => {
        store.moveTaskDown('non-existent-id')
      }).not.toThrow()
    })
  })

  describe('Move Task to Position', () => {
    it('should move a task to a specific position', () => {
      const store = useTaskStore.getState()

      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 3', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 4', status: TaskStatus.PENDING })

      const task1Id = useTaskStore.getState().tasks[0].id
      store.moveTaskToPosition(task1Id, 2) // Move Task 1 to position 2 (0-indexed)

      const tasks = useTaskStore.getState().tasks
      expect(tasks[0].title).toBe('Task 2')
      expect(tasks[1].title).toBe('Task 3')
      expect(tasks[2].title).toBe('Task 1')
      expect(tasks[3].title).toBe('Task 4')
    })

    it('should handle moving to the same position', () => {
      const store = useTaskStore.getState()

      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })

      const task1Id = useTaskStore.getState().tasks[0].id
      store.moveTaskToPosition(task1Id, 0)

      const tasks = useTaskStore.getState().tasks
      expect(tasks[0].title).toBe('Task 1')
      expect(tasks[1].title).toBe('Task 2')
    })

    it('should handle invalid position gracefully', () => {
      const store = useTaskStore.getState()

      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })

      const task1Id = useTaskStore.getState().tasks[0].id

      expect(() => {
        store.moveTaskToPosition(task1Id, -1)
      }).not.toThrow()

      expect(() => {
        store.moveTaskToPosition(task1Id, 999)
      }).not.toThrow()
    })

    it('should handle moving non-existent task gracefully', () => {
      const store = useTaskStore.getState()

      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })

      expect(() => {
        store.moveTaskToPosition('non-existent-id', 0)
      }).not.toThrow()
    })
  })

  describe('Reorder Persistence', () => {
    it('should respect customOrder when getting filtered tasks', () => {
      const store = useTaskStore.getState()

      store.addTask({ title: 'Task 1', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 2', status: TaskStatus.PENDING })
      store.addTask({ title: 'Task 3', status: TaskStatus.PENDING })

      const tasks = useTaskStore.getState().tasks
      const taskIds = [tasks[2].id, tasks[0].id, tasks[1].id]
      store.reorderTasks(taskIds)

      const filteredTasks = store.getFilteredTasks()
      expect(filteredTasks[0].title).toBe('Task 3')
      expect(filteredTasks[1].title).toBe('Task 1')
      expect(filteredTasks[2].title).toBe('Task 2')
    })

    it('should maintain custom order with sorting disabled', () => {
      const store = useTaskStore.getState()

      store.addTask({ title: 'B Task', status: TaskStatus.PENDING, priority: TaskPriority.LOW })
      store.addTask({ title: 'A Task', status: TaskStatus.PENDING, priority: TaskPriority.HIGH })
      store.addTask({ title: 'C Task', status: TaskStatus.PENDING, priority: TaskPriority.MEDIUM })

      const tasks = useTaskStore.getState().tasks
      const taskIds = [tasks[1].id, tasks[2].id, tasks[0].id] // A, C, B
      store.reorderTasks(taskIds)

      // When getting tasks without explicit sorting, should use customOrder
      const reorderedTasks = useTaskStore.getState().tasks
      expect(reorderedTasks[0].title).toBe('A Task')
      expect(reorderedTasks[1].title).toBe('C Task')
      expect(reorderedTasks[2].title).toBe('B Task')
    })
  })
})
