# Dashboard Focus — Technical Design

## Overview

A single-page productivity dashboard built with vanilla HTML, CSS, and JavaScript. Features include a real-time clock with greeting, Pomodoro-style focus timer, task management, and quick links for fast website access. All data is persisted in the browser's Local Storage. The app runs directly as an HTML file or from a static host with no backend required.

---

## File Structure

```
MiniProjectToDoList/
├── index.html          # Single HTML entry point
├── css/
│   └── style.css       # All styles (one file only)
├── js/
│   └── app.js          # All JavaScript logic (one file only)
└── README.md
```

---

## Page Layout

### Header Section
- Centered card containing:
  - Theme toggle button (top-right, absolute position)
  - Large clock display (HH:MM:SS, responsive sizing)
  - Full date display (e.g., "Monday, January 15, 2024")
  - Time-based greeting (Good Morning/Afternoon/Evening)

### Two-Column Grid (Desktop: 1.1fr + 1fr, Mobile: 1fr)

**Left Column**
- Focus Timer card (centered, with input + 3 buttons)
- Quick Links card (with form inputs + link list)

**Right Column**
- Tasks card (with form input + task list)

---

## CSS Design (`css/style.css`)

### Layout System

- **Container**: max-width 960px, centered, vertical flex layout
- **Responsive Grid**: `grid-template-columns: 1.1fr 1fr` (desktop), `1fr` (mobile @ 768px)
- **Card Component**: Consistent styling with background, border, 12px border-radius, subtle shadow
- **Gap/Spacing**: 20px between grid items, 30px vertical padding on body

### Theme System (Light & Dark)

**Light Mode** (default)
```css
--bg-gradient: linear-gradient(135deg, #f1f5f9, #e2e8f0)
--card: #ffffff
--text: #0f172a
--text-sub: #64748b
--border: #e2e8f0
--accent: #0f172a
--delete: #ef4444
```

**Dark Mode** (data-theme="dark")
```css
--bg-gradient: linear-gradient(135deg, #0f172a, #020617)
--card: #1e293b
--text: #f8fafc
--text-sub: #94a3b8
--border: #334155
--accent: #f8fafc
--delete: #f87171
```

### Typography

- **System fonts**: `system-ui, -apple-system, sans-serif` (no external font files)
- **Clock**: `clamp(2.2rem, 8vw, 3.5rem)`, bold, responsive scaling
- **Greeting**: `clamp(1.2rem, 4vw, 1.5rem)`, bold
- **Date**: `0.9rem`, muted color
- **Card titles**: `1.1rem`, semi-bold
- **Body text**: `1rem`, standard weight

### Key Component Styles

| Component | Rules |
|---|---|
| `.header-card` | Centered flex column, contains clock + date + greeting |
| `.grid` | Two-column responsive grid with gap |
| `.col-left` | Flex column with gap, timer + quick links |
| `.col-right` | Full height tasks card |
| `.card` | Base styled container (background, border, shadow) |
| `#clock` | Large monospace-style display, accent color |
| `#timer` | Large countdown display (4rem+), updates color when running |
| `.btn-primary` | Accent background, white text, hover/active states |
| `.btn-secondary` | Secondary button (Stop) with gray styling |
| `.btn-light` | Light button (Reset) with subtle styling |
| `.theme-toggle-top` | Positioned absolute top-right, 🌙/☀️ emoji button |
| `.link-item` | Flex row with link button + delete icon (×) |
| `#todos li` | Flex row with checkbox + text + edit (✏️) + delete (🗑️) icons |
| `.task-completed` | Applied when task is checked: strikethrough text, muted color |
| `.form-row` | Flex row with inputs and submit button |

---

## JavaScript Architecture (`js/app.js`)

The file uses a functional, modular approach organized by feature:

```
1. Local Storage Helpers (get/set)
2. Time & Clock Module (updateTime)
3. Timer Module (sec, timerId, fmt, handlers)
4. Theme Toggle Module (applyTheme)
5. Quick Links Module (links array, drawLinks)
6. Task Manager Module (todos array, renderTodos, handlers)
```

### 1. Local Storage Helpers

```js
const get = (k, f) => {
  try {
    const val = localStorage.getItem(k);
    return val ? JSON.parse(val) : f;
  } catch (e) {
    return f;  // Return fallback on error
  }
};

const set = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {}  // Silently fail on quota exceeded
};
```

### 2. Time & Clock Module

**Variables**
- Updates every 1 second via `setInterval(updateTime, 1000)`

**Function: updateTime()**
- Gets current hour, minutes, seconds
- Formats and displays in `#clock` (HH:MM:SS, 24-hour format)
- Formats full date and displays in `#datetime`
- Determines greeting based on hour:
  - 5–11: "Good Morning"
  - 12–17: "Good Afternoon"
  - 18–4: "Good Evening"
- Updates `#greeting` element

### 3. Timer Module

**State Variables**
```js
let sec = parseInt(timerInput.value || 25) * 60;  // Seconds remaining
let timerId = null;  // Interval ID when running
```

**Function: fmt()**
- Converts `sec` to "MM:SS" format with leading zeros
- Updates `#timer` display

**Event Handlers**

| Event | Behavior |
|---|---|
| `timerInput.onchange` | Validate input (1–180 min), update `sec` if timer not running |
| `#start.onclick` | Start countdown: `setInterval()` decrements sec every 1 second, calls `fmt()` |
| `#pause.onclick` | Pause: `clearInterval()`, retain current `sec` value |
| `#reset.onclick` | Reset: `clearInterval()`, set `sec` to input value × 60, call `fmt()` |

**State Machine**
```
Stopped  --[Start]--> Running (countdown)
Running  --[Pause]--> Paused (value retained)
Any      --[Reset]--> Stopped at input time
Running @ 00:00  --[auto] --> Stopped + alert("Time's up!")
```

### 4. Theme Toggle Module

**Function: applyTheme(theme)**
- Sets `document.documentElement.setAttribute('data-theme', theme)`
- Updates button text: '🌙' (light) or '☀️' (dark)
- Saves preference to `localStorage.theme`

**Event Handler**
- `#theme-toggle.onclick`: Toggles between 'light' and 'dark'

### 5. Quick Links Module

**Data Structure**
```js
let links = get('links', [
  {name: 'Google', url: 'https://google.com'},
  {name: 'Gmail', url: 'https://gmail.com'},
  {name: 'Calendar', url: 'https://calendar.google.com'}
]);
```

**Function: drawLinks()**
- Clears `#links` container
- For each link in array:
  - Creates `<div class="link-item">`
  - Adds `<a>` with `target="_blank"`, `rel="noopener noreferrer"`
  - Adds delete button (×) with onclick handler to remove link, save, and re-render

**Event Handlers**
- `#link-form.onsubmit`:
  - Validate inputs (trim both name and URL, reject if empty)
  - Create link object: `{name, url}`
  - Push to `links` array
  - Call `set('links', links)`
  - Call `drawLinks()`
  - Clear input fields

### 6. Task Manager Module

**Data Structure**
```js
let todos = get('todos', []);

// Task object: { id, text, completed }
// ID generated as unique string (Date.now() or crypto.randomUUID())
```

**Function: renderTodos()**
- Clears `#todos` list
- For each task in array:
  - Creates `<li data-id="{id}" class="task-item">` (add class `completed` if task.completed)
  - Checkbox (checked state reflects task.completed)
  - Span with task text
  - Edit button (✏️)
  - Delete button (🗑️)
- Show/hide empty state message

**Event Handlers & Functions**

| Handler | Behavior |
|---|---|
| Checkbox.onclick | Call `toggleTodo(id)` |
| Edit button.onclick | Call `startEdit(id)` |
| Delete button.onclick | Call `deleteTodo(id)` |
| `#todo-form.onsubmit` | Call `addTodo(input value)`, clear input |

**Function: addTodo(text)**
- Trim input, reject if empty
- Create task: `{id: unique ID, text, completed: false}`
- Push to `todos` array
- Call `set('todos', todos)` + `renderTodos()`

**Function: toggleTodo(id)**
- Find task, flip `completed` boolean
- Call `set('todos', todos)` + `renderTodos()`

**Function: deleteTodo(id)**
- Remove task from array
- Call `set('todos', todos)` + `renderTodos()`

**Function: startEdit(id)**
- Find task element in DOM
- Replace `.task-text` span with `<input>` pre-filled with current text
- Attach keydown handlers:
  - Enter: `saveEdit(id, input.value)`
  - Escape: `renderTodos()` (cancel without saving)

**Function: saveEdit(id, newText)**
- Trim, reject if empty
- Find task, update text
- Call `set('todos', todos)` + `renderTodos()`

---

## Local Storage Schema

| Key | Type | Example |
|---|---|---|
| `todos` | JSON Array | `[{"id":"123","text":"Buy milk","completed":false}]` |
| `links` | JSON Array | `[{"name":"Google","url":"https://google.com"}]` |
| `theme` | String | `"light"` or `"dark"` |

---

## Error Handling

- **Storage read error**: `get()` returns fallback (empty array), no crash
- **Storage write error**: `set()` silently catches exception, data lost for that operation
- **Quota exceeded**: Same as write error, silently caught
- **Invalid timer input**: Clamped to 1–180 minutes
- **Empty form inputs**: Validation prevents submission, user sees validation feedback

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- All modern browsers with ES6+ and `localStorage` support
- No polyfills required

---

## Performance Targets

- Page load: < 2 seconds
- Clock update: Every 1 second (smooth, no jank)
- Timer update: Every 1 second, accurate countdown
- DOM update latency: < 100ms for user interactions
- Theme toggle: Instant (CSS-only switch via data attribute)
