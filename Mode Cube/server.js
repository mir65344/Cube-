const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для сервера
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'mood-cube-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// хранение данных пользователей
const userData = new Map();

// маршруты
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/tests', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tests.html'));
});

// сохранение цвета куба
app.post('/save-color', (req, res) => {
    const { color, score } = req.body;
    const sessionId = req.sessionID;
    
    if (!userData.has(sessionId)) {
        userData.set(sessionId, {});
    }
    
    userData.get(sessionId).cubeColor = color;
    userData.get(sessionId).moodScore = score;
    
    res.json({ success: true });
});

// получение цвета куба
app.get('/get-color', (req, res) => {
    const sessionId = req.sessionID;
    const user = userData.get(sessionId);
    
    if (user && user.cubeColor) {
        res.json({ 
            color: user.cubeColor, 
            score: user.moodScore 
        });
    } else {
        res.json({ color: null, score: null });
    }
});

// сохранение результатов EQ теста
app.post('/save-eq-result', (req, res) => {
    const { eqScore, eqLevel } = req.body;
    const sessionId = req.sessionID;
    
    if (!userData.has(sessionId)) {
        userData.set(sessionId, {});
    }
    
    userData.get(sessionId).eqScore = eqScore;
    userData.get(sessionId).eqLevel = eqLevel;
    
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
