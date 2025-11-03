# Task Manager - Quick Reference

## Daily Commands

```bash
# Start development
npm run dev

# Run tests (watch mode)
npm run test

# Lint + Format + Test
npm run lint:fix && npm run format && npm run test -- --run

# Build for production
npm run build
```

---

## The Scope Rule (Remember This!)

```
🌍 GLOBAL (2+ features)  → src/components/global/
📦 LOCAL (1 feature)     → src/features/[name]/components/
```

**Container Rule**: Feature container MUST match directory name
- ✓ `src/features/tasks/Tasks.tsx`
- ✗ `src/features/tasks/TasksList.tsx`

---

## Path Aliases

```typescript
import Button from '@global/Button'          // Global component
import TaskForm from '@features/tasks/...'   // Feature component
import { useAuth } from '@hooks/useAuth'     // Global hook
import { Task } from '@types/task'           // Global type
import { api } from '@lib/api'               // Utility
import { useTaskStore } from '@store/tasks'  // Zustand store
```

---

## TDD Workflow

1. **RED**: Write failing test
   ```bash
   npm run test
   ```

2. **GREEN**: Implement minimal code to pass
   ```bash
   npm run test -- --run
   ```

3. **REFACTOR**: Improve code, tests stay green
   ```bash
   npm run lint:fix && npm run format
   ```

---

## File Organization

```
src/
├── components/global/     # Used by 2+ features
├── features/             # Feature folders
│   └── [feature]/
│       ├── [Feature].tsx # Container (match dir name!)
│       ├── components/   # Local components
│       ├── hooks/        # Feature hooks
│       └── types.ts      # Feature types
├── hooks/                # Global hooks
├── store/                # Zustand stores
├── types/                # Global types
└── lib/                  # Utilities
```

---

## Testing Utilities

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

// Render component
render(<MyComponent />)

// Query elements
screen.getByText('Click me')
screen.getByRole('button')
screen.getByLabelText('Email')

// User interactions
const user = userEvent.setup()
await user.click(button)
await user.type(input, 'text')

// Assertions
expect(element).toBeInTheDocument()
expect(element).toHaveTextContent('text')
```

---

## ESLint + Prettier

Auto-format on save (VS Code):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## Common Patterns

### Global Component
```typescript
// src/components/global/Button.tsx
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}
```

### Feature Component
```typescript
// src/features/tasks/Tasks.tsx
import { TaskList } from './components/TaskList'

export function Tasks() {
  return (
    <div>
      <h1>Tasks</h1>
      <TaskList />
    </div>
  )
}
```

### Zustand Store
```typescript
// src/store/tasks.ts
import { create } from 'zustand'

interface TaskStore {
  tasks: Task[]
  addTask: (task: Task) => void
}

export const useTaskStore = create<TaskStore>(set => ({
  tasks: [],
  addTask: task => set(state => ({ tasks: [...state.tasks, task] })),
}))
```

### React Query Hook
```typescript
// src/hooks/useTasks.ts
import { useQuery } from '@tanstack/react-query'

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  })
}
```

---

## Tailwind Tips

```tsx
// Responsive
<div className="text-sm md:text-base lg:text-lg">

// Dark mode
<div className="bg-white dark:bg-gray-900">

// States
<button className="hover:bg-blue-600 focus:ring-2">

// Custom classes with @apply (if needed)
```

---

## Git Workflow

```bash
# Feature branch
git checkout -b feat/task-creation

# Commit after RED phase
git commit -m "test: add task creation tests (RED)"

# Commit after GREEN phase
git commit -m "feat: implement task creation (GREEN)"

# Never mention Claude in commits!
```

---

## Debugging

```typescript
// Vitest debugging
it.only('specific test', () => { /* runs only this */ })

// React Query devtools (add to App.tsx)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Zustand devtools
import { devtools } from 'zustand/middleware'
```

---

## Performance

```typescript
// Lazy load routes
const Tasks = lazy(() => import('@features/tasks/Tasks'))

// Memoize expensive calculations
const value = useMemo(() => expensiveCalc(data), [data])

// Memoize callbacks
const handler = useCallback(() => doSomething(), [])
```

---

## Accessibility Quick Checks

```tsx
// Semantic HTML
<button> not <div onClick>

// ARIA labels
<button aria-label="Close modal">

// Keyboard navigation
<div role="button" tabIndex={0} onKeyPress={handler}>

// Focus management
const ref = useRef<HTMLElement>(null)
useEffect(() => ref.current?.focus(), [])
```

---

## Cheat Sheet Location

Full documentation: `/Users/mandy/Documents/_Proyectos/task-manager/SETUP.md`
Project specs: `/Users/mandy/Documents/_Proyectos/task-manager/PROJECT_SPECS.md`
