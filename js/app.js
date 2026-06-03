document.addEventListener('DOMContentLoaded', () => {
            
    // ----------------------------------------------------
    // State Manajemen Aplikasi
    // ----------------------------------------------------
    const state = {
        todos: [],
        links: [],
        editingTodoId: null,
        theme: 'dark',
        timer: {
            timeLeft: 1500,     // Sisa waktu default (detik)
            duration: 1500,     // Durasi awal preset (detik)
            intervalId: null,
            isRunning: false
        }
    };

    // ----------------------------------------------------
    // Selektor Elemen DOM
    // ----------------------------------------------------
    const greetingEl = document.getElementById('greeting');
    const dateDisplayEl = document.getElementById('date-display');
    const clockEl = document.getElementById('clock');
    const themeToggleBtn = document.getElementById('theme-toggle');

    const timerDisplay = document.getElementById('timer-display');
    const timerProgress = document.getElementById('timer-progress');
    const timerStartPauseBtn = document.getElementById('timer-start-pause');
    const timerResetBtn = document.getElementById('timer-reset');
    const presetWorkBtn = document.getElementById('preset-work');
    const presetBreakBtn = document.getElementById('preset-break');

    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const todoEmpty = document.getElementById('todo-empty');

    const quickLinksGrid = document.getElementById('quick-links-grid');
    const linkModal = document.getElementById('link-modal');
    const linkForm = document.getElementById('link-form');
    const linkNameInput = document.getElementById('link-name');
    const linkUrlInput = document.getElementById('link-url');
    const btnOpenLinkModal = document.getElementById('btn-open-link-modal');
    const btnCloseLinkModal = document.getElementById('btn-close-link-modal');
    const btnCancelLink = document.getElementById('btn-cancel-link');

    // ----------------------------------------------------
    // Engine Tema (Dark/Light Mode)
    // ----------------------------------------------------
    function initTheme() {
        const storedTheme = localStorage.getItem('theme_preference') || 'dark';
        setTheme(storedTheme);
    }

    function setTheme(theme) {
        state.theme = theme;
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme_preference', theme);
    }

    themeToggleBtn.addEventListener('click', () => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
    });

    // ----------------------------------------------------
    // Modul Jam & Ucapan Dinamis
    // ----------------------------------------------------
    function updateTime() {
        const now = new Date();
        
        // Format jam 24 jam dengan penambahan nol di depan
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockEl.textContent = `${hours}:${minutes}:${seconds}`;

        // Ucapan dinamis berdasarkan jam
        const hourNum = now.getHours();
        let greetText = "Welcome";
        if (hourNum >= 5 && hourNum < 12) {
            greetText = "Good morning";
        } else if (hourNum >= 12 && hourNum < 17) {
            greetText = "Good afternoon";
        } else if (hourNum >= 17 && hourNum < 22) {
            greetText = "Good evening";
        } else {
            greetText = "Good night";
        }
        greetingEl.textContent = greetText;

        // Tampilan kalender ramah pengguna
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplayEl.textContent = now.toLocaleDateString(undefined, options);
    }
    setInterval(updateTime, 1000);
    updateTime();

    // ----------------------------------------------------
    // Efek Suara Timer Sederhana (Web Audio API)
    // ----------------------------------------------------
    function triggerTimerBeep() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.6);
        } catch (e) {
            // Mengatasi pembatasan autoplay browser dengan aman
        }
    }

    // ----------------------------------------------------
    // Modul Focus Timer (Pomodoro Engine)
    // ----------------------------------------------------
    function renderTimer() {
        const mins = String(Math.floor(state.timer.timeLeft / 60)).padStart(2, '0');
        const secs = String(state.timer.timeLeft % 60).padStart(2, '0');
        timerDisplay.textContent = `${mins}:${secs}`;

        // Hitung progres bar visual
        const percentage = (state.timer.timeLeft / state.timer.duration) * 100;
        timerProgress.style.width = `${percentage}%`;

        // Ubah keadaan tombol play/pause
        if (state.timer.isRunning) {
            timerStartPauseBtn.innerHTML = `
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                <span>Pause</span>
            `;
            timerStartPauseBtn.className = "flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white";
        } else {
            timerStartPauseBtn.innerHTML = `
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                <span>Start</span>
            `;
            timerStartPauseBtn.className = "flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white dark:bg-indigo-500 dark:hover:bg-indigo-400";
        }
    }

    function stepTimer() {
        if (state.timer.timeLeft > 0) {
            state.timer.timeLeft--;
            renderTimer();
        } else {
            // Menghentikan timer ketika selesai
            clearInterval(state.timer.intervalId);
            state.timer.intervalId = null;
            state.timer.isRunning = false;
            triggerTimerBeep();
            alert("Focus session complete!");
            resetTimer();
        }
    }

    function startPauseTimer() {
        if (state.timer.isRunning) {
            // Aksi Jeda
            clearInterval(state.timer.intervalId);
            state.timer.intervalId = null;
            state.timer.isRunning = false;
        } else {
            // Aksi Mulai
            state.timer.isRunning = true;
            state.timer.intervalId = setInterval(stepTimer, 1000);
        }
        renderTimer();
    }

    function resetTimer() {
        clearInterval(state.timer.intervalId);
        state.timer.intervalId = null;
        state.timer.isRunning = false;
        state.timer.timeLeft = state.timer.duration;
        renderTimer();
    }

    function changePreset(seconds, isBreak) {
        state.timer.duration = seconds;
        state.timer.timeLeft = seconds;
        
        // Ubah gaya aktif tombol preset secara dinamis
        if (isBreak) {
            presetBreakBtn.className = "px-2.5 py-1 text-xs rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors";
            presetWorkBtn.className = "px-2.5 py-1 text-xs rounded-md bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors";
        } else {
            presetWorkBtn.className = "px-2.5 py-1 text-xs rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors";
            presetBreakBtn.className = "px-2.5 py-1 text-xs rounded-md bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors";
        }
        resetTimer();
    }

    timerStartPauseBtn.addEventListener('click', startPauseTimer);
    timerResetBtn.addEventListener('click', resetTimer);
    presetWorkBtn.addEventListener('click', () => changePreset(1500, false));
    presetBreakBtn.addEventListener('click', () => changePreset(300, true));

    // Render awal keadaan timer
    renderTimer();

    // ----------------------------------------------------
    // Modul To-Do List
    // ----------------------------------------------------
    function saveTodos() {
        localStorage.setItem('personal_dashboard_todos', JSON.stringify(state.todos));
    }

    function loadTodos() {
        const raw = localStorage.getItem('personal_dashboard_todos');
        state.todos = raw ? JSON.parse(raw) : [];
        renderTodos();
    }

    function renderTodos() {
        todoList.innerHTML = '';
        
        if (state.todos.length === 0) {
            todoEmpty.classList.remove('hidden');
        } else {
            todoEmpty.classList.add('hidden');
            
            state.todos.forEach(todo => {
                const li = document.createElement('li');
                li.className = "fade-in flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all gap-3";

                const isEditing = state.editingTodoId === todo.id;

                const checkContainer = document.createElement('div');
                checkContainer.className = "flex items-center gap-3 flex-1 min-w-0";

                if (!isEditing) {
                    // Mode Tampilan Normal
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = todo.completed;
                    checkbox.className = "w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-indigo-500 cursor-pointer";
                    checkbox.addEventListener('change', () => toggleTodo(todo.id));

                    const textSpan = document.createElement('span');
                    textSpan.textContent = todo.text;
                    if (todo.completed) {
                        textSpan.className = "text-sm text-slate-400 dark:text-slate-500 line-through truncate";
                    } else {
                        textSpan.className = "text-sm text-slate-700 dark:text-slate-200 truncate";
                    }

                    checkContainer.appendChild(checkbox);
                    checkContainer.appendChild(textSpan);

                    const actionContainer = document.createElement('div');
                    actionContainer.className = "flex items-center gap-1 shrink-0";

                    // Tombol Edit
                    const editBtn = document.createElement('button');
                    editBtn.className = "p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors";
                    editBtn.innerHTML = `
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    `;
                    editBtn.addEventListener('click', () => {
                        state.editingTodoId = todo.id;
                        renderTodos();
                    });

                    // Tombol Hapus
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = "p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors";
                    deleteBtn.innerHTML = `
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    `;
                    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

                    actionContainer.appendChild(editBtn);
                    actionContainer.appendChild(deleteBtn);

                    li.appendChild(checkContainer);
                    li.appendChild(actionContainer);
                } else {
                    // Mode Edit Form Inline
                    const editInput = document.createElement('input');
                    editInput.type = 'text';
                    editInput.value = todo.text;
                    editInput.className = "flex-1 px-3 py-1 text-sm bg-white dark:bg-slate-950 border border-indigo-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500";
                    editInput.autofocus = true;

                    const saveBtn = document.createElement('button');
                    saveBtn.className = "p-1.5 text-green-600 dark:text-green-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors";
                    saveBtn.innerHTML = `
                        <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    `;
                    
                    const cancelBtn = document.createElement('button');
                    cancelBtn.className = "p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors";
                    cancelBtn.innerHTML = `
                        <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    `;

                    function saveChanges() {
                        const newText = editInput.value.trim();
                        if (newText) {
                            todo.text = newText;
                            saveTodos();
                        }
                        state.editingTodoId = null;
                        renderTodos();
                    }

                    editInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') saveChanges();
                        if (e.key === 'Escape') {
                            state.editingTodoId = null;
                            renderTodos();
                        }
                    });

                    saveBtn.addEventListener('click', saveChanges);
                    cancelBtn.addEventListener('click', () => {
                        state.editingTodoId = null;
                        renderTodos();
                    });

                    checkContainer.appendChild(editInput);
                    
                    const actionContainer = document.createElement('div');
                    actionContainer.className = "flex items-center gap-1 shrink-0";
                    actionContainer.appendChild(saveBtn);
                    actionContainer.appendChild(cancelBtn);

                    li.appendChild(checkContainer);
                    li.appendChild(actionContainer);
                    
                    setTimeout(() => editInput.focus(), 0);
                }

                todoList.appendChild(li);
            });
        }
    }

    function addTodo(e) {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (!text) return;

        state.todos.push({
            id: Date.now().toString(),
            text,
            completed: false
        });

        todoInput.value = '';
        saveTodos();
        renderTodos();
    }

    function toggleTodo(id) {
        state.todos = state.todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        saveTodos();
        renderTodos();
    }

    function deleteTodo(id) {
        state.todos = state.todos.filter(todo => todo.id !== id);
        if (state.editingTodoId === id) {
            state.editingTodoId = null;
        }
        saveTodos();
        renderTodos();
    }

    todoForm.addEventListener('submit', addTodo);
    loadTodos();

    // ----------------------------------------------------
    // Modul Quick Links
    // ----------------------------------------------------
    function getCleanDomainInitials(name) {
        const cleaned = name.trim().split(/\s+/);
        if (cleaned.length >= 2) {
            return (cleaned[0][0] + cleaned[1][0]).toUpperCase();
        }
        return cleaned[0] ? cleaned[0].substring(0, 2).toUpperCase() : '?';
    }

    function formatUrl(url) {
        let target = url.trim();
        if (!/^https?:\/\//i.test(target)) {
            target = 'https://' + target;
        }
        return target;
    }

    function saveLinks() {
        localStorage.setItem('personal_dashboard_links', JSON.stringify(state.links));
    }

    function renderLinks() {
        quickLinksGrid.innerHTML = '';
        state.links.forEach(link => {
            const cleanInitials = getCleanDomainInitials(link.name);
            
            const container = document.createElement('div');
            container.className = "group relative flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 rounded-xl transition-all hover:scale-[1.01] hover:shadow-sm";

            const anchor = document.createElement('a');
            anchor.href = link.url;
            anchor.target = "_blank";
            anchor.rel = "noopener noreferrer";
            anchor.className = "flex items-center gap-3 w-full mr-6 min-w-0";

            const avatar = document.createElement('div');
            avatar.className = "w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 tracking-wider";
            avatar.textContent = cleanInitials;

            const textWrap = document.createElement('div');
            textWrap.className = "truncate";
            
            const nameSpan = document.createElement('span');
            nameSpan.className = "block text-sm font-semibold truncate text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors";
            nameSpan.textContent = link.name;

            const urlSpan = document.createElement('span');
            urlSpan.className = "block text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5";
            urlSpan.textContent = link.url.replace(/^https?:\/\/(www\.)?/, '');

            textWrap.appendChild(nameSpan);
            textWrap.appendChild(urlSpan);
            anchor.appendChild(avatar);
            anchor.appendChild(textWrap);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = "absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all opacity-100 md:opacity-0 group-hover:opacity-100";
            deleteBtn.innerHTML = `
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            `;
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteLink(link.id);
            });

            container.appendChild(anchor);
            container.appendChild(deleteBtn);
            quickLinksGrid.appendChild(container);
        });
    }

    function loadLinks() {
        const raw = localStorage.getItem('personal_dashboard_links');
        if (raw) {
            state.links = JSON.parse(raw);
        } else {
            // Data default jika penyimpanan lokal kosong
            state.links = [
                { id: 'g1', name: 'Google', url: 'https://google.com' },
                { id: 'g2', name: 'GitHub', url: 'https://github.com' },
                { id: 'g3', name: 'YouTube', url: 'https://youtube.com' }
            ];
            saveLinks();
        }
        renderLinks();
    }

    function deleteLink(id) {
        state.links = state.links.filter(l => l.id !== id);
        saveLinks();
        renderLinks();
    }

    // ----------------------------------------------------
    // Kontrol Modal Box
    // ----------------------------------------------------
    function openModal() {
        linkModal.classList.remove('hidden');
        setTimeout(() => {
            linkModal.classList.add('opacity-100');
            linkModal.firstElementChild.classList.remove('scale-95');
        }, 10);
        linkNameInput.focus();
    }

    function closeModal() {
        linkModal.classList.remove('opacity-100');
        linkModal.firstElementChild.classList.add('scale-95');
        setTimeout(() => {
            linkModal.classList.add('hidden');
            linkNameInput.value = '';
            linkUrlInput.value = '';
        }, 300);
    }

    btnOpenLinkModal.addEventListener('click', openModal);
    btnCloseLinkModal.addEventListener('click', closeModal);
    btnCancelLink.addEventListener('click', closeModal);
    
    linkModal.addEventListener('click', (e) => {
        if (e.target === linkModal) closeModal();
    });

    linkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = linkNameInput.value.trim();
        const url = formatUrl(linkUrlInput.value);

        if (name && url) {
            state.links.push({
                id: Date.now().toString(),
                name,
                url
            });
            saveLinks();
            renderLinks();
            closeModal();
        }
    });

    loadLinks();

    // Inisialisasi tema
    initTheme();
});