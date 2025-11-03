# Task Manager

A modern task management application built with React 19, TypeScript, and following TDD principles with strict architectural patterns.

## Tech Stack

- **React 19** - UI Framework
- **TypeScript** - Type safety (strict mode)
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling (using @tailwindcss/vite plugin)
- **Zustand** - State management
- **React Query** - Server state management
- **React Router** - Client-side routing
- **Vitest** - Testing framework
- **React Testing Library** - Component testing
- **ESLint + Prettier** - Code quality

## Project Structure

```
src/
├── components/shared/   # GLOBAL: Components used by 2+ features
├── features/           # Feature modules (self-contained)
├── hooks/              # GLOBAL: Hooks used by 2+ features
├── layouts/            # GLOBAL: App-wide layouts
├── lib/                # GLOBAL: Utilities used by 2+ features
├── pages/              # Route-level page components
├── store/              # Zustand stores (global state)
├── types/              # GLOBAL: Types used by 2+ features
├── __tests__/          # Test configuration
├── App.tsx             # Root component
└── main.tsx            # Entry point
```

**See `/ARCHITECTURE.md` for comprehensive architectural documentation.**

## Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Testing
```bash
npm run test         # Run tests in watch mode
npm run test:ui      # Open Vitest UI
npm run test:coverage # Run tests with coverage
```

### Code Quality
```bash
npm run lint         # Check for linting errors
npm run lint:fix     # Fix linting errors automatically
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

## Architecture Principles

### The Scope Rule

**THE GOLDEN RULE**: Component, hook, type, or utility placement is determined by usage:

- **GLOBAL**: Used by **2 or more features** → Place in shared directory (`components/shared/`, `hooks/`, `types/`, `lib/`)
- **LOCAL**: Used by **only 1 feature** → Place within feature directory (`features/[feature-name]/`)

This rule is **absolute and non-negotiable**. It eliminates ambiguity and creates self-documenting architecture.

### Container Naming Rule

Feature containers **MUST** match their directory name exactly:
- `features/task-management/` → `TaskManagement.tsx`
- `features/user-profile/` → `UserProfile.tsx`

### TDD Workflow
1. Write tests first (RED phase)
2. Implement minimal code to pass (GREEN phase)
3. Refactor and improve (REFACTOR phase)

### Path Aliases

Clean imports using TypeScript path aliases:

```typescript
import { Button } from '@components/shared'
import { TaskManagement } from '@features/task-management'
import { useDebounce } from '@hooks'
import { Task } from '@types'
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Run tests:
```bash
npm run test
```

## Development Guidelines

- **TDD First**: Write tests before implementation
- **Scope Rule**: Rigorously apply 2+ = global, 1 = local
- **TypeScript Strict**: No compromises on type safety
- **Path Aliases**: Use `@` imports, never relative paths
- **Accessibility**: WCAG 2.1 AA compliance minimum
- **Code Quality**: Run ESLint + Prettier before commits
- **Container Naming**: Match feature directory names exactly

## Documentation

- **`/ARCHITECTURE.md`** - Comprehensive architectural guidelines and patterns
- **`/QUICK_START.md`** - Quick reference for common tasks
- **`/PROJECT_SPECS.md`** - Complete product requirements and user stories
- **`/src/[directory]/README.md`** - Directory-specific guidelines

## Project Status

**Architecture Phase: COMPLETE** ✓

The project has been restructured following React 19 best practices and the Scope Rule:

- ✓ Feature-first directory structure
- ✓ Scope Rule compliant organization
- ✓ Path aliases configured (TypeScript + Vite)
- ✓ Layout components extracted to global scope
- ✓ Clean routing pattern with React Router
- ✓ Comprehensive documentation
- ✓ All tests passing
- ✓ Build verified
- ✓ Dev server confirmed working

**Ready for TDD feature implementation.**
