/**
 * TaskList Component
 * EPIC 1: Task Management Core
 * EPIC 2: Task Organization
 * EPIC 4.4: Drag and Drop Reorder
 *
 * User Story 1.2: View Task List
 * User Story 2.2: Filter Tasks by Status
 * User Story 2.3: Sort Tasks
 * User Story 2.4: Search Tasks
 * User Story 4.4: Drag and Drop Reorder
 */

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { Task } from '../types/task.types'
import { TaskFilter, TaskSortBy, TaskSortDirection } from '../types/task.types'
import { TaskItem } from './TaskItem'
import { SortableTaskItem } from './SortableTaskItem'

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string) => void
  onReorder?: (taskIds: string[]) => void
  onMoveUp?: (taskId: string) => void
  onMoveDown?: (taskId: string) => void
  isLoading?: boolean
}

const TaskSkeleton: React.FC = () => (
  <div data-testid="task-skeleton" className="p-4 border border-gray-200 rounded-lg animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 bg-gray-200 rounded"></div>
      <div className="flex-1 space-y-2">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
)

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEdit,
  onDelete,
  onToggleComplete,
  onReorder,
  onMoveUp,
  onMoveDown,
  isLoading = false,
}) => {
  // Setup drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Try to use router, but make it optional for testing
  let searchParams: URLSearchParams | null = null
  let setSearchParams: ((params: URLSearchParams) => void) | null = null

  try {
    [searchParams, setSearchParams] = useSearchParams()
  } catch {
    // Router not available (e.g., in tests without BrowserRouter)
    searchParams = new URLSearchParams()
    setSearchParams = null
  }

  // Read filter from URL or default to ALL
  const getInitialFilter = (): TaskFilter => {
    if (!searchParams) return TaskFilter.ALL
    const filterParam = searchParams.get('filter')
    if (filterParam === 'active') return TaskFilter.ACTIVE
    if (filterParam === 'completed') return TaskFilter.COMPLETED
    return TaskFilter.ALL
  }

  // Read sort from localStorage or use defaults
  const getInitialSort = (): { sortBy: TaskSortBy; sortDirection: TaskSortDirection } => {
    try {
      const savedSort = localStorage.getItem('taskSort')
      const savedDirection = localStorage.getItem('taskSortDirection')
      return {
        sortBy: (savedSort as TaskSortBy) || TaskSortBy.DATE_CREATED,
        sortDirection: (savedDirection as TaskSortDirection) || TaskSortDirection.DESC,
      }
    } catch {
      return {
        sortBy: TaskSortBy.DATE_CREATED,
        sortDirection: TaskSortDirection.DESC,
      }
    }
  }

  const [currentFilter, setCurrentFilter] = useState<TaskFilter>(getInitialFilter())
  const initialSort = getInitialSort()
  const [sortBy, setSortBy] = useState<TaskSortBy>(initialSort.sortBy)
  const [sortDirection, setSortDirection] = useState<TaskSortDirection>(initialSort.sortDirection)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sync filter with URL (only once on mount)
  useEffect(() => {
    if (!searchParams) return
    const filterParam = searchParams.get('filter')
    const urlFilter =
      filterParam === 'active' ? TaskFilter.ACTIVE :
      filterParam === 'completed' ? TaskFilter.COMPLETED :
      TaskFilter.ALL
    setCurrentFilter(urlFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Save sort preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('taskSort', sortBy)
      localStorage.setItem('taskSortDirection', sortDirection)
    } catch {
      // Ignore localStorage errors
    }
  }, [sortBy, sortDirection])

  // Filter change handler
  const handleFilterChange = (filter: TaskFilter) => {
    setCurrentFilter(filter)

    // Only update URL if router is available
    if (setSearchParams && searchParams) {
      const params = new URLSearchParams(searchParams)
      if (filter === TaskFilter.ALL) {
        params.delete('filter')
      } else if (filter === TaskFilter.ACTIVE) {
        params.set('filter', 'active')
      } else if (filter === TaskFilter.COMPLETED) {
        params.set('filter', 'completed')
      }
      setSearchParams(params)
    }
  }

  // Filter tasks
  const getFilteredTasks = (): Task[] => {
    if (currentFilter === TaskFilter.ALL) {
      return tasks
    }
    if (currentFilter === TaskFilter.ACTIVE) {
      return tasks.filter((t) => t.status === 'pending')
    }
    if (currentFilter === TaskFilter.COMPLETED) {
      return tasks.filter((t) => t.status === 'completed')
    }
    return tasks
  }

  // Search tasks
  const getSearchedTasks = (tasksToSearch: Task[]): Task[] => {
    const trimmed = debouncedSearch.trim()
    if (!trimmed) {
      return tasksToSearch
    }
    const lower = trimmed.toLowerCase()
    return tasksToSearch.filter((t) => {
      return t.title.toLowerCase().includes(lower) || t.description.toLowerCase().includes(lower)
    })
  }

  // Sort tasks
  const getSortedTasks = (tasksToSort: Task[]): Task[] => {
    const copy = [...tasksToSort]
    const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 }

    copy.sort((a, b) => {
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

    return copy
  }

  // Apply all filters, search, and sort
  const filtered = getFilteredTasks()
  const searched = getSearchedTasks(filtered)
  const displayTasks = getSortedTasks(searched)

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || !onReorder) return

    if (active.id !== over.id) {
      const oldIndex = displayTasks.findIndex((task) => task.id === active.id)
      const newIndex = displayTasks.findIndex((task) => task.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedTasks = arrayMove(displayTasks, oldIndex, newIndex)
        const taskIds = reorderedTasks.map((task) => task.id)
        onReorder(taskIds)
      }
    }
  }

  // Count for filters
  const allCount = tasks.length
  const activeCount = tasks.filter((t) => t.status === 'pending').length
  const completedCount = tasks.filter((t) => t.status === 'completed').length

  // Get sort label text
  const getSortLabel = (): string => {
    const sortLabels: Record<TaskSortBy, string> = {
      [TaskSortBy.DATE_CREATED]: 'Date Created',
      [TaskSortBy.PRIORITY]: 'Priority',
      [TaskSortBy.TITLE]: 'Title',
      [TaskSortBy.DUE_DATE]: 'Due Date',
    }
    return sortLabels[sortBy]
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center text-gray-600">Loading tasks...</div>
        <TaskSkeleton />
        <TaskSkeleton />
        <TaskSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center gap-2" role="group" aria-label="Filter tasks">
        <button
          onClick={() => handleFilterChange(TaskFilter.ALL)}
          aria-pressed={currentFilter === TaskFilter.ALL}
          aria-label={`All tasks (${allCount})`}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            currentFilter === TaskFilter.ALL
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({allCount})
        </button>
        <button
          onClick={() => handleFilterChange(TaskFilter.ACTIVE)}
          aria-pressed={currentFilter === TaskFilter.ACTIVE}
          aria-label={`Active tasks (${activeCount})`}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            currentFilter === TaskFilter.ACTIVE
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => handleFilterChange(TaskFilter.COMPLETED)}
          aria-pressed={currentFilter === TaskFilter.COMPLETED}
          aria-label={`Completed tasks (${completedCount})`}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            currentFilter === TaskFilter.COMPLETED
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="search"
          role="searchbox"
          aria-label="Search tasks"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          Sorted by: <span className="font-medium text-gray-900">{getSortLabel()}</span>
        </span>
        <select
          id="sort-select"
          aria-label="Sort by"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as TaskSortBy)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={TaskSortBy.DATE_CREATED}>Date Created</option>
          <option value={TaskSortBy.PRIORITY}>Priority</option>
          <option value={TaskSortBy.TITLE}>Title</option>
          <option value={TaskSortBy.DUE_DATE}>Due Date</option>
        </select>
        <button
          onClick={() =>
            setSortDirection(sortDirection === TaskSortDirection.ASC ? TaskSortDirection.DESC : TaskSortDirection.ASC)
          }
          aria-label={`Sort direction: ${sortDirection === TaskSortDirection.ASC ? 'Ascending' : 'Descending'}`}
          className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {sortDirection === TaskSortDirection.DESC ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            )}
          </svg>
        </button>
      </div>

      {/* Task List */}
      {displayTasks.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {tasks.length === 0 ? 'No tasks yet' :
             currentFilter === TaskFilter.ACTIVE ? 'No active tasks' :
             currentFilter === TaskFilter.COMPLETED ? 'No completed tasks' :
             'No tasks found'}
          </h3>
          <p className="text-gray-500">
            {debouncedSearch
              ? 'Try adjusting your search or filters'
              : tasks.length === 0
                ? 'Create your first task to get started'
                : 'Try adjusting your filters'}
          </p>
        </div>
      ) : onReorder ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={displayTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-4" role="list">
              {displayTasks.map((task) => (
                <li key={task.id}>
                  <SortableTaskItem
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleComplete={onToggleComplete}
                    onMoveUp={onMoveUp}
                    onMoveDown={onMoveDown}
                  />
                </li>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <ul className="space-y-4" role="list">
          {displayTasks.map((task) => (
            <li key={task.id}>
              <TaskItem task={task} onEdit={onEdit} onDelete={onDelete} onToggleComplete={onToggleComplete} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
