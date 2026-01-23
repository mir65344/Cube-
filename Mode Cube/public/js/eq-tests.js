/**
 * 🧠 СИСТЕМА ПСИХОЛОГИЧЕСКИХ ТЕСТОВ - ОПТИМИЗИРОВАННАЯ ВЕРСИЯ
 * Единая база эмоций и действий
 */

class TestSystem {
    constructor() {
        this.currentTest = null;
        this.currentQuestion = 0;
        this.userAnswers = [];
        this.testInProgress = false;
        this.testCompleted = false;
        
        // Базы данных
        this.emotionsDB = this.createEmotionsDatabase();
        this.actionsDB = this.createActionsDatabase();
        
        this.init();
    }

    init() {
        this.loadTestStats();
        this.setupEventListeners();
        this.updateTestSelection();
    }

    createEmotionsDatabase() {
        return {
            // Основные эмоции
            basic: ['радость', 'грусть', 'гнев', 'страх', 'удивление', 'отвращение'],
            
            // Сложные чувства
            complex: ['тревога', 'волнение', 'одиночество', 'обида', 'ревность', 'разочарование'],
            
            // Позитивные состояния
            positive: ['удовлетворение', 'вдохновение', 'гордость', 'благодарность', 'надежда', 'спокойствие'],
            
            // Социальные эмоции
            social: ['доверие', 'недоверие', 'уважение', 'презрение', 'восхищение', 'сочувствие'],
            
            // Все эмоции для поиска
            getAll() {
                return [...this.basic, ...this.complex, ...this.positive, ...this.social];
            }
        };
    }

    createActionsDatabase() {
        return {
            // Дыхательные техники
            breathing: [
                'глубокое дыхание',
                'диафрагмальное дыхание', 
                'дыхание 4-7-8',
                'осознанное дыхание'
            ],
            
            // Физические методы
            physical: [
                'прогулка на свежем воздухе',
                'растяжка', 
                'физические упражнения',
                'водные процедуры'
            ],
            
            // Когнитивные методы
            cognitive: [
                'позитивный внутренний диалог',
                'переоценка ситуации', 
                'фокусировка на решениях',
                'медитация'
            ],
            
            // Социальные методы
            social: [
                'разговор с близким',
                'просьба о помощи', 
                'совместная деятельность'
            ],
            
            // Все действия для поиска
            getAll() {
                return [...this.breathing, ...this.physical, ...this.cognitive, ...this.social];
            }
        };
    }

    setupEventListeners() {
        // Выбор теста
        document.querySelectorAll('.test-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.test-category-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');
                this.selectTest(e.target.dataset.test);
            });
        });

        // Кнопка начала теста
        const startBtn = document.getElementById('start-test');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startTest());
        }

        // Кнопки навигации
        const prevBtn = document.getElementById('prev-question');
        const nextBtn = document.getElementById('next-question');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevQuestion());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextQuestion());

        // Действия с результатами
        const saveBtn = document.getElementById('save-to-journal');
        const retakeBtn = document.getElementById('retake-test');
        
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveResultsToJournal());
        if (retakeBtn) retakeBtn.addEventListener('click', () => this.retakeTest());
    }

    selectTest(testType) {
        const testData = TESTS_DATA[testType];
        if (!testData) return;

        this.currentTest = testType;
        
        // Обновляем описание
        document.getElementById('test-title').textContent = testData.title;
        document.getElementById('test-description').textContent = testData.description;
        document.getElementById('test-time').textContent = testData.time;
        document.getElementById('test-questions').textContent = testData.questions.length + ' вопросов';
        document.getElementById('test-parts').textContent = testData.parts;
    }

    startTest() {
        if (!this.currentTest) {
            alert('Выберите тест для начала');
            return;
        }

        this.testInProgress = true;
        this.testCompleted = false;
        this.currentQuestion = 0;
        this.userAnswers = [];
        
        // Показываем контейнер теста
        document.getElementById('test-container').style.display = 'block';
        document.querySelector('.test-description').style.display = 'none';
        document.querySelector('.tests-selection').style.display = 'none';
        
        // Загружаем первый вопрос
        this.loadQuestion();
        this.updateProgress();
    }

    loadQuestion() {
        const testData = TESTS_DATA[this.currentTest];
        const question = testData.questions[this.currentQuestion];
        
        if (!question) {
            this.completeTest();
            return;
        }

        // Обновляем индикатор типа
        const typeIndicator = document.getElementById('test-type-indicator');
        if (question.type === 'theory') {
            typeIndicator.textContent = '📚 Теоретическая часть';
            typeIndicator.style.background = 'rgba(33, 150, 243, 0.2)';
        } else if (question.type === 'practice') {
            typeIndicator.textContent = '💡 Практическая часть';
            typeIndicator.style.background = 'rgba(76, 175, 80, 0.2)';
        } else if (question.type === 'multi') {
            typeIndicator.textContent = '📝 Множественный выбор';
            typeIndicator.style.background = 'rgba(255, 152, 0, 0.2)';
        }

        // Создаем HTML вопроса
        let questionHTML = `
            <div class="question" data-index="${this.currentQuestion}">
                <h3>${question.text}</h3>
        `;

        if (question.type === 'theory') {
            // Вопросы с выбором ответа
            questionHTML += '<div class="options">';
            question.options.forEach((option, index) => {
                questionHTML += `
                    <div class="option" data-value="${option.value}" data-index="${index}">
                        <span>${option.text}</span>
                    </div>
                `;
            });
            questionHTML += '</div>';
        } 
        else if (question.type === 'practice') {
            // Практические вопросы с кнопками эмоций
            questionHTML += `
                <div class="practice-section">
                    <p class="practice-instruction">${question.instruction || 'Выберите до 6 вариантов:'}</p>
                    
                    <!-- Контейнер для эмоций -->
                    <div class="emotions-grid" id="emotions-grid-${this.currentQuestion}">
                        ${this.generateEmotionButtons(question.emotions || this.getRandomEmotions(12))}
                    </div>
                    
                    <!-- Выбранные эмоции -->
                    <div class="selected-emotions">
                        <p>Выбрано: <span id="selected-count-${this.currentQuestion}">0</span>/6</p>
                        <div class="selected-list" id="selected-list-${this.currentQuestion}"></div>
                    </div>
                </div>
            `;
        }
        else if (question.type === 'multi') {
            // Вопросы с множественным выбором
            questionHTML += `
                <p class="multiple-hint">Можно выбрать несколько вариантов</p>
                <div class="options multiple">
            `;
            question.options.forEach((option, index) => {
                questionHTML += `
                    <div class="option" data-value="${option.value}" data-index="${index}">
                        <div class="checkbox"></div>
                        <span>${option.text}</span>
                    </div>
                `;
            });
            questionHTML += '</div>';
        }

        questionHTML += '</div>';

        // Вставляем вопрос
        document.getElementById('current-test').innerHTML = questionHTML;

        // Добавляем обработчики
        this.setupQuestionHandlers(question);

        // Обновляем кнопку "Назад"
        const prevBtn = document.getElementById('prev-question');
        if (prevBtn) {
            prevBtn.style.display = this.currentQuestion > 0 ? 'block' : 'none';
        }
    }

    generateEmotionButtons(emotions) {
        return emotions.map(emotion => `
            <button class="emotion-btn" data-emotion="${emotion}">
                ${emotion}
            </button>
        `).join('');
    }

    getRandomEmotions(count = 12) {
        const allEmotions = this.emotionsDB.getAll();
        return [...allEmotions]
            .sort(() => Math.random() - 0.5)
            .slice(0, count);
    }

    setupQuestionHandlers(question) {
        if (question.type === 'theory') {
            const options = document.querySelectorAll('.option');
            options.forEach(option => {
                option.addEventListener('click', () => {
                    if (this.testCompleted) return;
                    options.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    this.saveAnswer(question.type);
                });
            });
        } 
        else if (question.type === 'multi') {
            const options = document.querySelectorAll('.option');
            options.forEach(option => {
                option.addEventListener('click', () => {
                    if (this.testCompleted) return;
                    option.classList.toggle('selected');
                    const checkbox = option.querySelector('.checkbox');
                    if (checkbox) checkbox.classList.toggle('checked');
                    this.saveAnswer(question.type);
                });
            });
        }
        else if (question.type === 'practice') {
            this.setupPracticeHandlers(question);
        }
    }

    setupPracticeHandlers(question) {
        const containerId = `emotions-grid-${this.currentQuestion}`;
        const selectedListId = `selected-list-${this.currentQuestion}`;
        const countId = `selected-count-${this.currentQuestion}`;
        
        const emotionBtns = document.querySelectorAll(`#${containerId} .emotion-btn`);
        const selectedList = document.getElementById(selectedListId);
        const countElement = document.getElementById(countId);
        
        let selectedEmotions = this.userAnswers[this.currentQuestion] || [];
        
        // Инициализация выбранных эмоций
        this.updateSelectedList(selectedEmotions, selectedList, countElement);
        
        // Обработчики для кнопок эмоций
        emotionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const emotion = btn.dataset.emotion;
                
                if (selectedEmotions.includes(emotion)) {
                    // Удаляем если уже выбрана
                    selectedEmotions = selectedEmotions.filter(e => e !== emotion);
                    btn.classList.remove('selected');
                } else {
                    // Добавляем если есть место
                    if (selectedEmotions.length < 6) {
                        selectedEmotions.push(emotion);
                        btn.classList.add('selected');
                    } else {
                        alert('Максимум 6 эмоций');
                        return;
                    }
                }
                
                // Сохраняем ответ
                this.userAnswers[this.currentQuestion] = selectedEmotions;
                
                // Обновляем список выбранных
                this.updateSelectedList(selectedEmotions, selectedList, countElement);
            });
        });
    }

    updateSelectedList(emotions, listElement, countElement) {
        listElement.innerHTML = emotions.map(emotion => `
            <span class="selected-emotion">
                ${emotion}
                <button class="remove-emotion" data-emotion="${emotion}">×</button>
            </span>
        `).join('');
        
        countElement.textContent = emotions.length;
        
        // Обработчики для удаления
        listElement.querySelectorAll('.remove-emotion').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const emotion = btn.dataset.emotion;
                const newEmotions = emotions.filter(e => e !== emotion);
                this.userAnswers[this.currentQuestion] = newEmotions;
                this.updateSelectedList(newEmotions, listElement, countElement);
                
                // Снимаем выделение с кнопки
                const emotionBtn = document.querySelector(`.emotion-btn[data-emotion="${emotion}"]`);
                if (emotionBtn) emotionBtn.classList.remove('selected');
            });
        });
    }

    saveAnswer(type) {
        if (type === 'theory') {
            const selected = document.querySelector('.option.selected');
            this.userAnswers[this.currentQuestion] = selected ? 
                [selected.dataset.value] : [];
        } else if (type === 'multi') {
            const selected = document.querySelectorAll('.option.selected');
            this.userAnswers[this.currentQuestion] = 
                Array.from(selected).map(opt => opt.dataset.value);
        }
        // Для practice ответы сохраняются в setupPracticeHandlers
    }

    nextQuestion() {
        const testData = TESTS_DATA[this.currentTest];
        
        // Проверяем, что ответ дан
        if (testData.questions[this.currentQuestion].type === 'practice') {
            if (!this.userAnswers[this.currentQuestion] || 
                this.userAnswers[this.currentQuestion].length === 0) {
                alert('Пожалуйста, выберите хотя бы один вариант');
                return;
            }
        } else {
            if (!this.userAnswers[this.currentQuestion]) {
                alert('Пожалуйста, выберите ответ');
                return;
            }
        }

        // Переходим к следующему вопросу
        this.currentQuestion++;
        
        if (this.currentQuestion < testData.questions.length) {
            this.loadQuestion();
            this.updateProgress();
        } else {
            this.completeTest();
        }
    }

    prevQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.loadQuestion();
            this.updateProgress();
        }
    }

    updateProgress() {
        const testData = TESTS_DATA[this.currentTest];
        const progress = ((this.currentQuestion + 1) / testData.questions.length) * 100;
        
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) {
            progressText.textContent = `Вопрос ${this.currentQuestion + 1} из ${testData.questions.length}`;
        }
    }

    completeTest() {
        this.testInProgress = false;
        this.testCompleted = true;
        
        // Скрываем вопросы, показываем результаты
        document.getElementById('current-test').style.display = 'none';
        document.getElementById('test-results').style.display = 'block';
        
        const nextBtn = document.getElementById('next-question');
        const prevBtn = document.getElementById('prev-question');
        
        if (nextBtn) nextBtn.style.display = 'none';
        if (prevBtn) prevBtn.style.display = 'none';
        
        // Рассчитываем результаты
        this.calculateResults();
    }

    calculateResults() {
        const testData = TESTS_DATA[this.currentTest];
        const results = {
            totalScore: 0,
            maxScore: 0,
            aspects: {}
        };

        // Проходим по всем вопросам
        testData.questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index] || [];
            
            if (question.type === 'theory') {
                // Теоретические вопросы (1 правильный ответ)
                const maxPoints = question.points || 1;
                results.maxScore += maxPoints;
                
                if (userAnswer[0] === question.correctAnswer) {
                    results.totalScore += maxPoints;
                }
                
                // Записываем в аспекты
                if (question.aspect) {
                    if (!results.aspects[question.aspect]) {
                        results.aspects[question.aspect] = { score: 0, max: 0 };
                    }
                    results.aspects[question.aspect].max += maxPoints;
                    if (userAnswer[0] === question.correctAnswer) {
                        results.aspects[question.aspect].score += maxPoints;
                    }
                }
                
            } else if (question.type === 'multi') {
                // Множественный выбор
                const maxPoints = question.points || 2;
                results.maxScore += maxPoints;
                
                let points = 0;
                const correctSet = new Set(question.correctAnswers);
                const userSet = new Set(userAnswer);
                
                // За правильные ответы +1, за неправильные -1
                userAnswer.forEach(answer => {
                    if (correctSet.has(answer)) {
                        points += 1;
                    } else {
                        points -= 1;
                    }
                });
                
                points = Math.max(0, Math.min(points, maxPoints));
                results.totalScore += points;
                
                if (question.aspect) {
                    if (!results.aspects[question.aspect]) {
                        results.aspects[question.aspect] = { score: 0, max: 0 };
                    }
                    results.aspects[question.aspect].max += maxPoints;
                    results.aspects[question.aspect].score += points;
                }
                
            } else if (question.type === 'practice') {
                // Практические вопросы с эмоциями
                const maxPoints = question.correctAnswers.length;
                results.maxScore += maxPoints;
                
                let points = 0;
                const correctSet = new Set(question.correctAnswers);
                const incorrectSet = new Set(question.incorrectAnswers || []);
                
                userAnswer.forEach(answer => {
                    if (correctSet.has(answer)) {
                        points += 1;
                    } else if (incorrectSet.has(answer)) {
                        points -= 1;
                    }
                });
                
                points = Math.max(0, Math.min(points, maxPoints));
                results.totalScore += points;
                
                if (question.aspect) {
                    if (!results.aspects[question.aspect]) {
                        results.aspects[question.aspect] = { score: 0, max: 0 };
                    }
                    results.aspects[question.aspect].max += maxPoints;
                    results.aspects[question.aspect].score += points;
                }
            }
        });

        // Сохраняем результаты
        this.results = results;
        
        // Показываем результаты
        this.displayResults(results);
        
        // Сохраняем статистику
        this.saveTestStats(results);
    }

    displayResults(results) {
        const percentage = Math.round((results.totalScore / results.maxScore) * 100);
        
        // Общий балл
        const totalScoreElement = document.getElementById('total-score');
        if (totalScoreElement) {
            totalScoreElement.textContent = `${results.totalScore}/${results.maxScore} (${percentage}%)`;
        }
        
        // Сообщение
        const messageElement = document.getElementById('result-message');
        if (messageElement) {
            messageElement.textContent = this.getResultMessage(percentage);
        }
        
        // Аспекты
        const aspectsGrid = document.getElementById('aspects-grid');
        if (aspectsGrid) {
            let aspectsHTML = '';
            
            Object.keys(results.aspects).forEach(aspectKey => {
                const aspect = results.aspects[aspectKey];
                const aspectPercentage = Math.round((aspect.score / aspect.max) * 100);
                const aspectInfo = ASPECTS_INFO[this.currentTest]?.[aspectKey] || 
                                 { name: aspectKey, description: '' };
                
                let level = 'Низкий';
                let color = '#FF5252';
                
                if (aspectPercentage >= 80) {
                    level = 'Высокий';
                    color = '#4CAF50';
                } else if (aspectPercentage >= 60) {
                    level = 'Средний';
                    color = '#FF9800';
                }
                
                aspectsHTML += `
                    <div class="aspect-result-card">
                        <div class="aspect-header">
                            <h5>${aspectInfo.name}</h5>
                            <span class="aspect-level" style="background: ${color}20; color: ${color}">
                                ${level}
                            </span>
                        </div>
                        <p class="aspect-desc">${aspectInfo.description}</p>
                        <div class="aspect-score">
                            <span class="score-value">${aspect.score}/${aspect.max}</span>
                            <span class="score-percent">(${aspectPercentage}%)</span>
                        </div>
                        <div class="progress-bar-small">
                            <div class="progress-fill-small" style="width: ${aspectPercentage}%; background: ${color}"></div>
                        </div>
                    </div>
                `;
            });
            
            aspectsGrid.innerHTML = aspectsHTML;
        }
        
        // Рекомендации
        const recommendationsElement = document.getElementById('recommendations');
        if (recommendationsElement) {
            recommendationsElement.innerHTML = this.getRecommendations(percentage);
        }
    }

    getResultMessage(percentage) {
        if (percentage >= 90) {
            return 'Отличный результат! У вас хорошо развиты тестируемые навыки.';
        } else if (percentage >= 70) {
            return 'Хороший результат! Есть области для развития, но вы на правильном пути.';
        } else if (percentage >= 50) {
            return 'Средний результат. Базовые навыки присутствуют, есть куда расти.';
        } else {
            return 'Результат ниже среднего. Рекомендуем уделить внимание развитию этих навыков.';
        }
    }

    getRecommendations(percentage) {
        let recommendations = '<h4>📋 Рекомендации для развития</h4><ul>';
        
        if (percentage < 70) {
            recommendations += `
                <li>Практикуйте осознанность и рефлексию</li>
                <li>Ведите дневник эмоций</li>
                <li>Обращайте внимание на свои реакции в разных ситуациях</li>
            `;
            
            if (this.currentTest === 'eq') {
                recommendations += `
                    <li>Наблюдайте за своими эмоциями в течение дня</li>
                    <li>Изучайте литературу по эмоциональному интеллекту</li>
                `;
            } else if (this.currentTest === 'empathy') {
                recommendations += `
                    <li>Практикуйте активное слушание</li>
                    <li>Старайтесь понять чувства других людей</li>
                `;
            } else if (this.currentTest === 'calm' || this.currentTest === 'stress') {
                recommendations += `
                    <li>Изучите техники дыхания</li>
                    <li>Практикуйте короткие медитации</li>
                    <li>Регулярно делайте перерывы в работе</li>
                `;
            }
        } else {
            recommendations += `
                <li>Продолжайте развивать свои навыки</li>
                <li>Помогайте другим в развитии</li>
                <li>Ищите новые практики для совершенствования</li>
            `;
        }
        
        recommendations += '</ul>';
        return recommendations;
    }

    saveTestStats(results) {
        const stats = JSON.parse(localStorage.getItem('testStats') || '{}');
        
        if (!stats[this.currentTest]) {
            stats[this.currentTest] = [];
        }
        
        const testResult = {
            date: new Date().toISOString(),
            score: results.totalScore,
            maxScore: results.maxScore,
            percentage: Math.round((results.totalScore / results.maxScore) * 100),
            testType: this.currentTest
        };
        
        stats[this.currentTest].push(testResult);
        
        // Сохраняем только последние 10 результатов
        if (stats[this.currentTest].length > 10) {
            stats[this.currentTest] = stats[this.currentTest].slice(-10);
        }
        
        localStorage.setItem('testStats', JSON.stringify(stats));
        this.updateTestStats();
    }

    loadTestStats() {
        this.updateTestStats();
    }

    updateTestStats() {
        const stats = JSON.parse(localStorage.getItem('testStats') || '{}');
        
        let totalTests = 0;
        let totalEqScore = 0;
        let eqTests = 0;
        let lastTest = '-';
        
        Object.keys(stats).forEach(testType => {
            const testResults = stats[testType];
            totalTests += testResults.length;
            
            if (testType === 'eq') {
                testResults.forEach(result => {
                    totalEqScore += result.percentage;
                    eqTests++;
                });
            }
            
            if (testResults.length > 0) {
                const last = testResults[testResults.length - 1];
                if (last.date > lastTest || lastTest === '-') {
                    lastTest = new Date(last.date).toLocaleDateString('ru-RU');
                }
            }
        });
        
        const totalTestsElement = document.getElementById('total-tests');
        const lastTestElement = document.getElementById('last-test');
        const avgEqElement = document.getElementById('avg-eq');
        const progressElement = document.getElementById('progress');
        
        if (totalTestsElement) totalTestsElement.textContent = totalTests;
        if (lastTestElement) lastTestElement.textContent = lastTest;
        
        if (eqTests > 0 && avgEqElement) {
            avgEqElement.textContent = Math.round(totalEqScore / eqTests) + '%';
        }
        
        // Прогресс (процент пройденных тестов от всех доступных)
        const totalAvailableTests = Object.keys(TESTS_DATA).length;
        const progress = Math.min(100, Math.round((totalTests / (totalAvailableTests * 3)) * 100));
        if (progressElement) progressElement.textContent = progress + '%';
    }

    saveResultsToJournal() {
        if (!window.moodJournal) {
            // Если дневник не загружен, сохраняем напрямую в localStorage
            const entries = JSON.parse(localStorage.getItem('moodJournalEntries') || '[]');
            const entry = {
                id: Date.now(),
                date: new Date().toISOString(),
                mood: 3, // Среднее настроение
                moodText: 'Нормальное',
                notes: `Результат теста "${TESTS_DATA[this.currentTest].title}": ${this.results.totalScore}/${this.results.maxScore} баллов`,
                activities: ['тест', this.currentTest],
                tags: ['тест', 'психология', 'результат'],
                createdAt: new Date().toISOString()
            };
            
            entries.unshift(entry);
            localStorage.setItem('moodJournalEntries', JSON.stringify(entries));
            alert('Результаты сохранены в дневник!');
        } else {
            window.moodJournal.addEntry({
                mood: 3,
                moodText: 'Нормальное',
                notes: `Результат теста "${TESTS_DATA[this.currentTest].title}": ${this.results.totalScore}/${this.results.maxScore} баллов`,
                activities: ['тест', this.currentTest],
                tags: ['тест', 'психология', 'результат']
            });
            
            alert('Результаты сохранены в дневник!');
        }
    }

    retakeTest() {
        const testResults = document.getElementById('test-results');
        const currentTest = document.getElementById('current-test');
        const nextBtn = document.getElementById('next-question');
        
        if (testResults) testResults.style.display = 'none';
        if (currentTest) currentTest.style.display = 'block';
        if (nextBtn) nextBtn.style.display = 'block';
        
        this.startTest();
    }
}

// ============================================================================
// БАЗА ДАННЫХ ТЕСТОВ - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ============================================================================

const TESTS_DATA = {
    // ТЕСТ НА ЭМОЦИОНАЛЬНЫЙ ИНТЕЛЛЕКТ
    eq: {
        title: '🧠 Тест на эмоциональный интеллект',
        description: 'Измерьте вашу способность понимать и управлять своими эмоциями',
        time: '5-7 минут',
        parts: 'Теория + Практика',
        questions: [
            {
                type: 'theory',
                text: 'Когда вы видите, что кто-то расстроен, вы обычно:',
                aspect: 'empathy',
                correctAnswer: '3',
                points: 3,
                options: [
                    { text: 'Сразу понимаете, что человек чувствует и почему', value: '3' },
                    { text: 'Замечаете, что что-то не так, но не всегда понимаете причину', value: '2' },
                    { text: 'Часто не замечаете, пока человек сам не скажет', value: '1' }
                ]
            },
            {
                type: 'theory',
                text: 'В стрессовой ситуации вы:',
                aspect: 'self_control',
                correctAnswer: '3',
                points: 3,
                options: [
                    { text: 'Сохраняете спокойствие и ясно мыслите', value: '3' },
                    { text: 'Иногда теряете самообладание, но быстро восстанавливаетесь', value: '2' },
                    { text: 'Часто поддаётесь панике или гневу', value: '1' }
                ]
            },
            {
                type: 'theory',
                text: 'Как вы обычно реагируете на критику?',
                aspect: 'self_awareness',
                correctAnswer: '3',
                points: 3,
                options: [
                    { text: 'Слушаю, анализирую и извлекаю уроки', value: '3' },
                    { text: 'Защищаюсь, но потом обдумываю', value: '2' },
                    { text: 'Сразу обижаюсь или злюсь', value: '1' }
                ]
            },
            {
                type: 'multi',
                text: 'Какие эмоции вы чаще всего испытываете в течение дня? (выберите до 3)',
                aspect: 'emotional_range',
                correctAnswers: ['радость', 'спокойствие', 'интерес', 'удовлетворённость'],
                points: 3,
                options: [
                    { text: 'радость', value: 'радость' },
                    { text: 'спокойствие', value: 'спокойствие' },
                    { text: 'интерес', value: 'интерес' },
                    { text: 'тревога', value: 'тревога' },
                    { text: 'гнев', value: 'гнев' },
                    { text: 'скука', value: 'скука' }
                ]
            },
            {
                type: 'practice',
                text: 'Какие эмоции вы испытываете перед важной встречей?',
                aspect: 'emotion_recognition',
                instruction: 'Выберите до 6 эмоций, которые описывают ваше состояние:',
                correctAnswers: ['волнение', 'интерес', 'ответственность', 'сосредоточенность'],
                incorrectAnswers: ['безразличие', 'апатия', 'злость', 'отвращение']
            }
        ]
    },
    
    // ТЕСТ НА ЭМПАТИЮ
    empathy: {
        title: '💝 Тест на эмпатию',
        description: 'Измерьте вашу способность понимать и разделять чувства других',
        time: '4-6 минут',
        parts: 'Теория + Практика',
        questions: [
            {
                type: 'theory',
                text: 'Когда друг рассказывает о своей проблеме, вы обычно:',
                aspect: 'active_listening',
                correctAnswer: '3',
                options: [
                    { text: 'Слушаете внимательно, задаете уточняющие вопросы', value: '3' },
                    { text: 'Слушаете, но иногда отвлекаетесь', value: '2' },
                    { text: 'Сразу предлагаете решение', value: '1' }
                ]
            },
            {
                type: 'practice',
                text: 'Ваш коллега получил повышение. Какие эмоции он может испытывать?',
                aspect: 'empathy_recognition',
                instruction: 'Выберите вероятные эмоции:',
                correctAnswers: ['радость', 'гордость', 'удовлетворение', 'ответственность'],
                incorrectAnswers: ['разочарование', 'злость', 'зависть', 'скука']
            }
        ]
    },
    
    // ТЕСТ НА СОЦИАЛЬНЫЙ ИНТЕЛЛЕКТ
    social: {
        title: '👥 Тест на социальный интеллект',
        description: 'Оцените вашу способность понимать социальные ситуации',
        time: '3-5 минут',
        parts: 'Теория + Практика',
        questions: [
            {
                type: 'theory',
                text: 'В новой компании вы обычно:',
                aspect: 'social_adaptation',
                correctAnswer: '2',
                options: [
                    { text: 'Быстро находите общий язык со всеми', value: '3' },
                    { text: 'Присматриваетесь, затем вступаете в контакт', value: '2' },
                    { text: 'Ждете, когда к вам подойдут', value: '1' }
                ]
            }
        ]
    },
    
    // ТЕСТ НА САМОРЕГУЛЯЦИЮ
    calm: {
        title: '🧘 Тест на саморегуляцию',
        description: 'Оцените ваши способности успокаивать себя в стрессовых ситуациях',
        time: '5-7 минут',
        parts: 'Теория + Практика',
        questions: [
            {
                type: 'practice',
                text: 'Какие методы помогают вам успокоиться?',
                aspect: 'stress_management',
                instruction: 'Выберите до 6 эффективных для вас методов:',
                correctAnswers: ['глубокое дыхание', 'прогулка на свежем воздухе', 'разговор с близким', 'медитация'],
                incorrectAnswers: ['игнорирование проблемы', 'самокритика', 'паника']
            }
        ]
    },
    
    // ТЕСТ НА УПРАВЛЕНИЕ СТРЕССОМ
    stress: {
        title: '⚡ Тест на управление стрессом',
        description: 'Оцените вашу устойчивость к стрессу',
        time: '4-6 минут',
        parts: 'Теория',
        questions: [
            {
                type: 'theory',
                text: 'При сильном стрессе вы обычно:',
                aspect: 'stress_response',
                correctAnswer: '2',
                options: [
                    { text: 'Сохраняете ясность мышления и действуете по плану', value: '3' },
                    { text: 'Нуждаетесь в небольшой паузе, чтобы собраться', value: '2' },
                    { text: 'Теряете способность мыслить рационально', value: '1' }
                ]
            }
        ]
    }
};

// Информация об аспектах
const ASPECTS_INFO = {
    eq: {
        empathy: { name: 'Эмпатия', description: 'Способность понимать чувства других' },
        self_control: { name: 'Самоконтроль', description: 'Управление своими эмоциями' },
        self_awareness: { name: 'Самосознание', description: 'Понимание собственных эмоций' },
        emotional_range: { name: 'Эмоциональный диапазон', description: 'Разнообразие переживаемых эмоций' },
        emotion_recognition: { name: 'Распознавание эмоций', description: 'Определение собственных эмоций' }
    },
    empathy: {
        active_listening: { name: 'Активное слушание', description: 'Внимание к словам и чувствам собеседника' },
        empathy_recognition: { name: 'Распознавание эмоций других', description: 'Определение эмоций других людей' }
    },
    social: {
        social_adaptation: { name: 'Социальная адаптация', description: 'Приспособление к разным социальным контекстам' }
    },
    calm: {
        stress_management: { name: 'Управление стрессом', description: 'Способность снижать уровень стресса' }
    },
    stress: {
        stress_response: { name: 'Реакция на стресс', description: 'Поведение в стрессовых ситуациях' }
    }
};

// Инициализация системы тестов
document.addEventListener('DOMContentLoaded', () => {
    window.testSystem = new TestSystem();
});
