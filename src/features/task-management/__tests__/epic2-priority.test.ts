/**
 * Task Priority Tests - EPIC 2
 * User Story 2.1: Add Task Priority
 *
 * Tests the ability to assign priority levels to tasks
 * Priority: Low, Medium, High, Critical
 * Default: Medium
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useTaskStore } from '../store/task.store'
import type { CreateTaskDto } from '../types/task.types'

// Type extensions for EPIC 2 (these will be added to task.types.ts)
enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

interface TaskWithPriority extends CreateTaskDto {
  priority?: TaskPriority
}

describe('User Story 2.1: Add Task Priority', () => {
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

  describe('Store - Priority Management', () => {
    it('should create task with default priority of MEDIUM', () => {
      const dto: CreateTaskDto = {
        title: 'Task without priority specified',
      }

      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - priority field doesn't exist yet
      expect(task.priority).toBe(TaskPriority.MEDIUM)
    })

    it('should create task with LOW priority', () => {
      const dto: TaskWithPriority = {
        title: 'Low priority task',
        priority: TaskPriority.LOW,
      }

      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - priority field doesn't exist yet
      expect(task.priority).toBe(TaskPriority.LOW)
    })

    it('should create task with MEDIUM priority', () => {
      const dto: TaskWithPriority = {
        title: 'Medium priority task',
        priority: TaskPriority.MEDIUM,
      }

      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - priority field doesn't exist yet
      expect(task.priority).toBe(TaskPriority.MEDIUM)
    })

    it('should create task with HIGH priority', () => {
      const dto: TaskWithPriority = {
        title: 'High priority task',
        priority: TaskPriority.HIGH,
      }

      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - priority field doesn't exist yet
      expect(task.priority).toBe(TaskPriority.HIGH)
    })

    it('should create task with CRITICAL priority', () => {
      const dto: TaskWithPriority = {
        title: 'Critical priority task',
        priority: TaskPriority.CRITICAL,
      }

      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - priority field doesn't exist yet
      expect(task.priority).toBe(TaskPriority.CRITICAL)
    })

    it('should update task priority', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - setPriority action doesn't exist yet
      useTaskStore.getState().setPriority(task.id, TaskPriority.HIGH)

      const updatedTask = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - priority field doesn't exist yet
      expect(updatedTask?.priority).toBe(TaskPriority.HIGH)
    })

    it('should update task priority from HIGH to LOW', () => {
      const dto: TaskWithPriority = {
        title: 'Task',
        priority: TaskPriority.HIGH,
      }

      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - setPriority action doesn't exist yet
      useTaskStore.getState().setPriority(task.id, TaskPriority.LOW)

      const updatedTask = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - priority field doesn't exist yet
      expect(updatedTask?.priority).toBe(TaskPriority.LOW)
    })

    it('should preserve priority when updating other fields', () => {
      const dto: TaskWithPriority = {
        title: 'Task',
        priority: TaskPriority.CRITICAL,
      }

      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      useTaskStore.getState().updateTask(task.id, {
        title: 'Updated Title',
      })

      const updatedTask = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - priority field doesn't exist yet
      expect(updatedTask?.priority).toBe(TaskPriority.CRITICAL)
    })

    it('should throw error when setting priority on non-existent task', () => {
      expect(() => {
        // @ts-expect-error - setPriority action doesn't exist yet
        useTaskStore.getState().setPriority('non-existent-id', TaskPriority.HIGH)
      }).toThrow('Task not found')
    })

    it('should maintain priority after toggling completion', () => {
      const dto: TaskWithPriority = {
        title: 'Task',
        priority: TaskPriority.HIGH,
      }

      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      useTaskStore.getState().toggleTaskComplete(task.id)

      const completedTask = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - priority field doesn't exist yet
      expect(completedTask?.priority).toBe(TaskPriority.HIGH)
    })
  })

  describe('Store - Priority Filtering and Sorting', () => {
    it('should get tasks by priority level', () => {
      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', priority: TaskPriority.LOW })
      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', priority: TaskPriority.HIGH })
      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 3', priority: TaskPriority.LOW })

      // @ts-expect-error - getTasksByPriority action doesn't exist yet
      const lowPriorityTasks = useTaskStore.getState().getTasksByPriority(TaskPriority.LOW)

      expect(lowPriorityTasks).toHaveLength(2)
      expect(lowPriorityTasks[0].title).toBe('Task 1')
      expect(lowPriorityTasks[1].title).toBe('Task 3')
    })

    it('should return empty array when no tasks match priority', () => {
      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', priority: TaskPriority.LOW })

      // @ts-expect-error - getTasksByPriority action doesn't exist yet
      const criticalTasks = useTaskStore.getState().getTasksByPriority(TaskPriority.CRITICAL)

      expect(criticalTasks).toHaveLength(0)
    })

    it('should count tasks by priority', () => {
      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', priority: TaskPriority.LOW })
      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', priority: TaskPriority.HIGH })
      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 3', priority: TaskPriority.HIGH })
      // @ts-expect-error - priority parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 4', priority: TaskPriority.CRITICAL })

      // @ts-expect-error - getPriorityCount action doesn't exist yet
      expect(useTaskStore.getState().getPriorityCount(TaskPriority.LOW)).toBe(1)
      // @ts-expect-error - getPriorityCount action doesn't exist yet
      expect(useTaskStore.getState().getPriorityCount(TaskPriority.HIGH)).toBe(2)
      // @ts-expect-error - getPriorityCount action doesn't exist yet
      expect(useTaskStore.getState().getPriorityCount(TaskPriority.CRITICAL)).toBe(1)
    })
  })
})
