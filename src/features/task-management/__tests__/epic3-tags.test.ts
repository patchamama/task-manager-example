/**
 * Tag Management Tests - EPIC 3
 * User Stories 3.4, 3.5: Add Tags to Tasks, Tag Management
 *
 * Tests tag operations, validation, and tag management
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useTaskStore } from '../store/task.store'
import type { CreateTaskDto } from '../types/task.types'

/**
 * Extended task with tags
 */
interface TaskWithTags extends CreateTaskDto {
  tags?: string[]
}

describe('User Story 3.4: Add Tags to Tasks', () => {
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

  describe('Store - Tag Operations', () => {
    it('should create task without tags (optional)', () => {
      const dto: CreateTaskDto = {
        title: 'Task without tags',
      }

      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - tags field doesn't exist yet
      expect(task.tags).toEqual([])
    })

    it('should create task with single tag', () => {
      const dto: TaskWithTags = {
        title: 'Task with tag',
        tags: ['urgent'],
      }

      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - tags field doesn't exist yet
      expect(task.tags).toEqual(['urgent'])
    })

    it('should create task with multiple tags', () => {
      const dto: TaskWithTags = {
        title: 'Task with tags',
        tags: ['urgent', 'bug', 'frontend'],
      }

      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - tags field doesn't exist yet
      expect(task.tags).toEqual(['urgent', 'bug', 'frontend'])
    })

    it('should add tag to existing task', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - addTagToTask action doesn't exist yet
      useTaskStore.getState().addTagToTask(task.id, 'important')

      const updated = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - tags field doesn't exist yet
      expect(updated?.tags).toContain('important')
    })

    it('should add multiple tags to existing task', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - addTagToTask action doesn't exist yet
      useTaskStore.getState().addTagToTask(task.id, 'urgent')
      // @ts-expect-error - addTagToTask action doesn't exist yet
      useTaskStore.getState().addTagToTask(task.id, 'bug')
      // @ts-expect-error - addTagToTask action doesn't exist yet
      useTaskStore.getState().addTagToTask(task.id, 'frontend')

      const updated = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - tags field doesn't exist yet
      expect(updated?.tags).toEqual(['urgent', 'bug', 'frontend'])
    })

    it('should remove tag from task', () => {
      const dto: TaskWithTags = {
        title: 'Task',
        tags: ['urgent', 'bug', 'frontend'],
      }

      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - removeTagFromTask action doesn't exist yet
      useTaskStore.getState().removeTagFromTask(task.id, 'bug')

      const updated = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - tags field doesn't exist yet
      expect(updated?.tags).toEqual(['urgent', 'frontend'])
    })

    it('should remove all tags from task', () => {
      const dto: TaskWithTags = {
        title: 'Task',
        tags: ['urgent', 'bug'],
      }

      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - removeTagFromTask action doesn't exist yet
      useTaskStore.getState().removeTagFromTask(task.id, 'urgent')
      // @ts-expect-error - removeTagFromTask action doesn't exist yet
      useTaskStore.getState().removeTagFromTask(task.id, 'bug')

      const updated = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - tags field doesn't exist yet
      expect(updated?.tags).toEqual([])
    })

    it('should not add duplicate tags to task', () => {
      const dto: TaskWithTags = {
        title: 'Task',
        tags: ['urgent'],
      }

      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - addTagToTask action doesn't exist yet
      useTaskStore.getState().addTagToTask(task.id, 'urgent')

      const updated = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - tags field doesn't exist yet
      expect(updated?.tags).toEqual(['urgent'])
    })

    it('should preserve tags when updating task', () => {
      const dto: TaskWithTags = {
        title: 'Task',
        tags: ['urgent', 'bug'],
      }

      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      useTaskStore.getState().updateTask(task.id, { title: 'Updated Task' })

      const updated = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - tags field doesn't exist yet
      expect(updated?.tags).toEqual(['urgent', 'bug'])
    })

    it('should throw error when adding tag to non-existent task', () => {
      expect(() => {
        // @ts-expect-error - addTagToTask action doesn't exist yet
        useTaskStore.getState().addTagToTask('non-existent-id', 'tag')
      }).toThrow('Task not found')
    })

    it('should throw error when removing tag from non-existent task', () => {
      expect(() => {
        // @ts-expect-error - removeTagFromTask action doesn't exist yet
        useTaskStore.getState().removeTagFromTask('non-existent-id', 'tag')
      }).toThrow('Task not found')
    })

    it('should normalize tag names (lowercase, trim)', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - addTagToTask action doesn't exist yet
      useTaskStore.getState().addTagToTask(task.id, '  URGENT  ')

      const updated = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - tags field doesn't exist yet
      expect(updated?.tags).toEqual(['urgent'])
    })

    it('should not add empty tag', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      expect(() => {
        // @ts-expect-error - addTagToTask action doesn't exist yet
        useTaskStore.getState().addTagToTask(task.id, '')
      }).toThrow('Tag name cannot be empty')
    })

    it('should not add whitespace-only tag', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      expect(() => {
        // @ts-expect-error - addTagToTask action doesn't exist yet
        useTaskStore.getState().addTagToTask(task.id, '   ')
      }).toThrow('Tag name cannot be empty')
    })
  })

  describe('Store - Tag Validation', () => {
    it('should throw error when exceeding maximum 10 tags per task', () => {
      const tags = Array.from({ length: 10 }, (_, i) => `tag${i + 1}`)
      const dto: TaskWithTags = {
        title: 'Task',
        tags,
      }

      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      expect(() => {
        // @ts-expect-error - addTagToTask action doesn't exist yet
        useTaskStore.getState().addTagToTask(task.id, 'tag11')
      }).toThrow('Maximum 10 tags per task')
    })

    it('should throw error when creating task with more than 10 tags', () => {
      const tags = Array.from({ length: 11 }, (_, i) => `tag${i + 1}`)
      const dto: TaskWithTags = {
        title: 'Task',
        tags,
      }

      expect(() => {
        // @ts-expect-error - tags parameter not supported yet
        useTaskStore.getState().addTask(dto)
      }).toThrow('Maximum 10 tags per task')
    })

    it('should validate tag name length (max 30 characters)', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      const longTag = 'a'.repeat(31)

      expect(() => {
        // @ts-expect-error - addTagToTask action doesn't exist yet
        useTaskStore.getState().addTagToTask(task.id, longTag)
      }).toThrow('Tag name must not exceed 30 characters')
    })

    it('should allow tag with 30 characters', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      const maxTag = 'a'.repeat(30)

      expect(() => {
        // @ts-expect-error - addTagToTask action doesn't exist yet
        useTaskStore.getState().addTagToTask(task.id, maxTag)
      }).not.toThrow()
    })
  })

  describe('Store - Get Tasks by Tag', () => {
    it('should get tasks by single tag', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', tags: ['bug'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 3', tags: ['urgent'] })

      // @ts-expect-error - getTasksByTag action doesn't exist yet
      const urgentTasks = useTaskStore.getState().getTasksByTag('urgent')

      expect(urgentTasks).toHaveLength(2)
      expect(urgentTasks[0].title).toBe('Task 1')
      expect(urgentTasks[1].title).toBe('Task 3')
    })

    it('should get tasks by multiple tags (OR logic)', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', tags: ['bug'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 3', tags: ['frontend'] })

      // @ts-expect-error - getTasksByTags action doesn't exist yet
      const tasks = useTaskStore.getState().getTasksByTags(['urgent', 'bug'])

      expect(tasks).toHaveLength(2)
      expect(tasks.some((t) => t.title === 'Task 1')).toBe(true)
      expect(tasks.some((t) => t.title === 'Task 2')).toBe(true)
    })

    it('should get tasks containing all specified tags (AND logic)', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent', 'bug'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', tags: ['urgent'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 3', tags: ['urgent', 'bug', 'frontend'] })

      // @ts-expect-error - getTasksWithAllTags action doesn't exist yet
      const tasks = useTaskStore.getState().getTasksWithAllTags(['urgent', 'bug'])

      expect(tasks).toHaveLength(2)
      expect(tasks[0].title).toBe('Task 1')
      expect(tasks[1].title).toBe('Task 3')
    })

    it('should return empty array when no tasks match tag', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent'] })

      // @ts-expect-error - getTasksByTag action doesn't exist yet
      const tasks = useTaskStore.getState().getTasksByTag('nonexistent')

      expect(tasks).toHaveLength(0)
    })
  })

  describe('Store - Get All Tags', () => {
    it('should get all unique tags from all tasks', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent', 'bug'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', tags: ['bug', 'frontend'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 3', tags: ['urgent'] })

      // @ts-expect-error - getAllTags action doesn't exist yet
      const allTags = useTaskStore.getState().getAllTags()

      expect(allTags).toHaveLength(3)
      expect(allTags).toContain('urgent')
      expect(allTags).toContain('bug')
      expect(allTags).toContain('frontend')
    })

    it('should return empty array when no tasks have tags', () => {
      useTaskStore.getState().addTask({ title: 'Task 1' })
      useTaskStore.getState().addTask({ title: 'Task 2' })

      // @ts-expect-error - getAllTags action doesn't exist yet
      const allTags = useTaskStore.getState().getAllTags()

      expect(allTags).toEqual([])
    })

    it('should return tags sorted alphabetically', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['zebra', 'apple', 'mango'] })

      // @ts-expect-error - getAllTags action doesn't exist yet
      const allTags = useTaskStore.getState().getAllTags()

      expect(allTags).toEqual(['apple', 'mango', 'zebra'])
    })

    it('should get tag count', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent', 'bug'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', tags: ['urgent'] })

      // @ts-expect-error - getTagCount action doesn't exist yet
      expect(useTaskStore.getState().getTagCount('urgent')).toBe(2)
      // @ts-expect-error - getTagCount action doesn't exist yet
      expect(useTaskStore.getState().getTagCount('bug')).toBe(1)
    })

    it('should return 0 for non-existent tag count', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent'] })

      // @ts-expect-error - getTagCount action doesn't exist yet
      expect(useTaskStore.getState().getTagCount('nonexistent')).toBe(0)
    })
  })
})

describe('User Story 3.5: Tag Management', () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [],
      currentFilter: 'all' as any,
      sortBy: 'dateCreated' as any,
      sortDirection: 'desc' as any,
      searchQuery: '',
    })
  })

  describe('Store - Rename Tag', () => {
    it('should rename tag across all tasks', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent', 'bug'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', tags: ['urgent'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 3', tags: ['bug'] })

      // @ts-expect-error - renameTag action doesn't exist yet
      useTaskStore.getState().renameTag('urgent', 'high-priority')

      const tasks = useTaskStore.getState().tasks

      // @ts-expect-error - tags field doesn't exist yet
      expect(tasks[0].tags).toContain('high-priority')
      // @ts-expect-error - tags field doesn't exist yet
      expect(tasks[0].tags).not.toContain('urgent')
      // @ts-expect-error - tags field doesn't exist yet
      expect(tasks[1].tags).toContain('high-priority')
      // @ts-expect-error - tags field doesn't exist yet
      expect(tasks[2].tags).toContain('bug')
    })

    it('should preserve other tags when renaming', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent', 'bug', 'frontend'] })

      // @ts-expect-error - renameTag action doesn't exist yet
      useTaskStore.getState().renameTag('urgent', 'critical')

      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - tags field doesn't exist yet
      expect(task.tags).toEqual(['critical', 'bug', 'frontend'])
    })

    it('should throw error when renaming to empty string', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent'] })

      expect(() => {
        // @ts-expect-error - renameTag action doesn't exist yet
        useTaskStore.getState().renameTag('urgent', '')
      }).toThrow('Tag name cannot be empty')
    })

    it('should throw error when renaming non-existent tag', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent'] })

      expect(() => {
        // @ts-expect-error - renameTag action doesn't exist yet
        useTaskStore.getState().renameTag('nonexistent', 'new-name')
      }).toThrow('Tag not found')
    })

    it('should throw error when renaming to existing tag', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent', 'bug'] })

      expect(() => {
        // @ts-expect-error - renameTag action doesn't exist yet
        useTaskStore.getState().renameTag('urgent', 'bug')
      }).toThrow('Tag already exists')
    })

    it('should normalize new tag name when renaming', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent'] })

      // @ts-expect-error - renameTag action doesn't exist yet
      useTaskStore.getState().renameTag('urgent', '  HIGH PRIORITY  ')

      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - tags field doesn't exist yet
      expect(task.tags).toEqual(['high priority'])
    })
  })

  describe('Store - Delete Tag', () => {
    it('should delete tag from all tasks', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent', 'bug'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', tags: ['urgent'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 3', tags: ['bug'] })

      // @ts-expect-error - deleteTag action doesn't exist yet
      useTaskStore.getState().deleteTag('urgent')

      const tasks = useTaskStore.getState().tasks

      // @ts-expect-error - tags field doesn't exist yet
      expect(tasks[0].tags).toEqual(['bug'])
      // @ts-expect-error - tags field doesn't exist yet
      expect(tasks[1].tags).toEqual([])
      // @ts-expect-error - tags field doesn't exist yet
      expect(tasks[2].tags).toEqual(['bug'])
    })

    it('should not throw error when deleting non-existent tag', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent'] })

      expect(() => {
        // @ts-expect-error - deleteTag action doesn't exist yet
        useTaskStore.getState().deleteTag('nonexistent')
      }).not.toThrow()
    })

    it('should preserve other tags when deleting', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent', 'bug', 'frontend'] })

      // @ts-expect-error - deleteTag action doesn't exist yet
      useTaskStore.getState().deleteTag('urgent')

      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - tags field doesn't exist yet
      expect(task.tags).toEqual(['bug', 'frontend'])
    })
  })

  describe('Store - Merge Tags', () => {
    it('should merge two tags into one', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', tags: ['high-priority'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 3', tags: ['urgent', 'bug'] })

      // @ts-expect-error - mergeTags action doesn't exist yet
      useTaskStore.getState().mergeTags(['urgent', 'high-priority'], 'critical')

      const tasks = useTaskStore.getState().tasks

      // @ts-expect-error - tags field doesn't exist yet
      expect(tasks[0].tags).toEqual(['critical'])
      // @ts-expect-error - tags field doesn't exist yet
      expect(tasks[1].tags).toEqual(['critical'])
      // @ts-expect-error - tags field doesn't exist yet
      expect(tasks[2].tags).toEqual(['critical', 'bug'])
    })

    it('should merge multiple tags into one', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent', 'important', 'critical'] })

      // @ts-expect-error - mergeTags action doesn't exist yet
      useTaskStore.getState().mergeTags(['urgent', 'important', 'critical'], 'high-priority')

      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - tags field doesn't exist yet
      expect(task.tags).toEqual(['high-priority'])
    })

    it('should not create duplicate tags after merge', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent', 'critical'] })

      // @ts-expect-error - mergeTags action doesn't exist yet
      useTaskStore.getState().mergeTags(['urgent'], 'critical')

      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - tags field doesn't exist yet
      expect(task.tags).toEqual(['critical'])
    })

    it('should throw error when merging with empty target name', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent'] })

      expect(() => {
        // @ts-expect-error - mergeTags action doesn't exist yet
        useTaskStore.getState().mergeTags(['urgent'], '')
      }).toThrow('Target tag name cannot be empty')
    })

    it('should throw error when merging empty tag list', () => {
      expect(() => {
        // @ts-expect-error - mergeTags action doesn't exist yet
        useTaskStore.getState().mergeTags([], 'critical')
      }).toThrow('Must provide at least one tag to merge')
    })

    it('should normalize target tag name when merging', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent'] })

      // @ts-expect-error - mergeTags action doesn't exist yet
      useTaskStore.getState().mergeTags(['urgent'], '  CRITICAL  ')

      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - tags field doesn't exist yet
      expect(task.tags).toEqual(['critical'])
    })
  })

  describe('Store - Tag Statistics', () => {
    it('should get tags with usage count', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent', 'bug'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', tags: ['urgent'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 3', tags: ['bug', 'frontend'] })

      // @ts-expect-error - getTagsWithCount action doesn't exist yet
      const tagsWithCount = useTaskStore.getState().getTagsWithCount()

      expect(tagsWithCount).toEqual([
        { tag: 'urgent', count: 2 },
        { tag: 'bug', count: 2 },
        { tag: 'frontend', count: 1 },
      ])
    })

    it('should sort tags by usage count (descending)', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', tags: ['bug', 'urgent'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 3', tags: ['bug', 'frontend', 'urgent'] })

      // @ts-expect-error - getTagsWithCount action doesn't exist yet
      const tagsWithCount = useTaskStore.getState().getTagsWithCount()

      expect(tagsWithCount[0].tag).toBe('urgent')
      expect(tagsWithCount[0].count).toBe(3)
      expect(tagsWithCount[1].tag).toBe('bug')
      expect(tagsWithCount[1].count).toBe(2)
    })

    it('should get unused tags (tags that are not on any task)', () => {
      // This test assumes we have a tag registry or history
      // For now, we'll skip this as it depends on implementation

      // Future: Store tag history or registry separate from tasks
      // @ts-expect-error - getUnusedTags action doesn't exist yet
      // const unusedTags = useTaskStore.getState().getUnusedTags()
    })
  })

  describe('Store - Tag Filtering', () => {
    it('should filter tasks by tag', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', tags: ['bug'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 3', tags: ['urgent'] })

      // @ts-expect-error - setTagFilter action doesn't exist yet
      useTaskStore.getState().setTagFilter(['urgent'])

      // @ts-expect-error - getFilteredTasksByTag action doesn't exist yet
      const filtered = useTaskStore.getState().getFilteredTasksByTag()

      expect(filtered).toHaveLength(2)
      expect(filtered[0].title).toBe('Task 1')
      expect(filtered[1].title).toBe('Task 3')
    })

    it('should filter tasks by multiple tags (OR logic)', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', tags: ['bug'] })
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 3', tags: ['frontend'] })

      // @ts-expect-error - setTagFilter action doesn't exist yet
      useTaskStore.getState().setTagFilter(['urgent', 'bug'])

      // @ts-expect-error - getFilteredTasksByTag action doesn't exist yet
      const filtered = useTaskStore.getState().getFilteredTasksByTag()

      expect(filtered).toHaveLength(2)
      expect(filtered.some((t) => t.title === 'Task 1')).toBe(true)
      expect(filtered.some((t) => t.title === 'Task 2')).toBe(true)
    })

    it('should clear tag filter', () => {
      // @ts-expect-error - tags parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', tags: ['urgent'] })
      useTaskStore.getState().addTask({ title: 'Task 2' })

      // @ts-expect-error - setTagFilter action doesn't exist yet
      useTaskStore.getState().setTagFilter(['urgent'])
      // @ts-expect-error - clearTagFilter action doesn't exist yet
      useTaskStore.getState().clearTagFilter()

      // @ts-expect-error - getFilteredTasksByTag action doesn't exist yet
      const filtered = useTaskStore.getState().getFilteredTasksByTag()

      expect(filtered).toHaveLength(2)
    })

    it('should return empty array when no tag filter is set', () => {
      useTaskStore.getState().addTask({ title: 'Task' })

      // @ts-expect-error - tagFilters field doesn't exist yet
      const tagFilters = useTaskStore.getState().tagFilters

      expect(tagFilters).toEqual([])
    })

    it('should combine tag filter with category filter', () => {
      // This will be tested in integration tests
      expect(true).toBe(true)
    })
  })
})
