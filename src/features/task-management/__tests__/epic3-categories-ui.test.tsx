import React from 'react'
/**
 * Category UI Tests - EPIC 3
 * User Stories 3.1, 3.2, 3.3: Create Categories, Assign Category, Filter by Category
 *
 * Tests UI components for category management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTaskStore } from '../store/task.store'

/**
 * Mock components that will be created for EPIC 3
 */

// Mock CategoryForm component
const CategoryForm = ({ onSubmit, onCancel, initialData }: any) => {
  const [name, setName] = React.useState(initialData?.name || '')
  const [color, setColor] = React.useState(initialData?.color || '#3b82f6')

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

// Mock CategoryList component
const CategoryList = () => {
  // @ts-expect-error - categories field doesn't exist yet
  const categories = useTaskStore((state) => state.categories || [])
  // @ts-expect-error - deleteCategory action doesn't exist yet
  const deleteCategory = useTaskStore((state) => state.deleteCategory)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this category?')) {
      deleteCategory(id)
    }
  }

  return (
    <div data-testid="category-list">
      {categories.length === 0 && <p data-testid="empty-categories">No categories yet</p>}
      {categories.map((category: any) => (
        <div key={category.id} data-testid={`category-item-${category.id}`}>
          {editingId === category.id ? (
            <CategoryForm
              initialData={category}
              onSubmit={(data: any) => {
                // @ts-expect-error - updateCategory action doesn't exist yet
                useTaskStore.getState().updateCategory(category.id, data)
                setEditingId(null)
              }}
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

// Mock CategorySelector component (for task form)
const CategorySelector = ({ value, onChange }: any) => {
  // @ts-expect-error - categories field doesn't exist yet
  const categories = useTaskStore((state) => state.categories || [])

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
        {categories.map((category: any) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  )
}

// Mock CategoryFilter component
const CategoryFilter = () => {
  // @ts-expect-error - categories field doesn't exist yet
  const categories = useTaskStore((state) => state.categories || [])
  // @ts-expect-error - categoryFilters field doesn't exist yet
  const categoryFilters = useTaskStore((state) => state.categoryFilters || [])
  // @ts-expect-error - setCategoryFilter action doesn't exist yet
  const setCategoryFilter = useTaskStore((state) => state.setCategoryFilter)
  // @ts-expect-error - getCategoryTaskCount action doesn't exist yet
  const getCategoryTaskCount = useTaskStore((state) => state.getCategoryTaskCount)
  // @ts-expect-error - getUncategorizedTasks action doesn't exist yet
  const uncategorizedCount = useTaskStore((state) => state.getUncategorizedTasks?.().length || 0)

  const isSelected = (categoryId: string | null) => {
    return categoryFilters.includes(categoryId)
  }

  const toggleCategory = (categoryId: string | null) => {
    const newFilters = isSelected(categoryId)
      ? categoryFilters.filter((id: any) => id !== categoryId)
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
      {categories.map((category: any) => (
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

// Mock TaskItem with category badge
const TaskItemWithCategory = ({ task }: any) => {
  // @ts-expect-error - getCategoryById action doesn't exist yet
  const category = useTaskStore((state) => state.getCategoryById?.(task.categoryId))

  return (
    <div data-testid={`task-item-${task.id}`}>
      <h3>{task.title}</h3>
      {category && (
        <span
          data-testid={`task-category-badge-${task.id}`}
          style={{ backgroundColor: category.color }}
          aria-label={`Category: ${category.name}`}
        >
          {category.name}
        </span>
      )}
    </div>
  )
}

describe('User Story 3.1: Create Categories - UI', () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [],
      currentFilter: 'all' as any,
      sortBy: 'dateCreated' as any,
      sortDirection: 'desc' as any,
      searchQuery: '',
      // @ts-expect-error - categories field doesn't exist yet
      categories: [],
    })
  })

  describe('CategoryForm Component', () => {
    it('should render category creation form', () => {
      const handleSubmit = vi.fn()
      render(<CategoryForm onSubmit={handleSubmit} />)

      expect(screen.getByTestId('category-form')).toBeInTheDocument()
      expect(screen.getByTestId('category-name-input')).toBeInTheDocument()
      expect(screen.getByTestId('category-color-input')).toBeInTheDocument()
      expect(screen.getByTestId('category-submit-button')).toHaveTextContent('Create Category')
    })

    it('should submit category with name and color', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn()
      render(<CategoryForm onSubmit={handleSubmit} />)

      const nameInput = screen.getByTestId('category-name-input')
      const colorInput = screen.getByTestId('category-color-input')
      const submitButton = screen.getByTestId('category-submit-button')

      await user.clear(nameInput)
      await user.type(nameInput, 'Work')
      await user.clear(colorInput)
      await user.type(colorInput, '#3b82f6')
      await user.click(submitButton)

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          name: 'Work',
          color: '#3b82f6',
        })
      })
    })

    it('should render edit form with initial data', () => {
      const handleSubmit = vi.fn()
      const handleCancel = vi.fn()
      const initialData = { id: '1', name: 'Work', color: '#3b82f6' }

      render(<CategoryForm onSubmit={handleSubmit} onCancel={handleCancel} initialData={initialData} />)

      expect(screen.getByTestId('category-name-input')).toHaveValue('Work')
      expect(screen.getByTestId('category-color-input')).toHaveValue('#3b82f6')
      expect(screen.getByTestId('category-submit-button')).toHaveTextContent('Update Category')
      expect(screen.getByTestId('category-cancel-button')).toBeInTheDocument()
    })

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn()
      const handleCancel = vi.fn()
      const initialData = { id: '1', name: 'Work', color: '#3b82f6' }

      render(<CategoryForm onSubmit={handleSubmit} onCancel={handleCancel} initialData={initialData} />)

      const cancelButton = screen.getByTestId('category-cancel-button')
      await user.click(cancelButton)

      expect(handleCancel).toHaveBeenCalled()
    })

    it('should have accessible labels', () => {
      render(<CategoryForm onSubmit={vi.fn()} />)

      expect(screen.getByLabelText('Category name')).toBeInTheDocument()
      expect(screen.getByLabelText('Category color')).toBeInTheDocument()
    })
  })

  describe('CategoryList Component', () => {
    it('should render empty state when no categories', () => {
      render(<CategoryList />)

      expect(screen.getByTestId('empty-categories')).toHaveTextContent('No categories yet')
    })

    it('should render list of categories', () => {
      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
          { id: '2', name: 'Personal', color: '#10b981', createdAt: new Date(), updatedAt: new Date() },
        ],
      })

      render(<CategoryList />)

      expect(screen.getByTestId('category-item-1')).toBeInTheDocument()
      expect(screen.getByTestId('category-item-2')).toBeInTheDocument()
      expect(screen.getByTestId('category-badge-1')).toHaveTextContent('Work')
      expect(screen.getByTestId('category-badge-2')).toHaveTextContent('Personal')
    })

    it('should display category with correct color', () => {
      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
        ],
      })

      render(<CategoryList />)

      const badge = screen.getByTestId('category-badge-1')
      expect(badge).toHaveStyle({ backgroundColor: '#3b82f6' })
    })

    it('should show edit and delete buttons for each category', () => {
      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
        ],
      })

      render(<CategoryList />)

      expect(screen.getByTestId('edit-category-1')).toBeInTheDocument()
      expect(screen.getByTestId('delete-category-1')).toBeInTheDocument()
    })

    it('should show edit form when edit button is clicked', async () => {
      const user = userEvent.setup()
      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
        ],
      })

      render(<CategoryList />)

      const editButton = screen.getByTestId('edit-category-1')
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByTestId('category-form')).toBeInTheDocument()
        expect(screen.getByTestId('category-cancel-button')).toBeInTheDocument()
      })
    })

    it('should have accessible aria labels', () => {
      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
        ],
      })

      render(<CategoryList />)

      expect(screen.getByLabelText('Category: Work')).toBeInTheDocument()
      expect(screen.getByLabelText('Edit Work')).toBeInTheDocument()
      expect(screen.getByLabelText('Delete Work')).toBeInTheDocument()
    })
  })
})

describe('User Story 3.2: Assign Category to Task - UI', () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [],
      currentFilter: 'all' as any,
      sortBy: 'dateCreated' as any,
      sortDirection: 'desc' as any,
      searchQuery: '',
      // @ts-expect-error - categories field doesn't exist yet
      categories: [],
    })
  })

  describe('CategorySelector Component', () => {
    it('should render category selector dropdown', () => {
      render(<CategorySelector value={undefined} onChange={vi.fn()} />)

      expect(screen.getByTestId('category-selector')).toBeInTheDocument()
      expect(screen.getByTestId('category-select')).toBeInTheDocument()
      expect(screen.getByLabelText('Category')).toBeInTheDocument()
    })

    it('should show "No category" option', () => {
      render(<CategorySelector value={undefined} onChange={vi.fn()} />)

      expect(screen.getByText('No category')).toBeInTheDocument()
    })

    it('should render available categories in dropdown', () => {
      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
          { id: '2', name: 'Personal', color: '#10b981', createdAt: new Date(), updatedAt: new Date() },
        ],
      })

      render(<CategorySelector value={undefined} onChange={vi.fn()} />)

      expect(screen.getByText('Work')).toBeInTheDocument()
      expect(screen.getByText('Personal')).toBeInTheDocument()
    })

    it('should show selected category', () => {
      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
        ],
      })

      render(<CategorySelector value="1" onChange={vi.fn()} />)

      expect(screen.getByTestId('category-select')).toHaveValue('1')
    })

    it('should call onChange when category is selected', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
        ],
      })

      render(<CategorySelector value={undefined} onChange={handleChange} />)

      const select = screen.getByTestId('category-select')
      await user.selectOptions(select, '1')

      expect(handleChange).toHaveBeenCalledWith('1')
    })

    it('should call onChange with undefined when "No category" is selected', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
        ],
      })

      render(<CategorySelector value="1" onChange={handleChange} />)

      const select = screen.getByTestId('category-select')
      await user.selectOptions(select, '')

      expect(handleChange).toHaveBeenCalledWith(undefined)
    })
  })

  describe('TaskItem with Category Badge', () => {
    it('should display category badge on task', () => {
      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
        ],
      })

      const task = {
        id: 'task-1',
        title: 'Task with category',
        categoryId: '1',
      }

      render(<TaskItemWithCategory task={task} />)

      expect(screen.getByTestId('task-category-badge-task-1')).toBeInTheDocument()
      expect(screen.getByTestId('task-category-badge-task-1')).toHaveTextContent('Work')
    })

    it('should display category badge with correct color', () => {
      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
        ],
      })

      const task = {
        id: 'task-1',
        title: 'Task with category',
        categoryId: '1',
      }

      render(<TaskItemWithCategory task={task} />)

      const badge = screen.getByTestId('task-category-badge-task-1')
      expect(badge).toHaveStyle({ backgroundColor: '#3b82f6' })
    })

    it('should not display category badge when task has no category', () => {
      const task = {
        id: 'task-1',
        title: 'Task without category',
        categoryId: undefined,
      }

      render(<TaskItemWithCategory task={task} />)

      expect(screen.queryByTestId('task-category-badge-task-1')).not.toBeInTheDocument()
    })

    it('should have accessible aria label for category badge', () => {
      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
        ],
      })

      const task = {
        id: 'task-1',
        title: 'Task with category',
        categoryId: '1',
      }

      render(<TaskItemWithCategory task={task} />)

      expect(screen.getByLabelText('Category: Work')).toBeInTheDocument()
    })
  })
})

describe('User Story 3.3: Filter by Category - UI', () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [],
      currentFilter: 'all' as any,
      sortBy: 'dateCreated' as any,
      sortDirection: 'desc' as any,
      searchQuery: '',
      // @ts-expect-error - categories field doesn't exist yet
      categories: [],
      // @ts-expect-error - categoryFilters field doesn't exist yet
      categoryFilters: [],
    })
  })

  describe('CategoryFilter Component', () => {
    it('should render category filter', () => {
      render(<CategoryFilter />)

      expect(screen.getByTestId('category-filter')).toBeInTheDocument()
      expect(screen.getByText('Filter by Category')).toBeInTheDocument()
    })

    it('should show uncategorized filter option', () => {
      render(<CategoryFilter />)

      expect(screen.getByTestId('filter-uncategorized')).toBeInTheDocument()
      expect(screen.getByTestId('filter-uncategorized-checkbox')).toBeInTheDocument()
    })

    it('should show all categories as filter options', () => {
      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
          { id: '2', name: 'Personal', color: '#10b981', createdAt: new Date(), updatedAt: new Date() },
        ],
      })

      render(<CategoryFilter />)

      expect(screen.getByTestId('filter-category-1')).toBeInTheDocument()
      expect(screen.getByTestId('filter-category-2')).toBeInTheDocument()
      expect(screen.getByText('Work')).toBeInTheDocument()
      expect(screen.getByText('Personal')).toBeInTheDocument()
    })

    it('should display task count for each category', () => {
      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
        ],
      })

      // Mock getCategoryTaskCount to return 5
      // @ts-expect-error - getCategoryTaskCount action doesn't exist yet
      useTaskStore.setState({
        getCategoryTaskCount: (id: string) => (id === '1' ? 5 : 0),
      })

      render(<CategoryFilter />)

      expect(screen.getByText(/\(5\)/)).toBeInTheDocument()
    })

    it('should toggle category filter when checkbox is clicked', async () => {
      const user = userEvent.setup()
      const mockSetCategoryFilter = vi.fn()

      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
        ],
        // @ts-expect-error - setCategoryFilter action doesn't exist yet
        setCategoryFilter: mockSetCategoryFilter,
      })

      render(<CategoryFilter />)

      const checkbox = screen.getByTestId('filter-category-checkbox-1')
      await user.click(checkbox)

      expect(mockSetCategoryFilter).toHaveBeenCalledWith(['1'])
    })

    it('should show selected categories as checked', () => {
      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
        ],
        // @ts-expect-error - categoryFilters field doesn't exist yet
        categoryFilters: ['1'],
      })

      render(<CategoryFilter />)

      const checkbox = screen.getByTestId('filter-category-checkbox-1')
      expect(checkbox).toBeChecked()
    })

    it('should allow multiple category selection', async () => {
      const user = userEvent.setup()
      const mockSetCategoryFilter = vi.fn()

      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
          { id: '2', name: 'Personal', color: '#10b981', createdAt: new Date(), updatedAt: new Date() },
        ],
        // @ts-expect-error - categoryFilters field doesn't exist yet
        categoryFilters: ['1'],
        // @ts-expect-error - setCategoryFilter action doesn't exist yet
        setCategoryFilter: mockSetCategoryFilter,
      })

      render(<CategoryFilter />)

      const checkbox2 = screen.getByTestId('filter-category-checkbox-2')
      await user.click(checkbox2)

      expect(mockSetCategoryFilter).toHaveBeenCalledWith(['1', '2'])
    })

    it('should uncheck category when clicked again', async () => {
      const user = userEvent.setup()
      const mockSetCategoryFilter = vi.fn()

      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
        ],
        // @ts-expect-error - categoryFilters field doesn't exist yet
        categoryFilters: ['1'],
        // @ts-expect-error - setCategoryFilter action doesn't exist yet
        setCategoryFilter: mockSetCategoryFilter,
      })

      render(<CategoryFilter />)

      const checkbox = screen.getByTestId('filter-category-checkbox-1')
      await user.click(checkbox)

      expect(mockSetCategoryFilter).toHaveBeenCalledWith([])
    })

    it('should display category colors in filter', () => {
      useTaskStore.setState({
        // @ts-expect-error - categories field doesn't exist yet
        categories: [
          { id: '1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
        ],
      })

      render(<CategoryFilter />)

      const workText = screen.getByText('Work')
      expect(workText).toHaveStyle({ color: '#3b82f6' })
    })
  })
})
