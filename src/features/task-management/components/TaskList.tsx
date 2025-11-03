/**
 * TaskList Component
 * EPIC 1: Task Management Core
 *
 * User Story 1.2: View Task List
 */

import React from 'react'
import type { Task } from '../types/task.types'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string) => void
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
  isLoading = false,
}) => {
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

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks yet</h3>
        <p className="text-gray-500">Create your first task to get started</p>
      </div>
    )
  }

  // Sort tasks by creation date (newest first) for display
  const sortedTasks = [...tasks].sort((a, b) => {
    const timeDiff = b.createdAt.getTime() - a.createdAt.getTime()
    // If same timestamp, sort by ID to ensure consistent order
    return timeDiff !== 0 ? timeDiff : b.id.localeCompare(a.id)
  })

  return (
    <ul className="space-y-4" role="list">
      {sortedTasks.map((task) => (
        <li key={task.id}>
          <TaskItem
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
          />
        </li>
      ))}
    </ul>
  )
}
