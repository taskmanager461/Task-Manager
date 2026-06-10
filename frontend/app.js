// Configuration
// Fix Timezone Bug: Get YYYY-MM-DD in the user's local timezone
Date.prototype.toLocalISOString = function() {
    const d = new Date(this);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

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
        login: "Sign In", signup: "Sign Up", continue_with_google: "Continue with Google", or: "or",
        username_email: "Username or Email", username: "Username", password: "Password", forgot_password: "Forgot password?",
        forgot_password_note: "Enter your email and we'll send you a reset link.", send_reset_link: "Send reset link",
        back_to_login: "Back to sign in", verify_email_title: "Verify your email", verify_email_body: "Check your inbox and click the verification link to continue.",
        verification_code: "Verification code", verify_code: "Verify code", reset_code: "Reset code", use_code: "Use code",
        resend_verification: "Resend verification email", reset_password_title: "Set a new password", new_password: "New password",
        confirm_password: "Confirm password", update_password: "Update password", full_name: "Full Name", email: "Email",
        change_name: "Change Name", change_username: "Change Username", create_account: "Create Account", dashboard: "Dashboard",
        reports: "Reports", me: "Me", tasks: "Tasks", insights: "Insights", progress: "Progress", settings: "Settings", logout: "Logout",
        trust_score: "Trust Score", streak: "Streak", success: "Success", daily_progress: "Daily Progress", statistics: "Statistics",
        task_distribution: "Task Distribution", add_new_task: "Add New Task", new_task: "New Task", task_placeholder: "What needs to be done?",
        category: "Category", difficulty: "Difficulty", easy: "Easy", medium: "Medium", hard: "Hard", cancel: "Cancel", add_task: "Add Task",
        priority: "Priority", low: "Low", high: "High", recurring: "Recurring", none: "None", daily: "Daily", weekly: "Weekly",
        due_date: "Due Date", overdue: "Overdue", all: "All", filter_by: "Filter by",
        productive_day: "Most Productive Day", productive_hour: "Most Productive Hour", trends: "Completion Trends",
        failure_patterns: "Failure Patterns", achievements: "Achievements",
        well_done: "Well done!", keep_going: "Keep it up!", streak_saved: "Streak maintained!", multiplier: "{value}x Boost",
        active: "Active",
        archived: "Archived",
        excellent: "Excellent",
        good: "Good",
        current_streak: "Current Streak",
        best_streak: "Best Streak",
        total_tasks: "Total Tasks",
        total_goals: "Total Goals",
        total_habits: "Total Habits",
        weekly_progress: "Weekly Progress",
        monthly_progress: "Monthly Progress",
        completion_rate: "Completion Rate",
        productivity_score: "Productivity Score",
        achievement_unlocked: "Achievement Unlocked",
        rank_progress: "Rank Progress",
        ach_first_step: "First Step",
        ach_goal_hunter: "Goal Hunter",
        ach_marathon: "Marathon",
        ach_legend: "Legend",
        ach_elite_consistency: "Elite Consistency",
        rank_starter: "Starter",
        rank_builder: "Builder",
        rank_achiever: "Achiever",
        rank_consistent: "Consistent",
        rank_elite: "Elite",
        rank_legend: "Legend",
        rank_explorer: "Explorer",
        rank_master: "Master",
        rank_grandmaster: "Grandmaster",
        notif_task_completed: "Task Completed",
        notif_goal_completed: "Goal Completed",
        notif_achievement_unlocked: "Achievement Unlocked",
        notif_trust_score_increased: "Trust Score Increased",
        notif_level_up: "Level Up",
        search_placeholder: "Search...",
        enter_task_name: "Enter Task Name...",
        select_goal: "Select Goal...",
        select_habit: "Select Habit...",
        description: "Description...",
        reports_tab: "Reports",
        insights_tab: "Insights",
        progress_tab: "Progress",
        me_tab: "Me",
        dashboard_tab: "Dashboard",
        chart_labels: "Chart Labels",
        statistics_lbl: "Statistics",
        analytics_text: "Analytics",
        progress_descriptions: "Progress Descriptions",
        recommendations: "Recommendations",
        smart_insights: "Smart Insights",
        trust_score_changed: "Trust Score changed: {value}",
        goal_link: "Goal Link",
        habit_link: "Habit Link",
        start: "Start",
        finish: "Finish",
        goal_type: "Goal Type",
        deadline: "Deadline",
        custom_deadline: "Custom Deadline",
        create_goal: "Create Goal",
        preferred_time: "Preferred Time",
        frequency: "Frequency",
        days: "Days",
        create_habit: "Create Habit",
        goal_reflection: "Goal Reflection",
        what_went_well: "What went well?",
        what_didnt_go_well: "What didn't go well?",
        skip: "Skip",
        save_reflection: "Save Reflection",
        share_progress: "Share Your Progress",
        download: "Download",
        copy_text: "Copy Text",
        share: "Share",
        profile_link: "Profile Link",
        close: "Close",
        adjust_profile_photo: "Adjust Profile Photo",
        crop_save: "Crop & Save",
        focus_today: "Focus on what matters today.",
        today_short: "Today (Short Length)",
        tomorrow_short: "Tomorrow (Short Length)",
        one_three_days: "1-3 days (Short Length)",
        one_week_med: "1 week (Medium Length)",
        two_weeks_med: "1-2 weeks (Medium Length)",
        one_month_med: "1 month (Medium Length)",
        three_months_long: "3 months (Long Length)",
        six_months_long: "6 months (Long Length)",
        one_year_long: "1 year (Long Length)",
        one_year_plus: "1 year+ (Long Length)",
        tomorrow: "Tomorrow",
        one_week: "1 Week",
        one_month: "1 Month",
        custom_date: "Custom Date",
        specific_days: "Specific Days",
        no_link: "No Link",
        select_a_goal: "Select a goal...",
        select_a_habit: "Select a habit...",
        what_worked: "Tell us about what worked...",
        what_improved: "What could be improved...",
        search_achievements: "Search achievements...",
        goal_title: "Goal title",
        habit_title: "Habit title",
        level: "Level",
        xp_lbl: "XP",
        streak_lbl: "Streak",
        completed_tasks: "Completed Tasks",
        goals_achieved: "Goals Achieved",
        trust_low: "Low",
        trust_average: "Average",
        trust_good: "Good",
        trust_excellent: "Excellent",
        rank_permanent: "Permanent Rank System",
        self_trust_score: "Self Trust Score",
        success_rate: "Success Rate",
        rank: "Rank",
        xp: "XP",
        analytics: "Analytics",
        records: "Records",
        milestones: "Milestones",
        challenges: "Challenges",
        history: "History",
        calendar_labels: "Calendar Labels",
        failed: "Failed",
        next_level: "Next Level",
        search: "Search...",
        common: "Common",
        rare: "Rare",
        epic: "Epic",
        legendary: "Legendary",
        ach_first_step_desc: "Complete the first task.",
        ach_productive_day: "Productive Day",
        ach_productive_day_desc: "Complete 5 tasks in one day.",
        ach_task_machine: "Task Machine",
        ach_task_machine_desc: "Complete 25 tasks.",
        ach_task_master: "Task Master",
        ach_task_master_desc: "Complete 100 tasks.",
        ach_completion_expert: "Completion Expert",
        ach_completion_expert_desc: "Complete 500 tasks.",
        ach_perfection_day: "Perfection Day",
        ach_perfection_day_desc: "Complete every task scheduled for a day.",
        ach_zero_miss_day: "Zero Miss Day",
        ach_zero_miss_day_desc: "Finish a day with no failed tasks.",
        ach_goal_setter: "Goal Setter",
        ach_goal_setter_desc: "Create the first goal.",
        ach_goal_hunter_desc: "Complete the first goal.",
        ach_focused: "Focused",
        ach_focused_desc: "Complete 5 goals.",
        ach_visionary: "Visionary",
        ach_visionary_desc: "Complete 20 goals.",
        ach_unstoppable: "Unstoppable",
        ach_unstoppable_desc: "Complete a long-term goal.",
        ach_habit_beginner: "Habit Beginner",
        ach_habit_beginner_desc: "Create the first habit.",
        ach_consistent: "Consistent",
        ach_consistent_desc: "Maintain a 7 day habit streak.",
        ach_dedicated: "Dedicated",
        ach_dedicated_desc: "Maintain a 30 day habit streak.",
        ach_ritual_master: "Ritual Master",
        ach_ritual_master_desc: "Maintain a 100 day habit streak.",
        ach_habit_collector: "Habit Collector",
        ach_habit_collector_desc: "Have 10 active habits.",
        ach_streak_3: "3 Day Streak",
        ach_streak_3_desc: "Reach a 3 day streak.",
        ach_streak_7: "7 Day Streak",
        ach_streak_7_desc: "Reach a 7 day streak.",
        ach_streak_14: "14 Day Streak",
        ach_streak_14_desc: "Reach a 14 day streak.",
        ach_streak_30: "30 Day Streak",
        ach_streak_30_desc: "Reach a 30 day streak.",
        ach_streak_50: "50 Day Streak",
        ach_streak_50_desc: "Reach a 50 day streak.",
        ach_streak_100: "100 Day Streak",
        ach_streak_100_desc: "Reach a 100 day streak.",
        ach_comeback_king: "Comeback King",
        ach_comeback_king_desc: "Recover after losing a streak.",
        ach_average_citizen: "Average Citizen",
        ach_average_citizen_desc: "Reach Trust 26.",
        ach_reliable: "Reliable",
        ach_reliable_desc: "Reach Trust 51.",
        ach_excellent: "Excellent",
        ach_excellent_desc: "Reach Trust 76.",
        ach_trusted: "Trusted",
        ach_trusted_desc: "Maintain Trust 75+ for 30 days.",
        ach_iron_discipline: "Iron Discipline",
        ach_iron_discipline_desc: "Maintain Trust 90+ for 30 days.",
        ach_elite_consistency_desc: "Reach Trust 100.",
        ach_level_5: "Level 5",
        ach_level_5_desc: "Reach Level 5.",
        ach_level_10: "Level 10",
        ach_level_10_desc: "Reach Level 10.",
        ach_level_25: "Level 25",
        ach_level_25_desc: "Reach Level 25.",
        ach_level_50: "Level 50",
        ach_level_50_desc: "Reach Level 50.",
        ach_level_100: "Level 100",
        ach_level_100_desc: "Reach Level 100.",
        ach_veteran: "Veteran",
        ach_veteran_desc: "Earn 10000 total XP.",
        ach_active_week: "Active Week",
        ach_active_week_desc: "Use the app for 7 consecutive days.",
        ach_active_month: "Active Month",
        ach_active_month_desc: "Use the app for 30 consecutive days.",
        ach_weekend_warrior: "Weekend Warrior",
        ach_weekend_warrior_desc: "Complete tasks during both Saturday and Sunday.",
        ach_perfect_week: "Perfect Week",
        ach_perfect_week_desc: "Complete a week with no failed tasks.",
        ach_night_owl: "Night Owl",
        ach_night_owl_desc: "Complete 50 tasks after 23:00.",
        ach_early_bird: "Early Bird",
        ach_early_bird_desc: "Complete 50 tasks before 08:00.",
        ach_recovery_mode: "Recovery Mode",
        ach_recovery_mode_desc: "Raise Trust from below 25 to above 50.",
        ach_redemption_arc: "Redemption Arc",
        ach_redemption_arc_desc: "Raise Trust from below 25 to above 75.",
        ach_marathon_desc: "Complete 1000 tasks.",
        ach_one_year_strong: "One Year Strong",
        ach_one_year_strong_desc: "Remain active for 365 days.",
        ach_century_streak: "Century Streak",
        ach_century_streak_desc: "Reach a 100 day streak.",
        ach_goal_legend: "Goal Legend",
        ach_goal_legend_desc: "Complete 100 goals.",
        ach_habit_legend: "Habit Legend",
        ach_habit_legend_desc: "Reach a 365 day habit streak.",
        ach_tobedone_legend: "Tobedone Legend",
        ach_tobedone_legend_desc: "Unlock 80% of all achievements.",
        goal_link: "Goal Link",
        habit_link: "Habit Link",
        start: "Start",
        finish: "Finish",
        goal_type: "Goal Type",
        deadline: "Deadline",
        custom_deadline: "Custom Deadline",
        create_goal: "Create Goal",
        preferred_time: "Preferred Time",
        frequency: "Frequency",
        days: "Days",
        create_habit: "Create Habit",
        goal_reflection: "Goal Reflection",
        what_went_well: "What went well?",
        what_didnt_go_well: "What didn't go well?",
        skip: "Skip",
        save_reflection: "Save Reflection",
        share_progress: "Share Your Progress",
        download: "Download",
        copy_text: "Copy Text",
        share: "Share",
        profile_link: "Profile Link",
        close: "Close",
        adjust_profile_photo: "Adjust Profile Photo",
        crop_save: "Crop & Save",
        focus_today: "Focus on what matters today.",
        today_short: "Today (Short Length)",
        tomorrow_short: "Tomorrow (Short Length)",
        one_three_days: "1-3 days (Short Length)",
        one_week_med: "1 week (Medium Length)",
        two_weeks_med: "1-2 weeks (Medium Length)",
        one_month_med: "1 month (Medium Length)",
        three_months_long: "3 months (Long Length)",
        six_months_long: "6 months (Long Length)",
        one_year_long: "1 year (Long Length)",
        one_year_plus: "1 year+ (Long Length)",
        tomorrow: "Tomorrow",
        one_week: "1 Week",
        one_month: "1 Month",
        custom_date: "Custom Date",
        specific_days: "Specific Days",
        no_link: "No Link",
        select_a_goal: "Select a goal...",
        select_a_habit: "Select a habit...",
        what_worked: "Tell us about what worked...",
        what_improved: "What could be improved...",
        search_achievements: "Search achievements...",
        goal_title: "Goal title",
        habit_title: "Habit title",
        level: "Level",
        xp_lbl: "XP",
        streak_lbl: "Streak",
        completed_tasks: "Completed Tasks",
        goals_achieved: "Goals Achieved",
        task_completed: "Task Completed",
        goal_completed: "Goal Completed",
        trust_low: "Low",
        trust_average: "Average",
        trust_good: "Good",
        trust_excellent: "Excellent",
        rank_permanent: "Permanent Rank System",
        trust_score_increased: "Trust Score Increased",
        level_up: "Level Up",
        xp_boost: "XP Boost",
        tasks_count: "{count} tasks today", smart_suggestion: "Smart Suggestion",
        best_time_to_create: "You are most active now! Great time to plan tasks.",
        suggest_simpler: "This task seems complex. Try breaking it down?",
        high_risk: "High risk of failure based on your history for this time/category.",
        optimal_time: "Optimal time to complete this: ", most_productive_day: "Your most productive day is ",
        most_productive_hour: "You get most things done around ", failure_pattern: "You tend to struggle more with tasks in ",
        theme: "Theme", toggle_dark: "Toggle Dark Mode", language: "Language", app_info: "App Info", version: "Version",
        completed: "Completed", failed: "Failed", pending: "Pending", no_tasks: "No tasks for today. Add one above!",
        session_expired: "Session expired", task_added: "Task added successfully!", task_updated: "Task updated!", error_occurred: "An error occurred",
        calendar: "Calendar", date: "Date", time: "Time", reminder: "Reminder",
        view_habits_history: "View Habits History", instructions_btn: "Instructions for New Users",
        force_update: "Force Update App", install_app: "Install App", got_it: "Got it",
        inst_title: "User Instructions", inst_subtitle: "Everything you need to know about Tobedone",
        inst_tasks_title: "Tasks", inst_tasks_desc: "Create new tasks by pressing '+'. Set priority and category. Check the circle to complete them and earn points.",
        inst_dash_title: "Dashboard", inst_dash_desc: "See your progress here. Track how many tasks you completed and view productivity charts.",
        inst_prog_title: "Progress & Badges", inst_prog_desc: "Each task gives you XP. Level up and unlock collectible badges as you achieve goals!",
        inst_gestures_title: "Gestures & Navigation", inst_gestures_desc: "Swipe left or right to quickly switch between the app pages.",
        goals: "Goals", habits: "Habits", goals_tab: "Goals", habits_tab: "Habits", add_goal: "Add Goal", add_habit: "Add Habit", new_goal: "New Goal", new_habit: "New Habit", today_habits: "Today's Habits", goals_subtitle: "Milestones for the future.", habits_subtitle: "Small steps, big results.", reflect: "Reflect", reflection: "Reflection", check_in: "Check-in", save_goal: "Save Goal", save_habit: "Save Habit",
        send_future: "Send to Future",
        mastery_progress: "Mastery Progress",
        send_message_future: "Send Message to Future",
        link_to_goal: "Link to Goal",
        your_analytics: "Your Analytics",
        personal_records: "Personal Records",
        goal_rate: "Goal Rate",
        write_future: "Write to Future",
        full_report: "Full Report",
        future_self: "Future Self",
        view_goals_history: "View Goals History",
        goal_analytics: "Goal Analytics",
        weekly_report: "Weekly Report",
        todays_insights: "Today's Insights",
        weekly_summary: "Weekly Summary",
        best_day: "Best Day",
        analyzing_patterns: "Analyzing patterns...",
        trust_desc: "Trust score determines consistency.",
        limited_time: "Limited Time",
        total_xp: "Total XP",
        tasks_30d: "Tasks (30d)",
        view_tasks_history: "View Tasks History",
        tasks_subtitle: "Your active tasks",
        avg_completion_time: "Avg Completion Time",
        weekly_trend: "Weekly Trend",
        loading_achievements: "Loading achievements...",
        calculating: "Calculating...",
        no_tasks_yet: "No tasks yet",
        no_goals_yet: "No goals yet",
        no_habits_yet: "No habits yet",
        no_habits_today: "No habits scheduled for today.",
        profile: "Profile",
        for_you: "For You",
        save_changes: "Save Changes",
        category_general: "General",
        not_enough_data: "Not enough data",
        tue: "Tue",
        wed: "Wed",
        thu: "Thu",
        fri: "Fri",
        sat: "Sat",
        sun: "Sun",
        jan: "Jan",
        feb: "Feb",
        mar: "Mar",
        apr: "Apr",
        may: "May",
        jun: "Jun",
        jul: "Jul",
        aug: "Aug",
        sep: "Sep",
        oct: "Oct",
        nov: "Nov",
        dec: "Dec",
        january: "January",
        february: "February",
        march: "March",
        april: "April",
        june: "June",
        july: "July",
        august: "August",
        september: "September",
        october: "October",
        november: "November",
        december: "December",
        rec_lvl10_title: "🏆 Level 10 Achieved",
        rec_lvl10_desc: "Reach Level 10 of personal productivity",
        rec_streak7_title: "🔥 7-Day Streak",
        rec_streak7_desc: "Maintain a 7-day streak",
        rec_streak30_title: "🔥 30-Day Streak",
        rec_streak30_desc: "Maintain a 30-day streak",
        rec_goal_title: "🎯 Goal Master",
        rec_goal_desc: "Complete 10 goals",
        rec_elite_title: "⭐ Elite Status",
        rec_elite_desc: "Reach Rank: Elite",
        rec_habit_title: "📅 Habit Builder",
        rec_habit_desc: "Create 5 habits",
        chal_tasks_title: "Complete 5 tasks today",
        chal_tasks_desc: "Push your limits",
        chal_streak_title: "Reach a 3 day streak",
        chal_streak_desc: "Consistency is key",
        future_placeholder: "Write a letter to your future self",
        future_dear: "Dear future me...",
        loading: "Loading...",
        consistency: "consistency",
        opens_in: "Opens in",
        open_message: "Open Message",
        message_archive: "Message Archive",
        day_can_be_saved_body: "tasks still pending. Every completion helps protect your trust score.",
        day_can_be_saved: "Day Can Still Be Saved",
        strong_day_body: "tasks done today. You're in the top tier of today's performance.",
        strong_day: "Strong Day",
        perfect_day_body: "You completed every task today. Exceptional discipline — trust score boost incoming!",
        perfect_day: "Perfect Day! ⭐",
        trust_declining_body2: "pts this week. Focus on completing tasks on time.",
        trust_declining_body: "Your trust score dropped",
        trust_declining: "Trust Declining",
        trust_rising_body2: "points vs last week. Keep it up!",
        trust_rising_body: "Your trust score improved by",
        trust_rising: "Trust Rising 📈",
        streak_7_body: "Incredible consistency. Your streak is in the top tier — protect it!",
        streak_3_body_2: "more days to reach a 1-week streak. You're building momentum!",
        streak_3_body_1: "Only",
        day_streak: "Day Streak",
        tasks_lbl: "Tasks",
        days_left: "days left",
        overdue: "Overdue",
        at_risk: "At Risk",
        on_track: "On Track",
        gentle_nudge: "Gentle nudge",
        habit_reminder: "Habit reminder",
        tasks_for: "Tasks for",
        empty_task_desc: "Create your first task to stay organized and productive.",
        empty_goal_desc: "Create your first goal to track long-term progress.",
        empty_habit_desc: "Build consistency with your first recurring habit.",
        achieved_failed: "Achieved / Failed",
        achieved: "Achieved",
        failed_status: "Failed",
        longest_streak: "Longest Streak",
        highest_xp: "Highest XP Achieved",
        max_tasks_day: "Max Tasks In A Day",
        tasks_word: "Tasks",
        goals_word: "Goals",
        ms_first_step: "First Step",
        ms_first_step_desc: "Complete your first task",
        ms_goal_setter: "Goal Setter",
        ms_goal_setter_desc: "Set your very first goal",
        ms_lvl10: "Level 10 Achieved",
        ms_lvl10_desc: "Reach Level 10 of personal productivity",
        ms_trust_builder: "Trust Builder",
        ms_trust_builder_desc: "Raise self trust score above 50",
        ms_discipline_elite: "Discipline Elite",
        ms_discipline_elite_desc: "Reach Level 25 or achieve elite trust levels",
        ms_legendary: "Legendary Achiever",
        ms_legendary_desc: "Complete 100 tasks and reach level 50",
        locked: "Locked",
        unlocked_status: "Unlocked",
        weekly_perf_card: "Weekly Performance Card",
        weekly_perf_desc: "Auto-generated weekly activity stats",
        monthly_perf_card: "Monthly Performance Review",
        monthly_perf_desc: "Detailed performance metrics review",
        weekly_progress_tab: "Weekly Progress",
        tasks_done: "Tasks Done",
        goals_done: "Goals Done",
        streak_health: "Streak Health",
        trust_growth: "Trust Growth",
        xp_rank_level: "XP Rank Level",
        trust_consistency: "Trust Consistency",
        chal_summer_sprint: "Summer Sprint",
        chal_summer_desc: "Complete 10 tasks to claim a massive boost.",
        chal_30day: "30 Day Consistency",
        chal_30day_desc: "Maintain a streak of 30 days.",
        in_progress: "In Progress",
        xp_reward_500: "+500 XP Reward",
        xp_reward_1500: "+1500 XP Reward",
        sent: "Sent",
        ready: "Ready",
        opened: "Opened",
        no_messages_yet: "No messages yet. Write your first one above!",
        ready_to_open: "Ready to Open!",
        fs_promise: "🤝 Promise",
        fs_prediction: "🔮 Prediction",
        fs_reminder: "🔔 Reminder",
        fs_motivational: "💪 Motivational",
        no_achievements: "No achievements yet",
        for_you_default_body: "Keep completing tasks to unlock personalized guidance",
        profile_updated: "Profile updated",
        profile_update_failed: "Failed to update profile",
        profile_link_copied: "Profile link copied!",
        insight_start_streak: "Start Your Streak",
        insight_start_streak_body: "Complete a task today to ignite your streak. Consistency is the foundation of trust.",
        levels_to_rank: "Levels to Rank Up",
        reach_level: "Reach Level",
        to_unlock: "to unlock the",
        rank_push: "rank. Push for it!",
        tasks_to_milestone: "Tasks to Milestone",
        complete: "Complete",
        more_tasks_milestone: "more tasks to reach the milestone of",
        create_task: "Create Task",
        create_goal: "Create Goal",
        create_habit: "Create Habit",
        pressure_low: "Low Pressure",
        pressure_high: "High Momentum",
        pressure_balanced: "Balanced",
        message_title: "Message title",
        write_message: "Write your message...",
        mon: "Mon",
        tagline: "Plan it. Do it. Done.",
        goal_word: "Goal",
        boost: "Boost",
        average: "Average",
    },
    el: {
        app_title: "Tobedone",
        login: "Σύνδεση", signup: "Εγγραφή", continue_with_google: "Συνέχεια με Google", or: "ή",
        username_email: "Όνομα χρήστη ή Email", username: "Όνομα χρήστη", password: "Κωδικός", forgot_password: "Ξεχάσατε τον κωδικό;",
        forgot_password_note: "Εισάγετε το email σας για σύνδεσμο επαναφοράς.", send_reset_link: "Αποστολή συνδέσμου",
        back_to_login: "Πίσω στη σύνδεση", verify_email_title: "Επαληθεύστε το email σας", verify_email_body: "Ελέγξτε τα εισερχόμενά σας.",
        verification_code: "Κωδικός επαλήθευσης", verify_code: "Επαλήθευση", reset_code: "Κωδικός επαναφοράς", use_code: "Χρήση",
        resend_verification: "Επαναποστολή email", reset_password_title: "Νέος κωδικός", new_password: "Νέος κωδικός",
        confirm_password: "Επιβεβαίωση κωδικού", update_password: "Ενημέρωση", full_name: "Ονοματεπώνυμο", email: "E-mail",
        change_name: "Αλλαγή Ονόματος", change_username: "Αλλαγή Username", create_account: "Δημιουργία Λογαριασμού",
        dashboard: "Ταμπλό", reports: "Αναφορές", me: "Εγώ", tasks: "Εργασίες", insights: "Στατιστικά",
        progress: "Πρόοδος", settings: "Ρυθμίσεις", logout: "Αποσύνδεση",
        trust_score: "Βαθμολογία", streak: "Σερί", success: "Επιτυχία", daily_progress: "Ημερήσια Πρόοδος",
        statistics: "Στατιστικά", task_distribution: "Κατανομή Εργασιών",
        add_new_task: "Νέα Εργασία", new_task: "Νέα Εργασία", task_placeholder: "Τι πρέπει να γίνει;",
        category: "Κατηγορία", difficulty: "Δυσκολία", easy: "Εύκολο", medium: "Μέτριο", hard: "Δύσκολο",
        cancel: "Ακύρωση", add_task: "Προσθήκη", priority: "Προτεραιότητα", low: "Χαμηλή", high: "Υψηλή",
        recurring: "Επαναλαμβανόμενο", none: "Κανένα", daily: "Καθημερινά", weekly: "Εβδομαδιαία",
        due_date: "Ημερομηνία", overdue: "Εκπρόθεσμα", all: "Όλα", filter_by: "Φίλτρο",
        productive_day: "Πιο παραγωγική μέρα", productive_hour: "Πιο παραγωγική ώρα",
        trends: "Τάσεις", failure_patterns: "Μοτίβα αποτυχίας", achievements: "Επιτεύγματα",
        well_done: "Μπράβο!", keep_going: "Συνέχισε!", streak_saved: "Σερί διατηρήθηκε!", multiplier: "{value}x Ενίσχυση",
        active: "Ενεργός",
        archived: "Αρχειοθετήθηκε",
        excellent: "Εξοχος",
        good: "Καλός",
        current_streak: "Τρέχον σερί",
        best_streak: "Καλύτερο σερί",
        total_tasks: "Σύνολο εργασιών",
        total_goals: "Σύνολο στόχων",
        total_habits: "Συνολικές συνήθειες",
        weekly_progress: "Εβδομαδιαία Πρόοδος",
        monthly_progress: "Μηνιαία Πρόοδος",
        completion_rate: "Ποσοστό Ολοκλήρωσης",
        productivity_score: "Βαθμολογία παραγωγικότητας",
        achievement_unlocked: "Το επίτευγμα ξεκλειδώθηκε",
        rank_progress: "Πρόοδος κατάταξης",
        ach_first_step: "Πρώτο Βήμα",
        ach_goal_hunter: "Κυνηγός Γκολ",
        ach_marathon: "Μαραθώνας",
        ach_legend: "Θρύλος",
        ach_elite_consistency: "Ελίτ Συνέπεια",
        rank_starter: "Πρωτάρης",
        rank_builder: "Οικοδόμος",
        rank_achiever: "Κατορθωτής",
        rank_consistent: "Συνεπής",
        rank_elite: "Αφρόκρεμα",
        rank_legend: "Θρύλος",
        rank_explorer: "Εξερευνητής",
        rank_master: "Κύριος",
        rank_grandmaster: "Grandmaster",
        notif_task_completed: "Εργασία Ολοκληρώθηκε",
        notif_goal_completed: "Ο στόχος Ολοκληρώθηκε",
        notif_achievement_unlocked: "Το επίτευγμα ξεκλειδώθηκε",
        notif_trust_score_increased: "Η βαθμολογία εμπιστοσύνης αυξήθηκε",
        notif_level_up: "Level Up",
        search_placeholder: "Ερευνα...",
        enter_task_name: "Εισαγάγετε όνομα εργασίας...",
        select_goal: "Επιλέξτε στόχο...",
        select_habit: "Επιλέξτε Συνήθεια...",
        description: "Περιγραφή...",
        reports_tab: "Αναφορές",
        insights_tab: "Insights",
        progress_tab: "Πρόοδος",
        me_tab: "Μου",
        dashboard_tab: "Ταμπλό",
        chart_labels: "Ετικέτες γραφημάτων",
        statistics_lbl: "Στατιστική",
        analytics_text: "Analytics",
        progress_descriptions: "Περιγραφές προόδου",
        recommendations: "συστάσεις",
        smart_insights: "Smart Insights",
        trust_score_changed: "Trust Score changed: {value}",
        goal_link: "Σύνδεσμος στόχου",
        habit_link: "Σύνδεσμος συνήθειας",
        start: "Αρχή",
        finish: "Τέλος",
        goal_type: "Τύπος στόχου",
        deadline: "Διορία",
        custom_deadline: "Προσαρμοσμένη προθεσμία",
        create_goal: "Δημιουργία στόχου",
        preferred_time: "Προτιμώμενη ώρα",
        frequency: "Συχνότητα",
        days: "Μέρες",
        create_habit: "Δημιουργία συνήθειας",
        goal_reflection: "Αντανάκλαση στόχου",
        what_went_well: "Τι πήγε καλά;",
        what_didnt_go_well: "Τι δεν πήγε καλά;",
        skip: "Παραλείπω",
        save_reflection: "Αποθήκευση Reflection",
        share_progress: "Μοιραστείτε την πρόοδό σας",
        download: "Λήψη",
        copy_text: "Αντιγραφή κειμένου",
        share: "Μερίδιο",
        profile_link: "Σύνδεσμος προφίλ",
        close: "Κοντά",
        adjust_profile_photo: "Προσαρμογή φωτογραφίας προφίλ",
        crop_save: "Περικοπή & Αποθήκευση",
        focus_today: "Εστιάστε σε αυτό που έχει σημασία σήμερα.",
        today_short: "Σήμερα (μικρό μήκος)",
        tomorrow_short: "Αύριο (μικρό μήκος)",
        one_three_days: "1-3 ημέρες (μικρή διάρκεια)",
        one_week_med: "1 εβδομάδα (Μεσαίο Διάρκεια)",
        two_weeks_med: "1-2 εβδομάδες (μέτριας διάρκειας)",
        one_month_med: "1 μήνας (Μεσαίο Διάρκεια)",
        three_months_long: "3 μήνες (Μεγάλη διάρκεια)",
        six_months_long: "6 μήνες (Μεγάλη διάρκεια)",
        one_year_long: "1 έτος (Μεγάλη διάρκεια)",
        one_year_plus: "1 έτος + (Μεγάλη διάρκεια)",
        tomorrow: "Αύριο",
        one_week: "1 Εβδομάδα",
        one_month: "1 Μήνας",
        custom_date: "Προσαρμοσμένη ημερομηνία",
        specific_days: "Συγκεκριμένες Ημέρες",
        no_link: "Χωρίς Σύνδεσμο",
        select_a_goal: "Επιλέξτε έναν στόχο...",
        select_a_habit: "Επιλέξτε μια συνήθεια...",
        what_worked: "Πες μας τι λειτούργησε...",
        what_improved: "Τι θα μπορούσε να βελτιωθεί...",
        search_achievements: "Αναζήτηση επιτευγμάτων...",
        goal_title: "Τίτλος γκολ",
        habit_title: "Τίτλος συνήθειας",
        level: "Επίπεδο",
        xp_lbl: "XP",
        streak_lbl: "Ράβδωση",
        completed_tasks: "Ολοκληρωμένες Εργασίες",
        goals_achieved: "Στόχοι που επιτεύχθηκαν",
        trust_low: "Χαμηλός",
        trust_average: "Μέσος",
        trust_good: "Καλός",
        trust_excellent: "Εξοχος",
        rank_permanent: "Σύστημα μόνιμης κατάταξης",
        self_trust_score: "Βαθμολογία αυτοπεποίθησης",
        success_rate: "Ποσοστό επιτυχίας",
        rank: "Τάξη",
        xp: "XP",
        analytics: "Analytics",
        records: "Εγγραφές",
        milestones: "Ορόσημα",
        challenges: "Προκλήσεις",
        history: "Ιστορία",
        calendar_labels: "Ετικέτες ημερολογίου",
        failed: "Αποτυχημένος",
        next_level: "Επόμενο Επίπεδο",
        search: "Ερευνα...",
        common: "Κοινός",
        rare: "Σπάνιος",
        epic: "Επος",
        legendary: "Μυθικός",
        ach_first_step_desc: "Ολοκληρώστε την πρώτη εργασία.",
        ach_productive_day: "Παραγωγική Ημέρα",
        ach_productive_day_desc: "Ολοκληρώστε 5 εργασίες σε μια μέρα.",
        ach_task_machine: "Μηχανή εργασιών",
        ach_task_machine_desc: "Ολοκληρώστε 25 εργασίες.",
        ach_task_master: "Σκληρός προϊστάμενος",
        ach_task_master_desc: "Ολοκληρώστε 100 εργασίες.",
        ach_completion_expert: "Εμπειρογνώμονας ολοκλήρωσης",
        ach_completion_expert_desc: "Ολοκληρώστε 500 εργασίες.",
        ach_perfection_day: "Ημέρα Τελειότητας",
        ach_perfection_day_desc: "Ολοκληρώστε κάθε εργασία που έχετε προγραμματίσει για μια ημέρα.",
        ach_zero_miss_day: "Zero Miss Day",
        ach_zero_miss_day_desc: "Ολοκληρώστε μια μέρα χωρίς αποτυχημένες εργασίες.",
        ach_goal_setter: "Καθορισμός στόχων",
        ach_goal_setter_desc: "Δημιουργήστε τον πρώτο στόχο.",
        ach_goal_hunter_desc: "Ολοκληρώστε τον πρώτο στόχο.",
        ach_focused: "Εστιασμένος",
        ach_focused_desc: "Συμπλήρωσε 5 γκολ.",
        ach_visionary: "Ονειροπόλος",
        ach_visionary_desc: "Συμπλήρωσε 20 γκολ.",
        ach_unstoppable: "Ασταμάτητο",
        ach_unstoppable_desc: "Ολοκληρώστε έναν μακροπρόθεσμο στόχο.",
        ach_habit_beginner: "Συνήθεια αρχάριος",
        ach_habit_beginner_desc: "Δημιουργήστε την πρώτη συνήθεια.",
        ach_consistent: "Συνεπής",
        ach_consistent_desc: "Διατηρήστε μια σειρά συνήθειας 7 ημερών.",
        ach_dedicated: "Αφιερωμένο",
        ach_dedicated_desc: "Διατηρήστε μια σειρά συνήθειας 30 ημερών.",
        ach_ritual_master: "Τελετουργός",
        ach_ritual_master_desc: "Διατηρήστε μια σειρά συνήθειας 100 ημερών.",
        ach_habit_collector: "Συλλέκτης συνήθειας",
        ach_habit_collector_desc: "Έχετε 10 ενεργές συνήθειες.",
        ach_streak_3: "Σερί 3 ημερών",
        ach_streak_3_desc: "Φτάστε σε σερί 3 ημερών.",
        ach_streak_7: "Σερί 7 ημερών",
        ach_streak_7_desc: "Φτάστε σε ένα σερί 7 ημερών.",
        ach_streak_14: "Σερί 14 ημερών",
        ach_streak_14_desc: "Φτάστε ένα σερί 14 ημερών.",
        ach_streak_30: "Σερί 30 ημερών",
        ach_streak_30_desc: "Φτάστε ένα σερί 30 ημερών.",
        ach_streak_50: "Σερί 50 ημερών",
        ach_streak_50_desc: "Φτάστε ένα σερί 50 ημερών.",
        ach_streak_100: "Σερί 100 ημερών",
        ach_streak_100_desc: "Φτάστε ένα σερί 100 ημερών.",
        ach_comeback_king: "Comeback King",
        ach_comeback_king_desc: "Ανακτήστε μετά την απώλεια ενός σερί.",
        ach_average_citizen: "Μέσος Πολίτης",
        ach_average_citizen_desc: "Προσεγγίστε την εμπιστοσύνη 26.",
        ach_reliable: "Αξιόπιστος",
        ach_reliable_desc: "Προσεγγίστε την εμπιστοσύνη 51.",
        ach_excellent: "Εξοχος",
        ach_excellent_desc: "Προσεγγίστε την εμπιστοσύνη 76.",
        ach_trusted: "Εμπιστος",
        ach_trusted_desc: "Διατηρήστε το Trust 75+ για 30 ημέρες.",
        ach_iron_discipline: "Σιδερένια Πειθαρχία",
        ach_iron_discipline_desc: "Διατηρήστε το Trust 90+ για 30 ημέρες.",
        ach_elite_consistency_desc: "Προσεγγίστε το Trust 100.",
        ach_level_5: "Επίπεδο 5",
        ach_level_5_desc: "Φτάστε στο επίπεδο 5.",
        ach_level_10: "Επίπεδο 10",
        ach_level_10_desc: "Φτάστε στο επίπεδο 10.",
        ach_level_25: "Επίπεδο 25",
        ach_level_25_desc: "Φτάστε στο επίπεδο 25.",
        ach_level_50: "Επίπεδο 50",
        ach_level_50_desc: "Φτάστε στο επίπεδο 50.",
        ach_level_100: "Επίπεδο 100",
        ach_level_100_desc: "Φτάστε στο επίπεδο 100.",
        ach_veteran: "Βετεράνος",
        ach_veteran_desc: "Κερδίστε συνολικά 10000 XP.",
        ach_active_week: "Ενεργή εβδομάδα",
        ach_active_week_desc: "Χρησιμοποιήστε την εφαρμογή για 7 συνεχόμενες ημέρες.",
        ach_active_month: "Ενεργός Μήνας",
        ach_active_month_desc: "Χρησιμοποιήστε την εφαρμογή για 30 συνεχόμενες ημέρες.",
        ach_weekend_warrior: "Πολεμιστής του Σαββατοκύριακου",
        ach_weekend_warrior_desc: "Ολοκληρώστε τις εργασίες τόσο το Σάββατο όσο και την Κυριακή.",
        ach_perfect_week: "Τέλεια εβδομάδα",
        ach_perfect_week_desc: "Ολοκληρώστε μια εβδομάδα χωρίς αποτυχημένες εργασίες.",
        ach_night_owl: "Ξενύχτης",
        ach_night_owl_desc: "Ολοκληρώστε 50 εργασίες μετά τις 23:00.",
        ach_early_bird: "Early Bird",
        ach_early_bird_desc: "Ολοκληρώστε 50 εργασίες πριν τις 08:00.",
        ach_recovery_mode: "Λειτουργία ανάκτησης",
        ach_recovery_mode_desc: "Αυξήστε την εμπιστοσύνη από κάτω από 25 σε πάνω από 50.",
        ach_redemption_arc: "Τόξο λύτρωσης",
        ach_redemption_arc_desc: "Αυξήστε την εμπιστοσύνη από κάτω από 25 σε πάνω από 75.",
        ach_marathon_desc: "Ολοκληρώστε 1000 εργασίες.",
        ach_one_year_strong: "One Year Strong",
        ach_one_year_strong_desc: "Παραμείνετε ενεργοί για 365 ημέρες.",
        ach_century_streak: "Century Streak",
        ach_century_streak_desc: "Φτάστε ένα σερί 100 ημερών.",
        ach_goal_legend: "Θρύλος του γκολ",
        ach_goal_legend_desc: "Συμπλήρωσε 100 γκολ.",
        ach_habit_legend: "Θρύλος Συνήθειας",
        ach_habit_legend_desc: "Αποκτήστε ένα σερί συνήθειας 365 ημερών.",
        ach_tobedone_legend: "Tobedone Legend",
        ach_tobedone_legend_desc: "Ξεκλειδώστε το 80% όλων των επιτευγμάτων.",
        goal_link: "Σύνδεσμος στόχου",
        habit_link: "Σύνδεσμος συνήθειας",
        start: "Αρχή",
        finish: "Τέλος",
        goal_type: "Τύπος στόχου",
        deadline: "Διορία",
        custom_deadline: "Προσαρμοσμένη προθεσμία",
        create_goal: "Δημιουργία στόχου",
        preferred_time: "Προτιμώμενη ώρα",
        frequency: "Συχνότητα",
        days: "Μέρες",
        create_habit: "Δημιουργία συνήθειας",
        goal_reflection: "Αντανάκλαση στόχου",
        what_went_well: "Τι πήγε καλά;",
        what_didnt_go_well: "Τι δεν πήγε καλά;",
        skip: "Παραλείπω",
        save_reflection: "Αποθήκευση Reflection",
        share_progress: "Μοιραστείτε την πρόοδό σας",
        download: "Λήψη",
        copy_text: "Αντιγραφή κειμένου",
        share: "Μερίδιο",
        profile_link: "Σύνδεσμος προφίλ",
        close: "Κοντά",
        adjust_profile_photo: "Προσαρμογή φωτογραφίας προφίλ",
        crop_save: "Περικοπή & Αποθήκευση",
        focus_today: "Εστιάστε σε αυτό που έχει σημασία σήμερα.",
        today_short: "Σήμερα (μικρό μήκος)",
        tomorrow_short: "Αύριο (μικρό μήκος)",
        one_three_days: "1-3 ημέρες (μικρή διάρκεια)",
        one_week_med: "1 εβδομάδα (Μεσαίο Διάρκεια)",
        two_weeks_med: "1-2 εβδομάδες (μέτριας διάρκειας)",
        one_month_med: "1 μήνας (Μεσαίο Διάρκεια)",
        three_months_long: "3 μήνες (Μεγάλη διάρκεια)",
        six_months_long: "6 μήνες (Μεγάλη διάρκεια)",
        one_year_long: "1 έτος (Μεγάλη διάρκεια)",
        one_year_plus: "1 έτος + (Μεγάλη διάρκεια)",
        tomorrow: "Αύριο",
        one_week: "1 Εβδομάδα",
        one_month: "1 Μήνας",
        custom_date: "Προσαρμοσμένη ημερομηνία",
        specific_days: "Συγκεκριμένες Ημέρες",
        no_link: "Χωρίς Σύνδεσμο",
        select_a_goal: "Επιλέξτε έναν στόχο...",
        select_a_habit: "Επιλέξτε μια συνήθεια...",
        what_worked: "Πες μας τι λειτούργησε...",
        what_improved: "Τι θα μπορούσε να βελτιωθεί...",
        search_achievements: "Αναζήτηση επιτευγμάτων...",
        goal_title: "Τίτλος γκολ",
        habit_title: "Τίτλος συνήθειας",
        level: "Επίπεδο",
        xp_lbl: "XP",
        streak_lbl: "Ράβδωση",
        completed_tasks: "Ολοκληρωμένες Εργασίες",
        goals_achieved: "Στόχοι που επιτεύχθηκαν",
        task_completed: "Εργασία Ολοκληρώθηκε",
        goal_completed: "Ο στόχος Ολοκληρώθηκε",
        trust_low: "Χαμηλός",
        trust_average: "Μέσος",
        trust_good: "Καλός",
        trust_excellent: "Εξοχος",
        rank_permanent: "Σύστημα μόνιμης κατάταξης",
        trust_score_increased: "Η βαθμολογία εμπιστοσύνης αυξήθηκε",
        level_up: "Level Up",
    multiplier: "{value}x Ενίσχυση",
        tasks_count: "{count} εργασίες σήμερα", smart_suggestion: "Έξυπνη Πρόταση",
        best_time_to_create: "Είσαι πολύ ενεργός τώρα! Καλή στιγμή για προγραμματισμό.",
        suggest_simpler: "Αυτή η εργασία φαίνεται δύσκολη. Μήπως να τη σπάσεις;",
        high_risk: "Υψηλός κίνδυνος αποτυχίας βάσει του ιστορικού σου.",
        optimal_time: "Ιδανική ώρα: ", most_productive_day: "Η πιο παραγωγική σου μέρα είναι ",
        most_productive_hour: "Ολοκληρώνεις περισσότερα γύρω στις ", failure_pattern: "Συνήθως δυσκολεύεσαι με εργασίες στην κατηγορία ",
        theme: "Θέμα", toggle_dark: "Σκοτεινή Λειτουργία", language: "Γλώσσα",
        app_info: "Πληροφορίες", version: "Έκδοση", completed: "Ολοκληρωμένα", failed: "Απέτυχαν", pending: "Εκκρεμή",
        no_tasks: "Καμία εργασία για σήμερα!", session_expired: "Η συνεδρία έληξε",
        task_added: "Η εργασία προστέθηκε!", task_updated: "Η εργασία ενημερώθηκε!", error_occurred: "Σφάλμα",
        calendar: "Ημερολόγιο", date: "Ημερομηνία", time: "Ώρα", reminder: "Υπενθύμιση",
        view_habits_history: "Προβολή Ιστορικού", instructions_btn: "Οδηγίες για Νέους Χρήστες",
        force_update: "Ενημέρωση Εφαρμογής", install_app: "Εγκατάσταση App", got_it: "Κατάλαβα",
        inst_title: "Οδηγίες Χρήσης", inst_subtitle: "Όλα όσα πρέπει να ξέρετε για το Tobedone",
        inst_tasks_title: "Εργασίες", inst_tasks_desc: "Δημιουργήστε νέες εργασίες πατώντας το '+'. Ορίστε προτεραιότητα και κατηγορία. Πατήστε το κυκλάκι για ολοκλήρωση.",
        inst_dash_title: "Ταμπλό", inst_dash_desc: "Εδώ βλέπετε την πρόοδό σας με διαγράμματα παραγωγικότητας.",
        inst_prog_title: "Πρόοδος & Σήματα", inst_prog_desc: "Κάθε εργασία δίνει XP. Ανεβείτε επίπεδο και ξεκλειδώστε badges!",
        inst_gestures_title: "Πλοήγηση", inst_gestures_desc: "Σύρετε αριστερά-δεξιά για γρήγορη εναλλαγή σελίδων.",
        goals: "Στόχοι", habits: "Συνήθειες", goals_tab: "Στόχοι", habits_tab: "Συνήθειες", add_goal: "Προσθήκη Στόχου", add_habit: "Προσθήκη Συνήθειας", new_goal: "Νέος Στόχος", new_habit: "Νέα Συνήθεια", today_habits: "Σημερινές Συνήθειες", goals_subtitle: "Ορόσημα για το μέλλον.", habits_subtitle: "Μικρά βήματα, μεγάλα αποτελέσματα.", reflect: "Αναστοχασμός", reflection: "Αναστοχασμός", check_in: "Έλεγχος", save_goal: "Αποθήκευση Στόχου", save_habit: "Αποθήκευση Συνήθειας",
        send_future: "Αποστολή στο Μέλλον",
        mastery_progress: "Πρόοδος Κατάκτησης",
        send_message_future: "Στείλε Μήνυμα στο Μέλλον",
        link_to_goal: "Σύνδεση με Στόχο",
        your_analytics: "Τα Στατιστικά Σου",
        personal_records: "Προσωπικά Ρεκόρ",
        goal_rate: "Ρυθμός Στόχων",
        write_future: "Γράψε στο Μέλλον",
        full_report: "Πλήρης Αναφορά",
        future_self: "Μελλοντικός Εαυτός",
        view_goals_history: "Ιστορικό Στόχων",
        goal_analytics: "Ανάλυση Στόχων",
        weekly_report: "Εβδομαδιαία Αναφορά",
        todays_insights: "Σημερινά Στοιχεία",
        weekly_summary: "Εβδομαδιαία Σύνοψη",
        best_day: "Καλύτερη Μέρα",
        analyzing_patterns: "Ανάλυση μοτίβων...",
        trust_desc: "Η εμπιστοσύνη καθορίζει τη συνέπεια.",
        limited_time: "Περιορισμένος Χρόνος",
        total_xp: "Συνολικό XP",
        tasks_30d: "Εργασίες (30ημ)",
        view_tasks_history: "Ιστορικό Εργασιών",
        tasks_subtitle: "Οι ενεργές εργασίες σας",
        avg_completion_time: "Μέσος Χρόνος Ολοκλήρωσης",
        weekly_trend: "Εβδομαδιαία Τάση",
        loading_achievements: "Φόρτωση επιτευγμάτων...",
        calculating: "Υπολογισμός...",
        no_tasks_yet: "Καμία εργασία ακόμα",
        no_goals_yet: "Κανένας στόχος ακόμα",
        no_habits_yet: "Καμία συνήθεια ακόμα",
        no_habits_today: "Καμία συνήθεια προγραμματισμένη για σήμερα.",
        profile: "Προφίλ",
        for_you: "Για Εσένα",
        save_changes: "Αποθήκευση Αλλαγών",
        category_general: "Γενικά",
        not_enough_data: "Δεν υπάρχουν αρκετά δεδομένα",
        tue: "Τρι",
        wed: "Τετ",
        thu: "Πεμ",
        fri: "Παρ",
        sat: "Σαβ",
        sun: "Κυρ",
        jan: "Ιαν",
        feb: "Φεβ",
        mar: "Μαρ",
        apr: "Απρ",
        may: "Μάιος",
        jun: "Ιουν",
        jul: "Ιουλ",
        aug: "Αυγ",
        sep: "Σεπ",
        oct: "Οκτ",
        nov: "Νοε",
        dec: "Δεκ",
        january: "Ιανουάριος",
        february: "Φεβρουάριος",
        march: "Μάρτιος",
        april: "Απρίλιος",
        june: "Ιούνιος",
        july: "Ιούλιος",
        august: "Αύγουστος",
        september: "Σεπτέμβριος",
        october: "Οκτώβριος",
        november: "Νοέμβριος",
        december: "Δεκέμβριος",
        rec_lvl10_title: "🏆 Επίπεδο 10",
        rec_lvl10_desc: "Φτάστε το Επίπεδο 10 παραγωγικότητας",
        rec_streak7_title: "🔥 7 Ημέρες Σερί",
        rec_streak7_desc: "Διατηρήστε 7 ημέρες σερί",
        rec_streak30_title: "🔥 30 Ημέρες Σερί",
        rec_streak30_desc: "Διατηρήστε 30 ημέρες σερί",
        rec_goal_title: "🎯 Master Στόχων",
        rec_goal_desc: "Ολοκληρώστε 10 στόχους",
        rec_elite_title: "⭐ Κατάσταση Elite",
        rec_elite_desc: "Φτάστε στο Rank: Elite",
        rec_habit_title: "📅 Δημιουργός Συνηθειών",
        rec_habit_desc: "Δημιουργήστε 5 συνήθειες",
        chal_tasks_title: "Ολοκληρώστε 5 εργασίες σήμερα",
        chal_tasks_desc: "Ξεπεράστε τα όριά σας",
        chal_streak_title: "Φτάστε 3 μέρες σερί",
        chal_streak_desc: "Η συνέπεια είναι το κλειδί",
        future_placeholder: "Γράψτε ένα γράμμα στον μελλοντικό σας εαυτό",
        future_dear: "Αγαπητέ μελλοντικέ μου εαυτέ...",
        loading: "Φόρτωση...",
        consistency: "συνέπεια",
        opens_in: "Ανοίγει σε",
        open_message: "Άνοιγμα Μηνύματος",
        message_archive: "Αρχείο Μηνυμάτων",
        day_can_be_saved_body: "εργασίες εκκρεμείς. Κάθε ολοκλήρωση προστατεύει την αυτοπεποίθησή σου.",
        day_can_be_saved: "Η Μέρα Μπορεί Να Σωθεί",
        strong_day_body: "εργασίες σήμερα. Είσαι στην κορυφή της απόδοσης!",
        strong_day: "Δυνατή Μέρα",
        perfect_day_body: "Ολοκλήρωσες κάθε εργασία σήμερα. Εξαιρετική πειθαρχία!",
        perfect_day: "Τέλεια Μέρα! ⭐",
        trust_declining_body2: "μονάδες αυτή την εβδομάδα. Εστίασε στην ολοκλήρωση εργασιών.",
        trust_declining_body: "Η βαθμολογία σου μειώθηκε κατά",
        trust_declining: "Αυτοπεποίθηση Μειώνεται",
        trust_rising_body2: "μονάδες σε σχέση με την περασμένη εβδομάδα. Συνέχισε!",
        trust_rising_body: "Η βαθμολογία σου βελτιώθηκε κατά",
        trust_rising: "Αυτοπεποίθηση Ανεβαίνει 📈",
        streak_7_body: "Απίστευτη συνέπεια. Το σερί σου είναι στην κορυφή — προστάτευσέ το!",
        streak_3_body_2: "ακόμα ημέρες για 1 εβδομάδα σερί. Χτίζεις ορμή!",
        streak_3_body_1: "Μόνο",
        day_streak: "Ημέρες Σερί",
        tasks_lbl: "Εργασίες",
        days_left: "ημέρες απομένουν",
        overdue: "Ληξιπρόθεσμο",
        at_risk: "Σε Κίνδυνο",
        on_track: "Στο Δρόμο",
        gentle_nudge: "Ήπια υπενθύμιση",
        habit_reminder: "Υπενθύμιση συνήθειας",
        tasks_for: "Εργασίες για",
        empty_task_desc: "Δημιουργήστε την πρώτη σας εργασία για να μείνετε οργανωμένοι και παραγωγικοί.",
        empty_goal_desc: "Δημιουργήστε τον πρώτο σας στόχο για μακροπρόθεσμη πρόοδο.",
        empty_habit_desc: "Χτίστε συνέπεια με την πρώτη σας επαναλαμβανόμενη συνήθεια.",
        achieved_failed: "Επιτυχημένοι / Αποτυχημένοι",
        achieved: "Επιτυχημένος",
        failed_status: "Αποτυχημένος",
        longest_streak: "Μεγαλύτερο Σερί",
        highest_xp: "Υψηλότερα XP",
        max_tasks_day: "Μέγιστες Εργασίες/Ημέρα",
        tasks_word: "Εργασίες",
        goals_word: "Στόχοι",
        ms_first_step: "Πρώτο Βήμα",
        ms_first_step_desc: "Ολοκληρώστε την πρώτη σας εργασία",
        ms_goal_setter: "Δημιουργός Στόχων",
        ms_goal_setter_desc: "Ορίστε τον πρώτο σας στόχο",
        ms_lvl10: "Επίπεδο 10",
        ms_lvl10_desc: "Φτάστε το Επίπεδο 10 παραγωγικότητας",
        ms_trust_builder: "Χτίστης Εμπιστοσύνης",
        ms_trust_builder_desc: "Αυξήστε τη βαθμολογία αυτοπεποίθησης πάνω από 50",
        ms_discipline_elite: "Ελίτ Πειθαρχίας",
        ms_discipline_elite_desc: "Φτάστε Επίπεδο 25 ή επιτύχετε ελίτ επίπεδα αυτοπεποίθησης",
        ms_legendary: "Θρυλικός",
        ms_legendary_desc: "Ολοκληρώστε 100 εργασίες και φτάστε επίπεδο 50",
        locked: "Κλειδωμένο",
        unlocked_status: "Ξεκλείδωτο",
        weekly_perf_card: "Εβδομαδιαία Κάρτα Απόδοσης",
        weekly_perf_desc: "Αυτόματα δημιουργημένα εβδομαδιαία στατιστικά",
        monthly_perf_card: "Μηνιαία Αξιολόγηση Απόδοσης",
        monthly_perf_desc: "Λεπτομερής αξιολόγηση μετρήσεων απόδοσης",
        weekly_progress_tab: "Εβδομαδιαία Πρόοδος",
        tasks_done: "Εργασίες",
        goals_done: "Στόχοι",
        streak_health: "Υγεία Σερί",
        trust_growth: "Ανάπτυξη Εμπιστοσύνης",
        xp_rank_level: "Επίπεδο XP",
        trust_consistency: "Συνέπεια Εμπιστοσύνης",
        chal_summer_sprint: "Καλοκαιρινό Σπριντ",
        chal_summer_desc: "Ολοκληρώστε 10 εργασίες για τεράστια ώθηση.",
        chal_30day: "Συνέπεια 30 Ημερών",
        chal_30day_desc: "Διατηρήστε σερί 30 ημερών.",
        in_progress: "Σε Εξέλιξη",
        xp_reward_500: "+500 XP Ανταμοιβή",
        xp_reward_1500: "+1500 XP Ανταμοιβή",
        sent: "Απεσταλμένα",
        ready: "Έτοιμα",
        opened: "Ανοιγμένα",
        no_messages_yet: "Δεν υπάρχουν μηνύματα ακόμα. Γράψτε το πρώτο σας παραπάνω!",
        ready_to_open: "Έτοιμο για Άνοιγμα!",
        fs_promise: "🤝 Υπόσχεση",
        fs_prediction: "🔮 Πρόβλεψη",
        fs_reminder: "🔔 Υπενθύμιση",
        fs_motivational: "💪 Κινητοποιητικό",
        no_achievements: "Δεν υπάρχουν επιτεύγματα ακόμα",
        for_you_default_body: "Συνεχίστε να ολοκληρώνετε εργασίες για εξατομικευμένη καθοδήγηση",
        profile_updated: "Το προφίλ ενημερώθηκε",
        profile_update_failed: "Αποτυχία ενημέρωσης προφίλ",
        profile_link_copied: "Ο σύνδεσμος προφίλ αντιγράφηκε!",
        insight_start_streak: "Ξεκινήστε το Σερί σας",
        insight_start_streak_body: "Ολοκληρώστε μια εργασία σήμερα για να ξεκινήσετε το σερί σας. Η συνέπεια είναι η βάση της εμπιστοσύνης.",
        levels_to_rank: "Επίπεδα μέχρι Αναβάθμιση",
        reach_level: "Φτάστε Επίπεδο",
        to_unlock: "για ξεκλείδωμα του",
        rank_push: "βαθμού. Προσπαθήστε!",
        tasks_to_milestone: "Εργασίες μέχρι Ορόσημο",
        complete: "Ολοκληρώστε",
        more_tasks_milestone: "ακόμα εργασίες για το ορόσημο των",
        create_task: "Δημιουργία Εργασίας",
        create_goal: "Δημιουργία Στόχου",
        create_habit: "Δημιουργία Συνήθειας",
        pressure_low: "Χαμηλή Πίεση",
        pressure_high: "Υψηλή Δυναμική",
        pressure_balanced: "Ισορροπημένη",
        message_title: "Τίτλος μηνύματος",
        write_message: "Γράψτε το μήνυμά σας...",
        mon: "Δευ",
        tagline: "Σχεδίασέ το. Κάντο. Ολοκλήρωσέ το.",
        goal_word: "Στόχος",
        boost: "Ενίσχυση",
        average: "Μέσος",
        xp_boost: "XP Ενίσχυση",
    },
    es: {
        app_title: "tobedone",
        login: "Iniciar sesión", signup: "Registrarse", continue_with_google: "Continuar con Google", or: "o",
        username_email: "Usuario o Correo", username: "Usuario", password: "Contraseña", forgot_password: "¿Olvidaste tu contraseña?",
        forgot_password_note: "Ingresa tu correo y te enviaremos un enlace.", send_reset_link: "Enviar enlace",
        back_to_login: "Volver al inicio", verify_email_title: "Verifica tu correo", verify_email_body: "Revisa tu bandeja de entrada.",
        verification_code: "Código de verificación", verify_code: "Verificar", reset_code: "Código de restablecimiento", use_code: "Usar",
        resend_verification: "Reenviar correo", reset_password_title: "Nueva contraseña", new_password: "Nueva contraseña",
        confirm_password: "Confirmar contraseña", update_password: "Actualizar", full_name: "Nombre completo", email: "Correo",
        change_name: "Cambiar nombre", change_username: "Cambiar usuario", create_account: "Crear Cuenta",
        dashboard: "Panel", reports: "Informes", me: "Yo", tasks: "Tareas", insights: "Estadísticas",
        progress: "Progreso", settings: "Ajustes", logout: "Salir",
        trust_score: "Confianza", streak: "Racha", success: "Éxito", daily_progress: "Progreso diario",
        statistics: "Estadísticas", task_distribution: "Distribución de Tareas",
        add_new_task: "Nueva Tarea", new_task: "Nueva Tarea", task_placeholder: "¿Qué hay que hacer?",
        category: "Categoría", difficulty: "Dificultad", easy: "Fácil", medium: "Medio", hard: "Difícil",
        cancel: "Cancelar", add_task: "Añadir", priority: "Prioridad", low: "Baja", high: "Alta",
        recurring: "Recurrente", none: "Ninguno", daily: "Diario", weekly: "Semanal",
        due_date: "Fecha límite", overdue: "Atrasado", all: "Todo", filter_by: "Filtrar por",
        productive_day: "Día más productivo", productive_hour: "Hora más productiva",
        trends: "Tendencias", failure_patterns: "Patrones de fallo", achievements: "Logros",
        well_done: "¡Bien hecho!", keep_going: "¡Sigue así!", streak_saved: "¡Racha mantenida!", multiplier: "{value}x impulso",
        active: "Activo",
        archived: "Archivado",
        excellent: "Excelente",
        good: "Bien",
        current_streak: "Racha actual",
        best_streak: "Mejor racha",
        total_tasks: "Tareas totales",
        total_goals: "Metas totales",
        total_habits: "Hábitos totales",
        weekly_progress: "Progreso semanal",
        monthly_progress: "Progreso mensual",
        completion_rate: "Tasa de finalización",
        productivity_score: "Puntuación de productividad",
        achievement_unlocked: "Logro desbloqueado",
        rank_progress: "Progreso de rango",
        ach_first_step: "Primer paso",
        ach_goal_hunter: "Cazador de goles",
        ach_marathon: "Maratón",
        ach_legend: "Leyenda",
        ach_elite_consistency: "Consistencia de élite",
        rank_starter: "Motor de arranque",
        rank_builder: "Constructor",
        rank_achiever: "triunfador",
        rank_consistent: "Coherente",
        rank_elite: "Élite",
        rank_legend: "Leyenda",
        rank_explorer: "Explorador",
        rank_master: "Maestro",
        rank_grandmaster: "gran maestro",
        notif_task_completed: "Tarea completada",
        notif_goal_completed: "Objetivo completado",
        notif_achievement_unlocked: "Logro desbloqueado",
        notif_trust_score_increased: "Puntuación de confianza aumentada",
        notif_level_up: "Elevar a mismo nivel",
        search_placeholder: "Buscar...",
        enter_task_name: "Introduzca el nombre de la tarea...",
        select_goal: "Seleccionar objetivo...",
        select_habit: "Seleccione Hábito...",
        description: "Descripción...",
        reports_tab: "Informes",
        insights_tab: "Perspectivas",
        progress_tab: "Progreso",
        me_tab: "A mí",
        dashboard_tab: "Panel",
        chart_labels: "Etiquetas de gráficos",
        statistics_lbl: "Estadística",
        analytics_text: "Analítica",
        progress_descriptions: "Descripciones de progreso",
        recommendations: "Recomendaciones",
        smart_insights: "Información inteligente",
        trust_score_changed: "Trust Score changed: {value}",
        goal_link: "Enlace de objetivo",
        habit_link: "Enlace de hábito",
        start: "Comenzar",
        finish: "Finalizar",
        goal_type: "Tipo de objetivo",
        deadline: "Fecha límite",
        custom_deadline: "Fecha límite personalizada",
        create_goal: "Crear objetivo",
        preferred_time: "Hora preferida",
        frequency: "Frecuencia",
        days: "Días",
        create_habit: "Crear hábito",
        goal_reflection: "Reflexión de Meta",
        what_went_well: "¿Qué salió bien?",
        what_didnt_go_well: "¿Qué no salió bien?",
        skip: "Saltar",
        save_reflection: "Guardar reflexión",
        share_progress: "Comparte tu progreso",
        download: "Descargar",
        copy_text: "Copiar texto",
        share: "Compartir",
        profile_link: "Enlace de perfil",
        close: "Cerca",
        adjust_profile_photo: "Ajustar foto de perfil",
        crop_save: "Recortar y guardar",
        focus_today: "Concéntrate en lo que importa hoy.",
        today_short: "Hoy (duración corta)",
        tomorrow_short: "Mañana (duración corta)",
        one_three_days: "1-3 días (duración corta)",
        one_week_med: "1 semana (duración media)",
        two_weeks_med: "1-2 semanas (duración media)",
        one_month_med: "1 mes (duración media)",
        three_months_long: "3 meses (larga duración)",
        six_months_long: "6 meses (larga duración)",
        one_year_long: "1 año (larga duración)",
        one_year_plus: "1 año+ (larga duración)",
        tomorrow: "Mañana",
        one_week: "1 semana",
        one_month: "1 mes",
        custom_date: "Fecha personalizada",
        specific_days: "Días específicos",
        no_link: "Sin enlace",
        select_a_goal: "Selecciona un objetivo...",
        select_a_habit: "Selecciona un hábito...",
        what_worked: "Cuéntanos qué funcionó...",
        what_improved: "¿Qué se podría mejorar...?",
        search_achievements: "Buscar logros...",
        goal_title: "Título del objetivo",
        habit_title: "Título del hábito",
        level: "Nivel",
        xp_lbl: "experiencia",
        streak_lbl: "Racha",
        completed_tasks: "Tareas completadas",
        goals_achieved: "Metas alcanzadas",
        trust_low: "Bajo",
        trust_average: "Promedio",
        trust_good: "Bien",
        trust_excellent: "Excelente",
        rank_permanent: "Sistema de rango permanente",
        self_trust_score: "Puntuación de confianza en uno mismo",
        success_rate: "Tasa de éxito",
        rank: "Rango",
        xp: "experiencia",
        analytics: "Analítica",
        records: "Archivos",
        milestones: "Hitos",
        challenges: "Desafíos",
        history: "Historia",
        calendar_labels: "Etiquetas de calendario",
        failed: "Fallido",
        next_level: "Siguiente nivel",
        search: "Buscar...",
        common: "Común",
        rare: "Extraño",
        epic: "Épico",
        legendary: "Legendario",
        ach_first_step_desc: "Completa la primera tarea.",
        ach_productive_day: "Día Productivo",
        ach_productive_day_desc: "Completa 5 tareas en un día.",
        ach_task_machine: "Máquina de tareas",
        ach_task_machine_desc: "Completa 25 tareas.",
        ach_task_master: "Maestro de tareas",
        ach_task_master_desc: "Completa 100 tareas.",
        ach_completion_expert: "Experto en finalización",
        ach_completion_expert_desc: "Completa 500 tareas.",
        ach_perfection_day: "Día de la perfección",
        ach_perfection_day_desc: "Complete todas las tareas programadas para un día.",
        ach_zero_miss_day: "Día Cero Miss",
        ach_zero_miss_day_desc: "Termina un día sin tareas fallidas.",
        ach_goal_setter: "Establecedor de metas",
        ach_goal_setter_desc: "Crea el primer objetivo.",
        ach_goal_hunter_desc: "Completa el primer objetivo.",
        ach_focused: "enfocado",
        ach_focused_desc: "Completa 5 objetivos.",
        ach_visionary: "Visionario",
        ach_visionary_desc: "Completa 20 objetivos.",
        ach_unstoppable: "Imparable",
        ach_unstoppable_desc: "Completar una meta a largo plazo.",
        ach_habit_beginner: "Principiante de hábitos",
        ach_habit_beginner_desc: "Crea el primer hábito.",
        ach_consistent: "Coherente",
        ach_consistent_desc: "Mantenga una racha de hábitos de 7 días.",
        ach_dedicated: "Dedicado",
        ach_dedicated_desc: "Mantenga una racha de hábitos de 30 días.",
        ach_ritual_master: "Maestro ritual",
        ach_ritual_master_desc: "Mantenga una racha de hábitos de 100 días.",
        ach_habit_collector: "Coleccionista de hábitos",
        ach_habit_collector_desc: "Ten 10 hábitos activos.",
        ach_streak_3: "Racha de 3 días",
        ach_streak_3_desc: "Alcanza una racha de 3 días.",
        ach_streak_7: "Racha de 7 días",
        ach_streak_7_desc: "Alcanza una racha de 7 días.",
        ach_streak_14: "Racha de 14 días",
        ach_streak_14_desc: "Alcanza una racha de 14 días.",
        ach_streak_30: "Racha de 30 días",
        ach_streak_30_desc: "Alcanza una racha de 30 días.",
        ach_streak_50: "Racha de 50 días",
        ach_streak_50_desc: "Alcanza una racha de 50 días.",
        ach_streak_100: "Racha de 100 días",
        ach_streak_100_desc: "Alcanza una racha de 100 días.",
        ach_comeback_king: "Rey del regreso",
        ach_comeback_king_desc: "Recuperarse después de perder una racha.",
        ach_average_citizen: "Ciudadano promedio",
        ach_average_citizen_desc: "Llega a Confianza 26.",
        ach_reliable: "Confiable",
        ach_reliable_desc: "Llega a Confianza 51.",
        ach_excellent: "Excelente",
        ach_excellent_desc: "Llega a Confianza 76.",
        ach_trusted: "Confiable",
        ach_trusted_desc: "Mantenga Trust 75+ durante 30 días.",
        ach_iron_discipline: "Disciplina de hierro",
        ach_iron_discipline_desc: "Mantenga Trust 90+ durante 30 días.",
        ach_elite_consistency_desc: "Alcanza la Confianza 100.",
        ach_level_5: "Nivel 5",
        ach_level_5_desc: "Alcanza el nivel 5.",
        ach_level_10: "Nivel 10",
        ach_level_10_desc: "Llega al nivel 10.",
        ach_level_25: "Nivel 25",
        ach_level_25_desc: "Alcanza el nivel 25.",
        ach_level_50: "Nivel 50",
        ach_level_50_desc: "Alcanza el nivel 50.",
        ach_level_100: "Nivel 100",
        ach_level_100_desc: "Alcanza el nivel 100.",
        ach_veteran: "Veterano",
        ach_veteran_desc: "Gana 10000 XP totales.",
        ach_active_week: "Semana Activa",
        ach_active_week_desc: "Utilice la aplicación durante 7 días consecutivos.",
        ach_active_month: "Mes Activo",
        ach_active_month_desc: "Utilice la aplicación durante 30 días consecutivos.",
        ach_weekend_warrior: "Guerrero de fin de semana",
        ach_weekend_warrior_desc: "Completa tareas tanto durante el sábado como el domingo.",
        ach_perfect_week: "Semana perfecta",
        ach_perfect_week_desc: "Completa una semana sin tareas fallidas.",
        ach_night_owl: "Ave nocturna",
        ach_night_owl_desc: "Completa 50 tareas después de las 23:00.",
        ach_early_bird: "Pájaro temprano",
        ach_early_bird_desc: "Completa 50 tareas antes de las 08:00.",
        ach_recovery_mode: "Modo de recuperación",
        ach_recovery_mode_desc: "Aumentar la confianza de menos de 25 a más de 50.",
        ach_redemption_arc: "Arco de redención",
        ach_redemption_arc_desc: "Aumente la confianza de menos de 25 a más de 75.",
        ach_marathon_desc: "Completa 1000 tareas.",
        ach_one_year_strong: "Un año fuerte",
        ach_one_year_strong_desc: "Permanece activo durante 365 días.",
        ach_century_streak: "Racha del siglo",
        ach_century_streak_desc: "Alcanza una racha de 100 días.",
        ach_goal_legend: "Leyenda del gol",
        ach_goal_legend_desc: "Completa 100 objetivos.",
        ach_habit_legend: "Leyenda del hábito",
        ach_habit_legend_desc: "Alcanza una racha de hábitos de 365 días.",
        ach_tobedone_legend: "Leyenda de Tobedone",
        ach_tobedone_legend_desc: "Desbloquea el 80% de todos los logros.",
        goal_link: "Enlace de objetivo",
        habit_link: "Enlace de hábito",
        start: "Comenzar",
        finish: "Finalizar",
        goal_type: "Tipo de objetivo",
        deadline: "Fecha límite",
        custom_deadline: "Fecha límite personalizada",
        create_goal: "Crear objetivo",
        preferred_time: "Hora preferida",
        frequency: "Frecuencia",
        days: "Días",
        create_habit: "Crear hábito",
        goal_reflection: "Reflexión de Meta",
        what_went_well: "¿Qué salió bien?",
        what_didnt_go_well: "¿Qué no salió bien?",
        skip: "Saltar",
        save_reflection: "Guardar reflexión",
        share_progress: "Comparte tu progreso",
        download: "Descargar",
        copy_text: "Copiar texto",
        share: "Compartir",
        profile_link: "Enlace de perfil",
        close: "Cerca",
        adjust_profile_photo: "Ajustar foto de perfil",
        crop_save: "Recortar y guardar",
        focus_today: "Concéntrate en lo que importa hoy.",
        today_short: "Hoy (duración corta)",
        tomorrow_short: "Mañana (duración corta)",
        one_three_days: "1-3 días (duración corta)",
        one_week_med: "1 semana (duración media)",
        two_weeks_med: "1-2 semanas (duración media)",
        one_month_med: "1 mes (duración media)",
        three_months_long: "3 meses (larga duración)",
        six_months_long: "6 meses (larga duración)",
        one_year_long: "1 año (larga duración)",
        one_year_plus: "1 año+ (larga duración)",
        tomorrow: "Mañana",
        one_week: "1 semana",
        one_month: "1 mes",
        custom_date: "Fecha personalizada",
        specific_days: "Días específicos",
        no_link: "Sin enlace",
        select_a_goal: "Selecciona un objetivo...",
        select_a_habit: "Selecciona un hábito...",
        what_worked: "Cuéntanos qué funcionó...",
        what_improved: "¿Qué se podría mejorar...?",
        search_achievements: "Buscar logros...",
        goal_title: "Título del objetivo",
        habit_title: "Título del hábito",
        level: "Nivel",
        xp_lbl: "experiencia",
        streak_lbl: "Racha",
        completed_tasks: "Tareas completadas",
        goals_achieved: "Metas alcanzadas",
        task_completed: "Tarea completada",
        goal_completed: "Objetivo completado",
        trust_low: "Bajo",
        trust_average: "Promedio",
        trust_good: "Bien",
        trust_excellent: "Excelente",
        rank_permanent: "Sistema de rango permanente",
        trust_score_increased: "Puntuación de confianza aumentada",
        level_up: "Elevar a mismo nivel",
        multiplier: "{value}x Impulso",
        tasks_count: "{count} tareas hoy", smart_suggestion: "Sugerencia Inteligente",
        best_time_to_create: "¡Estás muy activo ahora! Buen momento para planear.",
        suggest_simpler: "Esta tarea parece compleja. ¿La divides?",
        high_risk: "Alto riesgo de fallo según tu historial.",
        optimal_time: "Hora óptima: ", most_productive_day: "Tu día más productivo es ",
        most_productive_hour: "Haces más cosas alrededor de ", failure_pattern: "Sueles tener problemas con tareas de ",
        theme: "Tema", toggle_dark: "Modo Oscuro", language: "Idioma",
        app_info: "Info", version: "Versión", completed: "Completado", failed: "Fallido", pending: "Pendiente",
        no_tasks: "¡No hay tareas para hoy!", session_expired: "Sesión expirada",
        task_added: "¡Tarea añadida!", task_updated: "¡Tarea actualizada!", error_occurred: "Ocurrió un error",
        calendar: "Calendario", date: "Fecha", time: "Hora", reminder: "Recordatorio",
        view_habits_history: "Ver Historial", instructions_btn: "Instrucciones",
        force_update: "Actualizar App", install_app: "Instalar App", got_it: "Entendido",
        inst_title: "Instrucciones", inst_subtitle: "Todo sobre Tobedone",
        inst_tasks_title: "Tareas", inst_tasks_desc: "Crea tareas con '+'. Obtén puntos al completarlas.",
        inst_dash_title: "Panel", inst_dash_desc: "Rastrea tu productividad con gráficos.",
        inst_prog_title: "Progreso", inst_prog_desc: "Gana XP y desbloquea insignias.",
        inst_gestures_title: "Gestos", inst_gestures_desc: "Desliza para cambiar de página.",
        goals: "Metas", habits: "Hábitos", goals_tab: "Metas", habits_tab: "Hábitos", add_goal: "Añadir Meta", add_habit: "Añadir Hábito", new_goal: "Nueva Meta", new_habit: "Nuevo Hábito", today_habits: "Hábitos de Hoy", goals_subtitle: "Hitos para el futuro.", habits_subtitle: "Pequeños pasos, grandes resultados.", reflect: "Reflexionar", reflection: "Reflexión", check_in: "Registro", save_goal: "Guardar Meta", save_habit: "Guardar Hábito",
        send_future: "Enviar al Futuro",
        mastery_progress: "Progreso de Dominio",
        send_message_future: "Enviar Mensaje al Futuro",
        link_to_goal: "Vincular a Meta",
        your_analytics: "Tus Estadísticas",
        personal_records: "Récords Personales",
        goal_rate: "Tasa de Meta",
        write_future: "Escribir al Futuro",
        full_report: "Full Report",
        future_self: "Yo del Futuro",
        view_goals_history: "Ver Historial de Metas",
        goal_analytics: "Análisis de Metas",
        weekly_report: "Weekly Report",
        todays_insights: "Perspectivas de Hoy",
        weekly_summary: "Resumen Semanal",
        best_day: "Mejor Día",
        analyzing_patterns: "Analizando patrones...",
        trust_desc: "El puntaje de confianza determina la consistencia.",
        limited_time: "Tiempo Limitado",
        total_xp: "XP Total",
        tasks_30d: "Tareas (30d)",
        view_tasks_history: "Ver Historial de Tareas",
        tasks_subtitle: "Your active tasks",
        avg_completion_time: "Tiempo Medio de Finalización",
        weekly_trend: "Tendencia Semanal",
        loading_achievements: "Cargando logros...",
        calculating: "Calculando...",
        no_tasks_yet: "Sin tareas aún",
        no_goals_yet: "Sin metas aún",
        no_habits_yet: "Sin hábitos aún",
        no_habits_today: "No hay hábitos programados para hoy.",
        profile: "Profile",
        for_you: "For You",
        save_changes: "Save Changes",
        category_general: "General",
        not_enough_data: "Not enough data",
        tue: "Mar",
        wed: "Mié",
        thu: "Jue",
        fri: "Vie",
        sat: "Sáb",
        sun: "Dom",
        jan: "Jan",
        feb: "Feb",
        mar: "Mar",
        apr: "Apr",
        may: "Mayo",
        jun: "Jun",
        jul: "Jul",
        aug: "Aug",
        sep: "Sep",
        oct: "Oct",
        nov: "Nov",
        dec: "Dec",
        january: "Enero",
        february: "Febrero",
        march: "Marzo",
        april: "Abril",
        june: "Junio",
        july: "Julio",
        august: "Agosto",
        september: "Septiembre",
        october: "Octubre",
        november: "Noviembre",
        december: "Diciembre",
        rec_lvl10_title: "🏆 Level 10 Achieved",
        rec_lvl10_desc: "Reach Level 10 of personal productivity",
        rec_streak7_title: "🔥 7-Day Streak",
        rec_streak7_desc: "Maintain a 7-day streak",
        rec_streak30_title: "🔥 30-Day Streak",
        rec_streak30_desc: "Maintain a 30-day streak",
        rec_goal_title: "🎯 Goal Master",
        rec_goal_desc: "Complete 10 goals",
        rec_elite_title: "⭐ Elite Status",
        rec_elite_desc: "Reach Rank: Elite",
        rec_habit_title: "📅 Habit Builder",
        rec_habit_desc: "Create 5 habits",
        chal_tasks_title: "Complete 5 tasks today",
        chal_tasks_desc: "Push your limits",
        chal_streak_title: "Reach a 3 day streak",
        chal_streak_desc: "Consistency is key",
        future_placeholder: "Write a letter to your future self",
        future_dear: "Dear future me...",
        loading: "Cargando...",
        consistency: "consistencia",
        opens_in: "Abre en",
        open_message: "Abrir Mensaje",
        message_archive: "Archivo de Mensajes",
        day_can_be_saved_body: "tareas pendientes. Cada completación ayuda a proteger tu puntuación.",
        day_can_be_saved: "El Día Aún Se Puede Salvar",
        strong_day_body: "tareas hoy. Estás en el nivel más alto.",
        strong_day: "Día Fuerte",
        perfect_day_body: "Completaste cada tarea hoy. ¡Disciplina excepcional!",
        perfect_day: "¡Día Perfecto! ⭐",
        trust_declining_body2: "puntos esta semana. Enfócate en completar tareas a tiempo.",
        trust_declining_body: "Tu puntuación bajó",
        trust_declining: "Confianza Bajando",
        trust_rising_body2: "puntos vs la semana pasada. ¡Sigue así!",
        trust_rising_body: "Tu puntuación mejoró en",
        trust_rising: "Confianza Subiendo 📈",
        streak_7_body: "¡Consistencia increíble. Tu racha está en el nivel más alto — ¡protégela!",
        streak_3_body_2: "días más para una racha de 1 semana. ¡Estás construyendo impulso!",
        streak_3_body_1: "Solo",
        day_streak: "Días de Racha",
        tasks_lbl: "Tareas",
        days_left: "días restantes",
        overdue: "Vencido",
        at_risk: "En Riesgo",
        on_track: "En Camino",
        gentle_nudge: "Recordatorio suave",
        habit_reminder: "Recordatorio de hábito",
        tasks_for: "Tareas para",
        empty_task_desc: "Crea tu primera tarea para mantenerte organizado y productivo.",
        empty_goal_desc: "Crea tu primer objetivo para seguir el progreso a largo plazo.",
        empty_habit_desc: "Construye consistencia con tu primer hábito recurrente.",
        achieved_failed: "Logrados / Fallidos",
        achieved: "Logrado",
        failed_status: "Fallido",
        longest_streak: "Racha más larga",
        highest_xp: "XP más alto logrado",
        max_tasks_day: "Máx. tareas/día",
        tasks_word: "Tareas",
        goals_word: "Objetivos",
        ms_first_step: "Primer Paso",
        ms_first_step_desc: "Completa tu primera tarea",
        ms_goal_setter: "Creador de Objetivos",
        ms_goal_setter_desc: "Establece tu primer objetivo",
        ms_lvl10: "Nivel 10 Alcanzado",
        ms_lvl10_desc: "Alcanza el Nivel 10 de productividad",
        ms_trust_builder: "Constructor de Confianza",
        ms_trust_builder_desc: "Eleva la puntuación de confianza por encima de 50",
        ms_discipline_elite: "Élite de Disciplina",
        ms_discipline_elite_desc: "Alcanza Nivel 25 o niveles élite de confianza",
        ms_legendary: "Logrador Legendario",
        ms_legendary_desc: "Completa 100 tareas y alcanza nivel 50",
        locked: "Bloqueado",
        unlocked_status: "Desbloqueado",
        weekly_perf_card: "Tarjeta de Rendimiento Semanal",
        weekly_perf_desc: "Estadísticas semanales auto-generadas",
        monthly_perf_card: "Revisión de Rendimiento Mensual",
        monthly_perf_desc: "Revisión detallada de métricas",
        weekly_progress_tab: "Progreso Semanal",
        tasks_done: "Tareas",
        goals_done: "Objetivos",
        streak_health: "Salud de Racha",
        trust_growth: "Crecimiento de Confianza",
        xp_rank_level: "Nivel XP",
        trust_consistency: "Consistencia de Confianza",
        chal_summer_sprint: "Sprint de Verano",
        chal_summer_desc: "Completa 10 tareas para un impulso masivo.",
        chal_30day: "Consistencia 30 Días",
        chal_30day_desc: "Mantén una racha de 30 días.",
        in_progress: "En Progreso",
        xp_reward_500: "+500 XP Recompensa",
        xp_reward_1500: "+1500 XP Recompensa",
        sent: "Enviados",
        ready: "Listos",
        opened: "Abiertos",
        no_messages_yet: "Sin mensajes aún. ¡Escribe el primero arriba!",
        ready_to_open: "¡Listo para Abrir!",
        fs_promise: "🤝 Promesa",
        fs_prediction: "🔮 Predicción",
        fs_reminder: "🔔 Recordatorio",
        fs_motivational: "💪 Motivacional",
        no_achievements: "Sin logros aún",
        for_you_default_body: "Sigue completando tareas para desbloquear orientación personalizada",
        profile_updated: "Perfil actualizado",
        profile_update_failed: "Error al actualizar perfil",
        profile_link_copied: "¡Enlace de perfil copiado!",
        insight_start_streak: "Inicia tu Racha",
        insight_start_streak_body: "Completa una tarea hoy para iniciar tu racha. La consistencia es la base de la confianza.",
        levels_to_rank: "Niveles para Subir",
        reach_level: "Alcanza Nivel",
        to_unlock: "para desbloquear el",
        rank_push: "rango. ¡Esfuérzate!",
        tasks_to_milestone: "Tareas para Hito",
        complete: "Completa",
        more_tasks_milestone: "tareas más para el hito de",
        create_task: "Crear Tarea",
        create_goal: "Crear Objetivo",
        create_habit: "Crear Hábito",
        pressure_low: "Baja Presión",
        pressure_high: "Alto Impulso",
        pressure_balanced: "Equilibrado",
        message_title: "Título del mensaje",
        write_message: "Escribe tu mensaje...",
        mon: "Lun",
        tagline: "Planéalo. Hazlo. Hecho.",
        goal_word: "Meta",
        boost: "Impulso",
        average: "Promedio",
        xp_boost: "Impulso XP",
    },
    fr: {
        app_title: "Tobédon",
        login: "Se connecter", signup: "S'inscrire", continue_with_google: "Continuer avec Google", or: "ou",
        username_email: "Utilisateur ou Email", username: "Utilisateur", password: "Mot de passe", forgot_password: "Mot de passe oublié?",
        forgot_password_note: "Entrez votre email pour un lien de réinitialisation.", send_reset_link: "Envoyer le lien",
        back_to_login: "Retour à la connexion", verify_email_title: "Vérifiez votre email", verify_email_body: "Vérifiez votre boîte de réception.",
        verification_code: "Code de vérification", verify_code: "Vérifier", reset_code: "Code de réinitialisation", use_code: "Utiliser",
        resend_verification: "Renvoyer l'email", reset_password_title: "Nouveau mot de passe", new_password: "Nouveau mot de passe",
        confirm_password: "Confirmer", update_password: "Mettre à jour", full_name: "Nom complet", email: "E-mail",
        change_name: "Changer le nom", change_username: "Changer le nom d'utilisateur", create_account: "Créer un compte",
        dashboard: "Tableau de bord", reports: "Rapports", me: "Moi", tasks: "Tâches", insights: "Statistiques",
        progress: "Progrès", settings: "Paramètres", logout: "Déconnexion",
        trust_score: "Confiance", streak: "Série", success: "Succès", daily_progress: "Progrès quotidien",
        statistics: "Statistiques", task_distribution: "Distribution des Tâches",
        add_new_task: "Nouvelle Tâche", new_task: "Nouvelle Tâche", task_placeholder: "Que faire?",
        category: "Catégorie", difficulty: "Difficulté", easy: "Facile", medium: "Moyen", hard: "Difficile",
        cancel: "Annuler", add_task: "Ajouter", priority: "Priorité", low: "Basse", high: "Haute",
        recurring: "Récurrent", none: "Aucun", daily: "Quotidien", weekly: "Hebdomadaire",
        due_date: "Date limite", overdue: "En retard", all: "Tout", filter_by: "Filtrer par",
        productive_day: "Jour le plus productif", productive_hour: "Heure la plus productive",
        trends: "Tendances", failure_patterns: "Modèles d'échec", achievements: "Réalisations",
        well_done: "Bien joué!", keep_going: "Continuez!", streak_saved: "Série maintenue!", multiplier: "{value}x Boost",
        active: "Actif",
        archived: "Archivé",
        excellent: "Excellent",
        good: "Bien",
        current_streak: "Série actuelle",
        best_streak: "Meilleure séquence",
        total_tasks: "Tâches totales",
        total_goals: "Objectifs totaux",
        total_habits: "Habitudes totales",
        weekly_progress: "Progrès hebdomadaire",
        monthly_progress: "Progrès mensuel",
        completion_rate: "Taux d'achèvement",
        productivity_score: "Score de productivité",
        achievement_unlocked: "Succès débloqué",
        rank_progress: "Progression du classement",
        ach_first_step: "Premier pas",
        ach_goal_hunter: "Chasseur de buts",
        ach_marathon: "Marathon",
        ach_legend: "Légende",
        ach_elite_consistency: "Cohérence d'élite",
        rank_starter: "Démarreur",
        rank_builder: "Constructeur",
        rank_achiever: "Réalisateur",
        rank_consistent: "Cohérent",
        rank_elite: "Élite",
        rank_legend: "Légende",
        rank_explorer: "Explorateur",
        rank_master: "Maître",
        rank_grandmaster: "Grand maître",
        notif_task_completed: "Tâche terminée",
        notif_goal_completed: "Objectif atteint",
        notif_achievement_unlocked: "Succès débloqué",
        notif_trust_score_increased: "Score de confiance augmenté",
        notif_level_up: "Niveau supérieur",
        search_placeholder: "Recherche...",
        enter_task_name: "Entrez le nom de la tâche...",
        select_goal: "Sélectionnez un objectif...",
        select_habit: "Sélectionnez l'habitude...",
        description: "Description...",
        reports_tab: "Rapports",
        insights_tab: "Connaissances",
        progress_tab: "Progrès",
        me_tab: "Moi",
        dashboard_tab: "Tableau de bord",
        chart_labels: "Étiquettes de graphique",
        statistics_lbl: "Statistiques",
        analytics_text: "Analytique",
        progress_descriptions: "Descriptions des progrès",
        recommendations: "Recommandations",
        smart_insights: "Informations intelligentes",
        trust_score_changed: "Trust Score changed: {value}",
        goal_link: "Lien vers l'objectif",
        habit_link: "Lien d'habitude",
        start: "Commencer",
        finish: "Finition",
        goal_type: "Type d'objectif",
        deadline: "Date limite",
        custom_deadline: "Date limite personnalisée",
        create_goal: "Créer un objectif",
        preferred_time: "Heure préférée",
        frequency: "Fréquence",
        days: "Jours",
        create_habit: "Créer une habitude",
        goal_reflection: "Réflexion sur les objectifs",
        what_went_well: "Qu'est-ce qui s'est bien passé ?",
        what_didnt_go_well: "Qu'est-ce qui ne s'est pas bien passé ?",
        skip: "Sauter",
        save_reflection: "Enregistrer la réflexion",
        share_progress: "Partagez vos progrès",
        download: "Télécharger",
        copy_text: "Copier le texte",
        share: "Partager",
        profile_link: "Lien de profil",
        close: "Fermer",
        adjust_profile_photo: "Ajuster la photo de profil",
        crop_save: "Recadrer et enregistrer",
        focus_today: "Concentrez-vous sur ce qui compte aujourd’hui.",
        today_short: "Aujourd'hui (courte durée)",
        tomorrow_short: "Demain (court métrage)",
        one_three_days: "1 à 3 jours (courte durée)",
        one_week_med: "1 semaine (durée moyenne)",
        two_weeks_med: "1 à 2 semaines (durée moyenne)",
        one_month_med: "1 mois (durée moyenne)",
        three_months_long: "3 mois (longue durée)",
        six_months_long: "6 mois (longue durée)",
        one_year_long: "1 an (longue durée)",
        one_year_plus: "1 an+ (longue durée)",
        tomorrow: "Demain",
        one_week: "1 semaine",
        one_month: "1 mois",
        custom_date: "Date personnalisée",
        specific_days: "Jours spécifiques",
        no_link: "Aucun lien",
        select_a_goal: "Sélectionnez un objectif...",
        select_a_habit: "Sélectionnez une habitude...",
        what_worked: "Parlez-nous de ce qui a fonctionné...",
        what_improved: "Qu'est-ce qui pourrait être amélioré...",
        search_achievements: "Rechercher des réalisations...",
        goal_title: "Titre de l'objectif",
        habit_title: "Titre de l'habitude",
        level: "Niveau",
        xp_lbl: "XP",
        streak_lbl: "Traînée",
        completed_tasks: "Tâches terminées",
        goals_achieved: "Objectifs atteints",
        trust_low: "Faible",
        trust_average: "Moyenne",
        trust_good: "Bien",
        trust_excellent: "Excellent",
        rank_permanent: "Système de classement permanent",
        self_trust_score: "Score de confiance en soi",
        success_rate: "Taux de réussite",
        rank: "Rang",
        xp: "XP",
        analytics: "Analytique",
        records: "Enregistrements",
        milestones: "Jalons",
        challenges: "Défis",
        history: "Histoire",
        calendar_labels: "Étiquettes de calendrier",
        failed: "Échoué",
        next_level: "Niveau suivant",
        search: "Recherche...",
        common: "Commun",
        rare: "Rare",
        epic: "Épique",
        legendary: "Légendaire",
        ach_first_step_desc: "Terminez la première tâche.",
        ach_productive_day: "Journée productive",
        ach_productive_day_desc: "Effectuez 5 tâches en une journée.",
        ach_task_machine: "Machine de tâches",
        ach_task_machine_desc: "Effectuez 25 tâches.",
        ach_task_master: "Maître des tâches",
        ach_task_master_desc: "Accomplissez 100 tâches.",
        ach_completion_expert: "Expert en réalisation",
        ach_completion_expert_desc: "Accomplissez 500 tâches.",
        ach_perfection_day: "Journée de la perfection",
        ach_perfection_day_desc: "Terminez toutes les tâches planifiées pour une journée.",
        ach_zero_miss_day: "Journée zéro miss",
        ach_zero_miss_day_desc: "Terminez une journée sans tâches échouées.",
        ach_goal_setter: "Fixateur d'objectifs",
        ach_goal_setter_desc: "Créez le premier objectif.",
        ach_goal_hunter_desc: "Complétez le premier objectif.",
        ach_focused: "Concentré",
        ach_focused_desc: "Complétez 5 objectifs.",
        ach_visionary: "Visionnaire",
        ach_visionary_desc: "Complétez 20 objectifs.",
        ach_unstoppable: "Inarrêtable",
        ach_unstoppable_desc: "Atteignez un objectif à long terme.",
        ach_habit_beginner: "Habitude Débutant",
        ach_habit_beginner_desc: "Créez la première habitude.",
        ach_consistent: "Cohérent",
        ach_consistent_desc: "Maintenez une séquence d'habitudes de 7 jours.",
        ach_dedicated: "Dédié",
        ach_dedicated_desc: "Maintenez une séquence d’habitudes de 30 jours.",
        ach_ritual_master: "Maître Rituel",
        ach_ritual_master_desc: "Maintenez une séquence d’habitudes de 100 jours.",
        ach_habit_collector: "Collectionneur d'habitudes",
        ach_habit_collector_desc: "Ayez 10 habitudes actives.",
        ach_streak_3: "Séquence de 3 jours",
        ach_streak_3_desc: "Atteignez une séquence de 3 jours.",
        ach_streak_7: "Séquence de 7 jours",
        ach_streak_7_desc: "Atteignez une séquence de 7 jours.",
        ach_streak_14: "Séquence de 14 jours",
        ach_streak_14_desc: "Atteignez une séquence de 14 jours.",
        ach_streak_30: "30 jours consécutifs",
        ach_streak_30_desc: "Atteignez une séquence de 30 jours.",
        ach_streak_50: "50 jours consécutifs",
        ach_streak_50_desc: "Atteignez une séquence de 50 jours.",
        ach_streak_100: "Séquence de 100 jours",
        ach_streak_100_desc: "Atteignez une séquence de 100 jours.",
        ach_comeback_king: "Roi du retour",
        ach_comeback_king_desc: "Récupérez après avoir perdu une séquence.",
        ach_average_citizen: "Citoyen moyen",
        ach_average_citizen_desc: "Atteignez la confiance 26.",
        ach_reliable: "Fiable",
        ach_reliable_desc: "Atteignez la confiance 51.",
        ach_excellent: "Excellent",
        ach_excellent_desc: "Atteignez la confiance 76.",
        ach_trusted: "Confiance",
        ach_trusted_desc: "Maintenez Trust 75+ pendant 30 jours.",
        ach_iron_discipline: "Discipline de fer",
        ach_iron_discipline_desc: "Maintenez Trust 90+ pendant 30 jours.",
        ach_elite_consistency_desc: "Atteignez le niveau de confiance 100.",
        ach_level_5: "Niveau 5",
        ach_level_5_desc: "Atteignez le niveau 5.",
        ach_level_10: "Niveau 10",
        ach_level_10_desc: "Atteignez le niveau 10.",
        ach_level_25: "Niveau 25",
        ach_level_25_desc: "Atteignez le niveau 25.",
        ach_level_50: "Niveau 50",
        ach_level_50_desc: "Atteignez le niveau 50.",
        ach_level_100: "Niveau 100",
        ach_level_100_desc: "Atteignez le niveau 100.",
        ach_veteran: "Vétéran",
        ach_veteran_desc: "Gagnez 10 000 XP au total.",
        ach_active_week: "Semaine active",
        ach_active_week_desc: "Utilisez l'application pendant 7 jours consécutifs.",
        ach_active_month: "Mois actif",
        ach_active_month_desc: "Utilisez l'application pendant 30 jours consécutifs.",
        ach_weekend_warrior: "Guerrier du week-end",
        ach_weekend_warrior_desc: "Effectuez les tâches le samedi et le dimanche.",
        ach_perfect_week: "Semaine parfaite",
        ach_perfect_week_desc: "Terminez une semaine sans tâches échouées.",
        ach_night_owl: "Oiseau de nuit",
        ach_night_owl_desc: "Terminez 50 tâches après 23h00.",
        ach_early_bird: "Lève-tôt",
        ach_early_bird_desc: "Terminez 50 tâches avant 08h00.",
        ach_recovery_mode: "Mode de récupération",
        ach_recovery_mode_desc: "Augmentez la confiance de moins de 25 à plus de 50.",
        ach_redemption_arc: "Arc de rédemption",
        ach_redemption_arc_desc: "Augmentez la confiance de moins de 25 à plus de 75.",
        ach_marathon_desc: "Effectuez 1 000 tâches.",
        ach_one_year_strong: "Fort d'un an",
        ach_one_year_strong_desc: "Restez actif pendant 365 jours.",
        ach_century_streak: "Série de siècles",
        ach_century_streak_desc: "Atteignez une séquence de 100 jours.",
        ach_goal_legend: "Légende des buts",
        ach_goal_legend_desc: "Complétez 100 objectifs.",
        ach_habit_legend: "Légende des habitudes",
        ach_habit_legend_desc: "Atteignez une séquence d'habitudes de 365 jours.",
        ach_tobedone_legend: "Légende de Tobedone",
        ach_tobedone_legend_desc: "Débloquez 80 % de toutes les réalisations.",
        goal_link: "Lien vers l'objectif",
        habit_link: "Lien d'habitude",
        start: "Commencer",
        finish: "Finition",
        goal_type: "Type d'objectif",
        deadline: "Date limite",
        custom_deadline: "Date limite personnalisée",
        create_goal: "Créer un objectif",
        preferred_time: "Heure préférée",
        frequency: "Fréquence",
        days: "Jours",
        create_habit: "Créer une habitude",
        goal_reflection: "Réflexion sur les objectifs",
        what_went_well: "Qu'est-ce qui s'est bien passé ?",
        what_didnt_go_well: "Qu'est-ce qui ne s'est pas bien passé ?",
        skip: "Sauter",
        save_reflection: "Enregistrer la réflexion",
        share_progress: "Partagez vos progrès",
        download: "Télécharger",
        copy_text: "Copier le texte",
        share: "Partager",
        profile_link: "Lien de profil",
        close: "Fermer",
        adjust_profile_photo: "Ajuster la photo de profil",
        crop_save: "Recadrer et enregistrer",
        focus_today: "Concentrez-vous sur ce qui compte aujourd’hui.",
        today_short: "Aujourd'hui (courte durée)",
        tomorrow_short: "Demain (court métrage)",
        one_three_days: "1 à 3 jours (courte durée)",
        one_week_med: "1 semaine (durée moyenne)",
        two_weeks_med: "1 à 2 semaines (durée moyenne)",
        one_month_med: "1 mois (durée moyenne)",
        three_months_long: "3 mois (longue durée)",
        six_months_long: "6 mois (longue durée)",
        one_year_long: "1 an (longue durée)",
        one_year_plus: "1 an+ (longue durée)",
        tomorrow: "Demain",
        one_week: "1 semaine",
        one_month: "1 mois",
        custom_date: "Date personnalisée",
        specific_days: "Jours spécifiques",
        no_link: "Aucun lien",
        select_a_goal: "Sélectionnez un objectif...",
        select_a_habit: "Sélectionnez une habitude...",
        what_worked: "Parlez-nous de ce qui a fonctionné...",
        what_improved: "Qu'est-ce qui pourrait être amélioré...",
        search_achievements: "Rechercher des réalisations...",
        goal_title: "Titre de l'objectif",
        habit_title: "Titre de l'habitude",
        level: "Niveau",
        xp_lbl: "XP",
        streak_lbl: "Traînée",
        completed_tasks: "Tâches terminées",
        goals_achieved: "Objectifs atteints",
        task_completed: "Tâche terminée",
        goal_completed: "Objectif atteint",
        trust_low: "Faible",
        trust_average: "Moyenne",
        trust_good: "Bien",
        trust_excellent: "Excellent",
        rank_permanent: "Système de classement permanent",
        trust_score_increased: "Score de confiance augmenté",
        level_up: "Niveau supérieur",
    multiplier: "{value}x Bonus",
        tasks_count: "{count} tâches", smart_suggestion: "Suggestion Intelligente",
        best_time_to_create: "Vous êtes très actif maintenant!",
        suggest_simpler: "Cette tâche semble complexe. La diviser?",
        high_risk: "Haut risque d'échec selon votre historique.",
        optimal_time: "Heure optimale: ", most_productive_day: "Jour le plus productif: ",
        most_productive_hour: "Heure la plus productive: ", failure_pattern: "Vous luttez avec les tâches de ",
        theme: "Thème", toggle_dark: "Mode Sombre", language: "Langue",
        app_info: "Info", version: "Version", completed: "Terminé", failed: "Échoué", pending: "En attente",
        no_tasks: "Pas de tâches pour aujourd'hui!", session_expired: "Session expirée",
        task_added: "Tâche ajoutée!", task_updated: "Tâche mise à jour!", error_occurred: "Une erreur est survenue",
        calendar: "Calendrier", date: "Date", time: "Heure", reminder: "Rappel",
        view_habits_history: "Historique", instructions_btn: "Instructions",
        force_update: "Mettre à jour l'App", install_app: "Installer l'App", got_it: "Compris",
        inst_title: "Instructions", inst_subtitle: "Tout sur Tobedone",
        inst_tasks_title: "Tâches", inst_tasks_desc: "Créez des tâches avec '+'. Obtenez des points.",
        inst_dash_title: "Tableau de bord", inst_dash_desc: "Suivez votre productivité.",
        inst_prog_title: "Progrès", inst_prog_desc: "Gagnez des XP et des badges.",
        inst_gestures_title: "Gestes", inst_gestures_desc: "Glissez pour changer de page.",
        goals: "Objectifs", habits: "Habitudes", goals_tab: "Objectifs", habits_tab: "Habitudes", add_goal: "Ajouter Objectif", add_habit: "Ajouter Habitude", new_goal: "Nouvel Objectif", new_habit: "Nouvelle Habitude", today_habits: "Habitudes du Jour", goals_subtitle: "Jalons pour l'avenir.", habits_subtitle: "Petits pas, grands résultats.", reflect: "Réfléchir", reflection: "Réflexion", check_in: "Point", save_goal: "Enregistrer Objectif", save_habit: "Enregistrer Habitude",
        send_future: "Envoyer au Futur",
        mastery_progress: "Progression de Maîtrise",
        send_message_future: "Envoyer Message au Futur",
        link_to_goal: "Lier à Objectif",
        your_analytics: "Vos Analyses",
        personal_records: "Records Personnels",
        goal_rate: "Taux d'Objectif",
        write_future: "Écrire au Futur",
        full_report: "Full Report",
        future_self: "Moi Futur",
        view_goals_history: "Voir Historique des Objectifs",
        goal_analytics: "Analyse des Objectifs",
        weekly_report: "Weekly Report",
        todays_insights: "Aperçus d'Aujourd'hui",
        weekly_summary: "Résumé Hebdomadaire",
        best_day: "Meilleur Jour",
        analyzing_patterns: "Analyse des modèles...",
        trust_desc: "Le score de confiance détermine la constance.",
        limited_time: "Temps Limité",
        total_xp: "XP Total",
        tasks_30d: "Tâches (30j)",
        view_tasks_history: "Voir Historique des Tâches",
        tasks_subtitle: "Your active tasks",
        avg_completion_time: "Temps Moyen Achèvement",
        weekly_trend: "Tendance Hebdo",
        loading_achievements: "Chargement des réalisations...",
        calculating: "Calcul en cours...",
        no_tasks_yet: "Aucune tâche",
        no_goals_yet: "Aucun objectif",
        no_habits_yet: "Aucune habitude",
        no_habits_today: "Pas d'habitudes prévues aujourd'hui.",
        profile: "Profile",
        for_you: "For You",
        save_changes: "Save Changes",
        category_general: "General",
        not_enough_data: "Not enough data",
        tue: "Mar",
        wed: "Mer",
        thu: "Jeu",
        fri: "Ven",
        sat: "Sam",
        sun: "Dim",
        jan: "Jan",
        feb: "Feb",
        mar: "Mar",
        apr: "Apr",
        may: "Mai",
        jun: "Jun",
        jul: "Jul",
        aug: "Aug",
        sep: "Sep",
        oct: "Oct",
        nov: "Nov",
        dec: "Dec",
        january: "Janvier",
        february: "Février",
        march: "Mars",
        april: "Avril",
        june: "Juin",
        july: "Juillet",
        august: "Août",
        september: "Septembre",
        october: "Octobre",
        november: "Novembre",
        december: "Décembre",
        rec_lvl10_title: "🏆 Level 10 Achieved",
        rec_lvl10_desc: "Reach Level 10 of personal productivity",
        rec_streak7_title: "🔥 7-Day Streak",
        rec_streak7_desc: "Maintain a 7-day streak",
        rec_streak30_title: "🔥 30-Day Streak",
        rec_streak30_desc: "Maintain a 30-day streak",
        rec_goal_title: "🎯 Goal Master",
        rec_goal_desc: "Complete 10 goals",
        rec_elite_title: "⭐ Elite Status",
        rec_elite_desc: "Reach Rank: Elite",
        rec_habit_title: "📅 Habit Builder",
        rec_habit_desc: "Create 5 habits",
        chal_tasks_title: "Complete 5 tasks today",
        chal_tasks_desc: "Push your limits",
        chal_streak_title: "Reach a 3 day streak",
        chal_streak_desc: "Consistency is key",
        future_placeholder: "Write a letter to your future self",
        future_dear: "Dear future me...",
        loading: "Chargement...",
        consistency: "consistance",
        opens_in: "S'ouvre dans",
        open_message: "Ouvrir le Message",
        message_archive: "Archive des Messages",
        day_can_be_saved_body: "tâches en attente. Chaque complétion aide à protéger votre score.",
        day_can_be_saved: "La Journée Peut Encore Être Sauvée",
        strong_day_body: "tâches aujourd'hui. Vous êtes au sommet des performances!",
        strong_day: "Forte Journée",
        perfect_day_body: "Vous avez complété chaque tâche aujourd'hui. Discipline exceptionnelle!",
        perfect_day: "Journée Parfaite! ⭐",
        trust_declining_body2: "points cette semaine. Concentrez-vous sur les tâches à temps.",
        trust_declining_body: "Votre score a baissé de",
        trust_declining: "Confiance en Baisse",
        trust_rising_body2: "points vs la semaine dernière. Continuez!",
        trust_rising_body: "Votre score a amélioré de",
        trust_rising: "Confiance en Hausse 📈",
        streak_7_body: "Consistance incroyable. Votre série est au sommet — protégez-la!",
        streak_3_body_2: "jours de plus pour une série d'1 semaine. Vous bâtissez de l'élan!",
        streak_3_body_1: "Seulement",
        day_streak: "Jours de Série",
        tasks_lbl: "Tâches",
        days_left: "jours restants",
        overdue: "En Retard",
        at_risk: "En Risque",
        on_track: "Dans les Temps",
        gentle_nudge: "Rappel doux",
        habit_reminder: "Rappel d'habitude",
        tasks_for: "Tâches pour",
        empty_task_desc: "Créez votre première tâche pour rester organisé et productif.",
        empty_goal_desc: "Créez votre premier objectif pour suivre vos progrès.",
        empty_habit_desc: "Construisez la régularité avec votre première habitude.",
        achieved_failed: "Atteints / Échoués",
        achieved: "Atteint",
        failed_status: "Échoué",
        longest_streak: "Plus longue série",
        highest_xp: "XP le plus élevé",
        max_tasks_day: "Max tâches/jour",
        tasks_word: "Tâches",
        goals_word: "Objectifs",
        ms_first_step: "Premier Pas",
        ms_first_step_desc: "Complétez votre première tâche",
        ms_goal_setter: "Créateur d'Objectifs",
        ms_goal_setter_desc: "Définissez votre premier objectif",
        ms_lvl10: "Niveau 10 Atteint",
        ms_lvl10_desc: "Atteignez le Niveau 10 de productivité",
        ms_trust_builder: "Bâtisseur de Confiance",
        ms_trust_builder_desc: "Élevez le score de confiance au-dessus de 50",
        ms_discipline_elite: "Élite de Discipline",
        ms_discipline_elite_desc: "Atteignez Niveau 25 ou niveaux élite de confiance",
        ms_legendary: "Légende",
        ms_legendary_desc: "Complétez 100 tâches et atteignez niveau 50",
        locked: "Verrouillé",
        unlocked_status: "Déverrouillé",
        weekly_perf_card: "Carte de Performance Hebdomadaire",
        weekly_perf_desc: "Statistiques hebdomadaires auto-générées",
        monthly_perf_card: "Revue de Performance Mensuelle",
        monthly_perf_desc: "Revue détaillée des métriques",
        weekly_progress_tab: "Progrès Hebdomadaire",
        tasks_done: "Tâches",
        goals_done: "Objectifs",
        streak_health: "Santé de Série",
        trust_growth: "Croissance Confiance",
        xp_rank_level: "Niveau XP",
        trust_consistency: "Régularité Confiance",
        chal_summer_sprint: "Sprint Estival",
        chal_summer_desc: "Complétez 10 tâches pour un boost massif.",
        chal_30day: "Régularité 30 Jours",
        chal_30day_desc: "Maintenez une série de 30 jours.",
        in_progress: "En Cours",
        xp_reward_500: "+500 XP Récompense",
        xp_reward_1500: "+1500 XP Récompense",
        sent: "Envoyés",
        ready: "Prêts",
        opened: "Ouverts",
        no_messages_yet: "Pas encore de messages. Écrivez le premier ci-dessus !",
        ready_to_open: "Prêt à Ouvrir !",
        fs_promise: "🤝 Promesse",
        fs_prediction: "🔮 Prédiction",
        fs_reminder: "🔔 Rappel",
        fs_motivational: "💪 Motivationnel",
        no_achievements: "Pas encore de succès",
        for_you_default_body: "Continuez à compléter des tâches pour des conseils personnalisés",
        profile_updated: "Profil mis à jour",
        profile_update_failed: "Échec de mise à jour du profil",
        profile_link_copied: "Lien de profil copié !",
        insight_start_streak: "Démarrez votre Série",
        insight_start_streak_body: "Complétez une tâche pour démarrer votre série. La régularité est la base de la confiance.",
        levels_to_rank: "Niveaux pour Monter",
        reach_level: "Atteignez Niveau",
        to_unlock: "pour débloquer le",
        rank_push: "rang. Foncez !",
        tasks_to_milestone: "Tâches vers Jalon",
        complete: "Complétez",
        more_tasks_milestone: "tâches de plus vers le jalon de",
        create_task: "Créer Tâche",
        create_goal: "Créer Objectif",
        create_habit: "Créer Habitude",
        pressure_low: "Basse Pression",
        pressure_high: "Haute Dynamique",
        pressure_balanced: "Équilibré",
        message_title: "Titre du message",
        write_message: "Écrivez votre message...",
        mon: "Lun",
        tagline: "Planifiez. Faites. Terminé.",
        goal_word: "Objectif",
        boost: "Boost",
        average: "Moyen",
        xp_boost: "Boost XP",
    },
    de: {
        app_title: "Tobedone",
        login: "Anmelden", signup: "Registrieren", continue_with_google: "Mit Google fortfahren", or: "oder",
        username_email: "Benutzer oder E-Mail", username: "Benutzername", password: "Passwort", forgot_password: "Passwort vergessen?",
        forgot_password_note: "Geben Sie Ihre E-Mail ein für einen Reset-Link.", send_reset_link: "Link senden",
        back_to_login: "Zurück zum Login", verify_email_title: "E-Mail bestätigen", verify_email_body: "Überprüfen Sie Ihren Posteingang.",
        verification_code: "Bestätigungscode", verify_code: "Bestätigen", reset_code: "Reset-Code", use_code: "Verwenden",
        resend_verification: "E-Mail erneut senden", reset_password_title: "Neues Passwort", new_password: "Neues Passwort",
        confirm_password: "Passwort bestätigen", update_password: "Aktualisieren", full_name: "Vollständiger Name", email: "E-Mail",
        change_name: "Name ändern", change_username: "Benutzername ändern", create_account: "Konto erstellen",
        dashboard: "Armaturenbrett", reports: "Berichte", me: "Ich", tasks: "Aufgaben", insights: "Einblicke",
        progress: "Fortschritt", settings: "Einstellungen", logout: "Abmelden",
        trust_score: "Vertrauen", streak: "Serie", success: "Erfolg", daily_progress: "Tagesfortschritt",
        statistics: "Statistiken", task_distribution: "Aufgabenverteilung",
        add_new_task: "Neue Aufgabe", new_task: "Neue Aufgabe", task_placeholder: "Was ist zu tun?",
        category: "Kategorie", difficulty: "Schwierigkeit", easy: "Leicht", medium: "Mittel", hard: "Schwer",
        cancel: "Abbrechen", add_task: "Hinzufügen", priority: "Priorität", low: "Niedrig", high: "Hoch",
        recurring: "Wiederkehrend", none: "Keine", daily: "Täglich", weekly: "Wöchentlich",
        due_date: "Fälligkeitsdatum", overdue: "Überfällig", all: "Alle", filter_by: "Filtern nach",
        productive_day: "Produktivster Tag", productive_hour: "Produktivste Stunde",
        trends: "Trends", failure_patterns: "Fehlermuster", achievements: "Erfolge",
        well_done: "Gut gemacht!", keep_going: "Weiter so!", streak_saved: "Serie gehalten!", multiplier: "{value}x Boost",
        active: "Aktiv",
        archived: "Archiviert",
        excellent: "Exzellent",
        good: "Gut",
        current_streak: "Aktueller Streak",
        best_streak: "Beste Serie",
        total_tasks: "Gesamtaufgaben",
        total_goals: "Gesamtziele",
        total_habits: "Gesamtgewohnheiten",
        weekly_progress: "Wöchentlicher Fortschritt",
        monthly_progress: "Monatlicher Fortschritt",
        completion_rate: "Abschlussrate",
        productivity_score: "Produktivitätsbewertung",
        achievement_unlocked: "Erfolg freigeschaltet",
        rank_progress: "Rangfortschritt",
        ach_first_step: "Erster Schritt",
        ach_goal_hunter: "Zieljäger",
        ach_marathon: "Marathon",
        ach_legend: "Legende",
        ach_elite_consistency: "Elite-Konsistenz",
        rank_starter: "Anlasser",
        rank_builder: "Baumeister",
        rank_achiever: "Leistungsträger",
        rank_consistent: "Konsistent",
        rank_elite: "Elite",
        rank_legend: "Legende",
        rank_explorer: "Forscher",
        rank_master: "Master",
        rank_grandmaster: "Großmeister",
        notif_task_completed: "Aufgabe abgeschlossen",
        notif_goal_completed: "Ziel erreicht",
        notif_achievement_unlocked: "Erfolg freigeschaltet",
        notif_trust_score_increased: "Vertrauenswert erhöht",
        notif_level_up: "Level aufsteigen",
        search_placeholder: "Suchen...",
        enter_task_name: "Geben Sie den Aufgabennamen ein...",
        select_goal: "Ziel auswählen...",
        select_habit: "Wählen Sie Gewohnheit...",
        description: "Beschreibung...",
        reports_tab: "Berichte",
        insights_tab: "Einblicke",
        progress_tab: "Fortschritt",
        me_tab: "Mich",
        dashboard_tab: "Armaturenbrett",
        chart_labels: "Diagrammbeschriftungen",
        statistics_lbl: "Statistiken",
        analytics_text: "Analytik",
        progress_descriptions: "Fortschrittsbeschreibungen",
        recommendations: "Empfehlungen",
        smart_insights: "Intelligente Einblicke",
        trust_score_changed: "Trust Score changed: {value}",
        goal_link: "Ziellink",
        habit_link: "Gewohnheitslink",
        start: "Start",
        finish: "Beenden",
        goal_type: "Zieltyp",
        deadline: "Frist",
        custom_deadline: "Benutzerdefinierte Frist",
        create_goal: "Ziel erstellen",
        preferred_time: "Bevorzugte Zeit",
        frequency: "Frequenz",
        days: "Tage",
        create_habit: "Gewohnheit schaffen",
        goal_reflection: "Zielreflexion",
        what_went_well: "Was ist gut gelaufen?",
        what_didnt_go_well: "Was ist nicht gut gelaufen?",
        skip: "Überspringen",
        save_reflection: "Reflexion speichern",
        share_progress: "Teilen Sie Ihren Fortschritt",
        download: "Herunterladen",
        copy_text: "Text kopieren",
        share: "Aktie",
        profile_link: "Profillink",
        close: "Schließen",
        adjust_profile_photo: "Passen Sie das Profilfoto an",
        crop_save: "Zuschneiden und speichern",
        focus_today: "Konzentrieren Sie sich heute auf das Wesentliche.",
        today_short: "Heute (kurze Länge)",
        tomorrow_short: "Morgen (kurze Länge)",
        one_three_days: "1-3 Tage (kurze Dauer)",
        one_week_med: "1 Woche (mittlere Länge)",
        two_weeks_med: "1-2 Wochen (mittlere Länge)",
        one_month_med: "1 Monat (mittlere Länge)",
        three_months_long: "3 Monate (lange Länge)",
        six_months_long: "6 Monate (lange Länge)",
        one_year_long: "1 Jahr (lange Laufzeit)",
        one_year_plus: "1 Jahr+ (lange Laufzeit)",
        tomorrow: "Morgen",
        one_week: "1 Woche",
        one_month: "1 Monat",
        custom_date: "Benutzerdefiniertes Datum",
        specific_days: "Spezifische Tage",
        no_link: "Kein Link",
        select_a_goal: "Wählen Sie ein Ziel aus...",
        select_a_habit: "Wählen Sie eine Gewohnheit aus...",
        what_worked: "Erzählen Sie uns, was funktioniert hat ...",
        what_improved: "Was könnte verbessert werden...",
        search_achievements: "Erfolge suchen...",
        goal_title: "Zieltitel",
        habit_title: "Gewohnheitstitel",
        level: "Ebene",
        xp_lbl: "XP",
        streak_lbl: "Strähne",
        completed_tasks: "Abgeschlossene Aufgaben",
        goals_achieved: "Ziele erreicht",
        trust_low: "Niedrig",
        trust_average: "Durchschnitt",
        trust_good: "Gut",
        trust_excellent: "Exzellent",
        rank_permanent: "Permanentes Rangsystem",
        self_trust_score: "Selbstvertrauensbewertung",
        success_rate: "Erfolgsquote",
        rank: "Rang",
        xp: "XP",
        analytics: "Analytik",
        records: "Aufzeichnungen",
        milestones: "Meilensteine",
        challenges: "Herausforderungen",
        history: "Geschichte",
        calendar_labels: "Kalenderetiketten",
        failed: "Fehlgeschlagen",
        next_level: "Nächstes Level",
        search: "Suchen...",
        common: "Gemeinsam",
        rare: "Selten",
        epic: "Epos",
        legendary: "Legendär",
        ach_first_step_desc: "Schließe die erste Aufgabe ab.",
        ach_productive_day: "Produktiver Tag",
        ach_productive_day_desc: "Erledige 5 Aufgaben an einem Tag.",
        ach_task_machine: "Aufgabenmaschine",
        ach_task_machine_desc: "Erledige 25 Aufgaben.",
        ach_task_master: "Aufgabenmeister",
        ach_task_master_desc: "Erledige 100 Aufgaben.",
        ach_completion_expert: "Abschlussexperte",
        ach_completion_expert_desc: "Erledige 500 Aufgaben.",
        ach_perfection_day: "Tag der Perfektion",
        ach_perfection_day_desc: "Erledigen Sie alle für einen Tag geplanten Aufgaben.",
        ach_zero_miss_day: "Null Miss Day",
        ach_zero_miss_day_desc: "Beenden Sie einen Tag ohne fehlgeschlagene Aufgaben.",
        ach_goal_setter: "Zielsetzer",
        ach_goal_setter_desc: "Erstellen Sie das erste Ziel.",
        ach_goal_hunter_desc: "Schließe das erste Ziel ab.",
        ach_focused: "Konzentriert",
        ach_focused_desc: "Schließe 5 Ziele ab.",
        ach_visionary: "Visionär",
        ach_visionary_desc: "Schließe 20 Ziele ab.",
        ach_unstoppable: "Unaufhaltsam",
        ach_unstoppable_desc: "Verwirklichen Sie ein langfristiges Ziel.",
        ach_habit_beginner: "Gewohnheitsanfänger",
        ach_habit_beginner_desc: "Schaffen Sie die erste Gewohnheit.",
        ach_consistent: "Konsistent",
        ach_consistent_desc: "Behalten Sie eine 7-tägige Gewohnheitssträhne bei.",
        ach_dedicated: "Gewidmet",
        ach_dedicated_desc: "Behalten Sie eine 30-tägige Gewohnheitssträhne bei.",
        ach_ritual_master: "Ritualmeister",
        ach_ritual_master_desc: "Behalten Sie eine Gewohnheitssträhne von 100 Tagen bei.",
        ach_habit_collector: "Gewohnheitssammler",
        ach_habit_collector_desc: "Habe 10 aktive Gewohnheiten.",
        ach_streak_3: "3-Tage-Strecke",
        ach_streak_3_desc: "Erreichen Sie eine 3-Tage-Strecke.",
        ach_streak_7: "7-Tage-Strecke",
        ach_streak_7_desc: "Erreichen Sie eine 7-Tage-Strecke.",
        ach_streak_14: "14-Tage-Strecke",
        ach_streak_14_desc: "Erreichen Sie einen 14-tägigen Streak.",
        ach_streak_30: "30-Tage-Strecke",
        ach_streak_30_desc: "Erreichen Sie eine 30-Tage-Strecke.",
        ach_streak_50: "50-Tage-Strecke",
        ach_streak_50_desc: "Erreichen Sie eine 50-Tage-Strecke.",
        ach_streak_100: "100-Tage-Strecke",
        ach_streak_100_desc: "Erreiche eine 100-Tage-Strecke.",
        ach_comeback_king: "Comeback-König",
        ach_comeback_king_desc: "Erholen Sie sich, nachdem Sie eine Serie verloren haben.",
        ach_average_citizen: "Durchschnittsbürger",
        ach_average_citizen_desc: "Erreichen Sie Vertrauen 26.",
        ach_reliable: "Zuverlässig",
        ach_reliable_desc: "Erreichen Sie Vertrauen 51.",
        ach_excellent: "Exzellent",
        ach_excellent_desc: "Erreichen Sie Vertrauen 76.",
        ach_trusted: "Vertrauenswürdig",
        ach_trusted_desc: "Behalten Sie Trust 75+ 30 Tage lang bei.",
        ach_iron_discipline: "Eiserne Disziplin",
        ach_iron_discipline_desc: "Behalten Sie Trust 90+ für 30 Tage bei.",
        ach_elite_consistency_desc: "Erreichen Sie Vertrauen 100.",
        ach_level_5: "Stufe 5",
        ach_level_5_desc: "Erreiche Level 5.",
        ach_level_10: "Stufe 10",
        ach_level_10_desc: "Erreiche Level 10.",
        ach_level_25: "Stufe 25",
        ach_level_25_desc: "Erreiche Level 25.",
        ach_level_50: "Stufe 50",
        ach_level_50_desc: "Erreiche Level 50.",
        ach_level_100: "Stufe 100",
        ach_level_100_desc: "Erreiche Level 100.",
        ach_veteran: "Veteran",
        ach_veteran_desc: "Verdiene insgesamt 10.000 XP.",
        ach_active_week: "Aktive Woche",
        ach_active_week_desc: "Nutzen Sie die App an 7 aufeinanderfolgenden Tagen.",
        ach_active_month: "Aktiver Monat",
        ach_active_month_desc: "Nutzen Sie die App 30 aufeinanderfolgende Tage lang.",
        ach_weekend_warrior: "Wochenendkrieger",
        ach_weekend_warrior_desc: "Erledige Aufgaben sowohl am Samstag als auch am Sonntag.",
        ach_perfect_week: "Perfekte Woche",
        ach_perfect_week_desc: "Schließe eine Woche ohne fehlgeschlagene Aufgaben ab.",
        ach_night_owl: "Nachteule",
        ach_night_owl_desc: "Erledige 50 Aufgaben nach 23:00 Uhr.",
        ach_early_bird: "Frühaufsteher",
        ach_early_bird_desc: "Erledige 50 Aufgaben vor 08:00 Uhr.",
        ach_recovery_mode: "Wiederherstellungsmodus",
        ach_recovery_mode_desc: "Erhöhen Sie das Vertrauen von unter 25 auf über 50.",
        ach_redemption_arc: "Erlösungsbogen",
        ach_redemption_arc_desc: "Erhöhen Sie das Vertrauen von unter 25 auf über 75.",
        ach_marathon_desc: "Erledige 1000 Aufgaben.",
        ach_one_year_strong: "Ein Jahr stark",
        ach_one_year_strong_desc: "Bleiben Sie 365 Tage lang aktiv.",
        ach_century_streak: "Jahrhundertsträhne",
        ach_century_streak_desc: "Erreiche eine 100-Tage-Strecke.",
        ach_goal_legend: "Torlegende",
        ach_goal_legend_desc: "Schließe 100 Ziele ab.",
        ach_habit_legend: "Gewohnheitslegende",
        ach_habit_legend_desc: "Erreichen Sie eine 365-tägige Gewohnheitssträhne.",
        ach_tobedone_legend: "Tobedone-Legende",
        ach_tobedone_legend_desc: "Schalte 80 % aller Erfolge frei.",
        goal_link: "Ziellink",
        habit_link: "Gewohnheitslink",
        start: "Start",
        finish: "Beenden",
        goal_type: "Zieltyp",
        deadline: "Frist",
        custom_deadline: "Benutzerdefinierte Frist",
        create_goal: "Ziel erstellen",
        preferred_time: "Bevorzugte Zeit",
        frequency: "Frequenz",
        days: "Tage",
        create_habit: "Gewohnheit schaffen",
        goal_reflection: "Zielreflexion",
        what_went_well: "Was ist gut gelaufen?",
        what_didnt_go_well: "Was ist nicht gut gelaufen?",
        skip: "Überspringen",
        save_reflection: "Reflexion speichern",
        share_progress: "Teilen Sie Ihren Fortschritt",
        download: "Herunterladen",
        copy_text: "Text kopieren",
        share: "Aktie",
        profile_link: "Profillink",
        close: "Schließen",
        adjust_profile_photo: "Passen Sie das Profilfoto an",
        crop_save: "Zuschneiden und speichern",
        focus_today: "Konzentrieren Sie sich heute auf das Wesentliche.",
        today_short: "Heute (kurze Länge)",
        tomorrow_short: "Morgen (kurze Länge)",
        one_three_days: "1-3 Tage (kurze Dauer)",
        one_week_med: "1 Woche (mittlere Länge)",
        two_weeks_med: "1-2 Wochen (mittlere Länge)",
        one_month_med: "1 Monat (mittlere Länge)",
        three_months_long: "3 Monate (lange Länge)",
        six_months_long: "6 Monate (lange Länge)",
        one_year_long: "1 Jahr (lange Laufzeit)",
        one_year_plus: "1 Jahr+ (lange Laufzeit)",
        tomorrow: "Morgen",
        one_week: "1 Woche",
        one_month: "1 Monat",
        custom_date: "Benutzerdefiniertes Datum",
        specific_days: "Spezifische Tage",
        no_link: "Kein Link",
        select_a_goal: "Wählen Sie ein Ziel aus...",
        select_a_habit: "Wählen Sie eine Gewohnheit aus...",
        what_worked: "Erzählen Sie uns, was funktioniert hat ...",
        what_improved: "Was könnte verbessert werden...",
        search_achievements: "Erfolge suchen...",
        goal_title: "Zieltitel",
        habit_title: "Gewohnheitstitel",
        level: "Ebene",
        xp_lbl: "XP",
        streak_lbl: "Strähne",
        completed_tasks: "Abgeschlossene Aufgaben",
        goals_achieved: "Ziele erreicht",
        task_completed: "Aufgabe abgeschlossen",
        goal_completed: "Ziel erreicht",
        trust_low: "Niedrig",
        trust_average: "Durchschnitt",
        trust_good: "Gut",
        trust_excellent: "Exzellent",
        rank_permanent: "Permanentes Rangsystem",
        trust_score_increased: "Vertrauenswert erhöht",
        level_up: "Level aufsteigen",
        multiplier: "{value}x Boost",
        tasks_count: "{count} Aufgaben heute", smart_suggestion: "Intelligenter Vorschlag",
        best_time_to_create: "Sie sind jetzt sehr aktiv!",
        suggest_simpler: "Diese Aufgabe scheint komplex. Aufteilen?",
        high_risk: "Hohes Ausfallrisiko basierend auf Ihrer Historie.",
        optimal_time: "Optimale Zeit: ", most_productive_day: "Produktivster Tag: ",
        most_productive_hour: "Produktivste Stunde: ", failure_pattern: "Sie kämpfen mit Aufgaben in ",
        theme: "Design", toggle_dark: "Dunkelmodus", language: "Sprache",
        app_info: "Info", version: "Version", completed: "Abgeschlossen", failed: "Fehlgeschlagen", pending: "Ausstehend",
        no_tasks: "Keine Aufgaben für heute!", session_expired: "Sitzung abgelaufen",
        task_added: "Aufgabe hinzugefügt!", task_updated: "Aufgabe aktualisiert!", error_occurred: "Fehler aufgetreten",
        calendar: "Kalender", date: "Datum", time: "Zeit", reminder: "Erinnerung",
        view_habits_history: "Verlauf anzeigen", instructions_btn: "Anleitung",
        force_update: "App aktualisieren", install_app: "App installieren", got_it: "Verstanden",
        inst_title: "Anleitung", inst_subtitle: "Alles über Tobedone",
        inst_tasks_title: "Aufgaben", inst_tasks_desc: "Erstellen Sie Aufgaben mit '+'. Verdienen Sie Punkte.",
        inst_dash_title: "Armaturenbrett", inst_dash_desc: "Verfolgen Sie Ihre Produktivität.",
        inst_prog_title: "Fortschritt", inst_prog_desc: "Erhalten Sie XP und schalten Sie Abzeichen frei.",
        inst_gestures_title: "Gesten", inst_gestures_desc: "Wischen zum Seitenwechsel.",
        goals: "Ziele", habits: "Gewohnheiten", goals_tab: "Ziele", habits_tab: "Gewohnheiten", add_goal: "Ziel Hinzufügen", add_habit: "Gewohnheit Hinzufügen", new_goal: "Neues Ziel", new_habit: "Neue Gewohnheit", today_habits: "Heutige Gewohnheiten", goals_subtitle: "Meilensteine für die Zukunft.", habits_subtitle: "Kleine Schritte, große Ergebnisse.", reflect: "Reflektieren", reflection: "Reflexion", check_in: "Einchecken", save_goal: "Ziel Speichern", save_habit: "Gewohnheit Speichern",
        send_future: "An Zukunft senden",
        mastery_progress: "Meisterungsfortschritt",
        send_message_future: "Nachricht an Zukunft senden",
        link_to_goal: "Mit Ziel verknüpfen",
        your_analytics: "Deine Analysen",
        personal_records: "Persönliche Rekorde",
        goal_rate: "Zielquote",
        write_future: "An die Zukunft schreiben",
        full_report: "Full Report",
        future_self: "Zukunfts-Ich",
        view_goals_history: "Zielverlauf ansehen",
        goal_analytics: "Ziel-Analytik",
        weekly_report: "Weekly Report",
        todays_insights: "Heutige Einblicke",
        weekly_summary: "Wochenzusammenfassung",
        best_day: "Bester Tag",
        analyzing_patterns: "Muster analysieren...",
        trust_desc: "Vertrauenspunktzahl bestimmt Beständigkeit.",
        limited_time: "Begrenzte Zeit",
        total_xp: "Gesamt-XP",
        tasks_30d: "Aufgaben (30T)",
        view_tasks_history: "Aufgabenverlauf ansehen",
        tasks_subtitle: "Your active tasks",
        avg_completion_time: "Durchschn. Abschlusszeit",
        weekly_trend: "Wochentrend",
        loading_achievements: "Erfolge werden geladen...",
        calculating: "Berechne...",
        no_tasks_yet: "Noch keine Aufgaben",
        no_goals_yet: "Noch keine Ziele",
        no_habits_yet: "Noch keine Gewohnheiten",
        no_habits_today: "Keine Gewohnheiten für heute geplant.",
        profile: "Profile",
        for_you: "For You",
        save_changes: "Save Changes",
        category_general: "General",
        not_enough_data: "Not enough data",
        tue: "Di",
        wed: "Mi",
        thu: "Do",
        fri: "Fr",
        sat: "Sa",
        sun: "So",
        jan: "Jan",
        feb: "Feb",
        mar: "Mar",
        apr: "Apr",
        may: "Mai",
        jun: "Jun",
        jul: "Jul",
        aug: "Aug",
        sep: "Sep",
        oct: "Oct",
        nov: "Nov",
        dec: "Dec",
        january: "Januar",
        february: "Februar",
        march: "März",
        april: "April",
        june: "Juni",
        july: "Juli",
        august: "August",
        september: "September",
        october: "Oktober",
        november: "November",
        december: "Dezember",
        rec_lvl10_title: "🏆 Level 10 Achieved",
        rec_lvl10_desc: "Reach Level 10 of personal productivity",
        rec_streak7_title: "🔥 7-Day Streak",
        rec_streak7_desc: "Maintain a 7-day streak",
        rec_streak30_title: "🔥 30-Day Streak",
        rec_streak30_desc: "Maintain a 30-day streak",
        rec_goal_title: "🎯 Goal Master",
        rec_goal_desc: "Complete 10 goals",
        rec_elite_title: "⭐ Elite Status",
        rec_elite_desc: "Reach Rank: Elite",
        rec_habit_title: "📅 Habit Builder",
        rec_habit_desc: "Create 5 habits",
        chal_tasks_title: "Complete 5 tasks today",
        chal_tasks_desc: "Push your limits",
        chal_streak_title: "Reach a 3 day streak",
        chal_streak_desc: "Consistency is key",
        future_placeholder: "Write a letter to your future self",
        future_dear: "Dear future me...",
        loading: "Laden...",
        consistency: "Beständigkeit",
        opens_in: "Öffnet in",
        open_message: "Nachricht Öffnen",
        message_archive: "Nachrichtenarchiv",
        day_can_be_saved_body: "Aufgaben ausstehend. Jede Erledigung schützt deinen Score.",
        day_can_be_saved: "Der Tag Kann Noch Gerettet Werden",
        strong_day_body: "Aufgaben heute. Du bist in der Spitzengruppe!",
        strong_day: "Starker Tag",
        perfect_day_body: "Du hast heute jede Aufgabe erledigt. Außergewöhnliche Disziplin!",
        perfect_day: "Perfekter Tag! ⭐",
        trust_declining_body2: "Punkte diese Woche. Konzentriere dich auf pünktige Aufgaben.",
        trust_declining_body: "Dein Score sank um",
        trust_declining: "Vertrauen Sinkt",
        trust_rising_body2: "Punkte vs letzte Woche. Weiter so!",
        trust_rising_body: "Dein Score verbesserte sich um",
        trust_rising: "Vertrauen Steigt 📈",
        streak_7_body: "Unglaubliche Beständigkeit. Deine Serie ist an der Spitze — schütze sie!",
        streak_3_body_2: "Tage bis zu einer 1-Wochen-Serie. Du baust Schwung auf!",
        streak_3_body_1: "Nur noch",
        day_streak: "Tage Serie",
        tasks_lbl: "Aufgaben",
        days_left: "Tage verbleibend",
        overdue: "Überfällig",
        at_risk: "Gefährdet",
        on_track: "Auf Kurs",
        gentle_nudge: "Sanfte Erinnerung",
        habit_reminder: "Gewohnheitserinnerung",
        tasks_for: "Aufgaben für",
        empty_task_desc: "Erstelle deine erste Aufgabe, um organisiert und produktiv zu bleiben.",
        empty_goal_desc: "Erstelle dein erstes Ziel, um langfristigen Fortschritt zu verfolgen.",
        empty_habit_desc: "Baue Beständigkeit mit deiner ersten wiederkehrenden Gewohnheit auf.",
        achieved_failed: "Erreicht / Gescheitert",
        achieved: "Erreicht",
        failed_status: "Gescheitert",
        longest_streak: "Längste Serie",
        highest_xp: "Höchste XP",
        max_tasks_day: "Max Aufgaben/Tag",
        tasks_word: "Aufgaben",
        goals_word: "Ziele",
        ms_first_step: "Erster Schritt",
        ms_first_step_desc: "Schließe deine erste Aufgabe ab",
        ms_goal_setter: "Zielsetzer",
        ms_goal_setter_desc: "Setze dein erstes Ziel",
        ms_lvl10: "Level 10 Erreicht",
        ms_lvl10_desc: "Erreiche Level 10 der Produktivität",
        ms_trust_builder: "Vertrauensbauer",
        ms_trust_builder_desc: "Erhöhe den Vertrauens-Score über 50",
        ms_discipline_elite: "Disziplin-Elite",
        ms_discipline_elite_desc: "Erreiche Level 25 oder Elite-Vertrauensstufen",
        ms_legendary: "Legendärer Erreicher",
        ms_legendary_desc: "Schließe 100 Aufgaben ab und erreiche Level 50",
        locked: "Gesperrt",
        unlocked_status: "Freigeschaltet",
        weekly_perf_card: "Wöchentliche Leistungskarte",
        weekly_perf_desc: "Automatisch generierte wöchentliche Statistiken",
        monthly_perf_card: "Monatliche Leistungsübersicht",
        monthly_perf_desc: "Detaillierte Leistungsmetriken",
        weekly_progress_tab: "Wöchentlicher Fortschritt",
        tasks_done: "Aufgaben",
        goals_done: "Ziele",
        streak_health: "Serien-Gesundheit",
        trust_growth: "Vertrauenswachstum",
        xp_rank_level: "XP Rang-Level",
        trust_consistency: "Vertrauens-Beständigkeit",
        chal_summer_sprint: "Sommer Sprint",
        chal_summer_desc: "Schließe 10 Aufgaben ab für einen massiven Boost.",
        chal_30day: "30 Tage Beständigkeit",
        chal_30day_desc: "Halte eine Serie von 30 Tagen aufrecht.",
        in_progress: "In Bearbeitung",
        xp_reward_500: "+500 XP Belohnung",
        xp_reward_1500: "+1500 XP Belohnung",
        sent: "Gesendet",
        ready: "Bereit",
        opened: "Geöffnet",
        no_messages_yet: "Noch keine Nachrichten. Schreibe deine erste oben!",
        ready_to_open: "Bereit zum Öffnen!",
        fs_promise: "🤝 Versprechen",
        fs_prediction: "🔮 Vorhersage",
        fs_reminder: "🔔 Erinnerung",
        fs_motivational: "💪 Motivierend",
        no_achievements: "Noch keine Erfolge",
        for_you_default_body: "Erledige weiterhin Aufgaben für personalisierte Anleitung",
        profile_updated: "Profil aktualisiert",
        profile_update_failed: "Profil-Update fehlgeschlagen",
        profile_link_copied: "Profillink kopiert!",
        insight_start_streak: "Starte deine Serie",
        insight_start_streak_body: "Schließe heute eine Aufgabe ab, um deine Serie zu starten. Beständigkeit ist die Grundlage des Vertrauens.",
        levels_to_rank: "Level bis zum Aufstieg",
        reach_level: "Erreiche Level",
        to_unlock: "um den",
        rank_push: "Rang freizuschalten. Los geht's!",
        tasks_to_milestone: "Aufgaben bis Meilenstein",
        complete: "Schließe",
        more_tasks_milestone: "weitere Aufgaben bis zum Meilenstein von",
        create_task: "Aufgabe Erstellen",
        create_goal: "Ziel Erstellen",
        create_habit: "Gewohnheit Erstellen",
        pressure_low: "Niedriger Druck",
        pressure_high: "Hohes Momentum",
        pressure_balanced: "Ausgeglichen",
        message_title: "Nachrichtentitel",
        write_message: "Schreibe deine Nachricht...",
        mon: "Mo",
        tagline: "Planen. Machen. Erledigt.",
        goal_word: "Ziel",
        boost: "Boost",
        average: "Durchschnitt",
        xp_boost: "XP-Boost",
    },
    it: {
        app_title: "Tobedone",
        login: "Accedi", signup: "Registrati", continue_with_google: "Continua con Google", or: "o",
        username_email: "Utente o Email", username: "Utente", password: "Password", forgot_password: "Password dimenticata?",
        forgot_password_note: "Inserisci l'email per il link di reset.", send_reset_link: "Invia link",
        back_to_login: "Torna al login", verify_email_title: "Verifica l'email", verify_email_body: "Controlla la tua casella di posta.",
        verification_code: "Codice di verifica", verify_code: "Verifica", reset_code: "Codice di reset", use_code: "Usa",
        resend_verification: "Reinvia email", reset_password_title: "Nuova password", new_password: "Nuova password",
        confirm_password: "Conferma password", update_password: "Aggiorna", full_name: "Nome completo", email: "E-mail",
        change_name: "Cambia nome", change_username: "Cambia utente", create_account: "Crea account",
        dashboard: "Pannello", reports: "Rapporti", me: "Io", tasks: "Compiti", insights: "Statistiche",
        progress: "Progresso", settings: "Impostazioni", logout: "Esci",
        trust_score: "Fiducia", streak: "Serie", success: "Successo", daily_progress: "Progresso giornaliero",
        statistics: "Statistiche", task_distribution: "Distribuzione compiti",
        add_new_task: "Nuovo Compito", new_task: "Nuovo Compito", task_placeholder: "Cosa c'è da fare?",
        category: "Categoria", difficulty: "Difficoltà", easy: "Facile", medium: "Medio", hard: "Difficile",
        cancel: "Annulla", add_task: "Aggiungi", priority: "Priorità", low: "Bassa", high: "Alta",
        recurring: "Ricorrente", none: "Nessuno", daily: "Giornaliero", weekly: "Settimanale",
        due_date: "Scadenza", overdue: "Scaduto", all: "Tutto", filter_by: "Filtra per",
        productive_day: "Giorno più produttivo", productive_hour: "Ora più produttiva",
        trends: "Tendenze", failure_patterns: "Modelli di fallimento", achievements: "Risultati",
        well_done: "Ben fatto!", keep_going: "Continua così!", streak_saved: "Serie mantenuta!", multiplier: "{value}x potenziamento",
        active: "Attivo",
        archived: "Archiviato",
        excellent: "Eccellente",
        good: "Bene",
        current_streak: "Serie attuale",
        best_streak: "Miglior serie",
        total_tasks: "Compiti totali",
        total_goals: "Obiettivi totali",
        total_habits: "Abitudini totali",
        weekly_progress: "Progresso settimanale",
        monthly_progress: "Progresso mensile",
        completion_rate: "Tasso di completamento",
        productivity_score: "Punteggio di produttività",
        achievement_unlocked: "Obiettivo sbloccato",
        rank_progress: "Avanzamento di grado",
        ach_first_step: "Primo passo",
        ach_goal_hunter: "Cacciatore di obiettivi",
        ach_marathon: "Maratona",
        ach_legend: "Leggenda",
        ach_elite_consistency: "Coerenza d'élite",
        rank_starter: "Antipasto",
        rank_builder: "Costruttore",
        rank_achiever: "Successo",
        rank_consistent: "Coerente",
        rank_elite: "Elite",
        rank_legend: "Leggenda",
        rank_explorer: "Esploratore",
        rank_master: "Maestro",
        rank_grandmaster: "Gran Maestro",
        notif_task_completed: "Attività completata",
        notif_goal_completed: "Obiettivo completato",
        notif_achievement_unlocked: "Obiettivo sbloccato",
        notif_trust_score_increased: "Punteggio di affidabilità aumentato",
        notif_level_up: "Sali di livello",
        search_placeholder: "Ricerca...",
        enter_task_name: "Inserisci il nome dell'attività...",
        select_goal: "Seleziona obiettivo...",
        select_habit: "Seleziona Abitudine...",
        description: "Descrizione...",
        reports_tab: "Rapporti",
        insights_tab: "Approfondimenti",
        progress_tab: "Progressi",
        me_tab: "Me",
        dashboard_tab: "Pannello di controllo",
        chart_labels: "Etichette del grafico",
        statistics_lbl: "Statistiche",
        analytics_text: "Analitica",
        progress_descriptions: "Descrizioni dei progressi",
        recommendations: "Raccomandazioni",
        smart_insights: "Approfondimenti intelligenti",
        trust_score_changed: "Trust Score changed: {value}",
        goal_link: "Collegamento obiettivo",
        habit_link: "Collegamento di abitudine",
        start: "Inizio",
        finish: "Fine",
        goal_type: "Tipo di obiettivo",
        deadline: "Scadenza",
        custom_deadline: "Scadenza personalizzata",
        create_goal: "Crea obiettivo",
        preferred_time: "Orario preferito",
        frequency: "Frequenza",
        days: "Giorni",
        create_habit: "Crea un'abitudine",
        goal_reflection: "Riflessione sugli obiettivi",
        what_went_well: "Cosa è andato bene?",
        what_didnt_go_well: "Cosa non è andato bene?",
        skip: "Saltare",
        save_reflection: "Salva riflessione",
        share_progress: "Condividi i tuoi progressi",
        download: "Scaricamento",
        copy_text: "Copia testo",
        share: "Condividere",
        profile_link: "Collegamento al profilo",
        close: "Vicino",
        adjust_profile_photo: "Regola la foto del profilo",
        crop_save: "Ritaglia e salva",
        focus_today: "Concentrati su ciò che conta oggi.",
        today_short: "Oggi (breve durata)",
        tomorrow_short: "Domani (breve durata)",
        one_three_days: "1-3 giorni (breve durata)",
        one_week_med: "1 settimana (durata media)",
        two_weeks_med: "1-2 settimane (durata media)",
        one_month_med: "1 mese (durata media)",
        three_months_long: "3 mesi (lunga durata)",
        six_months_long: "6 mesi (lunga durata)",
        one_year_long: "1 anno (lunga durata)",
        one_year_plus: "1 anno+ (lunga durata)",
        tomorrow: "Domani",
        one_week: "1 settimana",
        one_month: "1 mese",
        custom_date: "Data personalizzata",
        specific_days: "Giorni specifici",
        no_link: "Nessun collegamento",
        select_a_goal: "Seleziona un obiettivo...",
        select_a_habit: "Seleziona un'abitudine...",
        what_worked: "Raccontaci cosa ha funzionato...",
        what_improved: "Cosa potrebbe essere migliorato...",
        search_achievements: "Cerca risultati...",
        goal_title: "Titolo dell'obiettivo",
        habit_title: "Titolo dell'abitudine",
        level: "Livello",
        xp_lbl: "XP",
        streak_lbl: "Strisciante",
        completed_tasks: "Attività completate",
        goals_achieved: "Obiettivi raggiunti",
        trust_low: "Basso",
        trust_average: "Media",
        trust_good: "Bene",
        trust_excellent: "Eccellente",
        rank_permanent: "Sistema di classificazione permanente",
        self_trust_score: "Punteggio di fiducia in se stessi",
        success_rate: "Tasso di successo",
        rank: "Rango",
        xp: "XP",
        analytics: "Analitica",
        records: "Record",
        milestones: "Pietre miliari",
        challenges: "Sfide",
        history: "Storia",
        calendar_labels: "Etichette del calendario",
        failed: "Fallito",
        next_level: "Livello successivo",
        search: "Ricerca...",
        common: "Comune",
        rare: "Raro",
        epic: "Epico",
        legendary: "Leggendario",
        ach_first_step_desc: "Completa il primo compito.",
        ach_productive_day: "Giornata produttiva",
        ach_productive_day_desc: "Completa 5 attività in un giorno.",
        ach_task_machine: "Macchina da lavoro",
        ach_task_machine_desc: "Completa 25 compiti.",
        ach_task_master: "Maestro dei compiti",
        ach_task_master_desc: "Completa 100 attività.",
        ach_completion_expert: "Esperto di completamento",
        ach_completion_expert_desc: "Completa 500 attività.",
        ach_perfection_day: "Giorno della perfezione",
        ach_perfection_day_desc: "Completa ogni attività pianificata per un giorno.",
        ach_zero_miss_day: "Giorno Zero Miss",
        ach_zero_miss_day_desc: "Termina una giornata senza attività fallite.",
        ach_goal_setter: "Setter degli obiettivi",
        ach_goal_setter_desc: "Crea il primo obiettivo.",
        ach_goal_hunter_desc: "Completa il primo obiettivo.",
        ach_focused: "Concentrato",
        ach_focused_desc: "Completa 5 obiettivi.",
        ach_visionary: "Visionario",
        ach_visionary_desc: "Completa 20 obiettivi.",
        ach_unstoppable: "Inarrestabile",
        ach_unstoppable_desc: "Completa un obiettivo a lungo termine.",
        ach_habit_beginner: "Principiante di abitudine",
        ach_habit_beginner_desc: "Crea la prima abitudine.",
        ach_consistent: "Coerente",
        ach_consistent_desc: "Mantieni una serie di abitudini di 7 giorni.",
        ach_dedicated: "Dedicato",
        ach_dedicated_desc: "Mantieni una serie di abitudini di 30 giorni.",
        ach_ritual_master: "Maestro rituale",
        ach_ritual_master_desc: "Mantieni una serie di abitudini di 100 giorni.",
        ach_habit_collector: "Collezionista di abitudini",
        ach_habit_collector_desc: "Avere 10 abitudini attive.",
        ach_streak_3: "Serie di 3 giorni",
        ach_streak_3_desc: "Raggiungi una serie di 3 giorni.",
        ach_streak_7: "Serie di 7 giorni",
        ach_streak_7_desc: "Raggiungi una serie di 7 giorni.",
        ach_streak_14: "Serie di 14 giorni",
        ach_streak_14_desc: "Raggiungi una serie di 14 giorni consecutivi.",
        ach_streak_30: "Serie di 30 giorni",
        ach_streak_30_desc: "Raggiungi una serie di 30 giorni.",
        ach_streak_50: "Serie di 50 giorni",
        ach_streak_50_desc: "Raggiungi una serie di 50 giorni.",
        ach_streak_100: "Serie di 100 giorni",
        ach_streak_100_desc: "Raggiungi una serie di 100 giorni.",
        ach_comeback_king: "Re del ritorno",
        ach_comeback_king_desc: "Recuperare dopo aver perso una serie.",
        ach_average_citizen: "Cittadino medio",
        ach_average_citizen_desc: "Raggiungere la fiducia 26.",
        ach_reliable: "Affidabile",
        ach_reliable_desc: "Raggiungere la fiducia 51.",
        ach_excellent: "Eccellente",
        ach_excellent_desc: "Raggiungere la fiducia 76.",
        ach_trusted: "Fidato",
        ach_trusted_desc: "Mantieni Trust 75+ per 30 giorni.",
        ach_iron_discipline: "Disciplina del ferro",
        ach_iron_discipline_desc: "Mantieni Trust 90+ per 30 giorni.",
        ach_elite_consistency_desc: "Raggiungi Fiducia 100.",
        ach_level_5: "Livello 5",
        ach_level_5_desc: "Raggiungi il livello 5.",
        ach_level_10: "Livello 10",
        ach_level_10_desc: "Raggiungi il livello 10.",
        ach_level_25: "Livello 25",
        ach_level_25_desc: "Raggiungi il livello 25.",
        ach_level_50: "Livello 50",
        ach_level_50_desc: "Raggiungi il livello 50.",
        ach_level_100: "Livello 100",
        ach_level_100_desc: "Raggiungi il livello 100.",
        ach_veteran: "Veterano",
        ach_veteran_desc: "Guadagna 10.000 XP totali.",
        ach_active_week: "Settimana attiva",
        ach_active_week_desc: "Utilizza l'app per 7 giorni consecutivi.",
        ach_active_month: "Mese attivo",
        ach_active_month_desc: "Utilizza l'app per 30 giorni consecutivi.",
        ach_weekend_warrior: "Guerriero del fine settimana",
        ach_weekend_warrior_desc: "Completa le attività sia sabato che domenica.",
        ach_perfect_week: "Settimana perfetta",
        ach_perfect_week_desc: "Completa una settimana senza attività fallite.",
        ach_night_owl: "Nottambulo",
        ach_night_owl_desc: "Completa 50 attività dopo le 23:00.",
        ach_early_bird: "Mattiniero",
        ach_early_bird_desc: "Completa 50 attività prima delle 08:00.",
        ach_recovery_mode: "Modalità di recupero",
        ach_recovery_mode_desc: "Aumentare la fiducia da meno di 25 a più di 50.",
        ach_redemption_arc: "Arco della Redenzione",
        ach_redemption_arc_desc: "Aumenta la fiducia da meno di 25 a più di 75.",
        ach_marathon_desc: "Completa 1000 attività.",
        ach_one_year_strong: "Un anno forte",
        ach_one_year_strong_desc: "Rimani attivo per 365 giorni.",
        ach_century_streak: "Serie di secoli",
        ach_century_streak_desc: "Raggiungi una serie di 100 giorni.",
        ach_goal_legend: "Leggenda dell'obiettivo",
        ach_goal_legend_desc: "Completa 100 obiettivi.",
        ach_habit_legend: "Leggenda dell'abitudine",
        ach_habit_legend_desc: "Raggiungi una serie di abitudini di 365 giorni.",
        ach_tobedone_legend: "Leggenda di Tobedone",
        ach_tobedone_legend_desc: "Sblocca l'80% di tutti gli obiettivi.",
        goal_link: "Collegamento obiettivo",
        habit_link: "Collegamento di abitudine",
        start: "Inizio",
        finish: "Fine",
        goal_type: "Tipo di obiettivo",
        deadline: "Scadenza",
        custom_deadline: "Scadenza personalizzata",
        create_goal: "Crea obiettivo",
        preferred_time: "Orario preferito",
        frequency: "Frequenza",
        days: "Giorni",
        create_habit: "Crea un'abitudine",
        goal_reflection: "Riflessione sugli obiettivi",
        what_went_well: "Cosa è andato bene?",
        what_didnt_go_well: "Cosa non è andato bene?",
        skip: "Saltare",
        save_reflection: "Salva riflessione",
        share_progress: "Condividi i tuoi progressi",
        download: "Scaricamento",
        copy_text: "Copia testo",
        share: "Condividere",
        profile_link: "Collegamento al profilo",
        close: "Vicino",
        adjust_profile_photo: "Regola la foto del profilo",
        crop_save: "Ritaglia e salva",
        focus_today: "Concentrati su ciò che conta oggi.",
        today_short: "Oggi (breve durata)",
        tomorrow_short: "Domani (breve durata)",
        one_three_days: "1-3 giorni (breve durata)",
        one_week_med: "1 settimana (durata media)",
        two_weeks_med: "1-2 settimane (durata media)",
        one_month_med: "1 mese (durata media)",
        three_months_long: "3 mesi (lunga durata)",
        six_months_long: "6 mesi (lunga durata)",
        one_year_long: "1 anno (lunga durata)",
        one_year_plus: "1 anno+ (lunga durata)",
        tomorrow: "Domani",
        one_week: "1 settimana",
        one_month: "1 mese",
        custom_date: "Data personalizzata",
        specific_days: "Giorni specifici",
        no_link: "Nessun collegamento",
        select_a_goal: "Seleziona un obiettivo...",
        select_a_habit: "Seleziona un'abitudine...",
        what_worked: "Raccontaci cosa ha funzionato...",
        what_improved: "Cosa potrebbe essere migliorato...",
        search_achievements: "Cerca risultati...",
        goal_title: "Titolo dell'obiettivo",
        habit_title: "Titolo dell'abitudine",
        level: "Livello",
        xp_lbl: "XP",
        streak_lbl: "Strisciante",
        completed_tasks: "Attività completate",
        goals_achieved: "Obiettivi raggiunti",
        task_completed: "Attività completata",
        goal_completed: "Obiettivo completato",
        trust_low: "Basso",
        trust_average: "Media",
        trust_good: "Bene",
        trust_excellent: "Eccellente",
        rank_permanent: "Sistema di classificazione permanente",
        trust_score_increased: "Punteggio di affidabilità aumentato",
        level_up: "Sali di livello",
        multiplier: "{value}x Boost",
        tasks_count: "{count} compiti oggi", smart_suggestion: "Suggerimento Intelligente",
        best_time_to_create: "Sei molto attivo ora!",
        suggest_simpler: "Compito complesso. Dividerlo?",
        high_risk: "Alto rischio di fallimento.",
        optimal_time: "Ora ottimale: ", most_productive_day: "Giorno più produttivo: ",
        most_productive_hour: "Ora più produttiva: ", failure_pattern: "Hai difficoltà con ",
        theme: "Tema", toggle_dark: "Modalità Scura", language: "Lingua",
        app_info: "Info", version: "Versione", completed: "Completato", failed: "Fallito", pending: "In attesa",
        no_tasks: "Nessun compito per oggi!", session_expired: "Sessione scaduta",
        task_added: "Compito aggiunto!", task_updated: "Compito aggiornato!", error_occurred: "Errore",
        calendar: "Calendario", date: "Data", time: "Ora", reminder: "Promemoria",
        view_habits_history: "Cronologia", instructions_btn: "Istruzioni",
        force_update: "Aggiorna App", install_app: "Installa App", got_it: "Capito",
        inst_title: "Istruzioni", inst_subtitle: "Tutto su Tobedone",
        inst_tasks_title: "Compiti", inst_tasks_desc: "Crea con '+'. Guadagna punti completandoli.",
        inst_dash_title: "Pannello", inst_dash_desc: "Traccia la tua produttività.",
        inst_prog_title: "Progresso", inst_prog_desc: "Guadagna XP e sblocca badge.",
        inst_gestures_title: "Gesti", inst_gestures_desc: "Scorri per cambiare pagina.",
        goals: "Obiettivi", habits: "Abitudini", goals_tab: "Obiettivi", habits_tab: "Abitudini", add_goal: "Aggiungi Obiettivo", add_habit: "Aggiungi Abitudine", new_goal: "Nuovo Obiettivo", new_habit: "Nuova Abitudine", today_habits: "Abitudini di Oggi", goals_subtitle: "Traguardi per il futuro.", habits_subtitle: "Piccoli passi, grandi risultati.", reflect: "Riflettere", reflection: "Riflessione", check_in: "Controllo", save_goal: "Salva Obiettivo", save_habit: "Salva Abitudine",
        profile: "Profile",
        for_you: "For You",
        save_changes: "Save Changes",
        category_general: "General",
        not_enough_data: "Not enough data",
        tue: "Mar",
        wed: "Mer",
        thu: "Gio",
        fri: "Ven",
        sat: "Sab",
        sun: "Dom",
        jan: "Jan",
        feb: "Feb",
        mar: "Mar",
        apr: "Apr",
        may: "Maggio",
        jun: "Jun",
        jul: "Jul",
        aug: "Aug",
        sep: "Sep",
        oct: "Oct",
        nov: "Nov",
        dec: "Dec",
        january: "Gennaio",
        february: "Febbraio",
        march: "Marzo",
        april: "Aprile",
        june: "Giugno",
        july: "Luglio",
        august: "Agosto",
        september: "Settembre",
        october: "Ottobre",
        november: "Novembre",
        december: "Dicembre",
        rec_lvl10_title: "🏆 Level 10 Achieved",
        rec_lvl10_desc: "Reach Level 10 of personal productivity",
        rec_streak7_title: "🔥 7-Day Streak",
        rec_streak7_desc: "Maintain a 7-day streak",
        rec_streak30_title: "🔥 30-Day Streak",
        rec_streak30_desc: "Maintain a 30-day streak",
        rec_goal_title: "🎯 Goal Master",
        rec_goal_desc: "Complete 10 goals",
        rec_elite_title: "⭐ Elite Status",
        rec_elite_desc: "Reach Rank: Elite",
        rec_habit_title: "📅 Habit Builder",
        rec_habit_desc: "Create 5 habits",
        chal_tasks_title: "Complete 5 tasks today",
        chal_tasks_desc: "Push your limits",
        chal_streak_title: "Reach a 3 day streak",
        chal_streak_desc: "Consistency is key",
        future_placeholder: "Write a letter to your future self",
        future_dear: "Dear future me...",
        loading: "Caricamento...",
        consistency: "coerenza",
        opens_in: "Si apre in",
        open_message: "Apri Messaggio",
        message_archive: "Archivio Messaggi",
        day_can_be_saved_body: "attività in sospeso. Ogni completamento protegge il tuo punteggio.",
        day_can_be_saved: "La Giornata Può Ancora Essere Salvata",
        strong_day_body: "attività oggi. Sei al vertice delle prestazioni!",
        strong_day: "Giorno Forte",
        perfect_day_body: "Hai completato ogni attività oggi. Disciplina eccezionale!",
        perfect_day: "Giorno Perfetto! ⭐",
        trust_declining_body2: "punti questa settimana. Concentrati sul completare i compiti in tempo.",
        trust_declining_body: "Il tuo punteggio è calato di",
        trust_declining: "Fiducia in Calo",
        trust_rising_body2: "punti rispetto alla settimana scorsa. Continua così!",
        trust_rising_body: "Il tuo punteggio è migliorato di",
        trust_rising: "Fiducia in Aumento 📈",
        streak_7_body: "Consistenza incredibile. La tua serie è al top — proteggila!",
        streak_3_body_2: "giorni in più per una serie di 1 settimana. Stai costruendo slancio!",
        streak_3_body_1: "Solo",
        day_streak: "Giorni di Serie",
        tasks_lbl: "Attività",
        days_left: "giorni rimanenti",
        overdue: "Scaduto",
        at_risk: "A Rischio",
        on_track: "In Corso",
        gentle_nudge: "Promemoria gentile",
        habit_reminder: "Promemoria abitudine",
        tasks_for: "Attività per",
        empty_task_desc: "Crea la tua prima attività per rimanere organizzato.",
        empty_goal_desc: "Crea il tuo primo obiettivo per monitorare i progressi.",
        empty_habit_desc: "Costruisci costanza con la tua prima abitudine.",
        achieved_failed: "Achieved / Failed",
        achieved: "Achieved",
        failed_status: "Failed",
        longest_streak: "Longest Streak",
        highest_xp: "Highest XP Achieved",
        max_tasks_day: "Max Tasks In A Day",
        tasks_word: "Attività",
        goals_word: "Obiettivi",
        ms_first_step: "First Step",
        ms_first_step_desc: "Complete your first task",
        ms_goal_setter: "Goal Setter",
        ms_goal_setter_desc: "Set your very first goal",
        ms_lvl10: "Level 10 Achieved",
        ms_lvl10_desc: "Reach Level 10 of personal productivity",
        ms_trust_builder: "Trust Builder",
        ms_trust_builder_desc: "Raise self trust score above 50",
        ms_discipline_elite: "Discipline Elite",
        ms_discipline_elite_desc: "Reach Level 25 or achieve elite trust levels",
        ms_legendary: "Legendary Achiever",
        ms_legendary_desc: "Complete 100 tasks and reach level 50",
        locked: "Locked",
        unlocked_status: "Unlocked",
        weekly_perf_card: "Weekly Performance Card",
        weekly_perf_desc: "Auto-generated weekly activity stats",
        monthly_perf_card: "Monthly Performance Review",
        monthly_perf_desc: "Detailed performance metrics review",
        weekly_progress_tab: "Weekly Progress",
        tasks_done: "Tasks Done",
        goals_done: "Goals Done",
        streak_health: "Streak Health",
        trust_growth: "Trust Growth",
        xp_rank_level: "XP Rank Level",
        trust_consistency: "Trust Consistency",
        chal_summer_sprint: "Summer Sprint",
        chal_summer_desc: "Complete 10 tasks to claim a massive boost.",
        chal_30day: "30 Day Consistency",
        chal_30day_desc: "Maintain a streak of 30 days.",
        in_progress: "In Progress",
        xp_reward_500: "+500 XP Reward",
        xp_reward_1500: "+1500 XP Reward",
        sent: "Sent",
        ready: "Ready",
        opened: "Opened",
        no_messages_yet: "No messages yet. Write your first one above!",
        ready_to_open: "Ready to Open!",
        fs_promise: "🤝 Promise",
        fs_prediction: "🔮 Prediction",
        fs_reminder: "🔔 Reminder",
        fs_motivational: "💪 Motivational",
        no_achievements: "No achievements yet",
        for_you_default_body: "Keep completing tasks to unlock personalized guidance",
        profile_updated: "Profile updated",
        profile_update_failed: "Failed to update profile",
        profile_link_copied: "Profile link copied!",
        insight_start_streak: "Start Your Streak",
        insight_start_streak_body: "Complete a task today to ignite your streak. Consistency is the foundation of trust.",
        levels_to_rank: "Levels to Rank Up",
        reach_level: "Reach Level",
        to_unlock: "to unlock the",
        rank_push: "rank. Push for it!",
        tasks_to_milestone: "Tasks to Milestone",
        complete: "Complete",
        more_tasks_milestone: "more tasks to reach the milestone of",
        create_task: "Crea Attività",
        create_goal: "Crea Obiettivo",
        create_habit: "Crea Abitudine",
        pressure_low: "Bassa Pressione",
        pressure_high: "Alto Slancio",
        pressure_balanced: "Equilibrato",
        message_title: "Titolo del messaggio",
        write_message: "Scrivi il tuo messaggio...",
        mon: "Lun",
        tagline: "Pianifica. Fai. Fatto.",
        todays_insights: "Approfondimenti di Oggi",
        tasks_30d: "Attività (30g)",
        limited_time: "Tempo Limitato",
        goal_analytics: "Analisi Obiettivi",
        mastery_progress: "Progresso Padronanza",
        goal_rate: "Tasso Obiettivi",
        view_goals_history: "Vedi Storico Obiettivi",
        write_future: "Scrivi al Futuro",
        total_xp: "XP Totale",
        loading_achievements: "Caricamento traguardi...",
        trust_desc: "Il punteggio di fiducia determina la costanza.",
        send_message_future: "Invia Messaggio al Futuro",
        analyzing_patterns: "Analisi dei modelli...",
        future_self: "Futuro Me",
        weekly_trend: "Tendenza Settimanale",
        send_future: "Invia al Futuro",
        your_analytics: "Le tue Statistiche",
        view_tasks_history: "Vedi Storico Attività",
        avg_completion_time: "Tempo Medio Completamento",
        personal_records: "Record Personali",
        link_to_goal: "Collega a Obiettivo",
        calculating: "Calcolo...",
        weekly_summary: "Riepilogo Settimanale",
        best_day: "Miglior Giorno",
        no_goals_yet: "Nessun obiettivo ancora",
        no_habits_yet: "Nessuna abitudine ancora",
        no_tasks_yet: "Nessuna attività ancora",
        goal_word: "Obiettivo",
        boost: "Boost",
        no_habits_today: "Nessuna abitudine programmata per oggi.",
        average: "Medio",
        xp_boost: "XP Boost",
        tasks_subtitle: "Le tue attività attive",
        full_report: "Rapporto Completo",
        weekly_report: "Report Settimanale",
    },
    pt: {
        app_title: "Tobedone",
        login: "Entrar", signup: "Inscrever-se", continue_with_google: "Continuar com Google", or: "ou",
        username_email: "Usuário ou Email", username: "Usuário", password: "Senha", forgot_password: "Esqueceu a senha?",
        forgot_password_note: "Insira seu email para redefinir.", send_reset_link: "Enviar link",
        back_to_login: "Voltar", verify_email_title: "Verifique seu email", verify_email_body: "Verifique sua caixa de entrada.",
        verification_code: "Código de verificação", verify_code: "Verificar", reset_code: "Código de reset", use_code: "Usar",
        resend_verification: "Reenviar", reset_password_title: "Nova senha", new_password: "Nova senha",
        confirm_password: "Confirmar senha", update_password: "Atualizar", full_name: "Nome completo", email: "E-mail",
        change_name: "Mudar nome", change_username: "Mudar usuário", create_account: "Criar Conta",
        dashboard: "Painel", reports: "Relatórios", me: "Eu", tasks: "Tarefas", insights: "Estatísticas",
        progress: "Progresso", settings: "Ajustes", logout: "Sair",
        trust_score: "Confiança", streak: "Sequência", success: "Sucesso", daily_progress: "Progresso diário",
        statistics: "Estatísticas", task_distribution: "Distribuição de Tarefas",
        add_new_task: "Nova Tarefa", new_task: "Nova Tarefa", task_placeholder: "O que fazer?",
        category: "Categoria", difficulty: "Dificuldade", easy: "Fácil", medium: "Médio", hard: "Difícil",
        cancel: "Cancelar", add_task: "Adicionar", priority: "Prioridade", low: "Baixa", high: "Alta",
        recurring: "Recorrente", none: "Nenhum", daily: "Diário", weekly: "Semanal",
        due_date: "Data limite", overdue: "Atrasado", all: "Tudo", filter_by: "Filtrar",
        productive_day: "Dia mais produtivo", productive_hour: "Hora mais produtiva",
        trends: "Tendências", failure_patterns: "Padrões de falha", achievements: "Conquistas",
        well_done: "Muito bem!", keep_going: "Continue!", streak_saved: "Sequência mantida!", multiplier: "{value}x Aumento",
        active: "Ativo",
        archived: "Arquivado",
        excellent: "Excelente",
        good: "Bom",
        current_streak: "Sequência Atual",
        best_streak: "Melhor sequência",
        total_tasks: "Total de tarefas",
        total_goals: "Total de metas",
        total_habits: "Hábitos totais",
        weekly_progress: "Progresso Semanal",
        monthly_progress: "Progresso Mensal",
        completion_rate: "Taxa de conclusão",
        productivity_score: "Pontuação de produtividade",
        achievement_unlocked: "Conquista desbloqueada",
        rank_progress: "Progresso de classificação",
        ach_first_step: "Primeiro passo",
        ach_goal_hunter: "Caçador de gols",
        ach_marathon: "Maratona",
        ach_legend: "Lenda",
        ach_elite_consistency: "Consistência Elite",
        rank_starter: "Iniciante",
        rank_builder: "Construtor",
        rank_achiever: "Empreendedor",
        rank_consistent: "Consistente",
        rank_elite: "Elite",
        rank_legend: "Lenda",
        rank_explorer: "Explorador",
        rank_master: "Mestre",
        rank_grandmaster: "Grão-Mestre",
        notif_task_completed: "Tarefa concluída",
        notif_goal_completed: "Meta concluída",
        notif_achievement_unlocked: "Conquista desbloqueada",
        notif_trust_score_increased: "Pontuação de confiança aumentada",
        notif_level_up: "Subir de nível",
        search_placeholder: "Procurar...",
        enter_task_name: "Digite o nome da tarefa...",
        select_goal: "Selecione Meta...",
        select_habit: "Selecione Hábito...",
        description: "Descrição...",
        reports_tab: "Relatórios",
        insights_tab: "Percepções",
        progress_tab: "Progresso",
        me_tab: "Meu",
        dashboard_tab: "Painel",
        chart_labels: "Etiquetas de gráfico",
        statistics_lbl: "Estatísticas",
        analytics_text: "Análise",
        progress_descriptions: "Descrições do progresso",
        recommendations: "Recomendações",
        smart_insights: "Informações inteligentes",
        trust_score_changed: "Trust Score changed: {value}",
        goal_link: "Link da meta",
        habit_link: "Link do hábito",
        start: "Começar",
        finish: "Terminar",
        goal_type: "Tipo de meta",
        deadline: "Prazo final",
        custom_deadline: "Prazo personalizado",
        create_goal: "Criar meta",
        preferred_time: "Horário preferido",
        frequency: "Freqüência",
        days: "Dias",
        create_habit: "Criar hábito",
        goal_reflection: "Reflexão do objetivo",
        what_went_well: "O que correu bem?",
        what_didnt_go_well: "O que não deu certo?",
        skip: "Pular",
        save_reflection: "Salvar reflexão",
        share_progress: "Compartilhe seu progresso",
        download: "Download",
        copy_text: "Copiar texto",
        share: "Compartilhar",
        profile_link: "Link do perfil",
        close: "Fechar",
        adjust_profile_photo: "Ajustar foto do perfil",
        crop_save: "Cortar e salvar",
        focus_today: "Concentre-se no que é importante hoje.",
        today_short: "Hoje (curta duração)",
        tomorrow_short: "Amanhã (curta duração)",
        one_three_days: "1-3 dias (curta duração)",
        one_week_med: "1 semana (duração média)",
        two_weeks_med: "1-2 semanas (duração média)",
        one_month_med: "1 mês (duração média)",
        three_months_long: "3 meses (longa duração)",
        six_months_long: "6 meses (longo comprimento)",
        one_year_long: "1 ano (longo comprimento)",
        one_year_plus: "1 ano + (comprimento longo)",
        tomorrow: "Amanhã",
        one_week: "1 semana",
        one_month: "1 mês",
        custom_date: "Data personalizada",
        specific_days: "Dias Específicos",
        no_link: "Sem link",
        select_a_goal: "Selecione uma meta...",
        select_a_habit: "Selecione um hábito...",
        what_worked: "Conte-nos sobre o que funcionou...",
        what_improved: "O que poderia ser melhorado...",
        search_achievements: "Pesquisar conquistas...",
        goal_title: "Título do gol",
        habit_title: "Título do hábito",
        level: "Nível",
        xp_lbl: "EXP",
        streak_lbl: "Onda",
        completed_tasks: "Tarefas Concluídas",
        goals_achieved: "Metas alcançadas",
        trust_low: "Baixo",
        trust_average: "Média",
        trust_good: "Bom",
        trust_excellent: "Excelente",
        rank_permanent: "Sistema de classificação permanente",
        self_trust_score: "Pontuação de autoconfiança",
        success_rate: "Taxa de sucesso",
        rank: "Classificação",
        xp: "EXP",
        analytics: "Análise",
        records: "Registros",
        milestones: "Conquistas",
        challenges: "Desafios",
        history: "História",
        calendar_labels: "Etiquetas de calendário",
        failed: "Fracassado",
        next_level: "Próximo nível",
        search: "Procurar...",
        common: "Comum",
        rare: "Cru",
        epic: "Épico",
        legendary: "Lendário",
        ach_first_step_desc: "Conclua a primeira tarefa.",
        ach_productive_day: "Dia Produtivo",
        ach_productive_day_desc: "Complete 5 tarefas em um dia.",
        ach_task_machine: "Máquina de Tarefas",
        ach_task_machine_desc: "Complete 25 tarefas.",
        ach_task_master: "Mestre de Tarefas",
        ach_task_master_desc: "Conclua 100 tarefas.",
        ach_completion_expert: "Especialista em conclusão",
        ach_completion_expert_desc: "Conclua 500 tarefas.",
        ach_perfection_day: "Dia da Perfeição",
        ach_perfection_day_desc: "Conclua todas as tarefas agendadas para um dia.",
        ach_zero_miss_day: "Zero Miss Dia",
        ach_zero_miss_day_desc: "Termine um dia sem tarefas falhadas.",
        ach_goal_setter: "Estabelecedor de metas",
        ach_goal_setter_desc: "Crie o primeiro objetivo.",
        ach_goal_hunter_desc: "Complete o primeiro objetivo.",
        ach_focused: "Focado",
        ach_focused_desc: "Complete 5 objetivos.",
        ach_visionary: "Visionário",
        ach_visionary_desc: "Complete 20 gols.",
        ach_unstoppable: "Imparável",
        ach_unstoppable_desc: "Conclua uma meta de longo prazo.",
        ach_habit_beginner: "Hábito Iniciante",
        ach_habit_beginner_desc: "Crie o primeiro hábito.",
        ach_consistent: "Consistente",
        ach_consistent_desc: "Mantenha uma sequência de hábitos de 7 dias.",
        ach_dedicated: "Dedicado",
        ach_dedicated_desc: "Mantenha uma sequência de hábitos de 30 dias.",
        ach_ritual_master: "Mestre Ritual",
        ach_ritual_master_desc: "Mantenha uma sequência de hábitos de 100 dias.",
        ach_habit_collector: "Colecionador de hábitos",
        ach_habit_collector_desc: "Tenha 10 hábitos ativos.",
        ach_streak_3: "Sequência de 3 dias",
        ach_streak_3_desc: "Alcance uma sequência de 3 dias.",
        ach_streak_7: "Sequência de 7 dias",
        ach_streak_7_desc: "Alcance uma sequência de 7 dias.",
        ach_streak_14: "Sequência de 14 dias",
        ach_streak_14_desc: "Alcance uma sequência de 14 dias.",
        ach_streak_30: "Sequência de 30 dias",
        ach_streak_30_desc: "Alcance uma sequência de 30 dias.",
        ach_streak_50: "Sequência de 50 dias",
        ach_streak_50_desc: "Alcance uma sequência de 50 dias.",
        ach_streak_100: "Sequência de 100 dias",
        ach_streak_100_desc: "Alcance uma sequência de 100 dias.",
        ach_comeback_king: "Rei do retorno",
        ach_comeback_king_desc: "Recupere-se depois de perder uma sequência.",
        ach_average_citizen: "Cidadão Médio",
        ach_average_citizen_desc: "Alcance a confiança 26.",
        ach_reliable: "Confiável",
        ach_reliable_desc: "Alcance a confiança 51.",
        ach_excellent: "Excelente",
        ach_excellent_desc: "Alcance a confiança 76.",
        ach_trusted: "Confiável",
        ach_trusted_desc: "Mantenha a confiança 75+ por 30 dias.",
        ach_iron_discipline: "Disciplina de Ferro",
        ach_iron_discipline_desc: "Mantenha a confiança 90+ por 30 dias.",
        ach_elite_consistency_desc: "Alcance a Confiança 100.",
        ach_level_5: "Nível 5",
        ach_level_5_desc: "Alcance o nível 5.",
        ach_level_10: "Nível 10",
        ach_level_10_desc: "Alcance o nível 10.",
        ach_level_25: "Nível 25",
        ach_level_25_desc: "Alcance o nível 25.",
        ach_level_50: "Nível 50",
        ach_level_50_desc: "Alcance o nível 50.",
        ach_level_100: "Nível 100",
        ach_level_100_desc: "Alcance o nível 100.",
        ach_veteran: "Veterano",
        ach_veteran_desc: "Ganhe 10.000 XP totais.",
        ach_active_week: "Semana Ativa",
        ach_active_week_desc: "Use o aplicativo por 7 dias consecutivos.",
        ach_active_month: "Mês Ativo",
        ach_active_month_desc: "Use o aplicativo por 30 dias consecutivos.",
        ach_weekend_warrior: "Guerreiro de fim de semana",
        ach_weekend_warrior_desc: "Conclua tarefas durante o sábado e o domingo.",
        ach_perfect_week: "Semana Perfeita",
        ach_perfect_week_desc: "Complete uma semana sem tarefas falhadas.",
        ach_night_owl: "Coruja Noturna",
        ach_night_owl_desc: "Conclua 50 tarefas depois das 23h.",
        ach_early_bird: "Madrugador",
        ach_early_bird_desc: "Conclua 50 tarefas antes das 08:00.",
        ach_recovery_mode: "Modo de recuperação",
        ach_recovery_mode_desc: "Aumente a confiança de menos de 25 para acima de 50.",
        ach_redemption_arc: "Arco da Redenção",
        ach_redemption_arc_desc: "Aumente a confiança de menos de 25 para acima de 75.",
        ach_marathon_desc: "Conclua 1000 tarefas.",
        ach_one_year_strong: "Um ano forte",
        ach_one_year_strong_desc: "Permaneça ativo por 365 dias.",
        ach_century_streak: "Sequência do Século",
        ach_century_streak_desc: "Alcance uma sequência de 100 dias.",
        ach_goal_legend: "Legenda do gol",
        ach_goal_legend_desc: "Complete 100 gols.",
        ach_habit_legend: "Lenda do Hábito",
        ach_habit_legend_desc: "Alcance uma sequência de hábitos de 365 dias.",
        ach_tobedone_legend: "Lenda de Tobedone",
        ach_tobedone_legend_desc: "Desbloqueie 80% de todas as conquistas.",
        goal_link: "Link da meta",
        habit_link: "Link do hábito",
        start: "Começar",
        finish: "Terminar",
        goal_type: "Tipo de meta",
        deadline: "Prazo final",
        custom_deadline: "Prazo personalizado",
        create_goal: "Criar meta",
        preferred_time: "Horário preferido",
        frequency: "Freqüência",
        days: "Dias",
        create_habit: "Criar hábito",
        goal_reflection: "Reflexão do objetivo",
        what_went_well: "O que correu bem?",
        what_didnt_go_well: "O que não deu certo?",
        skip: "Pular",
        save_reflection: "Salvar reflexão",
        share_progress: "Compartilhe seu progresso",
        download: "Download",
        copy_text: "Copiar texto",
        share: "Compartilhar",
        profile_link: "Link do perfil",
        close: "Fechar",
        adjust_profile_photo: "Ajustar foto do perfil",
        crop_save: "Cortar e salvar",
        focus_today: "Concentre-se no que é importante hoje.",
        today_short: "Hoje (curta duração)",
        tomorrow_short: "Amanhã (curta duração)",
        one_three_days: "1-3 dias (curta duração)",
        one_week_med: "1 semana (duração média)",
        two_weeks_med: "1-2 semanas (duração média)",
        one_month_med: "1 mês (duração média)",
        three_months_long: "3 meses (longa duração)",
        six_months_long: "6 meses (longo comprimento)",
        one_year_long: "1 ano (longo comprimento)",
        one_year_plus: "1 ano + (comprimento longo)",
        tomorrow: "Amanhã",
        one_week: "1 semana",
        one_month: "1 mês",
        custom_date: "Data personalizada",
        specific_days: "Dias Específicos",
        no_link: "Sem link",
        select_a_goal: "Selecione uma meta...",
        select_a_habit: "Selecione um hábito...",
        what_worked: "Conte-nos sobre o que funcionou...",
        what_improved: "O que poderia ser melhorado...",
        search_achievements: "Pesquisar conquistas...",
        goal_title: "Título do gol",
        habit_title: "Título do hábito",
        level: "Nível",
        xp_lbl: "EXP",
        streak_lbl: "Onda",
        completed_tasks: "Tarefas Concluídas",
        goals_achieved: "Metas alcançadas",
        task_completed: "Tarefa concluída",
        goal_completed: "Meta concluída",
        trust_low: "Baixo",
        trust_average: "Média",
        trust_good: "Bom",
        trust_excellent: "Excelente",
        rank_permanent: "Sistema de classificação permanente",
        trust_score_increased: "Pontuação de confiança aumentada",
        level_up: "Subir de nível",
        multiplier: "{value}x Boost",
        tasks_count: "{count} tarefas", smart_suggestion: "Sugestão Inteligente",
        best_time_to_create: "Você está muito ativo agora!",
        suggest_simpler: "Tarefa complexa. Dividi-la?",
        high_risk: "Alto risco de falha.",
        optimal_time: "Hora ideal: ", most_productive_day: "Dia mais produtivo: ",
        most_productive_hour: "Hora mais produtiva: ", failure_pattern: "Dificuldades com ",
        theme: "Tema", toggle_dark: "Modo Escuro", language: "Idioma",
        app_info: "Info", version: "Versão", completed: "Concluído", failed: "Falhou", pending: "Pendente",
        no_tasks: "Sem tarefas para hoje!", session_expired: "Sessão expirada",
        task_added: "Tarefa adicionada!", task_updated: "Tarefa atualizada!", error_occurred: "Ocorreu um erro",
        calendar: "Calendário", date: "Data", time: "Hora", reminder: "Lembrete",
        view_habits_history: "Histórico", instructions_btn: "Instruções",
        force_update: "Atualizar App", install_app: "Instalar App", got_it: "Entendi",
        inst_title: "Instruções", inst_subtitle: "Tudo sobre Tobedone",
        inst_tasks_title: "Tarefas", inst_tasks_desc: "Crie com '+'. Ganhe pontos.",
        inst_dash_title: "Painel", inst_dash_desc: "Acompanhe sua produtividade.",
        inst_prog_title: "Progresso", inst_prog_desc: "Ganhe XP e desbloqueie badges.",
        inst_gestures_title: "Gestos", inst_gestures_desc: "Deslize para mudar de página.",
        goals: "Objetivos", habits: "Hábitos", goals_tab: "Objetivos", habits_tab: "Hábitos", add_goal: "Adicionar Objetivo", add_habit: "Adicionar Hábito", new_goal: "Novo Objetivo", new_habit: "Novo Hábito", today_habits: "Hábitos de Hoje", goals_subtitle: "Marcos para o futuro.", habits_subtitle: "Pequenos passos, grandes resultados.", reflect: "Refletir", reflection: "Reflexão", check_in: "Check-in", save_goal: "Salvar Objetivo", save_habit: "Salvar Hábito",
        profile: "Profile",
        for_you: "For You",
        save_changes: "Save Changes",
        category_general: "General",
        not_enough_data: "Not enough data",
        tue: "Ter",
        wed: "Qua",
        thu: "Qui",
        fri: "Sex",
        sat: "Sáb",
        sun: "Dom",
        jan: "Jan",
        feb: "Feb",
        mar: "Mar",
        apr: "Apr",
        may: "Maio",
        jun: "Jun",
        jul: "Jul",
        aug: "Aug",
        sep: "Sep",
        oct: "Oct",
        nov: "Nov",
        dec: "Dec",
        january: "Janeiro",
        february: "Fevereiro",
        march: "Março",
        april: "Abril",
        june: "Junho",
        july: "Julho",
        august: "Agosto",
        september: "Setembro",
        october: "Outubro",
        november: "Novembro",
        december: "Dezembro",
        rec_lvl10_title: "🏆 Level 10 Achieved",
        rec_lvl10_desc: "Reach Level 10 of personal productivity",
        rec_streak7_title: "🔥 7-Day Streak",
        rec_streak7_desc: "Maintain a 7-day streak",
        rec_streak30_title: "🔥 30-Day Streak",
        rec_streak30_desc: "Maintain a 30-day streak",
        rec_goal_title: "🎯 Goal Master",
        rec_goal_desc: "Complete 10 goals",
        rec_elite_title: "⭐ Elite Status",
        rec_elite_desc: "Reach Rank: Elite",
        rec_habit_title: "📅 Habit Builder",
        rec_habit_desc: "Create 5 habits",
        chal_tasks_title: "Complete 5 tasks today",
        chal_tasks_desc: "Push your limits",
        chal_streak_title: "Reach a 3 day streak",
        chal_streak_desc: "Consistency is key",
        future_placeholder: "Write a letter to your future self",
        future_dear: "Dear future me...",
        loading: "Carregando...",
        consistency: "consistência",
        opens_in: "Abre em",
        open_message: "Abrir Mensagem",
        message_archive: "Arquivo de Mensagens",
        day_can_be_saved_body: "tarefas pendentes. Cada conclusão ajuda a proteger sua pontuação.",
        day_can_be_saved: "O Dia Ainda Pode Ser Salvo",
        strong_day_body: "tarefas hoje. Você está no topo do desempenho!",
        strong_day: "Dia Forte",
        perfect_day_body: "Você completou cada tarefa hoje. Disciplina excepcional!",
        perfect_day: "Dia Perfeito! ⭐",
        trust_declining_body2: "pontos esta semana. Foque em completar tarefas a tempo.",
        trust_declining_body: "Sua pontuação caiu",
        trust_declining: "Confiança Caindo",
        trust_rising_body2: "pontos em relação à semana passada. Continue assim!",
        trust_rising_body: "Sua pontuação melhorou em",
        trust_rising: "Confiança Subindo 📈",
        streak_7_body: "Consistência incrível. Sua sequência está no topo — proteja-a!",
        streak_3_body_2: "dias a mais para uma sequência de 1 semana. Você está construindo impulso!",
        streak_3_body_1: "Apenas",
        day_streak: "Dias de Sequência",
        tasks_lbl: "Tarefas",
        days_left: "dias restantes",
        overdue: "Atrasado",
        at_risk: "Em Risco",
        on_track: "No Caminho",
        gentle_nudge: "Lembrete gentil",
        habit_reminder: "Lembrete de hábito",
        tasks_for: "Tarefas para",
        empty_task_desc: "Crie sua primeira tarefa para se manter organizado e produtivo.",
        empty_goal_desc: "Crie sua primeira meta para acompanhar o progresso.",
        empty_habit_desc: "Construa consistência com seu primeiro hábito recorrente.",
        achieved_failed: "Achieved / Failed",
        achieved: "Achieved",
        failed_status: "Failed",
        longest_streak: "Longest Streak",
        highest_xp: "Highest XP Achieved",
        max_tasks_day: "Max Tasks In A Day",
        tasks_word: "Tarefas",
        goals_word: "Metas",
        ms_first_step: "First Step",
        ms_first_step_desc: "Complete your first task",
        ms_goal_setter: "Goal Setter",
        ms_goal_setter_desc: "Set your very first goal",
        ms_lvl10: "Level 10 Achieved",
        ms_lvl10_desc: "Reach Level 10 of personal productivity",
        ms_trust_builder: "Trust Builder",
        ms_trust_builder_desc: "Raise self trust score above 50",
        ms_discipline_elite: "Discipline Elite",
        ms_discipline_elite_desc: "Reach Level 25 or achieve elite trust levels",
        ms_legendary: "Legendary Achiever",
        ms_legendary_desc: "Complete 100 tasks and reach level 50",
        locked: "Locked",
        unlocked_status: "Unlocked",
        weekly_perf_card: "Weekly Performance Card",
        weekly_perf_desc: "Auto-generated weekly activity stats",
        monthly_perf_card: "Monthly Performance Review",
        monthly_perf_desc: "Detailed performance metrics review",
        weekly_progress_tab: "Weekly Progress",
        tasks_done: "Tasks Done",
        goals_done: "Goals Done",
        streak_health: "Streak Health",
        trust_growth: "Trust Growth",
        xp_rank_level: "XP Rank Level",
        trust_consistency: "Trust Consistency",
        chal_summer_sprint: "Summer Sprint",
        chal_summer_desc: "Complete 10 tasks to claim a massive boost.",
        chal_30day: "30 Day Consistency",
        chal_30day_desc: "Maintain a streak of 30 days.",
        in_progress: "In Progress",
        xp_reward_500: "+500 XP Reward",
        xp_reward_1500: "+1500 XP Reward",
        sent: "Sent",
        ready: "Ready",
        opened: "Opened",
        no_messages_yet: "No messages yet. Write your first one above!",
        ready_to_open: "Ready to Open!",
        fs_promise: "🤝 Promise",
        fs_prediction: "🔮 Prediction",
        fs_reminder: "🔔 Reminder",
        fs_motivational: "💪 Motivational",
        no_achievements: "No achievements yet",
        for_you_default_body: "Keep completing tasks to unlock personalized guidance",
        profile_updated: "Profile updated",
        profile_update_failed: "Failed to update profile",
        profile_link_copied: "Profile link copied!",
        insight_start_streak: "Start Your Streak",
        insight_start_streak_body: "Complete a task today to ignite your streak. Consistency is the foundation of trust.",
        levels_to_rank: "Levels to Rank Up",
        reach_level: "Reach Level",
        to_unlock: "to unlock the",
        rank_push: "rank. Push for it!",
        tasks_to_milestone: "Tasks to Milestone",
        complete: "Complete",
        more_tasks_milestone: "more tasks to reach the milestone of",
        create_task: "Criar Tarefa",
        create_goal: "Criar Objetivo",
        create_habit: "Criar Hábito",
        pressure_low: "Baixa Pressão",
        pressure_high: "Alto Impulso",
        pressure_balanced: "Equilibrado",
        message_title: "Título da mensagem",
        write_message: "Escreva sua mensagem...",
        mon: "Seg",
        tagline: "Planeje. Faça. Feito.",
        todays_insights: "Insights de Hoje",
        tasks_30d: "Tarefas (30d)",
        limited_time: "Tempo Limitado",
        goal_analytics: "Análise de Metas",
        mastery_progress: "Progresso de Domínio",
        goal_rate: "Taxa de Metas",
        view_goals_history: "Ver Histórico de Metas",
        write_future: "Escrever para o Futuro",
        total_xp: "XP Total",
        loading_achievements: "Carregando conquistas...",
        trust_desc: "A pontuação de confiança determina a consistência.",
        send_message_future: "Enviar Mensagem para o Futuro",
        analyzing_patterns: "Analisando padrões...",
        future_self: "Eu do Futuro",
        weekly_trend: "Tendência Semanal",
        send_future: "Enviar para o Futuro",
        your_analytics: "Sua Análise",
        view_tasks_history: "Ver Histórico de Tarefas",
        avg_completion_time: "Tempo Médio de Conclusão",
        personal_records: "Recordes Pessoais",
        link_to_goal: "Vincular a Meta",
        calculating: "Calculando...",
        weekly_summary: "Resumo Semanal",
        best_day: "Melhor Dia",
        no_goals_yet: "Sem metas ainda",
        no_habits_yet: "Sem hábitos ainda",
        no_tasks_yet: "Sem tarefas ainda",
        goal_word: "Meta",
        boost: "Impulso",
        no_habits_today: "Nenhum hábito programado para hoje.",
        average: "Médio",
        xp_boost: "Boost de XP",
        tasks_subtitle: "Suas tarefas ativas",
        full_report: "Relatório Completo",
        weekly_report: "Relatório Semanal",
    },
    ru: {
        app_title: "Тобедоне",
        login: "Войти", signup: "Регистрация", continue_with_google: "Продолжить с Google", or: "или",
        username_email: "Логин или Email", username: "Логин", password: "Пароль", forgot_password: "Забыли пароль?",
        forgot_password_note: "Введите email для сброса пароля.", send_reset_link: "Отправить ссылку",
        back_to_login: "Назад", verify_email_title: "Проверьте email", verify_email_body: "Проверьте входящие сообщения.",
        verification_code: "Код подтверждения", verify_code: "Подтвердить", reset_code: "Код сброса", use_code: "Использовать",
        resend_verification: "Отправить снова", reset_password_title: "Новый пароль", new_password: "Новый пароль",
        confirm_password: "Подтвердить пароль", update_password: "Обновить", full_name: "Полное имя", email: "Электронная почта",
        change_name: "Изменить имя", change_username: "Изменить логин", create_account: "Создать аккаунт",
        dashboard: "Панель", reports: "Отчёты", me: "Профиль", tasks: "Задачи", insights: "Статистика",
        progress: "Прогресс", settings: "Настройки", logout: "Выйти",
        trust_score: "Доверие", streak: "Серия", success: "Успех", daily_progress: "Дневной прогресс",
        statistics: "Статистика", task_distribution: "Распределение задач",
        add_new_task: "Новая задача", new_task: "Новая задача", task_placeholder: "Что нужно сделать?",
        category: "Категория", difficulty: "Сложность", easy: "Легко", medium: "Средне", hard: "Сложно",
        cancel: "Отмена", add_task: "Добавить", priority: "Приоритет", low: "Низкий", high: "Высокий",
        recurring: "Повтор", none: "Нет", daily: "Ежедневно", weekly: "Еженедельно",
        due_date: "Срок", overdue: "Просрочено", all: "Все", filter_by: "Фильтр",
        productive_day: "Самый продуктивный день", productive_hour: "Самый продуктивный час",
        trends: "Тренды", failure_patterns: "Паттерны ошибок", achievements: "Достижения",
        well_done: "Отлично!", keep_going: "Так держать!", streak_saved: "Серия сохранена!", multiplier: "{value}x повышение",
        active: "Активный",
        archived: "В архиве",
        excellent: "Отличный",
        good: "Хороший",
        current_streak: "Текущая серия",
        best_streak: "Лучшая серия",
        total_tasks: "Всего задач",
        total_goals: "Всего голов",
        total_habits: "Всего привычек",
        weekly_progress: "Еженедельный прогресс",
        monthly_progress: "Ежемесячный прогресс",
        completion_rate: "Скорость завершения",
        productivity_score: "Оценка производительности",
        achievement_unlocked: "Достижение разблокировано",
        rank_progress: "Прогресс ранга",
        ach_first_step: "Первый шаг",
        ach_goal_hunter: "Охотник за целями",
        ach_marathon: "Марафон",
        ach_legend: "Легенда",
        ach_elite_consistency: "Элитное постоянство",
        rank_starter: "Стартер",
        rank_builder: "Строитель",
        rank_achiever: "Достижитель",
        rank_consistent: "Последовательный",
        rank_elite: "Элита",
        rank_legend: "Легенда",
        rank_explorer: "Исследователь",
        rank_master: "Владелец",
        rank_grandmaster: "Гроссмейстер",
        notif_task_completed: "Задача выполнена",
        notif_goal_completed: "Цель достигнута",
        notif_achievement_unlocked: "Достижение разблокировано",
        notif_trust_score_increased: "Уровень доверия увеличился",
        notif_level_up: "Повышение уровня",
        search_placeholder: "Поиск...",
        enter_task_name: "Введите имя задачи...",
        select_goal: "Выберите цель...",
        select_habit: "Выберите привычку...",
        description: "Описание...",
        reports_tab: "Отчеты",
        insights_tab: "Информация",
        progress_tab: "Прогресс",
        me_tab: "Мне",
        dashboard_tab: "Панель управления",
        chart_labels: "Метки диаграмм",
        statistics_lbl: "Статистика",
        analytics_text: "Аналитика",
        progress_descriptions: "Описание прогресса",
        recommendations: "Рекомендации",
        smart_insights: "Умная информация",
        trust_score_changed: "Trust Score changed: {value}",
        goal_link: "Цель Ссылка",
        habit_link: "Ссылка на привычку",
        start: "Начинать",
        finish: "Заканчивать",
        goal_type: "Тип цели",
        deadline: "Крайний срок",
        custom_deadline: "Пользовательский срок",
        create_goal: "Создать цель",
        preferred_time: "Предпочтительное время",
        frequency: "Частота",
        days: "Дни",
        create_habit: "Создайте привычку",
        goal_reflection: "Отражение цели",
        what_went_well: "Что прошло хорошо?",
        what_didnt_go_well: "Что пошло не так?",
        skip: "Пропускать",
        save_reflection: "Сохранить отражение",
        share_progress: "Поделитесь своим прогрессом",
        download: "Скачать",
        copy_text: "Копировать текст",
        share: "Делиться",
        profile_link: "Ссылка на профиль",
        close: "Закрывать",
        adjust_profile_photo: "Изменить фото профиля",
        crop_save: "Обрезать и сохранить",
        focus_today: "Сосредоточьтесь на том, что важно сегодня.",
        today_short: "Сегодня (короткий метр)",
        tomorrow_short: "Завтра (короткая длина)",
        one_three_days: "1-3 дня (короткая продолжительность)",
        one_week_med: "1 неделя (средняя продолжительность)",
        two_weeks_med: "1-2 недели (средняя продолжительность)",
        one_month_med: "1 месяц (средняя продолжительность)",
        three_months_long: "3 месяца (длинная длина)",
        six_months_long: "6 месяцев (длинная длина)",
        one_year_long: "1 год (длинная длина)",
        one_year_plus: "1 год+ (длинная длина)",
        tomorrow: "Завтра",
        one_week: "1 неделя",
        one_month: "1 месяц",
        custom_date: "Пользовательская дата",
        specific_days: "Определенные дни",
        no_link: "Нет ссылки",
        select_a_goal: "Выберите цель...",
        select_a_habit: "Выберите привычку...",
        what_worked: "Расскажите нам о том, что сработало...",
        what_improved: "Что можно улучшить...",
        search_achievements: "Поиск достижений...",
        goal_title: "Название цели",
        habit_title: "Название привычки",
        level: "Уровень",
        xp_lbl: "XP",
        streak_lbl: "Полоса",
        completed_tasks: "Выполненные задачи",
        goals_achieved: "Цели достигнуты",
        trust_low: "Низкий",
        trust_average: "Средний",
        trust_good: "Хороший",
        trust_excellent: "Отличный",
        rank_permanent: "Постоянная система рангов",
        self_trust_score: "Оценка самооценки",
        success_rate: "Уровень успеха",
        rank: "Классифицировать",
        xp: "XP",
        analytics: "Аналитика",
        records: "Рекорды",
        milestones: "Вехи",
        challenges: "Проблемы",
        history: "История",
        calendar_labels: "Календарные этикетки",
        failed: "Неуспешный",
        next_level: "Следующий уровень",
        search: "Поиск...",
        common: "Общий",
        rare: "Редкий",
        epic: "Эпический",
        legendary: "Легендарный",
        ach_first_step_desc: "Выполните первое задание.",
        ach_productive_day: "Продуктивный день",
        ach_productive_day_desc: "Выполните 5 заданий за один день.",
        ach_task_machine: "Задача машины",
        ach_task_machine_desc: "Выполните 25 заданий.",
        ach_task_master: "Мастер задач",
        ach_task_master_desc: "Выполните 100 заданий.",
        ach_completion_expert: "Эксперт по завершению",
        ach_completion_expert_desc: "Выполните 500 заданий.",
        ach_perfection_day: "День совершенства",
        ach_perfection_day_desc: "Выполните все задачи, запланированные на день.",
        ach_zero_miss_day: "Ноль Мисс Дэй",
        ach_zero_miss_day_desc: "Завершите день без невыполненных задач.",
        ach_goal_setter: "Постановщик целей",
        ach_goal_setter_desc: "Создайте первую цель.",
        ach_goal_hunter_desc: "Завершите первую цель.",
        ach_focused: "Сосредоточенный",
        ach_focused_desc: "Выполните 5 целей.",
        ach_visionary: "Провидец",
        ach_visionary_desc: "Завершите 20 целей.",
        ach_unstoppable: "Неудержимый",
        ach_unstoppable_desc: "Достичь долгосрочной цели.",
        ach_habit_beginner: "Привычка Новичок",
        ach_habit_beginner_desc: "Создайте первую привычку.",
        ach_consistent: "Последовательный",
        ach_consistent_desc: "Поддерживайте 7-дневную полосу привычек.",
        ach_dedicated: "Преданный",
        ach_dedicated_desc: "Поддерживайте 30-дневную полосу привычек.",
        ach_ritual_master: "Мастер ритуалов",
        ach_ritual_master_desc: "Поддерживайте 100-дневную полосу привычек.",
        ach_habit_collector: "Коллекционер привычек",
        ach_habit_collector_desc: "Имейте 10 активных привычек.",
        ach_streak_3: "3-дневная серия",
        ach_streak_3_desc: "Достигните трехдневной серии.",
        ach_streak_7: "7-дневная серия",
        ach_streak_7_desc: "Достигните 7-дневной серии.",
        ach_streak_14: "14-дневная серия",
        ach_streak_14_desc: "Достигните 14-дневной серии.",
        ach_streak_30: "30-дневная серия",
        ach_streak_30_desc: "Достигните 30-дневной серии.",
        ach_streak_50: "50-дневная серия",
        ach_streak_50_desc: "Достигните 50-дневной серии.",
        ach_streak_100: "100-дневная серия",
        ach_streak_100_desc: "Достигните 100-дневной серии.",
        ach_comeback_king: "Король возвращения",
        ach_comeback_king_desc: "Восстановление после потери серии.",
        ach_average_citizen: "Среднестатистический гражданин",
        ach_average_citizen_desc: "Достигните доверия 26.",
        ach_reliable: "Надежный",
        ach_reliable_desc: "Достигните доверия 51.",
        ach_excellent: "Отличный",
        ach_excellent_desc: "Достигните доверия 76.",
        ach_trusted: "Доверенный",
        ach_trusted_desc: "Поддерживайте уровень доверия 75+ в течение 30 дней.",
        ach_iron_discipline: "Железная дисциплина",
        ach_iron_discipline_desc: "Поддерживайте уровень доверия 90+ в течение 30 дней.",
        ach_elite_consistency_desc: "Достигните доверия 100.",
        ach_level_5: "Уровень 5",
        ach_level_5_desc: "Достигните уровня 5.",
        ach_level_10: "Уровень 10",
        ach_level_10_desc: "Достигните 10-го уровня.",
        ach_level_25: "Уровень 25",
        ach_level_25_desc: "Достигните 25-го уровня.",
        ach_level_50: "Уровень 50",
        ach_level_50_desc: "Достигните 50-го уровня.",
        ach_level_100: "Уровень 100",
        ach_level_100_desc: "Достигните 100-го уровня.",
        ach_veteran: "Ветеран",
        ach_veteran_desc: "Заработайте 10 000 общего опыта.",
        ach_active_week: "Активная неделя",
        ach_active_week_desc: "Используйте приложение в течение 7 дней подряд.",
        ach_active_month: "Активный месяц",
        ach_active_month_desc: "Используйте приложение 30 дней подряд.",
        ach_weekend_warrior: "Воин выходного дня",
        ach_weekend_warrior_desc: "Выполняйте задания в субботу и воскресенье.",
        ach_perfect_week: "Идеальная неделя",
        ach_perfect_week_desc: "Завершите неделю без невыполненных задач.",
        ach_night_owl: "Ночная сова",
        ach_night_owl_desc: "Выполните 50 заданий после 23:00.",
        ach_early_bird: "Ранняя пташка",
        ach_early_bird_desc: "Выполните 50 заданий до 08:00.",
        ach_recovery_mode: "Режим восстановления",
        ach_recovery_mode_desc: "Поднимите доверие с уровня ниже 25 до уровня выше 50.",
        ach_redemption_arc: "Арка Искупления",
        ach_redemption_arc_desc: "Поднимите доверие с уровня ниже 25 до уровня выше 75.",
        ach_marathon_desc: "Выполните 1000 заданий.",
        ach_one_year_strong: "Один год сильного",
        ach_one_year_strong_desc: "Оставайтесь активными в течение 365 дней.",
        ach_century_streak: "Полоса столетия",
        ach_century_streak_desc: "Достигните 100-дневной серии.",
        ach_goal_legend: "Легенда гола",
        ach_goal_legend_desc: "Завершите 100 целей.",
        ach_habit_legend: "Легенда привычки",
        ach_habit_legend_desc: "Достигните 365-дневной привычки.",
        ach_tobedone_legend: "Легенда Тобедоне",
        ach_tobedone_legend_desc: "Разблокируйте 80% всех достижений.",
        goal_link: "Цель Ссылка",
        habit_link: "Ссылка на привычку",
        start: "Начинать",
        finish: "Заканчивать",
        goal_type: "Тип цели",
        deadline: "Крайний срок",
        custom_deadline: "Пользовательский срок",
        create_goal: "Создать цель",
        preferred_time: "Предпочтительное время",
        frequency: "Частота",
        days: "Дни",
        create_habit: "Создайте привычку",
        goal_reflection: "Отражение цели",
        what_went_well: "Что прошло хорошо?",
        what_didnt_go_well: "Что пошло не так?",
        skip: "Пропускать",
        save_reflection: "Сохранить отражение",
        share_progress: "Поделитесь своим прогрессом",
        download: "Скачать",
        copy_text: "Копировать текст",
        share: "Делиться",
        profile_link: "Ссылка на профиль",
        close: "Закрывать",
        adjust_profile_photo: "Изменить фото профиля",
        crop_save: "Обрезать и сохранить",
        focus_today: "Сосредоточьтесь на том, что важно сегодня.",
        today_short: "Сегодня (короткий метр)",
        tomorrow_short: "Завтра (короткая длина)",
        one_three_days: "1-3 дня (короткая продолжительность)",
        one_week_med: "1 неделя (средняя продолжительность)",
        two_weeks_med: "1-2 недели (средняя продолжительность)",
        one_month_med: "1 месяц (средняя продолжительность)",
        three_months_long: "3 месяца (длинная длина)",
        six_months_long: "6 месяцев (длинная длина)",
        one_year_long: "1 год (длинная длина)",
        one_year_plus: "1 год+ (длинная длина)",
        tomorrow: "Завтра",
        one_week: "1 неделя",
        one_month: "1 месяц",
        custom_date: "Пользовательская дата",
        specific_days: "Определенные дни",
        no_link: "Нет ссылки",
        select_a_goal: "Выберите цель...",
        select_a_habit: "Выберите привычку...",
        what_worked: "Расскажите нам о том, что сработало...",
        what_improved: "Что можно улучшить...",
        search_achievements: "Поиск достижений...",
        goal_title: "Название цели",
        habit_title: "Название привычки",
        level: "Уровень",
        xp_lbl: "XP",
        streak_lbl: "Полоса",
        completed_tasks: "Выполненные задачи",
        goals_achieved: "Цели достигнуты",
        task_completed: "Задача выполнена",
        goal_completed: "Цель достигнута",
        trust_low: "Низкий",
        trust_average: "Средний",
        trust_good: "Хороший",
        trust_excellent: "Отличный",
        rank_permanent: "Постоянная система рангов",
        trust_score_increased: "Уровень доверия увеличился",
        level_up: "Повышение уровня",
        multiplier: "{value}x Буст",
        tasks_count: "{count} задач сегодня", smart_suggestion: "Умная подсказка",
        best_time_to_create: "Вы очень активны сейчас! Хорошее время для планирования.",
        suggest_simpler: "Задача кажется сложной. Разбить её?",
        high_risk: "Высокий риск неудачи по истории.",
        optimal_time: "Оптимальное время: ", most_productive_day: "Самый продуктивный день: ",
        most_productive_hour: "Самый продуктивный час: ", failure_pattern: "Вам сложно с задачами в категории ",
        theme: "Тема", toggle_dark: "Тёмный режим", language: "Язык",
        app_info: "Инфо", version: "Версия", completed: "Выполнено", failed: "Провалено", pending: "Ожидает",
        no_tasks: "Нет задач на сегодня!", session_expired: "Сессия истекла",
        task_added: "Задача добавлена!", task_updated: "Задача обновлена!", error_occurred: "Произошла ошибка",
        calendar: "Календарь", date: "Дата", time: "Время", reminder: "Напоминание",
        view_habits_history: "История привычек", instructions_btn: "Инструкции",
        force_update: "Обновить приложение", install_app: "Установить приложение", got_it: "Понятно",
        inst_title: "Инструкции", inst_subtitle: "Всё о Tobedone",
        inst_tasks_title: "Задачи", inst_tasks_desc: "Создавайте задачи с '+'. Получайте очки за выполнение.",
        inst_dash_title: "Панель", inst_dash_desc: "Отслеживайте свою продуктивность.",
        inst_prog_title: "Прогресс", inst_prog_desc: "Получайте опыт и открывайте значки.",
        inst_gestures_title: "Жесты", inst_gestures_desc: "Листайте для смены страниц.",
        goals: "Цели", habits: "Привычки", goals_tab: "Цели", habits_tab: "Привычки", add_goal: "Добавить Цель", add_habit: "Добавить Привычку", new_goal: "Новая Цель", new_habit: "Новая Привычка", today_habits: "Привычки на Сегодня", goals_subtitle: "Вехи на будущее.", habits_subtitle: "Маленькие шаги, большие результаты.", reflect: "Рефлексия", reflection: "Рефлексия", check_in: "Отметка", save_goal: "Сохранить Цель", save_habit: "Сохранить Привычку",
        profile: "Profile",
        for_you: "For You",
        save_changes: "Save Changes",
        category_general: "General",
        not_enough_data: "Not enough data",
        tue: "Вт",
        wed: "Ср",
        thu: "Чт",
        fri: "Пт",
        sat: "Сб",
        sun: "Вс",
        jan: "Jan",
        feb: "Feb",
        mar: "Mar",
        apr: "Apr",
        may: "Май",
        jun: "Jun",
        jul: "Jul",
        aug: "Aug",
        sep: "Sep",
        oct: "Oct",
        nov: "Nov",
        dec: "Dec",
        january: "Январь",
        february: "Февраль",
        march: "Март",
        april: "Апрель",
        june: "Июнь",
        july: "Июль",
        august: "Август",
        september: "Сентябрь",
        october: "Октябрь",
        november: "Ноябрь",
        december: "Декабрь",
        rec_lvl10_title: "🏆 Level 10 Achieved",
        rec_lvl10_desc: "Reach Level 10 of personal productivity",
        rec_streak7_title: "🔥 7-Day Streak",
        rec_streak7_desc: "Maintain a 7-day streak",
        rec_streak30_title: "🔥 30-Day Streak",
        rec_streak30_desc: "Maintain a 30-day streak",
        rec_goal_title: "🎯 Goal Master",
        rec_goal_desc: "Complete 10 goals",
        rec_elite_title: "⭐ Elite Status",
        rec_elite_desc: "Reach Rank: Elite",
        rec_habit_title: "📅 Habit Builder",
        rec_habit_desc: "Create 5 habits",
        chal_tasks_title: "Complete 5 tasks today",
        chal_tasks_desc: "Push your limits",
        chal_streak_title: "Reach a 3 day streak",
        chal_streak_desc: "Consistency is key",
        future_placeholder: "Write a letter to your future self",
        future_dear: "Dear future me...",
        loading: "Загрузка...",
        consistency: "последовательность",
        opens_in: "Откроется через",
        open_message: "Открыть Сообщение",
        message_archive: "Архив Сообщений",
        day_can_be_saved_body: "задач ещё ожидают. Каждое выполнение помогает защитить ваш балл.",
        day_can_be_saved: "День Ещё Можно Спасти",
        strong_day_body: "задач сегодня. Вы на вершине производительности!",
        strong_day: "Сильный День",
        perfect_day_body: "Вы выполнили каждую задачу сегодня. Исключительная дисциплина!",
        perfect_day: "Идеальный День! ⭐",
        trust_declining_body2: "очков на этой неделе. Сосредоточьтесь на выполнении задач вовремя.",
        trust_declining_body: "Ваш балл упал на",
        trust_declining: "Доверие Снижается",
        trust_rising_body2: "очков по сравнению с прошлой неделей. Продолжайте!",
        trust_rising_body: "Ваш балл улучшился на",
        trust_rising: "Доверие Растёт 📈",
        streak_7_body: "Невероятная последовательность. Ваша серия на вершине — берегите её!",
        streak_3_body_2: "дней до недельной серии. Вы набираете темп!",
        streak_3_body_1: "Осталось",
        day_streak: "Дней Подряд",
        tasks_lbl: "Задачи",
        days_left: "дней осталось",
        overdue: "Просрочено",
        at_risk: "Под Угрозой",
        on_track: "В Срок",
        gentle_nudge: "Мягкое напоминание",
        habit_reminder: "Напоминание о привычке",
        tasks_for: "Задачи на",
        empty_task_desc: "Создайте свою первую задачу, чтобы оставаться организованным.",
        empty_goal_desc: "Создайте свою первую цель для отслеживания прогресса.",
        empty_habit_desc: "Выработайте постоянство с вашей первой привычкой.",
        achieved_failed: "Achieved / Failed",
        achieved: "Achieved",
        failed_status: "Failed",
        longest_streak: "Longest Streak",
        highest_xp: "Highest XP Achieved",
        max_tasks_day: "Max Tasks In A Day",
        tasks_word: "Задачи",
        goals_word: "Цели",
        ms_first_step: "First Step",
        ms_first_step_desc: "Complete your first task",
        ms_goal_setter: "Goal Setter",
        ms_goal_setter_desc: "Set your very first goal",
        ms_lvl10: "Level 10 Achieved",
        ms_lvl10_desc: "Reach Level 10 of personal productivity",
        ms_trust_builder: "Trust Builder",
        ms_trust_builder_desc: "Raise self trust score above 50",
        ms_discipline_elite: "Discipline Elite",
        ms_discipline_elite_desc: "Reach Level 25 or achieve elite trust levels",
        ms_legendary: "Legendary Achiever",
        ms_legendary_desc: "Complete 100 tasks and reach level 50",
        locked: "Locked",
        unlocked_status: "Unlocked",
        weekly_perf_card: "Weekly Performance Card",
        weekly_perf_desc: "Auto-generated weekly activity stats",
        monthly_perf_card: "Monthly Performance Review",
        monthly_perf_desc: "Detailed performance metrics review",
        weekly_progress_tab: "Weekly Progress",
        tasks_done: "Tasks Done",
        goals_done: "Goals Done",
        streak_health: "Streak Health",
        trust_growth: "Trust Growth",
        xp_rank_level: "XP Rank Level",
        trust_consistency: "Trust Consistency",
        chal_summer_sprint: "Summer Sprint",
        chal_summer_desc: "Complete 10 tasks to claim a massive boost.",
        chal_30day: "30 Day Consistency",
        chal_30day_desc: "Maintain a streak of 30 days.",
        in_progress: "In Progress",
        xp_reward_500: "+500 XP Reward",
        xp_reward_1500: "+1500 XP Reward",
        sent: "Sent",
        ready: "Ready",
        opened: "Opened",
        no_messages_yet: "No messages yet. Write your first one above!",
        ready_to_open: "Ready to Open!",
        fs_promise: "🤝 Promise",
        fs_prediction: "🔮 Prediction",
        fs_reminder: "🔔 Reminder",
        fs_motivational: "💪 Motivational",
        no_achievements: "No achievements yet",
        for_you_default_body: "Keep completing tasks to unlock personalized guidance",
        profile_updated: "Profile updated",
        profile_update_failed: "Failed to update profile",
        profile_link_copied: "Profile link copied!",
        insight_start_streak: "Start Your Streak",
        insight_start_streak_body: "Complete a task today to ignite your streak. Consistency is the foundation of trust.",
        levels_to_rank: "Levels to Rank Up",
        reach_level: "Reach Level",
        to_unlock: "to unlock the",
        rank_push: "rank. Push for it!",
        tasks_to_milestone: "Tasks to Milestone",
        complete: "Complete",
        more_tasks_milestone: "more tasks to reach the milestone of",
        create_task: "Создать Задачу",
        create_goal: "Создать Цель",
        create_habit: "Создать Привычку",
        pressure_low: "Низкое Давление",
        pressure_high: "Высокий Импульс",
        pressure_balanced: "Сбалансировано",
        message_title: "Заголовок сообщения",
        write_message: "Напишите ваше сообщение...",
        mon: "Пн",
        tagline: "Планируй. Делай. Готово.",
        todays_insights: "Сегодняшние идеи",
        tasks_30d: "Задачи (30д)",
        limited_time: "Ограниченное время",
        goal_analytics: "Аналитика целей",
        mastery_progress: "Прогресс мастерства",
        goal_rate: "Уровень целей",
        view_goals_history: "Посмотреть историю целей",
        write_future: "Письмо в будущее",
        total_xp: "Всего XP",
        loading_achievements: "Загрузка достижений...",
        trust_desc: "Оценка доверия определяет стабильность.",
        send_message_future: "Отправить сообщение в будущее",
        analyzing_patterns: "Анализ паттернов...",
        future_self: "Я в будущем",
        weekly_trend: "Тренд недели",
        send_future: "Отправить в будущее",
        your_analytics: "Ваша аналитика",
        view_tasks_history: "Посмотреть историю задач",
        avg_completion_time: "Среднее время выполнения",
        personal_records: "Личные рекорды",
        link_to_goal: "Связать с целью",
        calculating: "Вычисление...",
        weekly_summary: "Итоги недели",
        best_day: "Лучший день",
        no_goals_yet: "Пока нет целей",
        no_habits_yet: "Пока нет привычек",
        no_tasks_yet: "Пока нет задач",
        goal_word: "Цель",
        boost: "Усиление",
        no_habits_today: "На сегодня привычек нет.",
        average: "Средний",
        xp_boost: "XP Буст",
        tasks_subtitle: "Ваши активные задачи",
        full_report: "Полный отчёт",
        weekly_report: "Еженедельный отчёт",
    },
    ja: {
        app_title: "トベドネ",
        login: "ログイン", signup: "新規登録", continue_with_google: "Googleで続行", or: "または",
        username_email: "ユーザー名またはメール", username: "ユーザー名", password: "パスワード", forgot_password: "パスワードをお忘れですか？",
        forgot_password_note: "メールアドレスを入力してください。", send_reset_link: "リンクを送信",
        back_to_login: "ログインに戻る", verify_email_title: "メールを確認", verify_email_body: "受信トレイをご確認ください。",
        verification_code: "確認コード", verify_code: "確認する", reset_code: "リセットコード", use_code: "使用する",
        resend_verification: "再送信", reset_password_title: "新しいパスワード", new_password: "新しいパスワード",
        confirm_password: "パスワードの確認", update_password: "更新する", full_name: "氏名", email: "メール",
        change_name: "名前を変更", change_username: "ユーザー名を変更", create_account: "アカウント作成",
        dashboard: "ダッシュボード", reports: "レポート", me: "マイページ", tasks: "タスク", insights: "分析",
        progress: "進捗", settings: "設定", logout: "ログアウト",
        trust_score: "信頼スコア", streak: "連続達成", success: "成功", daily_progress: "日次進捗",
        statistics: "統計", task_distribution: "タスク分布",
        add_new_task: "新しいタスク", new_task: "新しいタスク", task_placeholder: "何をすべきですか？",
        category: "カテゴリ", difficulty: "難易度", easy: "簡単", medium: "普通", hard: "難しい",
        cancel: "キャンセル", add_task: "追加", priority: "優先度", low: "低", high: "高",
        recurring: "繰り返し", none: "なし", daily: "毎日", weekly: "毎週",
        due_date: "期限", overdue: "期限切れ", all: "すべて", filter_by: "フィルター",
        productive_day: "最も生産的な日", productive_hour: "最も生産的な時間帯",
        trends: "トレンド", failure_patterns: "失敗パターン", achievements: "実績",
        well_done: "よくできました！", keep_going: "その調子！", streak_saved: "連続達成維持！", multiplier: "{value}x ブースト",
        active: "アクティブ",
        archived: "アーカイブ済み",
        excellent: "素晴らしい",
        good: "良い",
        current_streak: "現在の連続数",
        best_streak: "ベストストリーク",
        total_tasks: "合計タスク数",
        total_goals: "総目標数",
        total_habits: "合計の習慣",
        weekly_progress: "週ごとの進捗状況",
        monthly_progress: "毎月の進捗状況",
        completion_rate: "完了率",
        productivity_score: "生産性スコア",
        achievement_unlocked: "実績のロックが解除されました",
        rank_progress: "ランクの進行状況",
        ach_first_step: "最初のステップ",
        ach_goal_hunter: "ゴールハンター",
        ach_marathon: "マラソン",
        ach_legend: "伝説",
        ach_elite_consistency: "エリートの一貫性",
        rank_starter: "スターター",
        rank_builder: "ビルダー",
        rank_achiever: "達成者",
        rank_consistent: "一貫性のある",
        rank_elite: "エリート",
        rank_legend: "伝説",
        rank_explorer: "エクスプローラ",
        rank_master: "マスター",
        rank_grandmaster: "グランドマスター",
        notif_task_completed: "タスクが完了しました",
        notif_goal_completed: "目標は完了しました",
        notif_achievement_unlocked: "実績のロックが解除されました",
        notif_trust_score_increased: "信頼スコアが増加しました",
        notif_level_up: "レベルアップ",
        search_placeholder: "検索...",
        enter_task_name: "タスク名を入力してください...",
        select_goal: "目標を選択...",
        select_habit: "習慣を選択...",
        description: "説明...",
        reports_tab: "レポート",
        insights_tab: "洞察",
        progress_tab: "進捗",
        me_tab: "自分",
        dashboard_tab: "ダッシュボード",
        chart_labels: "グラフのラベル",
        statistics_lbl: "統計",
        analytics_text: "分析",
        progress_descriptions: "進行状況の説明",
        recommendations: "推奨事項",
        smart_insights: "スマートな洞察",
        trust_score_changed: "Trust Score changed: {value}",
        goal_link: "ゴールリンク",
        habit_link: "習慣リンク",
        start: "始める",
        finish: "仕上げる",
        goal_type: "目標の種類",
        deadline: "締め切り",
        custom_deadline: "カスタム期限",
        create_goal: "目標の作成",
        preferred_time: "希望時間",
        frequency: "頻度",
        days: "日数",
        create_habit: "習慣を作る",
        goal_reflection: "目標の振り返り",
        what_went_well: "何がうまくいきましたか?",
        what_didnt_go_well: "何がうまくいかなかったのでしょうか？",
        skip: "スキップ",
        save_reflection: "リフレクションの保存",
        share_progress: "進捗状況を共有する",
        download: "ダウンロード",
        copy_text: "テキストをコピーする",
        share: "共有",
        profile_link: "プロフィールリンク",
        close: "近い",
        adjust_profile_photo: "プロフィール写真を調整する",
        crop_save: "切り取って保存",
        focus_today: "今日の重要なことに集中してください。",
        today_short: "今日（ショート丈）",
        tomorrow_short: "明日（ショート丈）",
        one_three_days: "1～3日（ショート丈）",
        one_week_med: "1週間（中程度）",
        two_weeks_med: "1～2週間（中程度の長さ）",
        one_month_med: "1ヶ月（中期間）",
        three_months_long: "3ヶ月（ロング丈）",
        six_months_long: "6ヶ月（ロング丈）",
        one_year_long: "1年（ロング丈）",
        one_year_plus: "1歳以上（ロング丈）",
        tomorrow: "明日",
        one_week: "1週間",
        one_month: "1ヶ月",
        custom_date: "カスタム日付",
        specific_days: "特定の日",
        no_link: "リンクなし",
        select_a_goal: "目標を選択してください...",
        select_a_habit: "習慣を選択してください...",
        what_worked: "何が効果的だったか教えてください...",
        what_improved: "改善できる点は何でしょうか...",
        search_achievements: "実績を検索...",
        goal_title: "目標タイトル",
        habit_title: "習慣のタイトル",
        level: "レベル",
        xp_lbl: "XP",
        streak_lbl: "ストリーク",
        completed_tasks: "完了したタスク",
        goals_achieved: "達成した目標",
        trust_low: "低い",
        trust_average: "平均",
        trust_good: "良い",
        trust_excellent: "素晴らしい",
        rank_permanent: "永久ランク制度",
        self_trust_score: "自己信頼スコア",
        success_rate: "成功率",
        rank: "ランク",
        xp: "XP",
        analytics: "分析",
        records: "記録",
        milestones: "マイルストーン",
        challenges: "課題",
        history: "歴史",
        calendar_labels: "カレンダーラベル",
        failed: "失敗した",
        next_level: "次のレベル",
        search: "検索...",
        common: "一般",
        rare: "レア",
        epic: "すごい",
        legendary: "伝説の",
        ach_first_step_desc: "最初のタスクを完了します。",
        ach_productive_day: "生産的な一日",
        ach_productive_day_desc: "1 日に 5 つのタスクを完了します。",
        ach_task_machine: "タスクマシン",
        ach_task_machine_desc: "25 個のタスクを完了します。",
        ach_task_master: "タスクマスター",
        ach_task_master_desc: "100 個のタスクを完了します。",
        ach_completion_expert: "完成エキスパート",
        ach_completion_expert_desc: "500 個のタスクを完了します。",
        ach_perfection_day: "完璧の日",
        ach_perfection_day_desc: "1 日にスケジュールされたすべてのタスクを完了します。",
        ach_zero_miss_day: "ゼロミスデー",
        ach_zero_miss_day_desc: "失敗したタスクを行わずに 1 日を終えます。",
        ach_goal_setter: "ゴールセッター",
        ach_goal_setter_desc: "最初の目標を作成します。",
        ach_goal_hunter_desc: "最初の目標を達成します。",
        ach_focused: "集中した",
        ach_focused_desc: "5 つの目標を達成します。",
        ach_visionary: "先見の明のある人",
        ach_visionary_desc: "20 の目標を達成します。",
        ach_unstoppable: "止められない",
        ach_unstoppable_desc: "長期的な目標を達成します。",
        ach_habit_beginner: "習慣初心者",
        ach_habit_beginner_desc: "最初の習慣を作りましょう。",
        ach_consistent: "一貫性のある",
        ach_consistent_desc: "7日間の継続的な習慣を維持してください。",
        ach_dedicated: "ひたむきな",
        ach_dedicated_desc: "30日間の継続的な習慣を維持してください。",
        ach_ritual_master: "リチュアルマスター",
        ach_ritual_master_desc: "100日間の習慣を継続しましょう。",
        ach_habit_collector: "習慣コレクター",
        ach_habit_collector_desc: "10のアクティブな習慣を持ちましょう。",
        ach_streak_3: "3日連続",
        ach_streak_3_desc: "3日連続達成。",
        ach_streak_7: "7日連続",
        ach_streak_7_desc: "7 日間の連続記録に到達します。",
        ach_streak_14: "14日連続",
        ach_streak_14_desc: "14日連続達成。",
        ach_streak_30: "30日連続",
        ach_streak_30_desc: "30 日連続達成。",
        ach_streak_50: "50日連続",
        ach_streak_50_desc: "連続 50 日を達成する。",
        ach_streak_100: "100日連続達成",
        ach_streak_100_desc: "100 日連続達成。",
        ach_comeback_king: "カムバックキング",
        ach_comeback_king_desc: "連敗後は立ち直る。",
        ach_average_citizen: "平均的な国民",
        ach_average_citizen_desc: "トラスト26に到達する。",
        ach_reliable: "信頼性のある",
        ach_reliable_desc: "トラスト51に到達する。",
        ach_excellent: "素晴らしい",
        ach_excellent_desc: "トラスト76に到達する。",
        ach_trusted: "信頼できる",
        ach_trusted_desc: "信頼度 75 以上を 30 日間維持します。",
        ach_iron_discipline: "鉄の規律",
        ach_iron_discipline_desc: "信頼度90以上を30日間維持します。",
        ach_elite_consistency_desc: "信頼度100に到達する。",
        ach_level_5: "レベル5",
        ach_level_5_desc: "レベル 5 に到達します。",
        ach_level_10: "レベル10",
        ach_level_10_desc: "レベル10に到達する。",
        ach_level_25: "レベル25",
        ach_level_25_desc: "レベル25に到達する。",
        ach_level_50: "レベル50",
        ach_level_50_desc: "レベル50に到達する。",
        ach_level_100: "レベル100",
        ach_level_100_desc: "レベル100に到達する。",
        ach_veteran: "ベテラン",
        ach_veteran_desc: "合計 10000 XP を獲得します。",
        ach_active_week: "アクティブな週",
        ach_active_week_desc: "アプリを 7 日間連続して使用します。",
        ach_active_month: "アクティブな月",
        ach_active_month_desc: "アプリを 30 日間連続して使用します。",
        ach_weekend_warrior: "週末の戦士",
        ach_weekend_warrior_desc: "土曜日と日曜日の両方にタスクを完了してください。",
        ach_perfect_week: "パーフェクトウィーク",
        ach_perfect_week_desc: "失敗したタスクなしで 1 週間を完了します。",
        ach_night_owl: "ナイトフクロウ",
        ach_night_owl_desc: "23:00以降に50個のタスクを完了します。",
        ach_early_bird: "早割",
        ach_early_bird_desc: "08:00までに50のタスクを完了してください。",
        ach_recovery_mode: "リカバリーモード",
        ach_recovery_mode_desc: "信頼を25未満から50以上に上げます。",
        ach_redemption_arc: "償還編",
        ach_redemption_arc_desc: "信頼を25未満から75以上に上げます。",
        ach_marathon_desc: "1000 個のタスクを完了する。",
        ach_one_year_strong: "1年ぶりの強さ",
        ach_one_year_strong_desc: "365 日アクティブな状態を保ちます。",
        ach_century_streak: "センチュリーストリーク",
        ach_century_streak_desc: "100 日連続達成。",
        ach_goal_legend: "ゴールの凡例",
        ach_goal_legend_desc: "100 個の目標を達成します。",
        ach_habit_legend: "習慣の伝説",
        ach_habit_legend_desc: "365 日の連続習慣を達成しましょう。",
        ach_tobedone_legend: "とべどね伝説",
        ach_tobedone_legend_desc: "すべての実績の 80% をアンロックします。",
        goal_link: "ゴールリンク",
        habit_link: "習慣リンク",
        start: "始める",
        finish: "仕上げる",
        goal_type: "目標の種類",
        deadline: "締め切り",
        custom_deadline: "カスタム期限",
        create_goal: "目標の作成",
        preferred_time: "希望時間",
        frequency: "頻度",
        days: "日数",
        create_habit: "習慣を作る",
        goal_reflection: "目標の振り返り",
        what_went_well: "何がうまくいきましたか?",
        what_didnt_go_well: "何がうまくいかなかったのでしょうか？",
        skip: "スキップ",
        save_reflection: "リフレクションの保存",
        share_progress: "進捗状況を共有する",
        download: "ダウンロード",
        copy_text: "テキストをコピーする",
        share: "共有",
        profile_link: "プロフィールリンク",
        close: "近い",
        adjust_profile_photo: "プロフィール写真を調整する",
        crop_save: "切り取って保存",
        focus_today: "今日の重要なことに集中してください。",
        today_short: "今日（ショート丈）",
        tomorrow_short: "明日（ショート丈）",
        one_three_days: "1～3日（ショート丈）",
        one_week_med: "1週間（中程度）",
        two_weeks_med: "1～2週間（中程度の長さ）",
        one_month_med: "1ヶ月（中期間）",
        three_months_long: "3ヶ月（ロング丈）",
        six_months_long: "6ヶ月（ロング丈）",
        one_year_long: "1年（ロング丈）",
        one_year_plus: "1歳以上（ロング丈）",
        tomorrow: "明日",
        one_week: "1週間",
        one_month: "1ヶ月",
        custom_date: "カスタム日付",
        specific_days: "特定の日",
        no_link: "リンクなし",
        select_a_goal: "目標を選択してください...",
        select_a_habit: "習慣を選択してください...",
        what_worked: "何が効果的だったか教えてください...",
        what_improved: "改善できる点は何でしょうか...",
        search_achievements: "実績を検索...",
        goal_title: "目標タイトル",
        habit_title: "習慣のタイトル",
        level: "レベル",
        xp_lbl: "XP",
        streak_lbl: "ストリーク",
        completed_tasks: "完了したタスク",
        goals_achieved: "達成した目標",
        task_completed: "タスクが完了しました",
        goal_completed: "目標は完了しました",
        trust_low: "低い",
        trust_average: "平均",
        trust_good: "良い",
        trust_excellent: "素晴らしい",
        rank_permanent: "永久ランク制度",
        trust_score_increased: "信頼スコアが増加しました",
        level_up: "レベルアップ",
        multiplier: "{value}x ブースト",
        tasks_count: "今日のタスク：{count}件", smart_suggestion: "スマート提案",
        best_time_to_create: "今が一番活発です！計画を立てるのに最適な時間です。",
        suggest_simpler: "このタスクは複雑に見えます。分割しますか？",
        high_risk: "このカテゴリ/時間帯は失敗リスクが高いです。",
        optimal_time: "最適な完了時間：", most_productive_day: "最も生産的な日は",
        most_productive_hour: "最もよく作業する時間帯は", failure_pattern: "このカテゴリのタスクに苦手が多い：",
        theme: "テーマ", toggle_dark: "ダークモード", language: "言語",
        app_info: "アプリ情報", version: "バージョン", completed: "完了", failed: "失敗", pending: "保留中",
        no_tasks: "今日のタスクはありません！", session_expired: "セッションが切れました",
        task_added: "タスクを追加しました！", task_updated: "タスクを更新しました！", error_occurred: "エラーが発生しました",
        calendar: "カレンダー", date: "日付", time: "時間", reminder: "リマインダー",
        view_habits_history: "習慣の履歴", instructions_btn: "使い方",
        force_update: "アプリを更新", install_app: "アプリをインストール", got_it: "了解",
        inst_title: "使い方ガイド", inst_subtitle: "Tobedoneについてのすべて",
        inst_tasks_title: "タスク", inst_tasks_desc: "「+」でタスクを作成。優先度とカテゴリを設定できます。円をタップして完了し、ポイントを獲得！",
        inst_dash_title: "ダッシュボード", inst_dash_desc: "生産性グラフで進捗を確認できます。",
        inst_prog_title: "進捗とバッジ", inst_prog_desc: "タスクを完了するとXPを獲得。レベルアップしてバッジをアンロック！",
        inst_gestures_title: "ジェスチャー", inst_gestures_desc: "左右にスワイプしてページを切り替えられます。",
        goals: "目標", habits: "習慣", goals_tab: "目標", habits_tab: "習慣", add_goal: "目標を追加", add_habit: "習慣を追加", new_goal: "新しい目標", new_habit: "新しい習慣", today_habits: "今日の習慣", goals_subtitle: "未来へのマイルストーン。", habits_subtitle: "小さな一歩、大きな成果。", reflect: "振り返り", reflection: "振り返り", check_in: "チェックイン", save_goal: "目標を保存", save_habit: "習慣を保存",
        profile: "Profile",
        for_you: "For You",
        save_changes: "Save Changes",
        category_general: "General",
        not_enough_data: "Not enough data",
        tue: "火",
        wed: "水",
        thu: "木",
        fri: "金",
        sat: "土",
        sun: "日",
        jan: "Jan",
        feb: "Feb",
        mar: "Mar",
        apr: "Apr",
        may: "5月",
        jun: "Jun",
        jul: "Jul",
        aug: "Aug",
        sep: "Sep",
        oct: "Oct",
        nov: "Nov",
        dec: "Dec",
        january: "1月",
        february: "2月",
        march: "3月",
        april: "4月",
        june: "6月",
        july: "7月",
        august: "8月",
        september: "9月",
        october: "10月",
        november: "11月",
        december: "12月",
        rec_lvl10_title: "🏆 Level 10 Achieved",
        rec_lvl10_desc: "Reach Level 10 of personal productivity",
        rec_streak7_title: "🔥 7-Day Streak",
        rec_streak7_desc: "Maintain a 7-day streak",
        rec_streak30_title: "🔥 30-Day Streak",
        rec_streak30_desc: "Maintain a 30-day streak",
        rec_goal_title: "🎯 Goal Master",
        rec_goal_desc: "Complete 10 goals",
        rec_elite_title: "⭐ Elite Status",
        rec_elite_desc: "Reach Rank: Elite",
        rec_habit_title: "📅 Habit Builder",
        rec_habit_desc: "Create 5 habits",
        chal_tasks_title: "Complete 5 tasks today",
        chal_tasks_desc: "Push your limits",
        chal_streak_title: "Reach a 3 day streak",
        chal_streak_desc: "Consistency is key",
        future_placeholder: "Write a letter to your future self",
        future_dear: "Dear future me...",
        loading: "読み込み中...",
        consistency: "一貫性",
        opens_in: "後に開封",
        open_message: "メッセージを開く",
        message_archive: "メッセージアーカイブ",
        day_can_be_saved_body: "件のタスクが保留中。完了するたびにスコアを守れます。",
        day_can_be_saved: "まだ今日を取り戻せます",
        strong_day_body: "件のタスクを今日完了。トップのパフォーマンスです！",
        strong_day: "好調な一日",
        perfect_day_body: "今日すべてのタスクを完了しました。卓越した規律です！",
        perfect_day: "完璧な一日！ ⭐",
        trust_declining_body2: "ポイント低下しました。期限内にタスクを完了することに集中しましょう。",
        trust_declining_body: "スコアが今週",
        trust_declining: "信頼スコア低下中",
        trust_rising_body2: "ポイント向上しました。この調子で！",
        trust_rising_body: "先週と比べてスコアが",
        trust_rising: "信頼スコア上昇中 📈",
        streak_7_body: "素晴らしい一貫性。あなたの連続記録はトップクラスです — 守り続けましょう！",
        streak_3_body_2: "日で1週間連続達成。勢いを維持しています！",
        streak_3_body_1: "あと",
        day_streak: "日連続",
        tasks_lbl: "タスク",
        days_left: "日残り",
        overdue: "期限超過",
        at_risk: "リスクあり",
        on_track: "順調",
        gentle_nudge: "優しいリマインダー",
        habit_reminder: "習慣リマインダー",
        tasks_for: "のタスク",
        empty_task_desc: "最初のタスクを作成して、整理された状態を保ちましょう。",
        empty_goal_desc: "最初の目標を作成して、長期的な進捗を追跡しましょう。",
        empty_habit_desc: "最初の習慣を作成して、一貫性を築きましょう。",
        achieved_failed: "Achieved / Failed",
        achieved: "Achieved",
        failed_status: "Failed",
        longest_streak: "Longest Streak",
        highest_xp: "Highest XP Achieved",
        max_tasks_day: "Max Tasks In A Day",
        tasks_word: "タスク",
        goals_word: "目標",
        ms_first_step: "First Step",
        ms_first_step_desc: "Complete your first task",
        ms_goal_setter: "Goal Setter",
        ms_goal_setter_desc: "Set your very first goal",
        ms_lvl10: "Level 10 Achieved",
        ms_lvl10_desc: "Reach Level 10 of personal productivity",
        ms_trust_builder: "Trust Builder",
        ms_trust_builder_desc: "Raise self trust score above 50",
        ms_discipline_elite: "Discipline Elite",
        ms_discipline_elite_desc: "Reach Level 25 or achieve elite trust levels",
        ms_legendary: "Legendary Achiever",
        ms_legendary_desc: "Complete 100 tasks and reach level 50",
        locked: "Locked",
        unlocked_status: "Unlocked",
        weekly_perf_card: "Weekly Performance Card",
        weekly_perf_desc: "Auto-generated weekly activity stats",
        monthly_perf_card: "Monthly Performance Review",
        monthly_perf_desc: "Detailed performance metrics review",
        weekly_progress_tab: "Weekly Progress",
        tasks_done: "Tasks Done",
        goals_done: "Goals Done",
        streak_health: "Streak Health",
        trust_growth: "Trust Growth",
        xp_rank_level: "XP Rank Level",
        trust_consistency: "Trust Consistency",
        chal_summer_sprint: "Summer Sprint",
        chal_summer_desc: "Complete 10 tasks to claim a massive boost.",
        chal_30day: "30 Day Consistency",
        chal_30day_desc: "Maintain a streak of 30 days.",
        in_progress: "In Progress",
        xp_reward_500: "+500 XP Reward",
        xp_reward_1500: "+1500 XP Reward",
        sent: "Sent",
        ready: "Ready",
        opened: "Opened",
        no_messages_yet: "No messages yet. Write your first one above!",
        ready_to_open: "Ready to Open!",
        fs_promise: "🤝 Promise",
        fs_prediction: "🔮 Prediction",
        fs_reminder: "🔔 Reminder",
        fs_motivational: "💪 Motivational",
        no_achievements: "No achievements yet",
        for_you_default_body: "Keep completing tasks to unlock personalized guidance",
        profile_updated: "Profile updated",
        profile_update_failed: "Failed to update profile",
        profile_link_copied: "Profile link copied!",
        insight_start_streak: "Start Your Streak",
        insight_start_streak_body: "Complete a task today to ignite your streak. Consistency is the foundation of trust.",
        levels_to_rank: "Levels to Rank Up",
        reach_level: "Reach Level",
        to_unlock: "to unlock the",
        rank_push: "rank. Push for it!",
        tasks_to_milestone: "Tasks to Milestone",
        complete: "Complete",
        more_tasks_milestone: "more tasks to reach the milestone of",
        create_task: "タスク作成",
        create_goal: "目標作成",
        create_habit: "習慣作成",
        pressure_low: "低プレッシャー",
        pressure_high: "高モメンタム",
        pressure_balanced: "バランス",
        message_title: "メッセージのタイトル",
        write_message: "メッセージを書いてください...",
        mon: "月",
        tagline: "計画。実行。完了。",
        todays_insights: "今日のインサイト",
        tasks_30d: "タスク (30日)",
        limited_time: "期間限定",
        goal_analytics: "目標分析",
        mastery_progress: "習熟の進捗",
        goal_rate: "目標達成率",
        view_goals_history: "目標の履歴を見る",
        write_future: "未来へ書く",
        total_xp: "合計 XP",
        loading_achievements: "実績を読み込み中...",
        trust_desc: "信頼スコアは一貫性を決定します。",
        send_message_future: "未来へメッセージを送る",
        analyzing_patterns: "パターンを分析中...",
        future_self: "未来の自分",
        weekly_trend: "週間トレンド",
        send_future: "未来へ送信",
        your_analytics: "あなたの分析",
        view_tasks_history: "タスクの履歴を見る",
        avg_completion_time: "平均完了時間",
        personal_records: "自己記録",
        link_to_goal: "目標にリンク",
        calculating: "計算中...",
        weekly_summary: "週間まとめ",
        best_day: "最高の日",
        no_goals_yet: "目標はまだありません",
        no_habits_yet: "習慣はまだありません",
        no_tasks_yet: "タスクはまだありません",
        goal_word: "目標",
        boost: "ブースト",
        no_habits_today: "今日の習慣はありません。",
        average: "平均",
        xp_boost: "XPブースト",
        tasks_subtitle: "アクティブなタスク",
        full_report: "フルレポート",
        weekly_report: "週間レポート",
    },
    zh: {
        app_title: "托贝多内",
        login: "登录", signup: "注册", continue_with_google: "使用Google继续", or: "或",
        username_email: "用户名或邮箱", username: "用户名", password: "密码", forgot_password: "忘记密码？",
        forgot_password_note: "输入您的邮箱以获取重置链接。", send_reset_link: "发送链接",
        back_to_login: "返回登录", verify_email_title: "验证邮箱", verify_email_body: "请检查您的收件箱。",
        verification_code: "验证码", verify_code: "验证", reset_code: "重置代码", use_code: "使用",
        resend_verification: "重新发送", reset_password_title: "新密码", new_password: "新密码",
        confirm_password: "确认密码", update_password: "更新", full_name: "全名", email: "邮箱",
        change_name: "更改姓名", change_username: "更改用户名", create_account: "创建账号",
        dashboard: "仪表盘", reports: "报告", me: "我", tasks: "任务", insights: "统计",
        progress: "进度", settings: "设置", logout: "登出",
        trust_score: "信任分", streak: "连续", success: "成功", daily_progress: "每日进度",
        statistics: "统计", task_distribution: "任务分布",
        add_new_task: "新任务", new_task: "新任务", task_placeholder: "要做什么？",
        category: "分类", difficulty: "难度", easy: "简单", medium: "中等", hard: "困难",
        cancel: "取消", add_task: "添加", priority: "优先级", low: "低", high: "高",
        recurring: "重复", none: "无", daily: "每天", weekly: "每周",
        due_date: "截止日期", overdue: "逾期", all: "全部", filter_by: "筛选",
        productive_day: "最高效日", productive_hour: "最高效时间",
        trends: "趋势", failure_patterns: "失败模式", achievements: "成就",
        well_done: "干得好！", keep_going: "继续保持！", streak_saved: "连续未断！", multiplier: "{value}x 提升",
        active: "积极的",
        archived: "已存档",
        excellent: "出色的",
        good: "好的",
        current_streak: "当前连胜",
        best_streak: "最佳连胜纪录",
        total_tasks: "任务总数",
        total_goals: "总目标",
        total_habits: "总习惯",
        weekly_progress: "每周进度",
        monthly_progress: "每月进度",
        completion_rate: "完成率",
        productivity_score: "生产力得分",
        achievement_unlocked: "解锁成就",
        rank_progress: "排名进展",
        ach_first_step: "第一步",
        ach_goal_hunter: "目标猎人",
        ach_marathon: "马拉松",
        ach_legend: "传奇",
        ach_elite_consistency: "精英一致性",
        rank_starter: "起动机",
        rank_builder: "建设者",
        rank_achiever: "成就者",
        rank_consistent: "持续的",
        rank_elite: "精英",
        rank_legend: "传奇",
        rank_explorer: "探险家",
        rank_master: "掌握",
        rank_grandmaster: "棋圣",
        notif_task_completed: "任务完成",
        notif_goal_completed: "目标完成",
        notif_achievement_unlocked: "解锁成就",
        notif_trust_score_increased: "信任分数增加",
        notif_level_up: "升级",
        search_placeholder: "搜索...",
        enter_task_name: "输入任务名称...",
        select_goal: "选择目标...",
        select_habit: "选择习惯...",
        description: "描述...",
        reports_tab: "报告",
        insights_tab: "见解",
        progress_tab: "进步",
        me_tab: "我",
        dashboard_tab: "仪表板",
        chart_labels: "图表标签",
        statistics_lbl: "统计数据",
        analytics_text: "分析",
        progress_descriptions: "进度说明",
        recommendations: "建议",
        smart_insights: "智能洞察",
        trust_score_changed: "Trust Score changed: {value}",
        goal_link: "目标链接",
        habit_link: "习惯链接",
        start: "开始",
        finish: "结束",
        goal_type: "目标类型",
        deadline: "最后期限",
        custom_deadline: "定制期限",
        create_goal: "创建目标",
        preferred_time: "首选时间",
        frequency: "频率",
        days: "天",
        create_habit: "养成习惯",
        goal_reflection: "目标反思",
        what_went_well: "什么进展顺利？",
        what_didnt_go_well: "什么事情进展不顺利？",
        skip: "跳过",
        save_reflection: "保存反射",
        share_progress: "分享您的进步",
        download: "下载",
        copy_text: "复制文本",
        share: "分享",
        profile_link: "个人资料链接",
        close: "关闭",
        adjust_profile_photo: "调整个人资料照片",
        crop_save: "裁剪并保存",
        focus_today: "专注于今天重要的事情。",
        today_short: "今天（短篇）",
        tomorrow_short: "明天（短篇）",
        one_three_days: "1-3天（短时）",
        one_week_med: "1 周（中等长度）",
        two_weeks_med: "1-2 周（中等长度）",
        one_month_med: "1个月（中等长度）",
        three_months_long: "3个月（长）",
        six_months_long: "6个月（长）",
        one_year_long: "1年（长）",
        one_year_plus: "1年+（长）",
        tomorrow: "明天",
        one_week: "1周",
        one_month: "1个月",
        custom_date: "定制日期",
        specific_days: "特定日期",
        no_link: "无链接",
        select_a_goal: "选择一个目标...",
        select_a_habit: "选择一个习惯...",
        what_worked: "告诉我们什么有效...",
        what_improved: "有什么可以改进的地方...",
        search_achievements: "搜索成就...",
        goal_title: "目标标题",
        habit_title: "习惯标题",
        level: "等级",
        xp_lbl: "XP",
        streak_lbl: "条纹",
        completed_tasks: "已完成的任务",
        goals_achieved: "实现的目标",
        trust_low: "低的",
        trust_average: "平均的",
        trust_good: "好的",
        trust_excellent: "出色的",
        rank_permanent: "永久等级制度",
        self_trust_score: "自信心得分",
        success_rate: "成功率",
        rank: "秩",
        xp: "XP",
        analytics: "分析",
        records: "记录",
        milestones: "里程碑",
        challenges: "挑战",
        history: "历史",
        calendar_labels: "日历标签",
        failed: "失败的",
        next_level: "下一级别",
        search: "搜索...",
        common: "常见的",
        rare: "稀有的",
        epic: "史诗",
        legendary: "传奇",
        ach_first_step_desc: "完成第一个任务。",
        ach_productive_day: "富有成效的一天",
        ach_productive_day_desc: "一天内完成 5 项任务。",
        ach_task_machine: "任务机",
        ach_task_machine_desc: "完成 25 项任务。",
        ach_task_master: "任务大师",
        ach_task_master_desc: "完成 100 项任务。",
        ach_completion_expert: "竣工专家",
        ach_completion_expert_desc: "完成 500 项任务。",
        ach_perfection_day: "完美日",
        ach_perfection_day_desc: "完成一天安排的每一项任务。",
        ach_zero_miss_day: "零失误日",
        ach_zero_miss_day_desc: "完成一天，没有失败的任务。",
        ach_goal_setter: "目标制定者",
        ach_goal_setter_desc: "创建第一个目标。",
        ach_goal_hunter_desc: "完成第一个目标。",
        ach_focused: "专注",
        ach_focused_desc: "完成 5 个目标。",
        ach_visionary: "有远见",
        ach_visionary_desc: "完成 20 个目标。",
        ach_unstoppable: "势不可挡",
        ach_unstoppable_desc: "完成一个长期目标。",
        ach_habit_beginner: "习惯初学者",
        ach_habit_beginner_desc: "养成第一个习惯。",
        ach_consistent: "持续的",
        ach_consistent_desc: "保持 7 天连续习惯。",
        ach_dedicated: "投入的",
        ach_dedicated_desc: "保持 30 天的连续习惯。",
        ach_ritual_master: "仪式大师",
        ach_ritual_master_desc: "保持100天的连续习惯。",
        ach_habit_collector: "习惯收集器",
        ach_habit_collector_desc: "有10个积极的习惯。",
        ach_streak_3: "连续 3 天",
        ach_streak_3_desc: "达到 3 天连续。",
        ach_streak_7: "连续 7 天",
        ach_streak_7_desc: "达到 7 天连续。",
        ach_streak_14: "连续 14 天",
        ach_streak_14_desc: "达到 14 天连续。",
        ach_streak_30: "连续 30 天",
        ach_streak_30_desc: "达到 30 天连续。",
        ach_streak_50: "连续 50 天",
        ach_streak_50_desc: "达到 50 天连续。",
        ach_streak_100: "连续 100 天",
        ach_streak_100_desc: "达到 100 天连续。",
        ach_comeback_king: "复出之王",
        ach_comeback_king_desc: "连败后恢复。",
        ach_average_citizen: "普通公民",
        ach_average_citizen_desc: "达到信任26。",
        ach_reliable: "可靠的",
        ach_reliable_desc: "达到信任51。",
        ach_excellent: "出色的",
        ach_excellent_desc: "达到信任76。",
        ach_trusted: "值得信赖",
        ach_trusted_desc: "保持信任度 75+ 30 天。",
        ach_iron_discipline: "铁的纪律",
        ach_iron_discipline_desc: "保持信任度 90+ 30 天。",
        ach_elite_consistency_desc: "信任度达到 100。",
        ach_level_5: "5级",
        ach_level_5_desc: "达到 5 级。",
        ach_level_10: "10级",
        ach_level_10_desc: "达到 10 级。",
        ach_level_25: "25级",
        ach_level_25_desc: "达到 25 级。",
        ach_level_50: "50级",
        ach_level_50_desc: "达到 50 级。",
        ach_level_100: "100级",
        ach_level_100_desc: "达到 100 级。",
        ach_veteran: "老将",
        ach_veteran_desc: "总共赚取 10000 XP。",
        ach_active_week: "活跃周",
        ach_active_week_desc: "连续使用该应用程序 7 天。",
        ach_active_month: "活跃月",
        ach_active_month_desc: "连续使用该应用程序 30 天。",
        ach_weekend_warrior: "周末勇士",
        ach_weekend_warrior_desc: "周六和周日完成任务。",
        ach_perfect_week: "完美的一周",
        ach_perfect_week_desc: "完成一周，没有失败的任务。",
        ach_night_owl: "猫头鹰",
        ach_night_owl_desc: "23:00后完成50个任务。",
        ach_early_bird: "早鸟",
        ach_early_bird_desc: "08:00前完成50个任务。",
        ach_recovery_mode: "恢复模式",
        ach_recovery_mode_desc: "将信任度从 25 以下提高到 50 以上。",
        ach_redemption_arc: "救赎弧",
        ach_redemption_arc_desc: "将信任度从 25 以下提高到 75 以上。",
        ach_marathon_desc: "完成 1000 项任务。",
        ach_one_year_strong: "一年强",
        ach_one_year_strong_desc: "365 天保持活跃。",
        ach_century_streak: "世纪连胜",
        ach_century_streak_desc: "达到 100 天连续。",
        ach_goal_legend: "进球传奇",
        ach_goal_legend_desc: "完成 100 个目标。",
        ach_habit_legend: "习惯传说",
        ach_habit_legend_desc: "达到 365 天的连续习惯。",
        ach_tobedone_legend: "托贝多尼传奇",
        ach_tobedone_legend_desc: "解锁所有成就的 80%。",
        goal_link: "目标链接",
        habit_link: "习惯链接",
        start: "开始",
        finish: "结束",
        goal_type: "目标类型",
        deadline: "最后期限",
        custom_deadline: "定制期限",
        create_goal: "创建目标",
        preferred_time: "首选时间",
        frequency: "频率",
        days: "天",
        create_habit: "养成习惯",
        goal_reflection: "目标反思",
        what_went_well: "什么进展顺利？",
        what_didnt_go_well: "什么事情进展不顺利？",
        skip: "跳过",
        save_reflection: "保存反射",
        share_progress: "分享您的进步",
        download: "下载",
        copy_text: "复制文本",
        share: "分享",
        profile_link: "个人资料链接",
        close: "关闭",
        adjust_profile_photo: "调整个人资料照片",
        crop_save: "裁剪并保存",
        focus_today: "专注于今天重要的事情。",
        today_short: "今天（短篇）",
        tomorrow_short: "明天（短篇）",
        one_three_days: "1-3天（短时）",
        one_week_med: "1 周（中等长度）",
        two_weeks_med: "1-2 周（中等长度）",
        one_month_med: "1个月（中等长度）",
        three_months_long: "3个月（长）",
        six_months_long: "6个月（长）",
        one_year_long: "1年（长）",
        one_year_plus: "1年+（长）",
        tomorrow: "明天",
        one_week: "1周",
        one_month: "1个月",
        custom_date: "定制日期",
        specific_days: "特定日期",
        no_link: "无链接",
        select_a_goal: "选择一个目标...",
        select_a_habit: "选择一个习惯...",
        what_worked: "告诉我们什么有效...",
        what_improved: "有什么可以改进的地方...",
        search_achievements: "搜索成就...",
        goal_title: "目标标题",
        habit_title: "习惯标题",
        level: "等级",
        xp_lbl: "XP",
        streak_lbl: "条纹",
        completed_tasks: "已完成的任务",
        goals_achieved: "实现的目标",
        task_completed: "任务完成",
        goal_completed: "目标完成",
        trust_low: "低的",
        trust_average: "平均的",
        trust_good: "好的",
        trust_excellent: "出色的",
        rank_permanent: "永久等级制度",
        trust_score_increased: "信任分数增加",
        level_up: "升级",
    multiplier: "{value}x 奖励",
        tasks_count: "今天 {count} 个任务", smart_suggestion: "智能建议",
        best_time_to_create: "您现在非常活跃！是规划任务的好时机。",
        suggest_simpler: "这个任务似乎很复杂，要拆分吗？",
        high_risk: "根据您的历史，失败风险较高。",
        optimal_time: "最佳完成时间：", most_productive_day: "最高效的一天：",
        most_productive_hour: "最高效的时间：", failure_pattern: "在以下分类中较难完成：",
        theme: "主题", toggle_dark: "夜间模式", language: "语言",
        app_info: "应用信息", version: "版本", completed: "已完成", failed: "失败", pending: "待处理",
        no_tasks: "今天没有任务！", session_expired: "会话已过期",
        task_added: "任务已添加！", task_updated: "任务已更新！", error_occurred: "发生错误",
        calendar: "日历", date: "日期", time: "时间", reminder: "提醒",
        view_habits_history: "习惯历史", instructions_btn: "使用说明",
        force_update: "强制更新", install_app: "安装应用", got_it: "明白了",
        inst_title: "使用说明", inst_subtitle: "关于 Tobedone 的一切",
        inst_tasks_title: "任务", inst_tasks_desc: "点击"+"创建任务。设置优先级和分类。点击圆圈完成任务并获得积分！",
        inst_dash_title: "仪表盘", inst_dash_desc: "通过图表查看您的生产力进度。",
        inst_prog_title: "进度与徽章", inst_prog_desc: "完成任务获取XP，升级并解锁收藏徽章！",
        inst_gestures_title: "手势", inst_gestures_desc: "左右滑动可以快速切换应用页面。",
        goals: "目标", habits: "习惯", goals_tab: "目标", habits_tab: "习惯", add_goal: "添加目标", add_habit: "添加习惯", new_goal: "新目标", new_habit: "新习惯", today_habits: "今日习惯", goals_subtitle: "未来的里程碑。", habits_subtitle: "每天一小步，成就一大步。", reflect: "反思", reflection: "反思", check_in: "打卡", save_goal: "保存目标", save_habit: "保存习惯",
        profile: "Profile",
        for_you: "For You",
        save_changes: "Save Changes",
        category_general: "General",
        not_enough_data: "Not enough data",
        tue: "周二",
        wed: "周三",
        thu: "周四",
        fri: "周五",
        sat: "周六",
        sun: "周日",
        jan: "Jan",
        feb: "Feb",
        mar: "Mar",
        apr: "Apr",
        may: "五月",
        jun: "Jun",
        jul: "Jul",
        aug: "Aug",
        sep: "Sep",
        oct: "Oct",
        nov: "Nov",
        dec: "Dec",
        january: "一月",
        february: "二月",
        march: "三月",
        april: "四月",
        june: "六月",
        july: "七月",
        august: "八月",
        september: "九月",
        october: "十月",
        november: "十一月",
        december: "十二月",
        rec_lvl10_title: "🏆 Level 10 Achieved",
        rec_lvl10_desc: "Reach Level 10 of personal productivity",
        rec_streak7_title: "🔥 7-Day Streak",
        rec_streak7_desc: "Maintain a 7-day streak",
        rec_streak30_title: "🔥 30-Day Streak",
        rec_streak30_desc: "Maintain a 30-day streak",
        rec_goal_title: "🎯 Goal Master",
        rec_goal_desc: "Complete 10 goals",
        rec_elite_title: "⭐ Elite Status",
        rec_elite_desc: "Reach Rank: Elite",
        rec_habit_title: "📅 Habit Builder",
        rec_habit_desc: "Create 5 habits",
        chal_tasks_title: "Complete 5 tasks today",
        chal_tasks_desc: "Push your limits",
        chal_streak_title: "Reach a 3 day streak",
        chal_streak_desc: "Consistency is key",
        future_placeholder: "Write a letter to your future self",
        future_dear: "Dear future me...",
        loading: "加载中...",
        consistency: "一致性",
        opens_in: "将在",
        open_message: "打开消息",
        message_archive: "消息存档",
        day_can_be_saved_body: "个任务待完成。每次完成都有助于保护您的分数。",
        day_can_be_saved: "今天还可以挽救",
        strong_day_body: "个任务已完成。您处于今日表现的顶级！",
        strong_day: "强大的一天",
        perfect_day_body: "今天您完成了每项任务。卓越的纪律！",
        perfect_day: "完美的一天！ ⭐",
        trust_declining_body2: "分。专注于按时完成任务。",
        trust_declining_body: "本周您的分数下降了",
        trust_declining: "信任分下降",
        trust_rising_body2: "分。继续保持！",
        trust_rising_body: "您的分数比上周提高了",
        trust_rising: "信任分上升 📈",
        streak_7_body: "惊人的一致性。您的连续记录名列前茅 — 保护它！",
        streak_3_body_2: "天即可达到1周连续。您正在积累动力！",
        streak_3_body_1: "还需",
        day_streak: "天连续",
        tasks_lbl: "任务",
        days_left: "天剩余",
        overdue: "已逾期",
        at_risk: "有风险",
        on_track: "按计划进行",
        gentle_nudge: "温和提醒",
        habit_reminder: "习惯提醒",
        tasks_for: "的任务",
        empty_task_desc: "创建您的第一个任务以保持井井有条和高效。",
        empty_goal_desc: "创建您的第一个目标以跟踪长期进度。",
        empty_habit_desc: "通过您的第一个日常习惯建立一致性。",
        achieved_failed: "Achieved / Failed",
        achieved: "Achieved",
        failed_status: "Failed",
        longest_streak: "Longest Streak",
        highest_xp: "Highest XP Achieved",
        max_tasks_day: "Max Tasks In A Day",
        tasks_word: "任务",
        goals_word: "目标",
        ms_first_step: "First Step",
        ms_first_step_desc: "Complete your first task",
        ms_goal_setter: "Goal Setter",
        ms_goal_setter_desc: "Set your very first goal",
        ms_lvl10: "Level 10 Achieved",
        ms_lvl10_desc: "Reach Level 10 of personal productivity",
        ms_trust_builder: "Trust Builder",
        ms_trust_builder_desc: "Raise self trust score above 50",
        ms_discipline_elite: "Discipline Elite",
        ms_discipline_elite_desc: "Reach Level 25 or achieve elite trust levels",
        ms_legendary: "Legendary Achiever",
        ms_legendary_desc: "Complete 100 tasks and reach level 50",
        locked: "Locked",
        unlocked_status: "Unlocked",
        weekly_perf_card: "Weekly Performance Card",
        weekly_perf_desc: "Auto-generated weekly activity stats",
        monthly_perf_card: "Monthly Performance Review",
        monthly_perf_desc: "Detailed performance metrics review",
        weekly_progress_tab: "Weekly Progress",
        tasks_done: "Tasks Done",
        goals_done: "Goals Done",
        streak_health: "Streak Health",
        trust_growth: "Trust Growth",
        xp_rank_level: "XP Rank Level",
        trust_consistency: "Trust Consistency",
        chal_summer_sprint: "Summer Sprint",
        chal_summer_desc: "Complete 10 tasks to claim a massive boost.",
        chal_30day: "30 Day Consistency",
        chal_30day_desc: "Maintain a streak of 30 days.",
        in_progress: "In Progress",
        xp_reward_500: "+500 XP Reward",
        xp_reward_1500: "+1500 XP Reward",
        sent: "Sent",
        ready: "Ready",
        opened: "Opened",
        no_messages_yet: "No messages yet. Write your first one above!",
        ready_to_open: "Ready to Open!",
        fs_promise: "🤝 Promise",
        fs_prediction: "🔮 Prediction",
        fs_reminder: "🔔 Reminder",
        fs_motivational: "💪 Motivational",
        no_achievements: "No achievements yet",
        for_you_default_body: "Keep completing tasks to unlock personalized guidance",
        profile_updated: "Profile updated",
        profile_update_failed: "Failed to update profile",
        profile_link_copied: "Profile link copied!",
        insight_start_streak: "Start Your Streak",
        insight_start_streak_body: "Complete a task today to ignite your streak. Consistency is the foundation of trust.",
        levels_to_rank: "Levels to Rank Up",
        reach_level: "Reach Level",
        to_unlock: "to unlock the",
        rank_push: "rank. Push for it!",
        tasks_to_milestone: "Tasks to Milestone",
        complete: "Complete",
        more_tasks_milestone: "more tasks to reach the milestone of",
        create_task: "创建任务",
        create_goal: "创建目标",
        create_habit: "创建习惯",
        pressure_low: "低压力",
        pressure_high: "高动力",
        pressure_balanced: "平衡",
        message_title: "消息标题",
        write_message: "写下您的消息...",
        mon: "周一",
        tagline: "计划。执行。完成。",
        todays_insights: "今日见解",
        tasks_30d: "任务 (30天)",
        limited_time: "限时",
        goal_analytics: "目标分析",
        mastery_progress: "掌握进度",
        goal_rate: "目标率",
        view_goals_history: "查看目标历史",
        write_future: "写给未来",
        total_xp: "总 XP",
        loading_achievements: "加载成就中...",
        trust_desc: "信任分决定一致性。",
        send_message_future: "发送消息给未来",
        analyzing_patterns: "分析模式...",
        future_self: "未来的自己",
        weekly_trend: "每周趋势",
        send_future: "发送到未来",
        your_analytics: "您的分析",
        view_tasks_history: "查看任务历史",
        avg_completion_time: "平均完成时间",
        personal_records: "个人记录",
        link_to_goal: "链接到目标",
        calculating: "计算中...",
        weekly_summary: "每周总结",
        best_day: "最佳日子",
        no_goals_yet: "暂无目标",
        no_habits_yet: "暂无习惯",
        no_tasks_yet: "暂无任务",
        goal_word: "目标",
        boost: "提升",
        no_habits_today: "今天没有安排习惯。",
        average: "平均",
        xp_boost: "XP加成",
        tasks_subtitle: "您的活跃任务",
        full_report: "完整报告",
        weekly_report: "每周报告",
    },
    ar: {
        app_title: "توبيدون",
        login: "تسجيل الدخول", signup: "إنشاء حساب", continue_with_google: "المتابعة باستخدام Google", or: "أو",
        username_email: "اسم المستخدم أو البريد", username: "اسم المستخدم", password: "كلمة المرور", forgot_password: "هل نسيت كلمة المرور؟",
        forgot_password_note: "أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين.", send_reset_link: "إرسال الرابط",
        back_to_login: "العودة لتسجيل الدخول", verify_email_title: "تأكيد البريد الإلكتروني", verify_email_body: "تحقق من صندوق الوارد.",
        verification_code: "رمز التحقق", verify_code: "تأكيد", reset_code: "رمز إعادة التعيين", use_code: "استخدام",
        resend_verification: "إعادة الإرسال", reset_password_title: "كلمة مرور جديدة", new_password: "كلمة مرور جديدة",
        confirm_password: "تأكيد كلمة المرور", update_password: "تحديث", full_name: "الاسم الكامل", email: "البريد الإلكتروني",
        change_name: "تغيير الاسم", change_username: "تغيير اسم المستخدم", create_account: "إنشاء حساب",
        dashboard: "لوحة التحكم", reports: "التقارير", me: "ملفي", tasks: "المهام", insights: "الإحصائيات",
        progress: "التقدم", settings: "الإعدادات", logout: "تسجيل الخروج",
        trust_score: "درجة الثقة", streak: "سلسلة الإنجازات", success: "النجاح", daily_progress: "التقدم اليومي",
        statistics: "الإحصائيات", task_distribution: "توزيع المهام",
        add_new_task: "إضافة مهمة", new_task: "مهمة جديدة", task_placeholder: "ما الذي يجب فعله؟",
        category: "الفئة", difficulty: "الصعوبة", easy: "سهل", medium: "متوسط", hard: "صعب",
        cancel: "إلغاء", add_task: "إضافة", priority: "الأولوية", low: "منخفض", high: "مرتفع",
        recurring: "متكرر", none: "لا شيء", daily: "يومياً", weekly: "أسبوعياً",
        due_date: "تاريخ الاستحقاق", overdue: "متأخر", all: "الكل", filter_by: "تصفية حسب",
        productive_day: "اليوم الأكثر إنتاجية", productive_hour: "الساعة الأكثر إنتاجية",
        trends: "الاتجاهات", failure_patterns: "أنماط الفشل", achievements: "الإنجازات",
        well_done: "أحسنت!", keep_going: "استمر!", streak_saved: "تم الحفاظ على السلسلة!", multiplier: "{القيمة} × التعزيز",
        active: "نشيط",
        archived: "مؤرشف",
        excellent: "ممتاز",
        good: "جيد",
        current_streak: "الخط الحالي",
        best_streak: "أفضل خط",
        total_tasks: "إجمالي المهام",
        total_goals: "مجموع الأهداف",
        total_habits: "مجموع العادات",
        weekly_progress: "التقدم الأسبوعي",
        monthly_progress: "التقدم الشهري",
        completion_rate: "معدل الإنجاز",
        productivity_score: "نقاط الإنتاجية",
        achievement_unlocked: "الإنجاز مفتوح",
        rank_progress: "تقدم الرتبة",
        ach_first_step: "الخطوة الأولى",
        ach_goal_hunter: "صياد الهدف",
        ach_marathon: "ماراثون",
        ach_legend: "أسطورة",
        ach_elite_consistency: "اتساق النخبة",
        rank_starter: "بداية",
        rank_builder: "منشئ",
        rank_achiever: "المنجز",
        rank_consistent: "ثابت",
        rank_elite: "نخبة",
        rank_legend: "أسطورة",
        rank_explorer: "إكسبلورر",
        rank_master: "يتقن",
        rank_grandmaster: "غراند ماستر",
        notif_task_completed: "اكتملت المهمة",
        notif_goal_completed: "الهدف مكتمل",
        notif_achievement_unlocked: "الإنجاز مفتوح",
        notif_trust_score_increased: "زيادة نقاط الثقة",
        notif_level_up: "المستوى الأعلى",
        search_placeholder: "يبحث...",
        enter_task_name: "أدخل اسم المهمة...",
        select_goal: "حدد الهدف...",
        select_habit: "اختر العادة...",
        description: "وصف...",
        reports_tab: "التقارير",
        insights_tab: "رؤى",
        progress_tab: "تقدم",
        me_tab: "أنا",
        dashboard_tab: "لوحة القيادة",
        chart_labels: "تسميات الرسم البياني",
        statistics_lbl: "إحصائيات",
        analytics_text: "التحليلات",
        progress_descriptions: "أوصاف التقدم",
        recommendations: "التوصيات",
        smart_insights: "رؤى ذكية",
        trust_score_changed: "Trust Score changed: {value}",
        goal_link: "رابط الهدف",
        habit_link: "رابط العادة",
        start: "يبدأ",
        finish: "ينهي",
        goal_type: "نوع الهدف",
        deadline: "موعد التسليم",
        custom_deadline: "الموعد النهائي المخصص",
        create_goal: "إنشاء الهدف",
        preferred_time: "الوقت المفضل",
        frequency: "تكرار",
        days: "أيام",
        create_habit: "خلق العادة",
        goal_reflection: "انعكاس الهدف",
        what_went_well: "ما الذي سار على ما يرام؟",
        what_didnt_go_well: "ما الذي لم يسير على ما يرام؟",
        skip: "يتخطى",
        save_reflection: "حفظ الانعكاس",
        share_progress: "شارك تقدمك",
        download: "تحميل",
        copy_text: "نسخ النص",
        share: "يشارك",
        profile_link: "رابط الملف الشخصي",
        close: "يغلق",
        adjust_profile_photo: "ضبط صورة الملف الشخصي",
        crop_save: "اقتصاص وحفظ",
        focus_today: "ركز على ما يهم اليوم.",
        today_short: "اليوم (طول قصير)",
        tomorrow_short: "غدا (قصيرة الطول)",
        one_three_days: "1-3 أيام (طول قصير)",
        one_week_med: "أسبوع واحد (متوسط ​​الطول)",
        two_weeks_med: "1-2 أسابيع (متوسطة الطول)",
        one_month_med: "شهر واحد (متوسط ​​الطول)",
        three_months_long: "3 أشهر (طول طويل)",
        six_months_long: "6 أشهر (طول طويل)",
        one_year_long: "1 سنة (طول طويل)",
        one_year_plus: "سنة فما فوق (طويلة)",
        tomorrow: "غداً",
        one_week: "1 أسبوع",
        one_month: "1 شهر",
        custom_date: "تاريخ مخصص",
        specific_days: "أيام محددة",
        no_link: "لا يوجد رابط",
        select_a_goal: "حدد هدفا...",
        select_a_habit: "اختر العادة...",
        what_worked: "أخبرنا بما نجح..",
        what_improved: "ما الذي يمكن تحسينه...",
        search_achievements: "إنجازات البحث...",
        goal_title: "عنوان الهدف",
        habit_title: "عنوان العادة",
        level: "مستوى",
        xp_lbl: "XP",
        streak_lbl: "أثَر",
        completed_tasks: "المهام المكتملة",
        goals_achieved: "الأهداف التي تم تحقيقها",
        trust_low: "قليل",
        trust_average: "متوسط",
        trust_good: "جيد",
        trust_excellent: "ممتاز",
        rank_permanent: "نظام التصنيف الدائم",
        self_trust_score: "نقاط الثقة بالنفس",
        success_rate: "معدل النجاح",
        rank: "رتبة",
        xp: "XP",
        analytics: "التحليلات",
        records: "السجلات",
        milestones: "المعالم",
        challenges: "التحديات",
        history: "تاريخ",
        calendar_labels: "تسميات التقويم",
        failed: "فشل",
        next_level: "المستوى التالي",
        search: "يبحث...",
        common: "شائع",
        rare: "نادر",
        epic: "ملحمي",
        legendary: "الأسطوري",
        ach_first_step_desc: "أكمل المهمة الأولى.",
        ach_productive_day: "يوم إنتاجي",
        ach_productive_day_desc: "أكمل 5 مهام في يوم واحد.",
        ach_task_machine: "آلة المهام",
        ach_task_machine_desc: "أكمل 25 مهمة.",
        ach_task_master: "سيد المهمة",
        ach_task_master_desc: "أكمل 100 مهمة.",
        ach_completion_expert: "خبير الإنجاز",
        ach_completion_expert_desc: "أكمل 500 مهمة.",
        ach_perfection_day: "يوم الكمال",
        ach_perfection_day_desc: "أكمل كل مهمة مجدولة ليوم واحد.",
        ach_zero_miss_day: "يوم ملكة جمال الصفر",
        ach_zero_miss_day_desc: "أنهِ يومًا دون أي مهام فاشلة.",
        ach_goal_setter: "محدد الأهداف",
        ach_goal_setter_desc: "صنع الهدف الأول.",
        ach_goal_hunter_desc: "أكمل الهدف الأول.",
        ach_focused: "ركز",
        ach_focused_desc: "أكمل 5 أهداف.",
        ach_visionary: "البصيرة",
        ach_visionary_desc: "أكمل 20 هدفا.",
        ach_unstoppable: "لا يمكن وقفها",
        ach_unstoppable_desc: "أكمل هدفًا طويل المدى.",
        ach_habit_beginner: "مبتدئ العادة",
        ach_habit_beginner_desc: "اصنع العادة الأولى.",
        ach_consistent: "ثابت",
        ach_consistent_desc: "الحفاظ على خط العادة لمدة 7 أيام.",
        ach_dedicated: "مخلص",
        ach_dedicated_desc: "حافظ على خط العادة لمدة 30 يومًا.",
        ach_ritual_master: "سيد الطقوس",
        ach_ritual_master_desc: "الحفاظ على خط العادة لمدة 100 يوم.",
        ach_habit_collector: "جامع العادة",
        ach_habit_collector_desc: "لديك 10 عادات نشطة.",
        ach_streak_3: "خط 3 أيام",
        ach_streak_3_desc: "الوصول إلى خط 3 أيام.",
        ach_streak_7: "خط 7 أيام",
        ach_streak_7_desc: "الوصول إلى خط 7 أيام.",
        ach_streak_14: "خط 14 يومًا",
        ach_streak_14_desc: "الوصول إلى خط 14 يومًا.",
        ach_streak_30: "خط 30 يومًا",
        ach_streak_30_desc: "الوصول إلى خط 30 يومًا.",
        ach_streak_50: "خط 50 يومًا",
        ach_streak_50_desc: "الوصول إلى خط 50 يومًا.",
        ach_streak_100: "خط 100 يوم",
        ach_streak_100_desc: "الوصول إلى خط 100 يوم.",
        ach_comeback_king: "عودة الملك",
        ach_comeback_king_desc: "التعافي بعد خسارة خط.",
        ach_average_citizen: "المواطن العادي",
        ach_average_citizen_desc: "الوصول إلى الثقة 26.",
        ach_reliable: "موثوق",
        ach_reliable_desc: "الوصول إلى الثقة 51.",
        ach_excellent: "ممتاز",
        ach_excellent_desc: "الوصول إلى الثقة 76.",
        ach_trusted: "موثوق به",
        ach_trusted_desc: "الحفاظ على الثقة 75+ لمدة 30 يومًا.",
        ach_iron_discipline: "الانضباط الحديدي",
        ach_iron_discipline_desc: "حافظ على الثقة 90+ لمدة 30 يومًا.",
        ach_elite_consistency_desc: "الوصول إلى الثقة 100.",
        ach_level_5: "المستوى 5",
        ach_level_5_desc: "الوصول إلى المستوى 5.",
        ach_level_10: "المستوى 10",
        ach_level_10_desc: "الوصول إلى المستوى 10.",
        ach_level_25: "المستوى 25",
        ach_level_25_desc: "الوصول إلى المستوى 25.",
        ach_level_50: "المستوى 50",
        ach_level_50_desc: "الوصول إلى المستوى 50.",
        ach_level_100: "المستوى 100",
        ach_level_100_desc: "الوصول إلى المستوى 100.",
        ach_veteran: "محارب قديم",
        ach_veteran_desc: "احصل على إجمالي 10000 XP.",
        ach_active_week: "أسبوع نشط",
        ach_active_week_desc: "استخدم التطبيق لمدة 7 أيام متتالية.",
        ach_active_month: "الشهر النشط",
        ach_active_month_desc: "استخدم التطبيق لمدة 30 يومًا متتالية.",
        ach_weekend_warrior: "محارب عطلة نهاية الأسبوع",
        ach_weekend_warrior_desc: "أكمل المهام خلال يومي السبت والأحد.",
        ach_perfect_week: "أسبوع مثالي",
        ach_perfect_week_desc: "أكمل أسبوعًا دون أي مهام فاشلة.",
        ach_night_owl: "بومة الليل",
        ach_night_owl_desc: "أكمل 50 مهمة بعد الساعة 23:00.",
        ach_early_bird: "الطائر المبكر",
        ach_early_bird_desc: "أكمل 50 مهمة قبل الساعة 08:00.",
        ach_recovery_mode: "وضع الاسترداد",
        ach_recovery_mode_desc: "رفع الثقة من أقل من 25 إلى أعلى من 50.",
        ach_redemption_arc: "قوس الفداء",
        ach_redemption_arc_desc: "رفع الثقة من أقل من 25 إلى أعلى من 75.",
        ach_marathon_desc: "أكمل 1000 مهمة.",
        ach_one_year_strong: "سنة واحدة قوية",
        ach_one_year_strong_desc: "تظل نشطة لمدة 365 يومًا.",
        ach_century_streak: "خط القرن",
        ach_century_streak_desc: "الوصول إلى خط 100 يوم.",
        ach_goal_legend: "أسطورة الهدف",
        ach_goal_legend_desc: "أكمل 100 هدف.",
        ach_habit_legend: "أسطورة العادة",
        ach_habit_legend_desc: "الوصول إلى خط العادة لمدة 365 يومًا.",
        ach_tobedone_legend: "أسطورة توبيدون",
        ach_tobedone_legend_desc: "فتح 80% من جميع الإنجازات.",
        goal_link: "رابط الهدف",
        habit_link: "رابط العادة",
        start: "يبدأ",
        finish: "ينهي",
        goal_type: "نوع الهدف",
        deadline: "موعد التسليم",
        custom_deadline: "الموعد النهائي المخصص",
        create_goal: "إنشاء الهدف",
        preferred_time: "الوقت المفضل",
        frequency: "تكرار",
        days: "أيام",
        create_habit: "خلق العادة",
        goal_reflection: "انعكاس الهدف",
        what_went_well: "ما الذي سار على ما يرام؟",
        what_didnt_go_well: "ما الذي لم يسير على ما يرام؟",
        skip: "يتخطى",
        save_reflection: "حفظ الانعكاس",
        share_progress: "شارك تقدمك",
        download: "تحميل",
        copy_text: "نسخ النص",
        share: "يشارك",
        profile_link: "رابط الملف الشخصي",
        close: "يغلق",
        adjust_profile_photo: "ضبط صورة الملف الشخصي",
        crop_save: "اقتصاص وحفظ",
        focus_today: "ركز على ما يهم اليوم.",
        today_short: "اليوم (طول قصير)",
        tomorrow_short: "غدا (قصيرة الطول)",
        one_three_days: "1-3 أيام (طول قصير)",
        one_week_med: "أسبوع واحد (متوسط ​​الطول)",
        two_weeks_med: "1-2 أسابيع (متوسطة الطول)",
        one_month_med: "شهر واحد (متوسط ​​الطول)",
        three_months_long: "3 أشهر (طول طويل)",
        six_months_long: "6 أشهر (طول طويل)",
        one_year_long: "1 سنة (طول طويل)",
        one_year_plus: "سنة فما فوق (طويلة)",
        tomorrow: "غداً",
        one_week: "1 أسبوع",
        one_month: "1 شهر",
        custom_date: "تاريخ مخصص",
        specific_days: "أيام محددة",
        no_link: "لا يوجد رابط",
        select_a_goal: "حدد هدفا...",
        select_a_habit: "اختر العادة...",
        what_worked: "أخبرنا بما نجح..",
        what_improved: "ما الذي يمكن تحسينه...",
        search_achievements: "إنجازات البحث...",
        goal_title: "عنوان الهدف",
        habit_title: "عنوان العادة",
        level: "مستوى",
        xp_lbl: "XP",
        streak_lbl: "أثَر",
        completed_tasks: "المهام المكتملة",
        goals_achieved: "الأهداف التي تم تحقيقها",
        task_completed: "اكتملت المهمة",
        goal_completed: "الهدف مكتمل",
        trust_low: "قليل",
        trust_average: "متوسط",
        trust_good: "جيد",
        trust_excellent: "ممتاز",
        rank_permanent: "نظام التصنيف الدائم",
        trust_score_increased: "زيادة نقاط الثقة",
        level_up: "المستوى الأعلى",
        multiplier: "{value}x مضاعف",
        tasks_count: "{count} مهام اليوم", smart_suggestion: "اقتراح ذكي",
        best_time_to_create: "أنت نشط جداً الآن! وقت رائع للتخطيط.",
        suggest_simpler: "هذه المهمة تبدو معقدة. هل تقسمها؟",
        high_risk: "خطر فشل مرتفع بناءً على سجلك.",
        optimal_time: "الوقت الأمثل: ", most_productive_day: "أكثر أيامك إنتاجية: ",
        most_productive_hour: "أكثر ساعاتك إنتاجية: ", failure_pattern: "تجد صعوبة في مهام فئة ",
        theme: "المظهر", toggle_dark: "الوضع الليلي", language: "اللغة",
        app_info: "معلومات التطبيق", version: "الإصدار", completed: "مكتمل", failed: "فشل", pending: "قيد الانتظار",
        no_tasks: "لا مهام لليوم!", session_expired: "انتهت صلاحية الجلسة",
        task_added: "تمت إضافة المهمة!", task_updated: "تم تحديث المهمة!", error_occurred: "حدث خطأ",
        calendar: "التقويم", date: "التاريخ", time: "الوقت", reminder: "تذكير",
        view_habits_history: "سجل العادات", instructions_btn: "تعليمات للمستخدمين الجدد",
        force_update: "تحديث التطبيق إجباري", install_app: "تثبيت التطبيق", got_it: "فهمت",
        inst_title: "دليل الاستخدام", inst_subtitle: "كل ما تحتاج معرفته عن Tobedone",
        inst_tasks_title: "المهام", inst_tasks_desc: "أنشئ مهام جديدة بالنقر على '+'. اضبط الأولوية والفئة. انقر على الدائرة لإكمال المهمة وكسب النقاط!",
        inst_dash_title: "لوحة التحكم", inst_dash_desc: "تابع تقدمك من خلال الرسوم البيانية.",
        inst_prog_title: "التقدم والشارات", inst_prog_desc: "كل مهمة تمنحك XP. ارتقِ في المستويات وافتح شارات حصرية!",
        inst_gestures_title: "الإيماءات", inst_gestures_desc: "اسحب يساراً أو يميناً للتنقل بين صفحات التطبيق.",
        goals: "أهداف", habits: "عادات", goals_tab: "أهداف", habits_tab: "عادات", add_goal: "إضافة هدف", add_habit: "إضافة عادة", new_goal: "هدف جديد", new_habit: "عادة جديدة", today_habits: "عادات اليوم", goals_subtitle: "معالم للمستقبل.", habits_subtitle: "خطوات صغيرة، نتائج كبيرة.", reflect: "تأمل", reflection: "تأمل", check_in: "تسجيل", save_goal: "حفظ الهدف", save_habit: "حفظ العادة",
        profile: "Profile",
        for_you: "For You",
        save_changes: "Save Changes",
        category_general: "General",
        not_enough_data: "Not enough data",
        tue: "الثلاثاء",
        wed: "الأربعاء",
        thu: "الخميس",
        fri: "الجمعة",
        sat: "السبت",
        sun: "الأحد",
        jan: "Jan",
        feb: "Feb",
        mar: "Mar",
        apr: "Apr",
        may: "مايو",
        jun: "Jun",
        jul: "Jul",
        aug: "Aug",
        sep: "Sep",
        oct: "Oct",
        nov: "Nov",
        dec: "Dec",
        january: "يناير",
        february: "فبراير",
        march: "مارس",
        april: "أبريل",
        june: "يونيو",
        july: "يوليو",
        august: "أغسطس",
        september: "سبتمبر",
        october: "أكتوبر",
        november: "نوفمبر",
        december: "ديسمبر",
        rec_lvl10_title: "🏆 Level 10 Achieved",
        rec_lvl10_desc: "Reach Level 10 of personal productivity",
        rec_streak7_title: "🔥 7-Day Streak",
        rec_streak7_desc: "Maintain a 7-day streak",
        rec_streak30_title: "🔥 30-Day Streak",
        rec_streak30_desc: "Maintain a 30-day streak",
        rec_goal_title: "🎯 Goal Master",
        rec_goal_desc: "Complete 10 goals",
        rec_elite_title: "⭐ Elite Status",
        rec_elite_desc: "Reach Rank: Elite",
        rec_habit_title: "📅 Habit Builder",
        rec_habit_desc: "Create 5 habits",
        chal_tasks_title: "Complete 5 tasks today",
        chal_tasks_desc: "Push your limits",
        chal_streak_title: "Reach a 3 day streak",
        chal_streak_desc: "Consistency is key",
        future_placeholder: "Write a letter to your future self",
        future_dear: "Dear future me...",
        loading: "جارٍ التحميل...",
        consistency: "الاتساق",
        opens_in: "يفتح خلال",
        open_message: "فتح الرسالة",
        message_archive: "أرشيف الرسائل",
        day_can_be_saved_body: "مهام لا تزال معلقة. كل إنجاز يساعد في حماية درجتك.",
        day_can_be_saved: "اليوم لا يزال يمكن إنقاذه",
        strong_day_body: "مهام مكتملة اليوم. أنت في أعلى مستوى من الأداء!",
        strong_day: "يوم قوي",
        perfect_day_body: "أكملت كل مهمة اليوم. انضباط استثنائي!",
        perfect_day: "يوم مثالي! ⭐",
        trust_declining_body2: "نقطة هذا الأسبوع. ركز على إنجاز المهام في الوقت المحدد.",
        trust_declining_body: "انخفضت درجتك",
        trust_declining: "الثقة تنخفض",
        trust_rising_body2: "نقطة مقارنة بالأسبوع الماضي. استمر!",
        trust_rising_body: "تحسنت درجتك بمقدار",
        trust_rising: "الثقة ترتفع 📈",
        streak_7_body: "اتساق رائع. سلسلتك في المستوى الأعلى — احميها!",
        streak_3_body_2: "أيام أخرى للوصول إلى سلسلة أسبوع. أنت تبني زخمًا!",
        streak_3_body_1: "فقط",
        day_streak: "يوم متتالي",
        tasks_lbl: "المهام",
        days_left: "أيام متبقية",
        overdue: "متأخر",
        at_risk: "في خطر",
        on_track: "في الموعد",
        gentle_nudge: "تذكير لطيف",
        habit_reminder: "تذكير العادة",
        tasks_for: "المهام ليوم",
        empty_task_desc: "قم بإنشاء مهمتك الأولى للبقاء منظمًا ومنتجًا.",
        empty_goal_desc: "قم بإنشاء هدفك الأول لتتبع التقدم.",
        empty_habit_desc: "ابنِ الاستمرارية مع عادتك المتكررة الأولى.",
        achieved_failed: "Achieved / Failed",
        achieved: "Achieved",
        failed_status: "Failed",
        longest_streak: "Longest Streak",
        highest_xp: "Highest XP Achieved",
        max_tasks_day: "Max Tasks In A Day",
        tasks_word: "المهام",
        goals_word: "الأهداف",
        ms_first_step: "First Step",
        ms_first_step_desc: "Complete your first task",
        ms_goal_setter: "Goal Setter",
        ms_goal_setter_desc: "Set your very first goal",
        ms_lvl10: "Level 10 Achieved",
        ms_lvl10_desc: "Reach Level 10 of personal productivity",
        ms_trust_builder: "Trust Builder",
        ms_trust_builder_desc: "Raise self trust score above 50",
        ms_discipline_elite: "Discipline Elite",
        ms_discipline_elite_desc: "Reach Level 25 or achieve elite trust levels",
        ms_legendary: "Legendary Achiever",
        ms_legendary_desc: "Complete 100 tasks and reach level 50",
        locked: "Locked",
        unlocked_status: "Unlocked",
        weekly_perf_card: "Weekly Performance Card",
        weekly_perf_desc: "Auto-generated weekly activity stats",
        monthly_perf_card: "Monthly Performance Review",
        monthly_perf_desc: "Detailed performance metrics review",
        weekly_progress_tab: "Weekly Progress",
        tasks_done: "Tasks Done",
        goals_done: "Goals Done",
        streak_health: "Streak Health",
        trust_growth: "Trust Growth",
        xp_rank_level: "XP Rank Level",
        trust_consistency: "Trust Consistency",
        chal_summer_sprint: "Summer Sprint",
        chal_summer_desc: "Complete 10 tasks to claim a massive boost.",
        chal_30day: "30 Day Consistency",
        chal_30day_desc: "Maintain a streak of 30 days.",
        in_progress: "In Progress",
        xp_reward_500: "+500 XP Reward",
        xp_reward_1500: "+1500 XP Reward",
        sent: "Sent",
        ready: "Ready",
        opened: "Opened",
        no_messages_yet: "No messages yet. Write your first one above!",
        ready_to_open: "Ready to Open!",
        fs_promise: "🤝 Promise",
        fs_prediction: "🔮 Prediction",
        fs_reminder: "🔔 Reminder",
        fs_motivational: "💪 Motivational",
        no_achievements: "No achievements yet",
        for_you_default_body: "Keep completing tasks to unlock personalized guidance",
        profile_updated: "Profile updated",
        profile_update_failed: "Failed to update profile",
        profile_link_copied: "Profile link copied!",
        insight_start_streak: "Start Your Streak",
        insight_start_streak_body: "Complete a task today to ignite your streak. Consistency is the foundation of trust.",
        levels_to_rank: "Levels to Rank Up",
        reach_level: "Reach Level",
        to_unlock: "to unlock the",
        rank_push: "rank. Push for it!",
        tasks_to_milestone: "Tasks to Milestone",
        complete: "Complete",
        more_tasks_milestone: "more tasks to reach the milestone of",
        create_task: "إنشاء مهمة",
        create_goal: "إنشاء هدف",
        create_habit: "إنشاء عادة",
        pressure_low: "ضغط منخفض",
        pressure_high: "زخم عالي",
        pressure_balanced: "متوازن",
        message_title: "عنوان الرسالة",
        write_message: "اكتب رسالتك...",
        mon: "الاثنين",
        tagline: "خطط. نفذ. انتهى.",
        todays_insights: "رؤى اليوم",
        tasks_30d: "المهام (30 يوم)",
        limited_time: "وقت محدود",
        goal_analytics: "تحليلات الهدف",
        mastery_progress: "تقدم الإتقان",
        goal_rate: "معدل الهدف",
        view_goals_history: "عرض سجل الأهداف",
        write_future: "اكتب للمستقبل",
        total_xp: "إجمالي نقاط الخبرة",
        loading_achievements: "جارٍ تحميل الإنجازات...",
        trust_desc: "درجة الثقة تحدد الاستمرارية.",
        send_message_future: "إرسال رسالة للمستقبل",
        analyzing_patterns: "تحليل الأنماط...",
        future_self: "المستقبل الذاتي",
        weekly_trend: "الاتجاه الأسبوعي",
        send_future: "إرسال للمستقبل",
        your_analytics: "تحليلاتك",
        view_tasks_history: "عرض سجل المهام",
        avg_completion_time: "متوسط وقت الإكمال",
        personal_records: "السجلات الشخصية",
        link_to_goal: "ربط بالهدف",
        calculating: "جاري الحساب...",
        weekly_summary: "الملخص الأسبوعي",
        best_day: "أفضل يوم",
        no_goals_yet: "لا توجد أهداف بعد",
        no_habits_yet: "لا توجد عادات بعد",
        no_tasks_yet: "لا توجد مهام بعد",
        goal_word: "هدف",
        boost: "تعزيز",
        no_habits_today: "لا توجد عادات مقررة اليوم.",
        average: "متوسط",
        xp_boost: "تعزيز XP",
        tasks_subtitle: "مهامك النشطة",
        full_report: "التقرير الكامل",
        weekly_report: "التقرير الأسبوعي",
    }
};

function t(key) {
    return translations[currentLang][key] || key;
}

function updateUILanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.type !== 'submit') {
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
    if (localStorage.getItem('tm_dark_mode') === null) {
        isDarkMode = true;
        localStorage.setItem('tm_dark_mode', '1');
    }
    
    applyTheme();
}

function applyTheme() {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        if (themeColorMeta) themeColorMeta.setAttribute('content', '#000000');
        document.documentElement.style.setProperty('--trust-bg', 'radial-gradient(circle at bottom right, #005c99 0%, #004a7a 20%, #003761 40%, #002542 60%, #001221 80%, #000000 100%)');
        document.documentElement.style.setProperty('--streak-bg', 'radial-gradient(circle at bottom right, #993d00 0%, #7a3100 20%, #5c2700 40%, #3d1a00 60%, #1f0d00 80%, #000000 100%)');
        document.documentElement.style.setProperty('--success-bg', 'radial-gradient(circle at bottom right, #009952 0%, #007a42 20%, #005c34 40%, #003d27 60%, #001f1a 80%, #000000 100%)');
        document.documentElement.style.setProperty('--progress-track-bg', 'rgba(255,255,255,0.1)');
        document.documentElement.style.setProperty('--progress-track-border', 'rgba(255,255,255,0.2)');
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        if (themeColorMeta) themeColorMeta.setAttribute('content', '#ffffff');
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
    // Reload so ALL dynamic content re-renders in the new language
    window.location.reload();
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
let previousViewBeforeSettings = null;

function toggleSettings() {
    if (currentView === 'settings') {
        showView(previousViewBeforeSettings || 'tasks');
    } else {
        previousViewBeforeSettings = currentView;
        showView('settings');
    }
}

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
    const startStr = firstDay.toLocalISOString();
    const endStr = lastDay.toLocalISOString();
    
    try {
        calendarTasks = await apiFetch(`/tasks/range?start_date=${startStr}&end_date=${endStr}`);
    } catch (err) {
        console.error('Failed to load calendar tasks', err);
    }

    const firstDayIdx = (firstDay.getDay() + 6) % 7; // Monday start
    const daysInMonth = lastDay.getDate();
    const todayStr = new Date().toLocalISOString();

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

    container.innerHTML = `<h3>${t('tasks_for')} ${dateStr}</h3>`;
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
                showToast(`${t('habit_reminder')}: ${habit.title}`, 'info');
                notifiedHabits.add(habit.id);
            } else if (diffMinutes < -90 && !notifiedHabits.has(`nudge-${habit.id}`)) {
                showToast(`${t('gentle_nudge')}: "${habit.title}"`, 'info');
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
        document.getElementById('insight-best-day').textContent = t('not_enough_data');
        document.getElementById('insight-best-hour').textContent = t('not_enough_data');
        document.getElementById('insight-failure-pattern').textContent = t('not_enough_data');
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
    document.getElementById('insight-best-day').textContent = bestDayIdx !== null ? dayNames[bestDayIdx] : t('not_enough_data');
    document.getElementById('insight-best-hour').textContent = bestHour !== null ? `${bestHour}:00` : t('not_enough_data');
    
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
    if (score > 75) return { text: t('excellent'), icon: '🏆', class: 'excellent' };
    if (score > 50) return { text: t('good'), icon: '✨', class: 'good' };
    if (score > 20) return { text: t('average'), icon: '⚡', class: 'average' };
    return { text: t('low'), icon: '⚠️', class: 'low' };
}

function getBadgeImageSrc(scoreClass) {
    const map = {
        excellent: 'excellent',
        good: 'good',
        average: 'average',
        low: 'low'
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

        const today = new Date().toLocalISOString();

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
                multBadge.textContent = `${score.multiplier.toFixed(1)}x ${t('boost')}${score.goal_bonus > 0 ? ` +${score.goal_bonus.toFixed(0)} ${t('goal_word')}` : ''}`;
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
        
        const today = new Date().toLocalISOString();
        
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
                <div class="hero-metric-label">${t("self_trust_score")}</div>
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
                <div class="hero-metric-label">${t("current_streak")}</div>
                <div class="hero-metric-value">${score.streak}</div>
            </div>
        </div>

        <!-- Card 3: Success -->
        <div class="hero-metric" style="background: ${successBg} !important;">
            <div class="hero-metric-content">
                <div class="hero-metric-icon">
                    <img id="hero-img-success" src="">
                </div>
                <div class="hero-metric-label">${t("success_rate")}</div>
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
        listEl.innerHTML = `<div class="for-you-item">${t('for_you_default_body')}</div>`;
    }

    const pressure = smartData.pressure_level || 'normal';
    pressureEl.textContent = pressure === 'light' ? t('pressure_low') : pressure === 'high' ? t('pressure_high') : t('pressure_balanced');
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
        const today = new Date().toLocalISOString();
        const yesterday = new Date(Date.now() - 86400000).toLocalISOString();
        
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
            
            const today = new Date().toLocalISOString();
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
                    <span class="label">${t('total_tasks')}</span>
                    <span class="value">${data.current_week.total_tasks}</span>
                </div>
                <div class="weekly-summary-stat">
                    <span class="label">${t('completed')}</span>
                    <span class="value">${data.current_week.completed_tasks}</span>
                </div>
                <div class="weekly-summary-stat">
                    <span class="label">${t('success_rate') || "Success Rate"}</span>
                    <span class="value">${data.current_week.success_rate}%</span>
                </div>
                <div class="weekly-summary-stat">
                    <span class="label">${t('streak')}</span>
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
        const startStr = start.toLocalISOString();
        const endStr = end.toLocalISOString();
        
        apiFetch(`/tasks/range?start_date=${startStr}&end_date=${endStr}`).then(tasks => {
            renderRealInsights(tasks);
        }).catch(err => console.error('Tasks range for insights failed', err));
        
        loadIdentityProfile();
        
        // Also populate Today's Insights and Personal Records with fresh data
        try {
            const identity = await apiFetch('/identity/profile');
            const history = await apiFetch('/score/history?days=30');
            const todayStr = new Date().toLocalISOString();
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

// Check if a specific history type has any items to show/hide the history button
async function checkHistoryAvailability(type) {
    try {
        const data = await apiFetch(`/history?type=${type}&limit=1`);
        const btn = document.getElementById(`${type}-history-btn`);
        if (btn && btn.parentElement) {
            btn.parentElement.style.display = data.total > 0 ? 'block' : 'none';
        }
    } catch (err) {
        console.error(`Failed to check history availability for ${type}`, err);
    }
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
        const today = new Date().toLocalISOString();
        const priorityElem = document.getElementById('filter-priority');
        const statusElem = document.getElementById('filter-status');
        const priority = priorityElem ? priorityElem.value : null;
        const status = statusElem ? statusElem.value : null;
        
        let url = `/tasks?day=${today}`;
        if (currentUser.user_id && Number.isInteger(currentUser.user_id)) {
            url += `&user_id=${currentUser.user_id}`;
        }
        if (priority) url += `&priority=${priority}`;
        if (status) url += `&status=${status}`;

        const tasks = await apiFetch(url);
        cachedTasks = tasks;
        renderTasks(tasks);
        checkHistoryAvailability('tasks');
    } catch (err) {
        console.error('Tasks load failed', err);
        if (cachedTasks.length === 0) {
            list.innerHTML = `<div class="empty-state"><p class="error-msg">${t('error_occurred')}</p></div>`;
        }
    }
}

function formatHabitDays(habit) {
    if (habit.frequency_type === 'daily') return 'Daily';
    const names = [t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')];
    return (habit.frequency_days || []).map(d => names[d] || '').filter(Boolean).join(', ');
}

function renderHabits(habits) {
    const list = document.getElementById('habits-list');
    if (!list) return;
    if (!habits || habits.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <span class="empty-state-icon"><i class="fas fa-brain"></i></span>
                <h3 class="empty-state-title">${t('no_habits_yet')}</h3>
                <p class="empty-state-text">${t('empty_habit_desc')}</p>
                <button onclick="toggleHabitForm()" class="btn primary"><i class="fas fa-plus-circle"></i> ${t('create_habit')}</button>
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
                    <span class="priority-badge priority-low">${habit.consistency_score.toFixed(0)}% ${t('consistency')}</span>
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
        checkHistoryAvailability('habits');
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
        list.innerHTML = `<div class="for-you-item">${t('no_habits_today')}</div>`;
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
        document.getElementById('habit-category').value = t('category_general');
        document.getElementById('habit-time').value = '';
        document.getElementById('habit-frequency').value = 'daily';
        document.querySelectorAll('#habit-days-group input[type="checkbox"]').forEach(el => { el.checked = false; });
        
        // Populate habit-goal-select
        const habitGoalSelect = document.getElementById('habit-goal-select');
        if (habitGoalSelect) {
            const activeGoals = cachedGoals.filter(g => g.status === 'active');
            habitGoalSelect.innerHTML = `<option value="">${t('no_link')}</option>` + activeGoals.map(g => `<option value="${g.id}">${g.title}</option>`).join('');
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
                <span class="empty-state-icon"><i class="fas fa-list-check"></i></span>
                <h3 class="empty-state-title">${t('no_tasks_yet')}</h3>
                <p class="empty-state-text">${t('empty_task_desc')}</p>
                <button onclick="toggleCurrentForm()" class="btn primary"><i class="fas fa-plus-circle"></i> ${t('create_task')}</button>
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
        const taskDate = date || new Date().toLocalISOString();
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
            checkHistoryAvailability('goals');
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
                <span class="empty-state-icon"><i class="fas fa-bullseye"></i></span>
                <h3 class="empty-state-title">${t('no_goals_yet')}</h3>
                <p class="empty-state-text">${t('empty_goal_desc')}</p>
                <button onclick="toggleGoalForm()" class="btn primary"><i class="fas fa-plus-circle"></i> ${t('create_goal')}</button>
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
                    <p>${t('tasks_lbl')}: ${goal.completed_tasks_count}/${goal.linked_tasks_count}</p>
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
        document.getElementById('goal-category').value = t('category_general');
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
            one_year_plus: '1 year+'
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
        
        customInput.min = minDate.toLocalISOString();
        customInput.max = maxDate.toLocalISOString();
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
    return base.toLocalISOString();
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
    const subtitleEl = document.getElementById('tasks-goals-subtitle');
    const addBtnText = document.getElementById('tasks-goals-add-text');
    
    if (tab === 'tasks') {
        titleEl.textContent = t('tasks');
        if(subtitleEl) subtitleEl.textContent = t('tasks_subtitle') || 'Focus on what matters today.';
        if(addBtnText) addBtnText.textContent = t('new_task');
        loadTasks();
    } else if (tab === 'goals') {
        titleEl.textContent = t('goals');
        if(subtitleEl) subtitleEl.textContent = t('goals_subtitle') || 'Set goals. Stay focused. Achieve more.';
        if(addBtnText) addBtnText.textContent = t('new_goal');
        loadGoals();
    } else {
        titleEl.textContent = t('habits');
        if(subtitleEl) subtitleEl.textContent = t('habits_subtitle') || 'Build consistency with your recurring habits.';
        if(addBtnText) addBtnText.textContent = t('new_habit');
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
                <h3 class="empty-state-title">${t('no_goals_yet')}</h3>
                <p class="empty-state-text">${t('empty_goal_desc')}</p>
                <button onclick="toggleGoalForm()" class="btn primary">${t('create_goal')}</button>
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
                        ${pressure.status === 'on_track' ? t('on_track') : pressure.status === 'at_risk' ? t('at_risk') : t('overdue')}
                    </span>
                </div>
                <div class="task-meta">
                    <p>${t('deadline')}: ${goal.deadline} (${pressure.daysRemaining} ${t('days_left')})</p>
                    <p>${t('tasks_lbl')}: ${goal.completed_tasks_count}/${goal.linked_tasks_count}</p>
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
                        <span>${t('failed')}</span>
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
    levelEl.innerHTML = `<i class="fas fa-star"></i> ${t('level')} ${identity.level}`;

    // XP bar & text
    xpFillEl.style.width = `${identity.level_progress_percent || 0}%`;
    xpTextEl.innerHTML = `${t('xp_lbl')} ${identity.xp_into_current_level}/${identity.xp_for_next_level} &nbsp; ${t('total_xp')} ${identity.total_xp}`;

    // Trust score
    trustEl.textContent = `${(identity.trust_score || 0).toFixed(1)}`;

    // Stat cards with icons + dot grid
    const statConfigs = [
        {
            label: t('completed_tasks'),
            value: identity.completed_tasks,
            icon: 'fa-list-check',
            colorClass: 'stat-green'
        },
        {
            label: t('goals_achieved'),
            value: identity.completed_goals,
            icon: 'fa-bullseye',
            colorClass: 'stat-blue'
        },
        {
            label: t('streak_lbl'),
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
        : `<span class="identity-badge" style="opacity:0.5"><span>🔒</span> ${t('no_achievements')}</span>`;

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
        tobedone_legend: '👑'
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
            ? (b.unlocked ? t('completed') : t('locked'))
            : `${b.progress_current.toLocaleString()} / ${b.progress_target.toLocaleString()}`;

        return `
        <div class="ach-card ${rClass} ${lockedClass}" id="ach-card-${b.id}">
            ${b.unlocked ? '<div class="ach-unlocked-badge"><i class="fas fa-check"></i></div>' : ''}
            <div class="ach-card-top">
                <div class="ach-icon-wrap">${icon}</div>
                <span class="ach-rarity-pill">${t(b.rarity.toLowerCase()) || b.rarity}</span>
            </div>
            <div class="ach-card-label">${t('ach_' + b.id) || b.label}</div>
            <div class="ach-card-desc">${t('ach_' + b.id + '_desc') || b.description}</div>
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
                showToast(t('profile_updated'), 'success');
            } catch (err) {
                showToast(err.message || t('profile_update_failed'), 'error');
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
    const SWIPE_THRESHOLD = 40;   // px to commit (was 72 — much lower = snappier)
    const SWIPE_DIR_LOCK  = 4;    // px before deciding horiz vs vert (was 6)
    const SWIPE_DIR_RATIO = 1.5;  // horiz/vert ratio to lock in (was 2.2)

    let touchStartX  = 0;
    let touchStartY  = 0;
    let touchCurX    = 0;
    let isDragging   = false;
    let isHorizontal = null;
    let startedOnBottomNav = false;
    let activeEl   = null;
    let neighborEl = null;
    let swipeDir   = null;
    let rafId      = null; // requestAnimationFrame handle

    function applyDragFrame(diffX) {
        if (!activeEl) return;

        // 1:1 tracking — no resistance, just clamp at screen edge
        const maxDrag = window.innerWidth;
        const drag = Math.max(-maxDrag, Math.min(maxDrag, diffX));

        // Fade out current view proportionally
        const progress = Math.abs(drag) / window.innerWidth;
        activeEl.style.transform = `translateX(${drag}px)`;
        activeEl.style.opacity   = `${Math.max(0.3, 1 - progress * 1.2)}`;

        if (neighborEl) {
            const neighborStart = swipeDir === 'left' ? window.innerWidth : -window.innerWidth;
            neighborEl.style.transform = `translateX(${neighborStart + drag}px)`;
            neighborEl.style.opacity   = `${Math.min(1, progress * 1.4)}`;
        }
    }

    document.addEventListener('touchstart', e => {
        startedOnBottomNav = Boolean(e.target?.closest?.('.bottom-nav'));
        if (startedOnBottomNav) return;
        touchStartX  = e.changedTouches[0].clientX;
        touchStartY  = e.changedTouches[0].clientY;
        touchCurX    = touchStartX;
        isDragging   = false;
        isHorizontal = null;
        swipeDir     = null;
        neighborEl   = null;
        activeEl     = document.getElementById(`view-${currentView}`);
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (startedOnBottomNav || window.innerWidth > 768) return;
        const x = e.changedTouches[0].clientX;
        const y = e.changedTouches[0].clientY;
        const diffX = x - touchStartX;
        const diffY = y - touchStartY;

        // Lock in direction once we've moved enough
        if (isHorizontal === null && (Math.abs(diffX) > SWIPE_DIR_LOCK || Math.abs(diffY) > SWIPE_DIR_LOCK)) {
            isHorizontal = Math.abs(diffX) > Math.abs(diffY) * SWIPE_DIR_RATIO;
        }
        if (!isHorizontal || !activeEl) return;

        touchCurX = x;
        isDragging = true;
        const currentIdx = viewOrder.indexOf(currentView);

        // Set up neighbor on first horizontal move
        if (!swipeDir) {
            if (diffX < 0 && currentIdx < viewOrder.length - 1) {
                swipeDir   = 'left';
                neighborEl = document.getElementById(`view-${viewOrder[currentIdx + 1]}`);
            } else if (diffX > 0 && currentIdx > 0) {
                swipeDir   = 'right';
                neighborEl = document.getElementById(`view-${viewOrder[currentIdx - 1]}`);
            } else {
                return;
            }
            // Prepare neighbor for display
            if (neighborEl) {
                neighborEl.classList.add('swipe-dragging');
                neighborEl.style.display       = 'flex';
                neighborEl.style.position      = 'absolute';
                neighborEl.style.width         = '100%';
                neighborEl.style.pointerEvents = 'none';
                neighborEl.style.opacity       = '0';
                const initOffset = swipeDir === 'left' ? window.innerWidth : -window.innerWidth;
                neighborEl.style.transform = `translateX(${initOffset}px)`;
            }
            activeEl.classList.add('swipe-dragging');
        }

        // Schedule paint via rAF
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => applyDragFrame(diffX));
    }, { passive: true });

    document.addEventListener('touchend', e => {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        if (startedOnBottomNav || !isDragging || !isHorizontal) {
            isDragging   = false;
            isHorizontal = null;
            return;
        }
        isDragging   = false;
        isHorizontal = null;

        const diffX     = touchCurX - touchStartX;
        const committed = Math.abs(diffX) >= SWIPE_THRESHOLD && swipeDir !== null;
        const snapDur   = committed ? '220ms' : '200ms';
        const snapEase  = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

        // Animate active view out or back
        if (activeEl) {
            activeEl.classList.remove('swipe-dragging');
            activeEl.style.transition = `transform ${snapDur} ${snapEase}, opacity ${snapDur} ease`;
            if (committed) {
                const exitX = swipeDir === 'left' ? '-100vw' : '100vw';
                activeEl.style.transform = `translateX(${exitX})`;
                activeEl.style.opacity   = '0';
            } else {
                activeEl.style.transform = 'translateX(0)';
                activeEl.style.opacity   = '1';
            }
            setTimeout(() => {
                if (activeEl) {
                    activeEl.style.transform  = '';
                    activeEl.style.opacity    = '';
                    activeEl.style.transition = '';
                }
            }, 250);
        }

        // Animate neighbor in or back
        if (neighborEl) {
            neighborEl.classList.remove('swipe-dragging');
            neighborEl.style.transition = `transform ${snapDur} ${snapEase}, opacity ${snapDur} ease`;
            if (committed) {
                neighborEl.style.transform = 'translateX(0)';
                neighborEl.style.opacity   = '1';
            } else {
                const retreatX = swipeDir === 'left' ? '100vw' : '-100vw';
                neighborEl.style.transform = `translateX(${retreatX})`;
                neighborEl.style.opacity   = '0';
            }
            setTimeout(() => {
                if (neighborEl) {
                    neighborEl.style.display      = '';
                    neighborEl.style.transform    = '';
                    neighborEl.style.opacity      = '';
                    neighborEl.style.transition   = '';
                    neighborEl.style.position     = '';
                    neighborEl.style.width        = '';
                    neighborEl.style.pointerEvents = '';
                }
            }, 250);
        }

        if (committed) {
            const currentIdx = viewOrder.indexOf(currentView);
            const dir        = diffX < 0 ? 'forward' : 'back';
            const targetIdx  = diffX < 0 ? currentIdx + 1 : currentIdx - 1;
            if (targetIdx >= 0 && targetIdx < viewOrder.length) {
                showView(viewOrder[targetIdx], dir);
            }
        }

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

const MIN_LOADING_DURATION_MS = 1600;
let loadingVisibleSince = 0;
let loadingHideTimeoutId = null;
let _loadingInitialized = false;

function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) return;

    if (show) {
        if (loadingHideTimeoutId) {
            clearTimeout(loadingHideTimeoutId);
            loadingHideTimeoutId = null;
        }

        // First call: overlay already active from HTML — just track time, never touch loading-sequence
        if (!_loadingInitialized) {
            _loadingInitialized = true;
            loadingVisibleSince = Date.now();
            // Ensure active is set, but DO NOT touch loading-sequence (animation already running)
            overlay.classList.add('active');
            overlay.style.opacity = '1';
            overlay.style.pointerEvents = 'all';
            return;
        }

        // Subsequent calls (e.g. profile save, forceUpdate): show overlay but never restart animation
        loadingVisibleSince = Date.now();
        overlay.classList.add('active');
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'all';
        // DO NOT add/remove loading-sequence here — avoids animation restart
    } else {
        const elapsed = Date.now() - loadingVisibleSince;
        const remaining = Math.max(0, MIN_LOADING_DURATION_MS - elapsed);

        if (loadingHideTimeoutId) {
            clearTimeout(loadingHideTimeoutId);
        }

        loadingHideTimeoutId = setTimeout(() => {
            overlay.classList.remove('active');
            // DO NOT remove loading-sequence — so if shown again, animation is already in forwards state
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
            loadingHideTimeoutId = null;
        }, remaining);
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

function openInstructionsModal() {
    const modal = document.getElementById('instructions-modal');
    if (modal) modal.classList.add('active');
}

function closeInstructionsModal() {
    const modal = document.getElementById('instructions-modal');
    if (modal) modal.classList.remove('active');
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
${t('streak_lbl')}: ${shareData.streak} ${t('days')}
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
        showToast(t('profile_link_copied'), 'success');
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
    const startStr = firstDay.toLocalISOString();
    const endStr = lastDay.toLocalISOString();

    const firstDayIdx = (firstDay.getDay() + 6) % 7; // Monday start
    const daysInMonth = lastDay.getDate();
    const todayStr = new Date().toLocalISOString();

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
        '.share-logo'       // share modal logo
    ];

    console.log('Found logo selectors for parallel processing:', logoSelectors);
    const promises = logoSelectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)).map(async (img) => {
        if (!img || !img.src) return;
        try {
            await processSingleLogo(img);
        } catch (err) {
            console.error(`Failed to process logo ${selector}`, err);
        }
    }));
    await Promise.all(promises);
}

window.addEventListener('load', () => {
    processAllLogos();
});

// --- Progression Hub Engine ---

// Global reports tab state
let currentPerformanceReportTab = 'weekly';

function getRankName(level) {
    if (level >= 50) return t('rank_legend');
    if (level >= 40) return t('rank_elite');
    if (level >= 30) return t('rank_consistent');
    if (level >= 20) return t('rank_achiever');
    if (level >= 10) return t('rank_builder');
    return t('rank_starter');
}

function getTrustScoreTier(score) {
    if (score >= 76) return { text: t('trust_excellent'), class: 'priority-high' };
    if (score >= 51) return { text: t('trust_good'), class: 'priority-medium' };
    if (score >= 26) return { text: t('trust_average'), class: 'priority-low' };
    return { text: t('trust_low'), class: 'priority-low' };
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
        if (levelBadgeEl) levelBadgeEl.innerHTML = `<i class="fas fa-star"></i> ${t('level')} ${identity.level}`;

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
            { label: t('longest_streak'), val: `${currentStreak} ${t('days')}`, icon: '🔥' },
            { label: t('self_trust_score'), val: hTrust.toFixed(1), icon: '🛡️' },
            { label: t('highest_xp'), val: identity.total_xp.toLocaleString(), icon: '⭐' },
            { label: t('max_tasks_day'), val: `${Math.max(mTasksDay, totalTasksCount > 0 ? 1 : 0)} ${t('tasks_word')}`, icon: '📋' },
            { label: t('total_tasks'), val: `${totalTasksCount} ${t('tasks_word')}`, icon: '✅' },
            { label: t('total_goals'), val: `${totalGoalsCount} ${t('goals_word')}`, icon: '🎯' }
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
        { title: '👣 ' + t('ms_first_step'), desc: t('ms_first_step_desc'), condition: identity.completed_tasks >= 1 },
        { title: '📌 ' + t('ms_goal_setter'), desc: t('ms_goal_setter_desc'), condition: identity.completed_goals >= 1 },
        { title: '⚡ ' + t('ms_lvl10'), desc: t('ms_lvl10_desc'), condition: identity.level >= 10 },
        { title: '🛡️ ' + t('ms_trust_builder'), desc: t('ms_trust_builder_desc'), condition: identity.trust_score >= 50.0 },
        { title: '⚔️ ' + t('ms_discipline_elite'), desc: t('ms_discipline_elite_desc'), condition: identity.level >= 25 || identity.trust_score >= 75.0 },
        { title: '👑 ' + t('ms_legendary'), desc: t('ms_legendary_desc'), condition: identity.completed_tasks >= 100 && identity.level >= 50 }
    ];

    list.innerHTML = milestones.map(m => `
        <div class="timeline-node ${m.condition ? 'unlocked' : ''}">
            <div class="timeline-title">${m.title}</div>
            <div class="timeline-desc">${m.desc}</div>
            <div class="timeline-date">${m.condition ? 'Unlocked ✓' : t('locked')}</div>
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
            <h4 style="margin:0 0 0.5rem 0; font-size:0.9rem;">${t('weekly_perf_card')}</h4>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin:0 0 1rem 0;">${t('weekly_perf_desc')}</p>
            <div class="report-grid">
                <div class="report-stat-box">
                    <div class="report-stat-val">${identity.completed_tasks}</div>
                    <div class="report-stat-lbl">${t('tasks_done')}</div>
                </div>
                <div class="report-stat-box">
                    <div class="report-stat-val">${identity.completed_goals}</div>
                    <div class="report-stat-lbl">${t('goals_done')}</div>
                </div>
                <div class="report-stat-box">
                    <div class="report-stat-val">${identity.streak}</div>
                    <div class="report-stat-lbl">${t('streak_health')}</div>
                </div>
                <div class="report-stat-box">
                    <div class="report-stat-val">+${(identity.trust_score * 0.15).toFixed(1)}</div>
                    <div class="report-stat-lbl">${t('trust_growth')}</div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <h4 style="margin:0 0 0.5rem 0; font-size:0.9rem;">${t('monthly_perf_card')}</h4>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin:0 0 1rem 0;">${t('monthly_perf_desc')}</p>
            <div class="report-grid">
                <div class="report-stat-box">
                    <div class="report-stat-val">${identity.completed_tasks}</div>
                    <div class="report-stat-lbl">${t('total_tasks')}</div>
                </div>
                <div class="report-stat-box">
                    <div class="report-stat-val">${identity.completed_goals}</div>
                    <div class="report-stat-lbl">${t('total_goals')}</div>
                </div>
                <div class="report-stat-box">
                    <div class="report-stat-val">${identity.level}</div>
                    <div class="report-stat-lbl">${t('xp_rank_level')}</div>
                </div>
                <div class="report-stat-box">
                    <div class="report-stat-val">${identity.trust_score.toFixed(1)}%</div>
                    <div class="report-stat-lbl">${t('trust_consistency')}</div>
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
            title: '🏃 ' + t('chal_summer_sprint'),
            desc: t('chal_summer_desc'),
            target: 10,
            current: Math.min(identity.completed_tasks, 10),
            xp: 500
        },
        {
            id: 'consistency_30',
            title: '🔥 ' + t('chal_30day'),
            desc: t('chal_30day_desc'),
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
    showToast(`🎉 ${t('level_up')} ${newLevel}!`, 'success');
    
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
            <p style="font-size: 1.2rem; opacity: 0.8; margin-bottom: 2rem;">${t('level_up')} ${newLevel} & ${t('rank')} "${getRankName(newLevel)}"</p>
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
        if (sentEl) sentEl.textContent = `${total} ${t('sent')}`;
        if (readyEl) readyEl.textContent = `${ready} ${t('ready')}`;
        if (openedEl) openedEl.textContent = `${opened} ${t('opened')}`;

        if (messages.length === 0) {
            archive.innerHTML = `
                <div style="text-align:center;padding:1.5rem;color:var(--text-secondary);">
                    <div style="font-size:2.5rem;margin-bottom:0.5rem;">✉️</div>
                    <p style="font-size:0.85rem;">${t('no_messages_yet')}</p>
                </div>
            `;
            return;
        }

        const catEmoji = { goal: '🎯', promise: '🤝', prediction: '🔮', reminder: '🔔', motivational: '💪' };

        archive.innerHTML = `
            <div style="font-size:0.78rem;font-weight:700;color:var(--text-secondary);margin-bottom:0.75rem;text-transform:uppercase;letter-spacing:0.05em;">${t('message_archive')}</div>
            ${messages.map(m => {
                const isReady = !m.is_opened && m.days_until_open === 0;
                const isOpened = m.is_opened;
                const daysLeft = m.days_until_open;
                const openDate = new Date(m.open_date).toLocaleDateString();

                let statusBadge, actionBtn;
                if (isOpened) {
                    statusBadge = `<span class="priority-badge priority-low" style="background:rgba(34,197,94,0.15);color:#22c55e;">${t('opened')} ✓</span>`;
                    actionBtn = '';
                } else if (isReady) {
                    statusBadge = `<span class="priority-badge priority-high">${t('ready_to_open')} 🔓</span>`;
                    actionBtn = `<button onclick="openFutureSelfMessage(${m.id})" class="btn primary" style="font-size:0.72rem;padding:0.3rem 0.75rem;margin-top:0.5rem;">${t('open_message')}</button>`;
                } else {
                    statusBadge = `<span class="priority-badge priority-medium">${t('opens_in')} ${daysLeft}d</span>`;
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
        cards.push({ icon: 'fas fa-fire', title: t('insight_start_streak'), body: t('insight_start_streak_body') });
    } else if (streak >= 3 && streak < 7) {
        cards.push({ icon: 'fas fa-fire', title: `${streak} ${t('day_streak')} 🔥`, body: `${t('streak_3_body_1')} ${7 - streak} ${t('streak_3_body_2')}` });
    } else if (streak >= 7) {
        cards.push({ icon: 'fas fa-fire-flame-curved', title: `${streak} ${t('day_streak')}! 🏆`, body: t('streak_7_body') });
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
                cards.push({ icon: 'fas fa-trending-up', title: t('trust_rising'), body: `${t('trust_rising_body')} ${delta.toFixed(1)} ${t('trust_rising_body2')}` });
            } else if (delta < -2) {
                cards.push({ icon: 'fas fa-trending-down', title: t('trust_declining'), body: `${t('trust_declining_body')} ${Math.abs(delta).toFixed(1)} ${t('trust_declining_body2')}` });
            }
        }
    }

    // Level milestone
    const nextRankThresholds = [6, 11, 21, 36, 50];
    const nextThreshold = nextRankThresholds.find(t => t > level);
    if (nextThreshold) {
        const diff = nextThreshold - level;
        cards.push({ icon: 'fas fa-star', title: `${diff} ${t('levels_to_rank')}`, body: `${t('reach_level')} ${nextThreshold} ${t('to_unlock')} "${getRankName(nextThreshold)}" ${t('rank_push')}` });
    }

    // Task milestone
    const taskMilestones = [10, 25, 50, 100, 250, 500];
    const nextTask = taskMilestones.find(t => t > tasks);
    if (nextTask) {
        cards.push({ icon: 'fas fa-tasks', title: `${nextTask - tasks} ${t('tasks_to_milestone')}`, body: `${t('complete')} ${nextTask - tasks} ${t('more_tasks_milestone')} ${nextTask}!` });
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
        cards.unshift({ icon: 'fas fa-star', title: t('perfect_day'), body: t('perfect_day_body') });
    } else if (successRate >= 70) {
        cards.unshift({ icon: 'fas fa-check-circle', title: `${t('strong_day')} (${Math.round(successRate)}%)`, body: `${todayScore.completed || 0} ${t('strong_day_body')}` });
    } else if (successRate > 0 && successRate < 50) {
        cards.unshift({ icon: 'fas fa-exclamation-triangle', title: t('day_can_be_saved'), body: `${todayScore.pending || 0} ${t('day_can_be_saved_body')}` });
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
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('loading')}`;
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


