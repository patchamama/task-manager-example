/**
 * BulkActionToolbar Component
 * EPIC 4.5: Bulk Actions
 *
 * User Story 4.5: Bulk Actions toolbar with selection controls and action buttons
 */

import React, { useState } from 'react'
import { useTaskStore } from '../store/task.store'
import { ConfirmationModal } from '../../../shared/components/ConfirmationModal'

interface BulkActionToolbarProps {
  onEnterSelectionMode: () => void
  onExitSelectionMode: () => void
  selectionMode: boolean
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  onEnterSelectionMode,
  onExitSelectionMode,
  selectionMode,
}) => {
  const {
    selectedTaskIds,
    selectAllTasks,
    clearSelection,
    getSelectionCount,
    areAllTasksSelected,
    bulkCompleteTask,
    bulkDeleteTasks,
    bulkChangeCategory,
    getAllCategories,
    getFilteredAndSearchedTasks,
  } = useTaskStore()

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [showCategorySelector, setShowCategorySelector] = useState(false)

  const selectionCount = getSelectionCount()
  const categories = getAllCategories()
  const displayedTasks = getFilteredAndSearchedTasks()
  const allSelected = areAllTasksSelected(displayedTasks.map((t) => t.id))

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection()
    } else {
      selectAllTasks(displayedTasks.map((t) => t.id))
    }
  }

  const handleBulkComplete = () => {
    bulkCompleteTask(selectedTaskIds)
  }

  const handleBulkDelete = () => {
    setShowDeleteConfirmation(true)
  }

  const handleConfirmDelete = () => {
    bulkDeleteTasks(selectedTaskIds)
    setShowDeleteConfirmation(false)
  }

  const handleBulkChangeCategory = (categoryId: string | null) => {
    bulkChangeCategory(selectedTaskIds, categoryId)
    setShowCategorySelector(false)
  }

  const handleCancel = () => {
    clearSelection()
    onExitSelectionMode()
  }

  if (!selectionMode) {
    return (
      <div className="mb-4">
        <button
          onClick={onEnterSelectionMode}
          className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Select Tasks
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Selection Info */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={allSelected && displayedTasks.length > 0}
              onChange={handleSelectAll}
              aria-label="Select all tasks"
              className="h-5 w-5 cursor-pointer focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectionCount > 0 ? `${selectionCount} selected` : 'Select tasks'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {selectionCount > 0 && (
              <>
                <button
                  onClick={handleBulkComplete}
                  className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                >
                  Complete
                </button>

                <div className="relative flex-1 sm:flex-none">
                  <button
                    onClick={() => setShowCategorySelector(!showCategorySelector)}
                    className="w-full px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    Category
                  </button>

                  {/* Category Dropdown */}
                  {showCategorySelector && (
                    <div className="absolute z-10 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                      <button
                        onClick={() => handleBulkChangeCategory(null)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                      >
                        Remove Category
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleBulkChangeCategory(category.id)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                        >
                          <span
                            className="inline-block w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleBulkDelete}
                  className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Delete
                </button>
              </>
            )}

            <button
              onClick={handleCancel}
              className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Delete Tasks"
        message={`Are you sure you want to delete ${selectionCount} ${selectionCount === 1 ? 'task' : 'tasks'}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirmation(false)}
      />
    </>
  )
}
