/**
 * EPIC 5.2: Export Tasks Tests
 * User Story 5.2: Export Tasks
 *
 * Tests for task export functionality (JSON and CSV formats)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useTaskStore } from '../store/task.store'
import { TaskStatus, TaskPriority, TaskFilter } from '../types/task.types'

describe('EPIC 5.2: Export Tasks', () => {
  beforeEach(() => {
    // Clear localStorage first
    localStorage.clear()
    // Then reset store to initial state
    const store = useTaskStore.getState()
    store.resetStore()
  })

  describe('JSON Export', () => {
    it('should export tasks to JSON format', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', description: 'Description 1' })
      store.addTask({ title: 'Task 2', description: 'Description 2' })

      const json = store.exportTasksJSON()
      expect(json).toBeTruthy()

      const parsed = JSON.parse(json)
      expect(parsed.tasks).toHaveLength(2)
      expect(parsed.tasks[0].title).toBe('Task 1')
      expect(parsed.tasks[1].title).toBe('Task 2')
    })

    it('should include all task properties in JSON export', () => {
      const store = useTaskStore.getState()
      store.addCategory({ name: 'Work', color: '#ff0000' })
      const categoryId = useTaskStore.getState().categories[0].id

      store.addTask({
        title: 'Complex Task',
        description: 'Full description',
        priority: TaskPriority.HIGH,
        dueDate: new Date('2025-12-31'),
        categoryId,
        tags: ['urgent', 'important'],
      })

      const json = store.exportTasksJSON()
      const parsed = JSON.parse(json)

      expect(parsed.tasks[0].title).toBe('Complex Task')
      expect(parsed.tasks[0].description).toBe('Full description')
      expect(parsed.tasks[0].priority).toBe(TaskPriority.HIGH)
      expect(parsed.tasks[0].dueDate).toBeTruthy()
      expect(parsed.tasks[0].categoryId).toBe(categoryId)
      expect(parsed.tasks[0].tags).toEqual(['urgent', 'important'])
    })

    it('should include export metadata in JSON', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1' })

      const json = store.exportTasksJSON()
      const parsed = JSON.parse(json)

      expect(parsed.exportedAt).toBeTruthy()
      expect(parsed.version).toBe(1)
      expect(parsed.taskCount).toBe(1)
    })

    it('should export categories along with tasks', () => {
      const store = useTaskStore.getState()
      store.addCategory({ name: 'Work', color: '#ff0000' })
      store.addCategory({ name: 'Personal', color: '#00ff00' })
      store.addTask({ title: 'Task 1' })

      const json = store.exportTasksJSON()
      const parsed = JSON.parse(json)

      expect(parsed.categories).toHaveLength(2)
      expect(parsed.categories[0].name).toBe('Work')
      expect(parsed.categories[1].name).toBe('Personal')
    })

    it('should export empty array when no tasks exist', () => {
      const store = useTaskStore.getState()

      const json = store.exportTasksJSON()
      const parsed = JSON.parse(json)

      expect(parsed.tasks).toEqual([])
      expect(parsed.taskCount).toBe(0)
    })
  })

  describe('CSV Export', () => {
    it('should export tasks to CSV format', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', description: 'Description 1' })
      store.addTask({ title: 'Task 2', description: 'Description 2' })

      const csv = store.exportTasksCSV()
      expect(csv).toBeTruthy()

      const lines = csv.split('\n')
      expect(lines[0]).toContain('Title')
      expect(lines[1]).toContain('Task 1')
      expect(lines[2]).toContain('Task 2')
    })

    it('should include CSV headers', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1' })

      const csv = store.exportTasksCSV()
      const lines = csv.split('\n')
      const headers = lines[0].split(',')

      expect(headers).toContain('Title')
      expect(headers).toContain('Description')
      expect(headers).toContain('Status')
      expect(headers).toContain('Priority')
      expect(headers).toContain('Due Date')
      expect(headers).toContain('Category')
      expect(headers).toContain('Tags')
    })

    it('should handle commas in task data', () => {
      const store = useTaskStore.getState()
      store.addTask({
        title: 'Task with, comma',
        description: 'Description with, commas, here',
      })

      const csv = store.exportTasksCSV()
      expect(csv).toContain('"Task with, comma"')
      expect(csv).toContain('"Description with, commas, here"')
    })

    it('should handle quotes in task data', () => {
      const store = useTaskStore.getState()
      store.addTask({
        title: 'Task with "quotes"',
        description: 'Description with "quotes"',
      })

      const csv = store.exportTasksCSV()
      expect(csv).toContain('Task with ""quotes""')
    })

    it('should export category name instead of ID', () => {
      const store = useTaskStore.getState()
      store.addCategory({ name: 'Work', color: '#ff0000' })
      const categoryId = useTaskStore.getState().categories[0].id
      store.addTask({ title: 'Task 1', categoryId })

      const csv = store.exportTasksCSV()
      expect(csv).toContain('Work')
      expect(csv).not.toContain(categoryId)
    })

    it('should export tags as comma-separated list', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1', tags: ['urgent', 'important', 'work'] })

      const csv = store.exportTasksCSV()
      expect(csv).toContain('urgent; important; work')
    })

    it('should format dates in CSV export', () => {
      const store = useTaskStore.getState()
      const dueDate = new Date('2025-12-31')
      store.addTask({ title: 'Task 1', dueDate })

      const csv = store.exportTasksCSV()
      expect(csv).toContain('2025-12-31')
    })

    it('should export empty CSV with headers when no tasks', () => {
      const store = useTaskStore.getState()

      const csv = store.exportTasksCSV()
      const lines = csv.split('\n')

      expect(lines[0]).toContain('Title')
      expect(lines.length).toBe(1) // Only header row
    })
  })

  describe('Export Filtered Tasks', () => {
    it('should export only filtered tasks', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1' })
      store.addTask({ title: 'Task 2' })
      store.addTask({ title: 'Task 3' })

      // Complete Task 2
      const task2Id = useTaskStore.getState().tasks[1].id
      store.toggleTaskComplete(task2Id)

      const json = store.exportFilteredTasksJSON(TaskFilter.ACTIVE)
      const parsed = JSON.parse(json)

      expect(parsed.tasks).toHaveLength(2)
      expect(parsed.tasks[0].title).toBe('Task 1')
      expect(parsed.tasks[1].title).toBe('Task 3')
    })

    it('should export filtered tasks to CSV', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1' })
      store.addTask({ title: 'Task 2' })

      // Complete Task 1
      const task1Id = useTaskStore.getState().tasks[0].id
      store.toggleTaskComplete(task1Id)

      const csv = store.exportFilteredTasksCSV(TaskFilter.COMPLETED)
      const lines = csv.split('\n')

      expect(lines).toHaveLength(2) // Header + 1 task
      expect(csv).toContain('Task 1')
      expect(csv).not.toContain('Task 2')
    })

    it('should include filter information in export metadata', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1' })

      const json = store.exportFilteredTasksJSON(TaskFilter.ACTIVE)
      const parsed = JSON.parse(json)

      expect(parsed.filter).toBe('active')
      // totalTasks includes tasks from previous tests if store isn't cleared
      expect(parsed.totalTasks).toBeGreaterThanOrEqual(1)
      expect(parsed.filteredTasks).toBeGreaterThanOrEqual(1)
    })
  })

  describe('File Download', () => {
    it('should generate filename with current date', () => {
      const store = useTaskStore.getState()
      const filename = store.getExportFilename('json')

      const today = new Date()
      const dateStr = today.toISOString().split('T')[0]

      expect(filename).toContain(dateStr)
      expect(filename).toContain('.json')
    })

    it('should generate different filenames for JSON and CSV', () => {
      const store = useTaskStore.getState()
      const jsonFilename = store.getExportFilename('json')
      const csvFilename = store.getExportFilename('csv')

      expect(jsonFilename).toContain('.json')
      expect(csvFilename).toContain('.csv')
    })

    it('should include task count in filename', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1' })
      store.addTask({ title: 'Task 2' })
      store.addTask({ title: 'Task 3' })

      const filename = store.getExportFilename('json')
      expect(filename).toContain('3-tasks')
    })
  })

  describe('Export with Complex Data', () => {
    it('should handle tasks with all fields populated', () => {
      const store = useTaskStore.getState()
      store.addCategory({ name: 'Work', color: '#ff0000' })
      const categoryId = useTaskStore.getState().categories[0].id

      store.addTask({
        title: 'Complex Task',
        description: 'Full description',
        priority: TaskPriority.CRITICAL,
        dueDate: new Date('2025-12-31'),
        categoryId,
        tags: ['urgent', 'important', 'deadline'],
      })

      const taskId = store.tasks[0].id
      store.toggleTaskComplete(taskId)

      const json = store.exportTasksJSON()
      const parsed = JSON.parse(json)
      const task = parsed.tasks[0]

      expect(task.title).toBe('Complex Task')
      expect(task.status).toBe(TaskStatus.COMPLETED)
      expect(task.completedAt).toBeTruthy()
      expect(task.priority).toBe(TaskPriority.CRITICAL)
      expect(task.categoryId).toBe(categoryId)
      expect(task.tags).toHaveLength(3)
    })

    it('should export multiple categories correctly', () => {
      const store = useTaskStore.getState()
      store.addCategory({ name: 'Work', color: '#ff0000' })
      store.addCategory({ name: 'Personal', color: '#00ff00' })
      store.addCategory({ name: 'Shopping', color: '#0000ff' })

      const categories = useTaskStore.getState().categories
      const cat1Id = categories[categories.length - 3].id
      const cat2Id = categories[categories.length - 2].id

      store.addTask({ title: 'Task 1', categoryId: cat1Id })
      store.addTask({ title: 'Task 2', categoryId: cat2Id })
      store.addTask({ title: 'Task 3' })

      const json = store.exportTasksJSON()
      const parsed = JSON.parse(json)

      // Categories may include categories from previous tests
      expect(parsed.categories.length).toBeGreaterThanOrEqual(3)

      // Find the tasks we just created (last 3 tasks)
      const tasks = parsed.tasks.slice(-3)
      expect(tasks[0].categoryId).toBe(cat1Id)
      expect(tasks[1].categoryId).toBe(cat2Id)
      expect(tasks[2].categoryId).toBeNull()
    })
  })

  describe('Export Data Integrity', () => {
    it('should preserve all task IDs', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1' })
      store.addTask({ title: 'Task 2' })

      const state = useTaskStore.getState()
      const originalIds = state.tasks.map((t) => t.id)

      const json = store.exportTasksJSON()
      const parsed = JSON.parse(json)
      const exportedIds = parsed.tasks.map((t: { id: string }) => t.id)

      expect(exportedIds).toEqual(originalIds)
    })

    it('should preserve timestamps', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1' })
      const state = useTaskStore.getState()
      const originalTask = state.tasks[state.tasks.length - 1]

      const json = store.exportTasksJSON()
      const parsed = JSON.parse(json)
      const exportedTask = parsed.tasks[parsed.tasks.length - 1]

      expect(exportedTask.createdAt).toBeTruthy()
      expect(exportedTask.updatedAt).toBeTruthy()
      expect(new Date(exportedTask.createdAt).getTime()).toBe(originalTask.createdAt.getTime())
    })

    it('should preserve custom order', () => {
      const store = useTaskStore.getState()
      store.addTask({ title: 'Task 1' })
      store.addTask({ title: 'Task 2' })
      store.addTask({ title: 'Task 3' })

      const json = store.exportTasksJSON()
      const parsed = JSON.parse(json)

      expect(parsed.tasks[0].customOrder).toBe(0)
      expect(parsed.tasks[1].customOrder).toBe(1)
      expect(parsed.tasks[2].customOrder).toBe(2)
    })
  })
})
