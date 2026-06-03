// ===================================
// 1. Constants & State
// ===================================

const STORAGE_KEYS = {
  TASKS: 'todoapp_tasks',
  LINKS: 'todoapp_links',
};

const state = {
  tasks: [],
  links: [],
  timer: {
    totalSeconds: 25 * 60,
    remaining:    25 * 60,
    intervalId:   null,
    isRunning:    false,
  },
};

// ===================================
// 2. Local Storage Helpers
// ===================================

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

function showStorageError() {
  const banner = document.getElementById('storage-error-banner');
  if (banner) banner.classList.remove('hidden');
}

// ===================================
// 3. Greeting & Clock Module
// ===================================

function getGreeting(hour) {
  if (hour >= 5 && hour <= 11) return 'Good Morning';
  if (hour >= 12 && hour <= 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

function updateClock() {
  const now = new Date();
  document.getElementById('greeting-text').textContent = getGreeting(now.getHours());
  document.getElementById('current-time').textContent  = formatTime(now);
  document.getElementById('current-date').textContent  = formatDate(now);
}

function initClock() {
  updateClock();
  setInterval(updateClock, 60 * 1000);
}

// ===================================
// 4. Timer Module
// ===================================

function formatCountdown(seconds) {
  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

function renderTimer() {
  const display = document.getElementById('timer-display');
  display.textContent = formatCountdown(state.timer.remaining);
  if (state.timer.isRunning) {
    display.classList.add('running');
  } else {
    display.classList.remove('running');
  }
}

function timerTick() {
  if (state.timer.remaining <= 0) {
    stopTimer();
    return;
  }
  state.timer.remaining--;
  renderTimer();
}

function updateTimerButtons() {
  const btnStart = document.getElementById('btn-start');
  const btnStop  = document.getElementById('btn-stop');
  if (state.timer.isRunning) {
    btnStart.style.display = 'none';
    btnStop.style.display  = '';
  } else {
    btnStart.style.display = '';
    btnStop.style.display  = 'none';
  }
}

function startTimer() {
  if (state.timer.isRunning) return;
  if (state.timer.remaining <= 0) return;
  state.timer.isRunning = true;
  state.timer.intervalId = setInterval(timerTick, 1000);
  updateTimerButtons();
  renderTimer();
}

function stopTimer() {
  clearInterval(state.timer.intervalId);
  state.timer.intervalId = null;
  state.timer.isRunning  = false;
  updateTimerButtons();
  renderTimer();
}

function resetTimer() {
  stopTimer();
  state.timer.remaining = state.timer.totalSeconds;
  renderTimer();
}

function initTimer() {
  renderTimer();
  updateTimerButtons();
  document.getElementById('btn-start').addEventListener('click', startTimer);
  document.getElementById('btn-stop').addEventListener('click', stopTimer);
  document.getElementById('btn-reset').addEventListener('click', resetTimer);
}

// ===================================
// 5. Task Manager Module
// ===================================

function loadTasks() {
  state.tasks = loadFromStorage(STORAGE_KEYS.TASKS, []);
}

function saveTasks() {
  saveToStorage(STORAGE_KEYS.TASKS, state.tasks);
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.completed ? ' completed' : '');
  li.dataset.id = task.id;

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.setAttribute('aria-label', 'Mark task complete');
  checkbox.addEventListener('change', () => toggleTask(task.id));

  // Text span
  const span = document.createElement('span');
  span.className = 'task-text';
  span.textContent = task.text;

  // Actions container
  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn-icon';
  editBtn.textContent = '✏️';
  editBtn.setAttribute('aria-label', 'Edit task');
  editBtn.addEventListener('click', () => startEditTask(task.id));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-icon';
  deleteBtn.textContent = '🗑️';
  deleteBtn.setAttribute('aria-label', 'Delete task');
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(actions);

  return li;
}

function renderTasks() {
  const list  = document.getElementById('task-list');
  const empty = document.getElementById('task-empty-state');
  list.innerHTML = '';

  if (state.tasks.length === 0) {
    empty.classList.remove('hidden');
    empty.style.display = '';
  } else {
    empty.classList.add('hidden');
    empty.style.display = 'none';
    state.tasks.forEach(task => list.appendChild(createTaskElement(task)));
  }
}

function showValidation(id, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.hidden = false;
}

function clearValidation(id) {
  const el = document.getElementById(id);
  el.hidden = true;
  el.textContent = '';
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    showValidation('task-validation', 'Task cannot be empty.');
    return;
  }
  clearValidation('task-validation');

  const task = {
    id:        (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()),
    text:      trimmed,
    completed: false,
    createdAt: Date.now(),
  };

  state.tasks.push(task);
  saveTasks();
  renderTasks();

  document.getElementById('task-input').value = '';
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

function startEditTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;

  const li   = document.querySelector(`li[data-id="${id}"]`);
  const span = li.querySelector('.task-text');

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'task-edit-input';
  input.value = task.text;
  input.setAttribute('aria-label', 'Edit task text');

  span.replaceWith(input);
  input.focus();

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  saveEditTask(id, input.value);
    if (e.key === 'Escape') cancelEditTask();
  });
}

function saveEditTask(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) {
    showValidation('task-validation', 'Task text cannot be empty.');
    return;
  }
  clearValidation('task-validation');

  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.text = trimmed;
    saveTasks();
    renderTasks();
  }
}

function cancelEditTask() {
  renderTasks();
}

function initTasks() {
  loadTasks();
  renderTasks();

  const btnAdd  = document.getElementById('btn-add-task');
  const input   = document.getElementById('task-input');

  btnAdd.addEventListener('click', () => addTask(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask(input.value);
  });
  input.addEventListener('focus', () => clearValidation('task-validation'));
}

// ===================================
// 6. Quick Link Manager Module
// ===================================

function loadLinks() {
  state.links = loadFromStorage(STORAGE_KEYS.LINKS, []);
}

function saveLinks() {
  saveToStorage(STORAGE_KEYS.LINKS, state.links);
}

function renderLinks() {
  const container = document.getElementById('links-list');
  const empty     = document.getElementById('links-empty-state');
  container.innerHTML = '';

  if (state.links.length === 0) {
    empty.classList.remove('hidden');
    empty.style.display = '';
  } else {
    empty.classList.add('hidden');
    empty.style.display = 'none';

    state.links.forEach(link => {
      const item = document.createElement('div');
      item.className = 'link-item';
      item.dataset.id = link.id;

      const a = document.createElement('a');
      a.href    = link.url;
      a.target  = '_blank';
      a.rel     = 'noopener noreferrer';
      a.className = 'quick-link-btn';
      a.textContent = link.name;

      const del = document.createElement('button');
      del.className = 'btn-delete-link';
      del.textContent = '✕';
      del.setAttribute('aria-label', `Delete link ${link.name}`);
      del.addEventListener('click', () => deleteLink(link.id));

      item.appendChild(a);
      item.appendChild(del);
      container.appendChild(item);
    });
  }
}

function addLink(name, url) {
  const trimName = name.trim();
  const trimUrl  = url.trim();

  if (!trimName || !trimUrl) {
    showValidation('link-validation', 'Both a label and a URL are required.');
    return;
  }
  clearValidation('link-validation');

  const link = {
    id:   (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()),
    name: trimName,
    url:  trimUrl,
  };

  state.links.push(link);
  saveLinks();
  renderLinks();

  document.getElementById('link-name-input').value = '';
  document.getElementById('link-url-input').value  = '';
}

function deleteLink(id) {
  state.links = state.links.filter(l => l.id !== id);
  saveLinks();
  renderLinks();
}

function initLinks() {
  loadLinks();
  renderLinks();

  const btnAdd   = document.getElementById('btn-add-link');
  const nameInput = document.getElementById('link-name-input');
  const urlInput  = document.getElementById('link-url-input');

  btnAdd.addEventListener('click', () => addLink(nameInput.value, urlInput.value));
  [nameInput, urlInput].forEach(el => {
    el.addEventListener('focus', () => clearValidation('link-validation'));
  });
}

// ===================================
// 7. Initialization
// ===================================

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initTimer();
  initTasks();
  initLinks();
});
