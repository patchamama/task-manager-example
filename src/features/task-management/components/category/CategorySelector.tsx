import React from 'react'
import { useTaskStore } from '../../store/task.store'

export interface CategorySelectorProps {
  value: string | undefined
  onChange: (categoryId: string | undefined) => void
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ value, onChange }) => {
  const categories = useTaskStore((state) => state.categories)

  return (
    <div data-testid="category-selector">
      <label htmlFor="category-select">Category</label>
      <select
        id="category-select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        data-testid="category-select"
      >
        <option value="">No category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  )
}
