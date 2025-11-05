/**
 * Task Management - Type Definitions
 * EPIC 1: Task Management Core
 * EPIC 2: Task Organization
 * EPIC 3: Categories & Tags
 * EPIC 4.4: Drag and Drop Reorder
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
 * Category interface
 * User Story 3.1: Create Categories
 */
export interface Category {
  id: string
  name: string
  color: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Create Category DTO
 * User Story 3.1: Create Categories
 */
export interface CreateCategoryDto {
  name: string
  color: string
}

/**
 * Update Category DTO
 * User Story 3.1: Create Categories
 */
export interface UpdateCategoryDto {
  name?: string
  color?: string
}

/**
 * Core Task interface
 * User Stories: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.5, 3.2, 3.4, 4.4
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
  categoryId: string | null // User Story 3.2: Assign Category to Task
  tags: string[] // User Story 3.4: Add Tags to Tasks
  customOrder: number // User Story 4.4: Drag and Drop Reorder
}

/**
 * Create Task DTO
 * User Story 1.1: Create Task
 * User Story 2.1: Add Task Priority
 * User Story 2.5: Add Due Dates
 * User Story 3.2: Assign Category to Task
 * User Story 3.4: Add Tags to Tasks
 */
export interface CreateTaskDto {
  title: string
  description?: string
  priority?: TaskPriority
  dueDate?: Date | null
  categoryId?: string | null
  tags?: string[]
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
  categories: Category[]
  currentFilter: TaskFilter
  categoryFilters: string[]
  tagFilters: string[]
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

  // EPIC 3 Category Actions
  addCategory: (dto: CreateCategoryDto) => void
  updateCategory: (id: string, dto: UpdateCategoryDto) => void
  deleteCategory: (id: string) => void
  getCategoryById: (id: string) => Category | undefined
  getAllCategories: () => Category[]
  getCategoryCount: () => number
  getCategoryTaskCount: (categoryId: string) => number
  assignCategoryToTask: (taskId: string, categoryId: string | null) => void
  getTasksByCategory: (categoryId: string | null) => Task[]
  getUncategorizedTasks: () => Task[]
  setCategoryFilter: (categoryIds: string[]) => void
  clearCategoryFilter: () => void
  getFilteredTasksByCategory: () => Task[]

  // EPIC 3 Tag Actions
  addTagToTask: (taskId: string, tag: string) => void
  removeTagFromTask: (taskId: string, tag: string) => void
  removeTag: (tag: string) => void
  renameTag: (oldTag: string, newTag: string) => void
  mergeTag: (sourceTags: string[], targetTag: string) => void
  getAllTags: () => string[]
  getTagCount: (tag: string) => number
  getTasksByTag: (tag: string) => Task[]
  getTagsWithCount: () => Array<{ tag: string; count: number }>
  setTagFilter: (tags: string[]) => void
  clearTagFilter: () => void
  getFilteredTasksByTag: () => Task[]

  // EPIC 4.4 Drag and Drop Reorder Actions
  reorderTasks: (taskIds: string[]) => void
  moveTaskUp: (taskId: string) => void
  moveTaskDown: (taskId: string) => void
  moveTaskToPosition: (taskId: string, newPosition: number) => void
}
