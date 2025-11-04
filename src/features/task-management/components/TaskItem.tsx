/**
 * TaskItem Component
 * EPIC 1: Task Management Core
 * EPIC 2: Task Organization
 * EPIC 3: Categories & Tags
 *
 * User Story 1.4: Delete Task
 * User Story 1.5: Mark Task Complete
 * User Story 2.1: Add Task Priority
 * User Story 2.5: Add Due Dates
 * User Story 3.2: Assign Category to Task (display category badge)
 * User Story 3.4: Add Tags to Tasks (display tags)
 */

import React from 'react'
import type { Task } from '../types/task.types'
import { TaskStatus, TaskPriority } from '../types/task.types'
import { useTaskStore } from '../store/task.store'
import { TagList } from './tag/TagList'

interface TaskItemProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string) => void
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`
  }

  // For older dates in test/display, show the formatted date
  return formatDate(date)
}

const formatDueDate = (dueDate: Date): string => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dueDateStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

  if (dueDateStart.getTime() === today.getTime()) {
    return 'Due today'
  }

  if (dueDateStart.getTime() === tomorrow.getTime()) {
    return 'Due tomorrow'
  }

  if (dueDateStart.getTime() < today.getTime()) {
    return 'Overdue'
  }

  return `Due ${formatDate(dueDate)}`
}

const getPriorityStyles = (priority: TaskPriority): string => {
  switch (priority) {
    case TaskPriority.LOW:
      return 'text-blue-600 bg-blue-50'
    case TaskPriority.MEDIUM:
      return 'text-green-600 bg-green-50'
    case TaskPriority.HIGH:
      return 'text-orange-600 bg-orange-50'
    case TaskPriority.CRITICAL:
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

const isOverdue = (dueDate: Date | null, status: TaskStatus): boolean => {
  if (!dueDate || status === TaskStatus.COMPLETED) {
    return false
  }
  const now = new Date()
  return dueDate.getTime() < now.getTime()
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete, onToggleComplete }) => {
  const isCompleted = task.status === TaskStatus.COMPLETED
  const taskIsOverdue = isOverdue(task.dueDate, task.status)
  const getCategoryById = useTaskStore((state) => state.getCategoryById)
  const category = task.categoryId ? getCategoryById(task.categoryId) : null

  return (
    <article
      aria-label={`Task: ${task.title}`}
      className={`p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg transition-colors ${isCompleted ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onToggleComplete(task.id)}
          aria-label={`Mark ${task.title} as complete`}
          className="mt-1 h-5 w-5 cursor-pointer focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />

        {/* Task Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${isCompleted ? 'line-through' : ''}`}>
              {task.title}
            </h3>

            {/* Status Badge */}
            <span
              role="status"
              aria-label={`Task status: ${isCompleted ? 'Completed' : 'Pending'}`}
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                isCompleted
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}
            >
              {isCompleted ? 'Completed' : 'Pending'}
            </span>
          </div>

          {/* Description */}
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {task.description || 'No description'}
          </p>

          {/* Category Badge */}
          {category && (
            <span
              data-testid={`task-category-badge-${task.id}`}
              style={{ backgroundColor: category.color }}
              aria-label={`Category: ${category.name}`}
              className="inline-block mt-2 px-2 py-1 text-xs font-medium text-white rounded"
            >
              {category.name}
            </span>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="mt-2">
              <TagList taskId={task.id} tags={task.tags} />
            </div>
          )}

          {/* Priority Badge and Due Date */}
          {(task.priority || task.dueDate) && (
            <div className="mt-2 flex items-center gap-2">
              {/* Priority Badge */}
              {task.priority && (
                <span
                  data-testid="priority-badge"
                  aria-label={`Priority: ${task.priority}`}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${getPriorityStyles(task.priority)}`}
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.232 1.548 1.033 1.548.392 0 .756-.193.978-.536l.717-.947a.5.5 0 01.644-.153l2.735 1.67a.5.5 0 00.757-.378L12 9.75l-3-1.2-4 1.724z" />
                  </svg>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              )}

              {/* Due Date Display */}
              {task.dueDate && (
                <span
                  className={`text-xs ${taskIsOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  {formatDueDate(task.dueDate)}
                </span>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <div data-testid="created-date" aria-label="Creation date">
              <span className="font-medium">Created:</span> {formatRelativeTime(task.createdAt)}
            </div>
            {isCompleted && task.completedAt && (
              <div data-testid="completed-date" aria-label="Completion date">
                <span className="font-medium">Completed on:</span> {formatDate(task.completedAt)}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onEdit(task)}
              aria-label={`Edit ${task.title}`}
              className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>

            <button
              onClick={() => onDelete(task.id)}
              aria-label={`Delete ${task.title}`}
              className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
