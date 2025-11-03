# Quick Start Guide

## Project Structure

```
src/
├── components/shared/   # Components used by 2+ features
├── features/           # Feature modules (business logic)
├── hooks/              # Custom hooks used by 2+ features
├── layouts/            # App-wide layouts (Header, Footer, etc.)
├── lib/                # Utilities used by 2+ features
├── pages/              # Route-level page components
├── store/              # Zustand stores (global state)
├── types/              # TypeScript types used by 2+ features
├── __tests__/          # Test configuration
├── App.tsx             # Root component
└── main.tsx            # Entry point
```

## Key Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format with Prettier
```

## Path Aliases

Use clean imports with path aliases:

```typescript
import { Button } from '@components/shared'
import { TaskManagement } from '@features/task-management'
import { useDebounce } from '@hooks'
import { RootLayout } from '@layouts'
import { Home } from '@pages'
import { useTaskStore } from '@store'
import { Task } from '@types'
import { formatDate } from '@lib'
```

## The Scope Rule

**THE GOLDEN RULE**:
- Used by 2+ features? → Global directory
- Used by 1 feature only? → Feature directory

This rule applies to:
- Components
- Hooks
- Types
- Utilities

## Creating a New Feature

1. Create feature directory: `src/features/my-feature/`
2. Create container: `MyFeature.tsx` (must match directory name)
3. Add subdirectories as needed:
   ```
   my-feature/
   ├── MyFeature.tsx        # Container
   ├── components/          # Feature-specific components
   ├── hooks/               # Feature-specific hooks
   ├── types.ts             # Feature-specific types
   └── index.ts             # Export container
   ```

## TDD Workflow

1. Write failing test
2. Run `npm test` (verify RED)
3. Implement minimum code to pass
4. Run `npm test` (verify GREEN)
5. Refactor if needed
6. Repeat

## Adding a Global Component

When a component is needed by a 2nd feature:

1. Create in `src/components/shared/ComponentName/`
2. Add component file: `ComponentName.tsx`
3. Add types if needed: `ComponentName.types.ts`
4. Add test: `ComponentName.test.tsx`
5. Export via `index.ts`

## Best Practices

✅ **DO**:
- Follow the Scope Rule rigorously
- Use path aliases for imports
- Write tests before implementation
- Keep components focused and small
- Use TypeScript strict mode
- Run linter before committing

❌ **DON'T**:
- Make components global "just in case"
- Mix business logic with presentation
- Skip tests
- Use relative imports (../../../)
- Ignore TypeScript errors

## Architecture Documentation

See `/ARCHITECTURE.md` for comprehensive architectural guidelines.

## Need Help?

- Architecture questions? Check `/ARCHITECTURE.md`
- Directory guidelines? Check README.md in each directory
- Scope Rule confusion? Remember: 2+ features = global, 1 feature = local
