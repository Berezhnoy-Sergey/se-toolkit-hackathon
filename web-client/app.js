// TaskFlow Web Client - Version 2

// Use backend URL directly since we're opening file locally
const API_BASE_URL = 'http://localhost:8000';
const API_KEY = 'taskflow_api_key_change_this';

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const taskList = document.getElementById('task-list');
const refreshTasksBtn = document.getElementById('refresh-tasks');
const filterButtons = document.getElementById('filter-buttons');

let currentFilter = 'all';

// Utility functions
function addMessage(content, type = 'ai') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showLoading(element) {
    element.innerHTML = '<div class="loading">Loading...</div>';
}

function showError(element, message) {
    element.innerHTML = `<div class="error">${message}</div>`;
}

// API functions
async function createTask(title, description = '', priority = 0) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tasks/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY
            },
            body: JSON.stringify({ title, description, priority })
        });
        
        if (!response.ok) throw new Error('Failed to create task');
        return await response.json();
    } catch (error) {
        console.error('Error creating task:', error);
        throw error;
    }
}

async function getTasks() {
    try {
        let url = `${API_BASE_URL}/api/tasks/`;
        if (currentFilter !== 'all') {
            url += `?status_filter=${currentFilter}`;
        }
        
        const response = await fetch(url, {
            headers: { 'X-API-Key': API_KEY }
        });
        
        if (!response.ok) throw new Error('Failed to fetch tasks');
        return await response.json();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
}

async function updateTask(taskId, updates) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY
            },
            body: JSON.stringify(updates)
        });
        
        if (!response.ok) throw new Error('Failed to update task');
        return await response.json();
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
}

async function completeTask(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/complete`, {
            method: 'POST',
            headers: { 'X-API-Key': API_KEY }
        });
        
        if (!response.ok) throw new Error('Failed to complete task');
        return await response.json();
    } catch (error) {
        console.error('Error completing task:', error);
        throw error;
    }
}

async function deleteTask(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 'X-API-Key': API_KEY }
        });
        
        if (!response.ok) throw new Error('Failed to delete task');
        return true;
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
}

// Filter functions
async function setFilter(filter) {
    currentFilter = filter;
    
    // Update button styles
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`filter-${filter}`).classList.add('active');
    
    await loadTasks();
}

// Simple AI interpretation (Version 1 - basic pattern matching)
async function interpretUserMessage(message) {
    message = message.toLowerCase().trim();
    
    // Pattern: "add task: <title>" or "add <title>"
    if (message.startsWith('add task:') || message.startsWith('add ')) {
        let title = message.replace('add task:', '').replace('add ', '').trim();
        title = title.charAt(0).toUpperCase() + title.slice(1);
        
        let priority = 0;
        if (message.includes('high priority')) priority = 3;
        else if (message.includes('medium priority')) priority = 2;
        else if (message.includes('low priority')) priority = 1;
        
        try {
            const task = await createTask(title, '', priority);
            addMessage(`✅ Task created: "${task.title}" (Priority: ${getPriorityLabel(task.priority)})`);
            await loadTasks();
            return;
        } catch (error) {
            addMessage(`❌ Error creating task: ${error.message}`);
            return;
        }
    }
    
    // Pattern: "show tasks" or "list tasks" or "my tasks"
    if (message.includes('show') || message.includes('list') || message.includes('my tasks')) {
        await loadTasks();
        const tasks = await getTasks();
        if (tasks.length === 0) {
            addMessage('📋 You have no tasks yet. Create one by typing "Add task: <title>"');
        } else {
            addMessage(`📋 You have ${tasks.length} task(s):`);
            tasks.forEach((task, index) => {
                const statusIcon = task.status === 'completed' ? '✅' : '⏳';
                addMessage(`${statusIcon} ${index + 1}. ${task.title} (${getPriorityLabel(task.priority)})`);
            });
        }
        return;
    }
    
    // Pattern: "mark <title> as done" or "complete <title>"
    if (message.includes('done') || message.includes('complete')) {
        const tasks = await getTasks();
        const activeTasks = tasks.filter(t => t.status === 'active');
        
        let matchedTask = null;
        for (const task of activeTasks) {
            if (message.includes(task.title.toLowerCase())) {
                matchedTask = task;
                break;
            }
        }
        
        if (matchedTask) {
            try {
                await completeTask(matchedTask.id);
                addMessage(`✅ Marked "${matchedTask.title}" as completed!`);
                await loadTasks();
                return;
            } catch (error) {
                addMessage(`❌ Error completing task: ${error.message}`);
                return;
            }
        } else {
            addMessage('❓ I couldn\'t find that task. Try "Show tasks" to see your list.');
            return;
        }
    }
    
    // Default: show help
    addMessage(`🤔 I can help you manage tasks! Try:
- "Add task: Buy groceries"
- "Show my tasks"
- "Mark Buy groceries as done"`);
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

// UI functions
function renderTask(tasks) {
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        const message = currentFilter === 'all' 
            ? 'No tasks yet. Create one in the chat!'
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

async function handleDeleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        await deleteTask(taskId);
        addMessage('🗑 Task deleted');
        await loadTasks();
    } catch (error) {
        addMessage(`❌ Error: ${error.message}`);
    }
}

async function loadTasks() {
    try {
        showLoading(taskList);
        const tasks = await getTasks();
        renderTask(tasks);
    } catch (error) {
        showError(taskList, 'Error loading tasks. Please try again.');
    }
}

async function handleCompleteTask(taskId) {
    try {
        await completeTask(taskId);
        addMessage('✅ Task marked as completed!');
        await loadTasks();
    } catch (error) {
        addMessage(`❌ Error: ${error.message}`);
    }
}

// Event listeners
sendBtn.addEventListener('click', async () => {
    const message = chatInput.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    chatInput.value = '';
    
    try {
        await interpretUserMessage(message);
    } catch (error) {
        addMessage(`❌ Error: ${error.message}`);
    }
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});

refreshTasksBtn.addEventListener('click', loadTasks);

window.handleCompleteTask = handleCompleteTask;

// Load tasks on page load
loadTasks();
addMessage('👋 Welcome to TaskFlow! I can help you manage your tasks. Try "Add task: Buy groceries" to get started!');
