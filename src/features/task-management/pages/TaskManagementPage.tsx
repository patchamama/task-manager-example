/**
 * TaskManagementPage Component
 * EPIC 1: Task Management Core
 * EPIC 4.1: Dark Mode
 * EPIC 4.2: Responsive Design
 * EPIC 4.3: Keyboard Shortcuts
 * EPIC 4.4: Drag and Drop Reorder
 *
 * Main page integrating all task management features with mobile-first responsive layout, keyboard shortcuts, and drag-and-drop reordering
 */

import React, { useState, useEffect } from 'react'
import { useTaskStore } from '../store/task.store'
import { TaskForm } from '../components/TaskForm'
import { TaskList } from '../components/TaskList'
import { ConfirmationModal } from '../../../shared/components/ConfirmationModal'
import { KeyboardShortcutsModal } from '../../../shared/components/KeyboardShortcutsModal'
import { ThemeToggle } from '../../../shared/theme'
import { useKeyboardShortcuts } from '../../../shared/hooks'
import type { Task, CreateTaskDto } from '../types/task.types'

export const TaskManagementPage: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskComplete, getCompletedCount, reorderTasks, moveTaskUp, moveTaskDown } = useTaskStore()

  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)

  const completedCount = getCompletedCount()

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+n': (e) => {
      e.preventDefault()
      if (!showForm && !editingTask) {
        handleCreateTask()
      }
    },
    'cmd+n': (e) => {
      e.preventDefault()
      if (!showForm && !editingTask) {
        handleCreateTask()
      }
    },
    'ctrl+k': (e) => {
      e.preventDefault()
      setShowShortcutsHelp(true)
    },
    'cmd+k': (e) => {
      e.preventDefault()
      setShowShortcutsHelp(true)
    },
    'escape': () => {
      if (showShortcutsHelp) {
        setShowShortcutsHelp(false)
      } else if (taskToDelete) {
        handleCancelDelete()
      } else if (showForm || editingTask) {
        handleCancelForm()
      }
    },
  })

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
            <button
              onClick={() => setShowShortcutsHelp(true)}
              aria-label="Show keyboard shortcuts"
              title="Keyboard shortcuts (Ctrl+K)"
              className="p-2 min-h-[44px] min-w-[44px] sm:min-h-[auto] sm:min-w-[auto] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
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
        onReorder={reorderTasks}
        onMoveUp={moveTaskUp}
        onMoveDown={moveTaskDown}
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

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal isOpen={showShortcutsHelp} onClose={() => setShowShortcutsHelp(false)} />
    </div>
  )
}
