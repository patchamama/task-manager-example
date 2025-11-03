# CLAUDE.md

## Project Context

@PROJECT_SPECS.md contains all user stories and requirements

## Architecture: Scope Rule

- **Global**: Used by 2+ features
- **Local**: Used by 1 feature only

## Tech Stack

- React 19 + TypeScript
- Zustand for state
- React Query for server state
- Tailwind CSS
- Vitest + React Testing Library
- ESLint + Prettier (auto-applied)

## TDD Development Workflow

### Phase 1: Architecture & Planning

1. react-scope-rule-architect: Design structure - USE for new features
2. react-mentor: Architectural guidance - USE for complex decisions
3. git-workflow-manager: Commit - USE after each phase

### Phase 2: Test-Driven Development

4. react-tdd-test-first: Create tests - USE for each functionality
5. git-workflow-manager: Commit RED phase
6. react-test-implementer: Implement - USE after tests fail
7. git-workflow-manager: Commit GREEN phase

### Phase 3: Quality & Security

8. react-security-auditor: Audit - USE before main merge
9. git-workflow-manager: Commit fixes
10. accessibility-auditor: WCAG - USE after UI complete
11. git-workflow-manager: Commit improvements

## Git Strategy (NO Claude mentions)

- Architecture: "feat: add [feature] architecture"
- Tests: "test: add [feature] tests (RED)"
- Implementation: "feat: implement [feature] (GREEN)"
- Security: "fix: security improvements"
- A11Y: "feat: improve accessibility"

## RULES

- NEVER write code without concrete functionality
- NEVER implement without failing tests
- NEVER mention Claude in commits
- NEVER create a feature branch with mention of Claude
- ALWAYS apply ESLint + Prettier
