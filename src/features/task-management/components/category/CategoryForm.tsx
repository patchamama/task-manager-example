import React, { useState } from 'react'
import type { Category } from '../../types/task.types'

export interface CategoryFormProps {
  onSubmit: (data: { name: string; color: string }) => void
  onCancel?: () => void
  initialData?: Partial<Category>
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || '')
  const [color, setColor] = useState(initialData?.color || '#3b82f6')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, color })
  }

  return (
    <form onSubmit={handleSubmit} data-testid="category-form">
      <input
        type="text"
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        data-testid="category-name-input"
        aria-label="Category name"
      />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        data-testid="category-color-input"
        aria-label="Category color"
      />
      <button type="submit" data-testid="category-submit-button">
        {initialData ? 'Update' : 'Create'} Category
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel} data-testid="category-cancel-button">
          Cancel
        </button>
      )}
    </form>
  )
}
