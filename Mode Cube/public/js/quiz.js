// элементы DOM
const submitBtn = document.getElementById('submit');
const resultDiv = document.getElementById('result');
const recommendationsDiv = document.getElementById('recommendations');
const options = document.querySelectorAll('.option');

// переменные для хранения ответов пользователя
let userAnswers = {};
let testCompleted = false;
let currentScore = 0;
let currentMoodLevel = 0;

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
submitBtn.addEventListener('click', function() {
    if (Object.keys(userAnswers).length < 6) {
        resultDiv.textContent = 'Пожалуйста, ответьте на все вопросы перед отправкой.';
        return;
    }
    
    // рассчитываем результат
    currentScore = calculateScore();
    currentMoodLevel = calculateMoodLevel(currentScore);
    
    // показываем результат
    showResult(currentScore, currentMoodLevel);
    
    // подсвечиваем ответы пользователя
    highlightAnswers();
    
    // обновляем цвет куба
    if (window.cubeController) {
        window.cubeController.updateCubeColor(currentMoodLevel);
    }
    
    // обновляем статистику и показываем умные подсказки
    updateStats(currentScore, currentMoodLevel);
    addSmartInsights(currentScore, currentMoodLevel);
    
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

// Кнопка сохранения в дневник
const saveToJournalBtn = document.createElement('button');
saveToJournalBtn.textContent = '💾 Сохранить в дневник';
saveToJournalBtn.className = 'submit-btn';
saveToJournalBtn.style.marginTop = '10px';
saveToJournalBtn.style.backgroundColor = '#4CAF50';

saveToJournalBtn.addEventListener('click', () => {
    if (typeof saveTestToJournal === 'function') {
        saveTestToJournal(currentScore, getMoodText(currentMoodLevel), userAnswers);
        saveToJournalBtn.disabled = true;
        saveToJournalBtn.textContent = '✅ Сохранено в дневник';
        saveToJournalBtn.style.backgroundColor = '#666';
    } else {
        alert('Дневник еще не активирован, создайте первую запись вручную!');
    }
});

// Вставляем кнопку после рекомендаций
recommendationsDiv.parentNode.insertBefore(saveToJournalBtn, recommendationsDiv.nextSibling);

// получить текстовое описание настроения
function getMoodText(moodLevel) {
    if (moodLevel >= 4.5) return 'Отличное 🌟';
    if (moodLevel >= 3.5) return 'Хорошее 😊';
    if (moodLevel >= 2.5) return 'Нормальное 🙂';
    if (moodLevel >= 1.5) return 'Подавленное 😔';
    return 'Плохое 😞';
}

// подсветка ответов
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

// УМНЫЕ ПОДСКАЗКИ - НОВАЯ ФУНКЦИЯ
function addSmartInsights(score, moodLevel) {
    const existingData = JSON.parse(localStorage.getItem('moodTests') || '[]');
    const totalTests = existingData.length + 1; // + текущий тест
    
    const insightsContainer = document.createElement('div');
    insightsContainer.className = 'smart-insights';
    insightsContainer.style.cssText = `
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 20px;
        margin-top: 20px;
        border-left: 4px solid #00dbde;
        animation: fadeIn 0.5s ease;
    `;
    
    let insightHTML = '<strong>🤖 Умные подсказки:</strong><br><br>';
    
    // Анализ текущего результата
    if (score < 2) {
        insightHTML += '<div class="insight-badge warning">⚠️ Критически низкое настроение</div><br>';
        insightHTML += 'Рекомендуем срочно отдохнуть и обратиться за поддержкой к близким или специалисту.<br><br>';
    } 
    else if (score < 2.5) {
        insightHTML += '<div class="insight-badge warning">📉 Низкое настроение</div><br>';
        insightHTML += 'Попробуйте прогулку, любимую музыку или хобби. Может помочь разговор с другом.<br><br>';
    }
    else if (score < 3) {
        insightHTML += '<div class="insight-badge info">🤔 Среднее настроение</div><br>';
        insightHTML += 'Всё в норме, но есть куда расти! Попробуйте небольшие улучшения в ежедневных привычках.<br><br>';
    }
    else if (score >= 4) {
        insightHTML += '<div class="insight-badge positive">🌟 Отличное настроение!</div><br>';
        insightHTML += 'Поделитесь позитивом с другими! Хорошее настроение заразительно.<br><br>';
    }
    
    // Анализ истории (если есть предыдущие тесты)
    if (existingData.length >= 2) {
        const lastThreeTests = existingData.slice(-2); // берем 2 предыдущих + текущий будет 3
        const testDates = lastThreeTests.map(test => new Date(test.date).toLocaleDateString('ru-RU'));
        
        // Проверяем 3 дня подряд низкого настроения
        const lowMoodTests = lastThreeTests.filter(test => test.score < 2.5);
        
        if (lowMoodTests.length >= 2 && score < 2.5) {
            insightHTML += '<div class="insight-badge warning">⏳ Уже несколько дней низкое настроение</div><br>';
            insightHTML += `Заметили тенденцию: ${testDates.join(', ')}. Это может быть признаком накопленного стресса.<br><br>`;
        }
        
        // Проверяем улучшение
        if (existingData.length >= 1) {
            const lastScore = existingData[existingData.length - 1].score;
            const improvement = score - lastScore;
            
            if (improvement > 0.5) {
                insightHTML += '<div class="insight-badge positive">📈 Настроение улучшается!</div><br>';
                insightHTML += `+${improvement.toFixed(1)} балла с последнего теста. Так держать!<br><br>`;
            } 
            else if (improvement < -0.5) {
                insightHTML += '<div class="insight-badge warning">📉 Настроение ухудшается</div><br>';
                insightHTML += `-${Math.abs(improvement).toFixed(1)} балла. Возможно, нужен отдых или смена деятельности.<br><br>`;
            }
        }
    }
    
    // Если это первый тест
    if (existingData.length === 0) {
        insightHTML += '<div class="insight-badge info">📝 Первая запись</div><br>';
        insightHTML += 'Рекомендуем проходить тест регулярно, чтобы отслеживать динамику настроения.<br><br>';
    }
    
    // Общая статистика
    insightHTML += `<small><i>Всего тестов: ${totalTests}. Записывайте настроение регулярно для лучшего анализа.</i></small>`;
    
    insightsContainer.innerHTML = insightHTML;
    
    // Вставляем после статистики
    const statsContainer = document.querySelector('.user-stats');
    if (statsContainer) {
        // Удаляем старые подсказки, если есть
        const oldInsights = statsContainer.querySelector('.smart-insights');
        if (oldInsights) oldInsights.remove();
        
        statsContainer.appendChild(insightsContainer);
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
    
    // обновляем счетчик тестов
    if (testsTakenElement) {
        const currentCount = parseInt(testsTakenElement.textContent) || 0;
        testsTakenElement.textContent = currentCount + 1;
    }
    
    // обновляем средний балл
    if (averageScoreElement) {
        const currentAvg = parseFloat(averageScoreElement.textContent) || score;
        const testsCount = parseInt(testsTakenElement.textContent) || 1;
        const newAvg = ((currentAvg * (testsCount - 1)) + score) / testsCount;
        averageScoreElement.textContent = newAvg.toFixed(1);
    }
    
    // сохраняем в localStorage
    saveToLocalStorage(score, moodLevel);
}

// сохранение в localStorage
function saveToLocalStorage(score, moodLevel) {
    const testData = {
        score: score,
        moodLevel: moodLevel,
        date: new Date().toISOString(),
        answers: userAnswers
    };
    
    const existingData = JSON.parse(localStorage.getItem('moodTests') || '[]');
    existingData.push(testData);
    localStorage.setItem('moodTests', JSON.stringify(existingData.slice(-10)));
}

// инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    loadTestHistory();
});

// загрузка истории тестов
function loadTestHistory() {
    const existingData = JSON.parse(localStorage.getItem('moodTests') || '[]');
    
    if (existingData.length > 0) {
        const testsTakenElement = document.getElementById('tests-taken');
        const averageScoreElement = document.getElementById('average-score');
        const lastResultElement = document.getElementById('last-result');
        
        if (testsTakenElement) testsTakenElement.textContent = existingData.length;
        if (averageScoreElement && existingData.length > 0) {
            const totalScore = existingData.reduce((sum, test) => sum + test.score, 0);
            averageScoreElement.textContent = (totalScore / existingData.length).toFixed(1);
        }
        if (lastResultElement && existingData.length > 0) {
            lastResultElement.textContent = `${existingData[existingData.length - 1].score.toFixed(1)}/5`;
        }
    }
}

