/**
 * Task Management - Type Definitions
 * EPIC 1: Task Management Core
 */

/**
 * Task status enum
 * User Story 1.5: Mark Task Complete
 */
export enum TaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

/**
 * Core Task interface
 * User Stories: 1.1, 1.2, 1.3, 1.4, 1.5
 */
export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
}

/**
 * Create Task DTO
 * User Story 1.1: Create Task
 */
export interface CreateTaskDto {
  title: string
  description?: string
}

/**
 * Update Task DTO
 * User Story 1.3: Edit Task
 */
export interface UpdateTaskDto {
  title?: string
  description?: string
  status?: TaskStatus
}

/**
 * Task Store State
 */
export interface TaskState {
  tasks: Task[]
  addTask: (dto: CreateTaskDto) => void
  updateTask: (id: string, dto: UpdateTaskDto) => void
  deleteTask: (id: string) => void
  toggleTaskComplete: (id: string) => void
  getTaskById: (id: string) => Task | undefined
  getCompletedCount: () => number
}
