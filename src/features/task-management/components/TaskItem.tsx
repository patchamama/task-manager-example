/**
 * TaskItem Component
 * EPIC 1: Task Management Core
 *
 * User Story 1.4: Delete Task
 * User Story 1.5: Mark Task Complete
 */

import React from 'react'
import type { Task } from '../types/task.types'
import { TaskStatus } from '../types/task.types'

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

export const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete, onToggleComplete }) => {
  const isCompleted = task.status === TaskStatus.COMPLETED

  return (
    <article
      aria-label={`Task: ${task.title}`}
      className={`p-4 border border-gray-200 rounded-lg ${isCompleted ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onToggleComplete(task.id)}
          aria-label={`Mark ${task.title} as complete`}
          className="mt-1 h-5 w-5 cursor-pointer focus:ring-2 focus:ring-blue-500"
        />

        {/* Task Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className={`text-lg font-semibold ${isCompleted ? 'line-through' : ''}`}>
              {task.title}
            </h3>

            {/* Status Badge */}
            <span
              role="status"
              aria-label={`Task status: ${isCompleted ? 'Completed' : 'Pending'}`}
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                isCompleted
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {isCompleted ? 'Completed' : 'Pending'}
            </span>
          </div>

          {/* Description */}
          <p className="mt-1 text-gray-600">
            {task.description || 'No description'}
          </p>

          {/* Dates */}
          <div className="mt-2 text-sm text-gray-500 space-y-1">
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
              className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
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
