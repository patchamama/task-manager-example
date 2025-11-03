/**
 * Task Store Tests
 * EPIC 1: Task Management Core
 *
 * Tests the Zustand store for task state management
 * All User Stories: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useTaskStore } from '../store/task.store'
import { TaskStatus, type CreateTaskDto, type UpdateTaskDto } from '../types/task.types'

describe('Task Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { tasks } = useTaskStore.getState()
    tasks.forEach((task) => useTaskStore.getState().deleteTask(task.id))
  })

  describe('User Story 1.1: Create Task', () => {
    it('should add a new task with required title', () => {
      const dto: CreateTaskDto = {
        title: 'Test Task',
      }

      useTaskStore.getState().addTask(dto)
      const tasks = useTaskStore.getState().tasks

      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toBe('Test Task')
      expect(tasks[0].id).toBeDefined()
    })

    it('should add a task with title and optional description', () => {
      const dto: CreateTaskDto = {
        title: 'Task with Description',
        description: 'This is a detailed description',
      }

      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      expect(task.title).toBe('Task with Description')
      expect(task.description).toBe('This is a detailed description')
    })

    it('should add a task with empty description when not provided', () => {
      const dto: CreateTaskDto = {
        title: 'Task without Description',
      }

      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      expect(task.description).toBe('')
    })

    it('should create task with pending status by default', () => {
      const dto: CreateTaskDto = {
        title: 'New Task',
      }

      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      expect(task.status).toBe(TaskStatus.PENDING)
    })

    it('should create task with creation timestamp', () => {
      const beforeCreate = new Date()

      const dto: CreateTaskDto = {
        title: 'Task with Timestamp',
      }

      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]
      const afterCreate = new Date()

      expect(task.createdAt).toBeInstanceOf(Date)
      expect(task.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime())
      expect(task.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime())
    })

    it('should create task with updatedAt equal to createdAt initially', () => {
      const dto: CreateTaskDto = {
        title: 'New Task',
      }

      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      expect(task.updatedAt).toBeInstanceOf(Date)
      expect(task.updatedAt.getTime()).toBe(task.createdAt.getTime())
    })

    it('should create task with null completedAt', () => {
      const dto: CreateTaskDto = {
        title: 'New Task',
      }

      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      expect(task.completedAt).toBeNull()
    })

    it('should validate title length (max 100 chars)', () => {
      const longTitle = 'a'.repeat(101)
      const dto: CreateTaskDto = {
        title: longTitle,
      }

      expect(() => {
        useTaskStore.getState().addTask(dto)
      }).toThrow('Title must not exceed 100 characters')
    })

    it('should allow title with exactly 100 characters', () => {
      const maxTitle = 'a'.repeat(100)
      const dto: CreateTaskDto = {
        title: maxTitle,
      }

      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      expect(task.title).toBe(maxTitle)
      expect(task.title.length).toBe(100)
    })

    it('should validate description length (max 500 chars)', () => {
      const longDescription = 'a'.repeat(501)
      const dto: CreateTaskDto = {
        title: 'Task',
        description: longDescription,
      }

      expect(() => {
        useTaskStore.getState().addTask(dto)
      }).toThrow('Description must not exceed 500 characters')
    })

    it('should allow description with exactly 500 characters', () => {
      const maxDescription = 'a'.repeat(500)
      const dto: CreateTaskDto = {
        title: 'Task',
        description: maxDescription,
      }

      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      expect(task.description).toBe(maxDescription)
      expect(task.description.length).toBe(500)
    })

    it('should require title (not empty string)', () => {
      const dto: CreateTaskDto = {
        title: '',
      }

      expect(() => {
        useTaskStore.getState().addTask(dto)
      }).toThrow('Title is required')
    })

    it('should generate unique IDs for multiple tasks', () => {
      useTaskStore.getState().addTask({ title: 'Task 1' })
      useTaskStore.getState().addTask({ title: 'Task 2' })
      useTaskStore.getState().addTask({ title: 'Task 3' })

      const tasks = useTaskStore.getState().tasks
      const ids = tasks.map((t) => t.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(3)
    })
  })

  describe('User Story 1.2: View Task List', () => {
    it('should return empty array when no tasks exist', () => {
      const tasks = useTaskStore.getState().tasks

      expect(tasks).toEqual([])
      expect(tasks).toHaveLength(0)
    })

    it('should return all tasks in the list', () => {
      useTaskStore.getState().addTask({ title: 'Task 1' })
      useTaskStore.getState().addTask({ title: 'Task 2' })
      useTaskStore.getState().addTask({ title: 'Task 3' })

      const tasks = useTaskStore.getState().tasks

      expect(tasks).toHaveLength(3)
      expect(tasks[0].title).toBe('Task 1')
      expect(tasks[1].title).toBe('Task 2')
      expect(tasks[2].title).toBe('Task 3')
    })

    it('should sort tasks by creation date (newest first)', () => {
      // Add tasks with slight delay to ensure different timestamps
      useTaskStore.getState().addTask({ title: 'First Task' })

      // Simulate time passing
      const secondTaskTime = new Date(Date.now() + 100)
      useTaskStore.getState().addTask({ title: 'Second Task' })

      const thirdTaskTime = new Date(Date.now() + 200)
      useTaskStore.getState().addTask({ title: 'Third Task' })

      const tasks = useTaskStore.getState().tasks

      // Newest should be first
      expect(tasks[0].title).toBe('Third Task')
      expect(tasks[1].title).toBe('Second Task')
      expect(tasks[2].title).toBe('First Task')
    })

    it('should retrieve specific task by ID', () => {
      useTaskStore.getState().addTask({ title: 'Task 1' })
      useTaskStore.getState().addTask({ title: 'Task 2' })

      const tasks = useTaskStore.getState().tasks
      const taskId = tasks[1].id

      const foundTask = useTaskStore.getState().getTaskById(taskId)

      expect(foundTask).toBeDefined()
      expect(foundTask?.title).toBe('Task 2')
    })

    it('should return undefined for non-existent task ID', () => {
      useTaskStore.getState().addTask({ title: 'Task 1' })

      const foundTask = useTaskStore.getState().getTaskById('non-existent-id')

      expect(foundTask).toBeUndefined()
    })
  })

  describe('User Story 1.3: Edit Task', () => {
    it('should update task title', () => {
      useTaskStore.getState().addTask({ title: 'Original Title' })
      const task = useTaskStore.getState().tasks[0]

      const updateDto: UpdateTaskDto = {
        title: 'Updated Title',
      }

      useTaskStore.getState().updateTask(task.id, updateDto)
      const updatedTask = useTaskStore.getState().getTaskById(task.id)

      expect(updatedTask?.title).toBe('Updated Title')
    })

    it('should update task description', () => {
      useTaskStore.getState().addTask({
        title: 'Task',
        description: 'Original Description'
      })
      const task = useTaskStore.getState().tasks[0]

      const updateDto: UpdateTaskDto = {
        description: 'Updated Description',
      }

      useTaskStore.getState().updateTask(task.id, updateDto)
      const updatedTask = useTaskStore.getState().getTaskById(task.id)

      expect(updatedTask?.description).toBe('Updated Description')
    })

    it('should update both title and description', () => {
      useTaskStore.getState().addTask({
        title: 'Original Title',
        description: 'Original Description'
      })
      const task = useTaskStore.getState().tasks[0]

      const updateDto: UpdateTaskDto = {
        title: 'New Title',
        description: 'New Description',
      }

      useTaskStore.getState().updateTask(task.id, updateDto)
      const updatedTask = useTaskStore.getState().getTaskById(task.id)

      expect(updatedTask?.title).toBe('New Title')
      expect(updatedTask?.description).toBe('New Description')
    })

    it('should update only provided fields', () => {
      useTaskStore.getState().addTask({
        title: 'Original Title',
        description: 'Original Description'
      })
      const task = useTaskStore.getState().tasks[0]

      const updateDto: UpdateTaskDto = {
        title: 'New Title',
        // description not provided
      }

      useTaskStore.getState().updateTask(task.id, updateDto)
      const updatedTask = useTaskStore.getState().getTaskById(task.id)

      expect(updatedTask?.title).toBe('New Title')
      expect(updatedTask?.description).toBe('Original Description')
    })

    it('should update the updatedAt timestamp', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]
      const originalUpdatedAt = task.updatedAt

      // Simulate time passing
      const updateTime = new Date(Date.now() + 1000)

      const updateDto: UpdateTaskDto = {
        title: 'Updated Task',
      }

      useTaskStore.getState().updateTask(task.id, updateDto)
      const updatedTask = useTaskStore.getState().getTaskById(task.id)

      expect(updatedTask?.updatedAt).toBeInstanceOf(Date)
      expect(updatedTask?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })

    it('should not modify createdAt when updating', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]
      const originalCreatedAt = task.createdAt

      const updateDto: UpdateTaskDto = {
        title: 'Updated Task',
      }

      useTaskStore.getState().updateTask(task.id, updateDto)
      const updatedTask = useTaskStore.getState().getTaskById(task.id)

      expect(updatedTask?.createdAt.getTime()).toBe(originalCreatedAt.getTime())
    })

    it('should validate title length on update (max 100 chars)', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      const longTitle = 'a'.repeat(101)
      const updateDto: UpdateTaskDto = {
        title: longTitle,
      }

      expect(() => {
        useTaskStore.getState().updateTask(task.id, updateDto)
      }).toThrow('Title must not exceed 100 characters')
    })

    it('should validate description length on update (max 500 chars)', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      const longDescription = 'a'.repeat(501)
      const updateDto: UpdateTaskDto = {
        description: longDescription,
      }

      expect(() => {
        useTaskStore.getState().updateTask(task.id, updateDto)
      }).toThrow('Description must not exceed 500 characters')
    })

    it('should throw error when updating non-existent task', () => {
      const updateDto: UpdateTaskDto = {
        title: 'Updated Title',
      }

      expect(() => {
        useTaskStore.getState().updateTask('non-existent-id', updateDto)
      }).toThrow('Task not found')
    })
  })

  describe('User Story 1.4: Delete Task', () => {
    it('should remove task from list', () => {
      useTaskStore.getState().addTask({ title: 'Task to Delete' })
      const task = useTaskStore.getState().tasks[0]

      expect(useTaskStore.getState().tasks).toHaveLength(1)

      useTaskStore.getState().deleteTask(task.id)

      expect(useTaskStore.getState().tasks).toHaveLength(0)
    })

    it('should remove only the specified task', () => {
      useTaskStore.getState().addTask({ title: 'Task 1' })
      useTaskStore.getState().addTask({ title: 'Task 2' })
      useTaskStore.getState().addTask({ title: 'Task 3' })

      const tasks = useTaskStore.getState().tasks
      const taskToDelete = tasks[1]

      useTaskStore.getState().deleteTask(taskToDelete.id)

      const remainingTasks = useTaskStore.getState().tasks
      expect(remainingTasks).toHaveLength(2)
      expect(remainingTasks.find(t => t.id === taskToDelete.id)).toBeUndefined()
      expect(remainingTasks[0].title).toBe('Task 1')
      expect(remainingTasks[1].title).toBe('Task 3')
    })

    it('should not throw error when deleting non-existent task', () => {
      useTaskStore.getState().addTask({ title: 'Task 1' })

      expect(() => {
        useTaskStore.getState().deleteTask('non-existent-id')
      }).not.toThrow()

      expect(useTaskStore.getState().tasks).toHaveLength(1)
    })
  })

  describe('User Story 1.5: Mark Task Complete', () => {
    it('should toggle task from pending to completed', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      expect(task.status).toBe(TaskStatus.PENDING)

      useTaskStore.getState().toggleTaskComplete(task.id)

      const updatedTask = useTaskStore.getState().getTaskById(task.id)
      expect(updatedTask?.status).toBe(TaskStatus.COMPLETED)
    })

    it('should toggle task from completed to pending', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      // Complete the task
      useTaskStore.getState().toggleTaskComplete(task.id)
      expect(useTaskStore.getState().getTaskById(task.id)?.status).toBe(TaskStatus.COMPLETED)

      // Uncomplete the task
      useTaskStore.getState().toggleTaskComplete(task.id)

      const updatedTask = useTaskStore.getState().getTaskById(task.id)
      expect(updatedTask?.status).toBe(TaskStatus.PENDING)
    })

    it('should set completedAt timestamp when marking as completed', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      const beforeComplete = new Date()
      useTaskStore.getState().toggleTaskComplete(task.id)
      const afterComplete = new Date()

      const completedTask = useTaskStore.getState().getTaskById(task.id)

      expect(completedTask?.completedAt).toBeInstanceOf(Date)
      expect(completedTask?.completedAt?.getTime()).toBeGreaterThanOrEqual(beforeComplete.getTime())
      expect(completedTask?.completedAt?.getTime()).toBeLessThanOrEqual(afterComplete.getTime())
    })

    it('should clear completedAt timestamp when unmarking as completed', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      // Complete the task
      useTaskStore.getState().toggleTaskComplete(task.id)
      expect(useTaskStore.getState().getTaskById(task.id)?.completedAt).not.toBeNull()

      // Uncomplete the task
      useTaskStore.getState().toggleTaskComplete(task.id)

      const uncompletedTask = useTaskStore.getState().getTaskById(task.id)
      expect(uncompletedTask?.completedAt).toBeNull()
    })

    it('should update updatedAt when toggling completion', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]
      const originalUpdatedAt = task.updatedAt

      useTaskStore.getState().toggleTaskComplete(task.id)

      const updatedTask = useTaskStore.getState().getTaskById(task.id)
      expect(updatedTask?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })

    it('should get completed task count', () => {
      useTaskStore.getState().addTask({ title: 'Task 1' })
      useTaskStore.getState().addTask({ title: 'Task 2' })
      useTaskStore.getState().addTask({ title: 'Task 3' })

      expect(useTaskStore.getState().getCompletedCount()).toBe(0)

      const tasks = useTaskStore.getState().tasks
      useTaskStore.getState().toggleTaskComplete(tasks[0].id)
      expect(useTaskStore.getState().getCompletedCount()).toBe(1)

      useTaskStore.getState().toggleTaskComplete(tasks[1].id)
      expect(useTaskStore.getState().getCompletedCount()).toBe(2)
    })

    it('should handle toggle on non-existent task gracefully', () => {
      expect(() => {
        useTaskStore.getState().toggleTaskComplete('non-existent-id')
      }).not.toThrow()
    })
  })
})
