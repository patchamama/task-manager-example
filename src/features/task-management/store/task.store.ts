/**
 * Task Store
 * EPIC 1: Task Management Core
 * EPIC 2: Task Organization
 * EPIC 3: Categories & Tags
 *
 * Zustand store for task state management
 */

import { create } from 'zustand'
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
}

export const useTaskStore = create<TaskState>((set, get) => ({
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
    const newTask: Task = {
      id: generateId(),
      title: dto.title,
      description: dto.description || '',
      status: TaskStatus.PENDING,
      priority: dto.priority || TaskPriority.MEDIUM,
      dueDate: dto.dueDate || null,
      categoryId: dto.categoryId || null, // EPIC 3: Support category on creation
      tags: dto.tags || [], // EPIC 3: Support tags on creation
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

  // Test utility: Reset store to initial state
  resetStore: () => {
    set(initialState)
  },
}))
