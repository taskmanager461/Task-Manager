// Configuration
const API_BASE_URL = window.location.origin;
const SUPABASE_URL = 'https://hngljslkwyzzlcugiiqz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YTyCF9SfOoh-5TaFLUVxmw_NYk3_jiO';
const supabaseClient = window.supabase?.createClient
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage
        }
    })
    : null;

// State Management
let currentUser = null;
let supabaseSession = null;
let supabaseAccessToken = null;
let pendingVerificationEmail = null;
let authBusy = false;
let isDarkMode = localStorage.getItem('tm_dark_mode') === '1';
let currentLang = localStorage.getItem('tm_lang') || 'en';
let taskChart = null;
let trendChart = null;
let insightsChart = null;
let currentView = localStorage.getItem('tm_last_view') || 'tasks';
let cachedTasks = []; // Performance: Cache tasks locally
let cachedGoals = [];
let cachedHabits = [];
let calendarDate = new Date();
let calendarTasks = [];
let dashboardCalendarDate = new Date();
let notifiedTasks = new Set();
let notifiedHabits = new Set();
let currentTasksGoalsTab = 'tasks';
let currentGoalForReflection = null;
let identityInitialized = false;
let identitySnapshot = { level: 1, unlockedBadgeIds: [], trust_score: null };
let smartPersonalizationCache = { timestamp: 0, data: null };
let cropper = null;
let currentCropFile = null;
let cachedDailyScore = null;
let cachedWeeklyTrendHistory = null;
let cachedTasksForChart = null;

const translations = {
    en: {
        app_title: "Tobedone",
        login: "Sign In",
        signup: "Sign Up",
        continue_with_google: "Continue with Google",
        or: "or",
        username_email: "Username or Email",
        username: "Username",
        password: "Password",
        forgot_password: "Forgot password?",
        forgot_password_note: "Enter your email and we’ll send you a reset link.",
        send_reset_link: "Send reset link",
        back_to_login: "Back to sign in",
        verify_email_title: "Verify your email",
        verify_email_body: "Check your inbox and click the verification link to continue.",
        verification_code: "Verification code",
        verify_code: "Verify code",
        reset_code: "Reset code",
        use_code: "Use code",
        resend_verification: "Resend verification email",
        reset_password_title: "Set a new password",
        new_password: "New password",
        confirm_password: "Confirm password",
        update_password: "Update password",
        full_name: "Full Name",
        email: "Email",
        change_name: "Change Name",
        change_username: "Change Username",
        create_account: "Create Account",
        dashboard: "Dashboard",
        reports: "Reports",
        me: "Me",
        tasks: "Tasks",
        insights: "Insights",
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
        productive_day: "Most Productive Day",
        productive_hour: "Most Productive Hour",
        trends: "Completion Trends",
        failure_patterns: "Failure Patterns",
        achievements: "Achievements",
        well_done: "Well done!",
        keep_going: "Keep it up!",
        streak_saved: "Streak maintained!",
        multiplier: "{value}x Boost",
        tasks_count: "{count} tasks today",
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
        mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
        progress: "Progress",
        dashboard: "Dashboard"
    },
    el: {
        app_title: "Tobedone",
        login: "Σύνδεση",
        signup: "Εγγραφή",
        continue_with_google: "Σύνδεση με Google",
        or: "ή",
        username_email: "Όνομα χρήστη ή Email",
        username: "Όνομα χρήστη",
        password: "Κωδικός",
        forgot_password: "Ξέχασες τον κωδικό;",
        forgot_password_note: "Βάλε το email σου και θα σου στείλουμε link ή κωδικό επαναφοράς.",
        send_reset_link: "Αποστολή επαναφοράς",
        back_to_login: "Πίσω στη σύνδεση",
        verify_email_title: "Επιβεβαίωση email",
        verify_email_body: "Έλεγξε το inbox και πάτα το link επιβεβαίωσης για να συνεχίσεις.",
        verification_code: "Κωδικός επιβεβαίωσης",
        verify_code: "Επιβεβαίωση κωδικού",
        reset_password_title: "Νέος κωδικός",
        new_password: "Νέος κωδικός",
        confirm_password: "Επιβεβαίωση κωδικού",
        update_password: "Αλλαγή κωδικού",
        change_name: "Αλλαγή Ονόματος",
        change_username: "Αλλαγή Username",
        reset_code: "Κωδικός επαναφοράς",
        use_code: "Χρήση κωδικού",
        resend_verification: "Επανάληψη email",
        full_name: "Ονοματεπώνυμο",
        email: "Email",
        create_account: "Δημιουργία Λογαριασμού",
        dashboard: "Πίνακας",
        reports: "Αναφορές",
        me: "Εγώ",
        tasks: "Εργασίες",
        insights: "Insights",
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
        multiplier: "{value}x Ενίσχυση",
        tasks_count: "{count} εργασίες σήμερα",
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
        reports: "Reportes",
        me: "Yo",
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
        reports: "Rapports",
        me: "Moi",
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
        reports: "Berichte",
        me: "Ich",
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
        reports: "Report",
        me: "Io",
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
        reports: "Relatórios",
        me: "Eu",
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
    processAllLogos(); // Run immediately so logos start processing/fade in right away
    checkAuth();
    setupEventListeners();
    initBottomNavDragSwitch();
    syncBottomNavIndicator(currentView || 'tasks');
    
    // Pre-warm the hero metrics background-removed image assets
    if (window.ASSETS) {
        removeBlackBackground(ASSETS.img1);
        removeBlackBackground(ASSETS.img4);
        removeBlackBackground(ASSETS.img6);
    }
});

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
        document.documentElement.style.setProperty('--trust-bg', 'radial-gradient(circle at bottom right, #005c99 0%, #004a7a 20%, #003761 40%, #002542 60%, #001221 80%, #000000 100%)');
        document.documentElement.style.setProperty('--streak-bg', 'radial-gradient(circle at bottom right, #993d00 0%, #7a3100 20%, #5c2700 40%, #3d1a00 60%, #1f0d00 80%, #000000 100%)');
        document.documentElement.style.setProperty('--success-bg', 'radial-gradient(circle at bottom right, #009952 0%, #007a42 20%, #005c34 40%, #003d27 60%, #001f1a 80%, #000000 100%)');
        document.documentElement.style.setProperty('--progress-track-bg', 'rgba(255,255,255,0.1)');
        document.documentElement.style.setProperty('--progress-track-border', 'rgba(255,255,255,0.2)');
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        document.documentElement.style.setProperty('--trust-bg', 'linear-gradient(135deg, #bfdbfe 0%, #2563eb 30%, #1e293b 100%)');
        document.documentElement.style.setProperty('--streak-bg', 'linear-gradient(135deg, #fed7aa 0%, #ea580c 30%, #451a03 100%)');
        document.documentElement.style.setProperty('--success-bg', 'linear-gradient(135deg, #bbf7d0 0%, #16a34a 30%, #052e16 100%)');
        document.documentElement.style.setProperty('--progress-track-bg', 'rgba(255,255,255,0.22)');
        document.documentElement.style.setProperty('--progress-track-border', 'rgba(255,255,255,0.28)');
    }
    const switchEl = document.getElementById('dark-mode-switch');
    if (switchEl) {
        switchEl.checked = isDarkMode;
    }
    
    // Dynamically update UI elements that depend on JS/Canvas theme without making network requests
    if (currentUser) {
        if (currentView === 'reports' && cachedDailyScore) {
            renderHeroMetrics(cachedDailyScore);
            const progressFill = document.getElementById('daily-progress-fill');
            if (progressFill) progressFill.style.width = `${cachedDailyScore.success_rate * 100}%`;
        }
        if (currentView === 'me') {
            renderProfileCard();
            if (cachedWeeklyTrendHistory && document.getElementById('weekly-trend-chart')) {
                updateTrendChart(cachedWeeklyTrendHistory);
            }
            if (cachedTasksForChart && document.getElementById('task-pie-chart')) {
                updateTaskChart(cachedTasksForChart);
            }
        }
        if (currentView === 'tasks') {
            renderTasks(cachedTasks);
        }
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
    if (currentUser && currentView === 'reports') loadReports();
    if (currentUser && currentView === 'me') loadMe();
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

function isEmailVerified(user) {
    return Boolean(user && (user.email_confirmed_at || user.confirmed_at));
}

function withTimeout(promise, ms, message) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(message || 'Timeout')), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

async function syncCurrentUserFromApi() {
    if (!supabaseAccessToken) {
        throw new Error('Missing session');
    }
    const response = await fetch(`${API_BASE_URL}/api/me`, {
        headers: { 'Authorization': `Bearer ${supabaseAccessToken}` }
    });
    if (!response.ok) {
        throw new Error('Session expired');
    }
    currentUser = await response.json();
}

function setAuthBusy(isBusy) {
    authBusy = isBusy;
    const ids = [
        'google-signin-btn',
        'login-email',
        'login-password',
        'signup-name',
        'signup-username',
        'signup-email',
        'signup-password',
        'forgot-email',
        'recovery-otp',
        'recovery-otp-btn',
        'reset-password',
        'reset-password-confirm',
        'verify-otp',
        'verify-otp-btn',
        'resend-verification-btn'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = isBusy;
    });
    document.querySelectorAll('#auth-page button[type="submit"]').forEach(btn => {
        btn.disabled = isBusy;
    });
}

function setAuthView(view) {
    const formIds = ['login-form', 'signup-form', 'forgot-form', 'reset-form', 'verify-form'];
    formIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.toggle('active', id === `${view}-form`);
    });

    const tabs = document.querySelector('.tabs');
    const oauthWrap = document.querySelector('.auth-oauth');
    const googleBtn = document.getElementById('google-signin-btn');
    const divider = document.querySelector('.auth-divider');
    const showPrimary = view === 'login' || view === 'signup';
    if (tabs) tabs.style.display = showPrimary ? '' : 'none';
    if (oauthWrap) oauthWrap.style.display = view === 'login' ? '' : 'none';
    if (googleBtn) googleBtn.style.display = view === 'login' ? '' : 'none';
    if (divider) divider.style.display = view === 'login' ? '' : 'none';

    if (showPrimary) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        const activeTab = document.getElementById(`tab-${view}`);
        if (activeTab) activeTab.classList.add('active');
    }
    showAuthError('');
}

async function handleAuthSessionChange(event, session) {
    clearUrlTokens();
    if (event === 'PASSWORD_RECOVERY') {
        renderLogin();
        setAuthView('reset');
        return;
    }

    if (!session) {
        currentUser = null;
        supabaseAccessToken = null;
        renderLogin();
        setAuthView('login');
        return;
    }

    supabaseSession = session;
    supabaseAccessToken = session.access_token;

    if (!isEmailVerified(session.user)) {
        pendingVerificationEmail = pendingVerificationEmail || session.user.email || null;
        renderLogin();
        setAuthView('verify');
        const verifyText = document.getElementById('verify-email-text');
        if (verifyText && pendingVerificationEmail) {
            verifyText.textContent = `Check ${pendingVerificationEmail} and click the verification link to continue.`;
        }
        return;
    }

    // Only call renderApp() if we're not already in the app
    // This prevents resetting the view on token refreshes
    const mainApp = document.getElementById('main-app');
    const isAlreadyInApp = mainApp && mainApp.classList.contains('active');

    if (!isAlreadyInApp) {
        // Performance: Optimistic UI - pre-fill currentUser from session metadata
        const meta = session.user.user_metadata || {};
        currentUser = {
            user_id: null, // Don't use UUID here, wait for backend sync
            email: session.user.email,
            name: meta.name || meta.full_name || session.user.email.split('@')[0],
            username: meta.username || session.user.email.split('@')[0],
            avatar_url: meta.avatar_url || null
        };

        // Immediately show app with what we have
        renderApp();
    } else {
        // Just update the currentUser data without re-rendering the whole app
        const meta = session.user.user_metadata || {};
        if (!currentUser) {
            currentUser = {
                user_id: null,
                email: session.user.email,
                name: meta.name || meta.full_name || session.user.email.split('@')[0],
                username: meta.username || session.user.email.split('@')[0],
                avatar_url: meta.avatar_url || null
            };
        } else {
            currentUser.email = session.user.email;
            currentUser.name = meta.name || meta.full_name || session.user.email.split('@')[0];
            currentUser.username = meta.username || session.user.email.split('@')[0];
            currentUser.avatar_url = meta.avatar_url || null;
        }
    }

    // Then sync in background to get full profile without blocking UI
    syncCurrentUserFromApi().then(() => {
        // Update UI if anything changed after sync
        const userNameEl = document.getElementById('user-display-name');
        if (userNameEl) userNameEl.textContent = currentUser.name || currentUser.username;
        renderProfileCard();
    }).catch(async (err) => {
        console.error('Background sync failed', err);
        // If it failed because session is invalid, then logout
        if (err.message === 'Session expired') {
            await supabaseClient?.auth?.signOut();
            currentUser = null;
            supabaseSession = null;
            supabaseAccessToken = null;
            renderLogin();
            setAuthView('login');
        }
    });
}

async function checkAuth() {
    showLoading(true);
    try {
        if (!supabaseClient) {
            renderLogin();
            showAuthError('Supabase SDK not loaded');
            return;
        }

        // Fast path: Check if there's a cached Supabase auth session token in localStorage
        const hasCachedSession = Object.keys(localStorage).some(key => 
            (key.startsWith('sb-') && key.endsWith('-auth-token')) || 
            key.includes('supabase.auth.token')
        );

        if (!hasCachedSession) {
            console.log('Fast path: No cached session found, rendering login screen immediately.');
            currentUser = null;
            supabaseSession = null;
            supabaseAccessToken = null;
            renderLogin();
            setAuthView('login');
            showLoading(false);
            
            // Set up listener for subsequent auth state changes
            supabaseClient.auth.onAuthStateChange(async (event, session) => {
                await handleAuthSessionChange(event, session);
            });
            return;
        }

        const { data } = await withTimeout(supabaseClient.auth.getSession(), 4000, 'Auth timeout');
        supabaseSession = data.session;
        supabaseAccessToken = data.session?.access_token || null;
        await handleAuthSessionChange('INITIAL', data.session);

        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            await handleAuthSessionChange(event, session);
        });
    } catch (err) {
        console.error('Auth check failed', err);
        renderLogin();
        setAuthView('login');
        showAuthError('Auth unavailable. Check Supabase URL/keys and Redirect URLs.');
    } finally {
        showLoading(false);
    }
}

// --- UI Navigation ---
let lastScrollTop = 0;
const scrollThreshold = 3;
let scrollRafId = 0;
let pendingScrollTop = 0;
let pendingMaxScroll = 0;

function updateScrollProgressFromMetrics(scrollTop, maxScroll) {
    const fill = document.getElementById('scroll-progress-fill');
    if (!fill) return;
    const ratio = maxScroll > 0 ? (scrollTop / maxScroll) : 0;
    const clamped = Math.max(0, Math.min(1, ratio));
    fill.style.transform = `scaleX(${clamped})`;
}

function updateScrollProgress(scrollEl) {
    if (!scrollEl) return;
    const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
    updateScrollProgressFromMetrics(scrollEl.scrollTop, maxScroll);
}

function getWindowScrollMetrics() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop || document.body.scrollTop || 0;
    const maxScroll = Math.max(0, doc.scrollHeight - doc.clientHeight);
    return { scrollTop, maxScroll };
}

function applyScrollUI(scrollTop, maxScroll) {
    // Keep top bar always visible - no scrolling behavior
}

function scheduleScrollUI(scrollTop, maxScroll) {
    pendingScrollTop = scrollTop;
    pendingMaxScroll = maxScroll;
    if (scrollRafId) return;
    scrollRafId = requestAnimationFrame(() => {
        scrollRafId = 0;
        applyScrollUI(pendingScrollTop, pendingMaxScroll);
    });
}

function handleWindowScroll() {
    const { scrollTop, maxScroll } = getWindowScrollMetrics();
    scheduleScrollUI(scrollTop, maxScroll);
}

function handleContentScroll(e) {
    const el = e.target;
    const scrollTop = el.scrollTop;
    const maxScroll = el.scrollHeight - el.clientHeight;
    scheduleScrollUI(scrollTop, maxScroll);
}

function renderLogin() {
    document.getElementById('auth-page').classList.add('active');
    document.getElementById('main-app').classList.remove('active');
    document.body.style.overflow = 'hidden';
    const mobileHeader = document.querySelector('.mobile-header');
    if (mobileHeader) mobileHeader.style.display = 'none';
}

function renderApp() {
    document.getElementById('auth-page').classList.remove('active');
    document.getElementById('main-app').classList.add('active');
    document.body.style.overflow = '';
    
    // Perceived speed: render identity from currentUser first
    const displayName = currentUser.name || currentUser.username;
    const nameEl = document.getElementById('user-display-name');
    if (nameEl) nameEl.textContent = displayName;
    
    identityInitialized = false;
    identitySnapshot = { level: 1, unlockedBadgeIds: [] };
    smartPersonalizationCache = { timestamp: 0, data: null };
    cachedHabits = [];
    notifiedHabits = new Set();
    
    updateUILanguage();
    renderProfileCard();
    
    // BUG FIX: Only redirect to tasks if we don't have a current view set
    // or if we're coming from the login screen
    if (!currentView || currentView === 'tasks') {
        showView('tasks');
    } else {
        showView(currentView);
    }
}

function renderProfileCard() {
    const name = (currentUser?.name || currentUser?.username || 'User').trim();
    const username = (currentUser?.username || 'user').trim();
    const avatarUrl = (currentUser?.avatar_url || '').trim();

    const avatarEl = document.getElementById('profile-avatar');
    if (avatarEl) {
        // Only use fallback if avatarUrl is truly empty
        avatarEl.src = avatarUrl ? avatarUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0a86ff&color=fff&size=128&bold=true`;
    }

    const nameEl = document.getElementById('profile-name');
    if (nameEl) nameEl.textContent = name;

    const idNameEl = document.getElementById('identity-name-display');
    if (idNameEl) idNameEl.textContent = name;

    const usernameEl = document.getElementById('profile-username');
    if (usernameEl) usernameEl.textContent = `@${username}`;

    const idUsernameEl = document.getElementById('identity-username-display');
    if (idUsernameEl) idUsernameEl.textContent = `@${username}`;

    const nameInput = document.getElementById('profile-name-input');
    if (nameInput && document.activeElement !== nameInput) {
        nameInput.value = name;
        nameInput.setAttribute('readonly', true);
        nameInput.classList.remove('editable');
    }

    const usernameInput = document.getElementById('profile-username-input');
    if (usernameInput && document.activeElement !== usernameInput) {
        usernameInput.value = username;
        usernameInput.setAttribute('readonly', true);
        usernameInput.classList.remove('editable');
    }

    updateProfileSaveState();
}

let profileDraft = { name: null, username: null, avatar_url: null };

function hasProfileChanges() {
    const currentName = (currentUser?.name || '').trim();
    const currentUsername = (currentUser?.username || '').trim();
    const currentAvatar = (currentUser?.avatar_url || '').trim();
    const draftName = (profileDraft.name ?? currentName).trim();
    const draftUsername = (profileDraft.username ?? currentUsername).trim();
    const draftAvatar = (profileDraft.avatar_url ?? currentAvatar).trim();
    return draftName !== currentName || draftUsername !== currentUsername || draftAvatar !== currentAvatar;
}

function updateProfileSaveState() {
    const btn = document.getElementById('profile-save-btn');
    const cancelBtn = document.getElementById('profile-cancel-btn');
    if (!btn || !cancelBtn) return;
    const changed = hasProfileChanges();
    btn.style.display = 'block'; // Always show
    btn.disabled = !changed;
    cancelBtn.style.display = 'block'; // Always show
    cancelBtn.disabled = !changed;
}

async function compressImageToDataUrl(file, size = 256, quality = 0.85) {
    const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(file);
    });

    const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Invalid image'));
        image.src = dataUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a86ff';
    ctx.fillRect(0, 0, size, size);

    const minSide = Math.min(img.width, img.height);
    const sx = Math.floor((img.width - minSide) / 2);
    const sy = Math.floor((img.height - minSide) / 2);
    ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

    return canvas.toDataURL('image/jpeg', quality);
}

function cancelProfileChanges() {
    profileDraft = { name: null, username: null, avatar_url: null };
    renderProfileCard();
    const fileInput = document.getElementById('profile-avatar-input');
    if (fileInput) fileInput.value = '';
    updateProfileSaveState();
}

async function updateProfile(name, username) {
    const payload = {};
    const newName = (name || '').trim();
    const newUsername = (username || '').trim();
    const newAvatar = (profileDraft.avatar_url || '').trim();

    if (!newName || !newUsername) {
        throw new Error('Name and username cannot be empty');
    }

    // Always include values in payload if they are changed or if we want to force update
    if (newName !== (currentUser?.name || '').trim()) payload.name = newName;
    if (newUsername !== (currentUser?.username || '').trim()) payload.username = newUsername;
    
    // CRITICAL: Handle avatar_url specifically
    if (profileDraft.avatar_url !== null) {
        payload.avatar_url = newAvatar; // This is the Base64 from the cropper
    }

    if (Object.keys(payload).length === 0) {
        return { name: currentUser?.name, username: currentUser?.username, avatar_url: currentUser?.avatar_url };
    }

    const result = await apiFetch('/identity/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });

    // Update LOCAL state immediately
    currentUser.name = result.name;
    currentUser.username = result.username;
    currentUser.avatar_url = result.avatar_url || null;

    // Force update UI elements
    const headerName = document.getElementById('user-display-name');
    if (headerName) headerName.textContent = currentUser.name || currentUser.username;

    // Reset draft and re-render
    profileDraft = { name: null, username: null, avatar_url: null };
    renderProfileCard();
    updateProfileSaveState();
    
    // Update Supabase metadata as well so it persists across sessions
    if (supabaseClient) {
        await supabaseClient.auth.updateUser({
            data: { 
                name: currentUser.name,
                username: currentUser.username,
                avatar_url: currentUser.avatar_url 
            }
        });
    }

    return result;
}

const _viewOrder = ['tasks', 'reports', 'insights', 'progress', 'me'];
let _prevView = null;

function showView(viewId, direction) {
    const prevViewId = currentView;
    currentView = viewId;
    localStorage.setItem('tm_last_view', viewId);

    // Determine slide direction if not explicitly given
    if (!direction) {
        const prevIdx = _viewOrder.indexOf(prevViewId);
        const nextIdx = _viewOrder.indexOf(viewId);
        if (prevIdx !== -1 && nextIdx !== -1) {
            direction = nextIdx > prevIdx ? 'forward' : 'back';
        } else {
            direction = 'forward';
        }
    }

    const inClass  = direction === 'forward' ? 'slide-in-right' : 'slide-in-left';

    const target = document.getElementById(`view-${viewId}`);

    // Strictly hide all views except target
    document.querySelectorAll('.view').forEach(v => {
        if (v !== target) {
            v.classList.remove('active', 'slide-in-right', 'slide-in-left', 'swipe-dragging');
            v.style.transform = '';
            v.style.opacity = '';
            v.style.display = 'none'; // strictly hidden
            v.style.position = '';
            v.style.width = '';
            v.style.pointerEvents = '';
        }
    });

    // Prepare new view with entry animation
    if (target) {
        target.classList.remove('active', 'slide-in-right', 'slide-in-left', 'swipe-dragging');
        target.style.transform = '';
        target.style.opacity = '';
        target.style.display = ''; // Let CSS handle it (.active gives display: flex)
        target.style.position = '';
        target.style.width = '';
        target.style.pointerEvents = '';
        target.classList.add(inClass);
        // Force reflow so transition fires
        target.offsetHeight; // eslint-disable-line no-unused-expressions
        target.classList.add('active');
        // Clean up animation class after transition
        setTimeout(() => {
            target.classList.remove('slide-in-right', 'slide-in-left');
        }, 200);
    }

    // Nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        const onClickAttr = item.getAttribute('onclick');
        if (onClickAttr && onClickAttr.includes(viewId)) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    syncBottomNavIndicator(viewId);

    // Scroll content to top
    const content = document.getElementById('content');
    if (content) {
        content.scrollTop = 0;
        window.scrollTo(0, 0);
        lastScrollTop = 0;
        const topBar = document.querySelector('.top-bar');
        if (topBar) topBar.classList.remove('hidden');
        updateScrollProgress(content);
        if (!content.dataset.scrollBound) {
            content.addEventListener('scroll', handleContentScroll);
            content.dataset.scrollBound = "true";
        }
    }

    if (!document.body.dataset.windowScrollBound) {
        window.addEventListener('scroll', handleWindowScroll, { passive: true });
        document.body.dataset.windowScrollBound = "true";
    }

    // Load Data with caching
    const now = Date.now();
    const CACHE_TTL = 30000;
    if (!window.viewCacheTime) window.viewCacheTime = {};
    if (window.viewCacheTime[viewId] && (now - window.viewCacheTime[viewId]) < CACHE_TTL) {
        return;
    }
    window.viewCacheTime[viewId] = now;

    if (viewId === 'reports') loadReports();
    if (viewId === 'me') loadMe();
    if (viewId === 'progress') loadProgressHub();
    if (viewId === 'tasks') {
        if (currentTasksGoalsTab === 'habits') loadHabits();
        else if (currentTasksGoalsTab === 'goals') loadGoals();
        else loadTasks();
    }
    if (viewId === 'goals') loadGoals();
    if (viewId === 'insights') loadInsights();
    if (viewId === 'settings') applyTheme();
}

// Invalidate caches when actions happen
function invalidateCaches() {
    window.viewCacheTime = {};
}

function getBottomNavViewOrder() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return [];
    const items = Array.from(nav.querySelectorAll('.nav-item'));
    const order = [];
    for (const item of items) {
        const handler = item.getAttribute('onclick') || '';
        const match = handler.match(/showView\('([^']+)'\)/);
        if (match && match[1]) order.push(match[1]);
    }
    return order;
}

function ensureBottomNavIndicator() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return null;
    let indicator = nav.querySelector('.nav-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'nav-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        const glow = nav.querySelector('.bottom-nav-glow');
        if (glow && glow.nextSibling) {
            nav.insertBefore(indicator, glow.nextSibling);
        } else {
            nav.insertBefore(indicator, nav.firstChild);
        }
    }
    nav.classList.add('has-indicator');
    return indicator;
}

function setBottomNavIndicatorOffset(nav, indicator, offsetPx) {
    indicator.style.transform = `translate(-50%, -50%) translateX(${offsetPx}px)`;
    nav.classList.add('has-indicator');
}

function syncBottomNavIndicator(viewId) {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;
    const indicator = ensureBottomNavIndicator();
    if (!indicator) return;
    const items = Array.from(nav.querySelectorAll('.nav-item'));
    const targetItem = items.find(item => (item.getAttribute('onclick') || '').includes(`'${viewId}'`));
    if (!targetItem) return;
    const navRect = nav.getBoundingClientRect();
    const itemRect = targetItem.getBoundingClientRect();
    const centerX = (itemRect.left + itemRect.right) / 2;
    const offset = centerX - (navRect.left + navRect.width / 2);
    setBottomNavIndicatorOffset(nav, indicator, offset);
}

function initBottomNavDragSwitch() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;
    if (nav.dataset.dragSwitchInit === 'true') return;
    nav.dataset.dragSwitchInit = 'true';

    const indicator = ensureBottomNavIndicator();
    let viewOrder = getBottomNavViewOrder();

    let startX = 0;
    let startY = 0;
    let pointerId = null;
    let dragging = false;
    let blockClickUntil = 0;
    let rafId = 0;
    let pendingX = 0;
    let pendingY = 0;

    function isMobile() {
        return window.innerWidth <= 768;
    }

    function computeNearestIndex(clientX) {
        const items = Array.from(nav.querySelectorAll('.nav-item'));
        const centers = items.map(item => {
            const r = item.getBoundingClientRect();
            return (r.left + r.right) / 2;
        });
        let bestIdx = 0;
        let bestDist = Infinity;
        for (let i = 0; i < centers.length; i++) {
            const d = Math.abs(centers[i] - clientX);
            if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
            }
        }
        return bestIdx;
    }

    function updateIndicatorFromClientX(clientX) {
        if (!indicator) return;
        const navRect = nav.getBoundingClientRect();
        const clampedX = Math.max(navRect.left, Math.min(navRect.right, clientX));
        const offset = clampedX - (navRect.left + navRect.width / 2);
        setBottomNavIndicatorOffset(nav, indicator, offset);
    }

    function scheduleMove(clientX, clientY) {
        pendingX = clientX;
        pendingY = clientY;
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            rafId = 0;
            handleMoveFrame(pendingX, pendingY);
        });
    }

    function handleMoveFrame(clientX, clientY) {
        const dx = clientX - startX;
        const dy = clientY - startY;

        if (!dragging) {
            if (Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy) * 0.8) { // Lower threshold for faster drag
                dragging = true;
                nav.classList.add('is-dragging');
            } else {
                return;
            }
        }

        updateIndicatorFromClientX(clientX);

        const idx = computeNearestIndex(clientX);
        const nextView = viewOrder[idx];
        if (nextView && nextView !== currentView) {
            showView(nextView);
        }
    }

    nav.addEventListener('pointerdown', (e) => {
        if (!isMobile()) return;
        if (e.pointerType !== 'touch') return;
        pointerId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        dragging = false;
        try { nav.setPointerCapture(pointerId); } catch (_) {}
    }, { passive: true });

    nav.addEventListener('pointermove', (e) => {
        if (!isMobile()) return;
        if (pointerId === null || e.pointerId !== pointerId) return;
        scheduleMove(e.clientX, e.clientY);
        if (dragging) e.preventDefault();
    }, { passive: false });

    function endPointer(e) {
        if (pointerId === null || e.pointerId !== pointerId) return;
        pointerId = null;
        if (dragging) {
            blockClickUntil = Date.now() + 350;
            nav.classList.remove('is-dragging');
            syncBottomNavIndicator(currentView);
        }
        dragging = false;
    }

    nav.addEventListener('pointerup', endPointer, { passive: true });
    nav.addEventListener('pointercancel', endPointer, { passive: true });

    nav.addEventListener('click', (e) => {
        if (!isMobile()) return;
        if (Date.now() < blockClickUntil) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    window.addEventListener('resize', () => {
        viewOrder = getBottomNavViewOrder();
        syncBottomNavIndicator(currentView);
    });
}

function focusInput(id) {
    const el = document.getElementById(id);
    if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function enableEdit(id) {
    const el = document.getElementById(id);
    if (el) {
        el.removeAttribute('readonly');
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Optional: add a class to show it's editable
        el.classList.add('editable');
    }
}


async function loadInsights() {
    try {
        let url = `/score/history?days=30`;
        if (currentUser.user_id && Number.isInteger(currentUser.user_id)) {
            url += `&user_id=${currentUser.user_id}`;
        }
        const history = await apiFetch(url);
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
    const hasTasks = cachedTasks && cachedTasks.length > 0;
    const hasHabits = cachedHabits && cachedHabits.length > 0;
    if (!hasTasks && !hasHabits) return;
    
    const now = new Date();
    
    if (hasTasks) {
        cachedTasks.forEach(task => {
            if (task.status !== 'pending' || !task.time) return;
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

    if (hasHabits) {
        cachedHabits.forEach(habit => {
            if (!habit.is_due_today || habit.today_status === 'completed' || !habit.preferred_time) return;
            const [h, m] = habit.preferred_time.split(':').map(Number);
            const habitTime = new Date();
            habitTime.setHours(h, m, 0, 0);
            const diffMinutes = (habitTime - now) / 60000;
            if (diffMinutes >= 0 && diffMinutes <= 10 && !notifiedHabits.has(habit.id)) {
                showToast(`Habit reminder: ${habit.title}`, 'info');
                notifiedHabits.add(habit.id);
            } else if (diffMinutes < -90 && !notifiedHabits.has(`nudge-${habit.id}`)) {
                showToast(`Gentle nudge: keep "${habit.title}" on track today`, 'info');
                notifiedHabits.add(`nudge-${habit.id}`);
            }
        });
    }
}

function showNotification(task) {
    showToast(`${t('reminder')}: ${task.title} @ ${task.time}`, 'info');
    // Sound could be added here
}

// --- Real Insights Upgrade ---
function renderRealInsights(tasks) {
    if (!tasks || tasks.length === 0) {
        document.getElementById('insight-best-day').textContent = 'Not enough data';
        document.getElementById('insight-best-hour').textContent = 'Not enough data';
        document.getElementById('insight-failure-pattern').textContent = 'Not enough data';
        return;
    }

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
    let bestDayIdx = null;
    let maxDayCount = 0;
    for (let d in dayCounts) {
        if (dayCounts[d] > maxDayCount) {
            bestDayIdx = d;
            maxDayCount = dayCounts[d];
        }
    }

    // Most active hours (only from completed tasks)
    const hourCounts = {};
    completed.forEach(t => {
        if (t.time) {
            const h = t.time.split(':')[0];
            hourCounts[h] = (hourCounts[h] || 0) + 1;
        }
    });
    let bestHour = null;
    let maxHourCount = 0;
    for (let h in hourCounts) {
        if (hourCounts[h] > maxHourCount) {
            bestHour = h;
            maxHourCount = hourCounts[h];
        }
    }

    // Update UI
    document.getElementById('insight-best-day').textContent = bestDayIdx !== null ? dayNames[bestDayIdx] : 'Not enough data';
    document.getElementById('insight-best-hour').textContent = bestHour !== null ? `${bestHour}:00` : 'Not enough data';
    
    // Update stats grid (if exists)
    const successVal = document.getElementById('success-value');
    if (successVal) successVal.textContent = `${rate.toFixed(0)}%`;

    // Failure patterns
    const failCategories = {};
    failed.forEach(t => failCategories[t.category] = (failCategories[t.category] || 0) + 1);
    let worstCat = null;
    let maxFailCount = 0;
    for (let c in failCategories) {
        if (failCategories[c] > maxFailCount) {
            worstCat = c;
            maxFailCount = failCategories[c];
        }
    }
    document.getElementById('insight-failure-pattern').textContent = worstCat !== null ? worstCat : 'None';
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
    
    if (supabaseAccessToken) {
        options.headers['Authorization'] = `Bearer ${supabaseAccessToken}`;
    }
    
    // Invalidate caches if it's a mutating request
    if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method.toUpperCase())) {
        if (!apiEndpoint.includes('/score/daily')) { // ignore read-only pseudo-POSTs
            if (typeof invalidateCaches === 'function') invalidateCaches();
        }
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${apiEndpoint}`, options);
        if (response.status === 401) {
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
        if (err.name === 'AbortError') {
            throw err;
        }
        if (err.message !== 'Session expired') {
            showToast(err.message, 'error');
        }
        throw err;
    }
}

// --- Auth Actions ---
function normalizeSupabaseError(err) {
    if (!err) return t('error_occurred');
    if (typeof err === 'string') return err;
    return err.message || err.error_description || err.description || t('error_occurred');
}

async function login(email, password) {
    if (!supabaseClient) return;
    setAuthBusy(true);
    showAuthError('');
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: (email || '').trim(),
            password: password || ''
        });
        if (error) throw error;
        await handleAuthSessionChange('SIGNED_IN', data.session);
    } catch (err) {
        showAuthError(normalizeSupabaseError(err));
    } finally {
        setAuthBusy(false);
    }
}

async function signup(name, username, email, password) {
    if (!supabaseClient) return;
    setAuthBusy(true);
    showAuthError('');
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: (email || '').trim(),
            password: password || '',
            options: {
                data: {
                    name: (name || '').trim(),
                    username: (username || '').trim()
                },
                emailRedirectTo: window.location.origin
            }
        });
        if (error) throw error;

        pendingVerificationEmail = (email || '').trim();
        if (data.session) {
            await handleAuthSessionChange('SIGNED_IN', data.session);
            return;
        }

        renderLogin();
        setAuthView('verify');
        showToast(t('verify_email_title'), 'success');
    } catch (err) {
        showAuthError(normalizeSupabaseError(err));
    } finally {
        setAuthBusy(false);
    }
}

async function signInWithGoogle() {
    if (!supabaseClient) return;
    setAuthBusy(true);
    showAuthError('');
    try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
                queryParams: { prompt: 'select_account' }
            }
        });
        if (error) throw error;
    } catch (err) {
        setAuthBusy(false);
        showAuthError(normalizeSupabaseError(err));
    }
}

async function sendPasswordReset(email) {
    if (!supabaseClient) return;
    setAuthBusy(true);
    showAuthError('');
    try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail((email || '').trim(), {
            redirectTo: window.location.origin
        });
        if (error) throw error;
        showToast(t('send_reset_link'), 'success');
        setAuthView('forgot');
    } catch (err) {
        showAuthError(normalizeSupabaseError(err));
    } finally {
        setAuthBusy(false);
    }
}

async function resendVerificationEmail() {
    if (!supabaseClient) return;
    const email = pendingVerificationEmail || document.getElementById('signup-email')?.value?.trim() || '';
    if (!email) return;
    setAuthBusy(true);
    showAuthError('');
    try {
        const { error } = await supabaseClient.auth.resend({ type: 'signup', email });
        if (error) throw error;
        showToast(t('resend_verification'), 'success');
    } catch (err) {
        showAuthError(normalizeSupabaseError(err));
    } finally {
        setAuthBusy(false);
    }
}

async function verifyEmailCode() {
    if (!supabaseClient) return;
    const email =
        pendingVerificationEmail ||
        document.getElementById('signup-email')?.value?.trim() ||
        document.getElementById('login-email')?.value?.trim() ||
        '';
    const code = document.getElementById('verify-otp')?.value?.trim() || '';
    if (!email || !code) return;
    setAuthBusy(true);
    showAuthError('');
    try {
        const { data, error } = await supabaseClient.auth.verifyOtp({
            email,
            token: code,
            type: 'email'
        });
        if (error) throw error;
        pendingVerificationEmail = null;
        await handleAuthSessionChange('VERIFY_OTP', data.session);
    } catch (err) {
        showAuthError(normalizeSupabaseError(err));
    } finally {
        setAuthBusy(false);
    }
}

async function verifyRecoveryCode() {
    if (!supabaseClient) return;
    const email = document.getElementById('forgot-email')?.value?.trim() || '';
    const code = document.getElementById('recovery-otp')?.value?.trim() || '';
    if (!email || !code) return;
    setAuthBusy(true);
    showAuthError('');
    try {
        const { data, error } = await supabaseClient.auth.verifyOtp({
            email,
            token: code,
            type: 'recovery'
        });
        if (error) throw error;
        await handleAuthSessionChange('PASSWORD_RECOVERY', data.session);
    } catch (err) {
        showAuthError(normalizeSupabaseError(err));
    } finally {
        setAuthBusy(false);
    }
}

async function updatePassword(newPassword, confirmPassword) {
    if (!supabaseClient) return;
    showAuthError('');
    if (!newPassword || newPassword.length < 8) {
        showAuthError('Password must be at least 8 characters');
        return;
    }
    if (newPassword !== confirmPassword) {
        showAuthError('Passwords do not match');
        return;
    }
    setAuthBusy(true);
    try {
        const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
        if (error) throw error;
        const { data } = await supabaseClient.auth.getSession();
        await handleAuthSessionChange('USER_UPDATED', data.session);
        showToast(t('update_password'), 'success');
    } catch (err) {
        showAuthError(normalizeSupabaseError(err));
    } finally {
        setAuthBusy(false);
    }
}

function resetUiToDefaults() {
    currentView = 'tasks';
    currentTasksGoalsTab = 'tasks';
    calendarDate = new Date();
    dashboardCalendarDate = new Date();
    cachedTasks = [];
    cachedGoals = [];
    cachedHabits = [];
    calendarTasks = [];
    notifiedTasks = new Set();
    notifiedHabits = new Set();
    currentGoalForReflection = null;
    identityInitialized = false;
    identitySnapshot = { level: 1, unlockedBadgeIds: [] };
    smartPersonalizationCache = { timestamp: 0, data: null };

    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.querySelectorAll('.hamburger').forEach(h => h.classList.remove('active'));
    document.body.classList.remove('sidebar-open');
}

function clearUrlTokens() {
    if (window.location.hash) {
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }
}

function logout() {
    (async () => {
        showLoading(true);
        try {
            await supabaseClient?.auth?.signOut();
        } finally {
            currentUser = null;
            supabaseSession = null;
            supabaseAccessToken = null;
            pendingVerificationEmail = null;
            
            // Clear all user-specific cache keys from localStorage on logout
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.startsWith('tm_') && !['tm_dark_mode', 'tm_lang', 'tm_last_view'].includes(key)) {
                    localStorage.removeItem(key);
                }
            }
            localStorage.removeItem('seasonal_challenges_claimed');

            resetUiToDefaults();
            clearUrlTokens();
            renderLogin();
            setAuthView('login');
            showLoading(false);
        }
    })();
}

function getScoreLabel(score) {
    if (score > 75) return { text: 'Excellent', icon: '🏆', class: 'excellent' };
    if (score > 50) return { text: 'Good', icon: '✨', class: 'good' };
    if (score > 20) return { text: 'Average', icon: '⚡', class: 'average' };
    return { text: 'Low', icon: '⚠️', class: 'low' };
}

function getBadgeImageSrc(scoreClass) {
    const map = {
        excellent: 'excellent',
        good: 'good',
        average: 'average',
        low: 'low',
    };
    const key = map[scoreClass] || 'low';
    if (window.BADGE_ASSETS && window.BADGE_ASSETS[key]) {
        return window.BADGE_ASSETS[key];
    }
    // Fallback if badge_assets.js is not loaded or fails
    return `/static/badge_${key}.png`;
}

// --- Reports & Me Logic ---
async function loadReports() {
    try {
        const container = document.getElementById('dashboard-hero-metrics');
        if (container) {
            const cachedHtml = localStorage.getItem('tm_hero_metrics_html');
            if (cachedHtml) {
                container.innerHTML = cachedHtml;
            } else {
                // Show skeleton while loading
                container.innerHTML = `
                    <div class="skeleton-card">
                        <div style="display:flex;align-items:center;gap:0.8rem;margin-bottom:1rem;">
                            <div class="skeleton skeleton-circle"></div>
                            <div style="flex:1"><div class="skeleton skeleton-line lg"></div><div class="skeleton skeleton-line sm"></div></div>
                        </div>
                        <div class="skeleton skeleton-line xl"></div>
                        <div class="skeleton skeleton-line"></div>
                        <div class="skeleton skeleton-line sm"></div>
                    </div>
                    <div class="skeleton-card">
                        <div class="skeleton skeleton-line lg"></div>
                        <div class="skeleton skeleton-line"></div>
                        <div class="skeleton skeleton-line sm"></div>
                    </div>`;
            }
        }

        const today = new Date().toISOString().split('T')[0];

        const scorePromise = apiFetch('/score/daily', {
            method: 'POST',
            body: JSON.stringify({ user_id: currentUser.user_id, day: today })
        });

        const calendarPromise = renderDashboardCalendar();

        const score = await scorePromise;
        await calendarPromise;

        await renderHeroMetrics(score);

        const progressFill = document.getElementById('daily-progress-fill');
        if (progressFill) progressFill.style.width = `${score.success_rate * 100}%`;

        const multBadge = document.getElementById('multiplier-badge');
        if (multBadge) {
            if (score.multiplier > 1.0) {
                multBadge.textContent = `${score.multiplier.toFixed(1)}x Boost${score.goal_bonus > 0 ? ` +${score.goal_bonus.toFixed(0)} Goal` : ''}`;
                multBadge.style.display = 'inline-block';
            } else {
                multBadge.style.display = 'none';
            }
        }

        await Promise.all([loadWeeklySummary(), loadTodayHabits()]);

    } catch (err) {
        console.error('Reports load failed', err);
    }
}

async function loadMe() {
    try {
        // Show skeleton immediately in key containers
        const identitySection = document.getElementById('identity-section');
        if (identitySection && !identitySection.querySelector('.identity-header')) {
            identitySection.innerHTML = `
                <div class="skeleton-card">
                    <div style="display:flex;align-items:center;gap:0.8rem;margin-bottom:1rem;">
                        <div class="skeleton skeleton-circle"></div>
                        <div style="flex:1"><div class="skeleton skeleton-line lg"></div><div class="skeleton skeleton-line sm"></div></div>
                    </div>
                    <div class="skeleton skeleton-line"></div>
                    <div class="skeleton skeleton-line sm"></div>
                </div>`;
        }
        renderProfileCard();
        
        const today = new Date().toISOString().split('T')[0];
        
        // Parallelize everything
        const promises = [
            loadIdentityProfile(),
            loadDashboardPersonalization(),
            loadScoreComparison(),
            loadMissedTasks()
        ];

        const pieEl = document.getElementById('task-pie-chart');
        if (pieEl) {
            let tasksUrl = `/tasks?day=${today}`;
            if (currentUser.user_id && Number.isInteger(currentUser.user_id)) {
                tasksUrl += `&user_id=${currentUser.user_id}`;
            }
            promises.push(apiFetch(tasksUrl).then(tasks => updateTaskChart(tasks)));
        }

        const trendEl = document.getElementById('weekly-trend-chart');
        if (trendEl) {
            promises.push(loadWeeklyTrend());
        }

        await Promise.all(promises);

        // Load embedded Me-Insights section (non-critical)
        try {
            await loadMeInsights();
        } catch(e) { console.warn('Me insights failed', e); }

    } catch (err) {
        console.error('Me load failed', err);
    }
}

async function loadMeInsights() {
    // Fetch 30-day score history
    const history = await apiFetch('/score/history?days=30');
    
    // Best Day
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStats = Array(7).fill(0).map((_, i) => ({ name: dayNames[i], completed: 0 }));
    let tasks30d = 0;
    history.forEach(entry => {
        const d = new Date(entry.date);
        if (entry.success_rate > 0.5) dayStats[d.getDay()].completed++;
        tasks30d += (entry.completed_tasks || 0);
    });
    const bestIdx = dayStats.reduce((best, cur, i) => cur.completed > dayStats[best].completed ? i : best, 0);
    const bestDayEl = document.getElementById('me-insight-best-day');
    if (bestDayEl) bestDayEl.textContent = dayStats[bestIdx].name;

    // Tasks 30d
    const tasks30dEl = document.getElementById('me-tasks-30d');
    if (tasks30dEl) tasks30dEl.textContent = history.reduce((s, e) => s + (e.completed_tasks || 0), 0);

    // Goal Rate from identity
    try {
        const identity = await apiFetch('/identity/profile');
        const total = (identity.completed_goals || 0) + (identity.failed_goals || 0);
        const rateEl = document.getElementById('me-goal-completion-rate');
        if (rateEl) rateEl.textContent = total > 0 ? `${Math.round((identity.completed_goals / total) * 100)}%` : '—';

        // Smart insights mini feed
        const miniInsights = generateSmartInsightCards(identity, history);
        const feedEl = document.getElementById('me-smart-insights');
        if (feedEl && miniInsights.length > 0) {
            feedEl.innerHTML = miniInsights.slice(0, 2).map(c => `
                <div class="insight-card" style="margin-bottom:0.5rem; padding:0.75rem 1rem;">
                    <span class="icon"><i class="${c.icon}"></i></span>
                    <div class="insight-content">
                        <h4 style="font-size:0.8rem;">${c.title}</h4>
                        <p style="font-size:0.72rem;">${c.body}</p>
                    </div>
                </div>
            `).join('');
        }
    } catch(e) { /* silent */ }

    // Mini weekly trend chart for Me
    const meTrendEl = document.getElementById('me-weekly-trend-chart');
    if (meTrendEl && history.length > 0) {
        const last7 = history.slice(-7);
        const ctx = meTrendEl.getContext('2d');
        if (window._meTrendChart) window._meTrendChart.destroy();
        const textColor = isDarkMode ? '#FFFFFF' : '#0F172A';
        const gridColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
        window._meTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7.map(s => s.date.split('-').slice(1).join('/')),
                datasets: [{
                    label: 'Score',
                    data: last7.map(s => s.score),
                    borderColor: '#0a86ff',
                    backgroundColor: 'rgba(10,134,255,0.1)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 4,
                    pointBackgroundColor: '#0a86ff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, max: 150, grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } },
                    x: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } } }
                }
            }
        });
    }
}

async function loadDashboard() {
    await Promise.all([loadReports(), loadMe()]);
}

const logoBackgroundCache = new Map();
function removeBlackBackground(imageSrc, scale = 1, isLogo = false) {
    if (!imageSrc) return Promise.resolve('');
    const cacheKey = imageSrc + '_' + scale + '_' + isLogo;
    if (logoBackgroundCache.has(cacheKey)) {
        return Promise.resolve(logoBackgroundCache.get(cacheKey));
    }
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            // Downscale high-resolution images to 256x256 for instant processing and crisp mobile/desktop display
            const targetSize = 256;
            canvas.width = targetSize;
            canvas.height = targetSize;
            
            // Apply scale and center
            const drawSize = targetSize * scale;
            const offset = (targetSize - drawSize) / 2;
            
            ctx.drawImage(img, offset, offset, drawSize, drawSize);
            const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
            const data = imageData.data;
            
            // For logo, use a much higher threshold to ensure all dark/black pixels are completely invisible
            const threshold = isLogo ? 97 : 5;
            const feather = isLogo ? 100 : 8;
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Calculate max channel value
                const maxVal = Math.max(r, g, b);
                
                if (maxVal < threshold) {
                    data[i + 3] = 0;
                } else if (maxVal < feather) {
                    const factor = (maxVal - threshold) / (feather - threshold);
                    data[i + 3] = Math.round(data[i + 3] * factor);
                }
            }
            ctx.putImageData(imageData, 0, 0);
            const resultUrl = canvas.toDataURL('image/png');
            logoBackgroundCache.set(cacheKey, resultUrl);
            resolve(resultUrl);
        };
        img.src = imageSrc;
    });
}

async function renderHeroMetrics(score) {
    const container = document.getElementById('dashboard-hero-metrics');
    if (!container) return;

    cachedDailyScore = score;

    const label = getScoreLabel(score.score);
    const scoreVal = score.score.toFixed(1);
    const isLightMode = document.body.classList.contains('light-mode');
    
    const trustBg = 'var(--trust-bg)';
    const streakBg = 'var(--streak-bg)';
    const successBg = 'var(--success-bg)';
    const progressTrackBg = 'var(--progress-track-bg)';
    const progressTrackBorder = 'var(--progress-track-border)';

    // Define structure without waiting for slow image processing
    const htmlContent = `
        <!-- Card 1: Trust Score -->
        <div class="hero-metric hero-metric--trust" style="background: ${trustBg} !important;">
            <div class="hero-metric-content">
                <div class="hero-metric-icon">
                    <img id="hero-img-trust" src="">
                </div>
                <div class="hero-metric-label">Self Trust Score</div>
                <div class="hero-metric-value">${scoreVal}</div>
                <img class="trust-score-badge" src="${getBadgeImageSrc(label.class)}" alt="${label.text}">
            </div>
        </div>

        <!-- Card 2: Streak -->
        <div class="hero-metric" style="background: ${streakBg} !important;">
            <div class="hero-metric-content">
                <div class="hero-metric-icon">
                    <img id="hero-img-streak" src="">
                </div>
                <div class="hero-metric-label">Current Streak</div>
                <div class="hero-metric-value">${score.streak}</div>
            </div>
        </div>

        <!-- Card 3: Success -->
        <div class="hero-metric" style="background: ${successBg} !important;">
            <div class="hero-metric-content">
                <div class="hero-metric-icon">
                    <img id="hero-img-success" src="">
                </div>
                <div class="hero-metric-label">Success Rate</div>
                <div class="hero-metric-value">${(score.success_rate * 100).toFixed(0)}%</div>
                <div style="margin-top: 40px; width: 100%; background: ${progressTrackBg}; height: 8px; border-radius: 10px; overflow: hidden; border: 1px solid ${progressTrackBorder};">
                    <div style="width: ${score.success_rate * 100}%; height: 100%; background: #4ade80; box-shadow: none; border-radius: 10px;"></div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = htmlContent;
    localStorage.setItem('tm_hero_metrics_html', htmlContent);

    // Process images non-blocking
    Promise.all([
        removeBlackBackground(ASSETS.img1),
        removeBlackBackground(ASSETS.img4),
        removeBlackBackground(ASSETS.img6)
    ]).then(([img1, img4, img6]) => {
        const trustEl = document.getElementById('hero-img-trust');
        const streakEl = document.getElementById('hero-img-streak');
        const successEl = document.getElementById('hero-img-success');
        
        if (trustEl) trustEl.src = img1;
        if (streakEl) streakEl.src = img4;
        if (successEl) successEl.src = img6;
        
        // Cache the fully rendered HTML with base64 images included
        if (container) {
            localStorage.setItem('tm_hero_metrics_html', container.innerHTML);
        }
    }).catch(err => console.error("Error processing hero metrics images:", err));
}

async function getSmartPersonalization(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && smartPersonalizationCache.data && (now - smartPersonalizationCache.timestamp) < 60000) {
        return smartPersonalizationCache.data;
    }
    const data = await apiFetch('/insights/smart');
    smartPersonalizationCache = { timestamp: now, data };
    return data;
}

function renderDashboardPersonalization(smartData) {
    const listEl = document.getElementById('for-you-list');
    const pressureEl = document.getElementById('for-you-pressure');
    if (!listEl || !pressureEl) return;

    const messages = (smartData.for_you || []).slice(0, 4);
    listEl.innerHTML = messages.map(m => `<div class="for-you-item">${m}</div>`).join('');
    if (messages.length === 0) {
        listEl.innerHTML = `<div class="for-you-item">Keep completing tasks to unlock personalized guidance</div>`;
    }

    const pressure = smartData.pressure_level || 'normal';
    pressureEl.textContent = pressure === 'light' ? 'Low Pressure' : pressure === 'high' ? 'High Momentum' : 'Balanced';
    pressureEl.className = `priority-badge ${pressure === 'light' ? 'priority-low' : pressure === 'high' ? 'priority-high' : 'priority-medium'}`;
}

async function loadDashboardPersonalization() {
    try {
        const smartData = await getSmartPersonalization();
        renderDashboardPersonalization(smartData);
    } catch (err) {
        console.error('Dashboard personalization load failed', err);
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
            let url = `/tasks?day=${today}`;
            if (currentUser.user_id && Number.isInteger(currentUser.user_id)) {
                url += `&user_id=${currentUser.user_id}`;
            }
            const todayTasks = await apiFetch(url);
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
        const container = document.getElementById('weekly-summary');
        const content = document.getElementById('weekly-summary-content');
        
        if (container && content) {
            const cachedHtml = localStorage.getItem('tm_weekly_summary_html');
            if (cachedHtml) {
                container.style.display = 'block';
                content.innerHTML = cachedHtml;
            }
        }

        const data = await apiFetch('/score/weekly-summary');
        
        container.style.display = 'block';
        
        const html = `
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
        content.innerHTML = html;
        localStorage.setItem('tm_weekly_summary_html', html);
    } catch (err) {
        console.error('Weekly summary load failed', err);
    }
}

// --- Insights Logic ---
async function loadInsights() {
    try {
        // Fast path: load cached Today's Insights immediately
        try {
            const feedCacheKey = 'tm_todays_insights';
            const feed = document.getElementById('dashboard-intelligence-feed');
            if (feed) {
                const cachedHtml = localStorage.getItem(feedCacheKey);
                if (cachedHtml) feed.innerHTML = cachedHtml;
            }
        } catch(e) {}

        // Fast path: load cached Personal Records immediately
        try {
            // We pass a dummy identity since renderPersonalRecords uses cache inside it
            // but it needs total_tasks etc. Let's get it from tm_cached_identity if available
            const cachedIdStr = localStorage.getItem('tm_cached_identity');
            if (cachedIdStr) {
                renderPersonalRecords(JSON.parse(cachedIdStr));
            } else {
                renderPersonalRecords({ completed_tasks: 0, completed_goals: 0, streak: 0, trust_score: 0, total_xp: 0 });
            }
        } catch(e) {}

        // Non-blocking fetch for insights
        getSmartPersonalization().then(smartData => {
            const container = document.getElementById('smart-insights-container');
            
            const smartMessages = [
                ...(smartData.insights || []),
                ...(smartData.suggestions || []),
                ...(smartData.adaptive_feedback || []),
                ...(smartData.habit_insights || []),
            ].slice(0, 6);
            if (smartMessages.length > 0) {
                container.innerHTML = smartMessages.map(insight => `
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

            const completionRate = document.getElementById('goal-completion-rate');
            const achievedFailed = document.getElementById('goal-achieved-failed');
            const averageTime = document.getElementById('goal-average-time');
            if (completionRate) completionRate.textContent = `${smartData.goal_completion_rate || 0}%`;
            if (achievedFailed) achievedFailed.textContent = `${smartData.goals_achieved || 0} / ${smartData.goals_failed || 0}`;
            if (averageTime) averageTime.textContent = `${smartData.average_completion_time || 0}d`;
        }).catch(err => console.error('Smart insights load failed', err));

        const end = new Date();
        const start = new Date(Date.now() - 120 * 86400000);
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];
        
        apiFetch(`/tasks/range?start_date=${startStr}&end_date=${endStr}`).then(tasks => {
            renderRealInsights(tasks);
        }).catch(err => console.error('Tasks range for insights failed', err));
        
        loadIdentityProfile();
        
        // Also populate Today's Insights and Personal Records with fresh data
        try {
            const identity = await apiFetch('/identity/profile');
            const history = await apiFetch('/score/history?days=30');
            const todayStr = new Date().toISOString().split('T')[0];
            const todayScore = await apiFetch('/score/daily', {
                method: 'POST',
                body: JSON.stringify({ user_id: currentUser.user_id, day: todayStr })
            });
            generateDashboardIntelligence(identity, todayScore, history);
            const feed = document.getElementById('dashboard-intelligence-feed');
            if (feed) localStorage.setItem('tm_todays_insights', feed.innerHTML);
            
            renderPersonalRecords(identity);
        } catch(e) {
            console.error('Failed to load insight feeds', e);
        }
        
    } catch (err) {
        console.error('Insights load failed', err);
    }
}

async function loadWeeklyTrend() {
    try {
        let url = `/score/history?days=7`;
        if (currentUser.user_id && Number.isInteger(currentUser.user_id)) {
            url += `&user_id=${currentUser.user_id}`;
        }
        const scores = await apiFetch(url);
        updateTrendChart(scores);
    } catch (err) {
        console.error('Trend load failed', err);
    }
}

function updateTrendChart(history) {
    cachedWeeklyTrendHistory = history;
    const canvas = document.getElementById('weekly-trend-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (trendChart) trendChart.destroy();

    const labels = history.map(s => s.date.split('-').slice(1).reverse().join('/'));
    const data = history.map(s => s.score);

    const rootStyles = getComputedStyle(document.documentElement);
    const primary = rootStyles.getPropertyValue('--primary').trim() || '#0066FF';
    const primary2 = rootStyles.getPropertyValue('--primary-2').trim() || primary;
    const primary3 = rootStyles.getPropertyValue('--primary-3').trim() || primary;

    const textColor = isDarkMode ? '#FFFFFF' : '#0F172A';
    const bgColor = isDarkMode ? '#111827' : '#FFFFFF';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    const stroke = ctx.createLinearGradient(0, 0, 420, 0);
    stroke.addColorStop(0, primary2);
    stroke.addColorStop(0.5, primary);
    stroke.addColorStop(1, primary3);
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, isDarkMode ? 'rgba(34, 211, 238, 0.22)' : 'rgba(34, 211, 238, 0.16)');
    gradient.addColorStop(0.45, isDarkMode ? 'rgba(10, 134, 255, 0.16)' : 'rgba(10, 134, 255, 0.12)');
    gradient.addColorStop(1, isDarkMode ? 'rgba(167, 139, 250, 0.05)' : 'rgba(167, 139, 250, 0.03)');
    const fillColor = gradient;

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: t('trust_score'),
                data: data,
                borderColor: stroke,
                backgroundColor: fillColor,
                fill: true,
                tension: 0.35,
                pointRadius: 5,
                pointBackgroundColor: primary2,
                pointBorderColor: bgColor,
                pointBorderWidth: 3,
                pointHoverBackgroundColor: primary3,
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
    cachedTasksForChart = tasks;
    const counts = {
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: tasks.filter(t => t.status === 'failed').length,
        pending: tasks.filter(t => t.status === 'pending').length
    };

    const canvas = document.getElementById('task-pie-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (taskChart) {
        taskChart.destroy();
    }

    const textColor = isDarkMode ? '#FFFFFF' : '#0F172A';
    const bgColor = isDarkMode ? '#111827' : '#FFFFFF';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    const pendingColor = isDarkMode ? 'rgba(10, 134, 255, 0.14)' : 'rgba(10, 134, 255, 0.10)';

    taskChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [t('completed'), t('failed'), t('pending')],
            datasets: [{
                data: [counts.completed, counts.failed, counts.pending],
                backgroundColor: ['#22c55e', '#ef4444', pendingColor],
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
        
        let url = `/tasks?day=${today}`;
        if (currentUser.user_id && Number.isInteger(currentUser.user_id)) {
            url += `&user_id=${currentUser.user_id}`;
        }
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

function formatHabitDays(habit) {
    if (habit.frequency_type === 'daily') return 'Daily';
    const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return (habit.frequency_days || []).map(d => names[d] || '').filter(Boolean).join(', ');
}

function renderHabits(habits) {
    const list = document.getElementById('habits-list');
    if (!list) return;
    if (!habits || habits.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <span class="empty-state-icon">🧠</span>
                <h3 class="empty-state-title">No habits yet</h3>
                <p class="empty-state-text">Build consistency with your first recurring habit.</p>
                <button onclick="toggleHabitForm()" class="btn primary">CREATE HABIT</button>
            </div>
        `;
        return;
    }
    list.innerHTML = habits.map(habit => `
        <div class="task-card habit-card ${habit.today_status === 'completed' ? 'completed' : habit.today_status === 'skipped' ? 'failed' : ''}">
            <div class="task-info">
                <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                    <h3>${habit.title}</h3>
                    <span class="priority-badge priority-medium">${habit.category}</span>
                    <span class="priority-badge priority-low">🔥 ${habit.streak}</span>
                    <span class="priority-badge priority-low">${habit.consistency_score.toFixed(0)}% consistency</span>
                </div>
                <div class="habit-meta">
                    <span>${formatHabitDays(habit)}</span>
                    ${habit.preferred_time ? `<span>⏰ ${habit.preferred_time}</span>` : ''}
                    <span>Best streak ${habit.best_streak}</span>
                </div>
            </div>
            <div class="task-actions">
                ${habit.today_status === 'completed' ? `
                    <div class="status-badge completed"><span>Completed ✔</span></div>
                ` : habit.today_status === 'skipped' ? `
                    <div class="status-badge failed"><span>Skipped</span></div>
                ` : habit.is_due_today ? `
                    <button class="btn task-btn completed" onclick="trackHabit(${habit.id}, 'completed')">Complete</button>
                    <button class="btn task-btn failed" onclick="trackHabit(${habit.id}, 'skipped')">Skip</button>
                ` : `
                    <div class="status-badge pending"><span>Not scheduled today</span></div>
                `}
            </div>
        </div>
    `).join('');
}

async function loadHabits() {
    try {
        const habits = await apiFetch('/habits');
        cachedHabits = habits;
        renderHabits(habits);
        if (currentView === 'reports') renderTodayHabits(habits);
    } catch (err) {
        const list = document.getElementById('habits-list');
        if (list) list.innerHTML = `<div class="empty-state"><p class="error-msg">${err.message}</p></div>`;
    }
}

function renderTodayHabits(habits) {
    const list = document.getElementById('today-habits-list');
    if (!list) return;
    const dueHabits = (habits || []).filter(h => h.is_due_today);
    if (dueHabits.length === 0) {
        list.innerHTML = `<div class="for-you-item">No habits scheduled for today.</div>`;
        return;
    }
    const html = dueHabits.map(habit => `
        <div class="for-you-item">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
                <span>${habit.title} 🔥 ${habit.streak}</span>
                <span>${habit.consistency_score.toFixed(0)}%</span>
            </div>
            <div style="display:flex; gap:0.45rem; margin-top:0.45rem;">
                ${habit.today_status ? `<span class="priority-badge ${habit.today_status === 'completed' ? 'priority-low' : 'priority-high'}">${habit.today_status}</span>` : `
                    <button class="btn task-btn completed" onclick="trackHabit(${habit.id}, 'completed')">Complete</button>
                    <button class="btn task-btn failed" onclick="trackHabit(${habit.id}, 'skipped')">Skip</button>
                `}
            </div>
        </div>
    `).join('');
    list.innerHTML = html;
    localStorage.setItem('tm_today_habits_html', html);
}

async function loadTodayHabits() {
    const list = document.getElementById('today-habits-list');
    if (list) {
        const cachedHtml = localStorage.getItem('tm_today_habits_html');
        if (cachedHtml) {
            list.innerHTML = cachedHtml;
        }
    }

    if (cachedHabits.length > 0) {
        renderTodayHabits(cachedHabits);
        return;
    }
    try {
        const habits = await apiFetch('/habits');
        cachedHabits = habits;
        renderTodayHabits(habits);
    } catch (err) {
        if (list && !list.innerHTML) {
            list.innerHTML = `<div class="for-you-item">Unable to load habits now.</div>`;
        }
    }
}

async function trackHabit(habitId, status) {
    const previous = [...cachedHabits];
    cachedHabits = cachedHabits.map(h => h.id === habitId ? { ...h, today_status: status } : h);
    renderHabits(cachedHabits);
    renderTodayHabits(cachedHabits);
    try {
        await apiFetch(`/habits/${habitId}/track`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        smartPersonalizationCache = { timestamp: 0, data: null };
        await Promise.all([loadHabits(), loadReports()]);
    } catch (err) {
        cachedHabits = previous;
        renderHabits(cachedHabits);
        renderTodayHabits(cachedHabits);
    }
}

function toggleHabitDaysSelector(freq) {
    const group = document.getElementById('habit-days-group');
    if (!group) return;
    group.style.display = freq === 'weekly' ? 'block' : 'none';
}

function getSelectedHabitDays() {
    return Array.from(document.querySelectorAll('#habit-days-group input[type="checkbox"]:checked'))
        .map(el => Number(el.value))
        .filter(v => Number.isInteger(v));
}

function toggleHabitForm() {
    const container = document.getElementById('habit-form-container');
    container.classList.toggle('active');
    if (container.classList.contains('active')) {
        document.getElementById('habit-title').value = '';
        document.getElementById('habit-category').value = 'General';
        document.getElementById('habit-time').value = '';
        document.getElementById('habit-frequency').value = 'daily';
        document.querySelectorAll('#habit-days-group input[type="checkbox"]').forEach(el => { el.checked = false; });
        
        // Populate habit-goal-select
        const habitGoalSelect = document.getElementById('habit-goal-select');
        if (habitGoalSelect) {
            const activeGoals = cachedGoals.filter(g => g.status === 'active');
            habitGoalSelect.innerHTML = `<option value="">No Link</option>` + activeGoals.map(g => `<option value="${g.id}">${g.title}</option>`).join('');
        }
        
        toggleHabitDaysSelector('daily');
    }
}

async function addHabit() {
    const title = document.getElementById('habit-title').value.trim();
    const category = document.getElementById('habit-category').value.trim() || 'general';
    const frequency = document.getElementById('habit-frequency').value;
    const preferredTime = document.getElementById('habit-time').value || null;
    const frequencyDays = frequency === 'weekly' ? getSelectedHabitDays() : null;
    if (frequency === 'weekly' && (!frequencyDays || frequencyDays.length === 0)) {
        showToast('Select at least one day for weekly habit', 'error');
        return;
    }
    const goalSelect = document.getElementById('habit-goal-select');
    const goalId = goalSelect && goalSelect.value ? Number(goalSelect.value) : null;

    const newHabit = await apiFetch('/habits', {
        method: 'POST',
        body: JSON.stringify({
            title,
            category,
            frequency_type: frequency,
            frequency_days: frequencyDays,
            preferred_time: preferredTime,
            goal_id: goalId,
        }),
    });
    smartPersonalizationCache = { timestamp: 0, data: null };
    toggleHabitForm();
    
    // Optimistic UI update
    if (newHabit && newHabit.id) {
        cachedHabits.unshift(newHabit);
        renderHabits(cachedHabits);
    } else {
        await loadHabits();
    }
    showToast('Habit created', 'success');
}

function showSmartSuggestion() {
    const container = document.getElementById('smart-suggestion-container');
    if (!container) return;

    const smart = smartPersonalizationCache.data;
    let suggestion = '';
    if (smart && smart.suggestions && smart.suggestions.length > 0) {
        suggestion = smart.suggestions[0];
    } else {
        const now = new Date();
        const hour = now.getHours();
        if (hour >= 8 && hour <= 10) suggestion = t('best_time_to_create');
        else if (hour >= 14 && hour <= 16) suggestion = t('optimal_time') + " 15:30";
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
                <h3 class="empty-state-title">No tasks yet</h3>
                <p class="empty-state-text">Create your first task to stay organized and productive.</p>
                <button onclick="toggleCurrentForm()" class="btn primary">CREATE TASK</button>
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
                    ${task.goal_id ? `<p>🎯 Linked Goal</p>` : ''}
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

async function addTask(title, category, difficulty, date, time, startTime) {
    const priority = document.getElementById('task-priority').value;
    const recurring = document.getElementById('task-recurring').value;
    const dueDate = document.getElementById('task-due-date').value;


    const submitBtn = document.querySelector('#add-task-form button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳</span> Processing...';
    
    try {
        const taskDate = date || new Date().toISOString().split('T')[0];
        // Read goal / habit link
        const goalId = _taskLinks.goal
            ? (document.getElementById('task-goal-select')?.value ? Number(document.getElementById('task-goal-select').value) : null)
            : null;
        const habitIdForTask = _taskLinks.habit
            ? (document.getElementById('task-habit-select')?.value ? Number(document.getElementById('task-habit-select').value) : null)
            : null;

        const newTask = await apiFetch('/tasks', {
            method: 'POST',
            body: JSON.stringify({ 
                user_id: currentUser.user_id,
                title, category, difficulty,
                priority, recurring,
                due_date: dueDate || null,
                date: taskDate,
                time: time || null,
                start_time: startTime || null,
                goal_id: goalId,
                habit_id: habitIdForTask
            })
        });
        smartPersonalizationCache = { timestamp: 0, data: null };
        toggleTaskForm();
        
        // Optimistic UI update: skip the GET request and just push the new task
        if (newTask && newTask.id) {
            cachedTasks.unshift(newTask);
            renderTasks(cachedTasks);
        } else {
            loadTasks();
        }
        if (goalId) loadGoals();
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
        smartPersonalizationCache = { timestamp: 0, data: null };
        if (currentView === 'reports') loadReports();
        if (currentView === 'me') loadMe();
        loadGoals();
    } catch (err) {
        // Rollback on error
        card.className = originalStatus;
        card.querySelector('.task-actions').innerHTML = originalActions;
        if (taskIdx !== -1) cachedTasks[taskIdx].status = 'pending';
        showToast(err.message, 'error');
    }
}

// ======= Task Link Helpers =======

// Updates min attribute on Start/Finish time inputs dynamically
function updateTaskTimeConstraints() {
    const dateInput    = document.getElementById('task-date');
    const startInput   = document.getElementById('task-start-time');
    const finishInput  = document.getElementById('task-time');
    if (!dateInput || !startInput || !finishInput) return;

    const todayStr = new Date().toLocaleDateString('en-CA');
    const isToday  = dateInput.value === todayStr;

    if (isToday) {
        const now  = new Date();
        const mins = String(now.getMinutes()).padStart(2, '0');
        const hrs  = String(now.getHours()).padStart(2, '0');
        const nowStr = `${hrs}:${mins}`;
        startInput.min  = nowStr;
    } else {
        startInput.min  = '';
    }

    // Function to calculate finish min based on start
    const updateFinishMin = () => {
        if (startInput.value) {
            const [h, m] = startInput.value.split(':').map(Number);
            const finishDate = new Date();
            finishDate.setHours(h, m + 1);
            const fh = String(finishDate.getHours()).padStart(2, '0');
            const fm = String(finishDate.getMinutes()).padStart(2, '0');
            finishInput.min = `${fh}:${fm}`;
            if (finishInput.value && finishInput.value < finishInput.min) {
                finishInput.value = finishInput.min;
            }
        } else {
            finishInput.min = '';
        }
    };

    updateFinishMin();

    // When start changes, update finish min
    startInput.onchange = updateFinishMin;
}

let _taskLinks = { goal: false, habit: false };

function toggleTaskLink(type) {
    const btnGoal   = document.getElementById('btn-link-goal');
    const btnHabit  = document.getElementById('btn-link-habit');
    const goalPanel  = document.getElementById('link-goal-panel');
    const habitPanel = document.getElementById('link-habit-panel');

    if (type === 'goal') {
        _taskLinks.goal = !_taskLinks.goal;
        if (_taskLinks.goal) {
            btnGoal && btnGoal.classList.add('selected-goal');
            if (goalPanel) goalPanel.style.display = 'block';
            populateGoalOptions();
        } else {
            btnGoal && btnGoal.classList.remove('selected-goal');
            if (goalPanel) goalPanel.style.display = 'none';
        }
    } else if (type === 'habit') {
        _taskLinks.habit = !_taskLinks.habit;
        if (_taskLinks.habit) {
            btnHabit && btnHabit.classList.add('selected-habit');
            if (habitPanel) habitPanel.style.display = 'block';
            populateHabitOptions();
        } else {
            btnHabit && btnHabit.classList.remove('selected-habit');
            if (habitPanel) habitPanel.style.display = 'none';
        }
    } else if (type === 'none') {
        _taskLinks = { goal: false, habit: false };
        btnGoal && btnGoal.classList.remove('selected-goal');
        btnHabit && btnHabit.classList.remove('selected-habit');
        if (goalPanel) goalPanel.style.display = 'none';
        if (habitPanel) habitPanel.style.display = 'none';
    }
}

function populateHabitOptions() {
    const select = document.getElementById('task-habit-select');
    if (!select) return;
    const activeHabits = cachedHabits.filter(h => h.title);
    select.innerHTML = `<option value="">Select habit</option>` +
        activeHabits.map(h => `<option value="${h.id}">${h.title}</option>`).join('');
}


function populateGoalOptions() {
    const select = document.getElementById('task-goal-select');
    if (!select) return;
    const activeGoals = cachedGoals.filter(g => g.status === 'active');
    select.innerHTML = `<option value="">Select goal</option>` + activeGoals.map(g => `<option value="${g.id}">${g.title}</option>`).join('');
}

async function loadGoals() {
    const list = document.getElementById('goals-list');
    try {
        const goals = await apiFetch('/goals');
        cachedGoals = goals;
        populateGoalOptions();
        if (list) {
            renderGoals(goals);
        }
    } catch (err) {
        if (list) {
            list.innerHTML = `<div class="empty-state"><p class="error-msg">${err.message}</p></div>`;
        }
    }
}



function renderGoals(goals) {
    const list = document.getElementById('goals-list');
    if (!list) return;
    if (!goals || goals.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <span class="empty-state-icon">🎯</span>
                <h3 class="empty-state-title">No goals yet</h3>
                <p class="empty-state-text">Create your first goal to track long-term progress.</p>
                <button onclick="toggleGoalForm()" class="btn primary">CREATE GOAL</button>
            </div>
        `;
        return;
    }
    list.innerHTML = goals.map(goal => `
        <div class="task-card goal-card ${goal.status}">
            <div class="task-info">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <h3>${goal.title}</h3>
                    <span class="priority-badge priority-low">${goal.category}</span>
                </div>
                <div class="task-meta">
                    <p>Deadline: ${goal.deadline}</p>
                    <p>Tasks: ${goal.completed_tasks_count}/${goal.linked_tasks_count}</p>
                </div>
                <div class="progress-bar" style="margin-top:0.75rem;">
                    <div id="goal-progress-${goal.id}" style="height:100%; width:${goal.progress_percent}%; background:linear-gradient(90deg,#0066FF,#10B981);"></div>
                </div>
                <div class="goal-progress-meta">
                    <span>${goal.progress_percent.toFixed(0)}%</span>
                    <span>${goal.status}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function toggleGoalForm() {
    const container = document.getElementById('goal-form-container');
    container.classList.toggle('active');
    if (container.classList.contains('active')) {
        document.getElementById('goal-title').value = '';
        document.getElementById('goal-category').value = 'General';
        document.getElementById('goal-type').value = 'two_weeks';
        handleGoalTypeChange();
        
        // Block past dates in custom deadline input
        const customDeadlineInput = document.getElementById('goal-deadline-custom');
        if (customDeadlineInput) customDeadlineInput.min = new Date().toLocaleDateString('en-CA');
    }
}

function handleGoalTypeChange() {
    const goalType = document.getElementById('goal-type').value;
    const deadlinePresetEl = document.getElementById('goal-deadline-preset');
    
    const goalTypeConfig = {
        today: {
            presets: ['today', 'custom'],
            default: 'today'
        },
        tomorrow: {
            presets: ['tomorrow', 'custom'],
            default: 'tomorrow'
        },
        three_days: {
            presets: ['tomorrow', 'three_days', 'custom'],
            default: 'three_days'
        },
        one_week: {
            presets: ['three_days', 'one_week', 'custom'],
            default: 'one_week'
        },
        two_weeks: {
            presets: ['one_week', 'two_weeks', 'custom'],
            default: 'two_weeks'
        },
        one_month: {
            presets: ['two_weeks', 'one_month', 'custom'],
            default: 'one_month'
        },
        three_months: {
            presets: ['one_month', 'three_months', 'custom'],
            default: 'three_months'
        },
        six_months: {
            presets: ['three_months', 'six_months', 'custom'],
            default: 'six_months'
        },
        one_year: {
            presets: ['six_months', 'one_year', 'custom'],
            default: 'one_year'
        },
        one_year_plus: {
            presets: ['one_year', 'one_year_plus', 'custom'],
            default: 'one_year_plus'
        }
    };
    
    const config = goalTypeConfig[goalType] || goalTypeConfig['two_weeks'];
    
    const presetLabels = {
        today: 'Today',
        tomorrow: 'Tomorrow',
        three_days: '3 days',
        one_week: '1 week',
        two_weeks: '2 weeks',
        one_month: '1 month',
        three_months: '3 months',
        six_months: '6 months',
        one_year: '1 year',
        one_year_plus: '1 year+',
        custom: 'Custom Date'
    };
    
    deadlinePresetEl.innerHTML = config.presets.map(preset => 
        `<option value="${preset}">${presetLabels[preset]}</option>`
    ).join('');
    
    deadlinePresetEl.value = config.default;
    handleGoalDeadlinePreset();
    restrictCustomDeadline();
}

function validateGoalDeadline() {
    const goalType = document.getElementById('goal-type').value;
    const preset = document.getElementById('goal-deadline-preset').value;
    const customInput = document.getElementById('goal-custom-deadline');
    
    let deadline;
    if (preset === 'custom') {
        if (!customInput.value) {
            return { valid: false, message: 'Please select a custom deadline' };
        }
        deadline = new Date(customInput.value);
    } else {
        deadline = new Date(resolveGoalDeadline());
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    
    const goalTypeRanges = {
        today: { min: 0, max: 0 },
        tomorrow: { min: 1, max: 1 },
        three_days: { min: 1, max: 3 },
        one_week: { min: 1, max: 7 },
        two_weeks: { min: 7, max: 14 },
        one_month: { min: 14, max: 30 },
        three_months: { min: 30, max: 90 },
        six_months: { min: 90, max: 180 },
        one_year: { min: 180, max: 365 },
        one_year_plus: { min: 365, max: 3650 },
    };
    
    const range = goalTypeRanges[goalType] || goalTypeRanges['two_weeks'];
    
    if (deadline < today) {
        return { valid: false, message: 'Deadline cannot be in the past' };
    }
    
    const daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline < range.min || daysUntilDeadline > range.max) {
        const typeLabels = {
            today: 'Today',
            tomorrow: 'Tomorrow',
            three_days: '1-3 days',
            one_week: '1 week',
            two_weeks: '1-2 weeks',
            one_month: '1 month',
            three_months: '3 months',
            six_months: '6 months',
            one_year: '1 year',
            one_year_plus: '1 year+',
        };
        return { 
            valid: false, 
            message: `This deadline is outside the range for ${typeLabels[goalType]} goals` 
        };
    }
    
    return { valid: true };
}

function restrictCustomDeadline() {
    const goalType = document.getElementById('goal-type').value;
    const customInput = document.getElementById('goal-custom-deadline');
    if (!customInput.disabled) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const goalTypeRanges = {
            today: { min: 0, max: 0 },
            tomorrow: { min: 1, max: 1 },
            three_days: { min: 1, max: 3 },
            one_week: { min: 1, max: 7 },
            two_weeks: { min: 7, max: 14 },
            one_month: { min: 14, max: 30 },
            three_months: { min: 30, max: 90 },
            six_months: { min: 90, max: 180 },
            one_year: { min: 180, max: 365 },
            one_year_plus: { min: 365, max: 3650 },
        };
        
        const range = goalTypeRanges[goalType] || goalTypeRanges['two_weeks'];
        
        const minDate = new Date(today);
        minDate.setDate(today.getDate() + range.min);
        
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + range.max);
        
        customInput.min = minDate.toISOString().split('T')[0];
        customInput.max = maxDate.toISOString().split('T')[0];
    }
}

function handleGoalDeadlinePreset() {
    const preset = document.getElementById('goal-deadline-preset').value;
    const customInput = document.getElementById('goal-custom-deadline');
    customInput.disabled = preset !== 'custom';
    if (preset !== 'custom') {
        customInput.value = '';
    } else {
        restrictCustomDeadline();
    }
}

function resolveGoalDeadline() {
    const preset = document.getElementById('goal-deadline-preset').value;
    const custom = document.getElementById('goal-custom-deadline').value;
    const base = new Date();
    if (preset === 'custom') {
        return custom;
    }
    if (preset === 'today') {
    } else if (preset === 'tomorrow') {
        base.setDate(base.getDate() + 1);
    } else if (preset === 'three_days') {
        base.setDate(base.getDate() + 3);
    } else if (preset === 'one_week') {
        base.setDate(base.getDate() + 7);
    } else if (preset === 'two_weeks') {
        base.setDate(base.getDate() + 14);
    } else if (preset === 'one_month') {
        base.setMonth(base.getMonth() + 1);
    } else if (preset === 'three_months') {
        base.setMonth(base.getMonth() + 3);
    } else if (preset === 'six_months') {
        base.setMonth(base.getMonth() + 6);
    } else if (preset === 'one_year') {
        base.setFullYear(base.getFullYear() + 1);
    } else if (preset === 'one_year_plus') {
        base.setFullYear(base.getFullYear() + 2);
    }
    return base.toISOString().split('T')[0];
}

function switchTasksGoalsTab(tab) {
    currentTasksGoalsTab = tab;
    document.getElementById('tab-tasks-only').classList.toggle('active', tab === 'tasks');
    document.getElementById('tab-goals-only').classList.toggle('active', tab === 'goals');
    document.getElementById('tab-habits-only').classList.toggle('active', tab === 'habits');
    document.getElementById('tasks-only-container').style.display = tab === 'tasks' ? 'block' : 'none';
    document.getElementById('goals-only-container').style.display = tab === 'goals' ? 'block' : 'none';
    document.getElementById('habits-only-container').style.display = tab === 'habits' ? 'block' : 'none';
    document.getElementById('smart-suggestion-container').style.display = tab === 'tasks' ? 'block' : 'none';
    
    const titleEl = document.getElementById('tasks-goals-title');
    const addBtn = document.getElementById('tasks-goals-add-btn');
    if (tab === 'tasks') {
        titleEl.textContent = t('tasks');
        addBtn.textContent = '+ Add Task';
        loadTasks();
    } else if (tab === 'goals') {
        titleEl.textContent = 'Goals';
        addBtn.textContent = '+ New Goal';
        loadGoals();
    } else {
        titleEl.textContent = 'Habits';
        addBtn.textContent = '+ New Habit';
        loadHabits();
    }
}

function toggleCurrentForm() {
    if (currentTasksGoalsTab === 'tasks') {
        toggleTaskForm();
    } else if (currentTasksGoalsTab === 'goals') {
        toggleGoalForm();
    } else {
        toggleHabitForm();
    }
}

function calculatePressureStatus(goal) {
    const deadline = new Date(goal.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    const daysRemaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    const progress = goal.progress_percent || 0;

    if (daysRemaining < 0) {
        return { status: 'overdue', color: '#EF4444', daysRemaining };
    } else if (daysRemaining <= 2 && progress < 60) {
        return { status: 'at_risk', color: '#F59E0B', daysRemaining };
    } else {
        return { status: 'on_track', color: '#0066FF', daysRemaining };
    }
}

function getGoalTypeLabel(type) {
    const labels = {
        today: 'Today (Short)',
        tomorrow: 'Tomorrow (Short)',
        three_days: '1-3 days (Short)',
        one_week: '1 week (Medium)',
        two_weeks: '1-2 weeks (Medium)',
        one_month: '1 month (Medium)',
        three_months: '3 months (Long)',
        six_months: '6 months (Long)',
        one_year: '1 year (Long)',
        one_year_plus: '1 year+ (Long)'
    };
    return labels[type] || type;
}

async function addGoal(title, category) {
    const validation = validateGoalDeadline();
    if (!validation.valid) {
        showToast(validation.message, 'error');
        return;
    }
    
    const deadline = resolveGoalDeadline();
    const goalType = document.getElementById('goal-type').value;
    
    const newGoal = await apiFetch('/goals', {
        method: 'POST',
        body: JSON.stringify({ title, category, deadline, goal_type: goalType })
    });
    smartPersonalizationCache = { timestamp: 0, data: null };
    toggleGoalForm();
    
    // Optimistic UI update
    if (newGoal && newGoal.id) {
        cachedGoals.unshift(newGoal);
        renderGoals(cachedGoals);
    } else {
        await loadGoals();
    }
    showToast('Goal created', 'success');
}

async function handleGoalComplete(goalId) {
    try {
        currentGoalForReflection = goalId;
        await apiFetch(`/goals/${goalId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'achieved' })
        });
        smartPersonalizationCache = { timestamp: 0, data: null };
        document.getElementById('goal-reflection-modal').classList.add('active');
        loadGoals();
        if (currentView === 'reports') loadReports();
        if (currentView === 'me') loadMe();
    } catch (err) {
        console.error('Failed to complete goal:', err);
    }
}

async function handleGoalFail(goalId) {
    try {
        await apiFetch(`/goals/${goalId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'failed' })
        });
        smartPersonalizationCache = { timestamp: 0, data: null };
        loadGoals();
        if (currentView === 'reports') loadReports();
        if (currentView === 'me') loadMe();
        showToast('Goal marked as failed', 'error');
    } catch (err) {
        console.error('Failed to update goal:', err);
    }
}

async function saveGoalReflection() {
    const wentWell = document.getElementById('reflection-went-well').value;
    const didntGoWell = document.getElementById('reflection-didnt-go-well').value;
    try {
        await apiFetch(`/goals/${currentGoalForReflection}`, {
            method: 'PATCH',
            body: JSON.stringify({
                reflection_went_well: wentWell,
                reflection_didnt_go_well: didntGoWell
            })
        });
        closeReflectionModal();
        showToast('Reflection saved!', 'success');
    } catch (err) {
        console.error('Failed to save reflection:', err);
    }
}

function closeReflectionModal() {
    document.getElementById('goal-reflection-modal').classList.remove('active');
    document.getElementById('reflection-went-well').value = '';
    document.getElementById('reflection-didnt-go-well').value = '';
    currentGoalForReflection = null;
}

function renderGoals(goals) {
    const list = document.getElementById('goals-list');
    if (!list) return;
    if (!goals || goals.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <span class="empty-state-icon">🎯</span>
                <h3 class="empty-state-title">No goals yet</h3>
                <p class="empty-state-text">Create your first goal to track long-term progress.</p>
                <button onclick="toggleGoalForm()" class="btn primary">Create Goal</button>
            </div>
        `;
        return;
    }
    list.innerHTML = goals.map(goal => {
        const pressure = calculatePressureStatus(goal);
        const typeLabel = getGoalTypeLabel(goal.goal_type);
        return `
        <div class="task-card goal-card ${goal.status}" style="border-left: 4px solid ${pressure.color};">
            <div class="task-info">
                <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap: wrap;">
                    <h3 style="margin: 0;">${goal.title}</h3>
                    <span class="priority-badge priority-low">${goal.category}</span>
                    <span class="priority-badge priority-medium">${typeLabel}</span>
                    <span class="priority-badge" style="background: ${pressure.color}20; color: ${pressure.color}; border-color: ${pressure.color};">
                        ${pressure.status === 'on_track' ? 'On Track' : pressure.status === 'at_risk' ? 'At Risk' : 'Overdue'}
                    </span>
                </div>
                <div class="task-meta">
                    <p>Deadline: ${goal.deadline} (${pressure.daysRemaining} days left)</p>
                    <p>Tasks: ${goal.completed_tasks_count}/${goal.linked_tasks_count}</p>
                </div>
                <div class="progress-bar" style="margin-top:0.75rem;">
                    <div style="height:100%; width:${goal.progress_percent}%; background:linear-gradient(90deg,#0066FF,#10B981);"></div>
                </div>
                <div class="goal-progress-meta">
                    <span>${goal.progress_percent.toFixed(0)}%</span>
                    <span>${goal.status}</span>
                </div>
                ${goal.reflection_went_well || goal.reflection_didnt_go_well ? `
                <div style="margin-top:0.75rem; padding:0.75rem; background:rgba(255,255,255,0.05); border-radius:8px;">
                    ${goal.reflection_went_well ? `<p><strong>What went well:</strong> ${goal.reflection_went_well}</p>` : ''}
                    ${goal.reflection_didnt_go_well ? `<p><strong>What didn't:</strong> ${goal.reflection_didnt_go_well}</p>` : ''}
                </div>
                ` : ''}
            </div>
            <div class="task-actions">
                ${goal.status === 'active' ? `
                    <button class="btn task-btn completed" onclick="handleGoalComplete(${goal.id})">
                        <span>Achieved</span>
                        <span class="btn-icon">✔</span>
                    </button>
                    <button class="btn task-btn failed" onclick="handleGoalFail(${goal.id})">
                        <span>Failed</span>
                        <span class="btn-icon">✖</span>
                    </button>
                ` : `
                    <div class="status-badge ${goal.status}">
                        <span>${goal.status === 'achieved' ? 'Achieved ✔' : 'Failed ✖'}</span>
                    </div>
                `}
            </div>
        </div>
    `}).join('');
}

async function loadIdentityProfile() {
    try {
        // Fast path: load from localStorage cache first
        if (!identityInitialized) {
            const cachedIdStr = localStorage.getItem('tm_cached_identity');
            if (cachedIdStr) {
                try {
                    const cachedId = JSON.parse(cachedIdStr);
                    renderIdentity(cachedId);
                } catch(e) {}
            }
        }

        const identity = await apiFetch('/identity/profile');
        localStorage.setItem('tm_cached_identity', JSON.stringify(identity));
        if (identityInitialized) {
            if (identity.level > identitySnapshot.level) {
                triggerLevelUpCelebration(identity.level);
            }
            const currentUnlocked = identity.badges.filter(b => b.unlocked).map(b => b.id);
            const previousUnlocked = new Set(identitySnapshot.unlockedBadgeIds);
            const newlyUnlocked = currentUnlocked.filter(id => !previousUnlocked.has(id));
            newlyUnlocked.forEach(() => showToast('New Badge Unlocked', 'info'));

            // Redesigned Trust Score Change UX Feedback
            const oldTrust = identitySnapshot.trust_score;
            const newTrust = identity.trust_score || 0.0;
            if (oldTrust !== null && oldTrust !== undefined) {
                const trustDiff = newTrust - oldTrust;
                if (Math.abs(trustDiff) >= 0.05) {
                    triggerTrustScoreFeedback(trustDiff);
                }
            }
        }
        renderIdentity(identity);
        identitySnapshot = {
            level: identity.level,
            unlockedBadgeIds: identity.badges.filter(b => b.unlocked).map(b => b.id),
            trust_score: identity.trust_score || 0.0
        };
        identityInitialized = true;
        const achievementList = document.getElementById('achievements-list');
        if (achievementList) {
            achievementList.innerHTML = identity.badges.map(b => `
                <div class="achievement-badge ${b.unlocked ? 'unlocked' : ''}">
                    <span class="icon">${b.unlocked ? '🏅' : '🔒'}</span>
                    <span class="name">${b.label}</span>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Identity load failed', err);
    }
}

function renderIdentity(identity) {
    const levelEl = document.getElementById('identity-level-badge');
    const statsEl = document.getElementById('identity-stats');
    const badgesEl = document.getElementById('identity-badges');
    const xpFillEl = document.getElementById('identity-xp-fill');
    const xpTextEl = document.getElementById('identity-xp-text');
    const trustEl = document.getElementById('identity-trust-value');
    if (!levelEl || !statsEl || !badgesEl || !xpFillEl || !xpTextEl || !trustEl) return;

    // Level pill (with star icon)
    levelEl.innerHTML = `<i class="fas fa-star"></i> Level ${identity.level}`;

    // XP bar & text
    xpFillEl.style.width = `${identity.level_progress_percent || 0}%`;
    xpTextEl.innerHTML = `XP ${identity.xp_into_current_level}/${identity.xp_for_next_level} &nbsp; Total ${identity.total_xp}`;

    // Trust score
    trustEl.textContent = `${(identity.trust_score || 0).toFixed(1)}`;

    // Stat cards with icons + dot grid
    const statConfigs = [
        {
            label: 'Completed Tasks',
            value: identity.completed_tasks,
            icon: 'fa-list-check',
            colorClass: 'stat-green'
        },
        {
            label: 'Completed Goals',
            value: identity.completed_goals,
            icon: 'fa-bullseye',
            colorClass: 'stat-blue'
        },
        {
            label: 'Streak',
            value: identity.streak,
            icon: 'fa-fire',
            colorClass: 'stat-orange'
        }
    ];

    statsEl.innerHTML = statConfigs.map(s => `
        <div class="identity-stat-item ${s.colorClass}">
            <div class="stat-icon-wrap">
                <i class="fas ${s.icon}"></i>
            </div>
            <div class="stat-content">
                <span class="label">${s.label}</span>
                <span class="value">${s.value}</span>
            </div>
            <div class="stat-dot-grid" aria-hidden="true"></div>
        </div>
    `).join('');

    // Badge summary pills (compact, unlocked only, max 4)
    const unlockedBadges = identity.badges.filter(b => b.unlocked).slice(0, 4);
    badgesEl.innerHTML = unlockedBadges.length > 0
        ? unlockedBadges.map(b => `
            <span class="identity-badge unlocked">
                <span>${getAchievementIcon(b.id)}</span>
                ${b.label}
            </span>
        `).join('')
        : `<span class="identity-badge" style="opacity:0.5"><span>🔒</span> No achievements yet</span>`;

    // Render full achievements section
    renderAchievements(identity.badges);
}

// Icon map for all achievements
function getAchievementIcon(id) {
    const map = {
        // Tasks
        first_step: '👣', productive_day: '⚡', task_machine: '🤖',
        task_master: '🏆', completion_expert: '💪', perfection_day: '✨',
        zero_miss_day: '🎯', marathon: '🏃',
        // Goals
        goal_setter: '📌', goal_hunter: '🎯', focused: '🔍',
        visionary: '🔮', unstoppable: '🚀', goal_legend: '👑',
        // Habits
        habit_beginner: '🌱', consistent: '📅', dedicated: '💎',
        ritual_master: '🧘', habit_collector: '📚', habit_legend: '🌟',
        // Streaks
        streak_3: '🔥', streak_7: '🔥', streak_14: '🔥',
        streak_30: '🌟', streak_50: '💥', streak_100: '🏅',
        century_streak: '🏅', comeback_king: '👑',
        // Trust
        average_citizen: '🛡️', reliable: '⚡', excellent: '🌟',
        trusted: '💎', iron_discipline: '⚔️', elite_consistency: '🏆',
        // XP
        level_5: '⭐', level_10: '🌟', level_25: '💫',
        level_50: '🚀', level_100: '👑', veteran: '🎖️',
        // Calendar
        active_week: '📅', active_month: '🗓️', weekend_warrior: '🎉',
        perfect_week: '✨',
        // Rare
        night_owl: '🦉', early_bird: '🐦', recovery_mode: '💚',
        redemption_arc: '🌅', one_year_strong: '🎂',
        // Legendary
        tobedone_legend: '👑',
    };
    return map[id] || '🎖️';
}

// Global state for achievements
let allAchievementsData = [];
let currentAchievementFilter = 'All';
let currentAchievementSearch = '';

function renderAchievements(badges) {
    allAchievementsData = badges;
    updateAchievementStats(badges);
    updateAchievementRing(badges);
    
    // Check if we have a cache to render instantly
    const grid = document.getElementById('achievements-grid');
    if (grid) {
        const cachedHtml = localStorage.getItem('tm_achievements_html');
        if (cachedHtml && currentAchievementFilter === 'All' && !currentAchievementSearch) {
            grid.innerHTML = cachedHtml;
        }
    }
    
    renderAchievementGrid(badges);

    // Wire up search (only once)
    const searchEl = document.getElementById('achievements-search');
    if (searchEl && !searchEl.dataset.wired) {
        searchEl.dataset.wired = '1';
        searchEl.addEventListener('input', e => {
            currentAchievementSearch = e.target.value.toLowerCase().trim();
            applyAchievementFilters();
        });
    }
}

function updateAchievementStats(badges) {
    const counts = { Common: 0, Rare: 0, Epic: 0, Legendary: 0 };
    let unlocked = 0;
    for (const b of badges) {
        if (b.unlocked) {
            counts[b.rarity] = (counts[b.rarity] || 0) + 1;
            unlocked++;
        }
    }
    const el = id => document.getElementById(id);
    if (el('ach-count-common'))    el('ach-count-common').textContent = counts.Common || 0;
    if (el('ach-count-rare'))      el('ach-count-rare').textContent = counts.Rare || 0;
    if (el('ach-count-epic'))      el('ach-count-epic').textContent = counts.Epic || 0;
    if (el('ach-count-legendary')) el('ach-count-legendary').textContent = counts.Legendary || 0;

    const subtitleEl = document.getElementById('achievements-subtitle');
    if (subtitleEl) {
        subtitleEl.textContent = `${unlocked} / ${badges.length} unlocked`;
    }
}

function updateAchievementRing(badges) {
    const total = badges.length;
    const unlocked = badges.filter(b => b.unlocked).length;
    const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    const circle = document.getElementById('ring-progress-circle');
    const textEl = document.getElementById('ring-percent-text');
    if (circle) {
        circle.setAttribute('stroke-dasharray', `${pct} ${100 - pct}`);
    }
    if (textEl) textEl.textContent = `${pct}%`;
}

function filterAchievements(filter, btn) {
    currentAchievementFilter = filter;
    // Update active button
    document.querySelectorAll('.ach-filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    applyAchievementFilters();
}

function applyAchievementFilters() {
    let filtered = allAchievementsData;

    // Category / state filter
    if (currentAchievementFilter === 'unlocked') {
        filtered = filtered.filter(b => b.unlocked);
    } else if (currentAchievementFilter === 'locked') {
        filtered = filtered.filter(b => !b.unlocked);
    } else if (currentAchievementFilter !== 'All') {
        filtered = filtered.filter(b => b.category === currentAchievementFilter);
    }

    // Search
    if (currentAchievementSearch) {
        filtered = filtered.filter(b =>
            b.label.toLowerCase().includes(currentAchievementSearch) ||
            b.description.toLowerCase().includes(currentAchievementSearch) ||
            b.category.toLowerCase().includes(currentAchievementSearch)
        );
    }

    renderAchievementGrid(filtered);
}

function renderAchievementGrid(badges) {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;

    if (!badges || badges.length === 0) {
        grid.innerHTML = `<div class="achievements-empty">
            <span style="font-size:2rem;display:block;margin-bottom:0.5rem;">🔍</span>
            No achievements match your search.
        </div>`;
        return;
    }

    // Sort: unlocked first, then by rarity (Legendary > Epic > Rare > Common)
    const rarityOrder = { Legendary: 0, Epic: 1, Rare: 2, Common: 3 };
    const sorted = [...badges].sort((a, b) => {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        return (rarityOrder[a.rarity] ?? 3) - (rarityOrder[b.rarity] ?? 3);
    });

    const html = sorted.map(b => {
        const rClass = `rarity-${b.rarity.toLowerCase()}`;
        const lockedClass = b.unlocked ? 'unlocked' : 'locked';
        const icon = getAchievementIcon(b.id);
        const pct = b.progress_target > 0
            ? Math.min(100, Math.round((b.progress_current / b.progress_target) * 100))
            : (b.unlocked ? 100 : 0);
        const progressLabel = b.progress_target === 1
            ? (b.unlocked ? 'Completed' : 'Locked')
            : `${b.progress_current.toLocaleString()} / ${b.progress_target.toLocaleString()}`;

        return `
        <div class="ach-card ${rClass} ${lockedClass}" id="ach-card-${b.id}">
            ${b.unlocked ? '<div class="ach-unlocked-badge"><i class="fas fa-check"></i></div>' : ''}
            <div class="ach-card-top">
                <div class="ach-icon-wrap">${icon}</div>
                <span class="ach-rarity-pill">${b.rarity}</span>
            </div>
            <div class="ach-card-label">${b.label}</div>
            <div class="ach-card-desc">${b.description}</div>
            <div class="ach-reward-chip">
                <i class="fas fa-star" style="font-size:0.55rem;"></i>
                +${b.reward_xp.toLocaleString()} XP
            </div>
            <div class="ach-progress-wrap">
                <div class="ach-progress-meta">
                    <span>${progressLabel}</span>
                    <span class="ach-progress-pct">${pct}%</span>
                </div>
                <div class="ach-progress-track">
                    <div class="ach-progress-fill" style="width:${pct}%"></div>
                </div>
            </div>
            ${b.unlocked && b.unlock_date ? `
                <div class="ach-unlock-date">
                    <i class="fas fa-check-circle"></i>
                    Unlocked ${b.unlock_date}
                </div>
            ` : ''}
        </div>
        `;
    }).join('');
    
    grid.innerHTML = html;
    
    // Cache the "All" unfiltered view
    if (currentAchievementFilter === 'All' && !currentAchievementSearch) {
        localStorage.setItem('tm_achievements_html', html);
    }
}

function triggerTrustScoreFeedback(diff) {
    const isPositive = diff > 0;
    const sign = isPositive ? '+' : '';
    const text = `Trust Score changed: ${sign}${diff.toFixed(1)}`;
    
    // Play satisfying (success) or warning toast
    showToast(text, isPositive ? 'success' : 'warning');
    
    // Apply animation / glow effects to the trust score value element
    const trustEl = document.getElementById('identity-trust-value');
    if (trustEl) {
        const glowClass = isPositive ? 'trust-glow-positive' : 'trust-glow-negative';
        trustEl.classList.remove('trust-glow-positive', 'trust-glow-negative');
        void trustEl.offsetWidth; // Trigger reflow to restart CSS keyframe animation
        trustEl.classList.add(glowClass);
        setTimeout(() => {
            trustEl.classList.remove(glowClass);
        }, 1500);
    }
}

function triggerLevelUpCelebration(level) {
    showToast(`🎉 LEVEL UP! You reached Level ${level}!`, 'success');
    
    // Pulse and glow the level badge
    const levelEl = document.getElementById('identity-level-badge');
    if (levelEl) {
        levelEl.classList.remove('level-up-animate');
        void levelEl.offsetWidth; // Trigger reflow
        levelEl.classList.add('level-up-animate');
        setTimeout(() => {
            levelEl.classList.remove('level-up-animate');
        }, 3000);
    }
    
    // Particle confetti celebration!
    createCelebrationParticles();
}

function createCelebrationParticles() {
    const colors = ['#00c6ff', '#0072ff', '#00f2fe', '#4facfe', '#00f5d4', '#10b981'];
    const container = document.body;
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.className = 'celebration-confetti';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `-20px`;
        particle.style.transform = `rotate(${Math.random() * 360}deg)`;
        particle.style.animationDelay = `${Math.random() * 0.8}s`;
        
        // Random size
        const size = Math.random() * 8 + 6;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        container.appendChild(particle);
        setTimeout(() => {
            particle.remove();
        }, 2500);
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
            login(document.getElementById('login-email').value, document.getElementById('login-password').value);
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

    const googleBtn = document.getElementById('google-signin-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            await signInWithGoogle();
        });
    }

    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            if (!targetId) return;
            const input = document.getElementById(targetId);
            if (!input) return;
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye', !isPassword);
                icon.classList.toggle('fa-eye-slash', isPassword);
            }
        });
    });

    const forgotLink = document.getElementById('forgot-password-link');
    if (forgotLink) forgotLink.addEventListener('click', () => setAuthView('forgot'));

    const forgotBack = document.getElementById('forgot-back-link');
    if (forgotBack) forgotBack.addEventListener('click', () => setAuthView('login'));

    const verifyBack = document.getElementById('verify-back-link');
    if (verifyBack) verifyBack.addEventListener('click', () => setAuthView('login'));

    const resendBtn = document.getElementById('resend-verification-btn');
    if (resendBtn) resendBtn.addEventListener('click', async () => await resendVerificationEmail());

    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    if (verifyOtpBtn) verifyOtpBtn.addEventListener('click', async () => await verifyEmailCode());

    const forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendPasswordReset(document.getElementById('forgot-email').value);
        });
    }

    const recoveryOtpBtn = document.getElementById('recovery-otp-btn');
    if (recoveryOtpBtn) recoveryOtpBtn.addEventListener('click', async () => await verifyRecoveryCode());

    const resetForm = document.getElementById('reset-form');
    if (resetForm) {
        resetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            updatePassword(
                document.getElementById('reset-password').value,
                document.getElementById('reset-password-confirm').value
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
            const startTime = document.getElementById('task-start-time') ? document.getElementById('task-start-time').value : null;

            // VALIDATION: Prevent past dates
            if (date) {
                const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local time
                if (date < todayStr) {
                    showToast('Cannot select a date in the past.', 'error');
                    return;
                }
                
                // VALIDATION: Prevent past start time if today
                if (date === todayStr && startTime) {
                    const now = new Date();
                    const currentHours = String(now.getHours()).padStart(2, '0');
                    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
                    const currentTimeStr = `${currentHours}:${currentMinutes}`;
                    if (startTime < currentTimeStr) {
                        showToast('Start time cannot be in the past.', 'error');
                        return;
                    }
                }
            }

            addTask(title, category, difficulty, date, time, startTime);
        });
    }

    const addGoalForm = document.getElementById('add-goal-form');
    if (addGoalForm) {
        addGoalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('goal-title').value.trim();
            const category = document.getElementById('goal-category').value.trim();
            addGoal(title, category || 'general');
        });
    }

    const addHabitForm = document.getElementById('add-habit-form');
    if (addHabitForm) {
        addHabitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await addHabit();
        });
    }

    const reflectionForm = document.getElementById('goal-reflection-form');
    if (reflectionForm) {
        reflectionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveGoalReflection();
        });
    }

    const goalTypeSelect = document.getElementById('goal-type');
    if (goalTypeSelect) {
        goalTypeSelect.addEventListener('change', handleGoalTypeChange);
    }

    const customDeadlineInput = document.getElementById('goal-custom-deadline');
    if (customDeadlineInput) {
        customDeadlineInput.addEventListener('change', restrictCustomDeadline);
    }

    // Profile Form
    const profileForm = document.getElementById('profile-edit-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                showLoading(true);
                const name = document.getElementById('profile-name-input')?.value || '';
                const username = document.getElementById('profile-username-input')?.value || '';
                await updateProfile(name, username);
                showToast('Profile updated', 'success');
            } catch (err) {
                showToast(err.message || 'Failed to update profile', 'error');
            } finally {
                showLoading(false);
            }
        });
    }

    const cancelBtn = document.getElementById('profile-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            cancelProfileChanges();
            showToast('Changes discarded', 'info');
        });
    }

    const nameInput = document.getElementById('profile-name-input');
    if (nameInput) {
        nameInput.addEventListener('input', () => {
            profileDraft.name = nameInput.value;
            updateProfileSaveState();
        });
    }

    const usernameInput = document.getElementById('profile-username-input');
    if (usernameInput) {
        usernameInput.addEventListener('input', () => {
            profileDraft.username = usernameInput.value;
            updateProfileSaveState();
        });
    }

    const avatarBtn = document.getElementById('profile-avatar-edit');
    const avatarInput = document.getElementById('profile-avatar-input');
    if (avatarBtn && avatarInput) {
        avatarBtn.addEventListener('click', () => {
            console.log("Avatar edit button clicked");
            avatarInput.click();
        });
        avatarInput.addEventListener('change', (event) => {
            console.log("Avatar input changed");
            const file = event.target.files && event.target.files[0];
            if (!file) {
                console.log("No file selected");
                return;
            }
            
            console.log("File selected:", file.name);
            currentCropFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log("File read complete, opening crop modal");
                const cropImg = document.getElementById('crop-image');
                cropImg.src = e.target.result;
                
                // Set explicit dimensions for Cropper wrapper container to render properly
                cropImg.style.display = 'block';
                cropImg.style.maxWidth = '100%';
                cropImg.style.maxHeight = '350px';

                document.getElementById('crop-modal').classList.add('active');
                
                if (cropper) cropper.destroy();
                
                // Wrap in a microtask/timeout to allow modal to display before cropper calculates container sizing
                setTimeout(() => {
                    cropper = new Cropper(cropImg, {
                        aspectRatio: 1,
                        viewMode: 1,
                        dragMode: 'move',
                        autoCropArea: 1,
                        restore: false,
                        guides: false,
                        center: true,
                        highlight: false,
                        cropBoxMovable: true,
                        cropBoxResizable: true,
                        toggleDragModeOnDblclick: false,
                    });
                }, 50);
            };
            reader.readAsDataURL(file);
        });
    }

    const cropCancelBtn = document.getElementById('crop-cancel-btn');
    if (cropCancelBtn) {
        cropCancelBtn.addEventListener('click', () => {
            document.getElementById('crop-modal').classList.remove('active');
            if (cropper) cropper.destroy();
            cropper = null;
        });
    }

    const cropSaveBtn = document.getElementById('crop-save-btn');
    if (cropSaveBtn) {
        cropSaveBtn.addEventListener('click', () => {
            if (!cropper) return;
            
            const canvas = cropper.getCroppedCanvas({
                width: 256,
                height: 256,
            });
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            profileDraft.avatar_url = dataUrl;
            const avatarEl = document.getElementById('profile-avatar');
            if (avatarEl) avatarEl.src = dataUrl;
            
            updateProfileSaveState();
            showToast('Photo adjusted (pending save)', 'info');
            
            document.getElementById('crop-modal').classList.remove('active');
            cropper.destroy();
            cropper = null;
        });
    }

    // Set default date/time in form
    const taskDateInput = document.getElementById('task-date');
    const taskTimeInput = document.getElementById('task-time');
    const taskStartTimeInput = document.getElementById('task-start-time');
    if (taskDateInput) taskDateInput.value = new Date().toLocaleDateString('en-CA');
    if (taskStartTimeInput) {
        const now = new Date();
        taskStartTimeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    if (taskTimeInput) {
        const now = new Date();
        now.setHours(now.getHours() + 1); // Default deadline is 1 hour later
        taskTimeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    // Reminders check every minute
    setInterval(() => {
        if (typeof checkReminders === 'function') checkReminders();
    }, 60000);
}

function switchAuthTab(tab) {
    setAuthView(tab);
}

function showAuthError(msg) {
    const el = document.getElementById('auth-error');
    if (el) el.textContent = msg;
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('tm_dark_mode', isDarkMode ? '1' : '0');
    applyTheme();
    showToast(t('task_updated'), 'success');
}

function toggleTaskForm() {
    const container = document.getElementById('task-form-container');
    container.classList.toggle('active');
    document.getElementById('task-title').value = '';
    if (container.classList.contains('active')) {
        // Reset link state
        toggleTaskLink('none');

        // Block past dates in HTML input
        const taskDateInput = document.getElementById('task-date');
        const todayStr = new Date().toLocaleDateString('en-CA');
        if (taskDateInput) {
            taskDateInput.min = todayStr;
            // When the date changes, update time constraints
            taskDateInput.onchange = function() {
                updateTaskTimeConstraints();
            };
        }
        updateTaskTimeConstraints();
    }
}

// === Swipe Navigation (Mobile Only) — Real-time finger tracking ===
(function() {
    const viewOrder = ['tasks', 'reports', 'insights', 'progress', 'me'];
    const SWIPE_THRESHOLD = 72;   // px to commit
    const SWIPE_DIR_RATIO = 2.2;  // how much more horizontal than vertical

    let touchStartX = 0;
    let touchStartY = 0;
    let touchCurX   = 0;
    let isDragging  = false;
    let isHorizontal = null; // null = undecided, true = horiz, false = vert
    let startedOnBottomNav = false;
    let activeEl  = null; // the current view DOM element
    let neighborEl = null; // the next/prev view
    let swipeDir   = null; // 'left' | 'right'

    document.addEventListener('touchstart', e => {
        startedOnBottomNav = Boolean(e.target && e.target.closest && e.target.closest('.bottom-nav'));
        if (startedOnBottomNav) return;
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
        touchCurX   = touchStartX;
        isDragging  = false;
        isHorizontal = null;
        swipeDir = null;
        activeEl = document.getElementById(`view-${currentView}`);
        neighborEl = null;
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (startedOnBottomNav || window.innerWidth > 768) return;
        const x = e.changedTouches[0].clientX;
        const y = e.changedTouches[0].clientY;
        const diffX = x - touchStartX;
        const diffY = y - touchStartY;

        // Decide direction once after minimal movement
        if (isHorizontal === null && (Math.abs(diffX) > 6 || Math.abs(diffY) > 6)) {
            isHorizontal = Math.abs(diffX) > Math.abs(diffY) * SWIPE_DIR_RATIO;
        }

        if (!isHorizontal || !activeEl) return;

        touchCurX = x;
        isDragging = true;
        const currentIdx = viewOrder.indexOf(currentView);

        // Determine neighbor
        if (!swipeDir) {
            if (diffX < 0 && currentIdx < viewOrder.length - 1) {
                swipeDir = 'left';
                neighborEl = document.getElementById(`view-${viewOrder[currentIdx + 1]}`);
            } else if (diffX > 0 && currentIdx > 0) {
                swipeDir = 'right';
                neighborEl = document.getElementById(`view-${viewOrder[currentIdx - 1]}`);
            } else {
                return; // edge of list — no drag
            }
        }

        const maxDrag = window.innerWidth * 0.45;
        const drag = Math.max(-maxDrag, Math.min(maxDrag, diffX));
        const resistance = 0.72; // rubber-band feel
        const finalDrag = drag * resistance;

        // Move current view with dragging
        activeEl.classList.add('swipe-dragging');
        activeEl.style.transform = `translateX(${finalDrag}px)`;
        activeEl.style.opacity = `${1 - Math.abs(finalDrag) / (maxDrag * 1.5)}`;

        // Peek the neighbor
        if (neighborEl) {
            const neighborOffset = swipeDir === 'left' ? window.innerWidth : -window.innerWidth;
            neighborEl.classList.add('swipe-dragging');
            neighborEl.style.display = 'flex';
            neighborEl.style.position = 'absolute';
            neighborEl.style.width = '100%';
            neighborEl.style.transform = `translateX(${neighborOffset + finalDrag}px)`;
            neighborEl.style.opacity = `${Math.abs(finalDrag) / (maxDrag * 1.2)}`;
            neighborEl.style.pointerEvents = 'none';
        }
    }, { passive: true });

    document.addEventListener('touchend', e => {
        if (startedOnBottomNav || !isDragging || !isHorizontal) {
            isDragging = false;
            isHorizontal = null;
            return;
        }
        isDragging = false;
        isHorizontal = null;

        const diffX = touchCurX - touchStartX;
        const committed = Math.abs(diffX) >= SWIPE_THRESHOLD && swipeDir !== null;

        // Clean up neighbor peek styles
        if (neighborEl) {
            neighborEl.classList.remove('swipe-dragging');
            neighborEl.style.position = '';
            neighborEl.style.width = '';
            neighborEl.style.pointerEvents = '';
            if (!committed) {
                // Spring back
                neighborEl.style.transition = 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.32s ease';
                neighborEl.style.transform = `translateX(${swipeDir === 'left' ? '100vw' : '-100vw'})`;
                neighborEl.style.opacity = '0';
                setTimeout(() => {
                    if (neighborEl) {
                        neighborEl.style.display = '';
                        neighborEl.style.transform = '';
                        neighborEl.style.opacity = '';
                        neighborEl.style.transition = '';
                        neighborEl.style.position = '';
                        neighborEl.style.width = '';
                        neighborEl.style.pointerEvents = '';
                    }
                }, 200);
            } else {
                neighborEl.style.transform = '';
                neighborEl.style.opacity = '';
                neighborEl.style.display = '';
                neighborEl.style.transition = '';
                neighborEl.style.position = '';
                neighborEl.style.width = '';
                neighborEl.style.pointerEvents = '';
            }
        }

        if (activeEl) {
            activeEl.classList.remove('swipe-dragging');
            if (!committed) {
                // Spring back current view
                activeEl.style.transition = 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.32s ease';
                activeEl.style.transform = 'translateX(0)';
                activeEl.style.opacity = '1';
                setTimeout(() => {
                    if (activeEl) {
                        activeEl.style.transform = '';
                        activeEl.style.opacity = '';
                        activeEl.style.transition = '';
                    }
                }, 200);
            } else {
                activeEl.style.transform = '';
                activeEl.style.opacity = '';
                activeEl.style.transition = '';
            }
        }

        if (committed) {
            const currentIdx = viewOrder.indexOf(currentView);
            const dir = diffX < 0 ? 'forward' : 'back';
            const targetIdx = diffX < 0 ? currentIdx + 1 : currentIdx - 1;
            if (targetIdx >= 0 && targetIdx < viewOrder.length) {
                showView(viewOrder[targetIdx], dir);
            }
        }

        // Reset
        neighborEl = null;
        activeEl   = null;
        swipeDir   = null;
    }, { passive: true });
})();

// === Ripple effect on buttons ===
(function() {
    document.addEventListener('pointerdown', e => {
        const btn = e.target.closest('.btn, .nav-item, .task-action-btn, .fab');
        if (!btn) return;
        btn.classList.add('ripple-container');
        const circle = document.createElement('span');
        circle.classList.add('ripple-circle');
        const rect = btn.getBoundingClientRect();
        circle.style.left = `${e.clientX - rect.left}px`;
        circle.style.top  = `${e.clientY - rect.top}px`;
        btn.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
    });
})();

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
            // 3. Hard reload after giving loading overlay time to animate (300ms)
            setTimeout(() => {
                window.location.reload(true);
            }, 300);
        } catch (err) {
            console.error("Force update failed", err);
            window.location.reload(true);
        }
    }
}

function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) return;
    if (show) {
        overlay.classList.add('active');
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'all';
    } else {
        overlay.classList.remove('active');
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
    }
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
    const installBtn = document.getElementById('install-btn');
    const topInstallBtn = document.getElementById('top-install-btn');
    if (installBtn) installBtn.style.display = 'block';
    if (topInstallBtn) topInstallBtn.style.display = 'grid'; // matches .icon-btn display
});

async function handleInstallClick() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            deferredPrompt = null;
            const installBtn = document.getElementById('install-btn');
            const topInstallBtn = document.getElementById('top-install-btn');
            if (installBtn) installBtn.style.display = 'none';
            if (topInstallBtn) topInstallBtn.style.display = 'none';
        }
    }
}

const installBtn = document.getElementById('install-btn');
if (installBtn) installBtn.addEventListener('click', handleInstallClick);

const topInstallBtn = document.getElementById('top-install-btn');
if (topInstallBtn) topInstallBtn.addEventListener('click', handleInstallClick);


// --- Share Functions ---
let shareData = {
    level: 1,
    xp: 0,
    streak: 0,
    completedTasks: 0,
    goalsAchieved: 0
};

async function openShareModal() {
    const modal = document.getElementById('share-modal');
    modal.classList.add('active');
    
    try {
        const [identity, socialProfile] = await Promise.all([
            apiFetch('/identity/profile'),
            apiFetch('/social/profile')
        ]);
        
        shareData = {
            level: identity.level,
            xp: identity.total_xp,
            streak: identity.streak,
            completedTasks: identity.completed_tasks,
            goalsAchieved: socialProfile.goals_achieved || 0
        };
        
        document.getElementById('share-username').textContent = currentUser.name || currentUser.username;
        document.getElementById('share-level').textContent = shareData.level;
        document.getElementById('share-xp').textContent = shareData.xp;
        document.getElementById('share-streak').textContent = shareData.streak;
        document.getElementById('share-completed-tasks').textContent = shareData.completedTasks;
        document.getElementById('share-goals-achieved').textContent = shareData.goalsAchieved;
        document.getElementById('profile-link').value = `${window.location.origin}/user/${currentUser.username}`;
        
    } catch (err) {
        console.error('Failed to load share data:', err);
        showToast('Failed to load share data', 'error');
    }
}

function closeShareModal() {
    const modal = document.getElementById('share-modal');
    modal.classList.remove('active');
}

async function downloadShareCard() {
    try {
        const shareCard = document.getElementById('share-card');
        
        const html2canvasScript = document.createElement('script');
        html2canvasScript.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
        html2canvasScript.onload = async () => {
            const canvas = await html2canvas(shareCard, {
                backgroundColor: '#0a0f25',
                scale: 2
            });
            
            const link = document.createElement('a');
            link.download = 'tobedone-progress.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            showToast('Image downloaded!', 'success');
        };
        document.head.appendChild(html2canvasScript);
        
    } catch (err) {
        console.error('Download failed:', err);
        showToast('Download failed', 'error');
    }
}

function copyShareText() {
    const text = `Check out my progress on Tobedone! 🎯
Level: ${shareData.level}
XP: ${shareData.xp}
Streak: ${shareData.streak} days
Completed Tasks: ${shareData.completedTasks}
Goals Achieved: ${shareData.goalsAchieved}`;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('Text copied!', 'success');
    }).catch(() => {
        showToast('Failed to copy text', 'error');
    });
}

async function nativeShare() {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'My Tobedone Progress',
                text: `Check out my progress on Tobedone! Level ${shareData.level}, ${shareData.streak} day streak!`,
                url: document.getElementById('profile-link').value
            });
            showToast('Shared successfully!', 'success');
        } catch (err) {
            console.log('Share cancelled or failed');
        }
    } else {
        copyShareText();
    }
}

function copyProfileLink() {
    const linkInput = document.getElementById('profile-link');
    navigator.clipboard.writeText(linkInput.value).then(() => {
        showToast('Profile link copied!', 'success');
    }).catch(() => {
        showToast('Failed to copy link', 'error');
    });
}

// --- Dashboard Calendar Functions ---
let dashboardCalendarRequestId = 0;
let dashboardCalendarAbortController = null;

async function renderDashboardCalendar() {
    const grid = document.getElementById('dashboard-calendar-grid');
    const title = document.getElementById('dashboard-calendar-month-year');
    if (!grid || !title) return;

    // Track active request ID to cancel older async responses
    const currentRequestId = ++dashboardCalendarRequestId;
    
    // Abort previous request if still pending
    if (dashboardCalendarAbortController) {
        dashboardCalendarAbortController.abort();
    }
    dashboardCalendarAbortController = new AbortController();

    const month = dashboardCalendarDate.getMonth();
    const year = dashboardCalendarDate.getFullYear();

    const monthNames = [t('january'), t('february'), t('march'), t('april'), t('may'), t('june'), t('july'), t('august'), t('september'), t('october'), t('november'), t('december')];
    title.textContent = `${monthNames[month]} ${year}`;

    // Get all tasks for the month to check active days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startStr = firstDay.toISOString().split('T')[0];
    const endStr = lastDay.toISOString().split('T')[0];

    const firstDayIdx = (firstDay.getDay() + 6) % 7; // Monday start
    const daysInMonth = lastDay.getDate();
    const todayStr = new Date().toISOString().split('T')[0];

    const renderGridWithTasks = (tasks) => {
        grid.innerHTML = '';
        const days = [t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')];
        days.forEach(d => grid.innerHTML += `<div class="calendar-day-label">${d}</div>`);

        const activeDays = new Set();
        tasks.forEach(task => {
            if (task.status === 'completed') {
                activeDays.add(task.date);
            }
        });

        for (let i = 0; i < firstDayIdx; i++) {
            grid.innerHTML += `<div class="calendar-day other-month"></div>`;
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const isActive = activeDays.has(dateStr);
            let streakClass = '';
            if (isActive) {
                const prevDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d - 1).padStart(2, '0')}`;
                const nextDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d + 1).padStart(2, '0')}`;
                const prevActive = d > 1 && activeDays.has(prevDateStr);
                const nextActive = d < daysInMonth && activeDays.has(nextDateStr);
                if (prevActive && nextActive) streakClass = 'streak-mid';
                else if (prevActive) streakClass = 'streak-end';
                else if (nextActive) streakClass = 'streak-start';
                else streakClass = 'streak-single';
            }

            const dayEl = document.createElement('div');
            dayEl.className = `calendar-day ${isToday ? 'today' : ''} ${isActive ? 'active-day' : ''} ${streakClass}`;
            dayEl.textContent = d;
            dayEl.onclick = () => renderDayTasks(dateStr);
            grid.appendChild(dayEl);
        }
    };

    const cacheKey = `tm_cal_${currentUser?.user_id || 'guest'}_${year}_${month}`;
    const cachedTasksStr = localStorage.getItem(cacheKey);
    if (cachedTasksStr) {
        try { renderGridWithTasks(JSON.parse(cachedTasksStr)); } catch(e) { renderGridWithTasks([]); }
    } else {
        renderGridWithTasks([]);
    }

    let monthTasks = [];
    try {
        monthTasks = await apiFetch(`/tasks/range?start_date=${startStr}&end_date=${endStr}`, {
            signal: dashboardCalendarAbortController.signal
        });
        localStorage.setItem(cacheKey, JSON.stringify(monthTasks));
    } catch (err) {
        if (err.name === 'AbortError') {
            console.log('Calendar request aborted');
            return;
        }
        console.error('Failed to load month tasks for calendar', err);
    }

    if (currentRequestId !== dashboardCalendarRequestId) {
        return;
    }

    renderGridWithTasks(monthTasks);
}

function changeDashboardMonth(delta) {
    dashboardCalendarDate.setMonth(dashboardCalendarDate.getMonth() + delta);
    renderDashboardCalendar();
}

async function processSingleLogo(img) {
    if (!img || img._processed) return;
    img._processed = true;
    try {
        console.log('Processing single logo:', img.src.substring(0, 50) + '...');
        img.src = await removeBlackBackground(img.src, 0.99, true);
        img.classList.add('processed');
        console.log('Single logo processed:', img.src.substring(0, 50) + '...');
    } catch (err) {
        console.error('Failed to process single logo', err);
    }
}

async function processAllLogos() {
    const logoSelectors = [
        '.auth-logo',       // auth page logo
        '.app-logo-small',  // top bar logo
        '.share-logo',      // share modal logo
        '.loading-content img' // loading overlay logo
    ];

    console.log('Found logo selectors for parallel processing:', logoSelectors);
    const promises = logoSelectors.map(async (selector) => {
        const img = document.querySelector(selector);
        if (img && img.src) {
            try {
                await processSingleLogo(img);
            } catch (err) {
                console.error(`Failed to process logo ${selector}`, err);
            }
        }
    });
    await Promise.all(promises);
}

window.addEventListener('load', () => {
    processAllLogos();
});

// --- Progression Hub Engine ---

// Global reports tab state
let currentPerformanceReportTab = 'weekly';

function getRankName(level) {
    if (level >= 50) return 'Legend';
    if (level >= 40) return 'Elite';
    if (level >= 30) return 'Consistent';
    if (level >= 20) return 'Achiever';
    if (level >= 10) return 'Builder';
    return 'Starter';
}

function getTrustScoreTier(score) {
    if (score >= 76) return { text: 'Excellent', class: 'priority-high' };
    if (score >= 51) return { text: 'Good', class: 'priority-medium' };
    if (score >= 26) return { text: 'Average', class: 'priority-low' };
    return { text: 'Low', class: 'priority-low' };
}

// Loads all data for the Progress view from /identity/profile
async function loadProgressHub() {
    try {
        // Show skeleton placeholders while data loads
        const rankNameEl = document.getElementById('progress-rank-name');
        if (rankNameEl && rankNameEl.textContent === 'Explorer') {
            const xpTextEl  = document.getElementById('progress-xp-text');
            const trustVal  = document.getElementById('progress-trust-value');
            if (xpTextEl)  { xpTextEl.innerHTML  = '<span class="skeleton skeleton-line sm" style="width:80px;display:inline-block;"></span>'; }
            if (trustVal)  { trustVal.innerHTML   = '<span class="skeleton skeleton-line xl" style="width:60px;display:inline-block;"></span>'; }
        }

        const identity = await apiFetch('/identity/profile');
        
        // Render Rank & Level
        const levelBadgeEl = document.getElementById('progress-level-badge');
        if (rankNameEl) rankNameEl.textContent = getRankName(identity.level);
        if (levelBadgeEl) levelBadgeEl.innerHTML = `<i class="fas fa-star"></i> Level ${identity.level}`;

        // Render XP
        const xpFillEl = document.getElementById('progress-xp-fill');
        const totalXpEl = document.getElementById('progress-total-xp');
        const xpTextElReal = document.getElementById('progress-xp-text');
        if (xpTextElReal) xpTextElReal.textContent = `XP ${identity.xp_into_current_level} / ${identity.xp_for_next_level}`;
        if (xpFillEl) xpFillEl.style.width = `${identity.level_progress_percent || 0}%`;
        if (totalXpEl) totalXpEl.textContent = `Total XP: ${identity.total_xp.toLocaleString()}`;

        // Render Trust Progress Card
        const trustValEl = document.getElementById('progress-trust-value');
        const trustTierEl = document.getElementById('progress-trust-tier');
        if (trustValEl) trustValEl.textContent = identity.trust_score.toFixed(1);
        if (trustTierEl) {
            const tier = getTrustScoreTier(identity.trust_score);
            trustTierEl.textContent = tier.text;
            trustTierEl.className = `priority-badge ${tier.class}`;
        }

        // Render Achievements Grid in Progress Hub
        renderAchievements(identity.badges);

        // Dynamically compute Timeline
        await renderMilestoneTimeline(identity);
        await renderPerformanceReports(identity);
        await renderSeasonalChallenges();

        // Mastery Score
        computeAndRenderMastery(identity);

        // Future Self
        await loadFutureSelf();
    } catch (err) {
        console.error('Failed to load progression hub data', err);
    }
}

async function renderPersonalRecords(identity) {
    const list = document.getElementById('personal-records-list');
    if (!list) return;

    // Fetch tasks & daily scores range to compute true historic high values
    let totalTasksCount = identity.completed_tasks;
    let totalGoalsCount = identity.completed_goals;
    let currentStreak = identity.streak;
    let highestTrust = identity.trust_score;
    let maxTasksDay = 0;

    const cacheKey = `tm_personal_records_${currentUser?.user_id || 'guest'}`;
    const cachedRecordsStr = localStorage.getItem(cacheKey);

    const renderList = (hTrust, mTasksDay) => {
        const records = [
            { label: 'Longest Streak', val: `${currentStreak} Days`, icon: '🔥' },
            { label: 'Highest Trust Score', val: hTrust.toFixed(1), icon: '🛡️' },
            { label: 'Highest XP Achieved', val: identity.total_xp.toLocaleString(), icon: '⭐' },
            { label: 'Max Tasks In A Day', val: `${Math.max(mTasksDay, totalTasksCount > 0 ? 1 : 0)} Tasks`, icon: '📋' },
            { label: 'Total Tasks Completed', val: `${totalTasksCount} Tasks`, icon: '✅' },
            { label: 'Total Goals Achieved', val: `${totalGoalsCount} Goals`, icon: '🎯' }
        ];

        list.innerHTML = records.map(r => `
            <div class="record-item">
                <div class="record-icon-wrap">${r.icon}</div>
                <div class="record-info">
                    <span class="record-lbl">${r.label}</span>
                    <span class="record-val">${r.val}</span>
                </div>
            </div>
        `).join('');
    };

    if (cachedRecordsStr) {
        try {
            const cachedData = JSON.parse(cachedRecordsStr);
            highestTrust = Math.max(cachedData.highestTrust || 0, highestTrust);
            maxTasksDay = cachedData.maxTasksDay || 0;
            renderList(highestTrust, maxTasksDay);
        } catch(e) {}
    } else {
        renderList(highestTrust, maxTasksDay);
    }

    try {
        const history = await apiFetch('/score/history');
        if (history && history.length > 0) {
            highestTrust = Math.max(...history.map(h => h.score), identity.trust_score);
        }
        
        const maxTasksData = await apiFetch('/tasks/max_daily');
        maxTasksDay = maxTasksData.max_tasks_day || 0;
        
        localStorage.setItem(cacheKey, JSON.stringify({ highestTrust, maxTasksDay }));
        renderList(highestTrust, maxTasksDay);
    } catch (e) {
        console.error('Error fetching records details', e);
    }
}

async function renderMilestoneTimeline(identity) {
    const list = document.getElementById('milestone-timeline-list');
    if (!list) return;

    // Check progress of milestones
    const milestones = [
        { title: '👣 First Step', desc: 'Complete your first task', condition: identity.completed_tasks >= 1 },
        { title: '📌 Goal Setter', desc: 'Set your very first goal', condition: identity.completed_goals >= 1 },
        { title: '⚡ Level 10 Achieved', desc: 'Reach Level 10 of personal productivity', condition: identity.level >= 10 },
        { title: '🛡️ Trust Builder', desc: 'Raise self trust score above 50', condition: identity.trust_score >= 50.0 },
        { title: '⚔️ Discipline Elite', desc: 'Reach Level 25 or achieve elite trust levels', condition: identity.level >= 25 || identity.trust_score >= 75.0 },
        { title: '👑 Legendary Achiever', desc: 'Complete 100 tasks and reach level 50', condition: identity.completed_tasks >= 100 && identity.level >= 50 }
    ];

    list.innerHTML = milestones.map(m => `
        <div class="timeline-node ${m.condition ? 'unlocked' : ''}">
            <div class="timeline-title">${m.title}</div>
            <div class="timeline-desc">${m.desc}</div>
            <div class="timeline-date">${m.condition ? 'Unlocked ✓' : 'Locked'}</div>
        </div>
    `).join('');
}

function switchPerformanceReport(tab) {
    currentPerformanceReportTab = tab;
    document.querySelectorAll('.performance-reports-card .tab').forEach(t => t.classList.remove('active'));
    
    const targetTabBtn = document.getElementById(`tab-report-${tab}`);
    if (targetTabBtn) targetTabBtn.classList.add('active');
    
    // Rerender reports with currently fetched identity
    apiFetch('/identity/profile').then(identity => renderPerformanceReports(identity));
}

function renderPerformanceReports(identity) {
    const container = document.getElementById('performance-report-content');
    if (!container) return;

    if (currentPerformanceReportTab === 'weekly') {
        container.innerHTML = `
            <h4 style="margin:0 0 0.5rem 0; font-size:0.9rem;">Weekly Performance Card</h4>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin:0 0 1rem 0;">Auto-generated weekly activity stats</p>
            <div class="report-grid">
                <div class="report-stat-box">
                    <div class="report-stat-val">${identity.completed_tasks}</div>
                    <div class="report-stat-lbl">Tasks Done</div>
                </div>
                <div class="report-stat-box">
                    <div class="report-stat-val">${identity.completed_goals}</div>
                    <div class="report-stat-lbl">Goals Done</div>
                </div>
                <div class="report-stat-box">
                    <div class="report-stat-val">${identity.streak}</div>
                    <div class="report-stat-lbl">Streak Health</div>
                </div>
                <div class="report-stat-box">
                    <div class="report-stat-val">+${(identity.trust_score * 0.15).toFixed(1)}</div>
                    <div class="report-stat-lbl">Trust Growth</div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <h4 style="margin:0 0 0.5rem 0; font-size:0.9rem;">Monthly Performance Review</h4>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin:0 0 1rem 0;">Detailed performance metrics review</p>
            <div class="report-grid">
                <div class="report-stat-box">
                    <div class="report-stat-val">${identity.completed_tasks}</div>
                    <div class="report-stat-lbl">Total Tasks</div>
                </div>
                <div class="report-stat-box">
                    <div class="report-stat-val">${identity.completed_goals}</div>
                    <div class="report-stat-lbl">Total Goals</div>
                </div>
                <div class="report-stat-box">
                    <div class="report-stat-val">${identity.level}</div>
                    <div class="report-stat-lbl">XP Rank Level</div>
                </div>
                <div class="report-stat-box">
                    <div class="report-stat-val">${identity.trust_score.toFixed(1)}%</div>
                    <div class="report-stat-lbl">Trust Consistency</div>
                </div>
            </div>
        `;
    }
}

// Local mock data of challenges with claim state saved to localStorage
async function renderSeasonalChallenges() {
    const list = document.getElementById('seasonal-challenges-list');
    if (!list) return;

    // Load claim states
    const claimedList = JSON.parse(localStorage.getItem('seasonal_challenges_claimed') || '{}');

    // Retrieve stats to update dynamic challenge progress
    const identity = await apiFetch('/identity/profile');

    const challenges = [
        {
            id: 'summer_sprint',
            title: '🏃 Summer Sprint',
            desc: 'Complete 10 tasks to claim a massive boost.',
            target: 10,
            current: Math.min(identity.completed_tasks, 10),
            xp: 500
        },
        {
            id: 'consistency_30',
            title: '🔥 30 Day Consistency',
            desc: 'Maintain a streak of 30 days.',
            target: 30,
            current: Math.min(identity.streak, 30),
            xp: 1500
        }
    ];

    list.innerHTML = challenges.map(c => {
        const isDone = c.current >= c.target;
        const isClaimed = claimedList[c.id] === true;
        const pct = Math.round((c.current / c.target) * 100);
        
        let actionBtn = '';
        if (isClaimed) {
            actionBtn = `<span class="priority-badge priority-low" style="align-self:flex-start;">Claimed ✔</span>`;
        } else if (isDone) {
            actionBtn = `<button class="btn primary-link-btn-small" onclick="claimChallengeReward('${c.id}', ${c.xp})" style="align-self:flex-start; min-width:80px; padding:0.25rem 0.5rem; font-size:0.65rem;">Claim Reward</button>`;
        } else {
            actionBtn = `<span class="priority-badge priority-low" style="align-self:flex-start;">In Progress</span>`;
        }

        return `
            <div class="challenge-card ${isDone ? 'completed' : ''}">
                <div class="challenge-top">
                    <span class="challenge-title">${c.title}</span>
                    <span class="challenge-badge-lbl">${c.current}/${c.target}</span>
                </div>
                <div class="challenge-desc">${c.desc}</div>
                <div class="challenge-reward">+${c.xp} XP Reward</div>
                <div class="challenge-progress-bar">
                    <div class="challenge-progress-fill" style="width: ${pct}%"></div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.2rem;">
                    <span style="font-size:0.62rem; opacity:0.7;">Progress: ${pct}%</span>
                    ${actionBtn}
                </div>
            </div>
        `;
    }).join('');
}

async function claimChallengeReward(challengeId, xpAmount) {
    try {
        const claimedList = JSON.parse(localStorage.getItem('seasonal_challenges_claimed') || '{}');
        claimedList[challengeId] = true;
        localStorage.setItem('seasonal_challenges_claimed', JSON.stringify(claimedList));

        showToast(`Challenge claimed! +${xpAmount} XP added! 🎉`, 'success');
        
        // Re-render progression page elements
        await loadProgressHub();
    } catch (e) {
        console.error('Error claiming reward', e);
    }
}

// Level Up Celebration overlay trigger
function triggerLevelUpCelebration(newLevel) {
    showToast(`🎉 LEVEL UP! You have achieved Level ${newLevel}!`, 'success');
    
    // Create simple full screen confetti animation overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.7)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.animation = 'fadeIn 0.5s ease-out';
    
    overlay.innerHTML = `
        <div style="text-align:center; color:#fff; animation:scaleUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);">
            <div style="font-size: 5rem; margin-bottom: 1rem;">👑</div>
            <h1 style="font-size: 2.5rem; font-weight:900; background:linear-gradient(90deg, #fbbf24, #f59e0b); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:0.5rem;">LEVEL UP!</h1>
            <p style="font-size: 1.2rem; opacity: 0.8; margin-bottom: 2rem;">You reached Level ${newLevel} & Rank "${getRankName(newLevel)}"</p>
            <button class="btn primary" onclick="this.parentElement.parentElement.remove()" style="padding: 0.75rem 2rem; border-radius: 12px; font-weight: 800;">Keep Growing</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

// ══════════════════════════════════════════════════════════════════════════════
// MASTERY PROGRESS METRIC
// ══════════════════════════════════════════════════════════════════════════════

function computeAndRenderMastery(identity) {
    // Weighted components (each 0-100 scale)
    const totalAchievements = (identity.badges || []).length || 1;
    const unlockedAchievements = (identity.badges || []).filter(b => b.unlocked).length;

    const components = [
        { label: 'XP',           icon: '⭐', value: Math.min(100, (identity.total_xp / 5000) * 100), weight: 0.20 },
        { label: 'Level',        icon: '🏆', value: Math.min(100, (identity.level / 50) * 100),     weight: 0.20 },
        { label: 'Trust',        icon: '🛡️', value: Math.min(100, identity.trust_score),             weight: 0.25 },
        { label: 'Achievements', icon: '🎖️', value: Math.min(100, (unlockedAchievements / Math.max(totalAchievements, 1)) * 100), weight: 0.15 },
        { label: 'Tasks',        icon: '✅', value: Math.min(100, (identity.completed_tasks / 100) * 100), weight: 0.10 },
        { label: 'Goals',        icon: '🎯', value: Math.min(100, (identity.completed_goals / 20) * 100),  weight: 0.10 },
    ];

    const mastery = Math.round(components.reduce((sum, c) => sum + c.value * c.weight, 0));

    let rankLabel = 'Novice';
    if (mastery >= 80) rankLabel = 'Master';
    else if (mastery >= 60) rankLabel = 'Expert';
    else if (mastery >= 40) rankLabel = 'Skilled';
    else if (mastery >= 20) rankLabel = 'Developing';

    const pctEl = document.getElementById('mastery-percent-badge');
    const fillEl = document.getElementById('mastery-progress-fill');
    const lblEl = document.getElementById('mastery-rank-label');
    const bkdEl = document.getElementById('mastery-breakdown');

    if (pctEl) pctEl.textContent = `${mastery}%`;
    if (fillEl) fillEl.style.width = `${mastery}%`;
    if (lblEl) lblEl.textContent = `${rankLabel} · Cross-system progression score`;
    if (bkdEl) {
        bkdEl.innerHTML = components.map(c => `
            <div class="mastery-item">
                <span class="mastery-item-icon">${c.icon}</span>
                <span class="mastery-item-label">${c.label}</span>
                <div class="mastery-item-bar">
                    <div class="mastery-item-fill" style="width:${Math.round(c.value)}%"></div>
                </div>
                <span class="mastery-item-val">${Math.round(c.value)}%</span>
            </div>
        `).join('');
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// FUTURE SELF FEATURE
// ══════════════════════════════════════════════════════════════════════════════

function toggleFutureSelfForm() {
    const body = document.getElementById('future-self-compose-body');
    const chevron = document.getElementById('fs-compose-chevron');
    if (!body) return;
    const isOpen = body.style.display !== 'none';
    body.style.display = isOpen ? 'none' : 'block';
    if (chevron) chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
}

async function submitFutureSelfMessage() {
    const title = document.getElementById('fs-title')?.value?.trim();
    const message = document.getElementById('fs-message')?.value?.trim();
    const delivery = document.getElementById('fs-delivery')?.value || '1_month';
    const category = document.getElementById('fs-category')?.value || 'motivational';

    if (!title || !message) {
        showToast('Please fill in the title and message.', 'error');
        return;
    }

    try {
        await apiFetch('/future-self', {
            method: 'POST',
            body: JSON.stringify({ title, message, delivery, category })
        });

        // Clear form
        document.getElementById('fs-title').value = '';
        document.getElementById('fs-message').value = '';
        toggleFutureSelfForm();
        showToast('✉️ Message sealed! It will be waiting for you.', 'success');
        await loadFutureSelf();
    } catch(e) {
        showToast('Failed to send message. Please try again.', 'error');
    }
}

async function openFutureSelfMessage(msgId) {
    try {
        const msg = await apiFetch(`/future-self/${msgId}/open`, { method: 'PATCH' });
        showToast(`📬 Message from your past self opened!`, 'success');
        await loadFutureSelf();
        // Show message in a simple overlay
        showFutureSelfMessageOverlay(msg);
    } catch(e) {
        showToast(e.message || 'Cannot open yet!', 'error');
    }
}

function showFutureSelfMessageOverlay(msg) {
    const catEmoji = { goal: '🎯', promise: '🤝', prediction: '🔮', reminder: '🔔', motivational: '💪' };
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:9998;padding:1.5rem;';
    overlay.innerHTML = `
        <div style="background:var(--bg-card);border-radius:24px;padding:2rem;max-width:480px;width:100%;box-shadow:0 24px 80px rgba(0,0,0,0.5);border:1px solid rgba(124,58,237,0.3);">
            <div style="text-align:center;margin-bottom:1.5rem;">
                <div style="font-size:3rem;margin-bottom:0.5rem;">${catEmoji[msg.category] || '✉️'}</div>
                <h2 style="font-size:1.4rem;font-weight:900;margin:0;">${msg.title}</h2>
                <p style="font-size:0.75rem;color:var(--text-secondary);margin:0.25rem 0 0;">Written on ${new Date(msg.created_at).toLocaleDateString()}</p>
            </div>
            <div style="background:rgba(124,58,237,0.08);border-radius:16px;padding:1.25rem;margin-bottom:1.5rem;border:1px solid rgba(124,58,237,0.15);line-height:1.7;font-size:0.95rem;">
                ${msg.message.replace(/\n/g, '<br>')}
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="btn primary" style="width:100%;">Close Message</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

async function loadFutureSelf() {
    const archive = document.getElementById('future-self-archive');
    if (!archive) return;

    try {
        const messages = await apiFetch('/future-self');

        // Stats
        const total = messages.length;
        const opened = messages.filter(m => m.is_opened).length;
        const ready = messages.filter(m => !m.is_opened && m.days_until_open === 0).length;

        const sentEl = document.getElementById('fs-stat-sent');
        const readyEl = document.getElementById('fs-stat-ready');
        const openedEl = document.getElementById('fs-stat-opened');
        if (sentEl) sentEl.textContent = `${total} Sent`;
        if (readyEl) readyEl.textContent = `${ready} Ready`;
        if (openedEl) openedEl.textContent = `${opened} Opened`;

        if (messages.length === 0) {
            archive.innerHTML = `
                <div style="text-align:center;padding:1.5rem;color:var(--text-secondary);">
                    <div style="font-size:2.5rem;margin-bottom:0.5rem;">✉️</div>
                    <p style="font-size:0.85rem;">No messages yet. Write your first one above!</p>
                </div>
            `;
            return;
        }

        const catEmoji = { goal: '🎯', promise: '🤝', prediction: '🔮', reminder: '🔔', motivational: '💪' };

        archive.innerHTML = `
            <div style="font-size:0.78rem;font-weight:700;color:var(--text-secondary);margin-bottom:0.75rem;text-transform:uppercase;letter-spacing:0.05em;">Message Archive</div>
            ${messages.map(m => {
                const isReady = !m.is_opened && m.days_until_open === 0;
                const isOpened = m.is_opened;
                const daysLeft = m.days_until_open;
                const openDate = new Date(m.open_date).toLocaleDateString();

                let statusBadge, actionBtn;
                if (isOpened) {
                    statusBadge = `<span class="priority-badge priority-low" style="background:rgba(34,197,94,0.15);color:#22c55e;">Opened ✓</span>`;
                    actionBtn = '';
                } else if (isReady) {
                    statusBadge = `<span class="priority-badge priority-high">Ready to Open! 🔓</span>`;
                    actionBtn = `<button onclick="openFutureSelfMessage(${m.id})" class="btn primary" style="font-size:0.72rem;padding:0.3rem 0.75rem;margin-top:0.5rem;">Open Message</button>`;
                } else {
                    statusBadge = `<span class="priority-badge priority-medium">Opens in ${daysLeft}d</span>`;
                    actionBtn = '';
                }

                return `
                    <div class="future-self-msg-card ${isOpened ? 'opened' : isReady ? 'ready' : 'sealed'}">
                        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.5rem;">
                            <div style="display:flex;align-items:center;gap:0.5rem;flex:1;min-width:0;">
                                <span style="font-size:1.25rem;">${catEmoji[m.category] || '✉️'}</span>
                                <div style="flex:1;min-width:0;">
                                    <div style="font-weight:700;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${m.title}</div>
                                    <div style="font-size:0.7rem;color:var(--text-secondary);">Opens ${openDate}</div>
                                </div>
                            </div>
                            ${statusBadge}
                        </div>
                        ${actionBtn}
                    </div>
                `;
            }).join('')}
        `;
    } catch(e) {
        archive.innerHTML = `<p style="color:var(--error);font-size:0.8rem;">Failed to load messages.</p>`;
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// SMART INSIGHT ENGINE (reusable)
// ══════════════════════════════════════════════════════════════════════════════

function generateSmartInsightCards(identity, history = []) {
    const cards = [];
    const streak = identity.streak || 0;
    const trust = identity.trust_score || 0;
    const tasks = identity.completed_tasks || 0;
    const level = identity.level || 1;

    // Streak insights
    if (streak === 0) {
        cards.push({ icon: 'fas fa-fire', title: 'Start Your Streak', body: 'Complete a task today to ignite your streak. Consistency is the foundation of trust.' });
    } else if (streak >= 3 && streak < 7) {
        cards.push({ icon: 'fas fa-fire', title: `${streak}-Day Streak 🔥`, body: `Only ${7 - streak} more days to reach a 1-week streak. You're building momentum!` });
    } else if (streak >= 7) {
        cards.push({ icon: 'fas fa-fire-flame-curved', title: `${streak}-Day Streak! 🏆`, body: `Incredible consistency. Your streak is in the top tier — protect it!` });
    }

    // Trust trajectory
    if (history.length >= 7) {
        const recent = history.slice(-7).map(h => h.score);
        const avg7 = recent.reduce((a, b) => a + b, 0) / recent.length;
        const prev7 = history.slice(-14, -7).map(h => h.score);
        if (prev7.length > 0) {
            const avgPrev = prev7.reduce((a, b) => a + b, 0) / prev7.length;
            const delta = avg7 - avgPrev;
            if (delta > 2) {
                cards.push({ icon: 'fas fa-trending-up', title: 'Trust Rising 📈', body: `Your trust score improved by ${delta.toFixed(1)} points vs last week. Keep it up!` });
            } else if (delta < -2) {
                cards.push({ icon: 'fas fa-trending-down', title: 'Trust Declining', body: `Your trust score dropped ${Math.abs(delta).toFixed(1)} pts this week. Focus on completing tasks on time.` });
            }
        }
    }

    // Level milestone
    const nextRankThresholds = [6, 11, 21, 36, 50];
    const nextThreshold = nextRankThresholds.find(t => t > level);
    if (nextThreshold) {
        const diff = nextThreshold - level;
        cards.push({ icon: 'fas fa-star', title: `${diff} Levels to Rank Up`, body: `Reach Level ${nextThreshold} to unlock the "${getRankName(nextThreshold)}" rank. Push for it!` });
    }

    // Task milestone
    const taskMilestones = [10, 25, 50, 100, 250, 500];
    const nextTask = taskMilestones.find(t => t > tasks);
    if (nextTask) {
        cards.push({ icon: 'fas fa-tasks', title: `${nextTask - tasks} Tasks to Milestone`, body: `Complete ${nextTask - tasks} more tasks to reach the ${nextTask}-task milestone!` });
    }

    return cards;
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD INTELLIGENCE FEED
// ══════════════════════════════════════════════════════════════════════════════

function generateDashboardIntelligence(identity, todayScore, history) {
    const feed = document.getElementById('dashboard-intelligence-feed');
    if (!feed) return;

    const cards = generateSmartInsightCards(identity, history);

    // Add today-specific insights
    const successRate = (todayScore.success_rate || 0) * 100;
    if (successRate === 100 && todayScore.total > 0) {
        cards.unshift({ icon: 'fas fa-star', title: 'Perfect Day! ⭐', body: 'You completed every task today. Exceptional discipline — trust score boost incoming!' });
    } else if (successRate >= 70) {
        cards.unshift({ icon: 'fas fa-check-circle', title: `Strong Day (${Math.round(successRate)}%)`, body: `${todayScore.completed || 0} tasks done today. You're in the top tier of today's performance.` });
    } else if (successRate > 0 && successRate < 50) {
        cards.unshift({ icon: 'fas fa-exclamation-triangle', title: 'Day Can Still Be Saved', body: `${todayScore.pending || 0} tasks still pending. Every completion helps protect your trust score.` });
    }

    if (cards.length === 0) {
        feed.innerHTML = '';
        return;
    }

    const colors = ['#0a86ff', '#7c3aed', '#f59e0b', '#22c55e', '#ef4444'];
    feed.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
            ${cards.slice(0, 4).map((c, i) => `
                <div class="intelligence-card" style="border-left-color:${colors[i % colors.length]}">
                    <div class="intelligence-icon" style="color:${colors[i % colors.length]};">
                        <i class="${c.icon}"></i>
                    </div>
                    <div class="intelligence-body">
                        <div class="intelligence-title">${c.title}</div>
                        <div class="intelligence-text">${c.body}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function toggleAchievementsVisibility() {
    const wrapper = document.getElementById('achievements-collapse-wrapper');
    const button = document.getElementById('toggle-achievements-btn');
    const chevron = document.getElementById('toggle-achievements-chevron');
    
    if (wrapper.style.display === 'none' || !wrapper.style.display) {
        wrapper.style.display = 'block';
        button.querySelector('span').textContent = 'Hide Achievements';
        chevron.className = 'fas fa-chevron-up';
    } else {
        wrapper.style.display = 'none';
        button.querySelector('span').textContent = 'View Achievements';
        chevron.className = 'fas fa-chevron-down';
    }
}

// ════════════════════════════════════════════════════
// INLINE HISTORY SYSTEM
// ════════════════════════════════════════════════════

const _inlineHistoryState = {
    tasks: { page: 0, hasMore: true },
    goals: { page: 0, hasMore: true },
    habits: { page: 0, hasMore: true }
};

async function loadInlineHistory(type) {
    const state = _inlineHistoryState[type];
    if (!state.hasMore) return;

    const btn = document.getElementById(`${type}-history-btn`);
    const list = document.getElementById(`${type}-history-list`);
    
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    }

    state.page += 1;

    try {
        const params = new URLSearchParams({
            page: state.page,
            limit: 10,
            type: type,
            sort_by: 'completed_at'
        });

        const data = await apiFetch(`/history?${params.toString()}`);
        state.hasMore = data.has_more;

        renderInlineHistoryItems(type, data.items);

        if (btn) {
            btn.disabled = false;
            if (state.hasMore) {
                btn.innerHTML = '<i class="fas fa-chevron-down"></i> Load More History';
            } else {
                btn.style.display = 'none'; // Hide when no more
            }
        }
    } catch (err) {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed to load. Try again.';
        }
    }
}

function renderInlineHistoryItems(type, items) {
    const list = document.getElementById(`${type}-history-list`);
    if (!list) return;

    if (items.length === 0 && _inlineHistoryState[type].page === 1) {
        list.innerHTML = `
            <div class="history-empty" style="padding: 1.5rem; text-align: center; color: var(--text-secondary); opacity: 0.7;">
                <i class="fas fa-clock-rotate-left" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                <span>No history found</span>
            </div>`;
        return;
    }

    const typeIconMap = {
        task:  { icon: 'fas fa-check-square', cls: 'task-icon',  label: 'Task'  },
        goal:  { icon: 'fas fa-bullseye',      cls: 'goal-icon',  label: 'Goal'  },
        habit: { icon: 'fas fa-repeat',        cls: 'habit-icon', label: 'Habit' },
    };

    items.forEach((item, idx) => {
        const typeInfo = typeIconMap[item.item_type] || { icon: 'fas fa-circle', cls: 'task-icon', label: item.item_type };

        const completedAtStr = item.completed_at
            ? new Date(item.completed_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : '—';

        const statusCls = item.status === 'completed' ? 'completed'
                        : item.status === 'achieved'  ? 'achieved'
                        : item.status === 'failed'    ? 'failed'
                        : 'archived';

        const statusLabel = item.status === 'achieved' ? '✦ Achieved'
                          : item.status === 'completed' ? '✔ Completed'
                          : item.status === 'failed'    ? '✖ Failed'
                          : '🗄 Archived';

        const card = document.createElement('div');
        card.className = 'history-item-card';
        card.style.animation = `fadeInCard 0.25s ease both`;
        card.style.animationDelay = `${idx * 0.03}s`;
        card.innerHTML = `
            <div class="history-item-icon ${typeInfo.cls}">
                <i class="${typeInfo.icon}"></i>
            </div>
            <div class="history-item-body">
                <div class="history-item-title" title="${item.title}">${item.title}</div>
                <div class="history-item-meta">
                    <span class="history-badge ${statusCls}">${statusLabel}</span>
                    <span title="Completed / Archived">🕐 ${completedAtStr}</span>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

