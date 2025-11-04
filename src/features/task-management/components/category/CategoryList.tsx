import React, { useState } from 'react'
import { useTaskStore } from '../../store/task.store'
import { CategoryForm } from './CategoryForm'

export const CategoryList: React.FC = () => {
  const categories = useTaskStore((state) => state.categories)
  const deleteCategory = useTaskStore((state) => state.deleteCategory)
  const updateCategory = useTaskStore((state) => state.updateCategory)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this category?')) {
      deleteCategory(id)
    }
  }

  const handleUpdate = (id: string, data: { name: string; color: string }) => {
    updateCategory(id, data)
    setEditingId(null)
  }

  return (
    <div data-testid="category-list">
      {categories.length === 0 && <p data-testid="empty-categories">No categories yet</p>}
      {categories.map((category) => (
        <div key={category.id} data-testid={`category-item-${category.id}`}>
          {editingId === category.id ? (
            <CategoryForm
              initialData={category}
              onSubmit={(data) => handleUpdate(category.id, data)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <>
              <div
                data-testid={`category-badge-${category.id}`}
                style={{ backgroundColor: category.color }}
                aria-label={`Category: ${category.name}`}
              >
                {category.name}
              </div>
              <button
                onClick={() => setEditingId(category.id)}
                data-testid={`edit-category-${category.id}`}
                aria-label={`Edit ${category.name}`}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                data-testid={`delete-category-${category.id}`}
                aria-label={`Delete ${category.name}`}
              >
                Delete
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
