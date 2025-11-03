/**
 * Task Store
 * EPIC 1: Task Management Core
 *
 * Zustand store for task state management
 */

import { create } from 'zustand'
import type { TaskState, CreateTaskDto, UpdateTaskDto, Task } from '../types/task.types'
import { TaskStatus } from '../types/task.types'

/**
 * Generate unique ID for tasks with sequence counter
 */
let idSequence = 0
const generateId = (): string => {
  idSequence++
  return `${Date.now()}-${idSequence}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate task data
 */
const validateTask = (dto: CreateTaskDto | UpdateTaskDto): void => {
  if ('title' in dto && dto.title !== undefined) {
    if (dto.title === '') {
      throw new Error('Title is required')
    }
    if (dto.title.length > 100) {
      throw new Error('Title must not exceed 100 characters')
    }
  }

  if ('description' in dto && dto.description !== undefined && dto.description.length > 500) {
    throw new Error('Description must not exceed 500 characters')
  }
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],

  addTask: (dto: CreateTaskDto) => {
    validateTask(dto)

    const now = new Date()
    const newTask: Task = {
      id: generateId(),
      title: dto.title,
      description: dto.description || '',
      status: TaskStatus.PENDING,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    }

    set((state) => ({
      tasks: [...state.tasks, newTask]
    }))
  },

  updateTask: (id: string, dto: UpdateTaskDto) => {
    const task = get().getTaskById(id)
    if (!task) {
      throw new Error('Task not found')
    }

    validateTask(dto)

    const now = new Date()
    // Ensure updatedAt is always after the previous timestamp
    const updatedAt = now.getTime() > task.updatedAt.getTime() ? now : new Date(task.updatedAt.getTime() + 1)

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              ...dto,
              updatedAt,
            }
          : t
      )
    }))
  },

  deleteTask: (id: string) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id)
    }))
  },

  toggleTaskComplete: (id: string) => {
    const task = get().getTaskById(id)
    if (!task) return

    const newStatus = task.status === TaskStatus.PENDING ? TaskStatus.COMPLETED : TaskStatus.PENDING
    const now = new Date()
    // Ensure updatedAt is always after the previous timestamp (only add 1ms if same)
    const updatedAt = now.getTime() === task.updatedAt.getTime() ? new Date(task.updatedAt.getTime() + 1) : now

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: newStatus,
              updatedAt,
              completedAt: newStatus === TaskStatus.COMPLETED ? now : null,
            }
          : t
      )
    }))
  },

  getTaskById: (id: string) => {
    return get().tasks.find((t) => t.id === id)
  },

  getCompletedCount: () => {
    return get().tasks.filter((t) => t.status === TaskStatus.COMPLETED).length
  },
}))
