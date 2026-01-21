const express = require('express');
const session = require('express-session');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { format } = require('date-fns');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для сервера
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'mood-cube-secret-key-v2',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
    }
}));

// Инициализация базы данных
const db = new sqlite3.Database('./mood_data.db', (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
    } else {
        console.log('Подключено к SQLite базе данных');
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Таблица для основных тестов настроения
    db.run(`
        CREATE TABLE IF NOT EXISTS mood_tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            test_type TEXT,
            score REAL,
            mood_level TEXT,
            date TEXT,
            answers TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Таблица для углубленных тестов
    db.run(`
        CREATE TABLE IF NOT EXISTS deep_tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            main_test_id INTEGER,
            category TEXT,
            subcategory TEXT,
            score REAL,
            insights TEXT,
            recommendations TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (main_test_id) REFERENCES mood_tests (id)
        )
    `);

    // Таблица для дневника настроений
    db.run(`
        CREATE TABLE IF NOT EXISTS mood_journal (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            date TEXT,
            mood_score REAL,
            notes TEXT,
            tags TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Таблица для статистики пользователя
    db.run(`
        CREATE TABLE IF NOT EXISTS user_stats (
            session_id TEXT PRIMARY KEY,
            total_tests INTEGER DEFAULT 0,
            avg_score REAL DEFAULT 0,
            last_test_date TEXT,
            preferred_categories TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

// Middleware для отслеживания активности пользователя
app.use((req, res, next) => {
    if (!req.session.userId) {
        req.session.userId = req.sessionID;
        req.session.startTime = new Date().toISOString();
    }
    next();
});

// Маршруты
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/tests', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tests.html'));
});

app.get('/deep-test', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'deep-test.html'));
});

app.get('/journal', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'journal.html'));
});

// Сохранение основного теста настроения
app.post('/api/save-mood-test', (req, res) => {
    const { score, moodLevel, answers, testType = 'basic' } = req.body;
    const sessionId = req.session.userId;
    const date = format(new Date(), 'yyyy-MM-dd');

    db.run(
        `INSERT INTO mood_tests (session_id, test_type, score, mood_level, date, answers) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [sessionId, testType, score, moodLevel, date, JSON.stringify(answers)],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            // Обновляем статистику пользователя
            updateUserStats(sessionId, score, date);
            
            res.json({ 
                success: true, 
                testId: this.lastID,
                needsDeepTest: score < 3.5 
            });
        }
    );
});

// Получение категорий для углубленного теста
app.get('/api/deep-test-categories', (req, res) => {
    const categories = [
        { id: 'work', name: 'Работа', icon: '💼', description: 'Профессиональная жизнь и карьера' },
        { id: 'relationships', name: 'Отношения', icon: '❤️', description: 'Романтические отношения и партнерство' },
        { id: 'family', name: 'Семья', icon: '👨‍👩‍👧‍👦', description: 'Семейные отношения и домашняя жизнь' },
        { id: 'friends', name: 'Друзья', icon: '👥', description: 'Социальные связи и дружба' },
        { id: 'personal', name: 'Личное развитие', icon: '🌱', description: 'Саморазвитие и личностный рост' },
        { id: 'health', name: 'Здоровье', icon: '🏥', description: 'Физическое и ментальное здоровье' },
        { id: 'finance', name: 'Финансы', icon: '💰', description: 'Финансовая стабильность и цели' }
    ];
    res.json({ categories });
});

// Получение вопросов для углубленного теста
app.post('/api/deep-test-questions', (req, res) => {
    const { category, subcategory, previousAnswers = {} } = req.body;
    
    let questions = [];
    
    // Базовая структура вопроса
    const baseQuestion = {
        type: 'multiple_choice', // или 'conditional', 'scale', 'text'
        options: [
            { value: 1, text: 'Полностью согласен' },
            { value: 2, text: 'Скорее согласен' },
            { value: 3, text: 'Нейтрально' },
            { value: 4, text: 'Скорее не согласен' },
            { value: 5, text: 'Полностью не согласен' }
        ]
    };

    // Динамическая генерация вопросов на основе категории и предыдущих ответов
    switch(category) {
        case 'work':
            questions = generateWorkQuestions(previousAnswers);
            break;
        case 'relationships':
            questions = generateRelationshipQuestions(previousAnswers);
            break;
        case 'family':
            questions = generateFamilyQuestions(previousAnswers);
            break;
        case 'personal':
            questions = generatePersonalDevelopmentQuestions(previousAnswers);
            break;
        default:
            questions = generateGenericQuestions(category, previousAnswers);
    }

    res.json({ 
        questions,
        category,
        estimatedTime: questions.length * 0.5 // минут на вопрос
    });
});

// Сохранение углубленного теста
app.post('/api/save-deep-test', (req, res) => {
    const { mainTestId, category, subcategory, score, insights, recommendations, answers } = req.body;
    const sessionId = req.session.userId;

    db.run(
        `INSERT INTO deep_tests (session_id, main_test_id, category, subcategory, score, insights, recommendations) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sessionId, mainTestId, category, subcategory, score, JSON.stringify(insights), JSON.stringify(recommendations)],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            // Генерация персонализированных рекомендаций
            generateRecommendations(sessionId, mainTestId, this.lastID)
                .then(recs => {
                    res.json({ 
                        success: true, 
                        deepTestId: this.lastID,
                        recommendations: recs,
                        actionPlan: generateActionPlan(category, score, insights)
                    });
                });
        }
    );
});

// Получение истории тестов
app.get('/api/test-history', (req, res) => {
    const sessionId = req.session.userId;
    const limit = parseInt(req.query.limit) || 10;

    db.all(
        `SELECT m.*, 
                (SELECT COUNT(*) FROM deep_tests d WHERE d.main_test_id = m.id) as deep_tests_count
         FROM mood_tests m 
         WHERE m.session_id = ? 
         ORDER BY m.created_at DESC 
         LIMIT ?`,
        [sessionId, limit],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ tests: rows });
        }
    );
});

// Получение статистики за период
app.get('/api/mood-stats', (req, res) => {
    const sessionId = req.session.userId;
    const period = req.query.period || 'week'; // week, month, year

    const dateFilter = getDateFilter(period);

    db.all(
        `SELECT date, AVG(score) as avg_score, COUNT(*) as test_count,
                GROUP_CONCAT(mood_level) as levels
         FROM mood_tests 
         WHERE session_id = ? AND date >= ?
         GROUP BY date
         ORDER BY date`,
        [sessionId, dateFilter],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            const stats = {
                period,
                totalTests: rows.reduce((sum, row) => sum + row.test_count, 0),
                averageScore: rows.length > 0 ? 
                    rows.reduce((sum, row) => sum + row.avg_score, 0) / rows.length : 0,
                dailyStats: rows,
                trends: analyzeTrends(rows)
            };

            res.json(stats);
        }
    );
});

// Сохранение записи в дневнике
app.post('/api/save-journal-entry', (req, res) => {
    const { moodScore, notes, tags } = req.body;
    const sessionId = req.session.userId;
    const date = format(new Date(), 'yyyy-MM-dd');

    db.run(
        `INSERT INTO mood_journal (session_id, date, mood_score, notes, tags) 
         VALUES (?, ?, ?, ?, ?)`,
        [sessionId, date, moodScore, notes, JSON.stringify(tags)],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true, entryId: this.lastID });
        }
    );
});

// Получение дневниковых записей
app.get('/api/journal-entries', (req, res) => {
    const sessionId = req.session.userId;
    const limit = parseInt(req.query.limit) || 30;

    db.all(
        `SELECT * FROM mood_journal 
         WHERE session_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [sessionId, limit],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ entries: rows });
        }
    );
});

// Вспомогательные функции
function updateUserStats(sessionId, score, date) {
    db.get(
        `SELECT * FROM user_stats WHERE session_id = ?`,
        [sessionId],
        (err, row) => {
            if (err) return;

            if (row) {
                const newTotal = row.total_tests + 1;
                const newAvg = ((row.avg_score * row.total_tests) + score) / newTotal;
                
                db.run(
                    `UPDATE user_stats 
                     SET total_tests = ?, avg_score = ?, last_test_date = ?
                     WHERE session_id = ?`,
                    [newTotal, newAvg, date, sessionId]
                );
            } else {
                db.run(
                    `INSERT INTO user_stats (session_id, total_tests, avg_score, last_test_date) 
                     VALUES (?, 1, ?, ?)`,
                    [sessionId, score, date]
                );
            }
        }
    );
}

function generateWorkQuestions(previousAnswers) {
    const questions = [
        {
            id: 'work_1',
            text: 'Насколько вы удовлетворены своей текущей работой?',
            type: 'scale',
            min: 1,
            max: 10,
            dependsOn: null
        },
        {
            id: 'work_2',
            text: 'Чувствуете ли вы поддержку от коллег и руководителя?',
            type: 'multiple_choice',
            options: [
                { value: 1, text: 'Да, постоянно чувствую поддержку' },
                { value: 2, text: 'В основном да, но бывают исключения' },
                { value: 3, text: 'Иногда' },
                { value: 4, text: 'Редко' },
                { value: 5, text: 'Почти никогда' }
            ],
            dependsOn: null
        },
        {
            id: 'work_3',
            text: 'Испытываете ли вы стресс на работе?',
            type: 'multiple_choice',
            options: [
                { value: 1, text: 'Почти никогда' },
                { value: 2, text: 'Редко' },
                { value: 3, text: 'Иногда' },
                { value: 4, text: 'Часто' },
                { value: 5, text: 'Постоянно' }
            ],
            dependsOn: null
        }
    ];

    // Условные вопросы
    if (previousAnswers.work_3 && previousAnswers.work_3 >= 3) {
        questions.push({
            id: 'work_stress_source',
            text: 'Что является основным источником стресса на работе?',
            type: 'multiple_choice',
            options: [
                { value: 1, text: 'Сроки и дедлайны' },
                { value: 2, text: 'Отношения с коллегами' },
                { value: 3, text: 'Перегрузка задачами' },
                { value: 4, text: 'Неопределенность требований' },
                { value: 5, text: 'Другое' }
            ],
            dependsOn: 'work_3'
        });
    }

    return questions;
}

function generateRelationshipQuestions(previousAnswers) {
    const questions = [
        {
            id: 'rel_1',
            text: 'Находитесь ли вы в романтических отношениях?',
            type: 'conditional',
            options: [
                { value: 'yes', text: 'Да' },
                { value: 'no', text: 'Нет' },
                { value: 'complicated', text: 'Это сложно' }
            ],
            dependsOn: null
        }
    ];

    // Ветвление вопросов
    if (previousAnswers.rel_1 === 'yes') {
        questions.push(
            {
                id: 'rel_partner_satisfaction',
                text: 'Насколько вы удовлетворены своими отношениями?',
                type: 'scale',
                min: 1,
                max: 10,
                dependsOn: 'rel_1'
            },
            {
                id: 'rel_communication',
                text: 'Как часто вы открыто общаетесь с партнером?',
                type: 'multiple_choice',
                options: [
                    { value: 1, text: 'Ежедневно, обо всем' },
                    { value: 2, text: 'Регулярно, но не обо всем' },
                    { value: 3, text: 'Иногда, поверхностно' },
                    { value: 4, text: 'Редко' },
                    { value: 5, text: 'Практически не общаемся' }
                ],
                dependsOn: 'rel_1'
            }
        );
    } else if (previousAnswers.rel_1 === 'no') {
        questions.push(
            {
                id: 'rel_seeking',
                text: 'Хотели бы вы быть в отношениях?',
                type: 'multiple_choice',
                options: [
                    { value: 1, text: 'Да, активно ищу' },
                    { value: 2, text: 'Да, но пассивно' },
                    { value: 3, text: 'Не знаю' },
                    { value: 4, text: 'Скорее нет' },
                    { value: 5, text: 'Определенно нет' }
                ],
                dependsOn: 'rel_1'
            }
        );
    }

    return questions;
}

function generateFamilyQuestions(previousAnswers) {
    // Аналогичная логика для семейных вопросов
    return [
        {
            id: 'fam_1',
            text: 'Насколько вы близки со своей семьей?',
            type: 'scale',
            min: 1,
            max: 10,
            dependsOn: null
        }
    ];
}

function generatePersonalDevelopmentQuestions(previousAnswers) {
    return [
        {
            id: 'pd_1',
            text: 'Чувствуете ли вы личностный рост в последнее время?',
            type: 'multiple_choice',
            options: [
                { value: 1, text: 'Да, значительный прогресс' },
                { value: 2, text: 'Да, небольшие улучшения' },
                { value: 3, text: 'Остаюсь на том же уровне' },
                { value: 4, text: 'Чувствую регресс' },
                { value: 5, text: 'Затрудняюсь ответить' }
            ],
            dependsOn: null
        }
    ];
}

function generateGenericQuestions(category, previousAnswers) {
    return [
        {
            id: `${category}_general`,
            text: `Насколько вас беспокоят аспекты, связанные с ${getCategoryName(category)}?`,
            type: 'scale',
            min: 1,
            max: 10,
            dependsOn: null
        }
    ];
}

function getCategoryName(category) {
    const names = {
        'work': 'работой',
        'relationships': 'отношениями',
        'family': 'семьей',
        'friends': 'друзьями',
        'personal': 'личным развитием',
        'health': 'здоровьем',
        'finance': 'финансами'
    };
    return names[category] || 'этой сферой';
}

function getDateFilter(period) {
    const now = new Date();
    switch(period) {
        case 'week':
            now.setDate(now.getDate() - 7);
            break;
        case 'month':
            now.setMonth(now.getMonth() - 1);
            break;
        case 'year':
            now.setFullYear(now.getFullYear() - 1);
            break;
        default:
            now.setDate(now.getDate() - 7);
    }
    return format(now, 'yyyy-MM-dd');
}

function analyzeTrends(dailyStats) {
    if (dailyStats.length < 2) return { direction: 'stable', change: 0 };
    
    const firstScore = dailyStats[0].avg_score;
    const lastScore = dailyStats[dailyStats.length - 1].avg_score;
    const change = ((lastScore - firstScore) / firstScore) * 100;
    
    return {
        direction: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
        change: change.toFixed(1)
    };
}

async function generateRecommendations(sessionId, mainTestId, deepTestId) {
    return new Promise((resolve) => {
        db.all(
            `SELECT m.score as main_score, m.mood_level, d.category, d.score as deep_score
             FROM mood_tests m
             LEFT JOIN deep_tests d ON m.id = d.main_test_id
             WHERE m.session_id = ? AND (m.id = ? OR d.id = ?)`,
            [sessionId, mainTestId, deepTestId],
            (err, rows) => {
                if (err || rows.length === 0) {
                    resolve(getGenericRecommendations());
                    return;
                }

                const mainTest = rows.find(r => !r.category);
                const deepTests = rows.filter(r => r.category);
                
                const recommendations = [
                    ...getMainRecommendations(mainTest),
                    ...getDeepRecommendations(deepTests)
                ];

                resolve(recommendations);
            }
        );
    });
}

function getMainRecommendations(test) {
    const recs = [];
    
    if (test.score < 2.5) {
        recs.push({
            priority: 'high',
            text: 'Рекомендуем обратиться к специалисту для поддержки',
            action: 'Записаться на консультацию',
            icon: '👨‍⚕️'
        });
    }
    
    if (test.score < 3.5) {
        recs.push({
            priority: 'medium',
            text: 'Практикуйте ежедневные упражнения на осознанность',
            action: 'Начать медитацию 5 минут в день',
            icon: '🧘'
        });
    }
    
    return recs;
}

function getDeepRecommendations(deepTests) {
    return deepTests.map(test => ({
        priority: 'medium',
        text: `Для улучшения сферы "${test.category}" рекомендуем: ${getCategorySpecificAdvice(test.category, test.score)}`,
        action: 'Просмотреть упражнения',
        icon: '📚'
    }));
}

function getCategorySpecificAdvice(category, score) {
    const advice = {
        work: score < 3 ? 'обсудить workload с руководителем' : 'ставить четкие профессиональные цели',
        relationships: score < 3 ? 'улучшить коммуникацию с партнером' : 'планировать регулярные свидания',
        family: 'устраивать семейные ужины без гаджетов',
        personal: 'вести дневник достижений',
        health: 'установить режим сна и питания',
        finance: 'вести бюджет и ставить финансовые цели'
    };
    
    return advice[category] || 'обратить внимание на эту сферу';
}

function generateActionPlan(category, score, insights) {
    const plans = {
        work: [
            'Составить список профессиональных целей на месяц',
            'Обсудить с руководителем зоны роста',
            'Планировать рабочий день с приоритетами'
        ],
        relationships: [
            'Запланировать регулярное качественное время вместе',
            'Практиковать активное слушание',
            'Выражать благодарность партнеру ежедневно'
        ],
        personal: [
            'Выделить 30 минут в день на саморазвитие',
            'Читать одну книгу в месяц по теме роста',
            'Посещать один новый курс или мероприятие в квартал'
        ]
    };
    
    return plans[category] || ['Вести дневник наблюдений', 'Ставить маленькие достижимые цели', 'Отмечать прогресс'];
}

function getGenericRecommendations() {
    return [
        {
            priority: 'low',
            text: 'Ведите дневник настроения для отслеживания прогресса',
            action: 'Начать вести дневник',
            icon: '📓'
        }
    ];
}

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`Доступные маршруты:`);
    console.log(`  Главная: http://localhost:${PORT}`);
    console.log(`  Тесты: http://localhost:${PORT}/tests`);
    console.log(`  Углубленные тесты: http://localhost:${PORT}/deep-test`);
    console.log(`  Дневник: http://localhost:${PORT}/journal`);
});
