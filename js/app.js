const get = (k, f) => {
    try {
        const val = localStorage.getItem(k);
        return val ? JSON.parse(val) : f;
    } catch (e) {
        return f;
    }
};

const set = (k, v) => {
    try {
        localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
};

function updateTime() {
    const now = new Date();
    const hr = now.getHours();
    
    const timeOptions = { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false };
    const dateOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    
    document.getElementById('clock').textContent = now.toLocaleTimeString(undefined, timeOptions);
    document.getElementById('datetime').textContent = now.toLocaleDateString('en-US', dateOptions);
    
    let greet = "Good Evening";
    if (hr >= 5 && hr < 12) greet = "Good Morning";
    else if (hr >= 12 && hr < 18) greet = "Good Afternoon";
    
    document.getElementById('greeting').textContent = greet;
}
setInterval(updateTime, 1000);
updateTime();

const timerInput = document.getElementById('timer-min');
let sec = parseInt(timerInput.value || 25) * 60, timerId = null;
const disp = document.getElementById('timer');

function fmt() {
    disp.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
}

timerInput.onchange = () => {
    let val = parseInt(timerInput.value);
    if (isNaN(val) || val < 1) val = 25;
    timerInput.value = val;
    if (!timerId) { sec = val * 60; fmt(); }
};

document.getElementById('start').onclick = () => {
    if (!timerId) {
        timerId = setInterval(() => {
            if (sec > 0) { sec--; fmt(); }
            else { clearInterval(timerId); timerId = null; alert("Time's up!"); }
        }, 1000);
    }
};
document.getElementById('pause').onclick = () => { clearInterval(timerId); timerId = null; };
document.getElementById('reset').onclick = () => { 
    clearInterval(timerId); 
    timerId = null; 
    sec = parseInt(timerInput.value || 25) * 60; 
    fmt(); 
};

const btnTheme = document.getElementById('theme-toggle');
const applyTheme = t => {
    document.documentElement.setAttribute('data-theme', t);
    btnTheme.textContent = t === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', t);
};
btnTheme.onclick = () => applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');

let links = get('links', [
    {name:'Google', url:'https://google.com'},
    {name:'Gmail', url:'https://gmail.com'},
    {name:'Calendar', url:'https://calendar.google.com'}
]);

const drawLinks = () => {
    const container = document.getElementById('links');
    container.innerHTML = '';
    links.forEach((l, idx) => {
        const div = document.createElement('div');
        div.className = 'link-item';

        const anchor = document.createElement('a');
        anchor.href = l.url;
        anchor.target = '_blank';
        anchor.textContent = l.name;

        const delBtn = document.createElement('button');
        delBtn.textContent = '×';
        delBtn.onclick = () => {
            links.splice(idx, 1);
            set('links', links);
            drawLinks();
        };

        div.appendChild(anchor);
        div.appendChild(delBtn);
        container.appendChild(div);
    });
};

document.getElementById('link-form').onsubmit = (e) => {
    e.preventDefault();
    let url = document.getElementById('link-url').value.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    links.push({ name: document.getElementById('link-name').value.trim(), url });
    set('links', links);
    drawLinks();
    e.target.reset();
};
drawLinks();

let todos = get('todos', [
    {text: 'belanja', done: false},
    {text: 'belajar', done: false}
]);

const drawTodos = () => {
    const list = document.getElementById('todos');
    list.innerHTML = '';
    todos.forEach((t, idx) => {
        const li = document.createElement('li');
        li.className = `todo-item ${t.done ? 'done' : ''}`;

        const todoLeft = document.createElement('div');
        todoLeft.className = 'todo-left';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = t.done;
        cb.onclick = () => {
            todos[idx].done = !todos[idx].done;
            set('todos', todos);
            drawTodos();
        };

        const span = document.createElement('span');
        span.textContent = t.text;

        todoLeft.appendChild(cb);
        todoLeft.appendChild(span);

        const todoRight = document.createElement('div');

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => {
            const val = prompt('Edit task:', todos[idx].text);
            if (val && val.trim()) {
                todos[idx].text = val.trim();
                set('todos', todos);
                drawTodos();
            }
        };

        const delBtn = document.createElement('button');
        delBtn.className = 'btn-del';
        delBtn.textContent = 'Delete';
        delBtn.onclick = () => {
            todos.splice(idx, 1);
            set('todos', todos);
            drawTodos();
        };

        todoRight.appendChild(editBtn);
        todoRight.appendChild(delBtn);

        li.appendChild(todoLeft);
        li.appendChild(todoRight);
        list.appendChild(li);
    });
};

document.getElementById('todo-form').onsubmit = e => {
    e.preventDefault();
    const input = document.getElementById('todo-input');
    todos.push({ text: input.value.trim(), done: false });
    set('todos', todos);
    drawTodos();
    input.value = '';
};
drawTodos();