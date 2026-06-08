import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_keys = {
    'en': 'goals: "Goals", habits: "Habits", goals_tab: "Goals", habits_tab: "Habits", add_goal: "Add Goal", add_habit: "Add Habit", new_goal: "New Goal", new_habit: "New Habit", today_habits: "Today\'s Habits", tasks_subtitle: "Focus on what matters today.", goals_subtitle: "Set goals. Stay focused. Achieve more.", habits_subtitle: "Build consistency with your recurring habits.", reflect: "Reflect", reflection: "Reflection", check_in: "Check-in", save_goal: "Save Goal", save_habit: "Save Habit"',
    'el': 'goals: "Στόχοι", habits: "Συνήθειες", goals_tab: "Στόχοι", habits_tab: "Συνήθειες", add_goal: "Προσθήκη Στόχου", add_habit: "Προσθήκη Συνήθειας", new_goal: "Νέος Στόχος", new_habit: "Νέα Συνήθεια", today_habits: "Σημερινές Συνήθειες", tasks_subtitle: "Επικεντρωθείτε στο τι έχει σημασία.", goals_subtitle: "Βάλτε στόχους. Πετύχετε περισσότερα.", habits_subtitle: "Χτίστε συνέπεια με τις συνήθειές σας.", reflect: "Αναστοχασμός", reflection: "Αναστοχασμός", check_in: "Έλεγχος", save_goal: "Αποθήκευση", save_habit: "Αποθήκευση"',
    'es': 'goals: "Metas", habits: "Hábitos", goals_tab: "Metas", habits_tab: "Hábitos", add_goal: "Añadir Meta", add_habit: "Añadir Hábito", new_goal: "Nueva Meta", new_habit: "Nuevo Hábito", today_habits: "Hábitos de Hoy", tasks_subtitle: "Concéntrate en lo importante.", goals_subtitle: "Establece metas. Logra más.", habits_subtitle: "Crea constancia con hábitos.", reflect: "Reflexionar", reflection: "Reflexión", check_in: "Registro", save_goal: "Guardar", save_habit: "Guardar"',
    'fr': 'goals: "Objectifs", habits: "Habitudes", goals_tab: "Objectifs", habits_tab: "Habitudes", add_goal: "Ajouter Objectif", add_habit: "Ajouter Habitude", new_goal: "Nouvel Objectif", new_habit: "Nouvelle Habitude", today_habits: "Habitudes du Jour", tasks_subtitle: "Concentrez-vous sur l\'essentiel.", goals_subtitle: "Fixez des objectifs. Réalisez plus.", habits_subtitle: "Devenez régulier avec vos habitudes.", reflect: "Réfléchir", reflection: "Réflexion", check_in: "Point", save_goal: "Enregistrer", save_habit: "Enregistrer"',
    'de': 'goals: "Ziele", habits: "Gewohnheiten", goals_tab: "Ziele", habits_tab: "Gewohnheiten", add_goal: "Ziel Hinzufügen", add_habit: "Gewohnheit Hinzufügen", new_goal: "Neues Ziel", new_habit: "Neue Gewohnheit", today_habits: "Heutige Gewohnheiten", tasks_subtitle: "Fokus auf das Wichtigste.", goals_subtitle: "Setze Ziele. Erreiche mehr.", habits_subtitle: "Baue Konsistenz auf.", reflect: "Reflektieren", reflection: "Reflexion", check_in: "Check-in", save_goal: "Speichern", save_habit: "Speichern"',
    'it': 'goals: "Obiettivi", habits: "Abitudini", goals_tab: "Obiettivi", habits_tab: "Abitudini", add_goal: "Aggiungi Obiettivo", add_habit: "Aggiungi Abitudine", new_goal: "Nuovo Obiettivo", new_habit: "Nuova Abitudine", today_habits: "Abitudini di Oggi", tasks_subtitle: "Concentrati su ciò che conta.", goals_subtitle: "Imposta obiettivi. Ottieni di più.", habits_subtitle: "Costruisci la tua costanza.", reflect: "Riflettere", reflection: "Riflessione", check_in: "Controllo", save_goal: "Salva", save_habit: "Salva"',
    'pt': 'goals: "Objetivos", habits: "Hábitos", goals_tab: "Objetivos", habits_tab: "Hábitos", add_goal: "Adicionar Objetivo", add_habit: "Adicionar Hábito", new_goal: "Novo Objetivo", new_habit: "Novo Hábito", today_habits: "Hábitos de Hoje", tasks_subtitle: "Foque no que importa hoje.", goals_subtitle: "Defina objetivos. Conquiste mais.", habits_subtitle: "Crie consistência com hábitos.", reflect: "Refletir", reflection: "Reflexão", check_in: "Check-in", save_goal: "Salvar", save_habit: "Salvar"',
    'ru': 'goals: "Цели", habits: "Привычки", goals_tab: "Цели", habits_tab: "Привычки", add_goal: "Добавить Цель", add_habit: "Добавить Привычку", new_goal: "Новая Цель", new_habit: "Новая Привычка", today_habits: "Привычки на Сегодня", tasks_subtitle: "Сосредоточьтесь на главном.", goals_subtitle: "Ставьте цели. Достигайте большего.", habits_subtitle: "Выработайте постоянство.", reflect: "Анализ", reflection: "Анализ", check_in: "Отметка", save_goal: "Сохранить", save_habit: "Сохранить"',
    'ja': 'goals: "目標", habits: "習慣", goals_tab: "目標", habits_tab: "習慣", add_goal: "目標を追加", add_habit: "習慣を追加", new_goal: "新しい目標", new_habit: "新しい習慣", today_habits: "今日の習慣", tasks_subtitle: "今日重要なことに集中。", goals_subtitle: "目標を設定して、さらに達成。", habits_subtitle: "習慣で一貫性を築く。", reflect: "振り返り", reflection: "振り返り", check_in: "チェックイン", save_goal: "保存", save_habit: "保存"',
    'zh': 'goals: "目标", habits: "习惯", goals_tab: "目标", habits_tab: "习惯", add_goal: "添加目标", add_habit: "添加习惯", new_goal: "新目标", new_habit: "新习惯", today_habits: "今日习惯", tasks_subtitle: "专注于今天重要的事情。", goals_subtitle: "设定目标。实现更多。", habits_subtitle: "用习惯建立一致性。", reflect: "反思", reflection: "反思", check_in: "打卡", save_goal: "保存", save_habit: "保存"',
    'ar': 'goals: "أهداف", habits: "عادات", goals_tab: "أهداف", habits_tab: "عادات", add_goal: "إضافة هدف", add_habit: "إضافة عادة", new_goal: "هدف جديد", new_habit: "عادة جديدة", today_habits: "عادات اليوم", tasks_subtitle: "ركز على ما يهم اليوم.", goals_subtitle: "ضع أهدافًا. حقق المزيد.", habits_subtitle: "ابنِ استمراريتك.", reflect: "تأمل", reflection: "تأمل", check_in: "تسجيل", save_goal: "حفظ", save_habit: "حفظ"'
}

for lang, extra in new_keys.items():
    pattern = rf'({lang}: \{{.*?)(inst_gestures_desc: \".*?\")'
    replacement = r'\1\2,\n        ' + extra
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('frontend/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('app.js translations updated')
