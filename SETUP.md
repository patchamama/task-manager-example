# Task Manager - Setup Documentation

## Project Overview

Clean React 19 + TypeScript project configured for TDD development with strict adherence to the **Scope Rule** architectural principle.

---

## Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.1.1 | UI library - latest stable |
| react-dom | ^19.1.1 | DOM rendering |
| typescript | ~5.9.3 | Type safety with strict mode |
| zustand | ^5.0.8 | State management |
| @tanstack/react-query | ^5.90.6 | Server state management |
| tailwindcss | ^4.1.16 | Utility-first CSS framework (v4) |
| react-router-dom | ^7.9.5 | Client-side routing |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^7.1.7 | Build tool and dev server |
| @vitejs/plugin-react | ^5.0.4 | React plugin for Vite |
| @tailwindcss/vite | ^4.1.16 | Tailwind v4 Vite plugin |
| vitest | ^4.0.6 | Testing framework |
| @testing-library/react | ^16.3.0 | React testing utilities |
| @testing-library/jest-dom | ^6.9.1 | DOM matchers for tests |
| @testing-library/user-event | ^14.6.1 | User interaction simulation |
| happy-dom | ^20.0.10 | DOM implementation for tests |
| eslint | ^9.36.0 | Linting (flat config) |
| typescript-eslint | ^8.45.0 | TypeScript ESLint support |
| eslint-plugin-react-hooks | ^5.2.0 | React Hooks rules |
| eslint-plugin-react-refresh | ^0.4.22 | React Fast Refresh validation |
| eslint-config-prettier | ^10.1.8 | Disable ESLint style rules |
| prettier | ^3.6.2 | Code formatting |

---

## Project Structure

```
/Users/mandy/Documents/_Proyectos/task-manager/
├── src/
│   ├── __tests__/              # Global test setup
│   │   └── setup.ts
│   ├── components/             # Component organization
│   │   └── global/             # Components used by 2+ features
│   ├── features/               # Feature-specific code
│   │   └── [feature-name]/     # Each feature has:
│   │       ├── [FeatureName].tsx   # Container (matches dir name)
│   │       ├── components/         # Local components (1 feature)
│   │       ├── hooks/              # Feature-specific hooks
│   │       └── types.ts            # Feature types
│   ├── hooks/                  # Global hooks (2+ features)
│   ├── store/                  # Zustand stores
│   ├── types/                  # Global TypeScript types
│   ├── lib/                    # Utility functions
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind imports
├── public/                     # Static assets
├── index.html                  # HTML entry
├── vite.config.ts              # Vite + Vitest config
├── tsconfig.json               # TypeScript base config
├── tsconfig.app.json           # App TypeScript config
├── tsconfig.node.json          # Node TypeScript config
├── eslint.config.js            # ESLint flat config
├── .prettierrc                 # Prettier config
├── package.json                # Dependencies
└── PROJECT_SPECS.md            # User stories & requirements
```

---

## The Scope Rule (Critical)

This architecture follows a strict rule for component placement:

### Rule Definition

- **Global Placement** (`/src/components/global/`): Components used by 2 or more features
- **Local Placement** (`/src/features/[name]/components/`): Components used by only 1 feature

### Examples

```typescript
// CORRECT: Button used by multiple features
src/components/global/Button.tsx

// CORRECT: LoginForm only used by authentication feature
src/features/authentication/components/LoginForm.tsx

// WRONG: SearchInput in global but only used by tasks feature
// Should be: src/features/tasks/components/SearchInput.tsx
```

### Container Naming Rule

The main container component of a feature MUST match the feature directory name:

```
src/features/shopping-cart/
└── ShoppingCart.tsx  ✓ CORRECT

src/features/shopping-cart/
└── Cart.tsx  ✗ WRONG
```

---

## Configuration Details

### TypeScript (tsconfig.app.json)

```json
{
  "compilerOptions": {
    "strict": true,                    // Strict type checking
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    // Path Aliases
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@global/*": ["./src/components/global/*"],
      "@features/*": ["./src/features/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@store/*": ["./src/store/*"],
      "@types/*": ["./src/types/*"],
      "@lib/*": ["./src/lib/*"]
    }
  }
}
```

### Vite (vite.config.ts)

- **React Plugin**: Fast Refresh enabled
- **Tailwind Plugin**: v4 Vite integration (no separate config file needed)
- **Path Aliases**: Matching TypeScript configuration
- **Vitest Integration**: Test configuration included

### Vitest

```typescript
test: {
  globals: true,              // Global test APIs (describe, it, expect)
  environment: 'happy-dom',   // Fast DOM implementation
  setupFiles: './src/__tests__/setup.ts',
  css: true,                  // CSS processing in tests
}
```

### ESLint

- **Flat Config** (eslint.config.js): Modern ESLint v9 format
- **TypeScript**: Full TypeScript support via typescript-eslint
- **React Hooks**: Enforces Rules of Hooks
- **React Refresh**: Validates Fast Refresh compliance
- **Prettier Integration**: Disables conflicting style rules

### Prettier

```json
{
  "semi": false,           // No semicolons
  "singleQuote": true,     // Single quotes
  "tabWidth": 2,           // 2 spaces
  "trailingComma": "es5",  // ES5 trailing commas
  "printWidth": 80,        // 80 char line width
  "arrowParens": "avoid"   // Avoid arrow parens when possible
}
```

### Tailwind CSS v4

- **Setup**: Uses `@import 'tailwindcss'` in index.css
- **No Config File**: Tailwind v4 works without tailwind.config.js
- **Vite Plugin**: `@tailwindcss/vite` handles processing
- **Dark Mode**: Class-based strategy ready

---

## Available Scripts

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)

# Testing
npm run test             # Run tests in watch mode
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report

# Linting
npm run lint             # Check for linting errors
npm run lint:fix         # Fix auto-fixable linting errors

# Formatting
npm run format           # Format all files
npm run format:check     # Check if files are formatted

# Build
npm run build            # Build for production
npm run preview          # Preview production build
```

---

## Development Workflow

### Phase 1: Architecture & Planning

1. Analyze feature requirements
2. Determine component scope (global vs local)
3. Design folder structure
4. Create container components (match directory names)

### Phase 2: Test-Driven Development

1. Write failing tests first (RED phase)
2. Implement minimal code to pass tests (GREEN phase)
3. Refactor while keeping tests green (REFACTOR phase)

### Phase 3: Quality Assurance

1. Run linting: `npm run lint:fix`
2. Run formatting: `npm run format`
3. Check test coverage: `npm run test:coverage`
4. Security audit (before main branch merge)
5. Accessibility audit (after UI completion)

---

## Path Alias Usage

```typescript
// Good: Use path aliases
import Button from '@global/Button'
import { useAuth } from '@hooks/useAuth'
import { Task } from '@types/task'

// Avoid: Relative paths beyond parent
import Button from '../../../components/global/Button'
```

---

## Verification Checklist

- [x] React 19 installed and configured
- [x] TypeScript strict mode enabled
- [x] Vite dev server functional
- [x] Vitest + React Testing Library configured
- [x] ESLint with React/TypeScript rules
- [x] Prettier integration
- [x] Tailwind CSS v4 working
- [x] Path aliases configured
- [x] Scope Rule structure implemented
- [x] Test setup file created
- [x] Sample test passes
- [x] No features implemented (clean slate)

---

## Important Notes

### What Was NOT Done

- No business logic implemented
- No feature components created
- No stores configured
- No API integrations
- No routing setup beyond installation
- No UI components beyond minimal App.tsx

### Next Steps

1. Read PROJECT_SPECS.md for user stories
2. Use TDD workflow for each feature
3. Follow Scope Rule strictly
4. Run tests before every commit
5. Lint and format code automatically

---

## Troubleshooting

### Tests Not Running

```bash
# Ensure test setup file exists
ls src/__tests__/setup.ts

# Check Vitest config in vite.config.ts
# Verify setupFiles path is correct
```

### Import Path Errors

```bash
# Rebuild TypeScript
npm run build

# Check tsconfig.app.json paths match vite.config.ts aliases
```

### Tailwind Classes Not Working

```bash
# Verify index.css contains:
@import 'tailwindcss';

# Check @tailwindcss/vite plugin in vite.config.ts
# Restart dev server
```

### ESLint Errors

```bash
# Auto-fix most issues
npm run lint:fix

# Format code
npm run format
```

---

## Additional Resources

- [React 19 Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Guide](https://vitest.dev/guide/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [React Query Documentation](https://tanstack.com/query/latest)

---

**Project Status**: Ready for TDD development. All tooling configured, no features implemented.
