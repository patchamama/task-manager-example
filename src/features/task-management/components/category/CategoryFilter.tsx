import React from 'react'
import { useTaskStore } from '../../store/task.store'

export const CategoryFilter: React.FC = () => {
  const categories = useTaskStore((state) => state.categories)
  const categoryFilters = useTaskStore((state) => state.categoryFilters)
  const setCategoryFilter = useTaskStore((state) => state.setCategoryFilter)
  const getCategoryTaskCount = useTaskStore((state) => state.getCategoryTaskCount)
  const getUncategorizedTasks = useTaskStore((state) => state.getUncategorizedTasks)

  const uncategorizedCount = getUncategorizedTasks().length

  const isSelected = (categoryId: string | null) => {
    return categoryFilters.includes(categoryId)
  }

  const toggleCategory = (categoryId: string | null) => {
    const newFilters = isSelected(categoryId)
      ? categoryFilters.filter((id) => id !== categoryId)
      : [...categoryFilters, categoryId]
    setCategoryFilter(newFilters)
  }

  return (
    <div data-testid="category-filter">
      <h3>Filter by Category</h3>
      <label data-testid="filter-uncategorized">
        <input
          type="checkbox"
          checked={isSelected(null)}
          onChange={() => toggleCategory(null)}
          data-testid="filter-uncategorized-checkbox"
        />
        Uncategorized ({uncategorizedCount})
      </label>
      {categories.map((category) => (
        <label key={category.id} data-testid={`filter-category-${category.id}`}>
          <input
            type="checkbox"
            checked={isSelected(category.id)}
            onChange={() => toggleCategory(category.id)}
            data-testid={`filter-category-checkbox-${category.id}`}
          />
          <span style={{ color: category.color }}>{category.name}</span> (
          {getCategoryTaskCount(category.id)})
        </label>
      ))}
    </div>
  )
}
