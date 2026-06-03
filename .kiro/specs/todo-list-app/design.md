# To-Do List Web Application — Technical Design
## Overview

A single-page, client-side web application built with vanilla HTML, CSS, and JavaScript. All data is persisted in the browser's Local Storage. There is no build step, no framework, and no backend. The app is opened directly as an HTML file or served from a static host.

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

## HTML Structure (`index.html`)

The page is divided into four main sections laid out vertically inside a centered container:

```
<body>
  <div class="container">
    <!-- Section 1: Greeting & Clock -->
    <section id="greeting-section">
      <p id="greeting-text">Good Morning</p>
      <p id="current-time">9:30 AM</p>
      <p id="current-date">Monday, January 15, 2024</p>
    </section>

    <!-- Section 2: Focus Timer -->
    <section id="timer-section">
      <div id="timer-display">25:00</div>
      <div class="timer-controls">
        <button id="btn-start">Start</button>
        <button id="btn-stop">Stop</button>
        <button id="btn-reset">Reset</button>
      </div>
    </section>

    <!-- Section 3: To-Do List -->
    <section id="todo-section">
      <h2>To-Do List</h2>
      <div class="task-input-row">
        <input type="text" id="task-input" placeholder="Add a new task..." />
        <button id="btn-add-task">Add</button>
      </div>
      <ul id="task-list">
        <!-- Task items injected here by JS -->
      </ul>
      <p id="task-empty-state" class="empty-state">No tasks yet. Add one to get started!</p>
    </section>

    <!-- Section 4: Quick Links -->
    <section id="links-section">
      <h2>Quick Links</h2>
      <div class="link-input-row">
        <input type="text" id="link-name-input" placeholder="Label (e.g. GitHub)" />
        <input type="url"  id="link-url-input"  placeholder="URL (e.g. https://github.com)" />
        <button id="btn-add-link">Add</button>
      </div>
      <div id="links-list">
        <!-- Link buttons injected here by JS -->
      </div>
      <p id="links-empty-state" class="empty-state">No quick links yet. Add your favorites!</p>
    </section>
  </div>
</body>
```

---

## CSS Design (`css/style.css`)

### Layout & Theme

- CSS custom properties (variables) for the color palette, spacing, and typography.
- Single-column centered layout using `max-width: 680px; margin: 0 auto;`.
- Sections separated by visible card containers (`background`, `border-radius`, `box-shadow`).

### Color Palette (variables)

```css
:root {
  --color-bg:         #f0f2f5;
  --color-surface:    #ffffff;
  --color-primary:    #4f46e5;   /* indigo — buttons, accents */
  --color-danger:     #ef4444;   /* red — delete actions */
  --color-text:       #1e1e2e;
  --color-muted:      #6b7280;
  --color-border:     #e5e7eb;
  --radius:           12px;
  --shadow:           0 2px 8px rgba(0,0,0,0.08);
}
```

### Typography

- Base font: system UI stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`).
- Greeting: `2rem`, bold.
- Timer display: `4rem`, monospace, bold.
- Section headings: `1.1rem`, semi-bold.
- Body / task text: `1rem`.

### Component Styles

| Component | Key rules |
|---|---|
| `.container` | `max-width: 680px`, centered, vertical padding |
| `section` | `background: var(--color-surface)`, `border-radius`, `box-shadow`, `margin-bottom` |
| `#timer-display` | Large monospace font, changes color (`--color-primary`) when running |
| `.timer-controls button` | Pill-shaped, distinct colors per action |
| `#task-list li` | Flex row: checkbox + text + edit/delete icons |
| `li.completed .task-text` | `text-decoration: line-through; color: var(--color-muted)` |
| `li.editing .task-text` | Hidden; inline `<input>` shown instead |
| `.quick-link-btn` | Rounded pill button, `background: var(--color-primary)`, opens in new tab |
| `.empty-state` | Centered, muted color, italic |
| `.error-banner` | Red background banner for Local Storage errors |

---

## JavaScript Architecture (`js/app.js`)

The file is organized into five logical sections with clear comment headers:

```
1. Constants & State
2. Local Storage Helpers
3. Greeting & Clock Module
4. Timer Module
5. Task Manager Module
6. Quick Link Manager Module
7. Initialization
```

### 1. Constants & State

```js
const STORAGE_KEYS = {
  TASKS: 'todoapp_tasks',
  LINKS: 'todoapp_links',
};

// Runtime state
const state = {
  tasks: [],      // Array of Task objects
  links: [],      // Array of QuickLink objects
  timer: {
    totalSeconds: 25 * 60,   // 1500
    remaining:   25 * 60,
    intervalId:  null,
    isRunning:   false,
  },
};
```

### 2. Data Models

**Task object**
```js
{
  id:        string,   // crypto.randomUUID() or Date.now().toString()
  text:      string,
  completed: boolean,
  createdAt: number,   // timestamp
}
```

**QuickLink object**
```js
{
  id:    string,
  name:  string,
  url:   string,
}
```

### 3. Local Storage Helpers

```js
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    showStorageError();
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    showStorageError();
  }
}
```

### 4. Greeting & Clock Module

**Functions**

| Function | Responsibility |
|---|---|
| `getGreeting(hour)` | Returns `"Good Morning"` / `"Good Afternoon"` / `"Good Evening"` based on hour (0–23) |
| `formatTime(date)` | Returns `"9:30 AM"` style string |
| `formatDate(date)` | Returns `"Monday, January 15, 2024"` style string |
| `updateClock()` | Called every 60 seconds via `setInterval`; updates DOM elements `#greeting-text`, `#current-time`, `#current-date` |
| `initClock()` | Calls `updateClock()` immediately, then schedules 60-second interval |

**Time-of-day logic**
```
hour  5–11  → "Good Morning"
hour 12–17  → "Good Afternoon"
hour 18–23 or 0–4 → "Good Evening"
```

### 5. Timer Module

**Functions**

| Function | Responsibility |
|---|---|
| `renderTimer()` | Updates `#timer-display` with `MM:SS` from `state.timer.remaining`; toggles `--running` CSS class |
| `timerTick()` | Decrements `state.timer.remaining`; calls `renderTimer()`; stops at 0 |
| `startTimer()` | Sets `state.timer.isRunning = true`; starts `setInterval(timerTick, 1000)`; updates button visibility |
| `stopTimer()` | Clears interval; sets `isRunning = false`; updates button visibility |
| `resetTimer()` | Calls `stopTimer()`; resets `remaining` to 1500; calls `renderTimer()` |
| `updateTimerButtons()` | Shows/hides Start and Stop buttons based on `isRunning` |
| `formatCountdown(seconds)` | Converts seconds to `"MM:SS"` string with leading zeros |
| `initTimer()` | Renders initial state; attaches click listeners to `#btn-start`, `#btn-stop`, `#btn-reset` |

**State transitions**
```
Stopped  --[Start click]--> Running
Running  --[Stop click] --> Paused (stopped at current value)
Paused   --[Start click]--> Running (resumes from paused value)
Any      --[Reset click]--> Stopped at 25:00
Running  --[reaches 0]  --> Stopped at 00:00
```

### 6. Task Manager Module

**Functions**

| Function | Responsibility |
|---|---|
| `loadTasks()` | Reads `state.tasks` from Local Storage |
| `saveTasks()` | Writes `state.tasks` to Local Storage |
| `renderTasks()` | Clears `#task-list`, renders each task as `<li>`; shows/hides empty state |
| `createTaskElement(task)` | Returns a fully formed `<li>` DOM node for a task |
| `addTask(text)` | Validates input; pushes new Task to `state.tasks`; calls `saveTasks()` + `renderTasks()` |
| `deleteTask(id)` | Filters task out of `state.tasks`; calls `saveTasks()` + `renderTasks()` |
| `toggleTask(id)` | Flips `completed`; calls `saveTasks()` + `renderTasks()` |
| `startEditTask(id)` | Replaces task text span with an inline `<input>` pre-filled with current text |
| `saveEditTask(id, newText)` | Validates; updates text in `state.tasks`; calls `saveTasks()` + `renderTasks()` |
| `cancelEditTask()` | Re-renders without saving |
| `initTasks()` | Loads tasks; renders; attaches listener to `#btn-add-task` and `#task-input` (keydown Enter) |

**Task list item HTML structure**
```html
<li data-id="{id}" class="task-item [completed] [editing]">
  <input type="checkbox" class="task-checkbox" [checked] />
  <span class="task-text">{text}</span>
  <!-- in edit mode, span is replaced with: -->
  <!-- <input class="task-edit-input" value="{text}" /> -->
  <div class="task-actions">
    <button class="btn-edit">✏️</button>
    <button class="btn-delete">🗑️</button>
  </div>
</li>
```

**Inline editing flow**
1. User clicks ✏️ → `startEditTask(id)` replaces `.task-text` span with `<input>`.
2. User presses Enter or clicks a Save button → `saveEditTask(id, input.value)`.
3. User presses Escape → `cancelEditTask()` re-renders the list unchanged.

### 7. Quick Link Manager Module

**Functions**

| Function | Responsibility |
|---|---|
| `loadLinks()` | Reads `state.links` from Local Storage |
| `saveLinks()` | Writes `state.links` to Local Storage |
| `renderLinks()` | Clears `#links-list`; renders each link as a button + delete icon; shows/hides empty state |
| `addLink(name, url)` | Validates inputs; pushes new QuickLink; calls `saveLinks()` + `renderLinks()` |
| `deleteLink(id)` | Filters link out; calls `saveLinks()` + `renderLinks()` |
| `initLinks()` | Loads links; renders; attaches listener to `#btn-add-link` |

**Quick link item HTML structure**
```html
<div class="link-item" data-id="{id}">
  <a href="{url}" target="_blank" rel="noopener noreferrer" class="quick-link-btn">{name}</a>
  <button class="btn-delete-link">✕</button>
</div>
```

### 8. Validation

Both `addTask` and `addLink` trim their inputs before checking. If empty:
- An inline validation message (`<p class="validation-msg">`) is appended below the input row.
- The message is removed on the next valid submission or on input focus.

### 9. Initialization

```js
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initTimer();
  initTasks();
  initLinks();
});
```

---

## Local Storage Schema

| Key | Type | Example value |
|---|---|---|
| `todoapp_tasks` | JSON Array of Task | `[{"id":"abc","text":"Buy milk","completed":false,"createdAt":1700000000000}]` |
| `todoapp_links` | JSON Array of QuickLink | `[{"id":"xyz","name":"GitHub","url":"https://github.com"}]` |

---

## Error Handling

- `loadFromStorage` wraps `JSON.parse` in try/catch. On failure, returns the fallback value and shows a dismissable error banner at the top of the page.
- `saveToStorage` wraps `localStorage.setItem` in try/catch (handles quota exceeded). Shows the same error banner.
- Error banner HTML: `<div id="storage-error-banner" class="error-banner hidden">⚠️ Could not access Local Storage. Data may not be saved.</div>`

---

## Requirement Traceability

| Requirement | Covered by |
|---|---|
| R1 – Time & Date display | `updateClock`, `formatTime`, `formatDate` |
| R2 – Time-based greeting | `getGreeting` |
| R3 – Create tasks | `addTask`, `#btn-add-task`, Enter keydown |
| R4 – Edit tasks | `startEditTask`, `saveEditTask`, `cancelEditTask` |
| R5 – Mark complete | `toggleTask`, checkbox, `.completed` CSS class |
| R6 – Delete tasks | `deleteTask`, `.btn-delete` |
| R7 – Persist tasks | `loadTasks`, `saveTasks`, `todoapp_tasks` key |
| R8 – Timer display | `renderTimer`, `formatCountdown` |
| R9 – Timer start | `startTimer`, `#btn-start` |
| R10 – Timer stop | `stopTimer`, `#btn-stop` |
| R11 – Timer reset | `resetTimer`, `#btn-reset` |
| R12 – Add quick links | `addLink`, `#btn-add-link` |
| R13 – Delete quick links | `deleteLink`, `.btn-delete-link` |
| R14 – Persist quick links | `loadLinks`, `saveLinks`, `todoapp_links` key |
| R15 – Responsive UI | CSS flexbox/grid, immediate DOM updates |
| R16 – Browser compatibility | Standard HTML5/CSS3/ES6+, no polyfills |
| R17 – Visual design | CSS variables, card layout, WCAG-compliant contrast |
| R18 – Code organization | Single CSS + single JS file, descriptive naming |
| R19 – Initial load state | `initClock`, `initTimer`, `initTasks`, `initLinks` in `DOMContentLoaded` |
