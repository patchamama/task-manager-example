/**
 * Task Search Tests - EPIC 2
 * User Story 2.4: Search Tasks
 *
 * Tests the ability to search tasks by title or description
 * Real-time filtering with debounce (300ms)
 * Case-insensitive search
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTaskStore } from '../store/task.store'

describe('User Story 2.4: Search Tasks', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { tasks } = useTaskStore.getState()
    tasks.forEach((task) => useTaskStore.getState().deleteTask(task.id))

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Store - Search State Management', () => {
    it('should have default search query as empty string', () => {
      // @ts-expect-error - searchQuery property doesn't exist yet
      const searchQuery = useTaskStore.getState().searchQuery
      expect(searchQuery).toBe('')
    })

    it('should set search query', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('test')

      // @ts-expect-error - searchQuery property doesn't exist yet
      const searchQuery = useTaskStore.getState().searchQuery
      expect(searchQuery).toBe('test')
    })

    it('should clear search query', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('test')
      // @ts-expect-error - clearSearch action doesn't exist yet
      useTaskStore.getState().clearSearch()

      // @ts-expect-error - searchQuery property doesn't exist yet
      const searchQuery = useTaskStore.getState().searchQuery
      expect(searchQuery).toBe('')
    })
  })

  describe('Store - Search by Title', () => {
    beforeEach(() => {
      useTaskStore.getState().addTask({ title: 'Buy groceries', description: 'Milk and bread' })
      useTaskStore.getState().addTask({ title: 'Call dentist', description: 'Schedule appointment' })
      useTaskStore.getState().addTask({ title: 'Fix bug in code', description: 'Urgent issue' })
      useTaskStore.getState().addTask({ title: 'Write blog post', description: 'About testing' })
    })

    it('should return all tasks when search is empty', () => {
      // @ts-expect-error - getSearchResults action doesn't exist yet
      const results = useTaskStore.getState().getSearchResults()
      expect(results).toHaveLength(4)
    })

    it('should find task by exact title match', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('Buy groceries')

      // @ts-expect-error - getSearchResults action doesn't exist yet
      const results = useTaskStore.getState().getSearchResults()

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Buy groceries')
    })

    it('should find task by partial title match', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('bug')

      // @ts-expect-error - getSearchResults action doesn't exist yet
      const results = useTaskStore.getState().getSearchResults()

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Fix bug in code')
    })

    it('should find multiple tasks matching search term', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('call')

      // @ts-expect-error - getSearchResults action doesn't exist yet
      const results = useTaskStore.getState().getSearchResults()

      // Should match "Call dentist"
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results.some(t => t.title === 'Call dentist')).toBe(true)
    })

    it('should perform case-insensitive search', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('BUY')

      // @ts-expect-error - getSearchResults action doesn't exist yet
      const results = useTaskStore.getState().getSearchResults()

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Buy groceries')
    })

    it('should search with mixed case', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('FiX bUg')

      // @ts-expect-error - getSearchResults action doesn't exist yet
      const results = useTaskStore.getState().getSearchResults()

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Fix bug in code')
    })
  })

  describe('Store - Search by Description', () => {
    beforeEach(() => {
      useTaskStore.getState().addTask({ title: 'Task 1', description: 'Important meeting notes' })
      useTaskStore.getState().addTask({ title: 'Task 2', description: 'Review pull request' })
      useTaskStore.getState().addTask({ title: 'Task 3', description: 'Meeting with team' })
    })

    it('should find task by description match', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('pull request')

      // @ts-expect-error - getSearchResults action doesn't exist yet
      const results = useTaskStore.getState().getSearchResults()

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Task 2')
    })

    it('should find task by partial description match', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('notes')

      // @ts-expect-error - getSearchResults action doesn't exist yet
      const results = useTaskStore.getState().getSearchResults()

      expect(results).toHaveLength(1)
      expect(results[0].description).toContain('notes')
    })

    it('should find multiple tasks with matching descriptions', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('meeting')

      // @ts-expect-error - getSearchResults action doesn't exist yet
      const results = useTaskStore.getState().getSearchResults()

      expect(results).toHaveLength(2)
      expect(results[0].description).toContain('meeting')
      expect(results[1].description).toContain('Meeting')
    })

    it('should search descriptions case-insensitively', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('REVIEW')

      // @ts-expect-error - getSearchResults action doesn't exist yet
      const results = useTaskStore.getState().getSearchResults()

      expect(results).toHaveLength(1)
      expect(results[0].description).toContain('Review')
    })
  })

  describe('Store - Search Both Title and Description', () => {
    beforeEach(() => {
      useTaskStore.getState().addTask({ title: 'Project Alpha', description: 'Initial setup' })
      useTaskStore.getState().addTask({ title: 'Setup environment', description: 'Install dependencies' })
      useTaskStore.getState().addTask({ title: 'Debug issue', description: 'Alpha version bug' })
    })

    it('should find tasks matching in either title or description', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('Alpha')

      // @ts-expect-error - getSearchResults action doesn't exist yet
      const results = useTaskStore.getState().getSearchResults()

      expect(results).toHaveLength(2)
      // Should match "Project Alpha" (title) and "Debug issue" (description)
      expect(results.some(t => t.title === 'Project Alpha')).toBe(true)
      expect(results.some(t => t.description.includes('Alpha'))).toBe(true)
    })

    it('should find task when term appears in both title and description', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('setup')

      // @ts-expect-error - getSearchResults action doesn't exist yet
      const results = useTaskStore.getState().getSearchResults()

      expect(results).toHaveLength(2)
      expect(results.some(t => t.title.includes('Setup'))).toBe(true)
      expect(results.some(t => t.description.includes('setup'))).toBe(true)
    })
  })

  describe('Store - Search Edge Cases', () => {
    beforeEach(() => {
      useTaskStore.getState().addTask({ title: 'Task 1', description: 'Description 1' })
      useTaskStore.getState().addTask({ title: 'Task 2', description: 'Description 2' })
    })

    it('should return empty array when no matches found', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('nonexistent')

      // @ts-expect-error - getSearchResults action doesn't exist yet
      const results = useTaskStore.getState().getSearchResults()

      expect(results).toHaveLength(0)
    })

    it('should handle search with special characters', () => {
      useTaskStore.getState().addTask({ title: 'Fix bug #123', description: 'Issue tracked' })

      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('#123')

      // @ts-expect-error - getSearchResults action doesn't exist yet
      const results = useTaskStore.getState().getSearchResults()

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Fix bug #123')
    })

    it('should handle search with numbers', () => {
      useTaskStore.getState().addTask({ title: 'Version 2.0 release', description: 'Major update' })

      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('2.0')

      // @ts-expect-error - getSearchResults action doesn't exist yet
      const results = useTaskStore.getState().getSearchResults()

      expect(results).toHaveLength(1)
    })

    it('should trim whitespace from search query', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('  Task 1  ')

      // @ts-expect-error - getSearchResults action doesn't exist yet
      const results = useTaskStore.getState().getSearchResults()

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Task 1')
    })

    it('should handle empty search query', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('')

      // @ts-expect-error - getSearchResults action doesn't exist yet
      const results = useTaskStore.getState().getSearchResults()

      expect(results).toHaveLength(2) // All tasks
    })

    it('should handle search query with only spaces', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('   ')

      // @ts-expect-error - getSearchResults action doesn't exist yet
      const results = useTaskStore.getState().getSearchResults()

      expect(results).toHaveLength(2) // All tasks (empty after trim)
    })
  })

  describe('Store - Combined Search with Filters and Sort', () => {
    beforeEach(() => {
      useTaskStore.getState().addTask({ title: 'Active task with meeting', description: 'Prepare slides' })
      useTaskStore.getState().addTask({ title: 'Complete report', description: 'Meeting summary' })
      useTaskStore.getState().addTask({ title: 'Review code', description: 'PR feedback' })

      const tasks = useTaskStore.getState().tasks
      // Complete the second task
      useTaskStore.getState().toggleTaskComplete(tasks[1].id)
    })

    it('should apply search to filtered results', () => {
      // Filter to active tasks
      // @ts-expect-error - setFilter action doesn't exist yet
      useTaskStore.getState().setFilter('active')

      // Search for "meeting"
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('meeting')

      // @ts-expect-error - getFilteredAndSearchedTasks action doesn't exist yet
      const results = useTaskStore.getState().getFilteredAndSearchedTasks()

      // Should only return active tasks with "meeting"
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Active task with meeting')
    })

    it('should apply search and sort together', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('task')

      // @ts-expect-error - setSortBy action doesn't exist yet
      useTaskStore.getState().setSortBy('title')
      // @ts-expect-error - setSortDirection action doesn't exist yet
      useTaskStore.getState().setSortDirection('asc')

      // @ts-expect-error - getSearchedAndSortedTasks action doesn't exist yet
      const results = useTaskStore.getState().getSearchedAndSortedTasks()

      // Should return tasks with "task" in title/description, sorted by title
      expect(results.length).toBeGreaterThanOrEqual(1)
      // Verify sorting
      if (results.length > 1) {
        expect(results[0].title.localeCompare(results[1].title)).toBeLessThanOrEqual(0)
      }
    })

    it('should apply search, filter, and sort together', () => {
      // @ts-expect-error - setFilter action doesn't exist yet
      useTaskStore.getState().setFilter('active')
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('review')
      // @ts-expect-error - setSortBy action doesn't exist yet
      useTaskStore.getState().setSortBy('title')

      // @ts-expect-error - getFilteredSearchedAndSortedTasks action doesn't exist yet
      const results = useTaskStore.getState().getFilteredSearchedAndSortedTasks()

      // Should return active tasks with "review", sorted
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Review code')
    })
  })

  describe('Store - Search Result Count', () => {
    beforeEach(() => {
      useTaskStore.getState().addTask({ title: 'Task A', description: 'Important' })
      useTaskStore.getState().addTask({ title: 'Task B', description: 'Important work' })
      useTaskStore.getState().addTask({ title: 'Task C', description: 'Regular task' })
    })

    it('should get count of search results', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('Important')

      // @ts-expect-error - getSearchResultCount action doesn't exist yet
      const count = useTaskStore.getState().getSearchResultCount()

      expect(count).toBe(2)
    })

    it('should return total task count when search is empty', () => {
      // @ts-expect-error - getSearchResultCount action doesn't exist yet
      const count = useTaskStore.getState().getSearchResultCount()

      expect(count).toBe(3)
    })

    it('should return 0 when no results match', () => {
      // @ts-expect-error - setSearchQuery action doesn't exist yet
      useTaskStore.getState().setSearchQuery('nonexistent')

      // @ts-expect-error - getSearchResultCount action doesn't exist yet
      const count = useTaskStore.getState().getSearchResultCount()

      expect(count).toBe(0)
    })
  })
})
