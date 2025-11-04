import React from 'react'
/**
 * EPIC 3 Integration Tests
 * Categories & Tags - Combined Features
 *
 * Tests the integration of all EPIC 3 features:
 * - Category creation and management
 * - Tag creation and management
 * - Filtering by categories and tags
 * - Combined filtering with EPIC 1 & 2 features
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTaskStore } from '../store/task.store'
import { TaskStatus, TaskPriority } from '../types/task.types'

/**
 * Category interface for integration tests
 */
interface Category {
  id: string
  name: string
  color: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Extended task with categories and tags
 */
interface TaskWithCategoriesAndTags {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
  categoryId?: string
  tags: string[]
}

describe('EPIC 3: Categories & Tags Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useTaskStore.setState({
      tasks: [],
      currentFilter: TaskFilter.ALL as any,
      sortBy: TaskSortBy.DATE_CREATED as any,
      sortDirection: TaskSortDirection.DESC as any,
      searchQuery: '',
      // @ts-expect-error - categories field doesn't exist yet
      categories: [],
      // @ts-expect-error - categoryFilters field doesn't exist yet
      categoryFilters: [],
      // @ts-expect-error - tagFilters field doesn't exist yet
      tagFilters: [],
    })
  })

  describe('Integration: Category + Task Workflow', () => {
    it('should create category, create task with category, and display correctly', () => {
      // Create category
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })

      // @ts-expect-error - categories field doesn't exist yet
      const categories = useTaskStore.getState().categories
      expect(categories).toHaveLength(1)

      const category = categories[0]

      // Create task with category
      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Work Task', categoryId: category.id })

      const tasks = useTaskStore.getState().tasks
      expect(tasks).toHaveLength(1)
      // @ts-expect-error - categoryId field doesn't exist yet
      expect(tasks[0].categoryId).toBe(category.id)
    })

    it('should filter tasks by category', () => {
      // Create categories
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Personal', color: '#10b981' })

      // @ts-expect-error - categories field doesn't exist yet
      const [workCategory, personalCategory] = useTaskStore.getState().categories

      // Create tasks
      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Work Task 1', categoryId: workCategory.id })
      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Personal Task', categoryId: personalCategory.id })
      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Work Task 2', categoryId: workCategory.id })

      // Filter by work category
      // @ts-expect-error - setCategoryFilter action doesn't exist yet
      useTaskStore.getState().setCategoryFilter([workCategory.id])

      // @ts-expect-error - getFilteredTasksByCategory action doesn't exist yet
      const filtered = useTaskStore.getState().getFilteredTasksByCategory()

      expect(filtered).toHaveLength(2)
      expect(filtered[0].title).toBe('Work Task 1')
      expect(filtered[1].title).toBe('Work Task 2')
    })

    it('should delete category and remove from tasks', () => {
      // Create category and task
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Work Task', categoryId: category.id })

      // Delete category
      // @ts-expect-error - deleteCategory action doesn't exist yet
      useTaskStore.getState().deleteCategory(category.id)

      // Check task no longer has category
      const task = useTaskStore.getState().tasks[0]
      // @ts-expect-error - categoryId field doesn't exist yet
      expect(task.categoryId).toBeUndefined()
    })
  })

  describe('Integration: Tag + Task Workflow', () => {
    it('should create task with tags and manage them', () => {
      // Create task with tags
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task', tags: ['urgent', 'bug'] })

      const task = useTaskStore.getState().tasks[0]
      // @ts-expect-error - tags field doesn't exist yet
      expect(task.tags).toEqual(['urgent', 'bug'])

      // Add another tag
      // @ts-expect-error - addTagToTask action doesn't exist yet
      useTaskStore.getState().addTagToTask(task.id, 'frontend')

      const updated = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - tags field doesn't exist yet
      expect(updated?.tags).toEqual(['urgent', 'bug', 'frontend'])

      // Remove tag
      // @ts-expect-error - removeTagFromTask action doesn't exist yet
      useTaskStore.getState().removeTagFromTask(task.id, 'bug')

      const final = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - tags field doesn't exist yet
      expect(final?.tags).toEqual(['urgent', 'frontend'])
    })

    it('should filter tasks by tag', () => {
      // Create tasks with tags
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', tags: ['bug'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 3', tags: ['urgent', 'bug'] })

      // Filter by urgent tag
      // @ts-expect-error - setTagFilter action doesn't exist yet
      useTaskStore.getState().setTagFilter(['urgent'])

      // @ts-expect-error - getFilteredTasksByTag action doesn't exist yet
      const filtered = useTaskStore.getState().getFilteredTasksByTag()

      expect(filtered).toHaveLength(2)
      expect(filtered[0].title).toBe('Task 1')
      expect(filtered[1].title).toBe('Task 3')
    })

    it('should rename tag across all tasks', () => {
      // Create tasks with same tag
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', tags: ['urgent', 'bug'] })

      // Rename tag
      // @ts-expect-error - renameTag action doesn't exist yet
      useTaskStore.getState().renameTag('urgent', 'critical')

      const tasks = useTaskStore.getState().tasks

      // @ts-expect-error - tags field doesn't exist yet
      expect(tasks[0].tags).toEqual(['critical'])
      // @ts-expect-error - tags field doesn't exist yet
      expect(tasks[1].tags).toEqual(['critical', 'bug'])
    })

    it('should delete tag from all tasks', () => {
      // Create tasks with tag
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent', 'bug'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', tags: ['urgent'] })

      // Delete tag
      // @ts-expect-error - deleteTag action doesn't exist yet
      useTaskStore.getState().deleteTag('urgent')

      const tasks = useTaskStore.getState().tasks

      // @ts-expect-error - tags field doesn't exist yet
      expect(tasks[0].tags).toEqual(['bug'])
      // @ts-expect-error - tags field doesn't exist yet
      expect(tasks[1].tags).toEqual([])
    })
  })

  describe('Integration: Category + Tag Combined Filtering', () => {
    it('should filter by both category and tag', () => {
      // Create categories
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Personal', color: '#10b981' })

      // @ts-expect-error - categories field doesn't exist yet
      const [workCategory, personalCategory] = useTaskStore.getState().categories

      // Create tasks with categories and tags
      useTaskStore.getState().addTask({
        title: 'Urgent Work Task',
        // @ts-expect-error - categoryId and tags not supported yet
        categoryId: workCategory.id,
        tags: ['urgent'],
      })
      useTaskStore.getState().addTask({
        title: 'Regular Work Task',
        // @ts-expect-error - categoryId and tags not supported yet
        categoryId: workCategory.id,
        tags: ['regular'],
      })
      useTaskStore.getState().addTask({
        title: 'Urgent Personal Task',
        // @ts-expect-error - categoryId and tags not supported yet
        categoryId: personalCategory.id,
        tags: ['urgent'],
      })

      // Filter by work category AND urgent tag
      // @ts-expect-error - setCategoryFilter action doesn't exist yet
      useTaskStore.getState().setCategoryFilter([workCategory.id])
      // @ts-expect-error - setTagFilter action doesn't exist yet
      useTaskStore.getState().setTagFilter(['urgent'])

      // @ts-expect-error - getFilteredTasksByCategoryAndTag action doesn't exist yet
      const filtered = useTaskStore.getState().getFilteredTasksByCategoryAndTag()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].title).toBe('Urgent Work Task')
    })

    it('should combine category, tag, and status filters', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const workCategory = useTaskStore.getState().categories[0]

      // Create tasks
      useTaskStore.getState().addTask({
        title: 'Active Urgent Work',
        // @ts-expect-error - categoryId and tags not supported yet
        categoryId: workCategory.id,
        tags: ['urgent'],
      })
      useTaskStore.getState().addTask({
        title: 'Completed Urgent Work',
        // @ts-expect-error - categoryId and tags not supported yet
        categoryId: workCategory.id,
        tags: ['urgent'],
      })

      const tasks = useTaskStore.getState().tasks
      useTaskStore.getState().toggleTaskComplete(tasks[1].id)

      // Filter by work category, urgent tag, and active status
      // @ts-expect-error - setCategoryFilter action doesn't exist yet
      useTaskStore.getState().setCategoryFilter([workCategory.id])
      // @ts-expect-error - setTagFilter action doesn't exist yet
      useTaskStore.getState().setTagFilter(['urgent'])
      useTaskStore.getState().setFilter('active' as any)

      // @ts-expect-error - getFilteredSearchedAndSortedTasks should support category and tag
      const filtered = useTaskStore.getState().getFilteredSearchedAndSortedTasks()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].title).toBe('Active Urgent Work')
    })
  })

  describe('Integration: Search with Categories and Tags', () => {
    it('should search in tasks filtered by category', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const workCategory = useTaskStore.getState().categories[0]

      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Fix bug', categoryId: workCategory.id })
      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Add feature', categoryId: workCategory.id })
      useTaskStore.getState().addTask({ title: 'Fix typo' })

      // @ts-expect-error - setCategoryFilter action doesn't exist yet
      useTaskStore.getState().setCategoryFilter([workCategory.id])
      useTaskStore.getState().setSearchQuery('fix')

      // @ts-expect-error - getFilteredSearchedAndSortedTasks should support category
      const results = useTaskStore.getState().getFilteredSearchedAndSortedTasks()

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Fix bug')
    })

    it('should search in tasks filtered by tag', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Fix urgent bug', tags: ['urgent'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Add urgent feature', tags: ['urgent'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Fix regular bug', tags: ['regular'] })

      // @ts-expect-error - setTagFilter action doesn't exist yet
      useTaskStore.getState().setTagFilter(['urgent'])
      useTaskStore.getState().setSearchQuery('bug')

      // @ts-expect-error - getFilteredSearchedAndSortedTasks should support tag
      const results = useTaskStore.getState().getFilteredSearchedAndSortedTasks()

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Fix urgent bug')
    })
  })

  describe('Integration: Sort with Categories and Tags', () => {
    it('should sort filtered tasks by priority', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const workCategory = useTaskStore.getState().categories[0]

      // Create tasks with different priorities
      useTaskStore.getState().addTask({
        title: 'Low Priority',
        priority: TaskPriority.LOW,
        // @ts-expect-error - categoryId parameter not supported yet
        categoryId: workCategory.id,
      })
      useTaskStore.getState().addTask({
        title: 'Critical Priority',
        priority: TaskPriority.CRITICAL,
        // @ts-expect-error - categoryId parameter not supported yet
        categoryId: workCategory.id,
      })
      useTaskStore.getState().addTask({
        title: 'High Priority',
        priority: TaskPriority.HIGH,
        // @ts-expect-error - categoryId parameter not supported yet
        categoryId: workCategory.id,
      })

      // Filter by work category and sort by priority DESC
      // @ts-expect-error - setCategoryFilter action doesn't exist yet
      useTaskStore.getState().setCategoryFilter([workCategory.id])
      useTaskStore.getState().setSortBy('priority' as any)
      useTaskStore.getState().setSortDirection('desc' as any)

      // @ts-expect-error - getFilteredSearchedAndSortedTasks should support category
      const sorted = useTaskStore.getState().getFilteredSearchedAndSortedTasks()

      expect(sorted[0].title).toBe('Critical Priority')
      expect(sorted[1].title).toBe('High Priority')
      expect(sorted[2].title).toBe('Low Priority')
    })
  })

  describe('Integration: Category Management Impact on Filtering', () => {
    it('should update filter results when category is deleted', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const workCategory = useTaskStore.getState().categories[0]

      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Work Task', categoryId: workCategory.id })
      useTaskStore.getState().addTask({ title: 'No Category Task' })

      // Filter by work category
      // @ts-expect-error - setCategoryFilter action doesn't exist yet
      useTaskStore.getState().setCategoryFilter([workCategory.id])

      // @ts-expect-error - getFilteredTasksByCategory action doesn't exist yet
      let filtered = useTaskStore.getState().getFilteredTasksByCategory()
      expect(filtered).toHaveLength(1)

      // Delete category
      // @ts-expect-error - deleteCategory action doesn't exist yet
      useTaskStore.getState().deleteCategory(workCategory.id)

      // Filter should now return nothing (category was removed from filter)
      // @ts-expect-error - getFilteredTasksByCategory action doesn't exist yet
      filtered = useTaskStore.getState().getFilteredTasksByCategory()
      expect(filtered).toHaveLength(0)
    })

    it('should update category name in filter when renamed', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      // Update category name
      // @ts-expect-error - updateCategory action doesn't exist yet
      useTaskStore.getState().updateCategory(category.id, { name: 'Office' })

      // @ts-expect-error - getCategoryById action doesn't exist yet
      const updated = useTaskStore.getState().getCategoryById(category.id)
      expect(updated?.name).toBe('Office')
    })
  })

  describe('Integration: Tag Management Impact on Filtering', () => {
    it('should update filter results when tag is renamed', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', tags: ['urgent'] })

      // Filter by urgent tag
      // @ts-expect-error - setTagFilter action doesn't exist yet
      useTaskStore.getState().setTagFilter(['urgent'])

      // @ts-expect-error - getFilteredTasksByTag action doesn't exist yet
      let filtered = useTaskStore.getState().getFilteredTasksByTag()
      expect(filtered).toHaveLength(2)

      // Rename tag
      // @ts-expect-error - renameTag action doesn't exist yet
      useTaskStore.getState().renameTag('urgent', 'critical')

      // Filter should still work with new tag name
      // @ts-expect-error - clearTagFilter action doesn't exist yet
      useTaskStore.getState().clearTagFilter()
      // @ts-expect-error - setTagFilter action doesn't exist yet
      useTaskStore.getState().setTagFilter(['critical'])

      // @ts-expect-error - getFilteredTasksByTag action doesn't exist yet
      filtered = useTaskStore.getState().getFilteredTasksByTag()
      expect(filtered).toHaveLength(2)
    })
  })

  describe('Integration: Complex Multi-Filter Scenarios', () => {
    it('should handle filtering by multiple categories, multiple tags, status, and search', () => {
      // Setup categories
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Personal', color: '#10b981' })

      // @ts-expect-error - categories field doesn't exist yet
      const [workCategory, personalCategory] = useTaskStore.getState().categories

      // Create diverse tasks
      useTaskStore.getState().addTask({
        title: 'Fix urgent work bug',
        priority: TaskPriority.HIGH,
        // @ts-expect-error - categoryId and tags not supported yet
        categoryId: workCategory.id,
        tags: ['urgent', 'bug'],
      })
      useTaskStore.getState().addTask({
        title: 'Fix urgent personal bug',
        priority: TaskPriority.HIGH,
        // @ts-expect-error - categoryId and tags not supported yet
        categoryId: personalCategory.id,
        tags: ['urgent', 'bug'],
      })
      useTaskStore.getState().addTask({
        title: 'Add work feature',
        priority: TaskPriority.MEDIUM,
        // @ts-expect-error - categoryId and tags not supported yet
        categoryId: workCategory.id,
        tags: ['feature'],
      })

      // Complete the personal task
      const tasks = useTaskStore.getState().tasks
      useTaskStore.getState().toggleTaskComplete(tasks[1].id)

      // Apply multiple filters
      // @ts-expect-error - setCategoryFilter action doesn't exist yet
      useTaskStore.getState().setCategoryFilter([workCategory.id, personalCategory.id])
      // @ts-expect-error - setTagFilter action doesn't exist yet
      useTaskStore.getState().setTagFilter(['urgent', 'bug'])
      useTaskStore.getState().setFilter('active' as any)
      useTaskStore.getState().setSearchQuery('bug')

      // @ts-expect-error - getFilteredSearchedAndSortedTasks should support all filters
      const results = useTaskStore.getState().getFilteredSearchedAndSortedTasks()

      // Should only return active work tasks with urgent/bug tags containing 'bug'
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Fix urgent work bug')
    })
  })

  describe('Integration: Performance with Large Datasets', () => {
    it('should handle 100+ tasks with categories and tags efficiently', () => {
      // Create categories
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Personal', color: '#10b981' })

      // @ts-expect-error - categories field doesn't exist yet
      const [workCategory, personalCategory] = useTaskStore.getState().categories

      // Create 100 tasks
      const startTime = performance.now()

      for (let i = 0; i < 100; i++) {
        useTaskStore.getState().addTask({
          title: `Task ${i}`,
          // @ts-expect-error - categoryId and tags not supported yet
          categoryId: i % 2 === 0 ? workCategory.id : personalCategory.id,
          tags: i % 3 === 0 ? ['urgent'] : ['regular'],
        })
      }

      const createTime = performance.now() - startTime

      // Filter tasks
      const filterStart = performance.now()
      // @ts-expect-error - setCategoryFilter action doesn't exist yet
      useTaskStore.getState().setCategoryFilter([workCategory.id])
      // @ts-expect-error - setTagFilter action doesn't exist yet
      useTaskStore.getState().setTagFilter(['urgent'])
      // @ts-expect-error - getFilteredTasksByCategoryAndTag action doesn't exist yet
      const filtered = useTaskStore.getState().getFilteredTasksByCategoryAndTag()
      const filterTime = performance.now() - filterStart

      // Verify results
      expect(filtered.length).toBeGreaterThan(0)

      // Performance assertions (should be fast)
      expect(createTime).toBeLessThan(1000) // 1 second for 100 tasks
      expect(filterTime).toBeLessThan(100) // 100ms for filtering
    })
  })

  describe('Integration: Edge Cases', () => {
    it('should handle task with category but no tags', () => {
      // @ts-expect-error - addCategory action doesn't exist yet
      useTaskStore.getState().addCategory({ name: 'Work', color: '#3b82f6' })
      // @ts-expect-error - categories field doesn't exist yet
      const category = useTaskStore.getState().categories[0]

      // @ts-expect-error - categoryId parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task', categoryId: category.id })

      const task = useTaskStore.getState().tasks[0]
      // @ts-expect-error - categoryId field doesn't exist yet
      expect(task.categoryId).toBe(category.id)
      // @ts-expect-error - tags field doesn't exist yet
      expect(task.tags).toEqual([])
    })

    it('should handle task with tags but no category', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task', tags: ['urgent'] })

      const task = useTaskStore.getState().tasks[0]
      // @ts-expect-error - categoryId field doesn't exist yet
      expect(task.categoryId).toBeUndefined()
      // @ts-expect-error - tags field doesn't exist yet
      expect(task.tags).toEqual(['urgent'])
    })

    it('should handle task with neither category nor tags', () => {
      useTaskStore.getState().addTask({ title: 'Task' })

      const task = useTaskStore.getState().tasks[0]
      // @ts-expect-error - categoryId field doesn't exist yet
      expect(task.categoryId).toBeUndefined()
      // @ts-expect-error - tags field doesn't exist yet
      expect(task.tags).toEqual([])
    })

    it('should handle empty filter arrays', () => {
      useTaskStore.getState().addTask({ title: 'Task' })

      // @ts-expect-error - setCategoryFilter action doesn't exist yet
      useTaskStore.getState().setCategoryFilter([])
      // @ts-expect-error - setTagFilter action doesn't exist yet
      useTaskStore.getState().setTagFilter([])

      // @ts-expect-error - getFilteredTasksByCategoryAndTag action doesn't exist yet
      const filtered = useTaskStore.getState().getFilteredTasksByCategoryAndTag()

      expect(filtered).toHaveLength(1)
    })
  })
})

// Add missing enum imports
enum TaskFilter {
  ALL = 'all',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

enum TaskSortBy {
  DATE_CREATED = 'dateCreated',
  PRIORITY = 'priority',
  TITLE = 'title',
  DUE_DATE = 'dueDate',
}

enum TaskSortDirection {
  ASC = 'asc',
  DESC = 'desc',
}
