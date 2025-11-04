import React from 'react'
import { useTaskStore } from '../../store/task.store'
import { TagChip } from './TagChip'
import { TagInput } from './TagInput'

export interface TagListProps {
  taskId: string
  tags: string[]
}

export const TagList: React.FC<TagListProps> = ({ taskId, tags }) => {
  const removeTagFromTask = useTaskStore((state) => state.removeTagFromTask)

  return (
    <div data-testid={`tag-list-${taskId}`}>
      {tags.length === 0 && <span data-testid="no-tags">No tags</span>}
      {tags.map((tag) => (
        <TagChip key={tag} tag={tag} taskId={taskId} onRemove={removeTagFromTask} />
      ))}
      <TagInput taskId={taskId} existingTags={tags} />
    </div>
  )
}
