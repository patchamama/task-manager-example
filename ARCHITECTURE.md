# Task Manager - Architecture Documentation

## Overview

This project follows a **feature-first architecture** with strict adherence to the **Scope Rule** for component and module organization.

## The Scope Rule (Core Principle)

The Scope Rule is absolute and governs all architectural decisions:

- **Global Placement**: Components, hooks, types, or utilities used by **2 or more features** MUST be placed in shared/global directories
- **Local Placement**: Components, hooks, types, or utilities used by **only 1 feature** MUST be placed within that feature's directory

This rule eliminates ambiguity and creates a self-documenting codebase where placement reveals usage.

## Directory Structure

```
src/
├── components/              # GLOBAL components (2+ features)
│   ├── shared/             # Reusable UI components
│   └── README.md           # Component guidelines
├── features/               # Feature modules
│   ├── [feature-name]/     # Self-contained feature
│   │   ├── FeatureName.tsx # Container (matches directory)
│   │   ├── components/     # LOCAL components (this feature only)
│   │   ├── hooks/          # Feature-specific hooks
│   │   ├── types.ts        # Feature-specific types
│   │   └── index.ts        # Barrel export
│   └── README.md           # Feature guidelines
├── hooks/                  # GLOBAL custom hooks (2+ features)
│   └── README.md
├── layouts/                # GLOBAL layout components
│   ├── RootLayout.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── index.ts
├── lib/                    # GLOBAL utilities
│   └── README.md
├── pages/                  # Route-level pages
│   ├── Home.tsx
│   └── index.ts
├── store/                  # Zustand stores (global state)
│   └── README.md
├── types/                  # GLOBAL TypeScript types (2+ features)
│   └── README.md
├── __tests__/              # Test configuration
│   └── setup.ts
├── App.tsx                 # Root component
├── main.tsx                # Entry point
└── index.css               # Global styles
```

## Path Aliases

Clean imports using TypeScript path aliases:

```typescript
// ✅ Clean
import { Button } from '@components/shared'
import { TaskManagement } from '@features/task-management'
import { useDebounce } from '@hooks'
import { Task } from '@types'

// ❌ Avoid
import { Button } from '../../components/shared/Button'
```

### Available Aliases

- `@/*` - src directory
- `@components/*` - components directory
- `@features/*` - features directory
- `@layouts/*` - layouts directory
- `@pages/*` - pages directory
- `@hooks/*` - hooks directory
- `@store/*` - store directory
- `@types/*` - types directory
- `@lib/*` - lib directory

## Feature Architecture

### Container Naming Rule

**NON-NEGOTIABLE**: The main container component MUST match the feature directory name exactly:

```
features/task-management/ → TaskManagement.tsx
features/user-profile/    → UserProfile.tsx
features/analytics/       → Analytics.tsx
```

This creates immediate visual coherence between filesystem and component hierarchy.

### Feature Structure

```
features/
└── task-management/
    ├── TaskManagement.tsx       # Container (public API)
    ├── components/              # LOCAL to this feature
    │   ├── TaskList.tsx
    │   ├── TaskCard.tsx
    │   ├── TaskForm.tsx
    │   └── index.ts
    ├── hooks/                   # Feature-specific hooks
    │   ├── useTasks.ts
    │   ├── useTaskForm.ts
    │   └── index.ts
    ├── types.ts                 # Feature-specific types
    └── index.ts                 # Exports TaskManagement
```

### When to Extract to Global

Monitor component usage. When a LOCAL component is needed by a second feature:

1. **Identify**: Component is being imported by 2nd feature
2. **Flag**: This violates the Scope Rule
3. **Refactor**: Move to `/src/components/shared/`
4. **Update**: Change all imports to use new location

## State Management Strategy

### Zustand (Client State)

Use for UI state, user preferences, temporary application state:

```typescript
// store/uiStore.ts
export const useUIStore = create((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}))
```

### React Query (Server State)

Use for API data, caching, and synchronization:

```typescript
// features/task-management/hooks/useTasks.ts
export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  })
}
```

### Component State

Use for isolated, local component state:

```typescript
const [isOpen, setIsOpen] = useState(false)
```

## Testing Strategy

- Co-locate tests with source files: `Component.test.tsx`
- Test setup in `/src/__tests__/setup.ts`
- Unit tests for utilities and hooks
- Integration tests for features
- Follow TDD: tests first, implementation after

## Routing Pattern

Use React Router with layout-based routing:

```typescript
// App.tsx
<Routes>
  <Route element={<RootLayout />}>
    <Route path="/" element={<Home />} />
    <Route path="/tasks" element={<TaskManagement />} />
  </Route>
</Routes>
```

## Tech Stack

- **React 19**: UI library
- **TypeScript**: Type safety (strict mode)
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing
- **Zustand**: Global state management
- **React Query**: Server state management
- **Vitest**: Test runner
- **React Testing Library**: Component testing

## Architectural Principles

### 1. Screaming Architecture

The directory structure should reveal what the application does, not just technical layers.

```
✅ GOOD: features/task-management/
❌ BAD: containers/TaskContainer.tsx
```

### 2. Feature Independence

Features should be self-contained with minimal cross-feature dependencies.

### 3. Scope Rule Compliance

Every architectural decision must respect the Scope Rule: global if 2+, local if 1.

### 4. Single Responsibility

Each module, component, and function should have one clear purpose.

### 5. Type Safety

Leverage TypeScript's strict mode for compile-time safety.

## Development Workflow (TDD)

1. **Architecture**: Design feature structure
2. **Test (RED)**: Write failing tests
3. **Implement (GREEN)**: Make tests pass
4. **Refactor**: Improve while keeping tests green
5. **Commit**: Clean, focused commits

## Quality Gates

Before considering code production-ready:

- [ ] Scope Rule compliance verified
- [ ] All tests passing
- [ ] TypeScript strict mode (no errors)
- [ ] ESLint and Prettier applied
- [ ] Accessibility considerations
- [ ] Responsive design tested
- [ ] Performance acceptable

## Common Patterns

### Component Export Pattern

```typescript
// components/shared/Button/Button.tsx
export function Button(props: ButtonProps) {
  // implementation
}

// components/shared/Button/index.ts
export { Button } from './Button'
export type { ButtonProps } from './Button.types'
```

### Feature Export Pattern

```typescript
// features/task-management/index.ts
export { TaskManagement } from './TaskManagement'
export type { Task } from './types'
```

### Hook Pattern

```typescript
// hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  // implementation
  return [value, setValue]
}
```

## Anti-Patterns to Avoid

❌ **Premature Abstraction**: Don't make components global "just in case"
❌ **God Components**: Large components that do too much
❌ **Prop Drilling**: Pass data through many layers (use context/store)
❌ **Mixed Concerns**: Business logic in presentation components
❌ **Implicit Dependencies**: Features depending on internal details of other features

## Migration Guide

When refactoring existing code:

1. **Audit**: List all components and their usage
2. **Categorize**: Apply Scope Rule (count features using each)
3. **Move**: Relocate components to correct directories
4. **Update**: Fix all imports using path aliases
5. **Verify**: Run tests and build

## References

- [React 19 Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Vitest Documentation](https://vitest.dev/)

## Decision Log

### Why feature-first over layer-first?

Feature-first organization scales better and makes the codebase self-documenting. You can understand what the app does by reading folder names.

### Why strict Scope Rule enforcement?

Eliminates decision paralysis. Clear, objective criteria (used by 2+ = global) removes ambiguity.

### Why path aliases?

Cleaner imports, easier refactoring, no import path calculation needed.

### Why separate pages from features?

Pages are thin route handlers; features contain business logic. This separation keeps concerns clear.

### Why layouts directory?

Layouts are structural and used globally, distinct from both pages and components.
