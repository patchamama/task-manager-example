import React, { useState } from 'react'
import { useTaskStore } from '../../store/task.store'

export interface TagInputProps {
  taskId: string
  existingTags?: string[]
}

export const TagInput: React.FC<TagInputProps> = ({ taskId, existingTags = [] }) => {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const allTags = useTaskStore((state) => state.getAllTags())
  const addTagToTask = useTaskStore((state) => state.addTagToTask)

  const handleInputChange = (value: string) => {
    setInputValue(value)
    if (value.trim()) {
      const filtered = allTags.filter(
        (tag) => tag.toLowerCase().includes(value.toLowerCase()) && !existingTags.includes(tag)
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
