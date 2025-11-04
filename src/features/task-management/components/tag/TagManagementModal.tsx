import React, { useState } from 'react'
import { useTaskStore } from '../../store/task.store'

export interface TagManagementModalProps {
  isOpen: boolean
  onClose: () => void
}

export const TagManagementModal: React.FC<TagManagementModalProps> = ({ isOpen, onClose }) => {
  const tagsWithCount = useTaskStore((state) => state.getTagsWithCount())
  const renameTag = useTaskStore((state) => state.renameTag)
  const removeTag = useTaskStore((state) => state.removeTag)
  const mergeTag = useTaskStore((state) => state.mergeTag)

  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [selectedForMerge, setSelectedForMerge] = useState<string[]>([])
  const [mergeTarget, setMergeTarget] = useState('')

  const handleRename = (oldName: string) => {
    if (newName.trim()) {
      renameTag(oldName, newName)
      setEditingTag(null)
      setNewName('')
    }
  }

  const handleDelete = (tag: string) => {
    if (window.confirm(`Delete tag "${tag}"? This will remove it from all tasks.`)) {
      removeTag(tag)
    }
  }

  const handleMerge = () => {
    if (selectedForMerge.length > 0 && mergeTarget.trim()) {
      mergeTag(selectedForMerge, mergeTarget)
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
        {tagsWithCount.map(({ tag, count }) => (
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
