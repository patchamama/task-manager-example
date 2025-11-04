/**
 * Task Filter Tests - EPIC 2
 * User Story 2.2: Filter Tasks by Status
 *
 * Tests the ability to filter tasks by completion status
 * Filter options: All, Active, Completed
 * Persisted in URL state
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useTaskStore } from '../store/task.store'
import { TaskStatus } from '../types/task.types'

// Type extensions for EPIC 2
enum TaskFilter {
  ALL = 'all',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

describe('User Story 2.2: Filter Tasks by Status', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTaskStore.setState({
      tasks: [],
      currentFilter: 'all' as any,
      sortBy: 'dateCreated' as any,
      sortDirection: 'desc' as any,
      searchQuery: '',
    })
  })

  describe('Store - Filter State Management', () => {
    it('should have default filter of ALL', () => {
      // @ts-expect-error - currentFilter property doesn't exist yet
      const filter = useTaskStore.getState().currentFilter
      expect(filter).toBe(TaskFilter.ALL)
    })

    it('should set filter to ACTIVE', () => {
      // @ts-expect-error - setFilter action doesn't exist yet
      useTaskStore.getState().setFilter(TaskFilter.ACTIVE)

      // @ts-expect-error - currentFilter property doesn't exist yet
      const filter = useTaskStore.getState().currentFilter
      expect(filter).toBe(TaskFilter.ACTIVE)
    })

    it('should set filter to COMPLETED', () => {
      // @ts-expect-error - setFilter action doesn't exist yet
      useTaskStore.getState().setFilter(TaskFilter.COMPLETED)

      // @ts-expect-error - currentFilter property doesn't exist yet
      const filter = useTaskStore.getState().currentFilter
      expect(filter).toBe(TaskFilter.COMPLETED)
    })

    it('should set filter back to ALL', () => {
      // @ts-expect-error - setFilter action doesn't exist yet
      useTaskStore.getState().setFilter(TaskFilter.ACTIVE)
      // @ts-expect-error - setFilter action doesn't exist yet
      useTaskStore.getState().setFilter(TaskFilter.ALL)

      // @ts-expect-error - currentFilter property doesn't exist yet
      const filter = useTaskStore.getState().currentFilter
      expect(filter).toBe(TaskFilter.ALL)
    })
  })

  describe('Store - Filtered Task Retrieval', () => {
    beforeEach(() => {
      // Create mix of pending and completed tasks
      useTaskStore.getState().addTask({ title: 'Task 1' })
      useTaskStore.getState().addTask({ title: 'Task 2' })
      useTaskStore.getState().addTask({ title: 'Task 3' })
      useTaskStore.getState().addTask({ title: 'Task 4' })

      const tasks = useTaskStore.getState().tasks
      // Complete task 2 and task 4
      useTaskStore.getState().toggleTaskComplete(tasks[1].id)
      useTaskStore.getState().toggleTaskComplete(tasks[3].id)
    })

    it('should return all tasks when filter is ALL', () => {
      // @ts-expect-error - setFilter action doesn't exist yet
      useTaskStore.getState().setFilter(TaskFilter.ALL)

      // @ts-expect-error - getFilteredTasks action doesn't exist yet
      const filteredTasks = useTaskStore.getState().getFilteredTasks()

      expect(filteredTasks).toHaveLength(4)
    })

    it('should return only pending tasks when filter is ACTIVE', () => {
      // @ts-expect-error - setFilter action doesn't exist yet
      useTaskStore.getState().setFilter(TaskFilter.ACTIVE)

      // @ts-expect-error - getFilteredTasks action doesn't exist yet
      const filteredTasks = useTaskStore.getState().getFilteredTasks()

      expect(filteredTasks).toHaveLength(2)
      expect(filteredTasks.every(t => t.status === TaskStatus.PENDING)).toBe(true)
      expect(filteredTasks[0].title).toBe('Task 1')
      expect(filteredTasks[1].title).toBe('Task 3')
    })

    it('should return only completed tasks when filter is COMPLETED', () => {
      // @ts-expect-error - setFilter action doesn't exist yet
      useTaskStore.getState().setFilter(TaskFilter.COMPLETED)

      // @ts-expect-error - getFilteredTasks action doesn't exist yet
      const filteredTasks = useTaskStore.getState().getFilteredTasks()

      expect(filteredTasks).toHaveLength(2)
      expect(filteredTasks.every(t => t.status === TaskStatus.COMPLETED)).toBe(true)
      expect(filteredTasks[0].title).toBe('Task 2')
      expect(filteredTasks[1].title).toBe('Task 4')
    })

    it('should return empty array when no tasks match ACTIVE filter', () => {
      // Complete all tasks
      const tasks = useTaskStore.getState().tasks
      tasks.forEach(task => {
        if (task.status === TaskStatus.PENDING) {
          useTaskStore.getState().toggleTaskComplete(task.id)
        }
      })

      // @ts-expect-error - setFilter action doesn't exist yet
      useTaskStore.getState().setFilter(TaskFilter.ACTIVE)

      // @ts-expect-error - getFilteredTasks action doesn't exist yet
      const filteredTasks = useTaskStore.getState().getFilteredTasks()

      expect(filteredTasks).toHaveLength(0)
    })

    it('should return empty array when no tasks match COMPLETED filter', () => {
      // Reset and add only pending tasks
      const tasks = useTaskStore.getState().tasks
      tasks.forEach((task) => useTaskStore.getState().deleteTask(task.id))

      useTaskStore.getState().addTask({ title: 'Pending Task 1' })
      useTaskStore.getState().addTask({ title: 'Pending Task 2' })

      // @ts-expect-error - setFilter action doesn't exist yet
      useTaskStore.getState().setFilter(TaskFilter.COMPLETED)

      // @ts-expect-error - getFilteredTasks action doesn't exist yet
      const filteredTasks = useTaskStore.getState().getFilteredTasks()

      expect(filteredTasks).toHaveLength(0)
    })

    it('should update filtered tasks when task status changes', () => {
      // @ts-expect-error - setFilter action doesn't exist yet
      useTaskStore.getState().setFilter(TaskFilter.ACTIVE)

      // @ts-expect-error - getFilteredTasks action doesn't exist yet
      let filteredTasks = useTaskStore.getState().getFilteredTasks()
      expect(filteredTasks).toHaveLength(2) // Task 1 and Task 3

      // Complete Task 1
      const task1 = useTaskStore.getState().tasks.find(t => t.title === 'Task 1')
      if (task1) {
        useTaskStore.getState().toggleTaskComplete(task1.id)
      }

      // @ts-expect-error - getFilteredTasks action doesn't exist yet
      filteredTasks = useTaskStore.getState().getFilteredTasks()
      expect(filteredTasks).toHaveLength(1)
      expect(filteredTasks[0].title).toBe('Task 3')
    })

    it('should update filtered tasks when task is deleted', () => {
      // @ts-expect-error - setFilter action doesn't exist yet
      useTaskStore.getState().setFilter(TaskFilter.ACTIVE)

      // @ts-expect-error - getFilteredTasks action doesn't exist yet
      let filteredTasks = useTaskStore.getState().getFilteredTasks()
      expect(filteredTasks).toHaveLength(2)

      // Delete Task 1
      const task1 = useTaskStore.getState().tasks.find(t => t.title === 'Task 1')
      if (task1) {
        useTaskStore.getState().deleteTask(task1.id)
      }

      // @ts-expect-error - getFilteredTasks action doesn't exist yet
      filteredTasks = useTaskStore.getState().getFilteredTasks()
      expect(filteredTasks).toHaveLength(1)
      expect(filteredTasks[0].title).toBe('Task 3')
    })
  })

  describe('Store - Filter Count', () => {
    beforeEach(() => {
      // Create mix of pending and completed tasks
      useTaskStore.getState().addTask({ title: 'Task 1' })
      useTaskStore.getState().addTask({ title: 'Task 2' })
      useTaskStore.getState().addTask({ title: 'Task 3' })
      useTaskStore.getState().addTask({ title: 'Task 4' })
      useTaskStore.getState().addTask({ title: 'Task 5' })

      const tasks = useTaskStore.getState().tasks
      // Complete task 2 and task 4
      useTaskStore.getState().toggleTaskComplete(tasks[1].id)
      useTaskStore.getState().toggleTaskComplete(tasks[3].id)
    })

    it('should get count for ALL filter', () => {
      // @ts-expect-error - getFilterCount action doesn't exist yet
      const count = useTaskStore.getState().getFilterCount(TaskFilter.ALL)
      expect(count).toBe(5)
    })

    it('should get count for ACTIVE filter', () => {
      // @ts-expect-error - getFilterCount action doesn't exist yet
      const count = useTaskStore.getState().getFilterCount(TaskFilter.ACTIVE)
      expect(count).toBe(3)
    })

    it('should get count for COMPLETED filter', () => {
      // @ts-expect-error - getFilterCount action doesn't exist yet
      const count = useTaskStore.getState().getFilterCount(TaskFilter.COMPLETED)
      expect(count).toBe(2)
    })

    it('should return 0 for filter with no matching tasks', () => {
      // Delete all tasks
      const tasks = useTaskStore.getState().tasks
      tasks.forEach((task) => useTaskStore.getState().deleteTask(task.id))

      // @ts-expect-error - getFilterCount action doesn't exist yet
      const count = useTaskStore.getState().getFilterCount(TaskFilter.ALL)
      expect(count).toBe(0)
    })

    it('should update counts when tasks are added', () => {
      // @ts-expect-error - getFilterCount action doesn't exist yet
      const initialCount = useTaskStore.getState().getFilterCount(TaskFilter.ACTIVE)

      useTaskStore.getState().addTask({ title: 'New Task' })

      // @ts-expect-error - getFilterCount action doesn't exist yet
      const updatedCount = useTaskStore.getState().getFilterCount(TaskFilter.ACTIVE)
      expect(updatedCount).toBe(initialCount + 1)
    })
  })
})
