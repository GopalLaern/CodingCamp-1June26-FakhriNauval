# Implementation Tasks

## Overview

This plan outlines the implementation of Dashboard Focus with a header + two-column grid layout (desktop) / single-column (mobile). The app combines a real-time clock, Pomodoro timer, task manager, and quick links, all persisted in Local Storage.

---

## Task List

### Phase 1: Project Setup & Structure

#### Task 1.1: Create project structure and HTML skeleton

- **Objective**: Establish basic file structure and complete HTML document
- **Deliverables**:
  - Create `index.html` with proper HTML5 doctype and meta tags
  - Create `css/style.css` (empty, placeholder)
  - Create `js/app.js` (empty, placeholder)
  - Implement header card with:
    - Theme toggle button (top-right, absolute position)
    - Clock display div (#clock)
    - Date display div (#datetime)
    - Greeting div (#greeting)
  - Implement two-column grid with:
    - Left column (.col-left) containing:
      - Focus Timer section (card class)
      - Quick Links section (card class)
    - Right column (.col-right) containing:
      - Tasks section (card class, tasks-card class)
  - All required input IDs: #timer-min, #link-name, #link-url, #todo-input
  - All required button IDs: #start, #pause, #reset, for form submits
  - Container setup with .container and .grid classes
  - Link stylesheet and script in HTML head/body
- **Status**: [ ] Pending

#### Task 1.2: Verify HTML structure and element IDs

- **Objective**: Ensure all elements match implementation requirements
- **Checklist**:
  - [ ] #clock, #datetime, #greeting in header
  - [ ] #timer-min input with default value="25"
  - [ ] #start, #pause, #reset buttons
  - [ ] #timer display div
  - [ ] #link-name, #link-url inputs
  - [ ] #links container
  - [ ] #todo-input input
  - [ ] #todos list container
  - [ ] #theme-toggle button
  - [ ] Proper HTML5 structure with head/body/meta tags
- **Status**: [ ] Pending

---

### Phase 2: CSS Styling

#### Task 2.1: Implement CSS variables and base styling

- **Objective**: Set up color palette and base responsive layout
- **Deliverables**:
  - Define CSS custom properties (--bg-gradient, --card, --text, --text-sub, --border, --accent, --delete, etc.)
  - Implement light mode (default) and dark mode (data-theme="dark" selector)
  - Body: gradient background, min-height 100vh, centered flex layout, padding responsive
  - Reset default margins/padding with \* { box-sizing: border-box }
  - Font stack: system-ui, -apple-system, sans-serif
  - Container: max-width 960px, centered, flex column, gap 20px
- **Status**: [ ] Pending

#### Task 2.2: Implement header styling

- **Objective**: Style the top header card with clock, date, greeting
- **Deliverables**:
  - `.header-card`: centered flex column, gap 8px, padding 30px 20px
  - `#clock`: `clamp(2.2rem, 8vw, 3.5rem)`, bold, accent color, letter-spacing -1px
  - `#datetime`: `0.9rem`, muted color
  - `#greeting`: `clamp(1.2rem, 4vw, 1.5rem)`, bold
  - `.theme-toggle-top`: positioned absolute top-right, emoji button (🌙/☀️), no background
  - Responsive: adjust font sizes on mobile
- **Status**: [ ] Pending

#### Task 2.3: Implement grid layout and column styling

- **Objective**: Create responsive two-column layout
- **Deliverables**:
  - `.grid`: `display: grid; grid-template-columns: 1.1fr 1fr` (desktop)
  - `.grid`: `grid-template-columns: 1fr` on @media (max-width: 768px)
  - Gap: 20px
  - `.col-left`: flex column, gap 20px
  - `.col-right`: full height
  - `.card`: background var(--card), border 1px var(--border), border-radius 12px, padding 24px, subtle shadow
  - Responsive padding on smaller screens (@media max-width: 480px, 600px)
- **Status**: [ ] Pending

#### Task 2.4: Style timer section

- **Objective**: Format timer display and controls
- **Deliverables**:
  - `#timer`: large display, `font-size: 4rem+`, bold, center aligned
  - `.timer-setup`: label + input for minutes configuration
  - Button styles: `.btn-primary` (primary color), `.btn-secondary` (Stop button), `.btn-light` (Reset)
  - Flex row for buttons: `.flex-row`, centered, gap
  - Hover/active states for buttons
- **Status**: [ ] Pending

#### Task 2.5: Style task list section

- **Objective**: Format task list items and form
- **Deliverables**:
  - `#todo-form`: flex row with input + button, gap, responsive width
  - `#todos li`: flex row with checkbox, text, action buttons
  - `.task-text`: flex-grow 1, normal text color
  - `li.completed .task-text`: text-decoration line-through, muted color
  - Checkbox: standard style, responsive size
  - Edit (✏️) and Delete (🗑️) buttons: icons, hover effects
  - Responsive list on mobile
- **Status**: [ ] Pending

#### Task 2.6: Style quick links section

- **Objective**: Format quick links display and form
- **Deliverables**:
  - `#link-form`: flex row with inputs + button
  - `.link-item`: flex row with link button + delete button
  - Link button: styled as pill button, accent background, white text, opens in new tab
  - Delete button (×): hover effect, easy to tap on mobile
  - Responsive layout for smaller screens
- **Status**: [ ] Pending

#### Task 2.7: Add responsive design and polish

- **Objective**: Ensure mobile/tablet responsiveness
- **Deliverables**:
  - Test on 320px, 480px, 768px, 1024px, 1920px viewports
  - Adjust font sizes with clamp() for smooth scaling
  - Ensure no horizontal overflow at any width
  - Touch-friendly button sizes (min 44px height on mobile)
  - Readable contrast ratios (WCAG AA minimum)
  - Test in light and dark modes
- **Status**: [ ] Pending

---

### Phase 3: JavaScript – Foundation & Utilities

#### Task 3.1: Set up Local Storage helpers and initialization

- **Objective**: Create reusable storage utility functions
- **Deliverables**:
  - `const get(k, f)`: Read from localStorage, parse JSON, return fallback if error or missing
  - `const set(k, v)`: Write to localStorage, stringify JSON, silently fail on error
  - Initialize DOM element references (cache selectors)
  - Add minimal error handling (try/catch in get/set)
  - Set up initial state objects: `let todos = []`, `let links = []`, `let sec`, `let timerId`
- **Status**: [ ] Pending

#### Task 3.2: Implement real-time clock and greeting

- **Objective**: Display current time, date, and time-based greeting
- **Deliverables**:
  - `function updateTime()`:
    - Get current Date object
    - Format time: HH:MM:SS (24-hour format) → #clock
    - Format date: "Monday, January 15, 2024" → #datetime
    - Determine greeting based on hour (5–11 → Morning, 12–17 → Afternoon, 18–4 → Evening)
    - Update #greeting
  - Call `updateTime()` immediately on page load
  - Schedule `setInterval(updateTime, 1000)` to update every second
- **Status**: [ ] Pending

#### Task 3.3: Implement timer display formatting

- **Objective**: Create timer display and format countdown
- **Deliverables**:
  - `function fmt()`: Convert `sec` to "MM:SS" with leading zeros, update #timer display
  - Initialize `sec = 25 * 60` (1500 seconds)
  - Initialize `timerId = null` (no interval running initially)
  - Display "25:00" on page load
- **Status**: [ ] Pending

---

### Phase 4: JavaScript – Timer Functionality

#### Task 4.1: Implement timer start, pause, reset handlers

- **Objective**: Add timer control event listeners
- **Deliverables**:
  - `#start.onclick`: If timerId is null, start `setInterval()` that decrements `sec` every 1 second
    - When `sec` reaches 0, `clearInterval()`, show alert "Time's up!"
  - `#pause.onclick`: `clearInterval(timerId)`, set `timerId = null`, retain current `sec` value
  - `#reset.onclick`: `clearInterval(timerId)`, set `timerId = null`, set `sec = timerInput.value * 60`, call `fmt()`
  - Attach event listeners on page load
- **Status**: [ ] Pending

#### Task 4.2: Implement timer input validation

- **Objective**: Allow user to customize timer duration
- **Deliverables**:
  - `#timer-min.onchange`:
    - Get input value, validate (parse to int, check 1 ≤ value ≤ 180)
    - Clamp to valid range if out of bounds
    - If `timerId` is null (not running), update `sec = value * 60` and call `fmt()`
  - Default input value: 25
- **Status**: [ ] Pending

#### Task 4.3: Test timer state machine

- **Objective**: Verify timer transitions work correctly
- **Checklist**:
  - [ ] Timer displays "25:00" on load
  - [ ] Click Start: timer counts down
  - [ ] Click Pause: timer stops at current value
  - [ ] Click Start again: timer resumes from paused value
  - [ ] Click Reset: timer returns to input value × 60
  - [ ] Change input while stopped: display updates
  - [ ] Timer auto-stops at "00:00" with alert
- **Status**: [ ] Pending

---

### Phase 5: JavaScript – Theme Toggle

#### Task 5.1: Implement theme toggle

- **Objective**: Add light/dark mode switching
- **Deliverables**:
  - `function applyTheme(theme)`:
    - Set `document.documentElement.setAttribute('data-theme', theme)`
    - Update `#theme-toggle.textContent` to '🌙' (light) or '☀️' (dark)
    - Save `theme` to `localStorage.theme`
  - `#theme-toggle.onclick`: Toggle between 'light' and 'dark'
  - On page load: restore theme from localStorage or default to 'light'
  - Call `applyTheme()` with restored theme
- **Status**: [ ] Pending

---

### Phase 6: JavaScript – Quick Links Module

#### Task 6.1: Load and render quick links

- **Objective**: Display saved quick links with delete functionality
- **Deliverables**:
  - Load from storage: `let links = get('links', [{name: 'Google', url: 'https://google.com'}, ...default links...])`
  - `function drawLinks()`:
    - Clear #links container
    - For each link in array:
      - Create `<div class="link-item">`
      - Create `<a>` with `href={url}`, `target="_blank"`, `rel="noopener noreferrer"`, text={name}
      - Create delete button (×) with onclick handler:
        - Remove link from array
        - Call `set('links', links)`
        - Call `drawLinks()`
    - Append to #links
  - Call `drawLinks()` on page load
- **Status**: [ ] Pending

#### Task 6.2: Implement add quick link functionality

- **Objective**: Allow users to create new quick links
- **Deliverables**:
  - `#link-form.onsubmit`:
    - Get #link-name and #link-url values
    - Trim both inputs
    - Validate: reject if either is empty
    - Create link object: `{name, url}`
    - Push to `links` array
    - Call `set('links', links)`
    - Call `drawLinks()`
    - Clear input fields
    - Prevent default form submission
  - Attach listener on page load
- **Status**: [ ] Pending

---

### Phase 7: JavaScript – Task Manager Module

#### Task 7.1: Load and render tasks

- **Objective**: Display saved tasks with checkboxes, edit, and delete buttons
- **Deliverables**:
  - Load from storage: `let todos = get('todos', [])`
  - `function renderTodos()`:
    - Clear #todos list
    - For each task in array:
      - Create `<li data-id={id}>`
      - If task.completed, add class `completed`
      - Create checkbox with `checked={task.completed}`
      - Create span with task.text
      - Create edit button (✏️)
      - Create delete button (🗑️)
      - Append to #todos
    - Show/hide empty state message
  - Call `renderTodos()` on page load
- **Status**: [ ] Pending

#### Task 7.2: Implement add task functionality

- **Objective**: Allow users to create new tasks
- **Deliverables**:
  - `#todo-form.onsubmit`:
    - Get #todo-input value
    - Trim input
    - Validate: reject if empty
    - Create task object: `{id: unique ID, text, completed: false}`
      - ID can be: `Date.now().toString()` or `crypto.randomUUID()` (if available)
    - Push to `todos` array
    - Call `set('todos', todos)`
    - Call `renderTodos()`
    - Clear #todo-input
    - Prevent default form submission
  - Attach listener on page load
  - Also attach Enter keydown handler to #todo-input
- **Status**: [ ] Pending

#### Task 7.3: Implement toggle task completion

- **Objective**: Allow users to mark tasks complete/incomplete
- **Deliverables**:
  - Attach checkbox change listener to each task:
    - Get task ID from li[data-id]
    - Find task in `todos` array by ID
    - Flip `task.completed` boolean
    - Call `set('todos', todos)`
    - Call `renderTodos()`
  - Must be re-attached after each `renderTodos()` call or use event delegation
- **Status**: [ ] Pending

#### Task 7.4: Implement delete task functionality

- **Objective**: Allow users to remove tasks
- **Deliverables**:
  - Attach delete button listener to each task:
    - Get task ID from li[data-id]
    - Filter task from `todos` array (remove by ID)
    - Call `set('todos', todos)`
    - Call `renderTodos()`
  - Re-attach after each `renderTodos()` call or use event delegation
- **Status**: [ ] Pending

#### Task 7.5: Implement edit task functionality

- **Objective**: Allow inline editing of task text
- **Deliverables**:
  - Attach edit button listener to each task:
    - `function startEdit(id)`:
      - Find task span (.task-text) in DOM
      - Replace span with `<input>` pre-filled with current task text
      - Focus on input
      - Attach keydown listeners:
        - Enter: save
        - Escape: cancel
  - `function saveEdit(id, newText)`:
    - Trim newText
    - Validate: reject if empty
    - Find task in array by ID
    - Update task.text
    - Call `set('todos', todos)`
    - Call `renderTodos()`
  - `function cancelEdit()`:
    - Call `renderTodos()` without saving
  - Re-attach after each `renderTodos()` call
- **Status**: [ ] Pending

#### Task 7.6: Test task manager state

- **Objective**: Verify task operations work correctly
- **Checklist**:
  - [ ] Tasks display on load
  - [ ] Add task: appears immediately in list
  - [ ] Toggle checkbox: task styled as completed (strikethrough)
  - [ ] Edit task: click pencil, edit text, press Enter to save
  - [ ] Edit task: press Escape to cancel
  - [ ] Delete task: click trash, task removed
  - [ ] Empty state shows when all tasks deleted
  - [ ] Refresh page: tasks persist
- **Status**: [ ] Pending

---

### Phase 8: Integration & Testing

#### Task 8.1: Test light/dark theme switching

- **Objective**: Verify theme toggle works end-to-end
- **Checklist**:
  - [ ] Page loads in light mode by default
  - [ ] Click theme button: switches to dark mode
  - [ ] All elements have sufficient contrast in both modes
  - [ ] Refresh page: theme persists
  - [ ] Theme button icon updates (🌙 ↔ ☀️)
- **Status**: [ ] Pending

#### Task 8.2: Test responsive layout

- **Objective**: Verify layout works on all viewport sizes
- **Checklist**:
  - [ ] Desktop (1024px+): two-column grid visible
  - [ ] Tablet (768px): single-column layout
  - [ ] Mobile (320px): no horizontal scroll, all sections visible
  - [ ] Text sizes responsive via clamp()
  - [ ] Touch targets >= 44px on mobile
- **Status**: [ ] Pending

#### Task 8.3: Test Local Storage persistence

- **Objective**: Verify data persists across sessions
- **Checklist**:
  - [ ] Add task, close browser tab, reopen: task persists
  - [ ] Add quick link, refresh page: link persists
  - [ ] Change timer minutes, refresh: value persists (NOTE: only while stopped)
  - [ ] Change theme, refresh: theme persists
  - [ ] Delete task, refresh: deletion persists
- **Status**: [ ] Pending

#### Task 8.4: Test error handling

- **Objective**: Verify app handles errors gracefully
- **Checklist**:
  - [ ] Enter invalid timer value: clamps to 1–180
  - [ ] Try to add empty task: rejected (no change)
  - [ ] Disable Local Storage in DevTools: app still works with empty data
  - [ ] Clear Local Storage: app shows empty state on next load
- **Status**: [ ] Pending

#### Task 8.5: Test browser compatibility

- **Objective**: Verify app works on all target browsers
- **Checklist**:
  - [ ] Chrome 90+: all features work
  - [ ] Firefox 88+: all features work
  - [ ] Safari 14+: all features work
  - [ ] Edge 90+: all features work
  - [ ] No console errors in any browser
- **Status**: [ ] Pending

#### Task 8.6: Performance validation

- **Objective**: Verify app meets performance targets
- **Checklist**:
  - [ ] Page load time: < 2 seconds (measure with DevTools)
  - [ ] Task add/delete/edit: UI updates < 100ms
  - [ ] Timer tick: smooth every 1 second, no jank
  - [ ] Theme toggle: instant (no flicker)
  - [ ] No unused CSS or JS code
- **Status**: [ ] Pending

---

### Phase 9: Code Quality & Documentation

#### Task 9.1: Code cleanup and optimization

- **Objective**: Polish code for maintainability
- **Deliverables**:
  - Remove all console.log() statements
  - Remove commented-out code
  - Ensure all function names are descriptive
  - Verify only 1 CSS file and 1 JS file exist
  - Add section comments in JS (e.g., "// ===== Timer Module =====")
  - Add section comments in CSS (e.g., "/_ ----- Timer Styles ----- _/")
- **Status**: [ ] Pending

#### Task 9.2: Verify requirements coverage

- **Objective**: Cross-check all requirements are implemented
- **Deliverables**:
  - Cross-reference each requirement from `requirements.md` with implementation
  - Document any deviations or notes
  - Verify all 23 functional requirements are met
  - Verify non-functional requirements met (performance, code org, accessibility)
- **Status**: [ ] Pending

#### Task 9.3: Update README

- **Objective**: Document project for users
- **Deliverables**:
  - Add project title and description
  - Add features list (Clock, Timer, Tasks, Quick Links, Light/Dark mode)
  - Add usage instructions (open index.html)
  - Add browser compatibility note
  - Add technical stack (Vanilla HTML/CSS/JS, no dependencies)
  - Add tips (e.g., timer customizable, data persists in Local Storage)
- **Status**: [ ] Pending

#### Task 9.4: Final QA and sign-off

- **Objective**: Complete final testing before release
- **Checklist**:
  - [ ] All tasks in Phase 1–8 marked complete
  - [ ] No known bugs or issues
  - [ ] All requirements documented and implemented
  - [ ] Code passes visual and functional review
  - [ ] Performance targets met
  - [ ] Ready for deployment
- **Status**: [ ] Pending

---

## Task Dependencies

```
Phase 1 (Setup) → Phase 2 (CSS) → Phase 3–7 (JS modules) → Phase 8 (Integration) → Phase 9 (Polish)
```

Can work in parallel:

- Phase 2 CSS can start while Phase 1 HTML is being completed
- Phase 3–7 JS modules can be worked on in parallel with some coordination

---

## Notes

- All tasks reference specific acceptance criteria from `requirements.md`
- Focus on vanilla JS—no frameworks, no build tools
- Single-file CSS and JS to keep deployment simple
- Local Storage provides data persistence; no backend needed
- Light/dark theme built-in from the start
