/**
 * Task Store
 * EPIC 1: Task Management Core
 * EPIC 2: Task Organization
 *
 * Zustand store for task state management
 */

import { create } from 'zustand'
import type { TaskState, CreateTaskDto, UpdateTaskDto, Task } from '../types/task.types'
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
  currentFilter: TaskFilter.ALL,
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

    const now = new Date()
    const newTask: Task = {
      id: generateId(),
      title: dto.title,
      description: dto.description || '',
      status: TaskStatus.PENDING,
      priority: dto.priority || TaskPriority.MEDIUM,
      dueDate: dto.dueDate || null,
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

  // Test utility: Reset store to initial state
  resetStore: () => {
    set(initialState)
  },
}))
