// элементы DOM
const submitBtn = document.getElementById('submit');
const resultDiv = document.getElementById('result');
const recommendationsDiv = document.getElementById('recommendations');
const options = document.querySelectorAll('.option');

// переменные для хранения ответов пользователя
let userAnswers = {};
let testCompleted = false;

// обработчики выбора ответов
options.forEach(option => {
    option.addEventListener('click', function() {
        if (testCompleted) return;
        
        const question = this.closest('.question');
        const questionNumber = Array.from(document.querySelectorAll('.question')).indexOf(question) + 1;
        
        // снимаем выделение с других вариантов в этом вопросе
        question.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // выделяем выбранный вариант
        this.classList.add('selected');
        
        // сохраняем ответ пользователя
        userAnswers[questionNumber] = parseInt(this.getAttribute('data-value'));
        
        // активируем кнопку отправки, если все вопросы отвечены
        checkAllQuestionsAnswered();
    });
});

// проверка, все ли вопросы отвечены
function checkAllQuestionsAnswered() {
    const totalQuestions = document.querySelectorAll('.question').length;
    const answeredQuestions = Object.keys(userAnswers).length;
    
    if (answeredQuestions === totalQuestions) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    } else {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
    }
}

// обработчик отправки теста
submitBtn.addEventListener('click', async function() {
    if (Object.keys(userAnswers).length < 6) {
        resultDiv.textContent = 'Пожалуйста, ответьте на все вопросы перед отправкой.';
        return;
    }
    
    // рассчитываем результат
    const score = calculateScore();
    const moodLevel = calculateMoodLevel(score);
    
    // показываем результат
    showResult(score, moodLevel);
    
    // подсвечиваем ответы пользователя
    highlightAnswers();
    
    // обновляем цвет куба
    if (window.cubeController) {
        window.cubeController.updateCubeColor(moodLevel);
    }
    
    // сохраняем тест на сервере
    const savedTest = await saveTestToServer(score, moodLevel);
    
    // обновляем статистику
    updateStats(score, moodLevel);
    
    // Сохраняем данные теста для возможного углубленного теста
    localStorage.setItem('lastMoodTest', JSON.stringify({
        score,
        testId: savedTest.testId,
        needsDeepTest: savedTest.needsDeepTest,
        date: new Date().toISOString()
    }));
    
    // Предлагаем углубленный тест, если нужно
    if (savedTest.needsDeepTest) {
        showDeepTestOffer(score);
    }
    
    testCompleted = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Тест завершен';
});

// расчет общего балла
function calculateScore() {
    let totalScore = 0;
    const totalQuestions = Object.keys(userAnswers).length;
    
    for (let i = 1; i <= totalQuestions; i++) {
        const answerValue = userAnswers[i];
        let convertedScore;

        switch(answerValue) {
            case 1: convertedScore = 5; break;
            case 2: convertedScore = 4; break;
            case 3: convertedScore = 2; break;
            case 4: convertedScore = 1; break;
            default: convertedScore = 3;
        }
        
        totalScore += convertedScore;
    }
    
    const averageScore = totalScore / totalQuestions;
    return Math.min(Math.max(averageScore, 1), 5);
}

// расчет уровня настроения
function calculateMoodLevel(score) {
    return score;
}

// показать результат
function showResult(score, moodLevel) {
    const moodText = getMoodText(moodLevel);
    const percentage = ((score - 1) / 4 * 100).toFixed(1);
    
    resultDiv.innerHTML = `
        <strong>Ваш результат:</strong> ${score.toFixed(1)}/5<br>
        <strong>Уровень настроения:</strong> ${moodText}<br>
        <strong>Процент позитива:</strong> ${percentage}%
    `;
    
    showRecommendations(moodLevel);
}

// получить текстовое описание настроения
function getMoodText(moodLevel) {
    if (moodLevel >= 4.5) return 'Отличное 🌟';
    if (moodLevel >= 3.5) return 'Хорошее 😊';
    if (moodLevel >= 2.5) return 'Нормальное 🙂';
    if (moodLevel >= 1.5) return 'Подавленное 😔';
    return 'Плохое 😞';
}

// подсветка ответов разными цветами
function highlightAnswers() {
    document.querySelectorAll('.question').forEach((question, index) => {
        const questionNumber = index + 1;
        const userAnswer = userAnswers[questionNumber];
        
        question.querySelectorAll('.option').forEach(option => {
            const optionValue = parseInt(option.getAttribute('data-value'));
            
            option.classList.remove('selected', 'answer-1', 'answer-2', 'answer-3', 'answer-4', 'user-selected');
            option.classList.add(`answer-${optionValue}`);
            
            if (optionValue === userAnswer) {
                option.classList.add('user-selected');
            }
        });
    });
}

// показать рекомендации
function showRecommendations(moodLevel) {
    let recommendations = '';
    
    if (moodLevel >= 4) {
        recommendations = `
            <h4>Отличный результат! 🌟</h4>
            <ul>
                <li>Продолжайте в том же духе! Ваше позитивное настроение - ваш суперсила</li>
                <li>Делитесь своим хорошим настроением с окружающими</li>
                <li>Попробуйте новые хобби или занятия для дальнейшего развития</li>
                <li>Практикуйте благодарность каждый день</li>
            </ul>
        `;
    } else if (moodLevel >= 3) {
        recommendations = `
            <h4>Хороший результат! 😊</h4>
            <ul>
                <li>Вы находитесь в хорошей форме, но есть куда расти</li>
                <li>Практикуйте медитацию или дыхательные упражнения</li>
                <li>Регулярно занимайтесь физической активностью</li>
                <li>Проводите время на свежем воздухе</li>
            </ul>
        `;
    } else if (moodLevel >= 2) {
        recommendations = `
            <h4>Есть над чем поработать 🤔</h4>
            <ul>
                <li>Старайтесь высыпаться (7-9 часов в сутки)</li>
                <li>Найдите время для занятий, которые приносят удовольствие</li>
                <li>Ограничьте время в социальных сетях</li>
                <li>Общайтесь с позитивными людьми</li>
            </ul>
        `;
    } else {
        recommendations = `
            <h4>Рекомендации для улучшения состояния 💫</h4>
            <ul>
                <li>Обратитесь к психологу или терапевту</li>
                <li>Практикуйте техники релаксации и mindfulness</li>
                <li>Установите регулярный режим дня</li>
                <li>Не стесняйтесь просить помощи у близких</li>
                <li>Помните: плохое настроение - это временно</li>
            </ul>
        `;
    }
    
    recommendationsDiv.innerHTML = recommendations;
    recommendationsDiv.style.display = 'block';
}

// сохранение теста на сервере
async function saveTestToServer(score, moodLevel) {
    try {
        const response = await fetch('/api/save-mood-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                score: score,
                moodLevel: getMoodText(moodLevel),
                answers: userAnswers,
                testType: 'basic'
            })
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка сохранения теста:', error);
        return { success: false, testId: null, needsDeepTest: score < 3.5 };
    }
}

// обновление статистики
function updateStats(score, moodLevel) {
    const moodLevelElement = document.getElementById('mood-level');
    const testsTakenElement = document.getElementById('tests-taken');
    const averageScoreElement = document.getElementById('average-score');
    const lastResultElement = document.getElementById('last-result');
    
    if (moodLevelElement) {
        const levels = ['Очень плохое', 'Плохое', 'Нормальное', 'Хорошее', 'Отличное'];
        const levelIndex = Math.min(Math.max(Math.round(moodLevel) - 1, 0), 4);
        moodLevelElement.textContent = levels[levelIndex];
    }
    
    if (lastResultElement) {
        lastResultElement.textContent = `${score.toFixed(1)}/5`;
    }
    
    if (testsTakenElement) {
        const currentCount = parseInt(testsTakenElement.textContent) || 0;
        testsTakenElement.textContent = currentCount + 1;
    }
    
    if (averageScoreElement) {
        const currentAvg = parseFloat(averageScoreElement.textContent) || score;
        const testsCount = parseInt(testsTakenElement.textContent) || 1;
        const newAvg = ((currentAvg * (testsCount - 1)) + score) / testsCount;
        averageScoreElement.textContent = newAvg.toFixed(1);
    }
}

// Предложение углубленного теста
function showDeepTestOffer(score) {
    setTimeout(() => {
        const offerHtml = `
            <div class="deep-test-offer">
                <div class="offer-content">
                    <h3>🎯 Хотите получить более точные рекомендации?</h3>
                    <p>Ваш результат (${score.toFixed(1)}/5) показывает, что есть области для улучшения.</p>
                    <p>Пройдите углубленный тест по конкретной сфере жизни для персонализированного плана действий.</p>
                    <div class="offer-buttons">
                        <button class="btn-offer-primary" id="go-to-deep-test">Пройти углубленный тест</button>
                        <button class="btn-offer-secondary" id="close-offer">Спасибо, позже</button>
                    </div>
                </div>
            </div>
        `;
        
        const offerElement = document.createElement('div');
        offerElement.innerHTML = offerHtml;
        document.querySelector('.quiz-container').appendChild(offerElement);
        
        // Добавляем стили
        const style = document.createElement('style');
        style.textContent = `
            .deep-test-offer {
                margin-top: 30px;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 15px;
                color: white;
                animation: slideIn 0.5s ease-out;
            }
            @keyframes slideIn {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .offer-buttons {
                display: flex;
                gap: 15px;
                margin-top: 20px;
            }
            .btn-offer-primary {
                padding: 12px 24px;
                background: white;
                color: #667eea;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.3s;
            }
            .btn-offer-primary:hover {
                transform: translateY(-2px);
            }
            .btn-offer-secondary {
                padding: 12px 24px;
                background: transparent;
                color: white;
                border: 2px solid white;
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.3s;
            }
            .btn-offer-secondary:hover {
                background: rgba(255, 255, 255, 0.1);
            }
        `;
        document.head.appendChild(style);
        
        // Обработчики событий
        document.getElementById('go-to-deep-test').addEventListener('click', () => {
            window.location.href = '/deep-test';
        });
        
        document.getElementById('close-offer').addEventListener('click', () => {
            offerElement.remove();
        });
    }, 1000);
}

// инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    loadTestHistory();
});

// загрузка истории тестов
async function loadTestHistory() {
    try {
        const response = await fetch('/api/test-history?limit=5');
        const data = await response.json();
        
        if (data.tests && data.tests.length > 0) {
            const testsTakenElement = document.getElementById('tests-taken');
            const averageScoreElement = document.getElementById('average-score');
            const lastResultElement = document.getElementById('last-result');
            
            if (testsTakenElement) testsTakenElement.textContent = data.tests.length;
            if (averageScoreElement) {
                const totalScore = data.tests.reduce((sum, test) => sum + test.score, 0);
                averageScoreElement.textContent = (totalScore / data.tests.length).toFixed(1);
            }
            if (lastResultElement) {
                lastResultElement.textContent = `${data.tests[0].score.toFixed(1)}/5`;
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки истории:', error);
    }
}

// Обновленная функция для предложения углубленного теста
function showDeepTestOffer(score) {
    setTimeout(() => {
        const offerHtml = `
            <div class="deep-test-offer">
                <div class="offer-content">
                    <h3>🎯 Хотите получить более точные рекомендации?</h3>
                    <p>Ваш результат (${score.toFixed(1)}/5) показывает, что есть области для улучшения.</p>
                    <p>Пройдите углубленный тест по конкретной сфере жизни для персонализированного плана действий.</p>
                    <div class="offer-buttons">
                        <a href="deep-test.html" class="btn-offer-primary">Пройти углубленный тест</a>
                        <button class="btn-offer-secondary" id="close-offer">Спасибо, позже</button>
                    </div>
                </div>
            </div>
        `;
        
        const offerElement = document.createElement('div');
        offerElement.innerHTML = offerHtml;
        document.querySelector('.quiz-container')?.appendChild(offerElement);
        
        // Добавляем стили
        if (!document.querySelector('#deep-test-styles')) {
            const style = document.createElement('style');
            style.id = 'deep-test-styles';
            style.textContent = `
                .deep-test-offer {
                    margin-top: 30px;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 15px;
                    color: white;
                    animation: slideIn 0.5s ease-out;
                }
                @keyframes slideIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .offer-buttons {
                    display: flex;
                    gap: 15px;
                    margin-top: 20px;
                }
                .btn-offer-primary {
                    padding: 12px 24px;
                    background: white;
                    color: #667eea;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: transform 0.3s;
                    text-decoration: none;
                    display: inline-block;
                    text-align: center;
                }
                .btn-offer-primary:hover {
                    transform: translateY(-2px);
                    text-decoration: none;
                }
                .btn-offer-secondary {
                    padding: 12px 24px;
                    background: transparent;
                    color: white;
                    border: 2px solid white;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.3s;
                }
                .btn-offer-secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                @media (max-width: 768px) {
                    .offer-buttons {
                        flex-direction: column;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Обработчики событий
        document.getElementById('close-offer')?.addEventListener('click', () => {
            offerElement.remove();
        });
    }, 1000);
}

// Экспортируем функцию для глобального доступа
window.initializeQuiz = function() {
    // Ваша существующая инициализация quiz
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    loadTestHistory();
};

window.showDeepTestOffer = showDeepTestOffer;
