import React from 'react'

export interface TagChipProps {
  tag: string
  taskId: string
  onRemove: (taskId: string, tag: string) => void
}

export const TagChip: React.FC<TagChipProps> = ({ tag, taskId, onRemove }) => {
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
