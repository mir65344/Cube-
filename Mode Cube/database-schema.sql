-- Основная структура базы данных для Mood Cube

-- Таблица пользователей (сессий)
CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address TEXT
);

-- Таблица основных тестов настроения
CREATE TABLE IF NOT EXISTS mood_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    test_type TEXT DEFAULT 'basic',
    score REAL CHECK (score >= 1 AND score <= 5),
    mood_level TEXT,
    date TEXT,
    answers TEXT, -- JSON с ответами
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions (session_id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_mood_tests_session ON mood_tests(session_id);
CREATE INDEX IF NOT EXISTS idx_mood_tests_date ON mood_tests(date);

-- Таблица углубленных тестов
CREATE TABLE IF NOT EXISTS deep_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    main_test_id INTEGER,
    category TEXT,
    subcategory TEXT,
    score REAL,
    insights TEXT, -- JSON с инсайтами
    recommendations TEXT, -- JSON с рекомендациями
    answers TEXT, -- JSON с ответами
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions (session_id),
    FOREIGN KEY (main_test_id) REFERENCES mood_tests (id) ON DELETE CASCADE
);

-- Таблица дневниковых записей
CREATE TABLE IF NOT EXISTS mood_journal (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    date TEXT,
    mood_score REAL CHECK (mood_score >= 1 AND mood_score <= 5),
    notes TEXT,
    tags TEXT, -- JSON массив тегов
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions (session_id)
);

-- Таблица статистики пользователя
CREATE TABLE IF NOT EXISTS user_stats (
    session_id TEXT PRIMARY KEY,
    total_tests INTEGER DEFAULT 0,
    total_deep_tests INTEGER DEFAULT 0,
    total_journal_entries INTEGER DEFAULT 0,
    avg_mood_score REAL DEFAULT 0,
    best_score REAL DEFAULT 0,
    worst_score REAL DEFAULT 5,
    last_test_date TEXT,
    preferred_categories TEXT, -- JSON массив категорий
    streak_days INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions (session_id)
);

-- Таблица планов действий
CREATE TABLE IF NOT EXISTS action_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    test_id INTEGER,
    plan_name TEXT,
    tasks TEXT, -- JSON массив задач
    status TEXT DEFAULT 'active',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date TEXT,
    end_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions (session_id),
    FOREIGN KEY (test_id) REFERENCES mood_tests (id)
);

-- Таблица прогресса задач
CREATE TABLE IF NOT EXISTS task_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER,
    task_index INTEGER,
    completed BOOLEAN DEFAULT 0,
    completed_at DATETIME,
    notes TEXT,
    FOREIGN KEY (plan_id) REFERENCES action_plans (id) ON DELETE CASCADE
);

-- Триггер для обновления статистики при добавлении теста
CREATE TRIGGER IF NOT EXISTS update_stats_after_test
AFTER INSERT ON mood_tests
BEGIN
    INSERT OR REPLACE INTO user_stats (
        session_id,
        total_tests,
        avg_mood_score,
        best_score,
        worst_score,
        last_test_date,
        updated_at
    )
    SELECT 
        NEW.session_id,
        COALESCE(COUNT(*), 0),
        COALESCE(AVG(score), NEW.score),
        COALESCE(MAX(score), NEW.score),
        COALESCE(MIN(score), NEW.score),
        NEW.date,
        CURRENT_TIMESTAMP
    FROM mood_tests 
    WHERE session_id = NEW.session_id;
END;

-- Триггер для обновления времени последней активности
CREATE TRIGGER IF NOT EXISTS update_session_activity
AFTER INSERT ON mood_tests
BEGIN
    UPDATE sessions 
    SET last_activity = CURRENT_TIMESTAMP 
    WHERE session_id = NEW.session_id;
END;

-- Представление для сводной статистики
CREATE VIEW IF NOT EXISTS summary_stats AS
SELECT 
    s.session_id,
    COUNT(DISTINCT mt.id) as total_tests,
    COUNT(DISTINCT dt.id) as total_deep_tests,
    COUNT(DISTINCT mj.id) as total_journal_entries,
    ROUND(AVG(mt.score), 2) as avg_mood_score,
    MAX(mt.score) as best_mood,
    MIN(mt.score) as worst_mood,
    MAX(mt.date) as last_test_date,
    julianday('now') - julianday(MIN(mt.date)) as days_tracking
FROM sessions s
LEFT JOIN mood_tests mt ON s.session_id = mt.session_id
LEFT JOIN deep_tests dt ON mt.id = dt.main_test_id
LEFT JOIN mood_journal mj ON s.session_id = mj.session_id
GROUP BY s.session_id;
