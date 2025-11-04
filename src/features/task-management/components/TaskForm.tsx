/**
 * TaskForm Component
 * EPIC 1: Task Management Core
 * EPIC 2: Task Organization
 * EPIC 4.2: Responsive Design
 *
 * User Story 1.1: Create Task
 * User Story 1.3: Edit Task
 * User Story 2.1: Add Task Priority
 * User Story 2.5: Add Due Dates
 * User Story 4.2: Mobile-first responsive design with touch-friendly targets
 */

import React, { useState, useEffect } from 'react'
import type { Task, CreateTaskDto } from '../types/task.types'
import { TaskPriority } from '../types/task.types'

interface TaskFormProps {
  task?: Task
  initialValues?: Task
  onSubmit: (dto: CreateTaskDto) => void
  onCancel: () => void
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, initialValues, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM)
  const [dueDate, setDueDate] = useState<string>('')
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({})

  const editTask = task || initialValues
  const isEditMode = !!editTask

  // Pre-fill form in edit mode
  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title)
      setDescription(editTask.description)
      setPriority(editTask.priority)
      if (editTask.dueDate) {
        const date = new Date(editTask.dueDate)
        const formatted = date.toISOString().split('T')[0]
        setDueDate(formatted)
      }
    }
  }, [editTask])

  const validateForm = (): boolean => {
    const newErrors: { title?: string; description?: string } = {}

    if (!title || !title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.length > 100) {
      newErrors.title = 'Title must not exceed 100 characters'
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const dueDateObj = dueDate ? new Date(dueDate) : null

    onSubmit({
      title,
      description,
      priority,
      dueDate: dueDateObj,
    })

    // Reset form only in create mode
    if (!isEditMode) {
      setTitle('')
      setDescription('')
      setPriority(TaskPriority.MEDIUM)
      setDueDate('')
      setErrors({})
    }
  }

  const handleCancel = () => {
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
        {isEditMode ? 'Edit Task' : 'Create Task'}
      </h2>

      {/* Title Input */}
      <div className="space-y-2">
        <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
          className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-base sm:text-sm"
        />
        <div className="text-sm text-gray-500 dark:text-gray-400">{title.length}/100</div>
        {errors.title && (
          <div id="title-error" className="text-sm text-red-600 dark:text-red-400">
            {errors.title}
          </div>
        )}
      </div>

      {/* Description Textarea */}
      <div className="space-y-2">
        <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'description-error' : undefined}
          className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 min-h-[100px] sm:min-h-[120px] text-base sm:text-sm"
        />
        <div className="text-sm text-gray-500 dark:text-gray-400">{description.length}/500</div>
        {errors.description && (
          <div id="description-error" className="text-sm text-red-600 dark:text-red-400">
            {errors.description}
          </div>
        )}
      </div>

      {/* Priority Selector */}
      <div className="space-y-2">
        <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Priority
        </label>
        <select
          id="task-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-base sm:text-sm"
        >
          <option value={TaskPriority.LOW}>Low</option>
          <option value={TaskPriority.MEDIUM}>Medium</option>
          <option value={TaskPriority.HIGH}>High</option>
          <option value={TaskPriority.CRITICAL}>Critical</option>
        </select>
      </div>

      {/* Due Date Picker */}
      <div className="space-y-2">
        <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Due Date <span className="text-gray-500 dark:text-gray-400 font-normal">(Optional)</span>
        </label>
        <input
          id="task-due-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-base sm:text-sm"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-2">
        <button
          type="button"
          onClick={handleCancel}
          className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 transition-colors text-base sm:text-sm font-medium min-h-[44px] sm:min-h-[auto]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors text-base sm:text-sm font-medium min-h-[44px] sm:min-h-[auto]"
        >
          {isEditMode ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}
