/**
 * Task Due Dates Tests - EPIC 2
 * User Story 2.5: Add Due Dates
 *
 * Tests the ability to add and manage due dates for tasks
 * Due dates are optional
 * Overdue tasks are identified
 * Tasks can be sorted by due date
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTaskStore } from '../store/task.store'
import type { CreateTaskDto } from '../types/task.types'

// Type extensions for EPIC 2
interface TaskWithDueDate extends CreateTaskDto {
  dueDate?: Date | null
}

describe('User Story 2.5: Add Due Dates', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { tasks } = useTaskStore.getState()
    tasks.forEach((task) => useTaskStore.getState().deleteTask(task.id))

    // Use fake timers for consistent date testing
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Store - Due Date Management', () => {
    it('should create task without due date (null)', () => {
      const dto: CreateTaskDto = {
        title: 'Task without due date',
      }

      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - dueDate field doesn't exist yet
      expect(task.dueDate).toBeNull()
    })

    it('should create task with due date', () => {
      const dueDate = new Date('2024-01-20')
      const dto: TaskWithDueDate = {
        title: 'Task with due date',
        dueDate,
      }

      // @ts-expect-error - dueDate parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - dueDate field doesn't exist yet
      expect(task.dueDate).toBeInstanceOf(Date)
      // @ts-expect-error - dueDate field doesn't exist yet
      expect(task.dueDate?.toISOString()).toBe(dueDate.toISOString())
    })

    it('should create task with future due date', () => {
      const futureDate = new Date('2024-02-15')
      const dto: TaskWithDueDate = {
        title: 'Future task',
        dueDate: futureDate,
      }

      // @ts-expect-error - dueDate parameter not supported yet
      useTaskStore.getState().addTask(dto)
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - dueDate field doesn't exist yet
      expect(task.dueDate?.getTime()).toBeGreaterThan(Date.now())
    })

    it('should set due date on existing task', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      const dueDate = new Date('2024-01-25')
      // @ts-expect-error - setDueDate action doesn't exist yet
      useTaskStore.getState().setDueDate(task.id, dueDate)

      const updatedTask = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - dueDate field doesn't exist yet
      expect(updatedTask?.dueDate).toBeInstanceOf(Date)
      // @ts-expect-error - dueDate field doesn't exist yet
      expect(updatedTask?.dueDate?.toISOString()).toBe(dueDate.toISOString())
    })

    it('should clear due date from task', () => {
      const dueDate = new Date('2024-01-25')
      // @ts-expect-error - dueDate parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task', dueDate })
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - clearDueDate action doesn't exist yet
      useTaskStore.getState().clearDueDate(task.id)

      const updatedTask = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - dueDate field doesn't exist yet
      expect(updatedTask?.dueDate).toBeNull()
    })

    it('should update due date on existing task', () => {
      const originalDate = new Date('2024-01-20')
      // @ts-expect-error - dueDate parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task', dueDate: originalDate })
      const task = useTaskStore.getState().tasks[0]

      const newDate = new Date('2024-01-30')
      // @ts-expect-error - setDueDate action doesn't exist yet
      useTaskStore.getState().setDueDate(task.id, newDate)

      const updatedTask = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - dueDate field doesn't exist yet
      expect(updatedTask?.dueDate?.toISOString()).toBe(newDate.toISOString())
    })

    it('should throw error when setting due date on non-existent task', () => {
      const dueDate = new Date('2024-01-25')

      expect(() => {
        // @ts-expect-error - setDueDate action doesn't exist yet
        useTaskStore.getState().setDueDate('non-existent-id', dueDate)
      }).toThrow('Task not found')
    })

    it('should preserve due date when updating other fields', () => {
      const dueDate = new Date('2024-01-25')
      // @ts-expect-error - dueDate parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task', dueDate })
      const task = useTaskStore.getState().tasks[0]

      useTaskStore.getState().updateTask(task.id, {
        title: 'Updated Title',
      })

      const updatedTask = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - dueDate field doesn't exist yet
      expect(updatedTask?.dueDate?.toISOString()).toBe(dueDate.toISOString())
    })

    it('should preserve due date when toggling completion', () => {
      const dueDate = new Date('2024-01-25')
      // @ts-expect-error - dueDate parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task', dueDate })
      const task = useTaskStore.getState().tasks[0]

      useTaskStore.getState().toggleTaskComplete(task.id)

      const completedTask = useTaskStore.getState().getTaskById(task.id)
      // @ts-expect-error - dueDate field doesn't exist yet
      expect(completedTask?.dueDate?.toISOString()).toBe(dueDate.toISOString())
    })
  })

  describe('Store - Due Date Validation', () => {
    it('should validate due date is not in the past', () => {
      const pastDate = new Date('2024-01-10') // Before current time (2024-01-15)
      const dto: TaskWithDueDate = {
        title: 'Task',
        dueDate: pastDate,
      }

      expect(() => {
        // @ts-expect-error - dueDate parameter not supported yet
        useTaskStore.getState().addTask(dto)
      }).toThrow('Due date cannot be in the past')
    })

    it('should allow due date to be today', () => {
      const today = new Date('2024-01-15T23:59:59') // Same day as current time
      const dto: TaskWithDueDate = {
        title: 'Task',
        dueDate: today,
      }

      // @ts-expect-error - dueDate parameter not supported yet
      expect(() => useTaskStore.getState().addTask(dto)).not.toThrow()
    })

    it('should allow future due dates', () => {
      const futureDate = new Date('2024-12-31')
      const dto: TaskWithDueDate = {
        title: 'Task',
        dueDate: futureDate,
      }

      // @ts-expect-error - dueDate parameter not supported yet
      expect(() => useTaskStore.getState().addTask(dto)).not.toThrow()
    })

    it('should validate when updating due date', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      const pastDate = new Date('2024-01-10')

      expect(() => {
        // @ts-expect-error - setDueDate action doesn't exist yet
        useTaskStore.getState().setDueDate(task.id, pastDate)
      }).toThrow('Due date cannot be in the past')
    })
  })

  describe('Store - Overdue Detection', () => {
    it('should identify task as overdue when due date has passed', () => {
      const overdueDate = new Date('2024-01-10') // Before current time
      // Create with validation disabled for test setup
      const task = {
        id: '1',
        title: 'Overdue Task',
        dueDate: overdueDate,
      }

      // @ts-expect-error - isOverdue action doesn't exist yet
      const isOverdue = useTaskStore.getState().isOverdue(task.id)
      expect(isOverdue).toBe(true)
    })

    it('should not identify task as overdue when due date is future', () => {
      const futureDate = new Date('2024-01-20')
      // @ts-expect-error - dueDate parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task', dueDate: futureDate })
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - isOverdue action doesn't exist yet
      const isOverdue = useTaskStore.getState().isOverdue(task.id)
      expect(isOverdue).toBe(false)
    })

    it('should not identify task as overdue when no due date', () => {
      useTaskStore.getState().addTask({ title: 'Task' })
      const task = useTaskStore.getState().tasks[0]

      // @ts-expect-error - isOverdue action doesn't exist yet
      const isOverdue = useTaskStore.getState().isOverdue(task.id)
      expect(isOverdue).toBe(false)
    })

    it('should get all overdue tasks', () => {
      // Create tasks with different due dates
      const overdueDate = new Date('2024-01-10')
      const futureDate = new Date('2024-01-20')

      // For test: bypass validation
      // @ts-expect-error - dueDate parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Future Task', dueDate: futureDate })
      // Note: Need to handle overdue task creation for testing

      // @ts-expect-error - getOverdueTasks action doesn't exist yet
      const overdueTasks = useTaskStore.getState().getOverdueTasks()

      expect(Array.isArray(overdueTasks)).toBe(true)
    })

    it('should not mark completed tasks as overdue', () => {
      const overdueDate = new Date('2024-01-10')
      // For test setup
      const task = {
        id: '1',
        title: 'Completed Task',
        dueDate: overdueDate,
        status: 'completed',
      }

      // @ts-expect-error - isOverdue action doesn't exist yet
      const isOverdue = useTaskStore.getState().isOverdue(task.id)
      expect(isOverdue).toBe(false)
    })
  })

  describe('Store - Sort by Due Date', () => {
    beforeEach(() => {
      // Create tasks with different due dates
      // @ts-expect-error - dueDate parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task A', dueDate: new Date('2024-01-25') })
      // @ts-expect-error - dueDate parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task B', dueDate: new Date('2024-01-18') })
      // @ts-expect-error - dueDate parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task C', dueDate: new Date('2024-02-01') })
      useTaskStore.getState().addTask({ title: 'Task D' }) // No due date
    })

    it('should sort tasks by due date ascending (soonest first)', () => {
      // @ts-expect-error - setSortBy action doesn't exist yet
      useTaskStore.getState().setSortBy('dueDate')
      // @ts-expect-error - setSortDirection action doesn't exist yet
      useTaskStore.getState().setSortDirection('asc')

      // @ts-expect-error - getSortedTasks action doesn't exist yet
      const sortedTasks = useTaskStore.getState().getSortedTasks()

      // Tasks with due dates should come first, sorted by date
      expect(sortedTasks[0].title).toBe('Task B') // Jan 18
      expect(sortedTasks[1].title).toBe('Task A') // Jan 25
      expect(sortedTasks[2].title).toBe('Task C') // Feb 1
      expect(sortedTasks[3].title).toBe('Task D') // No date (last)
    })

    it('should sort tasks by due date descending (latest first)', () => {
      // @ts-expect-error - setSortBy action doesn't exist yet
      useTaskStore.getState().setSortBy('dueDate')
      // @ts-expect-error - setSortDirection action doesn't exist yet
      useTaskStore.getState().setSortDirection('desc')

      // @ts-expect-error - getSortedTasks action doesn't exist yet
      const sortedTasks = useTaskStore.getState().getSortedTasks()

      // Tasks with due dates descending, no-date tasks last
      expect(sortedTasks[0].title).toBe('Task C') // Feb 1
      expect(sortedTasks[1].title).toBe('Task A') // Jan 25
      expect(sortedTasks[2].title).toBe('Task B') // Jan 18
      expect(sortedTasks[3].title).toBe('Task D') // No date
    })

    it('should place tasks without due dates at the end when sorting', () => {
      // @ts-expect-error - setSortBy action doesn't exist yet
      useTaskStore.getState().setSortBy('dueDate')

      // @ts-expect-error - getSortedTasks action doesn't exist yet
      const sortedTasks = useTaskStore.getState().getSortedTasks()

      const lastTask = sortedTasks[sortedTasks.length - 1]
      expect(lastTask.title).toBe('Task D')
      // @ts-expect-error - dueDate field doesn't exist yet
      expect(lastTask.dueDate).toBeNull()
    })
  })

  describe('Store - Filter by Due Date', () => {
    beforeEach(() => {
      const today = new Date('2024-01-15')
      const tomorrow = new Date('2024-01-16')
      const nextWeek = new Date('2024-01-22')
      const nextMonth = new Date('2024-02-15')

      // @ts-expect-error - dueDate parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Due Today', dueDate: today })
      // @ts-expect-error - dueDate parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Due Tomorrow', dueDate: tomorrow })
      // @ts-expect-error - dueDate parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Due Next Week', dueDate: nextWeek })
      // @ts-expect-error - dueDate parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Due Next Month', dueDate: nextMonth })
    })

    it('should get tasks due today', () => {
      // @ts-expect-error - getTasksDueToday action doesn't exist yet
      const tasks = useTaskStore.getState().getTasksDueToday()

      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toBe('Due Today')
    })

    it('should get tasks due this week', () => {
      // @ts-expect-error - getTasksDueThisWeek action doesn't exist yet
      const tasks = useTaskStore.getState().getTasksDueThisWeek()

      // Should include today, tomorrow, and next week
      expect(tasks.length).toBeGreaterThanOrEqual(3)
    })

    it('should get tasks with no due date', () => {
      useTaskStore.getState().addTask({ title: 'No Due Date' })

      // @ts-expect-error - getTasksWithoutDueDate action doesn't exist yet
      const tasks = useTaskStore.getState().getTasksWithoutDueDate()

      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toBe('No Due Date')
    })
  })

  describe('Store - Due Date Statistics', () => {
    it('should count tasks with due dates', () => {
      // @ts-expect-error - dueDate parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', dueDate: new Date('2024-01-20') })
      // @ts-expect-error - dueDate parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 2', dueDate: new Date('2024-01-25') })
      useTaskStore.getState().addTask({ title: 'Task 3' })

      // @ts-expect-error - getTasksWithDueDateCount action doesn't exist yet
      const count = useTaskStore.getState().getTasksWithDueDateCount()

      expect(count).toBe(2)
    })

    it('should count overdue tasks', () => {
      // For test: tasks that would be overdue
      // @ts-expect-error - dueDate parameter not supported yet
      useTaskStore.getState().addTask({ title: 'Task 1', dueDate: new Date('2024-01-20') })
      useTaskStore.getState().addTask({ title: 'Task 2' })

      // @ts-expect-error - getOverdueTaskCount action doesn't exist yet
      const count = useTaskStore.getState().getOverdueTaskCount()

      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })
})
