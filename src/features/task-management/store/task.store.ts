/**
 * Task Store
 * EPIC 1: Task Management Core
 * EPIC 2: Task Organization
 * EPIC 3: Categories & Tags
 * EPIC 4.4: Drag and Drop Reorder
 * EPIC 4.5: Bulk Actions
 * EPIC 5.1: LocalStorage Persistence
 * EPIC 5.2: Export Tasks
 *
 * Zustand store for task state management with localStorage persistence and export functionality
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TaskState, CreateTaskDto, UpdateTaskDto, Task, Category, CreateCategoryDto, UpdateCategoryDto } from '../types/task.types'
import { TaskStatus, TaskPriority, TaskFilter, TaskSortBy, TaskSortDirection } from '../types/task.types'

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

/**
 * Validate due date
 */
const validateDueDate = (dueDate: Date): void => {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfDueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

  if (startOfDueDate < startOfToday) {
    throw new Error('Due date cannot be in the past')
  }
}

/**
 * LocalStorage helper for sort preferences
 */
const SORT_PREFERENCE_KEY = 'taskSortPreference'

const saveSortPreference = (sortBy: TaskSortBy, sortDirection: TaskSortDirection): void => {
  try {
    localStorage.setItem(SORT_PREFERENCE_KEY, JSON.stringify({ sortBy, sortDirection }))
  } catch (e) {
    // Ignore localStorage errors
  }
}

const loadSortPreferenceFromStorage = (): { sortBy: TaskSortBy; sortDirection: TaskSortDirection } | null => {
  try {
    const stored = localStorage.getItem(SORT_PREFERENCE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    // Ignore errors (corrupted data)
  }
  return null
}

const initialState = {
  tasks: [],
  categories: [],
  currentFilter: TaskFilter.ALL,
  categoryFilters: [],
  tagFilters: [],
  sortBy: TaskSortBy.DATE_CREATED,
  sortDirection: TaskSortDirection.DESC,
  searchQuery: '',
  selectedTaskIds: [], // EPIC 4.5: Bulk Actions
}

/**
 * Custom storage with error handling for quota exceeded and corrupted data
 */
const customStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name)
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded. Data not saved.')
        // Silently fail - don't throw to prevent app crash
      } else {
        console.error('Error writing to localStorage:', error)
      }
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  },
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      // State
      ...initialState,

  // EPIC 1: Task CRUD Actions
  addTask: (dto: CreateTaskDto) => {
    validateTask(dto)

    // Validate due date if provided
    if (dto.dueDate) {
      validateDueDate(dto.dueDate)
    }

    // Validate category if provided
    if (dto.categoryId) {
      const category = get().getCategoryById(dto.categoryId)
      if (!category) {
        throw new Error('Category not found')
      }
    }

    // Validate tags if provided
    if (dto.tags && dto.tags.length > 10) {
      throw new Error('Maximum 10 tags per task allowed')
    }

    const now = new Date()
    const currentTasks = get().tasks
    const newTask: Task = {
      id: generateId(),
      title: dto.title,
      description: dto.description || '',
      status: TaskStatus.PENDING,
      priority: dto.priority || TaskPriority.MEDIUM,
      dueDate: dto.dueDate || null,
      categoryId: dto.categoryId || null, // EPIC 3: Support category on creation
      tags: dto.tags || [], // EPIC 3: Support tags on creation
      customOrder: currentTasks.length, // EPIC 4.4: Set order based on current count
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    }

    set((state) => ({
      tasks: [...state.tasks, newTask],
    }))
  },

  updateTask: (id: string, dto: UpdateTaskDto) => {
    const task = get().getTaskById(id)
    if (!task) {
      throw new Error('Task not found')
    }

    validateTask(dto)

    const now = new Date()
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
      ),
    }))
  },

  deleteTask: (id: string) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      selectedTaskIds: state.selectedTaskIds.filter((selectedId) => selectedId !== id), // EPIC 4.5: Remove from selection
    }))
  },

  toggleTaskComplete: (id: string) => {
    const task = get().getTaskById(id)
    if (!task) return

    const newStatus = task.status === TaskStatus.PENDING ? TaskStatus.COMPLETED : TaskStatus.PENDING
    const now = new Date()
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
      ),
    }))
  },

  getTaskById: (id: string) => {
    return get().tasks.find((t) => t.id === id)
  },

  getCompletedCount: () => {
    return get().tasks.filter((t) => t.status === TaskStatus.COMPLETED).length
  },

  // EPIC 2: Priority Actions
  setPriority: (id: string, priority: TaskPriority) => {
    const task = get().getTaskById(id)
    if (!task) {
      throw new Error('Task not found')
    }

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              priority,
              updatedAt: new Date(),
            }
          : t
      ),
    }))
  },

  getTasksByPriority: (priority: TaskPriority) => {
    return get().tasks.filter((t) => t.priority === priority)
  },

  getPriorityCount: (priority: TaskPriority) => {
    return get().tasks.filter((t) => t.priority === priority).length
  },

  // EPIC 2: Filter Actions
  setFilter: (filter: TaskFilter) => {
    set({ currentFilter: filter })
  },

  getFilteredTasks: () => {
    const { tasks, currentFilter } = get()

    if (currentFilter === TaskFilter.ALL) {
      return tasks
    }

    if (currentFilter === TaskFilter.ACTIVE) {
      return tasks.filter((t) => t.status === TaskStatus.PENDING)
    }

    if (currentFilter === TaskFilter.COMPLETED) {
      return tasks.filter((t) => t.status === TaskStatus.COMPLETED)
    }

    return tasks
  },

  getFilterCount: (filter: TaskFilter) => {
    const { tasks } = get()

    if (filter === TaskFilter.ALL) {
      return tasks.length
    }

    if (filter === TaskFilter.ACTIVE) {
      return tasks.filter((t) => t.status === TaskStatus.PENDING).length
    }

    if (filter === TaskFilter.COMPLETED) {
      return tasks.filter((t) => t.status === TaskStatus.COMPLETED).length
    }

    return 0
  },

  // EPIC 2: Sort Actions
  setSortBy: (sortBy: TaskSortBy) => {
    const { sortDirection } = get()
    set({ sortBy })
    saveSortPreference(sortBy, sortDirection)
  },

  setSortDirection: (direction: TaskSortDirection) => {
    const { sortBy } = get()
    set({ sortDirection: direction })
    saveSortPreference(sortBy, direction)
  },

  toggleSortDirection: () => {
    const { sortDirection, sortBy } = get()
    const newDirection = sortDirection === TaskSortDirection.ASC ? TaskSortDirection.DESC : TaskSortDirection.ASC
    set({ sortDirection: newDirection })
    saveSortPreference(sortBy, newDirection)
  },

  getSortedTasks: () => {
    const { tasks, sortBy, sortDirection } = get()
    const tasksCopy = [...tasks]

    const priorityOrder = {
      [TaskPriority.LOW]: 1,
      [TaskPriority.MEDIUM]: 2,
      [TaskPriority.HIGH]: 3,
      [TaskPriority.CRITICAL]: 4,
    }

    tasksCopy.sort((a, b) => {
      let comparison = 0

      if (sortBy === TaskSortBy.DATE_CREATED) {
        comparison = a.createdAt.getTime() - b.createdAt.getTime()
      } else if (sortBy === TaskSortBy.PRIORITY) {
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
        // Stable sort by creation date for same priority
        if (comparison === 0) {
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
        }
      } else if (sortBy === TaskSortBy.TITLE) {
        comparison = a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      } else if (sortBy === TaskSortBy.DUE_DATE) {
        // Tasks with due dates come first, then tasks without (in both ASC and DESC)
        if (a.dueDate && b.dueDate) {
          // Both have due dates - sort by date
          comparison = a.dueDate.getTime() - b.dueDate.getTime()
        } else if (a.dueDate && !b.dueDate) {
          // a has date, b doesn't - a comes first regardless of direction
          return -1
        } else if (!a.dueDate && b.dueDate) {
          // b has date, a doesn't - b comes first regardless of direction
          return 1
        } else {
          // Neither has due date - maintain order
          comparison = 0
        }
      }

      return sortDirection === TaskSortDirection.ASC ? comparison : -comparison
    })

    return tasksCopy
  },

  loadSortPreference: () => {
    const preference = loadSortPreferenceFromStorage()
    if (preference) {
      set({
        sortBy: preference.sortBy,
        sortDirection: preference.sortDirection,
      })
    }
  },

  // EPIC 2: Search Actions
  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  clearSearch: () => {
    set({ searchQuery: '' })
  },

  getSearchResults: () => {
    const { tasks, searchQuery } = get()
    const trimmedQuery = searchQuery.trim()

    if (!trimmedQuery) {
      return tasks
    }

    const lowerQuery = trimmedQuery.toLowerCase()

    return tasks.filter((t) => {
      const titleMatch = t.title.toLowerCase().includes(lowerQuery)
      const descriptionMatch = t.description.toLowerCase().includes(lowerQuery)
      return titleMatch || descriptionMatch
    })
  },

  getSearchResultCount: () => {
    return get().getSearchResults().length
  },

  // EPIC 2: Due Date Actions
  setDueDate: (id: string, dueDate: Date) => {
    const task = get().getTaskById(id)
    if (!task) {
      throw new Error('Task not found')
    }

    validateDueDate(dueDate)

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              dueDate,
              updatedAt: new Date(),
            }
          : t
      ),
    }))
  },

  clearDueDate: (id: string) => {
    const task = get().getTaskById(id)
    if (!task) return

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              dueDate: null,
              updatedAt: new Date(),
            }
          : t
      ),
    }))
  },

  isOverdue: (id: string) => {
    const task = get().getTaskById(id)
    if (!task || !task.dueDate || task.status === TaskStatus.COMPLETED) {
      return false
    }

    const now = new Date()
    return task.dueDate.getTime() < now.getTime()
  },

  getOverdueTasks: () => {
    const { tasks } = get()
    const now = new Date()

    return tasks.filter((t) => {
      if (!t.dueDate || t.status === TaskStatus.COMPLETED) {
        return false
      }
      return t.dueDate.getTime() < now.getTime()
    })
  },

  getTasksDueToday: () => {
    const { tasks } = get()
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    return tasks.filter((t) => {
      if (!t.dueDate) return false
      const dueTime = t.dueDate.getTime()
      return dueTime >= startOfToday.getTime() && dueTime <= endOfToday.getTime()
    })
  },

  getTasksDueThisWeek: () => {
    const { tasks } = get()
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfWeek = new Date(startOfToday)
    endOfWeek.setDate(endOfWeek.getDate() + 7)
    // Set to end of the 7th day
    endOfWeek.setHours(23, 59, 59, 999)

    return tasks.filter((t) => {
      if (!t.dueDate) return false
      const dueTime = t.dueDate.getTime()
      return dueTime >= startOfToday.getTime() && dueTime <= endOfWeek.getTime()
    })
  },

  getTasksWithoutDueDate: () => {
    return get().tasks.filter((t) => !t.dueDate)
  },

  getTasksWithDueDateCount: () => {
    return get().tasks.filter((t) => t.dueDate !== null).length
  },

  getOverdueTaskCount: () => {
    return get().getOverdueTasks().length
  },

  // EPIC 2: Combined Actions
  getFilteredAndSortedTasks: () => {
    const { currentFilter, sortBy, sortDirection } = get()
    const filtered = get().getFilteredTasks()

    const priorityOrder = {
      [TaskPriority.LOW]: 1,
      [TaskPriority.MEDIUM]: 2,
      [TaskPriority.HIGH]: 3,
      [TaskPriority.CRITICAL]: 4,
    }

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0

      if (sortBy === TaskSortBy.DATE_CREATED) {
        comparison = a.createdAt.getTime() - b.createdAt.getTime()
      } else if (sortBy === TaskSortBy.PRIORITY) {
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
        if (comparison === 0) {
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
        }
      } else if (sortBy === TaskSortBy.TITLE) {
        comparison = a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      } else if (sortBy === TaskSortBy.DUE_DATE) {
        if (a.dueDate && b.dueDate) {
          comparison = a.dueDate.getTime() - b.dueDate.getTime()
        } else if (a.dueDate) {
          comparison = -1
        } else if (b.dueDate) {
          comparison = 1
        } else {
          comparison = 0
        }
      }

      return sortDirection === TaskSortDirection.ASC ? comparison : -comparison
    })

    return sorted
  },

  getFilteredAndSearchedTasks: () => {
    const filtered = get().getFilteredTasks()
    const { searchQuery } = get()
    const trimmedQuery = searchQuery.trim()

    if (!trimmedQuery) {
      return filtered
    }

    const lowerQuery = trimmedQuery.toLowerCase()

    return filtered.filter((t) => {
      const titleMatch = t.title.toLowerCase().includes(lowerQuery)
      const descriptionMatch = t.description.toLowerCase().includes(lowerQuery)
      return titleMatch || descriptionMatch
    })
  },

  getSearchedAndSortedTasks: () => {
    const searched = get().getSearchResults()
    const { sortBy, sortDirection } = get()

    const priorityOrder = {
      [TaskPriority.LOW]: 1,
      [TaskPriority.MEDIUM]: 2,
      [TaskPriority.HIGH]: 3,
      [TaskPriority.CRITICAL]: 4,
    }

    const sorted = [...searched].sort((a, b) => {
      let comparison = 0

      if (sortBy === TaskSortBy.DATE_CREATED) {
        comparison = a.createdAt.getTime() - b.createdAt.getTime()
      } else if (sortBy === TaskSortBy.PRIORITY) {
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
        if (comparison === 0) {
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
        }
      } else if (sortBy === TaskSortBy.TITLE) {
        comparison = a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      } else if (sortBy === TaskSortBy.DUE_DATE) {
        if (a.dueDate && b.dueDate) {
          comparison = a.dueDate.getTime() - b.dueDate.getTime()
        } else if (a.dueDate) {
          comparison = -1
        } else if (b.dueDate) {
          comparison = 1
        } else {
          comparison = 0
        }
      }

      return sortDirection === TaskSortDirection.ASC ? comparison : -comparison
    })

    return sorted
  },

  getFilteredSearchedAndSortedTasks: () => {
    const filteredAndSearched = get().getFilteredAndSearchedTasks()
    const { sortBy, sortDirection } = get()

    const priorityOrder = {
      [TaskPriority.LOW]: 1,
      [TaskPriority.MEDIUM]: 2,
      [TaskPriority.HIGH]: 3,
      [TaskPriority.CRITICAL]: 4,
    }

    const sorted = [...filteredAndSearched].sort((a, b) => {
      let comparison = 0

      if (sortBy === TaskSortBy.DATE_CREATED) {
        comparison = a.createdAt.getTime() - b.createdAt.getTime()
      } else if (sortBy === TaskSortBy.PRIORITY) {
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
        if (comparison === 0) {
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
        }
      } else if (sortBy === TaskSortBy.TITLE) {
        comparison = a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      } else if (sortBy === TaskSortBy.DUE_DATE) {
        if (a.dueDate && b.dueDate) {
          comparison = a.dueDate.getTime() - b.dueDate.getTime()
        } else if (a.dueDate) {
          comparison = -1
        } else if (b.dueDate) {
          comparison = 1
        } else {
          comparison = 0
        }
      }

      return sortDirection === TaskSortDirection.ASC ? comparison : -comparison
    })

    return sorted
  },

  // EPIC 3: Category Actions
  addCategory: (dto: CreateCategoryDto) => {
    const { categories } = get()

    // Validate: Max 20 categories
    if (categories.length >= 20) {
      throw new Error('Maximum 20 categories allowed')
    }

    // Validate: Name is required
    if (!dto.name || dto.name.trim() === '') {
      throw new Error('Category name is required')
    }

    // Validate: Unique name
    const normalizedName = dto.name.trim().toLowerCase()
    if (categories.some((c) => c.name.toLowerCase() === normalizedName)) {
      throw new Error('Category name must be unique')
    }

    // Validate: Color is required
    if (!dto.color || dto.color.trim() === '') {
      throw new Error('Category color is required')
    }

    // Validate: Valid hex format
    if (!/^#?[0-9A-F]{6}$/i.test(dto.color)) {
      throw new Error('Category color must be a valid hex color')
    }

    // Normalize color: ensure it has # prefix and is lowercase
    const normalizedColor = (dto.color.startsWith('#') ? dto.color : `#${dto.color}`).toLowerCase()

    const now = new Date()
    const newCategory: Category = {
      id: generateId(),
      name: dto.name.trim(),
      color: normalizedColor,
      createdAt: now,
      updatedAt: now,
    }

    set((state) => ({
      categories: [...state.categories, newCategory],
    }))
  },

  updateCategory: (id: string, dto: UpdateCategoryDto) => {
    const { categories } = get()
    const category = categories.find((c) => c.id === id)

    if (!category) {
      throw new Error('Category not found')
    }

    // Validate name if provided
    if (dto.name !== undefined) {
      if (dto.name.trim() === '') {
        throw new Error('Category name cannot be empty')
      }

      // Check uniqueness (excluding current category)
      const normalizedName = dto.name.trim().toLowerCase()
      if (categories.some((c) => c.id !== id && c.name.toLowerCase() === normalizedName)) {
        throw new Error('Category name must be unique')
      }
    }

    // Validate color if provided
    if (dto.color !== undefined) {
      if (dto.color.trim() === '') {
        throw new Error('Category color is required')
      }
      if (!/^#?[0-9A-F]{6}$/i.test(dto.color)) {
        throw new Error('Category color must be a valid hex color')
      }
    }

    // Normalize color if provided
    const normalizedColor = dto.color
      ? (dto.color.startsWith('#') ? dto.color : `#${dto.color}`).toLowerCase()
      : undefined

    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id
          ? {
              ...c,
              ...(dto.name !== undefined && { name: dto.name.trim() }),
              ...(normalizedColor !== undefined && { color: normalizedColor }),
              updatedAt: new Date(),
            }
          : c
      ),
    }))
  },

  deleteCategory: (id: string) => {
    const { categories } = get()
    const category = categories.find((c) => c.id === id)

    if (!category) {
      throw new Error('Category not found')
    }

    // Remove category and unassign from all tasks
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
      tasks: state.tasks.map((t) => (t.categoryId === id ? { ...t, categoryId: null } : t)),
      categoryFilters: state.categoryFilters.filter((f) => f !== id),
    }))
  },

  getCategoryById: (id: string) => {
    return get().categories.find((c) => c.id === id)
  },

  getAllCategories: () => {
    return get().categories
  },

  getCategoryCount: () => {
    return get().categories.length
  },

  getCategoryTaskCount: (categoryId: string) => {
    return get().tasks.filter((t) => t.categoryId === categoryId).length
  },

  assignCategoryToTask: (taskId: string, categoryId: string | null) => {
    const task = get().getTaskById(taskId)
    if (!task) {
      throw new Error('Task not found')
    }

    // Validate category exists if not null
    if (categoryId !== null) {
      const category = get().getCategoryById(categoryId)
      if (!category) {
        throw new Error('Category not found')
      }
    }

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              categoryId,
              updatedAt: new Date(),
            }
          : t
      ),
    }))
  },

  getTasksByCategory: (categoryId: string | null) => {
    return get().tasks.filter((t) => t.categoryId === categoryId)
  },

  getUncategorizedTasks: () => {
    return get().tasks.filter((t) => t.categoryId === null)
  },

  setCategoryFilter: (categoryIds: string[]) => {
    set({ categoryFilters: categoryIds })
  },

  clearCategoryFilter: () => {
    set({ categoryFilters: [] })
  },

  getFilteredTasksByCategory: () => {
    const { tasks, categoryFilters } = get()

    if (categoryFilters.length === 0) {
      return tasks
    }

    // Handle 'uncategorized' filter
    if (categoryFilters.includes('uncategorized')) {
      const categorizedTasks = tasks.filter((t) => {
        // Include tasks with selected categories (excluding 'uncategorized')
        const selectedCategories = categoryFilters.filter((f) => f !== 'uncategorized')
        return selectedCategories.includes(t.categoryId || '')
      })

      const uncategorizedTasks = tasks.filter((t) => t.categoryId === null)

      // Combine and deduplicate
      const combined = [...categorizedTasks, ...uncategorizedTasks]
      return Array.from(new Set(combined.map((t) => t.id))).map((id) => combined.find((t) => t.id === id)!)
    }

    return tasks.filter((t) => categoryFilters.includes(t.categoryId || ''))
  },

  // EPIC 3: Tag Actions
  addTagToTask: (taskId: string, tag: string) => {
    const task = get().getTaskById(taskId)
    if (!task) {
      throw new Error('Task not found')
    }

    const normalizedTag = tag.trim().toLowerCase()

    if (!normalizedTag) {
      throw new Error('Tag name cannot be empty')
    }

    // Validate tag length (max 30 characters)
    if (normalizedTag.length > 30) {
      throw new Error('Tag name must not exceed 30 characters')
    }

    // Check if tag already exists on task
    if (task.tags.some((t) => t.toLowerCase() === normalizedTag)) {
      throw new Error('Tag already exists')
    }

    // Validate max 10 tags per task
    if (task.tags.length >= 10) {
      throw new Error('Maximum 10 tags per task')
    }

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              tags: [...t.tags, tag.trim()],
              updatedAt: new Date(),
            }
          : t
      ),
    }))
  },

  removeTagFromTask: (taskId: string, tag: string) => {
    const task = get().getTaskById(taskId)
    if (!task) {
      throw new Error('Task not found')
    }

    const normalizedTag = tag.trim().toLowerCase()

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              tags: t.tags.filter((existingTag) => existingTag.toLowerCase() !== normalizedTag),
              updatedAt: new Date(),
            }
          : t
      ),
    }))
  },

  removeTag: (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase()

    set((state) => ({
      tasks: state.tasks.map((t) => ({
        ...t,
        tags: t.tags.filter((existingTag) => existingTag.toLowerCase() !== normalizedTag),
      })),
      tagFilters: state.tagFilters.filter((f) => f.toLowerCase() !== normalizedTag),
    }))
  },

  renameTag: (oldTag: string, newTag: string) => {
    const normalizedOld = oldTag.trim().toLowerCase()
    const normalizedNew = newTag.trim().toLowerCase()

    if (!normalizedNew) {
      throw new Error('Tag name cannot be empty')
    }

    // Get all tasks with the old tag
    const { tasks } = get()
    const affectedTasks = tasks.filter((t) => t.tags.some((tag) => tag.toLowerCase() === normalizedOld))

    if (affectedTasks.length === 0) {
      throw new Error('Tag not found')
    }

    set((state) => ({
      tasks: state.tasks.map((t) => ({
        ...t,
        tags: t.tags.map((tag) => (tag.toLowerCase() === normalizedOld ? newTag.trim() : tag)),
      })),
      tagFilters: state.tagFilters.map((f) => (f.toLowerCase() === normalizedOld ? newTag.trim() : f)),
    }))
  },

  mergeTag: (sourceTags: string[], targetTag: string) => {
    // Validate inputs
    if (sourceTags.length === 0) {
      throw new Error('Must provide at least one tag to merge')
    }

    const normalizedTarget = targetTag.trim().toLowerCase()
    const normalizedSources = sourceTags.map((t) => t.trim().toLowerCase())

    if (!normalizedTarget) {
      throw new Error('Target tag name cannot be empty')
    }

    set((state) => ({
      tasks: state.tasks.map((t) => {
        const hasSources = t.tags.some((tag) => normalizedSources.includes(tag.toLowerCase()))

        if (!hasSources) return t

        // Remove source tags and add target tag if not present
        const filteredTags = t.tags.filter((tag) => !normalizedSources.includes(tag.toLowerCase()))

        const hasTarget = t.tags.some((tag) => tag.toLowerCase() === normalizedTarget)

        const targetTagNormalized = targetTag.trim().toLowerCase()

        return {
          ...t,
          tags: hasTarget ? filteredTags : [...filteredTags, targetTagNormalized],
        }
      }),
      tagFilters: state.tagFilters
        .filter((f) => !normalizedSources.includes(f.toLowerCase()))
        .concat(state.tagFilters.some((f) => f.toLowerCase() === normalizedTarget) ? [] : [targetTag.trim().toLowerCase()]),
    }))
  },

  getAllTags: () => {
    const { tasks } = get()
    const allTags = tasks.flatMap((t) => t.tags)
    // Return unique tags (case-insensitive)
    const uniqueTags: string[] = []
    const seen = new Set<string>()

    for (const tag of allTags) {
      const normalized = tag.toLowerCase()
      if (!seen.has(normalized)) {
        seen.add(normalized)
        uniqueTags.push(tag)
      }
    }

    return uniqueTags.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  },

  getTagCount: (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase()
    return get().tasks.filter((t) => t.tags.some((existingTag) => existingTag.toLowerCase() === normalizedTag)).length
  },

  getTasksByTag: (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase()
    return get().tasks.filter((t) => t.tags.some((existingTag) => existingTag.toLowerCase() === normalizedTag))
  },

  getTagsWithCount: () => {
    const allTags = get().getAllTags()

    const tagsWithCount = allTags.map((tag) => ({
      tag,
      count: get().getTagCount(tag),
    }))

    // Sort by count descending, then by tag name ascending
    return tagsWithCount.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count
      }
      return a.tag.toLowerCase().localeCompare(b.tag.toLowerCase())
    })
  },

  setTagFilter: (tags: string[]) => {
    set({ tagFilters: tags })
  },

  clearTagFilter: () => {
    set({ tagFilters: [] })
  },

  getFilteredTasksByTag: () => {
    const { tasks, tagFilters } = get()

    if (tagFilters.length === 0) {
      return tasks
    }

    // OR logic: task matches if it has ANY of the selected tags
    return tasks.filter((t) => {
      return tagFilters.some((filterTag) => {
        const normalizedFilter = filterTag.trim().toLowerCase()
        return t.tags.some((taskTag) => taskTag.toLowerCase() === normalizedFilter)
      })
    })
  },

  // EPIC 4.4: Drag and Drop Reorder Actions
  reorderTasks: (taskIds: string[]) => {
    const tasks = get().tasks
    const now = new Date()

    // Create a map of task IDs to their new order
    const orderMap = new Map(taskIds.map((id, index) => [id, index]))

    // Update tasks with new customOrder values
    const updatedTasks = tasks.map((task) => {
      if (orderMap.has(task.id)) {
        return {
          ...task,
          customOrder: orderMap.get(task.id)!,
          updatedAt: new Date(now.getTime() + 1), // Ensure timestamp difference
        }
      }
      return task
    })

    // Sort by new customOrder
    updatedTasks.sort((a, b) => a.customOrder - b.customOrder)

    set({ tasks: updatedTasks })
  },

  moveTaskUp: (taskId: string) => {
    const tasks = get().tasks.slice().sort((a, b) => a.customOrder - b.customOrder)
    const currentIndex = tasks.findIndex((t) => t.id === taskId)

    if (currentIndex <= 0) {
      // Already at the top or not found
      return
    }

    // Swap with previous task
    const newTaskIds = tasks.map((t) => t.id)
    ;[newTaskIds[currentIndex - 1], newTaskIds[currentIndex]] = [newTaskIds[currentIndex], newTaskIds[currentIndex - 1]]

    get().reorderTasks(newTaskIds)
  },

  moveTaskDown: (taskId: string) => {
    const tasks = get().tasks.slice().sort((a, b) => a.customOrder - b.customOrder)
    const currentIndex = tasks.findIndex((t) => t.id === taskId)

    if (currentIndex === -1 || currentIndex >= tasks.length - 1) {
      // Not found or already at the bottom
      return
    }

    // Swap with next task
    const newTaskIds = tasks.map((t) => t.id)
    ;[newTaskIds[currentIndex], newTaskIds[currentIndex + 1]] = [newTaskIds[currentIndex + 1], newTaskIds[currentIndex]]

    get().reorderTasks(newTaskIds)
  },

  moveTaskToPosition: (taskId: string, newPosition: number) => {
    const tasks = get().tasks.slice().sort((a, b) => a.customOrder - b.customOrder)
    const currentIndex = tasks.findIndex((t) => t.id === taskId)

    if (currentIndex === -1) {
      // Task not found
      return
    }

    if (newPosition < 0 || newPosition >= tasks.length) {
      // Invalid position
      return
    }

    if (currentIndex === newPosition) {
      // Already at the desired position
      return
    }

    // Remove task from current position
    const taskIds = tasks.map((t) => t.id)
    const [movedTaskId] = taskIds.splice(currentIndex, 1)

    // Insert at new position
    taskIds.splice(newPosition, 0, movedTaskId)

    get().reorderTasks(taskIds)
  },

  // EPIC 4.5: Bulk Actions
  selectTask: (taskId: string) => {
    set((state) => ({
      selectedTaskIds: [...state.selectedTaskIds, taskId],
    }))
  },

  deselectTask: (taskId: string) => {
    set((state) => ({
      selectedTaskIds: state.selectedTaskIds.filter((id) => id !== taskId),
    }))
  },

  toggleTaskSelection: (taskId: string) => {
    const state = get()
    if (state.selectedTaskIds.includes(taskId)) {
      state.deselectTask(taskId)
    } else {
      state.selectTask(taskId)
    }
  },

  selectAllTasks: (taskIds: string[]) => {
    set({ selectedTaskIds: taskIds })
  },

  clearSelection: () => {
    set({ selectedTaskIds: [] })
  },

  getSelectionCount: () => {
    return get().selectedTaskIds.length
  },

  areAllTasksSelected: (taskIds: string[]) => {
    const state = get()
    if (taskIds.length === 0) return false
    return taskIds.every((id) => state.selectedTaskIds.includes(id))
  },

  getSelectedTasks: () => {
    const state = get()
    return state.tasks.filter((task) => state.selectedTaskIds.includes(task.id))
  },

  bulkCompleteTask: (taskIds: string[]) => {
    if (taskIds.length === 0) return

    const now = new Date()
    set((state) => ({
      tasks: state.tasks.map((task) =>
        taskIds.includes(task.id)
          ? {
              ...task,
              status: TaskStatus.COMPLETED,
              completedAt: now,
              updatedAt: new Date(now.getTime() + 1),
            }
          : task
      ),
      selectedTaskIds: [], // Clear selection after bulk operation
    }))
  },

  bulkDeleteTasks: (taskIds: string[]) => {
    if (taskIds.length === 0) return

    set((state) => ({
      tasks: state.tasks.filter((task) => !taskIds.includes(task.id)),
      selectedTaskIds: [], // Clear selection after bulk operation
    }))
  },

  bulkChangeCategory: (taskIds: string[], categoryId: string | null) => {
    if (taskIds.length === 0) return

    // Validate category if provided
    if (categoryId) {
      const category = get().getCategoryById(categoryId)
      if (!category) {
        // Invalid category, don't change anything
        return
      }
    }

    const now = new Date()
    set((state) => ({
      tasks: state.tasks.map((task) =>
        taskIds.includes(task.id)
          ? {
              ...task,
              categoryId,
              updatedAt: new Date(now.getTime() + 1),
            }
          : task
      ),
      selectedTaskIds: [], // Clear selection after bulk operation
    }))
  },

  // EPIC 5.2: Export Tasks
  exportTasksJSON: () => {
    const state = get()
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      taskCount: state.tasks.length,
      categoryCount: state.categories.length,
      tasks: state.tasks,
      categories: state.categories,
    }
    return JSON.stringify(exportData, null, 2)
  },

  exportTasksCSV: () => {
    const state = get()
    const headers = ['Title', 'Description', 'Status', 'Priority', 'Due Date', 'Category', 'Tags', 'Created At', 'Completed At']

    const escapeCSV = (value: string): string => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }

    const rows = state.tasks.map((task) => {
      const category = task.categoryId ? state.getCategoryById(task.categoryId) : null
      const dueDate = task.dueDate ? task.dueDate.toISOString().split('T')[0] : ''
      const tags = task.tags.join('; ')
      const createdAt = task.createdAt.toISOString().split('T')[0]
      const completedAt = task.completedAt ? task.completedAt.toISOString().split('T')[0] : ''

      return [
        escapeCSV(task.title),
        escapeCSV(task.description),
        task.status,
        task.priority,
        dueDate,
        category ? escapeCSV(category.name) : '',
        escapeCSV(tags),
        createdAt,
        completedAt,
      ].join(',')
    })

    return [headers.join(','), ...rows].join('\n')
  },

  exportFilteredTasksJSON: (filter: TaskFilter) => {
    const state = get()
    let filteredTasks: Task[] = []

    if (filter === TaskFilter.ALL) {
      filteredTasks = state.tasks
    } else if (filter === TaskFilter.ACTIVE) {
      filteredTasks = state.tasks.filter((t) => t.status === TaskStatus.PENDING)
    } else if (filter === TaskFilter.COMPLETED) {
      filteredTasks = state.tasks.filter((t) => t.status === TaskStatus.COMPLETED)
    }

    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      filter,
      totalTasks: state.tasks.length,
      filteredTasks: filteredTasks.length,
      taskCount: filteredTasks.length,
      categoryCount: state.categories.length,
      tasks: filteredTasks,
      categories: state.categories,
    }
    return JSON.stringify(exportData, null, 2)
  },

  exportFilteredTasksCSV: (filter: TaskFilter) => {
    const state = get()
    let filteredTasks: Task[] = []

    if (filter === TaskFilter.ALL) {
      filteredTasks = state.tasks
    } else if (filter === TaskFilter.ACTIVE) {
      filteredTasks = state.tasks.filter((t) => t.status === TaskStatus.PENDING)
    } else if (filter === TaskFilter.COMPLETED) {
      filteredTasks = state.tasks.filter((t) => t.status === TaskStatus.COMPLETED)
    }

    const headers = ['Title', 'Description', 'Status', 'Priority', 'Due Date', 'Category', 'Tags', 'Created At', 'Completed At']

    const escapeCSV = (value: string): string => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }

    const rows = filteredTasks.map((task) => {
      const category = task.categoryId ? state.getCategoryById(task.categoryId) : null
      const dueDate = task.dueDate ? task.dueDate.toISOString().split('T')[0] : ''
      const tags = task.tags.join('; ')
      const createdAt = task.createdAt.toISOString().split('T')[0]
      const completedAt = task.completedAt ? task.completedAt.toISOString().split('T')[0] : ''

      return [
        escapeCSV(task.title),
        escapeCSV(task.description),
        task.status,
        task.priority,
        dueDate,
        category ? escapeCSV(category.name) : '',
        escapeCSV(tags),
        createdAt,
        completedAt,
      ].join(',')
    })

    return [headers.join(','), ...rows].join('\n')
  },

  getExportFilename: (format: 'json' | 'csv') => {
    const state = get()
    const today = new Date().toISOString().split('T')[0]
    const taskCount = state.tasks.length
    return `tasks-${taskCount}-tasks-${today}.${format}`
  },

  // Test utility: Reset store and reload from localStorage
  resetStore: () => {
    // Get persisted state from localStorage
    try {
      const stored = customStorage.getItem('task-storage')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.state) {
          // Use the merge function logic to reconstruct the state
          const persisted = parsed.state as Partial<TaskState>

          const tasks = (persisted.tasks || []).map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            completedAt: task.completedAt ? new Date(task.completedAt) : null,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            customOrder: task.customOrder ?? 0,
            tags: task.tags || [],
            categoryId: task.categoryId || null,
          }))

          const categories = (persisted.categories || []).map((category: any) => ({
            ...category,
            createdAt: new Date(category.createdAt),
            updatedAt: new Date(category.updatedAt),
          }))

          set({
            ...initialState,
            ...persisted,
            tasks,
            categories,
            selectedTaskIds: [],
            searchQuery: '',
          })
          return
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }

    // Fallback to initial state if no persisted data or error
    set(initialState)
  },
}),
{
  name: 'task-storage',
  storage: createJSONStorage(() => customStorage),
  version: 0,
  // Custom deserialization to handle Date objects
  // EPIC 5.1: Partialize state - exclude transient state (selectedTaskIds, searchQuery)
  partialize: (state) => ({
    tasks: state.tasks,
    categories: state.categories,
    currentFilter: state.currentFilter,
    categoryFilters: state.categoryFilters,
    tagFilters: state.tagFilters,
    sortBy: state.sortBy,
    sortDirection: state.sortDirection,
    // DO NOT persist: selectedTaskIds, searchQuery
  }),
  // Handle corrupted data gracefully
  onRehydrateStorage: () => (state, error) => {
    if (error) {
      console.error('Error rehydrating store:', error)
      // Don't throw - use initial state instead
    }
  },
  // EPIC 5.1: Deserialize dates from ISO strings and ensure defaults
  merge: (persistedState, currentState) => {
    if (!persistedState) return currentState

    const persisted = persistedState as Partial<TaskState>

    // Reconstruct Date objects from ISO strings
    const tasks = (persisted.tasks || []).map((task: any) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      completedAt: task.completedAt ? new Date(task.completedAt) : null,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      customOrder: task.customOrder ?? 0, // EPIC 4.4: Ensure customOrder exists
      tags: task.tags || [], // EPIC 3: Ensure tags array exists
      categoryId: task.categoryId || null, // EPIC 3: Ensure categoryId exists
    }))

    const categories = (persisted.categories || []).map((category: any) => ({
      ...category,
      createdAt: new Date(category.createdAt),
      updatedAt: new Date(category.updatedAt),
    }))

    return {
      ...currentState,
      ...persisted,
      tasks,
      categories,
      // Ensure transient state is reset to defaults
      selectedTaskIds: [], // EPIC 4.5: Always start with empty selection
      searchQuery: '', // EPIC 2: Always start with empty search
    }
  },
}
)
)
