// TaskFlow Web Client - Version 2

const API_BASE_URL = window.location.origin;
let currentUser = null;
let currentFilter = 'all';

// Check if user is already logged in
window.onload = function() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        showTaskSection();
        loadTasks();
    }
};

// Auth functions
function switchTab(tab) {
    document.getElementById('login-tab').classList.toggle('active', tab === 'login');
    document.getElementById('register-tab').classList.toggle('active', tab === 'register');
    document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

async function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }
        
        const data = await response.json();
        
        // Save token and user
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;
        
        showTaskSection();
        loadTasks();
    } catch (error) {
        errorDiv.textContent = error.message;
    }
}

async function handleRegister() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Registration failed');
        }
        
        const data = await response.json();
        
        // Auto login after register
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;
        
        showTaskSection();
        loadTasks();
    } catch (error) {
        errorDiv.textContent = error.message;
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    showAuthSection();
}

function showAuthSection() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('task-section').style.display = 'none';
}

function showTaskSection() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('task-section').style.display = 'block';
}

// Task functions
function getToken() {
    return localStorage.getItem('token');
}

async function createTask(title, description = '', priority = 0) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ title, description, priority })
    });
    
    if (!response.ok) throw new Error('Failed to create task');
    return await response.json();
}

async function getTasks() {
    let url = `${API_BASE_URL}/api/tasks/`;
    if (currentFilter !== 'all') {
        url += `?status_filter=${currentFilter}`;
    }
    
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return await response.json();
}

async function completeTask(taskId) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    
    if (!response.ok) throw new Error('Failed to complete task');
    return await response.json();
}

async function deleteTask(taskId) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    
    if (!response.ok) throw new Error('Failed to delete task');
    return true;
}

// Filter functions
function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`filter-${filter}`).classList.add('active');
    loadTasks();
}

// UI functions
function renderTask(tasks) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        const message = currentFilter === 'all' 
            ? 'No tasks yet. Create one!'
            : `No ${currentFilter} tasks found.`;
        taskList.innerHTML = `<div class="loading">${message}</div>`;
        return;
    }
    
    tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.status === 'completed' ? 'completed' : ''}`;
        
        const priorityClass = `priority-${task.priority}`;
        const createdDate = new Date(task.created_at).toLocaleDateString();
        
        taskDiv.innerHTML = `
            <div class="task-title">${task.title}</div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="task-meta">
                <span class="task-priority ${priorityClass}">${getPriorityLabel(task.priority)}</span>
                <span>${createdDate}</span>
                <div class="task-actions">
                    ${task.status === 'active' ? `<button class="action-btn complete-btn" onclick="handleCompleteTask(${task.id})">✓</button>` : '<span class="completed-badge">✅</span>'}
                    <button class="action-btn delete-btn" onclick="handleDeleteTask(${task.id})">🗑</button>
                </div>
            </div>
        `;
        
        taskList.appendChild(taskDiv);
    });
}

function getPriorityLabel(priority) {
    switch(priority) {
        case 0: return 'None';
        case 1: return 'Low';
        case 2: return 'Medium';
        case 3: return 'High';
        default: return 'None';
    }
}

async function loadTasks() {
    try {
        const tasks = await getTasks();
        renderTask(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function handleCompleteTask(taskId) {
    await completeTask(taskId);
    await loadTasks();
}

async function handleDeleteTask(taskId) {
    if (!confirm('Delete this task?')) return;
    await deleteTask(taskId);
    await loadTasks();
}

// Event listeners
document.getElementById('refresh-tasks').addEventListener('click', loadTasks);

// Enter key support
document.getElementById('login-password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('login-btn').click();
});

document.getElementById('register-password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('register-btn').click();
});
