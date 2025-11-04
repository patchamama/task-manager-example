/**
 * Task Management - Type Definitions
 * EPIC 1: Task Management Core
 * EPIC 2: Task Organization
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
 * Task priority enum
 * User Story 2.1: Add Task Priority
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Task filter enum
 * User Story 2.2: Filter Tasks by Status
 */
export enum TaskFilter {
  ALL = 'all',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

/**
 * Task sort by enum
 * User Story 2.3: Sort Tasks
 */
export enum TaskSortBy {
  DATE_CREATED = 'dateCreated',
  PRIORITY = 'priority',
  TITLE = 'title',
  DUE_DATE = 'dueDate',
}

/**
 * Task sort direction enum
 * User Story 2.3: Sort Tasks
 */
export enum TaskSortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Core Task interface
 * User Stories: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.5
 */
export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
}

/**
 * Create Task DTO
 * User Story 1.1: Create Task
 * User Story 2.1: Add Task Priority
 * User Story 2.5: Add Due Dates
 */
export interface CreateTaskDto {
  title: string
  description?: string
  priority?: TaskPriority
  dueDate?: Date | null
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
  currentFilter: TaskFilter
  sortBy: TaskSortBy
  sortDirection: TaskSortDirection
  searchQuery: string

  // EPIC 1 Actions
  addTask: (dto: CreateTaskDto) => void
  updateTask: (id: string, dto: UpdateTaskDto) => void
  deleteTask: (id: string) => void
  toggleTaskComplete: (id: string) => void
  getTaskById: (id: string) => Task | undefined
  getCompletedCount: () => number

  // EPIC 2 Priority Actions
  setPriority: (id: string, priority: TaskPriority) => void
  getTasksByPriority: (priority: TaskPriority) => Task[]
  getPriorityCount: (priority: TaskPriority) => number

  // EPIC 2 Filter Actions
  setFilter: (filter: TaskFilter) => void
  getFilteredTasks: () => Task[]
  getFilterCount: (filter: TaskFilter) => number

  // EPIC 2 Sort Actions
  setSortBy: (sortBy: TaskSortBy) => void
  setSortDirection: (direction: TaskSortDirection) => void
  toggleSortDirection: () => void
  getSortedTasks: () => Task[]
  loadSortPreference: () => void

  // EPIC 2 Search Actions
  setSearchQuery: (query: string) => void
  clearSearch: () => void
  getSearchResults: () => Task[]
  getSearchResultCount: () => number

  // EPIC 2 Due Date Actions
  setDueDate: (id: string, dueDate: Date) => void
  clearDueDate: (id: string) => void
  isOverdue: (id: string) => boolean
  getOverdueTasks: () => Task[]
  getTasksDueToday: () => Task[]
  getTasksDueThisWeek: () => Task[]
  getTasksWithoutDueDate: () => Task[]
  getTasksWithDueDateCount: () => number
  getOverdueTaskCount: () => number

  // EPIC 2 Combined Actions
  getFilteredAndSortedTasks: () => Task[]
  getFilteredAndSearchedTasks: () => Task[]
  getSearchedAndSortedTasks: () => Task[]
  getFilteredSearchedAndSortedTasks: () => Task[]
}
