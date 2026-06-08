import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/index.html', 'r', encoding='utf-8-sig') as f:
    content = f.read()

replacements = {
    r"<h3>Today's Habits</h3>": r'<h3 data-i18n="today_habits">Today\'s Habits</h3>',
    r'<button class="ach-filter-btn" data-filter="Goals" onclick="filterAchievements\(\'Goals\', this\)">🎯 Goals</button>': r'<button class="ach-filter-btn" data-filter="Goals" onclick="filterAchievements(\'Goals\', this)">🎯 <span data-i18n="goals">Goals</span></button>',
    r'<button class="ach-filter-btn" data-filter="Habits" onclick="filterAchievements\(\'Habits\', this\)">📅 Habits</button>': r'<button class="ach-filter-btn" data-filter="Habits" onclick="filterAchievements(\'Habits\', this)">📅 <span data-i18n="habits">Habits</span></button>',
    r'<button id="tab-goals-only" class="tab" onclick="switchTasksGoalsTab\(\'goals\'\)">Goals</button>': r'<button id="tab-goals-only" class="tab" onclick="switchTasksGoalsTab(\'goals\')" data-i18n="goals_tab">Goals</button>',
    r'<button id="tab-habits-only" class="tab" onclick="switchTasksGoalsTab\(\'habits\'\)">Habits</button>': r'<button id="tab-habits-only" class="tab" onclick="switchTasksGoalsTab(\'habits\')" data-i18n="habits_tab">Habits</button>',
    r'<h2>New Goal</h2>': r'<h2 data-i18n="new_goal">New Goal</h2>',
    r'<h2>New Habit</h2>': r'<h2 data-i18n="new_habit">New Habit</h2>',
    r'<h2>Goal Reflection</h2>': r'<h2 data-i18n="reflection">Goal Reflection</h2>',
    r'<button type="submit" class="btn primary">Save Goal</button>': r'<button type="submit" class="btn primary" data-i18n="save_goal">Save Goal</button>',
    r'<button type="submit" class="btn primary">Save Habit</button>': r'<button type="submit" class="btn primary" data-i18n="save_habit">Save Habit</button>',
    r'<button type="submit" class="btn primary">Check-in</button>': r'<button type="submit" class="btn primary" data-i18n="check_in">Check-in</button>',
    r'<button type="button" onclick="closeGoalModal\(\)" class="btn secondary">Cancel</button>': r'<button type="button" onclick="closeGoalModal()" class="btn secondary" data-i18n="cancel">Cancel</button>',
    r'<button type="button" onclick="closeHabitModal\(\)" class="btn secondary">Cancel</button>': r'<button type="button" onclick="closeHabitModal()" class="btn secondary" data-i18n="cancel">Cancel</button>',
    r'<button type="button" onclick="closeReflectionModal\(\)" class="btn secondary">Cancel</button>': r'<button type="button" onclick="closeReflectionModal()" class="btn secondary" data-i18n="cancel">Cancel</button>'
}

for old, new in replacements.items():
    content = re.sub(old, new, content)

with open('frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

with open('frontend/app.js', 'r', encoding='utf-8-sig') as f:
    app_content = f.read()

app_content = app_content.replace('>Reflect</button>', '>${t(\'reflect\')}</button>')

old_tab_logic = '''    } else if (tab === 'goals') {
        titleEl.textContent = 'Goals';
        subtitleEl.textContent = 'Milestones for the future.';
        addTextEl.textContent = 'Add Goal';
    } else if (tab === 'habits') {
        titleEl.textContent = 'Habits';
        subtitleEl.textContent = 'Small steps, big results.';
        addTextEl.textContent = 'Add Habit';
    }'''

new_tab_logic = '''    } else if (tab === 'goals') {
        titleEl.textContent = t('goals');
        subtitleEl.textContent = t('goals_subtitle');
        addTextEl.textContent = t('add_goal');
    } else if (tab === 'habits') {
        titleEl.textContent = t('habits');
        subtitleEl.textContent = t('habits_subtitle');
        addTextEl.textContent = t('add_habit');
    }'''
app_content = app_content.replace(old_tab_logic, new_tab_logic)

with open('frontend/app.js', 'w', encoding='utf-8') as f:
    f.write(app_content)
print('Replacements applied successfully')
