# Project Structure Visualization

## Complete Directory Tree

```
task-manager/
├── src/
│   ├── components/
│   │   ├── shared/              # GLOBAL: Used by 2+ features
│   │   │   └── Button/
│   │   │       ├── Button.tsx
│   │   │       ├── Button.test.tsx
│   │   │       ├── Button.types.ts
│   │   │       └── index.ts
│   │   └── README.md
│   │
│   ├── features/                # Self-contained feature modules
│   │   ├── task-management/
│   │   │   ├── TaskManagement.tsx       # Container (matches directory)
│   │   │   ├── components/              # LOCAL: This feature only
│   │   │   │   ├── TaskList.tsx
│   │   │   │   ├── TaskCard.tsx
│   │   │   │   ├── TaskForm.tsx
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useTasks.ts
│   │   │   │   ├── useTaskForm.ts
│   │   │   │   └── index.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── README.md
│   │
│   ├── hooks/                   # GLOBAL: Used by 2+ features
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   ├── index.ts
│   │   └── README.md
│   │
│   ├── layouts/                 # GLOBAL: App-wide layouts
│   │   ├── RootLayout.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── index.ts
│   │   └── README.md
│   │
│   ├── lib/                     # GLOBAL: Utilities for 2+ features
│   │   ├── date.utils.ts
│   │   ├── validation.utils.ts
│   │   ├── api.ts
│   │   ├── constants.ts
│   │   ├── index.ts
│   │   └── README.md
│   │
│   ├── pages/                   # Route-level pages
│   │   ├── Home.tsx
│   │   ├── NotFound.tsx
│   │   ├── index.ts
│   │   └── README.md
│   │
│   ├── store/                   # Zustand stores
│   │   ├── taskStore.ts
│   │   ├── uiStore.ts
│   │   ├── index.ts
│   │   └── README.md
│   │
│   ├── types/                   # GLOBAL: Types for 2+ features
│   │   ├── task.types.ts
│   │   ├── user.types.ts
│   │   ├── api.types.ts
│   │   ├── common.types.ts
│   │   ├── index.ts
│   │   └── README.md
│   │
│   ├── __tests__/
│   │   ├── setup.ts
│   │   └── App.test.tsx
│   │
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
│
├── ARCHITECTURE.md              # Comprehensive architecture docs
├── QUICK_START.md               # Quick reference guide
├── PROJECT_SPECS.md             # Product requirements
├── STRUCTURE.md                 # This file
├── CLAUDE.md                    # Development workflow
├── README.md                    # Project overview
│
├── vite.config.ts               # Vite + path aliases
├── tsconfig.json                # TypeScript config
├── tsconfig.app.json            # App-specific TS config + path aliases
├── eslint.config.js             # ESLint configuration
├── package.json                 # Dependencies and scripts
└── tailwind.config.js           # Tailwind configuration
```

## Scope Rule Decision Tree

```
┌─────────────────────────────────────┐
│ Need to create a component/hook/   │
│ utility/type?                       │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ How many features currently use it? │
└─────────────┬───────────────────────┘
              │
      ┌───────┴───────┐
      │               │
      ▼               ▼
┌─────────┐     ┌─────────┐
│ 1 Feature│     │2+ Features│
└────┬────┘     └────┬────┘
     │               │
     ▼               ▼
┌─────────────┐ ┌──────────────┐
│   LOCAL     │ │   GLOBAL     │
│ (Feature    │ │ (Shared      │
│  directory) │ │  directory)  │
└─────────────┘ └──────────────┘
```

## Import Path Examples

### ✅ CORRECT (Using Path Aliases)

```typescript
// Importing from global shared components
import { Button, Modal, Input } from '@components/shared'

// Importing a feature
import { TaskManagement } from '@features/task-management'

// Importing global hooks
import { useDebounce, useLocalStorage } from '@hooks'

// Importing layouts
import { RootLayout, Header } from '@layouts'

// Importing pages
import { Home, NotFound } from '@pages'

// Importing global types
import { Task, User, Priority } from '@types'

// Importing utilities
import { formatDate, validateEmail } from '@lib'

// Importing from store
import { useTaskStore, useUIStore } from '@store'
```

### ❌ INCORRECT (Relative Paths)

```typescript
// Don't use relative paths
import { Button } from '../../../components/shared/Button'
import { TaskManagement } from '../../features/task-management'
import { useDebounce } from '../hooks/useDebounce'
```

## Feature Example: Task Management

```
features/task-management/
│
├── TaskManagement.tsx           # Main container
│   └── Exports: TaskManagement component
│
├── components/                  # LOCAL components
│   ├── TaskList.tsx            # Only used in task-management
│   ├── TaskCard.tsx            # Only used in task-management
│   ├── TaskForm.tsx            # Only used in task-management
│   └── index.ts                # Barrel export
│
├── hooks/                       # LOCAL hooks
│   ├── useTasks.ts             # Task data fetching
│   ├── useTaskForm.ts          # Form state management
│   └── index.ts
│
├── types.ts                     # LOCAL types
│   └── TaskFormState, TaskFilters, etc.
│
└── index.ts                     # Public API
    └── Exports: TaskManagement, public types
```

## State Management Flow

```
┌──────────────────────────────────────────────────┐
│                  Application                     │
└──────────────────┬───────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌───────────────┐    ┌────────────────┐
│  UI State     │    │  Server State  │
│  (Zustand)    │    │  (React Query) │
└───────┬───────┘    └────────┬───────┘
        │                     │
        ▼                     ▼
┌───────────────┐    ┌────────────────┐
│ - Theme       │    │ - Tasks        │
│ - Modal state │    │ - Users        │
│ - Preferences │    │ - Categories   │
└───────────────┘    └────────────────┘
```

## Routing Structure

```
<BrowserRouter>
  <Routes>
    <Route element={<RootLayout />}>          ← Layout wrapper
      <Route path="/" element={<Home />} />
      <Route path="/tasks" element={<TaskManagement />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
</BrowserRouter>
```

## Testing Strategy

```
Component/Feature
    │
    ├── Unit Tests
    │   ├── Component.test.tsx        (Co-located)
    │   ├── useHook.test.ts          (Co-located)
    │   └── utility.test.ts          (Co-located)
    │
    ├── Integration Tests
    │   └── Feature.integration.test.tsx
    │
    └── E2E Tests
        └── feature.e2e.test.ts
```

## File Naming Conventions

```
Components:     PascalCase.tsx         Button.tsx, TaskList.tsx
Hooks:          camelCase.ts           useDebounce.ts, useTasks.ts
Utils:          camelCase.utils.ts     date.utils.ts, validation.utils.ts
Types:          camelCase.types.ts     task.types.ts, api.types.ts
Tests:          *.test.tsx/ts          Button.test.tsx, useTasks.test.ts
Stores:         camelCase.ts           taskStore.ts, uiStore.ts
Constants:      camelCase.ts           constants.ts, config.ts
```

## When to Extract from Feature to Global

### Scenario: TaskCard used by second feature

```
BEFORE (LOCAL):
features/task-management/
└── components/
    └── TaskCard.tsx

TRIGGER:
features/analytics/ needs TaskCard

AFTER (GLOBAL):
components/shared/
└── TaskCard/
    ├── TaskCard.tsx
    ├── TaskCard.test.tsx
    ├── TaskCard.types.ts
    └── index.ts

REFACTOR:
✓ Move TaskCard to components/shared/
✓ Update imports in task-management
✓ Update imports in analytics
✓ Update tests
```

## Summary: Quick Reference

| Item | Used by 1 Feature | Used by 2+ Features |
|------|-------------------|---------------------|
| Component | `features/[feature]/components/` | `components/shared/` |
| Hook | `features/[feature]/hooks/` | `hooks/` |
| Type | `features/[feature]/types.ts` | `types/` |
| Utility | `features/[feature]/utils.ts` | `lib/` |
| Store | Always global | `store/` |
| Layout | Always global | `layouts/` |
| Page | Always global | `pages/` |
