# PROJECT SPECS - Task Manager

## Vision

Aplicación web de gestión de tareas moderna y eficiente, construida con React 19, TypeScript y siguiendo principios de desarrollo TDD. Permite a los usuarios crear, organizar y completar tareas de manera intuitiva.

## Tech Stack

- React 19 + TypeScript
- Zustand (state management)
- React Query (server state)
- Tailwind CSS (styling)
- Vitest + React Testing Library (testing)
- ESLint + Prettier (code quality)

## Architecture Principles

- **Scope Rule**: Componentes globales (2+ features) vs locales (1 feature)
- **TDD Workflow**: Tests first, implementation after
- **Type Safety**: TypeScript strict mode
- **Accessibility**: WCAG 2.1 AA compliance

---

## EPIC 1: Task Management Core

### User Story 1.1: Create Task
**As a** user
**I want to** create a new task with title and description
**So that** I can track things I need to do

**Acceptance Criteria:**
- User can input task title (required, max 100 chars)
- User can input task description (optional, max 500 chars)
- Task is saved with creation timestamp
- Form validates required fields
- Success feedback is shown after creation

**Technical Notes:**
- Component scope: Feature-specific
- Zustand store for task state
- Form validation with controlled inputs

---

### User Story 1.2: View Task List
**As a** user
**I want to** see all my tasks in a list
**So that** I can review what needs to be done

**Acceptance Criteria:**
- Tasks are displayed in a list format
- Each task shows title, description preview, and status
- List shows creation date for each task
- Empty state is shown when no tasks exist
- Tasks are sorted by creation date (newest first)

**Technical Notes:**
- Component scope: Feature-specific
- Virtualized list if 50+ tasks
- Skeleton loading states

---

### User Story 1.3: Edit Task
**As a** user
**I want to** edit an existing task
**So that** I can update information as needed

**Acceptance Criteria:**
- User can click to edit a task
- Editing interface pre-fills current values
- Changes are saved on submit
- User can cancel editing without saving
- Updated timestamp is tracked

**Technical Notes:**
- Reuse form component from create
- Optimistic updates with Zustand
- Validation same as creation

---

### User Story 1.4: Delete Task
**As a** user
**I want to** delete a task
**So that** I can remove tasks I no longer need

**Acceptance Criteria:**
- User can click delete button on a task
- Confirmation modal appears before deletion
- Task is removed from list after confirmation
- User can cancel deletion
- Success feedback is shown

**Technical Notes:**
- Global confirmation modal component
- Soft delete (mark as deleted) vs hard delete
- Undo capability (5 second window)

---

### User Story 1.5: Mark Task Complete
**As a** user
**I want to** mark tasks as complete
**So that** I can track my progress

**Acceptance Criteria:**
- User can toggle task completion status with checkbox
- Completed tasks have visual distinction (strikethrough)
- Completion timestamp is recorded
- User can uncomplete a task
- Completion count is visible

**Technical Notes:**
- Checkbox component (global if used 2+ places)
- Status enum: pending, completed
- Optimistic UI updates

---

## EPIC 2: Task Organization

### User Story 2.1: Add Task Priority
**As a** user
**I want to** assign priority levels to tasks
**So that** I can focus on what's most important

**Acceptance Criteria:**
- User can select priority: Low, Medium, High, Critical
- Priority is shown with color coding
- Default priority is Medium
- Priority can be changed after creation
- Visual indicators are accessible (not color-only)

**Technical Notes:**
- Priority enum type
- Color system using Tailwind
- Icons + colors for accessibility

---

### User Story 2.2: Filter Tasks by Status
**As a** user
**I want to** filter tasks by completion status
**So that** I can focus on active or completed tasks

**Acceptance Criteria:**
- Filter options: All, Active, Completed
- Active filter is persisted in URL
- Task count is shown for each filter
- Filter updates list immediately
- Default view is "All"

**Technical Notes:**
- URL state for filter (shareable links)
- Derived state from Zustand
- Filter component (local to feature)

---

### User Story 2.3: Sort Tasks
**As a** user
**I want to** sort tasks by different criteria
**So that** I can organize my view

**Acceptance Criteria:**
- Sort options: Date created, Priority, Title (A-Z)
- Sort direction: Ascending/Descending
- Current sort is visually indicated
- Sort preference is persisted
- Default: Date created (newest first)

**Technical Notes:**
- Sort state in Zustand
- LocalStorage for persistence
- Sort dropdown component

---

### User Story 2.4: Search Tasks
**As a** user
**I want to** search tasks by title or description
**So that** I can quickly find specific tasks

**Acceptance Criteria:**
- Search input filters tasks in real-time
- Search is case-insensitive
- Search matches title and description
- Clear button to reset search
- No results message when applicable

**Technical Notes:**
- Debounced search (300ms)
- Search input component (global)
- Highlight matching text

---

### User Story 2.5: Add Due Dates
**As a** user
**I want to** set due dates for tasks
**So that** I can manage deadlines

**Acceptance Criteria:**
- User can select due date (optional)
- Date picker shows calendar interface
- Overdue tasks are highlighted
- Due date can be cleared
- Tasks can be sorted by due date

**Technical Notes:**
- Date picker component (global)
- Due date validation (not in past)
- Overdue calculation logic

---

## EPIC 3: Categories & Tags

### User Story 3.1: Create Categories
**As a** user
**I want to** create categories for tasks
**So that** I can organize tasks by project or area

**Acceptance Criteria:**
- User can create custom categories
- Category has name and color
- Maximum 20 categories
- Category names are unique
- Categories can be edited/deleted

**Technical Notes:**
- Category model with validation
- Color picker component
- Category CRUD operations

---

### User Story 3.2: Assign Category to Task
**As a** user
**I want to** assign a category to a task
**So that** I can group related tasks

**Acceptance Criteria:**
- User selects category from dropdown
- One category per task
- Category is optional
- Category badge shown on task
- Category can be changed/removed

**Technical Notes:**
- Category select component
- Foreign key relationship
- Category state in Zustand

---

### User Story 3.3: Filter by Category
**As a** user
**I want to** filter tasks by category
**So that** I can focus on specific projects

**Acceptance Criteria:**
- Category filter in sidebar/dropdown
- Can select multiple categories
- Shows task count per category
- "Uncategorized" option available
- Combined with other filters

**Technical Notes:**
- Multi-select component
- Filter logic combining status + category
- URL state for categories

---

### User Story 3.4: Add Tags to Tasks
**As a** user
**I want to** add multiple tags to tasks
**So that** I can cross-categorize tasks

**Acceptance Criteria:**
- User can add multiple tags per task
- Tag autocomplete from existing tags
- New tags can be created inline
- Tags shown as removable chips
- Maximum 10 tags per task

**Technical Notes:**
- Tag input with autocomplete
- Many-to-many relationship
- Tag component (global)

---

### User Story 3.5: Tag Management
**As a** user
**I want to** manage my tags
**So that** I can keep them organized

**Acceptance Criteria:**
- View all existing tags
- Rename tags (updates all tasks)
- Delete tags (removes from tasks)
- Merge duplicate tags
- See task count per tag

**Technical Notes:**
- Tag management modal
- Bulk update operations
- Confirmation for destructive actions

---

## EPIC 4: User Experience

### User Story 4.1: Dark Mode
**As a** user
**I want to** toggle between light and dark themes
**So that** I can use the app comfortably in any lighting

**Acceptance Criteria:**
- Theme toggle button in header
- Preference is persisted
- Respects system preference initially
- Smooth transition between themes
- All components support both themes

**Technical Notes:**
- Tailwind dark mode class strategy
- LocalStorage for preference
- CSS variables for colors
- Theme context (global)

---

### User Story 4.2: Responsive Design
**As a** user
**I want to** use the app on any device
**So that** I can manage tasks anywhere

**Acceptance Criteria:**
- Mobile-first responsive design
- Breakpoints: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- Touch-friendly targets (min 44x44px)
- Optimized layouts per device
- No horizontal scroll

**Technical Notes:**
- Tailwind responsive utilities
- Mobile navigation pattern
- Touch gesture support

---

### User Story 4.3: Keyboard Shortcuts
**As a** user
**I want to** use keyboard shortcuts
**So that** I can work more efficiently

**Acceptance Criteria:**
- Ctrl/Cmd + N: New task
- Ctrl/Cmd + F: Focus search
- Ctrl/Cmd + K: Command palette
- Esc: Close modals
- Help modal shows all shortcuts

**Technical Notes:**
- Keyboard event handler (global)
- Command palette component
- Focus management
- Accessibility considerations

---

### User Story 4.4: Drag and Drop Reorder
**As a** user
**I want to** drag tasks to reorder them
**So that** I can manually prioritize

**Acceptance Criteria:**
- Tasks can be dragged to new positions
- Visual feedback during drag
- Order is persisted
- Works on touch devices
- Accessible alternative (buttons)

**Technical Notes:**
- DnD library (dnd-kit)
- Custom order field
- Touch event handling
- Keyboard reorder buttons

---

### User Story 4.5: Bulk Actions
**As a** user
**I want to** perform actions on multiple tasks
**So that** I can work more efficiently

**Acceptance Criteria:**
- Select multiple tasks with checkboxes
- Bulk actions: Complete, Delete, Change category
- Select all / Deselect all
- Selection count shown
- Confirmation for destructive actions

**Technical Notes:**
- Selection state in Zustand
- Bulk operation API
- Checkbox component (global)

---

## EPIC 5: Data Persistence

### User Story 5.1: Local Storage Persistence
**As a** user
**I want to** have my tasks saved locally
**So that** I don't lose data on page refresh

**Acceptance Criteria:**
- Tasks persist in localStorage
- Data loads on app initialization
- Handles corrupted data gracefully
- Storage quota warnings
- Export/backup capability

**Technical Notes:**
- Zustand persist middleware
- Storage quota detection
- Data migration strategy
- Error boundaries

---

### User Story 5.2: Export Tasks
**As a** user
**I want to** export my tasks
**So that** I can backup or share my data

**Acceptance Criteria:**
- Export formats: JSON, CSV
- Export includes all task data
- File downloads automatically
- Export filename includes date
- Export all or filtered tasks

**Technical Notes:**
- File download utility (global)
- CSV generation
- JSON serialization
- Filter context awareness

---

### User Story 5.3: Import Tasks
**As a** user
**I want to** import tasks from a file
**So that** I can restore backups or migrate data

**Acceptance Criteria:**
- Import from JSON or CSV
- File validation before import
- Preview import before applying
- Handles duplicate tasks
- Error messages for invalid files

**Technical Notes:**
- File upload component
- Data validation schema
- Duplicate detection logic
- Error handling

---

### User Story 5.4: Auto-save Indicator
**As a** user
**I want to** see when changes are saved
**So that** I know my data is secure

**Acceptance Criteria:**
- "Saving..." indicator during save
- "Saved" confirmation after save
- Error indicator if save fails
- Retry mechanism for failures
- Non-intrusive UI placement

**Technical Notes:**
- Save status component (global)
- Debounced save (1 second)
- Error retry logic
- Toast notifications

---

### User Story 5.5: Offline Support
**As a** user
**I want to** use the app offline
**So that** I can work without internet

**Acceptance Criteria:**
- App loads offline (PWA)
- All features work offline
- Online/offline status indicator
- Data syncs when back online
- Service worker caching

**Technical Notes:**
- PWA manifest
- Service worker
- Cache strategies
- Sync API

---

## EPIC 6: Analytics & Insights

### User Story 6.1: Task Statistics
**As a** user
**I want to** see statistics about my tasks
**So that** I can understand my productivity

**Acceptance Criteria:**
- Total tasks count
- Completed vs active ratio
- Completion rate percentage
- Tasks completed today/week/month
- Average completion time

**Technical Notes:**
- Stats calculation (derived state)
- Dashboard component
- Chart library (recharts)
- Date range filters

---

### User Story 6.2: Productivity Insights
**As a** user
**I want to** see productivity trends
**So that** I can improve my habits

**Acceptance Criteria:**
- Completion trend chart (last 30 days)
- Most productive days/times
- Category breakdown
- Task creation vs completion rate
- Insights are visual

**Technical Notes:**
- Chart components (global)
- Date aggregation logic
- Responsive charts
- Color-blind friendly palette

---

### User Story 6.3: Task History
**As a** user
**I want to** view completed task history
**So that** I can review what I've accomplished

**Acceptance Criteria:**
- Separate view for history
- Filter by date range
- Search in history
- Sort options
- Cannot edit completed tasks

**Technical Notes:**
- History view component
- Date range picker
- Read-only task view
- Pagination for large lists

---

## EPIC 7: Accessibility

### User Story 7.1: Screen Reader Support
**As a** screen reader user
**I want to** navigate and use all features
**So that** I can manage tasks independently

**Acceptance Criteria:**
- All interactive elements have labels
- ARIA landmarks for navigation
- Live regions for updates
- Focus management in modals
- Descriptive button text

**Technical Notes:**
- ARIA attributes
- Semantic HTML
- Focus trap in modals
- Screen reader testing

---

### User Story 7.2: Keyboard Navigation
**As a** keyboard user
**I want to** access all features via keyboard
**So that** I don't need a mouse

**Acceptance Criteria:**
- Logical tab order
- Visible focus indicators
- Skip links for main content
- No keyboard traps
- Escape closes modals

**Technical Notes:**
- Focus management
- tabIndex strategy
- Focus-visible CSS
- Keyboard event handlers

---

### User Story 7.3: Color Contrast
**As a** user with vision impairment
**I want to** see all content clearly
**So that** I can read without strain

**Acceptance Criteria:**
- WCAG AA contrast ratios (4.5:1)
- AAA for large text (3:1)
- Not relying on color alone
- High contrast mode support
- Tested with contrast tools

**Technical Notes:**
- Tailwind contrast utilities
- Design tokens for colors
- Icon + color for status
- Contrast checker automation

---

## Non-Functional Requirements

### Performance
- Initial load < 2 seconds
- Time to interactive < 3 seconds
- Smooth 60fps animations
- Bundle size < 200KB (gzipped)
- Lazy load routes

### Security
- Input sanitization
- XSS prevention
- CSP headers
- No sensitive data in localStorage
- Audit dependencies

### Testing
- Unit test coverage > 80%
- Integration tests for critical paths
- E2E tests for user flows
- Accessibility tests (axe)
- Visual regression tests

### Browser Support
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile browsers

---

## Development Phases

### Phase 1 (MVP)
- EPIC 1: Task Management Core
- EPIC 5.1: Local Storage
- EPIC 4.2: Responsive Design

### Phase 2
- EPIC 2: Task Organization
- EPIC 3.1-3.2: Basic Categories
- EPIC 4.1: Dark Mode

### Phase 3
- EPIC 3.3-3.5: Tags & Advanced Categories
- EPIC 4.3-4.5: UX Enhancements
- EPIC 5.2-5.3: Import/Export

### Phase 4
- EPIC 6: Analytics & Insights
- EPIC 5.4-5.5: Auto-save & Offline
- EPIC 7: Accessibility (ongoing)

---

## Success Metrics

- User retention > 70% after 30 days
- Task completion rate > 60%
- Average session duration > 5 minutes
- Accessibility audit score 100%
- Lighthouse score > 95
- Zero critical bugs in production
