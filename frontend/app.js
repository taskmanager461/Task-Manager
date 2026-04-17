// Configuration
const API_BASE_URL = window.location.origin;

// State Management
let currentUser = null;
let currentToken = localStorage.getItem('tm_access_token');
let isDarkMode = localStorage.getItem('tm_dark_mode') === '1';
let currentLang = localStorage.getItem('tm_lang') || 'en';
let taskChart = null;

const translations = {
    en: {
        app_title: "Task Manager",
        login: "Login",
        signup: "Sign Up",
        username_email: "Username or Email",
        password: "Password",
        full_name: "Full Name",
        email: "Email",
        create_account: "Create Account",
        dashboard: "Dashboard",
        tasks: "Tasks",
        settings: "Settings",
        logout: "Logout",
        trust_score: "Trust Score",
        streak: "Streak",
        success: "Success",
        daily_progress: "Daily Progress",
        statistics: "Statistics",
        task_distribution: "Task Distribution",
        add_new_task: "Add New Task",
        new_task: "New Task",
        task_placeholder: "What needs to be done?",
        category: "Category",
        difficulty: "Difficulty",
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
        cancel: "Cancel",
        add_task: "Add Task",
        theme: "Theme",
        toggle_dark: "Toggle Dark Mode",
        language: "Language",
        app_info: "App Info",
        version: "Version",
        completed: "Completed",
        failed: "Failed",
        pending: "Pending",
        no_tasks: "No tasks for today. Add one above!",
        session_expired: "Session expired",
        task_added: "Task added successfully!",
        task_updated: "Task updated!",
        error_occurred: "An error occurred"
    },
    el: {
        app_title: "Task Manager",
        login: "Σύνδεση",
        signup: "Εγγραφή",
        username_email: "Όνομα χρήστη ή Email",
        password: "Κωδικός",
        full_name: "Ονοματεπώνυμο",
        email: "Email",
        create_account: "Δημιουργία Λογαριασμού",
        dashboard: "Ταμπλό",
        tasks: "Εργασίες",
        settings: "Ρυθμίσεις",
        logout: "Αποσύνδεση",
        trust_score: "Σκορ Εμπιστοσύνης",
        streak: "Σερί",
        success: "Επιτυχία",
        daily_progress: "Ημερήσια Πρόοδος",
        statistics: "Στατιστικά",
        task_distribution: "Κατανομή Εργασιών",
        add_new_task: "Προσθήκη Εργασίας",
        new_task: "Νέα Εργασία",
        task_placeholder: "Τί πρέπει να γίνει;",
        category: "Κατηγορία",
        difficulty: "Δυσκολία",
        easy: "Εύκολο",
        medium: "Μέτριο",
        hard: "Δύσκολο",
        cancel: "Ακύρωση",
        add_task: "Προσθήκη",
        theme: "Θέμα",
        toggle_dark: "Εναλλαγή Dark Mode",
        language: "Γλώσσα",
        app_info: "Πληροφορίες",
        version: "Έκδοση",
        completed: "Ολοκληρώθηκε",
        failed: "Απέτυχε",
        pending: "Εκκρεμεί",
        no_tasks: "Καμία εργασία για σήμερα!",
        session_expired: "Η συνεδρία έληξε",
        task_added: "Η εργασία προστέθηκε!",
        task_updated: "Η εργασία ενημερώθηκε!",
        error_occurred: "Παρουσιάστηκε σφάλμα"
    },
    es: {
        app_title: "Task Manager",
        login: "Iniciar Sesión",
        signup: "Registrarse",
        username_email: "Usuario o Email",
        password: "Contraseña",
        full_name: "Nombre Completo",
        email: "Email",
        create_account: "Crear Cuenta",
        dashboard: "Panel",
        tasks: "Tareas",
        settings: "Ajustes",
        logout: "Cerrar Sesión",
        trust_score: "Puntuación",
        streak: "Racha",
        success: "Éxito",
        daily_progress: "Progreso Diario",
        statistics: "Estadísticas",
        task_distribution: "Distribución",
        add_new_task: "Nueva Tarea",
        new_task: "Nueva Tarea",
        task_placeholder: "¿Qué hay que hacer?",
        category: "Categoría",
        difficulty: "Dificultad",
        easy: "Fácil",
        medium: "Medio",
        hard: "Difícil",
        cancel: "Cancelar",
        add_task: "Añadir",
        theme: "Tema",
        toggle_dark: "Modo Oscuro",
        language: "Idioma",
        app_info: "Información",
        version: "Versión",
        completed: "Completado",
        failed: "Fallido",
        pending: "Pendiente",
        no_tasks: "¡Sin tareas para hoy!",
        session_expired: "Sesión expirada",
        task_added: "¡Tarea añadida!",
        task_updated: "¡Tarea actualizada!",
        error_occurred: "Ocurrió un error"
    },
    fr: {
        app_title: "Task Manager",
        login: "Connexion",
        signup: "S'inscrire",
        username_email: "Nom d'utilisateur ou Email",
        password: "Mot de passe",
        full_name: "Nom complet",
        email: "Email",
        create_account: "Créer un compte",
        dashboard: "Tableau de bord",
        tasks: "Tâches",
        settings: "Paramètres",
        logout: "Déconnexion",
        trust_score: "Score de confiance",
        streak: "Série",
        success: "Succès",
        daily_progress: "Progrès quotidien",
        statistics: "Statistiques",
        task_distribution: "Distribution des tâches",
        add_new_task: "Ajouter une tâche",
        new_task: "Nouvelle tâche",
        task_placeholder: "Que faut-il faire ?",
        category: "Catégorie",
        difficulty: "Difficulté",
        easy: "Facile",
        medium: "Moyen",
        hard: "Difficile",
        cancel: "Annuler",
        add_task: "Ajouter",
        theme: "Thème",
        toggle_dark: "Mode sombre",
        language: "Langue",
        app_info: "Info",
        version: "Version",
        completed: "Terminé",
        failed: "Échoué",
        pending: "En attente",
        no_tasks: "Pas de tâches aujourd'hui !",
        session_expired: "Session expirée",
        task_added: "Tâche ajoutée !",
        task_updated: "Tâche mise à jour !",
        error_occurred: "Une erreur est survenue"
    },
    de: {
        app_title: "Task Manager",
        login: "Anmelden",
        signup: "Registrieren",
        username_email: "Benutzername oder Email",
        password: "Passwort",
        full_name: "Vollständiger Name",
        email: "Email",
        create_account: "Konto erstellen",
        dashboard: "Dashboard",
        tasks: "Aufgaben",
        settings: "Einstellungen",
        logout: "Abmelden",
        trust_score: "Vertrauen",
        streak: "Serie",
        success: "Erfolg",
        daily_progress: "Tagesfortschritt",
        statistics: "Statistiken",
        task_distribution: "Verteilung",
        add_new_task: "Aufgabe hinzufügen",
        new_task: "Neue Aufgabe",
        task_placeholder: "Was ist zu tun?",
        category: "Kategorie",
        difficulty: "Schwierigkeit",
        easy: "Einfach",
        medium: "Mittel",
        hard: "Schwer",
        cancel: "Abbrechen",
        add_task: "Hinzufügen",
        theme: "Thema",
        toggle_dark: "Dunkelmodus",
        language: "Sprache",
        app_info: "Info",
        version: "Version",
        completed: "Abgeschlossen",
        failed: "Fehlgeschlagen",
        pending: "Ausstehend",
        no_tasks: "Keine Aufgaben für heute!",
        session_expired: "Sitzung abgelaufen",
        task_added: "Aufgabe hinzugefügt!",
        task_updated: "Aufgabe aktualisiert!",
        error_occurred: "Fehler aufgetreten"
    },
    it: {
        app_title: "Task Manager",
        login: "Accedi",
        signup: "Registrati",
        username_email: "Username o Email",
        password: "Password",
        full_name: "Nome Completo",
        email: "Email",
        create_account: "Crea Account",
        dashboard: "Dashboard",
        tasks: "Compiti",
        settings: "Impostazioni",
        logout: "Esci",
        trust_score: "Fiducia",
        streak: "Serie",
        success: "Successo",
        daily_progress: "Progresso",
        statistics: "Statistiche",
        task_distribution: "Distribuzione",
        add_new_task: "Nuovo Compito",
        new_task: "Nuovo Compito",
        task_placeholder: "Cosa c'è da fare?",
        category: "Categoria",
        difficulty: "Difficoltà",
        easy: "Facile",
        medium: "Medio",
        hard: "Difficile",
        cancel: "Annulla",
        add_task: "Aggiungi",
        theme: "Tema",
        toggle_dark: "Modalità Scura",
        language: "Lingua",
        app_info: "Info",
        version: "Versione",
        completed: "Completato",
        failed: "Fallito",
        pending: "In attesa",
        no_tasks: "Nessun compito per oggi!",
        session_expired: "Sessione scaduta",
        task_added: "Compito aggiunto!",
        task_updated: "Compito aggiornato!",
        error_occurred: "Errore verificato"
    },
    pt: {
        app_title: "Task Manager",
        login: "Entrar",
        signup: "Cadastrar",
        username_email: "Usuário ou Email",
        password: "Senha",
        full_name: "Nome Completo",
        email: "Email",
        create_account: "Criar Conta",
        dashboard: "Painel",
        tasks: "Tarefas",
        settings: "Ajustes",
        logout: "Sair",
        trust_score: "Confiança",
        streak: "Sequência",
        success: "Sucesso",
        daily_progress: "Progresso",
        statistics: "Estatísticas",
        task_distribution: "Distribuição",
        add_new_task: "Nova Tarefa",
        new_task: "Nova Tarefa",
        task_placeholder: "O que precisa ser feito?",
        category: "Categoria",
        difficulty: "Dificuldade",
        easy: "Fácil",
        medium: "Médio",
        hard: "Difícil",
        cancel: "Cancelar",
        add_task: "Adicionar",
        theme: "Tema",
        toggle_dark: "Modo Escuro",
        language: "Idioma",
        app_info: "Info",
        version: "Versão",
        completed: "Concluído",
        failed: "Falhou",
        pending: "Pendente",
        no_tasks: "Sem tarefas para hoje!",
        session_expired: "Sessão expirada",
        task_added: "Tarefa adicionada!",
        task_updated: "Tarefa atualizada!",
        error_occurred: "Ocorreu um erro"
    }
};

function t(key) {
    return translations[currentLang][key] || key;
}

function updateUILanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (el.tagName === 'INPUT' && el.type !== 'submit') {
            el.placeholder = t(key);
        } else {
            el.textContent = t(key);
        }
    });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    checkAuth();
    setupEventListeners();
});

function initTheme() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        const switchEl = document.getElementById('dark-mode-switch');
        if (switchEl) switchEl.checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        const switchEl = document.getElementById('dark-mode-switch');
        if (switchEl) switchEl.checked = false;
    }
}

function initLanguage() {
    const selector = document.getElementById('lang-selector');
    if (selector) selector.value = currentLang;
    updateUILanguage();
}

function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('tm_lang', lang);
    updateUILanguage();
    if (currentUser) loadDashboard(); // Refresh charts to update labels
    showToast(t('task_updated'), 'success');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background:none;border:none;color:inherit;cursor:pointer;font-size:1.2rem;margin-left:1rem;">&times;</button>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
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
    updateUILanguage();
    showView('dashboard');
}

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(`view-${viewId}`);
    target.classList.add('active');
    
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
    
    try {
        const response = await fetch(`${API_BASE_URL}${apiEndpoint}`, options);
        if (response.status === 401) {
            logout();
            showToast(t('session_expired'), 'error');
            throw new Error('Session expired');
        }
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || t('error_occurred'));
        }
        return response.json();
    } catch (err) {
        if (err.message !== 'Session expired') {
            showToast(err.message, 'error');
        }
        throw err;
    }
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
            labels: [t('completed'), t('failed'), t('pending')],
            datasets: [{
                data: [counts.completed, counts.failed, counts.pending],
                backgroundColor: [colors.completed, colors.failed, colors.pending],
                borderWidth: 0,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: colors.text,
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: { size: 13, weight: '600', family: 'Inter' }
                    }
                },
                tooltip: {
                    backgroundColor: colors.surface,
                    titleColor: colors.text,
                    bodyColor: colors.text,
                    borderColor: colors.border,
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const val = context.raw;
                            const perc = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                            return ` ${context.label}: ${val} (${perc}%)`;
                        }
                    }
                }
            },
            cutout: '75%'
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
    list.innerHTML = tasks.length ? '' : `<p class="muted">${t('no_tasks')}</p>`;
    
    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card ${task.status}`;
        card.innerHTML = `
            <div class="task-info">
                <h3>${task.title}</h3>
                <p>${task.category} | ${t(task.difficulty)}</p>
            </div>
            <div class="task-actions">
                ${task.status === 'pending' ? `
                    <button class="btn secondary" onclick="updateTask(${task.id}, 'completed')" title="${t('completed')}">✅</button>
                    <button class="btn secondary" onclick="updateTask(${task.id}, 'failed')" title="${t('failed')}">❌</button>
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
        showToast(t('task_added'), 'success');
    } catch (err) {
        // Error already handled by apiFetch toast
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
        showToast(t('task_updated'), 'success');
    } catch (err) {
        // Error already handled by apiFetch toast
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
    showToast(t('task_updated'), 'success');
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
            .then(reg => {
                console.log('SW registered');
                
                // Check for updates
                reg.onupdatefound = () => {
                    const installingWorker = reg.installing;
                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // New content is available, show toast
                                showToast("New version available! Refreshing...", "info");
                                setTimeout(() => {
                                    window.location.reload();
                                }, 2000);
                            }
                        }
                    };
                };
            })
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
