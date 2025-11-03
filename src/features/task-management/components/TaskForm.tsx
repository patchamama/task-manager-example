/**
 * TaskForm Component
 * EPIC 1: Task Management Core
 *
 * User Story 1.1: Create Task
 * User Story 1.3: Edit Task
 */

import React, { useState, useEffect } from 'react'
import type { Task, CreateTaskDto } from '../types/task.types'

interface TaskFormProps {
  task?: Task
  onSubmit: (dto: CreateTaskDto) => void
  onCancel: () => void
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({})

  const isEditMode = !!task

  // Pre-fill form in edit mode
  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
    }
  }, [task])

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

    onSubmit({
      title,
      description,
    })

    // Reset form only in create mode
    if (!isEditMode) {
      setTitle('')
      setDescription('')
      setErrors({})
    }
  }

  const handleCancel = () => {
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <h2 className="text-2xl font-bold">
        {isEditMode ? 'Edit Task' : 'Create Task'}
      </h2>

      {/* Title Input */}
      <div className="space-y-2">
        <label htmlFor="task-title" className="block text-sm font-medium">
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="text-sm text-gray-500">{title.length}/100</div>
        {errors.title && (
          <div id="title-error" className="text-sm text-red-600">
            {errors.title}
          </div>
        )}
      </div>

      {/* Description Textarea */}
      <div className="space-y-2">
        <label htmlFor="task-description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'description-error' : undefined}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
        />
        <div className="text-sm text-gray-500">{description.length}/500</div>
        {errors.description && (
          <div id="description-error" className="text-sm text-red-600">
            {errors.description}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isEditMode ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}
