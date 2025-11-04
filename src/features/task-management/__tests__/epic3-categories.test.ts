/**
 * Category Management Tests - EPIC 3
 * User Stories 3.1, 3.2, 3.3: Create Categories, Assign Category, Filter by Category
 *
 * Tests category CRUD operations, validation, and assignment to tasks
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useTaskStore } from '../store/task.store'
import type { CreateTaskDto } from '../types/task.types'

/**
 * Category interface for EPIC 3
 * User Story 3.1: Create Categories
 */
interface Category {
  id: string
  name: string
  color: string
  createdAt: Date
  updatedAt: Date
}

/**
 * CreateCategoryDto for category creation
 */
interface CreateCategoryDto {
  name: string
  color: string
}

/**
 * UpdateCategoryDto for category updates
 */
interface UpdateCategoryDto {
  name?: string
  color?: string
}

/**
 * Extended task with category
 */
interface TaskWithCategory extends CreateTaskDto {
  categoryId?: string
}

describe('User Story 3.1: Create Categories', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTaskStore.setState({
      tasks: [],
      currentFilter: 'all' as any,
      sortBy: 'dateCreated' as any,
      sortDirection: 'desc' as any,
      searchQuery: '',
    })
  })

  describe('Store - Category CRUD Operations', () => {
    it('should create a category with name and color', () => {
      const dto: CreateCategoryDto = {
        name: 'Work',
        color: '#3b82f6',
      }

      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory(dto)
      // @ts-expect-error - categories field doesn't exist yet
      const categories = useTaskStore.getState().categories

      expect(categories).toHaveLength(1)
      expect(categories[0].name).toBe('Work')
      expect(categories[0].color).toBe('#3b82f6')
      expect(categories[0].id).toBeDefined()
      expect(categories[0].createdAt).toBeInstanceOf(Date)
      expect(categories[0].updatedAt).toBeInstanceOf(Date)
    })

    it('should create multiple categories', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Personal', color: '#10b981' })
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Shopping', color: '#f59e0b' })

      // @ts-expect-error - categories field doesn't exist yet
      const categories = useTaskStore.getState().categories

      expect(categories).toHaveLength(3)
      expect(categories[0].name).toBe('Work')
      expect(categories[1].name).toBe('Personal')
      expect(categories[2].name).toBe('Shopping')
    })

    it('should update category name', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      const updateDto: UpdateCategoryDto = {
        name: 'Office Work',
      }

      // @ts-expect-error - updateCategory action doesn't exist yet
      useTaskStore.getState().updateCategory(category.id, updateDto)

      // @ts-expect-error - getCategoryById action doesn't exist yet
      const updated = useTaskStore.getState().getCategoryById(category.id)
      expect(updated?.name).toBe('Office Work')
      expect(updated?.color).toBe('#3b82f6') // Color unchanged
    })

    it('should update category color', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      const updateDto: UpdateCategoryDto = {
        color: '#ef4444',
      }

      // @ts-expect-error - updateCategory action doesn't exist yet
      useTaskStore.getState().updateCategory(category.id, updateDto)

      // @ts-expect-error - getCategoryById action doesn't exist yet
      const updated = useTaskStore.getState().getCategoryById(category.id)
      expect(updated?.color).toBe('#ef4444')
      expect(updated?.name).toBe('Work') // Name unchanged
    })

    it('should update both category name and color', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      const updateDto: UpdateCategoryDto = {
        name: 'Office',
        color: '#8b5cf6',
      }

      // @ts-expect-error - updateCategory action doesn't exist yet
      useTaskStore.getState().updateCategory(category.id, updateDto)

      // @ts-expect-error - getCategoryById action doesn't exist yet
      const updated = useTaskStore.getState().getCategoryById(category.id)
      expect(updated?.name).toBe('Office')
      expect(updated?.color).toBe('#8b5cf6')
    })

    it('should delete a category', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Personal', color: '#10b981' })

      // @ts-expect-error - categories field doesn't exist yet
      const categoryToDelete = useTaskStore.getState().categories[0]

      // @ts-expect-error - deleteCategory action doesn't exist yet
      useTaskStore.getState().deleteCategory(categoryToDelete.id)

      // @ts-expect-error - categories field doesn't exist yet
      const categories = useTaskStore.getState().categories

      expect(categories).toHaveLength(1)
      expect(categories[0].name).toBe('Personal')
    })

    it('should get category by id', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      // @ts-expect-error - getCategoryById action doesn't exist yet
      const found = useTaskStore.getState().getCategoryById(category.id)

      expect(found).toBeDefined()
      expect(found?.name).toBe('Work')
      expect(found?.color).toBe('#3b82f6')
    })

    it('should return undefined for non-existent category', () => {
      // @ts-expect-error - getCategoryById action doesn't exist yet
      const found = useTaskStore.getState().getCategoryById('non-existent-id')

      expect(found).toBeUndefined()
    })

    it('should update updatedAt timestamp when updating category', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]
      const originalUpdatedAt = category.updatedAt

      // Wait a tiny bit to ensure timestamp changes
      // @ts-expect-error - updateCategory action doesn't exist yet
      useTaskStore.getState().updateCategory(category.id, { name: 'Updated' })

      // @ts-expect-error - getCategoryById action doesn't exist yet
      const updated = useTaskStore.getState().getCategoryById(category.id)

      expect(updated?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })
  })

  describe('Store - Category Validation', () => {
    it('should throw error when creating category with empty name', () => {
      expect(() => {
        // @ts-expect-error - addCategory action doesn't exist yet
        useTaskStore.getState().addCategory({ name: '', color: '#3b82f6' })
      }).toThrow('Category name is required')
    })

    it('should throw error when creating category without name', () => {
      expect(() => {
        // @ts-expect-error - addCategory action doesn't exist yet
        useTaskStore.getState().addCategory({ color: '#3b82f6' } as any)
      }).toThrow('Category name is required')
    })

    it('should throw error when creating category with empty color', () => {
      expect(() => {
        // @ts-expect-error - addCategory action doesn't exist yet
        useTaskStore.getState().addCategory({ name: 'Work', color: '' })
      }).toThrow('Category color is required')
    })

    it('should throw error when creating category without color', () => {
      expect(() => {
        // @ts-expect-error - addCategory action doesn't exist yet
        useTaskStore.getState().addCategory({ name: 'Work' } as any)
      }).toThrow('Category color is required')
    })

    it('should throw error when creating duplicate category name', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })

      expect(() => {
        // @ts-expect-error - addCategory action doesn't exist yet
        useTaskStore.getState().addCategory({ name: 'Work', color: '#10b981' })
      }).toThrow('Category name must be unique')
    })

    it('should throw error when creating duplicate category name (case insensitive)', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })

      expect(() => {
        // @ts-expect-error - addCategory action doesn't exist yet
        useTaskStore.getState().addCategory({ name: 'WORK', color: '#10b981' })
      }).toThrow('Category name must be unique')
    })

    it('should throw error when exceeding maximum 20 categories', () => {
      // Create 20 categories
      for (let i = 1; i <= 20; i++) {
        // @ts-expect-error - addCategory action doesn't exist yet
        useTaskStore.getState().addCategory({ name: `Category ${i}`, color: '#3b82f6' })
      }

      expect(() => {
        // @ts-expect-error - addCategory action doesn't exist yet
        useTaskStore.getState().addCategory({ name: 'Category 21', color: '#3b82f6' })
      }).toThrow('Maximum 20 categories allowed')
    })

    it('should throw error when updating category to duplicate name', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Personal', color: '#10b981' })

      // @ts-expect-error - categories field doesn't exist yet
      const personalCategory = useTaskStore.getState().categories[1]

      expect(() => {
        // @ts-expect-error - updateCategory action doesn't exist yet
        useTaskStore.getState().updateCategory(personalCategory.id, { name: 'Work' })
      }).toThrow('Category name must be unique')
    })

    it('should allow updating category to same name (no change)', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      expect(() => {
        // @ts-expect-error - updateCategory action doesn't exist yet
        useTaskStore.getState().updateCategory(category.id, { name: 'Work' })
      }).not.toThrow()
    })

    it('should throw error when updating non-existent category', () => {
      expect(() => {
        // @ts-expect-error - updateCategory action doesn't exist yet
        useTaskStore.getState().updateCategory('non-existent-id', { name: 'Updated' })
      }).toThrow('Category not found')
    })

    it('should throw error when deleting non-existent category', () => {
      expect(() => {
        // @ts-expect-error - deleteCategory action doesn't exist yet
        useTaskStore.getState().deleteCategory('non-existent-id')
      }).toThrow('Category not found')
    })

    it('should validate color format (hex color)', () => {
      expect(() => {
        // @ts-expect-error - addCategory action doesn't exist yet
        useTaskStore.getState().addCategory({ name: 'Work', color: 'invalid-color' })
      }).toThrow('Category color must be a valid hex color')
    })

    it('should accept valid hex color with #', () => {
      expect(() => {
        // @ts-expect-error - addCategory action doesn't exist yet
        useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      }).not.toThrow()
    })

    it('should accept valid hex color without #', () => {
      expect(() => {
        // @ts-expect-error - addCategory action doesn't exist yet
        useTaskStore.getState().addCategory({ name: 'Work', color: '3b82f6' })
      }).not.toThrow()
    })
  })
})

describe('User Story 3.2: Assign Category to Task', () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [],
      currentFilter: 'all' as any,
      sortBy: 'dateCreated' as any,
      sortDirection: 'desc' as any,
      searchQuery: '',
    })
  })

  describe('Store - Category Assignment', () => {
    it('should create task without category (optional)', () => {
      const dto: CreateTaskDto = {
        title: 'Task without category',
      }

      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - categoryId field doesn't exist yet
      expect(task.categoryId).toBeUndefined()
    })

    it('should create task with category', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      const dto: TaskWithCategory = {
        title: 'Task with category',
        categoryId: category.id,
      }

      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - categoryId field doesn't exist yet
      expect(task.categoryId).toBe(category.id)
    })

    it('should assign category to existing task', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      // @ts-expect-error - setCategoryForTask action doesn't exist yet
      useTaskStore.getState().setCategoryForTask(task.id, category.id)

      const updated = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - categoryId field doesn't exist yet
      expect(updated?.categoryId).toBe(category.id)
    })

    it('should change task category', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Personal', color: '#10b981' })

      // @ts-expect-error - categories field doesn't exist yet
      const workCategory = useTaskStore.getState().categories[0]
      // @ts-expect-error - categories field doesn't exist yet
      const personalCategory = useTaskStore.getState().categories[1]

      const dto: TaskWithCategory = {
        title: 'Task',
        categoryId: workCategory.id,
      }

      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - setCategoryForTask action doesn't exist yet
      useTaskStore.getState().setCategoryForTask(task.id, personalCategory.id)

      const updated = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - categoryId field doesn't exist yet
      expect(updated?.categoryId).toBe(personalCategory.id)
    })

    it('should remove category from task', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      const dto: TaskWithCategory = {
        title: 'Task',
        categoryId: category.id,
      }

      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - removeCategoryFromTask action doesn't exist yet
      useTaskStore.getState().removeCategoryFromTask(task.id)

      const updated = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - categoryId field doesn't exist yet
      expect(updated?.categoryId).toBeUndefined()
    })

    it('should throw error when assigning non-existent category', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      expect(() => {
        // @ts-expect-error - setCategoryForTask action doesn't exist yet
        useTaskStore.getState().setCategoryForTask(task.id, 'non-existent-category-id')
      }).toThrow('Category not found')
    })

    it('should throw error when assigning category to non-existent task', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      expect(() => {
        // @ts-expect-error - setCategoryForTask action doesn't exist yet
        useTaskStore.getState().setCategoryForTask('non-existent-task-id', category.id)
      }).toThrow('Task not found')
    })

    it('should preserve category when updating task', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      const dto: TaskWithCategory = {
        title: 'Task',
        categoryId: category.id,
      }

      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      useTaskStore.getState().updateTask(task.id, { title: 'Updated Task' })

      const updated = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - categoryId field doesn't exist yet
      expect(updated?.categoryId).toBe(category.id)
    })
  })

  describe('Store - Get Tasks by Category', () => {
    it('should get tasks by category', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Personal', color: '#10b981' })

      // @ts-expect-error - categories field doesn't exist yet
      const workCategory = useTaskStore.getState().categories[0]
      // @ts-expect-error - categories field doesn't exist yet
      const personalCategory = useTaskStore.getState().categories[1]

      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Work Task 1', categoryId: workCategory.id })
      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Personal Task', categoryId: personalCategory.id })
      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Work Task 2', categoryId: workCategory.id })

      // @ts-expect-error - getTasksByCategory action doesn't exist yet
      const workTasks = useTaskStore.getState().getTasksByCategory(workCategory.id)

      expect(workTasks).toHaveLength(2)
      expect(workTasks[0].title).toBe('Work Task 1')
      expect(workTasks[1].title).toBe('Work Task 2')
    })

    it('should get uncategorized tasks', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      useTaskStore.getState().addTask({ title: 'Uncategorized Task 1' })
      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Work Task', categoryId: category.id })
      useTaskStore.getState().addTask({ title: 'Uncategorized Task 2' })

      // @ts-expect-error - getUncategorizedTasks action doesn't exist yet
      const uncategorized = useTaskStore.getState().getUncategorizedTasks()

      expect(uncategorized).toHaveLength(2)
      expect(uncategorized[0].title).toBe('Uncategorized Task 1')
      expect(uncategorized[1].title).toBe('Uncategorized Task 2')
    })

    it('should count tasks by category', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Personal', color: '#10b981' })

      // @ts-expect-error - categories field doesn't exist yet
      const workCategory = useTaskStore.getState().categories[0]
      // @ts-expect-error - categories field doesn't exist yet
      const personalCategory = useTaskStore.getState().categories[1]

      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Work Task 1', categoryId: workCategory.id })
      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Work Task 2', categoryId: workCategory.id })
      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Personal Task', categoryId: personalCategory.id })

      // @ts-expect-error - getCategoryTaskCount action doesn't exist yet
      expect(useTaskStore.getState().getCategoryTaskCount(workCategory.id)).toBe(2)
      // @ts-expect-error - getCategoryTaskCount action doesn't exist yet
      expect(useTaskStore.getState().getCategoryTaskCount(personalCategory.id)).toBe(1)
    })

    it('should return empty array for category with no tasks', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      // @ts-expect-error - getTasksByCategory action doesn't exist yet
      const tasks = useTaskStore.getState().getTasksByCategory(category.id)

      expect(tasks).toHaveLength(0)
    })
  })

  describe('Store - Category Deletion with Tasks', () => {
    it('should remove category from tasks when category is deleted', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', categoryId: category.id })
      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', categoryId: category.id })

      // @ts-expect-error - deleteCategory action doesn't exist yet
      useTaskStore.getState().deleteCategory(category.id)

      const tasks = useTaskStore.getState().tasks

      // @ts-expect-error - categoryId field doesn't exist yet
      expect(tasks[0].categoryId).toBeUndefined()
      // @ts-expect-error - categoryId field doesn't exist yet
      expect(tasks[1].categoryId).toBeUndefined()
    })
  })
})

describe('User Story 3.3: Filter by Category', () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [],
      currentFilter: 'all' as any,
      sortBy: 'dateCreated' as any,
      sortDirection: 'desc' as any,
      searchQuery: '',
    })
  })

  describe('Store - Category Filtering', () => {
    it('should filter tasks by single category', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Personal', color: '#10b981' })

      // @ts-expect-error - categories field doesn't exist yet
      const workCategory = useTaskStore.getState().categories[0]
      // @ts-expect-error - categories field doesn't exist yet
      const personalCategory = useTaskStore.getState().categories[1]

      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Work Task 1', categoryId: workCategory.id })
      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Personal Task', categoryId: personalCategory.id })
      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Work Task 2', categoryId: workCategory.id })

      // @ts-expect-error - setCategoryFilter action doesn't exist yet
      useTaskStore.getState().setCategoryFilter([workCategory.id])

      // @ts-expect-error - getFilteredTasksByCategory action doesn't exist yet
      const filtered = useTaskStore.getState().getFilteredTasksByCategory()

      expect(filtered).toHaveLength(2)
      expect(filtered[0].title).toBe('Work Task 1')
      expect(filtered[1].title).toBe('Work Task 2')
    })

    it('should filter tasks by multiple categories', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Personal', color: '#10b981' })
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Shopping', color: '#f59e0b' })

      // @ts-expect-error - categories field doesn't exist yet
      const categories = useTaskStore.getState().categories

      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Work Task', categoryId: categories[0].id })
      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Personal Task', categoryId: categories[1].id })
      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Shopping Task', categoryId: categories[2].id })

      // @ts-expect-error - setCategoryFilter action doesn't exist yet
      useTaskStore.getState().setCategoryFilter([categories[0].id, categories[1].id])

      // @ts-expect-error - getFilteredTasksByCategory action doesn't exist yet
      const filtered = useTaskStore.getState().getFilteredTasksByCategory()

      expect(filtered).toHaveLength(2)
      expect(filtered.some((t) => t.title === 'Work Task')).toBe(true)
      expect(filtered.some((t) => t.title === 'Personal Task')).toBe(true)
      expect(filtered.some((t) => t.title === 'Shopping Task')).toBe(false)
    })

    it('should include uncategorized tasks when filter includes null', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Work Task', categoryId: category.id })
      useTaskStore.getState().addTask({ title: 'Uncategorized Task' })

      // @ts-expect-error - setCategoryFilter action doesn't exist yet
      useTaskStore.getState().setCategoryFilter([null])

      // @ts-expect-error - getFilteredTasksByCategory action doesn't exist yet
      const filtered = useTaskStore.getState().getFilteredTasksByCategory()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].title).toBe('Uncategorized Task')
    })

    it('should combine category filter with status filter', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Active Work Task', categoryId: category.id })
      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Completed Work Task', categoryId: category.id })

      const tasks = useTaskStore.getState().tasks
      useTaskStore.getState().toggleTaskComplete(tasks[1].id)

      // @ts-expect-error - setCategoryFilter action doesn't exist yet
      useTaskStore.getState().setCategoryFilter([category.id])
      useTaskStore.getState().setFilter('active' as any)

      // @ts-expect-error - getFilteredSearchedAndSortedTasks should support category
      const filtered = useTaskStore.getState().getFilteredSearchedAndSortedTasks()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].title).toBe('Active Work Task')
    })

    it('should clear category filter', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Work Task', categoryId: category.id })
      useTaskStore.getState().addTask({ title: 'Uncategorized Task' })

      // @ts-expect-error - setCategoryFilter action doesn't exist yet
      useTaskStore.getState().setCategoryFilter([category.id])
      // @ts-expect-error - clearCategoryFilter action doesn't exist yet
      useTaskStore.getState().clearCategoryFilter()

      // @ts-expect-error - getFilteredTasksByCategory action doesn't exist yet
      const filtered = useTaskStore.getState().getFilteredTasksByCategory()

      expect(filtered).toHaveLength(2)
    })

    it('should return empty array when no category filter is set', () => {
      useTaskStore.getState().addTask({ title: 'Task' })

      // @ts-expect-error - categoryFilters field doesn't exist yet
      const categoryFilters = useTaskStore.getState().categoryFilters

      expect(categoryFilters).toEqual([])
    })
  })
})
