// --- Pengaman Local Storage (Mencegah Error di Browser Tertentu) ---
let safeLocalStorage;
try {
    const testKey = '__test_storage__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    safeLocalStorage = localStorage;
} catch (e) {
    console.warn("Local storage tidak diizinkan oleh browser Anda. Menggunakan penyimpanan sementara di memori.");
    safeLocalStorage = {
        store: {},
        getItem(key) { return this.store[key] || null; },
        setItem(key, value) { this.store[key] = String(value); }
    };
}

// --- State Management ---
const STORAGE_KEYS = {
    TODOS: 'focus_dashboard_todos',
    LINKS: 'focus_dashboard_links',
    THEME: 'focus_dashboard_theme'
};

let state = {
    todos: JSON.parse(safeLocalStorage.getItem(STORAGE_KEYS.TODOS)) || [
        { id: 1, text: "Explore the Focus Dashboard layout", completed: false },
        { id: 2, text: "Try setting a 25-minute Pomodoro session", completed: false }
    ],
    links: JSON.parse(safeLocalStorage.getItem(STORAGE_KEYS.LINKS)) || [
        { id: 1, name: "Google", url: "https://google.com" },
        { id: 2, name: "GitHub", url: "https://github.com" },
        { id: 3, name: "Wikipedia", url: "https://wikipedia.org" }
    ],
    theme: safeLocalStorage.getItem(STORAGE_KEYS.THEME) || 'light'
};

// --- DOM Elements Cache ---
const greetingText = document.getElementById('greeting-text');
const dateText = document.getElementById('date-text');
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeLabel = document.getElementById('theme-text');

const timerDisplay = document.getElementById('timer-display');
const timerStartBtn = document.getElementById('timer-start');
const timerStopBtn = document.getElementById('timer-stop');
const timerResetBtn = document.getElementById('timer-reset');

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoListItems = document.getElementById('todo-list-items');

const linkForm = document.getElementById('link-form');
const linkNameInput = document.getElementById('link-name-input');
const linkUrlInput = document.getElementById('link-url-input');
const linksGrid = document.getElementById('links-grid');

// --- Greeting, Date, & Time Logic ---
function updateDateTime() {
    if (!greetingText || !dateText) return;
    
    const now = new Date();
    const hours = now.getHours();
    
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true };
    const formattedDate = now.toLocaleDateString(undefined, dateOptions);
    const formattedTime = now.toLocaleTimeString(undefined, timeOptions);
    
    dateText.textContent = `${formattedDate} • ${formattedTime}`;

    let greeting = "Good evening";
    if (hours >= 5 && hours < 12) {
        greeting = "Good morning";
    } else if (hours >= 12 && hours < 18) {
        greeting = "Good afternoon";
    }
    greetingText.textContent = `${greeting}, welcome to your space`;
}

setInterval(updateDateTime, 1000);
updateDateTime();


// --- Theme Toggle Logic ---
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon && themeLabel) {
        if (theme === 'dark') {
            themeIcon.textContent = '☀️';
            themeLabel.textContent = 'Light Mode';
        } else {
            themeIcon.textContent = '🌙';
            themeLabel.textContent = 'Dark Mode';
        }
    }
    safeLocalStorage.setItem(STORAGE_KEYS.THEME, theme);
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(state.theme);
    });
}
applyTheme(state.theme);


// --- Focus Timer Logic ---
let timerInterval = null;
const DEFAULT_SECONDS = 25 * 60;
let timerSecondsRemaining = DEFAULT_SECONDS;

function updateTimerUI() {
    if (!timerDisplay) return;
    const minutes = Math.floor(timerSecondsRemaining / 60);
    const seconds = timerSecondsRemaining % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function playTone() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(660, ctx.currentTime); 
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        }
    } catch (error) {
        console.log("Audio feedback blocked or unsupported by browser settings.");
    }
}

function startTimer() {
    if (timerInterval !== null) return;
    timerInterval = setInterval(() => {
        if (timerSecondsRemaining > 0) {
            timerSecondsRemaining--;
            updateTimerUI();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            playTone();
            alert("Focus session complete! Take a short break.");
            resetTimer();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    stopTimer();
    timerSecondsRemaining = DEFAULT_SECONDS;
    updateTimerUI();
}

if (timerStartBtn) timerStartBtn.addEventListener('click', startTimer);
if (timerStopBtn) timerStopBtn.addEventListener('click', stopTimer);
if (timerResetBtn) timerResetBtn.addEventListener('click', resetTimer);
updateTimerUI();


// --- To-Do List CRUD ---
function saveTodos() {
    safeLocalStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(state.todos));
}

function renderTodos() {
    if (!todoListItems) return;
    todoListItems.innerHTML = '';
    state.todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        
        const todoContent = document.createElement('div');
        todoContent.className = 'todo-item-content';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        const span = document.createElement('span');
        span.className = `todo-text ${todo.completed ? 'completed' : ''}`;
        span.textContent = todo.text;

        todoContent.appendChild(checkbox);
        todoContent.appendChild(span);

        const actions = document.createElement('div');
        actions.className = 'todo-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'todo-btn';
        editBtn.textContent = '✏️';
        editBtn.title = 'Edit Task';
        editBtn.addEventListener('click', () => editTodo(todo.id, span));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'todo-btn';
        deleteBtn.textContent = '🗑️';
        deleteBtn.title = 'Delete Task';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(todoContent);
        li.appendChild(actions);

        todoListItems.appendChild(li);
    });
}

function addTodo(e) {
    e.preventDefault();
    if (!todoInput) return;
    const text = todoInput.value.trim();
    if (!text) return;

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    state.todos.push(newTodo);
    saveTodos();
    renderTodos();
    todoInput.value = '';
}

function toggleTodo(id) {
    state.todos = state.todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
}

function editTodo(id, textSpan) {
    const currentText = textSpan.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.style.width = '100%';
    input.style.padding = '4px';

    const parent = textSpan.parentNode;
    parent.replaceChild(input, textSpan);
    input.focus();

    function saveChange() {
        const updatedText = input.value.trim();
        if (updatedText) {
            state.todos = state.todos.map(todo => 
                todo.id === id ? { ...todo, text: updatedText } : todo
            );
            saveTodos();
        }
        renderTodos();
    }

    input.addEventListener('blur', saveChange);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveChange();
    });
}

function deleteTodo(id) {
    state.todos = state.todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

if (todoForm) todoForm.addEventListener('submit', addTodo);
renderTodos();


// --- Quick Links CRUD ---
function saveLinks() {
    safeLocalStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(state.links));
}

function renderLinks() {
    if (!linksGrid) return;
    linksGrid.innerHTML = '';
    state.links.forEach(link => {
        const linkCard = document.createElement('div');
        linkCard.className = 'link-card';

        const anchor = document.createElement('a');
        anchor.className = 'link-anchor';
        anchor.href = link.url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = link.name;
        anchor.title = link.url;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-link-btn';
        deleteBtn.textContent = '×';
        deleteBtn.title = 'Remove link';
        deleteBtn.addEventListener('click', () => deleteLink(link.id));

        linkCard.appendChild(anchor);
        linkCard.appendChild(deleteBtn);
        linksGrid.appendChild(linkCard);
    });
}

function addLink(e) {
    e.preventDefault();
    if (!linkNameInput || !linkUrlInput) return;
    
    const name = linkNameInput.value.trim();
    let url = linkUrlInput.value.trim();

    if (!name || !url) return;

    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    const newLink = {
        id: Date.now(),
        name: name,
        url: url
    };

    state.links.push(newLink);
    saveLinks();
    renderLinks();

    linkNameInput.value = '';
    linkUrlInput.value = '';
}

function deleteLink(id) {
    state.links = state.links.filter(link => link.id !== id);
    saveLinks();
    renderLinks();
}

if (linkForm) linkForm.addEventListener('submit', addLink);
renderLinks();