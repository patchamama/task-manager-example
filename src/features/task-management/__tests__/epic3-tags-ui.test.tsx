import React from 'react'
/**
 * Tag UI Tests - EPIC 3
 * User Stories 3.4, 3.5: Add Tags to Tasks, Tag Management
 *
 * Tests UI components for tag management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTaskStore } from '../store/task.store'

/**
 * Mock components that will be created for EPIC 3
 */

// Mock TagInput component with autocomplete
const TagInput = ({ taskId, existingTags = [] }: any) => {
  const [inputValue, setInputValue] = React.useState('')
  const [suggestions, setSuggestions] = React.useState<string[]>([])
  // @ts-expect-error - getAllTags action doesn't exist yet
  const allTags = useTaskStore((state) => state.getAllTags?.() || [])
  // @ts-expect-error - addTagToTask action doesn't exist yet
  const addTagToTask = useTaskStore((state) => state.addTagToTask)

  const handleInputChange = (value: string) => {
    setInputValue(value)
    if (value.trim()) {
      const filtered = allTags.filter(
        (tag: string) =>
          tag.toLowerCase().includes(value.toLowerCase()) && !existingTags.includes(tag)
      )
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !existingTags.includes(tag.toLowerCase().trim())) {
      addTagToTask(taskId, tag)
      setInputValue('')
      setSuggestions([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      handleAddTag(inputValue)
    }
  }

  return (
    <div data-testid="tag-input-container">
      <label htmlFor="tag-input">Add tags</label>
      <input
        id="tag-input"
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add tag..."
        data-testid="tag-input"
        aria-label="Tag input"
        aria-autocomplete="list"
      />
      {suggestions.length > 0 && (
        <ul data-testid="tag-suggestions" role="listbox">
          {suggestions.map((tag) => (
            <li
              key={tag}
              onClick={() => handleAddTag(tag)}
              data-testid={`tag-suggestion-${tag}`}
              role="option"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Mock TagChip component (removable tag)
const TagChip = ({ tag, onRemove, taskId }: any) => {
  return (
    <span data-testid={`tag-chip-${tag}`} className="tag-chip">
      <span data-testid={`tag-chip-text-${tag}`}>{tag}</span>
      <button
        onClick={() => onRemove(taskId, tag)}
        data-testid={`remove-tag-${tag}`}
        aria-label={`Remove tag ${tag}`}
      >
        ×
      </button>
    </span>
  )
}

// Mock TagList component (displays tags on a task)
const TagList = ({ taskId, tags }: any) => {
  // @ts-expect-error - removeTagFromTask action doesn't exist yet
  const removeTagFromTask = useTaskStore((state) => state.removeTagFromTask)

  return (
    <div data-testid={`tag-list-${taskId}`}>
      {tags.length === 0 && <span data-testid="no-tags">No tags</span>}
      {tags.map((tag: string) => (
        <TagChip key={tag} tag={tag} taskId={taskId} onRemove={removeTagFromTask} />
      ))}
      <TagInput taskId={taskId} existingTags={tags} />
    </div>
  )
}

// Mock TagManagementModal component
const TagManagementModal = ({ isOpen, onClose }: any) => {
  // @ts-expect-error - getTagsWithCount action doesn't exist yet
  const tagsWithCount = useTaskStore((state) => state.getTagsWithCount?.() || [])
  // @ts-expect-error - renameTag action doesn't exist yet
  const renameTag = useTaskStore((state) => state.renameTag)
  // @ts-expect-error - deleteTag action doesn't exist yet
  const deleteTag = useTaskStore((state) => state.deleteTag)
  // @ts-expect-error - mergeTags action doesn't exist yet
  const mergeTags = useTaskStore((state) => state.mergeTags)

  const [editingTag, setEditingTag] = React.useState<string | null>(null)
  const [newName, setNewName] = React.useState('')
  const [selectedForMerge, setSelectedForMerge] = React.useState<string[]>([])
  const [mergeTarget, setMergeTarget] = React.useState('')

  const handleRename = (oldName: string) => {
    if (newName.trim()) {
      renameTag(oldName, newName)
      setEditingTag(null)
      setNewName('')
    }
  }

  const handleDelete = (tag: string) => {
    if (window.confirm(`Delete tag "${tag}"? This will remove it from all tasks.`)) {
      deleteTag(tag)
    }
  }

  const handleMerge = () => {
    if (selectedForMerge.length > 0 && mergeTarget.trim()) {
      mergeTags(selectedForMerge, mergeTarget)
      setSelectedForMerge([])
      setMergeTarget('')
    }
  }

  if (!isOpen) return null

  return (
    <div data-testid="tag-management-modal" role="dialog" aria-label="Tag Management">
      <h2>Manage Tags</h2>
      <button onClick={onClose} data-testid="close-modal" aria-label="Close modal">
        Close
      </button>

      <div data-testid="tag-list-section">
        <h3>All Tags</h3>
        {tagsWithCount.length === 0 && <p data-testid="no-tags-message">No tags yet</p>}
        {tagsWithCount.map(({ tag, count }: any) => (
          <div key={tag} data-testid={`tag-management-item-${tag}`}>
            {editingTag === tag ? (
              <>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  data-testid={`rename-input-${tag}`}
                  aria-label={`Rename ${tag}`}
                />
                <button
                  onClick={() => handleRename(tag)}
                  data-testid={`save-rename-${tag}`}
                  aria-label="Save"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingTag(null)}
                  data-testid={`cancel-rename-${tag}`}
                  aria-label="Cancel"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span data-testid={`tag-name-${tag}`}>
                  {tag} ({count})
                </span>
                <button
                  onClick={() => {
                    setEditingTag(tag)
                    setNewName(tag)
                  }}
                  data-testid={`edit-tag-${tag}`}
                  aria-label={`Rename ${tag}`}
                >
                  Rename
                </button>
                <button
                  onClick={() => handleDelete(tag)}
                  data-testid={`delete-tag-${tag}`}
                  aria-label={`Delete ${tag}`}
                >
                  Delete
                </button>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedForMerge.includes(tag)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedForMerge([...selectedForMerge, tag])
                      } else {
                        setSelectedForMerge(selectedForMerge.filter((t) => t !== tag))
                      }
                    }}
                    data-testid={`merge-checkbox-${tag}`}
                    aria-label={`Select ${tag} for merge`}
                  />
                  Merge
                </label>
              </>
            )}
          </div>
        ))}
      </div>

      {selectedForMerge.length > 0 && (
        <div data-testid="merge-section">
          <h3>Merge Tags</h3>
          <p data-testid="merge-selected-count">
            Selected {selectedForMerge.length} tag{selectedForMerge.length > 1 ? 's' : ''}
          </p>
          <input
            type="text"
            value={mergeTarget}
            onChange={(e) => setMergeTarget(e.target.value)}
            placeholder="Target tag name"
            data-testid="merge-target-input"
            aria-label="Merge target name"
          />
          <button onClick={handleMerge} data-testid="merge-button" aria-label="Merge tags">
            Merge
          </button>
        </div>
      )}
    </div>
  )
}

// Mock TaskItem with tags
const TaskItemWithTags = ({ task }: any) => {
  return (
    <div data-testid={`task-item-${task.id}`}>
      <h3>{task.title}</h3>
      <TagList taskId={task.id} tags={task.tags || []} />
    </div>
  )
}

describe('User Story 3.4: Add Tags to Tasks - UI', () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [],
      currentFilter: 'all' as any,
      sortBy: 'dateCreated' as any,
      sortDirection: 'desc' as any,
      searchQuery: '',
    })
  })

  describe('TagInput Component', () => {
    it('should render tag input field', () => {
      render(<TagInput taskId="task-1" existingTags={[]} />)

      expect(screen.getByTestId('tag-input-container')).toBeInTheDocument()
      expect(screen.getByTestId('tag-input')).toBeInTheDocument()
      expect(screen.getByLabelText('Add tags')).toBeInTheDocument()
    })

    it('should show placeholder text', () => {
      render(<TagInput taskId="task-1" existingTags={[]} />)

      expect(screen.getByPlaceholderText('Add tag...')).toBeInTheDocument()
    })

    it('should add tag on Enter key', async () => {
      const user = userEvent.setup()
      const mockAddTagToTask = vi.fn()

      useTaskStore.setState({
        // @ts-expect-error - addTagToTask action doesn't exist yet
        addTagToTask: mockAddTagToTask,
        // @ts-expect-error - getAllTags action doesn't exist yet
        getAllTags: () => [],
      })

      render(<TagInput taskId="task-1" existingTags={[]} />)

      const input = screen.getByTestId('tag-input')
      await user.type(input, 'urgent{Enter}')

      expect(mockAddTagToTask).toHaveBeenCalledWith('task-1', 'urgent')
    })

    it('should clear input after adding tag', async () => {
      const user = userEvent.setup()

      useTaskStore.setState({
        // @ts-expect-error - addTagToTask action doesn't exist yet
        addTagToTask: vi.fn(),
        // @ts-expect-error - getAllTags action doesn't exist yet
        getAllTags: () => [],
      })

      render(<TagInput taskId="task-1" existingTags={[]} />)

      const input = screen.getByTestId('tag-input')
      await user.type(input, 'urgent{Enter}')

      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })

    it('should show autocomplete suggestions', async () => {
      const user = userEvent.setup()

      useTaskStore.setState({
        // @ts-expect-error - getAllTags action doesn't exist yet
        getAllTags: () => ['urgent', 'important', 'bug'],
      })

      render(<TagInput taskId="task-1" existingTags={[]} />)

      const input = screen.getByTestId('tag-input')
      await user.type(input, 'ur')

      await waitFor(() => {
        expect(screen.getByTestId('tag-suggestions')).toBeInTheDocument()
        expect(screen.getByTestId('tag-suggestion-urgent')).toBeInTheDocument()
      })
    })

    it('should filter suggestions based on input', async () => {
      const user = userEvent.setup()

      useTaskStore.setState({
        // @ts-expect-error - getAllTags action doesn't exist yet
        getAllTags: () => ['urgent', 'important', 'bug', 'frontend'],
      })

      render(<TagInput taskId="task-1" existingTags={[]} />)

      const input = screen.getByTestId('tag-input')
      await user.type(input, 'urg')

      await waitFor(() => {
        expect(screen.getByTestId('tag-suggestion-urgent')).toBeInTheDocument()
        expect(screen.queryByTestId('tag-suggestion-bug')).not.toBeInTheDocument()
      })
    })

    it('should add tag when clicking suggestion', async () => {
      const user = userEvent.setup()
      const mockAddTagToTask = vi.fn()

      useTaskStore.setState({
        // @ts-expect-error - addTagToTask action doesn't exist yet
        addTagToTask: mockAddTagToTask,
        // @ts-expect-error - getAllTags action doesn't exist yet
        getAllTags: () => ['urgent'],
      })

      render(<TagInput taskId="task-1" existingTags={[]} />)

      const input = screen.getByTestId('tag-input')
      await user.type(input, 'ur')

      await waitFor(() => {
        expect(screen.getByTestId('tag-suggestion-urgent')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('tag-suggestion-urgent'))

      expect(mockAddTagToTask).toHaveBeenCalledWith('task-1', 'urgent')
    })

    it('should not show existing tags in suggestions', async () => {
      const user = userEvent.setup()

      useTaskStore.setState({
        // @ts-expect-error - getAllTags action doesn't exist yet
        getAllTags: () => ['urgent', 'important'],
      })

      render(<TagInput taskId="task-1" existingTags={['urgent']} />)

      const input = screen.getByTestId('tag-input')
      await user.type(input, 'u')

      await waitFor(() => {
        expect(screen.queryByTestId('tag-suggestion-urgent')).not.toBeInTheDocument()
      })
    })

    it('should not add empty tag', async () => {
      const user = userEvent.setup()
      const mockAddTagToTask = vi.fn()

      useTaskStore.setState({
        // @ts-expect-error - addTagToTask action doesn't exist yet
        addTagToTask: mockAddTagToTask,
      })

      render(<TagInput taskId="task-1" existingTags={[]} />)

      const input = screen.getByTestId('tag-input')
      await user.type(input, '{Enter}')

      expect(mockAddTagToTask).not.toHaveBeenCalled()
    })

    it('should have accessible autocomplete attributes', () => {
      render(<TagInput taskId="task-1" existingTags={[]} />)

      const input = screen.getByTestId('tag-input')
      expect(input).toHaveAttribute('aria-autocomplete', 'list')
    })
  })

  describe('TagChip Component', () => {
    it('should render tag chip', () => {
      render(<TagChip tag="urgent" taskId="task-1" onRemove={vi.fn()} />)

      expect(screen.getByTestId('tag-chip-urgent')).toBeInTheDocument()
      expect(screen.getByTestId('tag-chip-text-urgent')).toHaveTextContent('urgent')
    })

    it('should render remove button', () => {
      render(<TagChip tag="urgent" taskId="task-1" onRemove={vi.fn()} />)

      expect(screen.getByTestId('remove-tag-urgent')).toBeInTheDocument()
    })

    it('should call onRemove when remove button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnRemove = vi.fn()

      render(<TagChip tag="urgent" taskId="task-1" onRemove={mockOnRemove} />)

      const removeButton = screen.getByTestId('remove-tag-urgent')
      await user.click(removeButton)

      expect(mockOnRemove).toHaveBeenCalledWith('task-1', 'urgent')
    })

    it('should have accessible aria label for remove button', () => {
      render(<TagChip tag="urgent" taskId="task-1" onRemove={vi.fn()} />)

      expect(screen.getByLabelText('Remove tag urgent')).toBeInTheDocument()
    })
  })

  describe('TagList Component', () => {
    it('should show "No tags" when task has no tags', () => {
      useTaskStore.setState({
        // @ts-expect-error - removeTagFromTask action doesn't exist yet
        removeTagFromTask: vi.fn(),
      })

      render(<TagList taskId="task-1" tags={[]} />)

      expect(screen.getByTestId('no-tags')).toHaveTextContent('No tags')
    })

    it('should render multiple tag chips', () => {
      useTaskStore.setState({
        // @ts-expect-error - removeTagFromTask action doesn't exist yet
        removeTagFromTask: vi.fn(),
      })

      render(<TagList taskId="task-1" tags={['urgent', 'bug', 'frontend']} />)

      expect(screen.getByTestId('tag-chip-urgent')).toBeInTheDocument()
      expect(screen.getByTestId('tag-chip-bug')).toBeInTheDocument()
      expect(screen.getByTestId('tag-chip-frontend')).toBeInTheDocument()
    })

    it('should include tag input', () => {
      useTaskStore.setState({
        // @ts-expect-error - removeTagFromTask action doesn't exist yet
        removeTagFromTask: vi.fn(),
      })

      render(<TagList taskId="task-1" tags={[]} />)

      expect(screen.getByTestId('tag-input')).toBeInTheDocument()
    })
  })

  describe('TaskItem with Tags', () => {
    it('should display task with tag list', () => {
      useTaskStore.setState({
        // @ts-expect-error - removeTagFromTask action doesn't exist yet
        removeTagFromTask: vi.fn(),
      })

      const task = {
        id: 'task-1',
        title: 'Task with tags',
        tags: ['urgent', 'bug'],
      }

      render(<TaskItemWithTags task={task} />)

      expect(screen.getByTestId('task-item-task-1')).toBeInTheDocument()
      expect(screen.getByTestId('tag-list-task-1')).toBeInTheDocument()
      expect(screen.getByTestId('tag-chip-urgent')).toBeInTheDocument()
      expect(screen.getByTestId('tag-chip-bug')).toBeInTheDocument()
    })
  })
})

describe('User Story 3.5: Tag Management - UI', () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [],
      currentFilter: 'all' as any,
      sortBy: 'dateCreated' as any,
      sortDirection: 'desc' as any,
      searchQuery: '',
    })
  })

  describe('TagManagementModal Component', () => {
    it('should not render when closed', () => {
      render(<TagManagementModal isOpen={false} onClose={vi.fn()} />)

      expect(screen.queryByTestId('tag-management-modal')).not.toBeInTheDocument()
    })

    it('should render when open', () => {
      useTaskStore.setState({
        // @ts-expect-error - getTagsWithCount action doesn't exist yet
        getTagsWithCount: () => [],
      })

      render(<TagManagementModal isOpen={true} onClose={vi.fn()} />)

      expect(screen.getByTestId('tag-management-modal')).toBeInTheDocument()
      expect(screen.getByText('Manage Tags')).toBeInTheDocument()
    })

    it('should show empty state when no tags', () => {
      useTaskStore.setState({
        // @ts-expect-error - getTagsWithCount action doesn't exist yet
        getTagsWithCount: () => [],
      })

      render(<TagManagementModal isOpen={true} onClose={vi.fn()} />)

      expect(screen.getByTestId('no-tags-message')).toHaveTextContent('No tags yet')
    })

    it('should display all tags with usage count', () => {
      useTaskStore.setState({
        // @ts-expect-error - getTagsWithCount action doesn't exist yet
        getTagsWithCount: () => [
          { tag: 'urgent', count: 3 },
          { tag: 'bug', count: 2 },
        ],
      })

      render(<TagManagementModal isOpen={true} onClose={vi.fn()} />)

      expect(screen.getByTestId('tag-management-item-urgent')).toBeInTheDocument()
      expect(screen.getByTestId('tag-management-item-bug')).toBeInTheDocument()
      expect(screen.getByTestId('tag-name-urgent')).toHaveTextContent('urgent (3)')
      expect(screen.getByTestId('tag-name-bug')).toHaveTextContent('bug (2)')
    })

    it('should show rename, delete, and merge options for each tag', () => {
      useTaskStore.setState({
        // @ts-expect-error - getTagsWithCount action doesn't exist yet
        getTagsWithCount: () => [{ tag: 'urgent', count: 3 }],
      })

      render(<TagManagementModal isOpen={true} onClose={vi.fn()} />)

      expect(screen.getByTestId('edit-tag-urgent')).toBeInTheDocument()
      expect(screen.getByTestId('delete-tag-urgent')).toBeInTheDocument()
      expect(screen.getByTestId('merge-checkbox-urgent')).toBeInTheDocument()
    })

    it('should show rename input when edit is clicked', async () => {
      const user = userEvent.setup()

      useTaskStore.setState({
        // @ts-expect-error - getTagsWithCount action doesn't exist yet
        getTagsWithCount: () => [{ tag: 'urgent', count: 3 }],
      })

      render(<TagManagementModal isOpen={true} onClose={vi.fn()} />)

      const editButton = screen.getByTestId('edit-tag-urgent')
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByTestId('rename-input-urgent')).toBeInTheDocument()
        expect(screen.getByTestId('save-rename-urgent')).toBeInTheDocument()
        expect(screen.getByTestId('cancel-rename-urgent')).toBeInTheDocument()
      })
    })

    it('should call renameTag when save is clicked', async () => {
      const user = userEvent.setup()
      const mockRenameTag = vi.fn()

      useTaskStore.setState({
        // @ts-expect-error - getTagsWithCount action doesn't exist yet
        getTagsWithCount: () => [{ tag: 'urgent', count: 3 }],
        // @ts-expect-error - renameTag action doesn't exist yet
        renameTag: mockRenameTag,
      })

      render(<TagManagementModal isOpen={true} onClose={vi.fn()} />)

      await user.click(screen.getByTestId('edit-tag-urgent'))

      await waitFor(() => {
        expect(screen.getByTestId('rename-input-urgent')).toBeInTheDocument()
      })

      const input = screen.getByTestId('rename-input-urgent')
      await user.clear(input)
      await user.type(input, 'high-priority')

      await user.click(screen.getByTestId('save-rename-urgent'))

      expect(mockRenameTag).toHaveBeenCalledWith('urgent', 'high-priority')
    })

    it('should cancel rename when cancel is clicked', async () => {
      const user = userEvent.setup()

      useTaskStore.setState({
        // @ts-expect-error - getTagsWithCount action doesn't exist yet
        getTagsWithCount: () => [{ tag: 'urgent', count: 3 }],
      })

      render(<TagManagementModal isOpen={true} onClose={vi.fn()} />)

      await user.click(screen.getByTestId('edit-tag-urgent'))

      await waitFor(() => {
        expect(screen.getByTestId('cancel-rename-urgent')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('cancel-rename-urgent'))

      await waitFor(() => {
        expect(screen.queryByTestId('rename-input-urgent')).not.toBeInTheDocument()
      })
    })

    it('should show merge section when tags are selected', async () => {
      const user = userEvent.setup()

      useTaskStore.setState({
        // @ts-expect-error - getTagsWithCount action doesn't exist yet
        getTagsWithCount: () => [
          { tag: 'urgent', count: 3 },
          { tag: 'important', count: 2 },
        ],
      })

      render(<TagManagementModal isOpen={true} onClose={vi.fn()} />)

      await user.click(screen.getByTestId('merge-checkbox-urgent'))

      await waitFor(() => {
        expect(screen.getByTestId('merge-section')).toBeInTheDocument()
        expect(screen.getByTestId('merge-selected-count')).toHaveTextContent('Selected 1 tag')
      })
    })

    it('should call mergeTags when merge button is clicked', async () => {
      const user = userEvent.setup()
      const mockMergeTags = vi.fn()

      useTaskStore.setState({
        // @ts-expect-error - getTagsWithCount action doesn't exist yet
        getTagsWithCount: () => [
          { tag: 'urgent', count: 3 },
          { tag: 'important', count: 2 },
        ],
        // @ts-expect-error - mergeTags action doesn't exist yet
        mergeTags: mockMergeTags,
      })

      render(<TagManagementModal isOpen={true} onClose={vi.fn()} />)

      await user.click(screen.getByTestId('merge-checkbox-urgent'))
      await user.click(screen.getByTestId('merge-checkbox-important'))

      await waitFor(() => {
        expect(screen.getByTestId('merge-section')).toBeInTheDocument()
      })

      const targetInput = screen.getByTestId('merge-target-input')
      await user.type(targetInput, 'critical')

      await user.click(screen.getByTestId('merge-button'))

      expect(mockMergeTags).toHaveBeenCalledWith(['urgent', 'important'], 'critical')
    })

    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnClose = vi.fn()

      useTaskStore.setState({
        // @ts-expect-error - getTagsWithCount action doesn't exist yet
        getTagsWithCount: () => [],
      })

      render(<TagManagementModal isOpen={true} onClose={mockOnClose} />)

      await user.click(screen.getByTestId('close-modal'))

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should have accessible attributes', () => {
      useTaskStore.setState({
        // @ts-expect-error - getTagsWithCount action doesn't exist yet
        getTagsWithCount: () => [{ tag: 'urgent', count: 3 }],
      })

      render(<TagManagementModal isOpen={true} onClose={vi.fn()} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByLabelText('Tag Management')).toBeInTheDocument()
      expect(screen.getByLabelText('Rename urgent')).toBeInTheDocument()
      expect(screen.getByLabelText('Delete urgent')).toBeInTheDocument()
    })
  })
})
