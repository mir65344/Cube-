/**
 * 🧠 СИСТЕМА ПСИХОЛОГИЧЕСКИХ ТЕСТОВ
 * Включает: EQ, эмпатия, социальный интеллект, самоуспокоение
 */

class TestSystem {
    constructor() {
        this.currentTest = null;
        this.currentQuestion = 0;
        this.userAnswers = [];
        this.testInProgress = false;
        this.testCompleted = false;
        
        this.init();
    }

    init() {
        this.loadTestStats();
        this.setupEventListeners();
        this.updateTestSelection();
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
        document.getElementById('start-test').addEventListener('click', () => {
            this.startTest();
        });

        // Кнопки навигации
        document.getElementById('prev-question').addEventListener('click', () => {
            this.prevQuestion();
        });

        document.getElementById('next-question').addEventListener('click', () => {
            this.nextQuestion();
        });

        // Действия с результатами
        document.getElementById('save-to-journal').addEventListener('click', () => {
            this.saveResultsToJournal();
        });

        document.getElementById('retake-test').addEventListener('click', () => {
            this.retakeTest();
        });
    }

    selectTest(testType) {
        const testData = TESTS_DATA[testType];
        if (!testData) return;

        this.currentTest = testType;
        
        // Обновляем описание
        document.getElementById('test-title').textContent = testData.title;
        document.getElementById('test-description').textContent = testData.description;
        document.getElementById('test-time').textContent = testData.time;
        document.getElementById('test-questions').textContent = testData.questions;
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
        } else {
            typeIndicator.textContent = '💡 Практическая часть';
            typeIndicator.style.background = 'rgba(76, 175, 80, 0.2)';
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
        } else if (question.type === 'practice') {
            // Практические вопросы с вводом ответов
            questionHTML += `
                <div class="practice-question">
                    <p class="practice-scenario">${question.scenario}</p>
                    <div class="practice-instructions">
                        <p><strong>Задание:</strong> ${question.instruction}</p>
                        <p class="hint">${question.hint || 'Введите свои ответы через запятую или с новой строки'}</p>
                    </div>
                    
                    <div class="practice-input-container">
                        <textarea 
                            id="practice-input" 
                            placeholder="${question.placeholder || 'Введите ответы...'}" 
                            rows="4"
                        ></textarea>
                        
                        <!-- Автоподсказки (скрыты изначально) -->
                        <div class="autocomplete-hints" id="autocomplete-hints" style="display: none;">
                            <p class="hint-title">Возможные варианты:</p>
                            <div class="hint-list"></div>
                        </div>
                    </div>
                    
                    <!-- Кнопка для добавления варианта -->
                    <div class="add-hint-container">
                        <input type="text" id="add-hint-input" placeholder="Добавить свой вариант...">
                        <button id="add-hint-btn" class="nav-btn">+ Добавить</button>
                    </div>
                    
                    <!-- Выбранные варианты -->
                    <div class="selected-hints" id="selected-hints"></div>
                </div>
            `;
        } else if (question.type === 'multi') {
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
        document.getElementById('prev-question').style.display = 
            this.currentQuestion > 0 ? 'block' : 'none';
    }

    setupQuestionHandlers(question) {
        if (question.type === 'theory' || question.type === 'multi') {
            const options = document.querySelectorAll('.option');
            options.forEach(option => {
                option.addEventListener('click', () => {
                    if (this.testCompleted) return;

                    if (question.type === 'theory') {
                        // Одиночный выбор
                        options.forEach(opt => opt.classList.remove('selected'));
                        option.classList.add('selected');
                    } else {
                        // Множественный выбор
                        option.classList.toggle('selected');
                        const checkbox = option.querySelector('.checkbox');
                        if (checkbox) checkbox.classList.toggle('checked');
                    }

                    // Сохраняем ответ
                    this.saveAnswer(question.type);
                });
            });
        } else if (question.type === 'practice') {
            this.setupPracticeHandlers(question);
        }
    }

    setupPracticeHandlers(question) {
        const textarea = document.getElementById('practice-input');
        const hintsContainer = document.getElementById('autocomplete-hints');
        const hintList = hintsContainer.querySelector('.hint-list');
        const selectedContainer = document.getElementById('selected-hints');
        const addHintInput = document.getElementById('add-hint-input');
        const addHintBtn = document.getElementById('add-hint-btn');

        // Создаем список возможных ответов
        const allHints = [...question.correctAnswers, ...question.incorrectAnswers];
        this.shuffleArray(allHints);

        // Отображаем подсказки
        hintList.innerHTML = '';
        allHints.forEach(hint => {
            const hintElement = document.createElement('div');
            hintElement.className = 'hint-item';
            hintElement.textContent = hint;
            hintElement.addEventListener('click', () => {
                this.addSelectedHint(hint, question);
            });
            hintList.appendChild(hintElement);
        });

        // Показываем подсказки при фокусе
        textarea.addEventListener('focus', () => {
            hintsContainer.style.display = 'block';
        });

        // Парсинг введенного текста
        textarea.addEventListener('input', () => {
            const text = textarea.value.trim();
            if (text) {
                // Разбиваем на отдельные ответы
                const answers = text.split(/[,\n]/)
                    .map(a => a.trim())
                    .filter(a => a.length > 0);
                
                // Сохраняем ответы
                this.userAnswers[this.currentQuestion] = answers;
            }
        });

        // Кнопка добавления своего варианта
        addHintBtn.addEventListener('click', () => {
            const customHint = addHintInput.value.trim();
            if (customHint && !this.isHintSelected(customHint)) {
                this.addSelectedHint(customHint, question);
                addHintInput.value = '';
            }
        });

        // Enter для добавления
        addHintInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addHintBtn.click();
            }
        });

        // Загружаем ранее выбранные ответы
        if (this.userAnswers[this.currentQuestion]) {
            this.userAnswers[this.currentQuestion].forEach(answer => {
                this.addSelectedHint(answer, question);
            });
        }
    }

    addSelectedHint(hint, question) {
        const selectedContainer = document.getElementById('selected-hints');
        
        // Проверяем, не добавлен ли уже
        if (this.isHintSelected(hint)) return;

        // Создаем элемент выбранной подсказки
        const selectedHint = document.createElement('div');
        selectedHint.className = 'selected-hint';
        selectedHint.innerHTML = `
            ${hint}
            <button class="remove-hint" data-hint="${hint}">×</button>
        `;

        // Добавляем обработчик удаления
        selectedHint.querySelector('.remove-hint').addEventListener('click', (e) => {
            e.stopPropagation();
            selectedHint.remove();
            this.removeHintFromAnswers(hint);
        });

        selectedContainer.appendChild(selectedHint);

        // Добавляем в ответы
        if (!this.userAnswers[this.currentQuestion]) {
            this.userAnswers[this.currentQuestion] = [];
        }
        if (!this.userAnswers[this.currentQuestion].includes(hint)) {
            this.userAnswers[this.currentQuestion].push(hint);
        }

        // Ограничиваем количество
        if (this.userAnswers[this.currentQuestion].length >= 5) {
            document.getElementById('practice-input').disabled = true;
            document.getElementById('add-hint-input').disabled = true;
        }
    }

    isHintSelected(hint) {
        const selectedHints = document.querySelectorAll('.selected-hint');
        return Array.from(selectedHints).some(el => 
            el.textContent.replace('×', '').trim() === hint
        );
    }

    removeHintFromAnswers(hint) {
        if (this.userAnswers[this.currentQuestion]) {
            this.userAnswers[this.currentQuestion] = 
                this.userAnswers[this.currentQuestion].filter(a => a !== hint);
        }
        
        // Разблокируем ввод если нужно
        if (this.userAnswers[this.currentQuestion].length < 5) {
            document.getElementById('practice-input').disabled = false;
            document.getElementById('add-hint-input').disabled = false;
        }
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
    }

    nextQuestion() {
        const testData = TESTS_DATA[this.currentTest];
        
        // Проверяем, что ответ дан
        if (testData.questions[this.currentQuestion].type === 'practice') {
            if (!this.userAnswers[this.currentQuestion] || 
                this.userAnswers[this.currentQuestion].length === 0) {
                alert('Пожалуйста, введите хотя бы один ответ');
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
        
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = 
            `Вопрос ${this.currentQuestion + 1} из ${testData.questions.length}`;
    }

    completeTest() {
        this.testInProgress = false;
        this.testCompleted = true;
        
        // Скрываем вопросы, показываем результаты
        document.getElementById('current-test').style.display = 'none';
        document.getElementById('test-results').style.display = 'block';
        document.getElementById('next-question').style.display = 'none';
        document.getElementById('prev-question').style.display = 'none';
        
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
                // Практические вопросы с вводом ответов
                const maxPoints = question.correctAnswers.length;
                results.maxScore += maxPoints;
                
                let points = 0;
                const correctSet = new Set(question.correctAnswers);
                const incorrectSet = new Set(question.incorrectAnswers);
                
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
        document.getElementById('total-score').textContent = 
            `${results.totalScore}/${results.maxScore} (${percentage}%)`;
        
        // Сообщение
        const message = this.getResultMessage(percentage);
        document.getElementById('result-message').textContent = message;
        
        // Аспекты
        const aspectsGrid = document.getElementById('aspects-grid');
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
        
        // Рекомендации
        const recommendations = this.getRecommendations(percentage);
        document.getElementById('recommendations').innerHTML = recommendations;
    }

    getResultMessage(percentage) {
        if (percentage >= 90) {
            return 'Потрясающий результат! У вас отлично развиты навыки, которые вы тестировали.';
        } else if (percentage >= 70) {
            return 'Хороший результат! Есть некоторые области для развития, но в целом вы на правильном пути.';
        } else if (percentage >= 50) {
            return 'Средний результат. Есть над чем поработать, но базовые навыки присутствуют.';
        } else {
            return 'Результат ниже среднего. Рекомендуем уделить внимание развитию этих навыков.';
        }
    }

    getRecommendations(percentage) {
        const testData = TESTS_DATA[this.currentTest];
        let recommendations = '<h4>📋 Рекомендации для развития</h4><ul>';
        
        if (percentage < 70) {
            recommendations += `
                <li>Практикуйте осознанность и рефлексию</li>
                <li>Читайте литературу по развитию эмоционального интеллекта</li>
                <li>Обращайте внимание на свои эмоции в повседневных ситуациях</li>
            `;
            
            if (this.currentTest === 'empathy') {
                recommendations += `
                    <li>Попробуйте практику "активного слушания"</li>
                    <li>Чаще задавайте вопросы о чувствах других людей</li>
                `;
            } else if (this.currentTest === 'social') {
                recommendations += `
                    <li>Участвуйте в групповых обсуждениях</li>
                    <li>Наблюдайте за успешными коммуникаторами</li>
                `;
            } else if (this.currentTest === 'calm') {
                recommendations += `
                    <li>Изучите техники глубокого дыхания</li>
                    <li>Практикуйте медитацию 5-10 минут в день</li>
                `;
            }
        } else {
            recommendations += `
                <li>Продолжайте практиковать и развивать свои навыки</li>
                <li>Помогайте другим развивать аналогичные навыки</li>
                <li>Попробуйте более сложные тесты и практики</li>
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
        
        document.getElementById('total-tests').textContent = totalTests;
        document.getElementById('last-test').textContent = lastTest;
        
        if (eqTests > 0) {
            document.getElementById('avg-eq').textContent = 
                Math.round(totalEqScore / eqTests) + '%';
        }
        
        // Прогресс (процент пройденных тестов от всех доступных)
        const totalAvailableTests = Object.keys(TESTS_DATA).length;
        const progress = Math.min(100, Math.round((totalTests / (totalAvailableTests * 3)) * 100));
        document.getElementById('progress').textContent = progress + '%';
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
        document.getElementById('test-results').style.display = 'none';
        document.getElementById('current-test').style.display = 'block';
        document.getElementById('next-question').style.display = 'block';
        
        this.startTest();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    updateTestSelection() {
        // Выбираем первый тест по умолчанию
        this.selectTest('eq');
    }
}

// ============================================================================
// БАЗА ДАННЫХ ТЕСТОВ
// ============================================================================

const TESTS_DATA = {
    // ТЕСТ НА ЭМОЦИОНАЛЬНЫЙ ИНТЕЛЛЕКТ
    eq: {
        title: '🧠 Тест на эмоциональный интеллект',
        description: 'Измерьте вашу способность понимать, использовать и управлять своими эмоциями',
        time: '5 минут',
        questions: '15 вопросов',
        parts: 'Теоретическая + Практическая часть',
        questions: [
            // Теоретические вопросы
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
                type: 'theory',
                text: 'Если вы опаздываете на важную встречу, как вы себя ведёте?',
                aspect: 'self_awareness',
                correctAnswer: '3',
                points: 3,
                options: [
                    { text: 'Стараюсь успокоиться и не винить себя', value: '3' },
                    { text: 'Придумываю как оправдаться, стараюсь успокоиться', value: '2' },
                    { text: 'Как я мог опоздать на такую важную встречу? Буду очень торопиться, придумаю оправдание и буду винить себя.', value: '1' }
                ]
            },
            {
                type: 'multi',
                text: 'Какие эмоции вы чаще всего испытываете в течение дня? (выберите до 3)',
                aspect: 'emotional_range',
                correctAnswers: ['радость', 'спокойствие', 'интерес', 'удовлетворённость'],
                incorrectAnswers: ['гнев', 'тревога', 'скука', 'раздражение', 'не знаю'],
                points: 3
            },
            {
                type: 'multi',
                text: 'Какие эмоции/чувства/состояния вы испытываете перед важной встречей? (выберите до 3)',
                aspect: 'emotional_range',
                correctAnswers: ['возможность', 'спокойствие', 'интерес', 'удовлетворённость', 'небольшой стресс', 'оптимизм', 'реализм'],
                incorrectAnswers: ['гнев', 'тревога', 'скука', 'раздражение', 'не знаю', 'пессимизм', 'страх'],
                points: 3
            },
            // Практические вопросы (случайно выбираются из базы)
            {
                type: 'practice',
                text: 'Практическая задача: Распознавание эмоций',
                aspect: 'emotion_recognition',
                scenario: 'Вы видите коллегу, который только что вышел из кабинета начальника. Он избегает зрительного контакта, говорит тихим голосом и постоянно поправляет галстук.',
                instruction: 'Какие эмоции, по вашему мнению, испытывает коллега?',
                hint: 'Введите через запятую до 5 предполагаемых эмоций',
                placeholder: 'Введите через запятую до 5 предполагаемых эмоций. Например: тревога, неуверенность, волнение, спокойствие...',
                correctAnswers: ['тревога', 'нервозность', 'неуверенность', 'волнение', 'опасение'],
                incorrectAnswers: ['радость', 'гнев', 'отвращение', 'гордость', 'облегчение', 'спокойствие', 'удовлетворённость', 'сосредоточенность']
            }
        ]
    },
    
    // ТЕСТ НА ЭМПАТИЮ
    empathy: {
        title: '💝 Тест на эмпатию',
        description: 'Измерьте вашу способность понимать и разделять чувства других людей',
        time: '5 минут',
        questions: '12 вопросов',
        parts: 'Теоретическая + Практическая часть',
        questions: [
            // База практических вопросов для случайного выбора
            {
                type: 'practice',
                text: 'Ситуация 1: Офисный конфликт',
                aspect: 'empathy_recognition',
                scenario: 'Два коллеги спорят из-за проекта. Один говорит громко и жестикулирует, другой молчит и смотрит в пол.',
                instruction: 'Что чувствует каждый из участников ситуации?',
                hint: 'Для каждого человека укажите 2-3 основные эмоции',
                placeholder: 'Первый: ... Второй: ...',
                correctAnswers: ['первый: раздражение, гнев, фруструация', 
                                'второй: обида, подавленность, беспомощность'],
                incorrectAnswers: ['первый: радость, удовольствие', 
                                  'второй: безразличие, скука']
            },
            {
                type: 'practice',
                text: 'Ситуация 2: Семейный ужин',
                aspect: 'empathy_recognition',
                scenario: 'За ужином подросток рассказывает о проблемах в школе. Родитель слушает, но постоянно проверяет телефон.',
                instruction: 'Какие эмоции испытывает подросток в этой ситуации?',
                correctAnswers: ['разочарование', 'обида', 'одиночество', 'неважность'],
                incorrectAnswers: ['радость', 'гордость', 'облегчение', 'безразличие']
            },
            // Теоретические вопросы
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
                type: 'multi',
                text: 'В каких ситуациях вы обычно проявляете эмпатию?',
                aspect: 'empathy_expression',
                correctAnswers: ['когда близкому плохо', 'при виде несправедливости', 'когда человек просит поддержки', 'при просмотре фильмов к персонажам'],
                incorrectAnswers: ['всегда', 'никогда', 'только если это выгодно', 'только с близкими родственниками'],
                points: 2
            }
        ]
    },
    
    // ТЕСТ НА СОЦИАЛЬНЫЙ ИНТЕЛЛЕКТ
    social: {
        title: '👥 Тест на социальный интеллект',
        description: 'Оцените вашу способность понимать социальные ситуации и эффективно взаимодействовать',
        time: '5 минут',
        questions: '3 вопроса',
        parts: 'Теоретическая + Практическая часть',
        questions: [
            {
                type: 'practice',
                text: 'Ситуация: Сложные переговоры',
                aspect: 'social_perception',
                scenario: 'На совещании один участник постоянно перебивает других, говорит уверенно, но его идеи непрактичны.',
                instruction: 'Как бы вы поступили в этой ситуации?',
                correctAnswers: ['выслушать всех', 'задать уточняющие вопросы', 'предложить структурировать обсуждение'],
                incorrectAnswers: ['перебить в ответ', 'промолчать', 'сразу критиковать идеи', 'выйти из совещания']
            },
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
    
    // ТЕСТ НА СПОСОБНОСТЬ УСПОКОИТЬ СЕБЯ
    calm: {
        title: '🧘 Тест на саморегуляцию',
        description: 'Оцените ваши способности успокаивать себя в стрессовых ситуациях',
        time: '8-10 минут',
        questions: '10 вопросов',
        parts: 'Теоретическая + Практическая часть',
        questions: [
            {
                type: 'practice',
                text: 'Ситуация: Проваленный дедлайн',
                aspect: 'stress_management',
                scenario: 'Вы не успели выполнить важную работу к сроку. Начальник требует объяснений.',
                instruction: 'Какие техники вы бы использовали, чтобы успокоиться?',
                correctAnswers: ['глубокое дыхание', 'перерыв 5 минут', 'позитивный внутренний диалог'],
                incorrectAnswers: ['игнорирование проблемы', 'самокритика', 'паника']
            },
            {
                type: 'multi',
                text: 'Какие методы вы используете для снятия напряжения?',
                aspect: 'coping_strategies',
                correctAnswers: ['дыхательные упражнения', 'физическая активность', 'разговор с близким'],
                incorrectAnswers: ['алкоголь', 'агрессия', 'игнорирование эмоций']
            }
        ]
    },
    
    // ТЕСТ НА УПРАВЛЕНИЕ СТРЕССОМ
    stress: {
        title: '⚡ Тест на управление стрессом',
        description: 'Оцените вашу устойчивость к стрессу и методы совладания',
        time: '5 минут',
        questions: '12 вопросов',
        parts: 'Теоретическая + Практическая часть',
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
            },
            {
                type: 'practice',
                text: 'Ситуация: Многозадачность',
                aspect: 'multitasking_stress',
                scenario: 'У вас одновременно: срочный звонок, три непрочитанных письма и коллега с вопросом.',
                instruction: 'Как бы вы расставили приоритеты и успокоились?',
                correctAnswers: ['определить срочность задач', 'сделать глубокий вдох', 'начать с самой важной задачи'],
                incorrectAnswers: ['паниковать', 'браться за все сразу', 'игнорировать все']
            }
        ]
    }
};

// Информация об аспектах для каждого теста
const ASPECTS_INFO = {
    eq: {
        empathy: { name: 'Эмпатия', description: 'Способность понимать чувства других' },
        self_control: { name: 'Самоконтроль', description: 'Управление своими эмоциями' },
        self_awareness: { name: 'Самосознание', description: 'Понимание собственных эмоций' },
        emotional_range: { name: 'Эмоциональный диапазон', description: 'Разнообразие переживаемых эмоций' },
        emotion_recognition: { name: 'Распознавание эмоций', description: 'Определение эмоций по невербальным сигналам' }
    },
    empathy: {
        empathy_recognition: { name: 'Распознавание эмпатии', description: 'Определение эмоционального состояния других' },
        active_listening: { name: 'Активное слушание', description: 'Внимание к словам и чувствам собеседника' },
        empathy_expression: { name: 'Проявление эмпатии', description: 'Выражение понимания и поддержки' }
    },
    social: {
        social_perception: { name: 'Социальное восприятие', description: 'Понимание социальных ситуаций' },
        social_adaptation: { name: 'Социальная адаптация', description: 'Приспособление к разным социальным контекстам' }
    },
    calm: {
        stress_management: { name: 'Управление стрессом', description: 'Способность снижать уровень стресса' },
        coping_strategies: { name: 'Стратегии совладания', description: 'Эффективные методы саморегуляции' }
    },
    stress: {
        stress_response: { name: 'Реакция на стресс', description: 'Поведение в стрессовых ситуациях' },
        multitasking_stress: { name: 'Стресс при многозадачности', description: 'Управление несколькими задачами' }
    }
};

// Инициализация системы тестов
document.addEventListener('DOMContentLoaded', () => {
    window.testSystem = new TestSystem();
});

// Функция для получения случайных вопросов из базы
function getRandomQuestions(testType, count = 2) {
    const testData = TESTS_DATA[testType];
    const allQuestions = [...testData.questions];
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Функция для перемешивания вариантов ответов
function shuffleOptions(question) {
    if (question.options) {
        const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
        return { ...question, options: shuffledOptions };
    }
    return question;
}

