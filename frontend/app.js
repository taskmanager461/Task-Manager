// Configuration
const API_BASE_URL = window.location.origin;

// State Management
let currentUser = null;
let currentToken = localStorage.getItem('tm_access_token');
let isDarkMode = localStorage.getItem('tm_dark_mode') === '1';
let currentLang = localStorage.getItem('tm_lang') || 'en';
let taskChart = null;
let trendChart = null;
let insightsChart = null;
let currentView = 'dashboard';
let cachedTasks = []; // Performance: Cache tasks locally
let calendarDate = new Date();
let calendarTasks = [];
let notifiedTasks = new Set();

const translations = {
    en: {
        app_title: "Tobedone",
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
        priority: "Priority",
        low: "Low",
        medium: "Medium",
        high: "High",
        recurring: "Recurring",
        none: "None",
        daily: "Daily",
        weekly: "Weekly",
        due_date: "Due Date",
        overdue: "Overdue",
        all: "All",
        filter_by: "Filter by",
        insights: "Insights",
        productive_day: "Most Productive Day",
        productive_hour: "Most Productive Hour",
        trends: "Completion Trends",
        failure_patterns: "Failure Patterns",
        achievements: "Achievements",
        well_done: "Well done!",
        keep_going: "Keep it up!",
        streak_saved: "Streak maintained!",
        smart_suggestion: "Smart Suggestion",
        best_time_to_create: "You are most active now! Great time to plan tasks.",
        suggest_simpler: "This task seems complex. Try breaking it down?",
        high_risk: "High risk of failure based on your history for this time/category.",
        optimal_time: "Optimal time to complete this: ",
        most_productive_day: "Your most productive day is ",
        most_productive_hour: "You get most things done around ",
        failure_pattern: "You tend to struggle more with tasks in ",
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
        error_occurred: "An error occurred",
        calendar: "Calendar",
        date: "Date",
        time: "Time",
        reminder: "Reminder",
        task_starting: "Task is starting soon!",
        january: "January", february: "February", march: "March", april: "April", may: "May", june: "June",
        july: "July", august: "August", september: "September", october: "October", november: "November", december: "December",
        mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun"
    },
    el: {
        app_title: "Tobedone",
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
        priority: "Προτεραιότητα",
        low: "Χαμηλή",
        medium: "Μεσαία",
        high: "Υψηλή",
        recurring: "Επανάληψη",
        none: "Καμία",
        daily: "Καθημερινά",
        weekly: "Εβδομαδιαία",
        due_date: "Προθεσμία",
        overdue: "Εκπρόθεσμο",
        all: "Όλα",
        filter_by: "Φίλτρο",
        insights: "Αναλύσεις",
        productive_day: "Πιο Παραγωγική Μέρα",
        productive_hour: "Πιο Παραγωγική Ώρα",
        trends: "Τάσεις Ολοκλήρωσης",
        failure_patterns: "Μοτίβα Αποτυχίας",
        achievements: "Επιτεύγματα",
        well_done: "Μπράβο!",
        keep_going: "Συνέχισε έτσι!",
        streak_saved: "Το σερί διατηρήθηκε!",
        smart_suggestion: "Έξυπνη Πρόταση",
        best_time_to_create: "Είστε πολύ δραστήριοι τώρα! Ιδανική ώρα για σχεδιασμό.",
        suggest_simpler: "Αυτή η εργασία φαίνεται περίπλοκη. Μήπως να την σπάσετε σε μικρότερες;",
        high_risk: "Υψηλός κίνδυνος αποτυχίας βάσει του ιστορικού σας για αυτή την ώρα/κατηγορία.",
        optimal_time: "Ιδανική ώρα ολοκλήρωσης: ",
        most_productive_day: "Η πιο παραγωγική σας μέρα είναι η ",
        most_productive_hour: "Ολοκληρώνετε τις περισσότερες εργασίες γύρω στις ",
        failure_pattern: "Δυσκολεύεστε περισσότερο με εργασίες στην κατηγορία ",
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
        error_occurred: "Παρουσιάστηκε σφάλμα",
        calendar: "Ημερολόγιο",
        date: "Ημερομηνία",
        time: "Ώρα",
        reminder: "Υπενθύμιση",
        task_starting: "Η εργασία ξεκινά σύντομα!",
        january: "Ιανουάριος", february: "Φεβρουάριος", march: "Μάρτιος", april: "Απρίλιος", may: "Μάιος", june: "Ιούνιος",
        july: "Ιούλιος", august: "Αύγουστος", september: "Σεπτέμβριος", october: "Οκτώβριος", november: "Νοέμβριος", december: "Δεκέμβριος",
        mon: "Δευ", tue: "Τρι", wed: "Τετ", thu: "Πεμ", fri: "Παρ", sat: "Σαβ", sun: "Κυρ"
    },
    es: {
        app_title: "Tobedone",
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
        app_title: "Tobedone",
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
        app_title: "Tobedone",
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
        app_title: "Tobedone",
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
        app_title: "Tobedone",
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

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const hamburgers = document.querySelectorAll('.hamburger');
    
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
    hamburgers.forEach(h => h.classList.toggle('active'));
    document.body.classList.toggle('sidebar-open');
}

function initTheme() {
    // Pro Tech Style: Always dark mode unless explicitly changed
    if (localStorage.getItem('tm_dark_mode') === null) {
        isDarkMode = true;
        localStorage.setItem('tm_dark_mode', '1');
    }
    
    applyTheme();
}

function applyTheme() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    }
    const switchEl = document.getElementById('dark-mode-switch');
    if (switchEl) {
        switchEl.checked = isDarkMode;
    }
    // Refresh charts to match theme
    if (currentUser && currentView === 'dashboard') {
        loadDashboard();
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
    const mobileHeader = document.querySelector('.mobile-header');
    if (mobileHeader) mobileHeader.style.display = 'none';
}

function renderApp() {
    document.getElementById('auth-page').classList.remove('active');
    document.getElementById('main-app').classList.add('active');
    document.getElementById('user-display-name').textContent = currentUser.name || currentUser.username;
    
    // Initial view
    updateUILanguage();
    showView('dashboard');
}

function showView(viewId) {
    currentView = viewId;
    
    // UI Update
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(`view-${viewId}`);
    if (target) target.classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => {
        const onClickAttr = item.getAttribute('onclick');
        if (onClickAttr && onClickAttr.includes(viewId)) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Close mobile sidebar if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
        toggleSidebar();
    }

    // Scroll content to top
    const content = document.getElementById('content');
    if (content) content.scrollTop = 0;

    // Load Data
    if (viewId === 'dashboard') loadDashboard();
    if (viewId === 'tasks') loadTasks();
    if (viewId === 'insights') loadInsights();
    if (viewId === 'settings') applyTheme(); // Sync theme switch state
}


async function loadInsights() {
    try {
        const history = await apiFetch(`/score/history?user_id=${currentUser.user_id}&days=30`);
        renderInsights(history);
    } catch (err) {
        console.error('Insights load failed', err);
    }
}

function renderInsights(history) {
    // 1. Pattern Detection Logic
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStats = dayNames.map(name => ({ name, count: 0, completed: 0 }));
    const categoryStats = {};

    history.forEach(entry => {
        const date = new Date(entry.date);
        const dayIdx = date.getDay();
        dayStats[dayIdx].count++;
        if (entry.success_rate > 0.5) dayStats[dayIdx].completed++;
        
        // We'd need task-level history for better hour/category insights
        // For now, let's use the provided daily history entry
    });

    const bestDayIdx = dayStats.reduce((best, curr, idx) => curr.completed > dayStats[best].completed ? idx : best, 0);
    
    document.getElementById('insight-best-day').textContent = dayNames[bestDayIdx];
    document.getElementById('insight-best-hour').textContent = '09:00 - 11:00'; // Intelligent placeholder
    document.getElementById('insight-failure-pattern').textContent = t('failure_pattern') + ' "Health"'; // Example

    // 2. Achievements
    const streak = parseInt(document.getElementById('streak-value').textContent) || 0;
    const achievements = [
        { id: 'early_bird', name: 'Early Bird', icon: '🌅', unlocked: true },
        { id: 'streak_3', name: '3 Day Streak', icon: '🔥', unlocked: streak >= 3 },
        { id: 'master', name: 'Task Master', icon: '🏆', unlocked: streak >= 7 }
    ];
    
    const list = document.getElementById('achievements-list');
    list.innerHTML = achievements.map(a => `
        <div class="achievement-badge ${a.unlocked ? 'unlocked' : ''}">
            <span class="icon">${a.icon}</span>
            <span class="name">${a.name}</span>
        </div>
    `).join('');
}

// --- Calendar Logic ---
async function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const title = document.getElementById('calendar-month-year');
    if (!grid || !title) return;

    grid.innerHTML = '';
    const month = calendarDate.getMonth();
    const year = calendarDate.getFullYear();

    const monthNames = [t('january'), t('february'), t('march'), t('april'), t('may'), t('june'), t('july'), t('august'), t('september'), t('october'), t('november'), t('december')];
    title.textContent = `${monthNames[month]} ${year}`;

    // Days Labels
    const days = [t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')];
    days.forEach(d => grid.innerHTML += `<div class="calendar-day-label">${d}</div>`);

    // Get tasks for the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // ISO format for API
    const startStr = firstDay.toISOString().split('T')[0];
    const endStr = lastDay.toISOString().split('T')[0];
    
    try {
        calendarTasks = await apiFetch(`/tasks/range?start_date=${startStr}&end_date=${endStr}`);
    } catch (err) {
        console.error('Failed to load calendar tasks', err);
    }

    const firstDayIdx = (firstDay.getDay() + 6) % 7; // Monday start
    const daysInMonth = lastDay.getDate();
    const todayStr = new Date().toISOString().split('T')[0];

    // Padding for previous month
    for (let i = 0; i < firstDayIdx; i++) {
        grid.innerHTML += `<div class="calendar-day other-month"></div>`;
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const hasTasks = calendarTasks.some(t => t.date === dateStr);
        const isToday = dateStr === todayStr;
        
        const dayEl = document.createElement('div');
        dayEl.className = `calendar-day ${isToday ? 'today' : ''} ${hasTasks ? 'has-tasks' : ''}`;
        dayEl.textContent = d;
        dayEl.onclick = () => renderDayTasks(dateStr);
        grid.appendChild(dayEl);
    }
}

function changeMonth(delta) {
    calendarDate.setMonth(calendarDate.getMonth() + delta);
    renderCalendar();
}

function renderDayTasks(dateStr) {
    const container = document.getElementById('day-tasks-container');
    if (!container) return;

    // Highlight active day
    document.querySelectorAll('.calendar-day').forEach(el => {
        if (el.textContent == parseInt(dateStr.split('-')[2])) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });

    const tasks = calendarTasks.filter(t => t.date === dateStr);
    
    if (tasks.length === 0) {
        container.innerHTML = `<div class="card"><p style="text-align:center;">${t('no_tasks')}</p></div>`;
        return;
    }

    container.innerHTML = `<h3>Tasks for ${dateStr}</h3>`;
    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card ${task.status}`;
        card.innerHTML = `
            <div class="task-info">
                <h3>${task.title}</h3>
                <p>${task.time || ''} | ${task.category}</p>
            </div>
            <div class="status-badge ${task.status}">${t(task.status)}</div>
        `;
        container.appendChild(card);
    });
}

// --- Notification Logic ---
function checkReminders() {
    if (!cachedTasks || cachedTasks.length === 0) return;
    
    const now = new Date();
    const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    cachedTasks.forEach(task => {
        if (task.status !== 'pending' || !task.time) return;
        
        // Notify 5 minutes before or exactly at the time
        const [h, m] = task.time.split(':').map(Number);
        const taskTime = new Date();
        taskTime.setHours(h, m, 0, 0);
        
        const diffMinutes = (taskTime - now) / 60000;
        
        if (diffMinutes >= 0 && diffMinutes <= 5 && !notifiedTasks.has(task.id)) {
            showNotification(task);
            notifiedTasks.add(task.id);
        }
    });
}

function showNotification(task) {
    showToast(`${t('reminder')}: ${task.title} @ ${task.time}`, 'info');
    // Sound could be added here
}

// --- Real Insights Upgrade ---
async function loadInsights() {
    showLoading(true);
    try {
        // Fetch all user tasks for comprehensive insights
        const tasks = await apiFetch(`/tasks/range?start_date=2000-01-01&end_date=2100-12-31`);
        renderRealInsights(tasks);
    } catch (err) {
        console.error('Insights load failed', err);
    } finally {
        showLoading(false);
    }
}

function renderRealInsights(tasks) {
    if (!tasks || tasks.length === 0) return;

    const completed = tasks.filter(t => t.status === 'completed');
    const failed = tasks.filter(t => t.status === 'failed');
    const rate = tasks.length > 0 ? (completed.length / (completed.length + failed.length || 1)) * 100 : 0;

    // Most productive day
    const dayCounts = {};
    completed.forEach(t => {
        const d = new Date(t.date).getDay();
        dayCounts[d] = (dayCounts[d] || 0) + 1;
    });
    const dayNames = [t('sun'), t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat')];
    let bestDayIdx = 0;
    for (let d in dayCounts) if (dayCounts[d] > (dayCounts[bestDayIdx] || 0)) bestDayIdx = d;

    // Most active hours
    const hourCounts = {};
    tasks.forEach(t => {
        if (t.time) {
            const h = t.time.split(':')[0];
            hourCounts[h] = (hourCounts[h] || 0) + 1;
        }
    });
    let bestHour = '00';
    for (let h in hourCounts) if (hourCounts[h] > (hourCounts[bestHour] || 0)) bestHour = h;

    // Update UI
    document.getElementById('insight-best-day').textContent = dayNames[bestDayIdx];
    document.getElementById('insight-best-hour').textContent = `${bestHour}:00`;
    
    // Update stats grid (if exists)
    const successVal = document.getElementById('success-value');
    if (successVal) successVal.textContent = `${rate.toFixed(0)}%`;

    // Failure patterns
    const failCategories = {};
    failed.forEach(t => failCategories[t.category] = (failCategories[t.category] || 0) + 1);
    let worstCat = 'None';
    for (let c in failCategories) if (failCategories[c] > (failCategories[worstCat] || 0)) worstCat = c;
    document.getElementById('insight-failure-pattern').textContent = worstCat;
}

// Override showView to handle Calendar load
const originalShowView = showView;
showView = function(viewId) {
    originalShowView(viewId);
    if (viewId === 'calendar') renderCalendar();
};

// --- API Calls ---
async function apiFetch(endpoint, options = {}) {
    // Ensure endpoint starts with /api/ if it doesn't already
    const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    
    options.headers = {
        ...options.headers,
        'Content-Type': 'application/json'
    };
    
    // Performance: Don't send token for login/signup
    if (currentToken && !endpoint.includes('/login') && !endpoint.includes('/signup')) {
        options.headers['Authorization'] = `Bearer ${currentToken}`;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${apiEndpoint}`, options);
        if (response.status === 401 && !endpoint.includes('/login')) {
            logout();
            showToast(t('session_expired'), 'error');
            throw new Error('Session expired');
        }
        if (!response.ok) {
            const error = await response.json();
            // Handle Pydantic validation errors
            let message = t('error_occurred');
            if (typeof error.detail === 'string') {
                message = error.detail;
            } else if (Array.isArray(error.detail)) {
                message = error.detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join('\n');
            }
            throw new Error(message);
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
    showAuthError(''); // Clear previous errors
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
    showAuthError(''); // Clear previous errors
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

function getScoreLabel(score) {
    if (score >= 80) return { text: 'Excellent', class: 'excellent' };
    if (score >= 60) return { text: 'Good', class: 'good' };
    if (score >= 40) return { text: 'Average', class: 'average' };
    return { text: 'Low', class: 'low' };
}

// --- Dashboard Logic ---
async function loadDashboard() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const score = await apiFetch('/score/daily', {
            method: 'POST',
            body: JSON.stringify({ user_id: currentUser.user_id, day: today })
        });
        
        // Basic stats
        document.getElementById('score-value').textContent = score.score.toFixed(1);
        document.getElementById('streak-value').textContent = score.streak;
        document.getElementById('success-value').textContent = `${(score.success_rate * 100).toFixed(0)}%`;
        document.getElementById('daily-progress-fill').style.width = `${score.success_rate * 100}%`;

        // Score label
        const scoreLabel = getScoreLabel(score.score);
        const scoreLabelEl = document.getElementById('score-label');
        scoreLabelEl.textContent = scoreLabel.text;
        scoreLabelEl.className = 'score-label ' + scoreLabel.class;

        // Update Multiplier Badge
        const multBadge = document.getElementById('multiplier-badge');
        if (score.multiplier > 1.0) {
            multBadge.textContent = `${score.multiplier.toFixed(1)}x Boost`;
            multBadge.style.display = 'inline-block';
        } else {
            multBadge.style.display = 'none';
        }

        // Load all additional data
        loadScoreComparison();
        loadMissedTasks();
        loadWeeklySummary();

        // Fetch tasks to update pie chart
        const tasks = await apiFetch(`/tasks?user_id=${currentUser.user_id}&day=${today}`);
        updateTaskChart(tasks);
        
        // Load Weekly Trend
        loadWeeklyTrend();
    } catch (err) {
        console.error('Dashboard load failed', err);
    }
}

async function loadScoreComparison() {
    try {
        const history = await apiFetch('/score/history');
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        const todayScore = history.find(h => h.date === today);
        const yesterdayScore = history.find(h => h.date === yesterday);
        
        const comparisonEl = document.getElementById('score-comparison');
        const comparisonText = document.getElementById('score-comparison-text');
        
        if (todayScore && yesterdayScore) {
            const diff = todayScore.score - yesterdayScore.score;
            comparisonEl.style.display = 'block';
            
            if (diff > 0) {
                comparisonEl.className = 'card score-comparison improved';
                comparisonText.textContent = `You improved by ${diff.toFixed(1)} points compared to yesterday! 🎉`;
            } else if (diff < 0) {
                comparisonEl.className = 'card score-comparison dropped';
                comparisonText.textContent = `You dropped by ${Math.abs(diff).toFixed(1)} points compared to yesterday`;
            } else {
                comparisonEl.style.display = 'none';
            }
        } else {
            comparisonEl.style.display = 'none';
        }
    } catch (err) {
        console.error('Score comparison load failed', err);
        document.getElementById('score-comparison').style.display = 'none';
    }
}

async function loadMissedTasks() {
    try {
        const data = await apiFetch('/tasks/missed');
        const alertEl = document.getElementById('missed-tasks-alert');
        const textEl = document.getElementById('missed-tasks-text');
        
        if (data.count > 0) {
            alertEl.style.display = 'block';
            let message = `You missed ${data.count} task${data.count > 1 ? 's' : ''}`;
            
            const today = new Date().toISOString().split('T')[0];
            const todayTasks = await apiFetch(`/tasks?user_id=${currentUser.user_id}&day=${today}`);
            const hasCompletedToday = todayTasks.some(t => t.status === 'completed');
            const streakValue = parseInt(document.getElementById('streak-value').textContent) || 0;
            
            if (streakValue > 0 && !hasCompletedToday) {
                message += ` — You are at risk of losing your streak! ⚠️`;
            }
            
            textEl.textContent = message;
        } else {
            alertEl.style.display = 'none';
        }
    } catch (err) {
        console.error('Missed tasks load failed', err);
        document.getElementById('missed-tasks-alert').style.display = 'none';
    }
}

async function loadWeeklySummary() {
    try {
        const data = await apiFetch('/score/weekly-summary');
        const container = document.getElementById('weekly-summary');
        const content = document.getElementById('weekly-summary-content');
        
        container.style.display = 'block';
        
        content.innerHTML = `
            <div class="weekly-summary-stats">
                <div class="weekly-summary-stat">
                    <span class="label">Total Tasks</span>
                    <span class="value">${data.current_week.total_tasks}</span>
                </div>
                <div class="weekly-summary-stat">
                    <span class="label">Completed</span>
                    <span class="value">${data.current_week.completed_tasks}</span>
                </div>
                <div class="weekly-summary-stat">
                    <span class="label">Success Rate</span>
                    <span class="value">${data.current_week.success_rate}%</span>
                </div>
                <div class="weekly-summary-stat">
                    <span class="label">Streak</span>
                    <span class="value">${data.current_week.streak}</span>
                </div>
            </div>
            <div class="weekly-summary-change ${data.success_change >= 0 ? 'positive' : 'negative'}">
                ${data.success_change >= 0 ? '↑' : '↓'} ${Math.abs(data.success_change)}% ${data.success_change >= 0 ? 'improvement' : 'drop'} from last week
            </div>
        `;
    } catch (err) {
        console.error('Weekly summary load failed', err);
    }
}

// --- Insights Logic ---
async function loadInsights() {
    try {
        // Load smart insights
        const smartData = await apiFetch('/insights/smart');
        const container = document.getElementById('smart-insights-container');
        
        if (smartData.insights.length > 0) {
            container.innerHTML = smartData.insights.map(insight => `
                <div class="insight-card">
                    <span class="icon">✨</span>
                    <div class="insight-content">
                        <p style="font-weight: 600; color: var(--text-primary);">${insight}</p>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '';
        }
        
        // Load the original insights as fallback
        const history = await apiFetch(`/score/history?user_id=${currentUser.user_id}&days=30`);
        renderRealInsights(await apiFetch('/tasks/range?start_date=2000-01-01&end_date=2100-12-31'));
    } catch (err) {
        console.error('Insights load failed', err);
    }
}

async function loadWeeklyTrend() {
    try {
        const scores = await apiFetch(`/score/history?user_id=${currentUser.user_id}&days=7`);
        updateTrendChart(scores);
    } catch (err) {
        console.error('Trend load failed', err);
    }
}

function updateTrendChart(history) {
    const ctx = document.getElementById('weekly-trend-chart').getContext('2d');
    if (trendChart) trendChart.destroy();

    const labels = history.map(s => s.date.split('-').slice(1).reverse().join('/'));
    const data = history.map(s => s.score);

    const textColor = isDarkMode ? '#FFFFFF' : '#0F172A';
    const bgColor = isDarkMode ? '#111827' : '#FFFFFF';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    const lineColor = '#0066FF';
    const fillColor = isDarkMode ? 'rgba(0, 102, 255, 0.15)' : 'rgba(0, 102, 255, 0.1)';

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: t('trust_score'),
                data: data,
                borderColor: lineColor,
                backgroundColor: fillColor,
                fill: true,
                tension: 0.35,
                pointRadius: 5,
                pointBackgroundColor: lineColor,
                pointBorderColor: bgColor,
                pointBorderWidth: 3,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    padding: 12,
                    backgroundColor: bgColor,
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 150,
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { size: 11, weight: '500' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: textColor, font: { size: 11, weight: '500' } }
                }
            }
        }
    });
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

    const textColor = isDarkMode ? '#FFFFFF' : '#0F172A';
    const bgColor = isDarkMode ? '#111827' : '#FFFFFF';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    const pendingColor = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';

    taskChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [t('completed'), t('failed'), t('pending')],
            datasets: [{
                data: [counts.completed, counts.failed, counts.pending],
                backgroundColor: ['#10B981', '#EF4444', pendingColor],
                borderWidth: 4,
                borderColor: bgColor,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: { size: 12, weight: '600' }
                    }
                },
                tooltip: {
                    backgroundColor: bgColor,
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true
                }
            },
            cutout: '65%'
        }
    });
}


// --- Tasks Logic ---
async function loadTasks() {
    const list = document.getElementById('task-list');
    
    // Performance: If we have cached tasks, show them first
    if (cachedTasks.length > 0) {
        renderTasks(cachedTasks);
    } else if (list.innerHTML === '' || list.querySelector('.empty-state')) {
        list.innerHTML = `
            <div class="task-card skeleton" style="height: 80px; opacity: 0.6;"></div>
            <div class="task-card skeleton" style="height: 80px; opacity: 0.4;"></div>
            <div class="task-card skeleton" style="height: 80px; opacity: 0.2;"></div>
        `;
    }

    try {
        const today = new Date().toISOString().split('T')[0];
        const priority = document.getElementById('filter-priority').value;
        const status = document.getElementById('filter-status').value;
        
        let url = `/tasks?user_id=${currentUser.user_id}&day=${today}`;
        if (priority) url += `&priority=${priority}`;
        if (status) url += `&status=${status}`;

        const tasks = await apiFetch(url);
        cachedTasks = tasks;
        renderTasks(tasks);
    } catch (err) {
        console.error('Tasks load failed', err);
        if (cachedTasks.length === 0) {
            list.innerHTML = `<div class="empty-state"><p class="error-msg">${t('error_occurred')}</p></div>`;
        }
    }
}

function showSmartSuggestion() {
    const container = document.getElementById('smart-suggestion-container');
    const now = new Date();
    const hour = now.getHours();
    
    let suggestion = '';
    if (hour >= 8 && hour <= 10) {
        suggestion = t('best_time_to_create');
    } else if (hour >= 14 && hour <= 16) {
        suggestion = t('optimal_time') + " 15:30";
    }

    if (suggestion) {
        container.innerHTML = `
            <div class="suggestion-box">
                <span class="icon">✨</span>
                <p>${suggestion}</p>
            </div>
        `;
    } else {
        container.innerHTML = '';
    }
}

function renderTasks(tasks) {
    const list = document.getElementById('task-list');
    showSmartSuggestion(); // Show suggestion based on time

    if (!tasks || tasks.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <span class="empty-state-icon">📝</span>
                <h3 class="empty-state-title">${t('no_tasks')}</h3>
                <p class="empty-state-text">Start by adding your first task for today.</p>
                <button onclick="toggleTaskForm()" class="btn primary">${t('add_new_task')}</button>
            </div>
        `;
        return;
    }
    
    list.innerHTML = '';
    const today = new Date();
    today.setHours(0,0,0,0);

    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card ${task.status}`;
        
        // Risk Detection (Mock logic based on behavior)
        let riskHtml = '';
        if (task.status === 'pending') {
            const isComplex = task.title.length > 40;
            const isHard = task.difficulty === 'hard';
            if (isComplex || isHard) {
                riskHtml = `<span class="task-risk-warning">⚠️ ${isComplex ? t('suggest_simpler') : t('high_risk')}</span>`;
            }
        }

        // Check overdue
        let overdueHtml = '';
        if (task.status === 'pending' && task.due_date) {
            const dueDate = new Date(task.due_date);
            if (dueDate < today) {
                overdueHtml = `<span class="overdue-badge">⚠️ ${t('overdue')}</span>`;
            }
        }

        const recurringIcon = task.recurring !== 'none' ? `<span class="recurring-icon" title="${t(task.recurring)}">🔄</span>` : '';

        card.innerHTML = `
            <div class="task-info">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <h3>${task.title}</h3>
                    <span class="priority-badge priority-${task.priority}">${t(task.priority)}</span>
                </div>
                <div class="task-meta">
                    <p>${task.category} | ${t(task.difficulty)}</p>
                    ${recurringIcon}
                    ${task.due_date ? `<p>📅 ${task.due_date}</p>` : ''}
                    ${overdueHtml}
                </div>
                ${riskHtml}
            </div>
            <div class="task-actions">
                ${task.status === 'pending' ? `
                    <button class="btn task-btn completed" onclick="handleTaskUpdate(${task.id}, 'completed', this)">
                        <span data-i18n="completed">${t('completed')}</span>
                        <span class="btn-icon">✔</span>
                    </button>
                    <button class="btn task-btn failed" onclick="handleTaskUpdate(${task.id}, 'failed', this)">
                        <span data-i18n="failed">${t('failed')}</span>
                        <span class="btn-icon">✖</span>
                    </button>
                ` : `
                    <div class="status-badge ${task.status}">
                        ${task.status === 'completed' ? `<span>${t('completed')} ✔</span>` : `<span>${t('failed')} ✖</span>`}
                    </div>
                `}
            </div>
        `;
        list.appendChild(card);
    });
}

async function addTask(title, category, difficulty, date, time) {
    const priority = document.getElementById('task-priority').value;
    const recurring = document.getElementById('task-recurring').value;
    const dueDate = document.getElementById('task-due-date').value;

    const submitBtn = document.querySelector('#add-task-form button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳</span> Processing...';
    
    try {
        const taskDate = date || new Date().toISOString().split('T')[0];
        await apiFetch('/tasks', {
            method: 'POST',
            body: JSON.stringify({ 
                user_id: currentUser.user_id,
                title, category, difficulty,
                priority, recurring,
                due_date: dueDate || null,
                date: taskDate,
                time: time || null
            })
        });
        toggleTaskForm();
        loadTasks();
        showToast(t('task_added'), 'success');
    } catch (err) {
        // Error toast handled by apiFetch
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function handleTaskUpdate(taskId, status, btnEl) {
    // OPTIMISTIC UI: Instant feedback
    const card = btnEl.closest('.task-card');
    const originalStatus = card.className;
    const originalActions = card.querySelector('.task-actions').innerHTML;
    
    // Update local state and UI immediately
    card.className = `task-card ${status}`;
    card.querySelector('.task-actions').innerHTML = `<span>⏳</span>`;
    
    // Update cache
    const taskIdx = cachedTasks.findIndex(t => t.id === taskId);
    if (taskIdx !== -1) cachedTasks[taskIdx].status = status;

    try {
        await apiFetch(`/tasks/${taskId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        
        // Success: Replace loader with status icon
        card.querySelector('.task-actions').innerHTML = `
            <div class="status-badge ${status}">
                <span>${status === 'completed' ? t('completed') + ' ✔' : t('failed') + ' ✖'}</span>
            </div>
        `;
        showToast(t('task_updated'), 'success');
        
        // Motivation feedback
        if (status === 'completed') {
            const messages = [t('well_done'), t('keep_going')];
            const randomMsg = messages[Math.floor(Math.random() * messages.length)];
            showToast(randomMsg, 'success');
        }

        // If in dashboard, refresh stats silently
        if (currentView === 'dashboard') loadDashboard();
    } catch (err) {
        // Rollback on error
        card.className = originalStatus;
        card.querySelector('.task-actions').innerHTML = originalActions;
        if (taskIdx !== -1) cachedTasks[taskIdx].status = 'pending';
        showToast(err.message, 'error');
    }
}

// --- Helpers & Listeners ---
function setupEventListeners() {
    // Auth Tab Switch
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    if (tabLogin) tabLogin.onclick = () => switchAuthTab('login');
    if (tabSignup) tabSignup.onclick = () => switchAuthTab('signup');

    // Auth
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            login(document.getElementById('login-username').value, document.getElementById('login-password').value);
        });
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            signup(
                document.getElementById('signup-name').value,
                document.getElementById('signup-username').value,
                document.getElementById('signup-email').value,
                document.getElementById('signup-password').value
            );
        });
    }

    // Task Form
    const addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('task-title').value;
            const category = document.getElementById('task-category').value;
            const difficulty = document.getElementById('task-difficulty').value;
            const date = document.getElementById('task-date') ? document.getElementById('task-date').value : null;
            const time = document.getElementById('task-time') ? document.getElementById('task-time').value : null;
            addTask(title, category, difficulty, date, time);
        });
    }

    // Set default date/time in form
    const taskDateInput = document.getElementById('task-date');
    const taskTimeInput = document.getElementById('task-time');
    if (taskDateInput) taskDateInput.value = new Date().toISOString().split('T')[0];
    if (taskTimeInput) {
        const now = new Date();
        taskTimeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    // Reminders check every minute
    setInterval(() => {
        if (typeof checkReminders === 'function') checkReminders();
    }, 60000);
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
    applyTheme();
    if (currentUser) {
        if (currentView === 'dashboard') loadDashboard();
        if (currentView === 'tasks') renderTasks(cachedTasks);
    }
    showToast(t('task_updated'), 'success');
}

function toggleTaskForm() {
    document.getElementById('task-form-container').classList.toggle('active');
    document.getElementById('task-title').value = '';
}

async function forceUpdateApp() {
    if (confirm("This will clear all cache and reload the app. Continue?")) {
        showLoading(true);
        try {
            // 1. Unregister all service workers
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (let registration of registrations) {
                    await registration.unregister();
                }
            }
            // 2. Clear all caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                for (let name of cacheNames) {
                    await caches.delete(name);
                }
            }
            // 3. Hard reload
            window.location.reload(true);
        } catch (err) {
            console.error("Force update failed", err);
            window.location.reload(true);
        }
    }
}

function showLoading(show) {
    // We only show full loading overlay for major operations like initial load or auth
    // For smaller tasks, we use skeleton or inline loaders
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.toggle('active', show);
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
