/**
 * TaskManagementPage Component
 * EPIC 1: Task Management Core
 * EPIC 4.1: Dark Mode
 * EPIC 4.2: Responsive Design
 *
 * Main page integrating all task management features with mobile-first responsive layout
 */

import React, { useState, useEffect } from 'react'
import { useTaskStore } from '../store/task.store'
import { TaskForm } from '../components/TaskForm'
import { TaskList } from '../components/TaskList'
import { ConfirmationModal } from '../../../shared/components/ConfirmationModal'
import { ThemeToggle } from '../../../shared/theme'
import type { Task, CreateTaskDto } from '../types/task.types'

export const TaskManagementPage: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskComplete, getCompletedCount } = useTaskStore()

  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

  const completedCount = getCompletedCount()

  // Handle Escape key to close form
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (showForm || editingTask)) {
        handleCancelForm()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showForm, editingTask])

  const handleCreateTask = () => {
    setShowForm(true)
    setEditingTask(null)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowForm(false)
  }

  const handleDeleteTask = (id: string) => {
    setTaskToDelete(id)
  }

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete)
      setTaskToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setTaskToDelete(null)
  }

  const handleSubmitForm = (dto: CreateTaskDto) => {
    if (editingTask) {
      updateTask(editingTask.id, dto)
      setEditingTask(null)
    } else {
      addTask(dto)
      setShowForm(false)
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  const handleToggleComplete = (id: string) => {
    toggleTaskComplete(id)
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">Task Manager</h1>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <ThemeToggle />
            <button
              onClick={handleCreateTask}
              className={`px-3 py-2 sm:px-4 sm:py-2 min-h-[44px] bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm sm:text-base font-medium whitespace-nowrap ${
                showForm || editingTask ? 'invisible' : ''
              }`}
              aria-hidden={showForm || editingTask}
              tabIndex={showForm || editingTask ? -1 : 0}
            >
              <span className="hidden sm:inline">New Task</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>

        {/* Task Stats */}
        {tasks.length > 0 && (
          <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {completedCount} of {tasks.length} completed
          </div>
        )}
      </div>

      {/* Task Form */}
      {(showForm || editingTask) && (
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-colors">
          <TaskForm
            key={editingTask ? editingTask.id : 'new-task'}
            task={editingTask || undefined}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {/* Task List */}
      <TaskList
        tasks={tasks}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onToggleComplete={handleToggleComplete}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!taskToDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}
