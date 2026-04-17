// Configuration
const API_BASE_URL = window.location.origin;

// State Management
let currentUser = null;
let currentToken = localStorage.getItem('tm_access_token');
let isDarkMode = localStorage.getItem('tm_dark_mode') === '1';
let taskChart = null;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkAuth();
    setupEventListeners();
});

function initTheme() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    }
}

async function checkAuth() {
    if (currentToken) {
        showLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/me`, {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            if (response.ok) {
                currentUser = await response.json();
                renderApp();
            } else {
                logout();
            }
        } catch (err) {
            console.error('Auth check failed', err);
            renderLogin();
        } finally {
            showLoading(false);
        }
    } else {
        renderLogin();
    }
}

// --- UI Navigation ---
function renderLogin() {
    document.getElementById('auth-page').classList.add('active');
    document.getElementById('main-app').classList.remove('active');
}

function renderApp() {
    document.getElementById('auth-page').classList.remove('active');
    document.getElementById('main-app').classList.add('active');
    document.getElementById('user-display-name').textContent = currentUser.name || currentUser.username;
    showView('dashboard');
}

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('onclick').includes(viewId));
    });

    if (viewId === 'dashboard') loadDashboard();
    if (viewId === 'tasks') loadTasks();
}

// --- API Calls ---
async function apiFetch(endpoint, options = {}) {
    // Ensure endpoint starts with /api/ if it doesn't already
    const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    
    options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
    };
    
    const response = await fetch(`${API_BASE_URL}${apiEndpoint}`, options);
    if (response.status === 401) {
        logout();
        throw new Error('Session expired');
    }
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'API error');
    }
    return response.json();
}

// --- Auth Actions ---
async function login(username, password) {
    showLoading(true);
    try {
        const data = await apiFetch('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        saveAuth(data);
        renderApp();
    } catch (err) {
        showAuthError(err.message);
    } finally {
        showLoading(false);
    }
}

async function signup(name, username, email, password) {
    showLoading(true);
    try {
        const data = await apiFetch('/signup', {
            method: 'POST',
            body: JSON.stringify({ name, username, email, password })
        });
        saveAuth(data);
        renderApp();
    } catch (err) {
        showAuthError(err.message);
    } finally {
        showLoading(false);
    }
}

function saveAuth(data) {
    currentToken = data.access_token;
    currentUser = { user_id: data.user_id, username: data.username, name: data.name };
    localStorage.setItem('tm_access_token', currentToken);
}

function logout() {
    currentToken = null;
    currentUser = null;
    localStorage.removeItem('tm_access_token');
    renderLogin();
}

// --- Dashboard Logic ---
async function loadDashboard() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const score = await apiFetch('/score/daily', {
            method: 'POST',
            body: JSON.stringify({ user_id: currentUser.user_id, day: today })
        });
        
        document.getElementById('score-value').textContent = score.score.toFixed(1);
        document.getElementById('streak-value').textContent = score.streak;
        document.getElementById('success-value').textContent = `${(score.success_rate * 100).toFixed(0)}%`;
        document.getElementById('daily-progress-fill').style.width = `${score.success_rate * 100}%`;

        // Fetch tasks to update chart
        const tasks = await apiFetch(`/tasks?user_id=${currentUser.user_id}&day=${today}`);
        updateTaskChart(tasks);
    } catch (err) {
        console.error('Dashboard load failed', err);
    }
}

function updateTaskChart(tasks) {
    const counts = {
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: tasks.filter(t => t.status === 'failed').length,
        pending: tasks.filter(t => t.status === 'pending').length
    };

    const ctx = document.getElementById('task-pie-chart').getContext('2d');
    
    if (taskChart) {
        taskChart.destroy();
    }

    const colors = isDarkMode ? {
        completed: '#10b981',
        failed: '#3b82f6', // primary in dark mode, used as "failed" replacement
        pending: '#475569',
        text: '#ffffff'
    } : {
        completed: '#10b981',
        failed: '#020617', // primary in light mode
        pending: '#cbd5e1',
        text: '#020617'
    };

    taskChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Failed', 'Pending'],
            datasets: [{
                data: [counts.completed, counts.failed, counts.pending],
                backgroundColor: [colors.completed, colors.failed, colors.pending],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: colors.text,
                        padding: 20,
                        font: { size: 12, weight: '600' }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// --- Tasks Logic ---
async function loadTasks() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const tasks = await apiFetch(`/tasks?user_id=${currentUser.user_id}&day=${today}`);
        renderTasks(tasks);
    } catch (err) {
        console.error('Tasks load failed', err);
    }
}

function renderTasks(tasks) {
    const list = document.getElementById('task-list');
    list.innerHTML = tasks.length ? '' : '<p class="muted">No tasks for today. Add one above!</p>';
    
    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card ${task.status}`;
        card.innerHTML = `
            <div class="task-info">
                <h3>${task.title}</h3>
                <p>${task.category} | ${task.difficulty}</p>
            </div>
            <div class="task-actions">
                ${task.status === 'pending' ? `
                    <button class="btn secondary" onclick="updateTask(${task.id}, 'completed')">✅</button>
                    <button class="btn secondary" onclick="updateTask(${task.id}, 'failed')">❌</button>
                ` : `<span>${task.status === 'completed' ? '✅' : '❌'}</span>`}
            </div>
        `;
        list.appendChild(card);
    });
}

async function addTask(title, category, difficulty) {
    showLoading(true);
    try {
        const today = new Date().toISOString().split('T')[0];
        await apiFetch('/tasks', {
            method: 'POST',
            body: JSON.stringify({ 
                user_id: currentUser.user_id,
                title, category, difficulty,
                date: today 
            })
        });
        toggleTaskForm();
        loadTasks();
    } catch (err) {
        alert(err.message);
    } finally {
        showLoading(false);
    }
}

async function updateTask(taskId, status) {
    try {
        await apiFetch(`/tasks/${taskId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        loadTasks();
        loadDashboard(); // Update score too
    } catch (err) {
        alert(err.message);
    }
}

// --- Helpers & Listeners ---
function setupEventListeners() {
    // Auth Tab Switch
    document.getElementById('tab-login').onclick = () => switchAuthTab('login');
    document.getElementById('tab-signup').onclick = () => switchAuthTab('signup');

    // Forms
    document.getElementById('login-form').onsubmit = (e) => {
        e.preventDefault();
        login(document.getElementById('login-username').value, document.getElementById('login-password').value);
    };

    document.getElementById('signup-form').onsubmit = (e) => {
        e.preventDefault();
        signup(
            document.getElementById('signup-name').value,
            document.getElementById('signup-username').value,
            document.getElementById('signup-email').value,
            document.getElementById('signup-password').value
        );
    };

    document.getElementById('add-task-form').onsubmit = (e) => {
        e.preventDefault();
        addTask(
            document.getElementById('task-title').value,
            document.getElementById('task-category').value,
            document.getElementById('task-difficulty').value
        );
    };
}

function switchAuthTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    document.getElementById(`tab-${tab}`).classList.add('active');
    document.getElementById(`${tab}-form`).classList.add('active');
    document.getElementById('auth-error').textContent = '';
}

function showAuthError(msg) {
    document.getElementById('auth-error').textContent = msg;
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('tm_dark_mode', isDarkMode ? '1' : '0');
    initTheme();
    if (currentUser) loadDashboard(); // Re-render charts with new theme colors
}

function toggleTaskForm() {
    document.getElementById('task-form-container').classList.toggle('active');
    document.getElementById('task-title').value = '';
}

function showLoading(show) {
    document.getElementById('loading-overlay').classList.toggle('active', show);
}

// --- PWA Service Worker Registration ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW failed', err));
    });
}

// PWA Install Prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-btn').style.display = 'block';
});

document.getElementById('install-btn').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            deferredPrompt = null;
            document.getElementById('install-btn').style.display = 'none';
        }
    }
});
