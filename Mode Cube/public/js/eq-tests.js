/**
 * 🧠 УПРОЩЕННАЯ СИСТЕМА ПСИХОЛОГИЧЕСКИХ ТЕСТОВ
 * Только EQ, эмпатия и социальный интеллект
 */

class SimpleTestSystem {
    constructor() {
        this.currentTest = null;
        this.currentQuestion = 0;
        this.userAnswers = [];
        this.testInProgress = false;
        this.testCompleted = false;
        this.allQuestions = {};
        
        this.init();
    }

    init() {
        this.loadQuestions();
        this.setupEventListeners();
        this.loadTestStats();
    }

    loadQuestions() {
        // База вопросов для EQ
        this.allQuestions.eq = [
            {
                type: 'theory',
                text: 'Когда вы видите, что кто-то расстроен, вы обычно:',
                options: [
                    { text: 'Сразу понимаете, что человек чувствует и почему', value: '3', correct: true },
                    { text: 'Замечаете, что что-то не так, но не всегда понимаете причину', value: '2', correct: false },
                    { text: 'Часто не замечаете, пока человек сам не скажет', value: '1', correct: false }
                ],
                points: 3
            },
            {
                type: 'theory',
                text: 'В стрессовой ситуации вы:',
                options: [
                    { text: 'Сохраняете спокойствие и ясно мыслите', value: '3', correct: true },
                    { text: 'Иногда теряете самообладание, но быстро восстанавливаетесь', value: '2', correct: false },
                    { text: 'Часто поддаётесь панике или гневу', value: '1', correct: false }
                ],
                points: 3
            },
            {
                type: 'theory',
                text: 'Как вы обычно реагируете на критику?',
                options: [
                    { text: 'Слушаю, анализирую и извлекаю уроки', value: '3', correct: true },
                    { text: 'Защищаюсь, но потом обдумываю', value: '2', correct: false },
                    { text: 'Сразу обижаюсь или злюсь', value: '1', correct: false }
                ],
                points: 3
            },
            {
                type: 'theory',
                text: 'Если вы опаздываете на важную встречу, как вы себя ведёте?',
                options: [
                    { text: 'Стараюсь успокоиться и не винить себя', value: '3', correct: true },
                    { text: 'Придумываю как оправдаться, стараюсь успокоиться', value: '2', correct: false },
                    { text: 'Как я мог опоздать? Буду очень торопиться и винить себя', value: '1', correct: false }
                ],
                points: 3
            },
            {
                type: 'multi',
                text: 'Какие эмоции вы чаще всего испытываете в течение дня? (выберите до 3)',
                options: [
                    { text: 'радость', value: 'радость', correct: true },
                    { text: 'спокойствие', value: 'спокойствие', correct: true },
                    { text: 'интерес', value: 'интерес', correct: true },
                    { text: 'тревога', value: 'тревога', correct: false },
                    { text: 'гнев', value: 'гнев', correct: false },
                    { text: 'скука', value: 'скука', correct: false }
                ],
                points: 3,
                maxChoices: 3
            },
            {
                type: 'multi',
                text: 'Какие эмоции вы испытываете перед важной встречей? (выберите до 3)',
                options: [
                    { text: 'волнение', value: 'волнение', correct: true },
                    { text: 'ответственность', value: 'ответственность', correct: true },
                    { text: 'сосредоточенность', value: 'сосредоточенность', correct: true },
                    { text: 'страх', value: 'страх', correct: false },
                    { text: 'безразличие', value: 'безразличие', correct: false },
                    { text: 'злость', value: 'злость', correct: false }
                ],
                points: 3,
                maxChoices: 3
            },
            {
                type: 'theory',
                text: 'Когда вы чувствуете себя счастливым, вы обычно:',
                options: [
                    { text: 'Делитесь своим состоянием с другими', value: '3', correct: true },
                    { text: 'Наслаждаетесь моментом в одиночестве', value: '2', correct: false },
                    { text: 'Боитесь, что это скоро закончится', value: '1', correct: false }
                ],
                points: 3
            },
            {
                type: 'theory',
                text: 'Как вы справляетесь с разочарованием?',
                options: [
                    { text: 'Анализирую причины и делаю выводы', value: '3', correct: true },
                    { text: 'Расстраиваюсь, но потом отпускаю', value: '2', correct: false },
                    { text: 'Долго не могу прийти в себя', value: '1', correct: false }
                ],
                points: 3
            },
            {
                type: 'theory',
                text: 'Как вы реагируете на успехи других людей?',
                options: [
                    { text: 'Искренне радуюсь за них', value: '3', correct: true },
                    { text: 'Стараюсь порадоваться, но иногда зависть мешает', value: '2', correct: false },
                    { text: 'Сравниваю с собой и часто завидую', value: '1', correct: false }
                ],
                points: 3
            },
            {
                type: 'multi',
                text: 'Что помогает вам улучшить настроение? (выберите до 3)',
                options: [
                    { text: 'Общение с близкими', value: 'общение', correct: true },
                    { text: 'Любимое хобби', value: 'хобби', correct: true },
                    { text: 'Физическая активность', value: 'спорт', correct: true },
                    { text: 'Еда', value: 'еда', correct: false },
                    { text: 'Алкоголь', value: 'алкоголь', correct: false },
                    { text: 'Игнорирование проблемы', value: 'игнорирование', correct: false }
                ],
                points: 3,
                maxChoices: 3
            }
        ];

        // База вопросов для эмпатии
        this.allQuestions.empathy = [
            {
                type: 'theory',
                text: 'Когда друг рассказывает о своей проблеме, вы обычно:',
                options: [
                    { text: 'Слушаете внимательно, задаете уточняющие вопросы', value: '3', correct: true },
                    { text: 'Слушаете, но иногда отвлекаетесь', value: '2', correct: false },
                    { text: 'Сразу предлагаете решение', value: '1', correct: false }
                ],
                points: 3
            },
            {
                type: 'theory',
                text: 'Если вы видите, что незнакомый человек плачет в общественном месте, вы:',
                options: [
                    { text: 'Подойдете и спросите, нужна ли помощь', value: '3', correct: true },
                    { text: 'Почувствуете неловкость, но не подойдете', value: '2', correct: false },
                    { text: 'Пройдете мимо, не обращая внимания', value: '1', correct: false }
                ],
                points: 3
            },
            {
                type: 'multi',
                text: 'Как вы проявляете заботу о близких? (выберите до 3)',
                options: [
                    { text: 'Слушаю и поддерживаю', value: 'слушаю', correct: true },
                    { text: 'Помогаю практическими делами', value: 'помогаю', correct: true },
                    { text: 'Дарю подарки', value: 'подарки', correct: false },
                    { text: 'Даю советы', value: 'советы', correct: false },
                    { text: 'Игнорирую, пока не попросят', value: 'игнорирую', correct: false }
                ],
                points: 3,
                maxChoices: 3
            },
            {
                type: 'theory',
                text: 'Когда вы видите несправедливость по отношению к другому человеку, вы:',
                options: [
                    { text: 'Стараетесь помочь, если это в ваших силах', value: '3', correct: true },
                    { text: 'Сочувствуете, но не вмешиваетесь', value: '2', correct: false },
                    { text: 'Не обращаете внимания, это не ваше дело', value: '1', correct: false }
                ],
                points: 3
            },
            {
                type: 'multi',
                text: 'Какие качества помогают понимать чувства других? (выберите до 3)',
                options: [
                    { text: 'Внимательность', value: 'внимательность', correct: true },
                    { text: 'Терпение', value: 'терпение', correct: true },
                    { text: 'Опыт переживания похожих ситуаций', value: 'опыт', correct: true },
                    { text: 'Безразличие', value: 'безразличие', correct: false },
                    { text: 'Критичность', value: 'критичность', correct: false },
                    { text: 'Нетерпение', value: 'нетерпение', correct: false }
                ],
                points: 3,
                maxChoices: 3
            }
        ];

        // База вопросов для социального интеллекта
        this.allQuestions.social = [
            {
                type: 'theory',
                text: 'В новой компании вы обычно:',
                options: [
                    { text: 'Быстро находите общий язык со всеми', value: '3', correct: true },
                    { text: 'Присматриваетесь, затем вступаете в контакт', value: '2', correct: false },
                    { text: 'Ждете, когда к вам подойдут', value: '1', correct: false }
                ],
                points: 3
            },
            {
                type: 'theory',
                text: 'При конфликте в коллективе вы:',
                options: [
                    { text: 'Стараетесь найти компромисс', value: '3', correct: true },
                    { text: 'Поддерживаете ту сторону, с которой согласны', value: '2', correct: false },
                    { text: 'Избегаете участия в конфликте', value: '1', correct: false }
                ],
                points: 3
            },
            {
                type: 'multi',
                text: 'Что важно для успешного общения? (выберите до 3)',
                options: [
                    { text: 'Умение слушать', value: 'слушать', correct: true },
                    { text: 'Четкость выражения мыслей', value: 'четкость', correct: true },
                    { text: 'Уважение к собеседнику', value: 'уважение', correct: true },
                    { text: 'Доминирование в разговоре', value: 'доминирование', correct: false },
                    { text: 'Уклонение от спорных тем', value: 'уклонение', correct: false },
                    { text: 'Частое перебивание', value: 'перебивание', correct: false }
                ],
                points: 3,
                maxChoices: 3
            },
            {
                type: 'theory',
                text: 'Как вы ведете себя в формальной обстановке?',
                options: [
                    { text: 'Соблюдаю правила этикета, но остаюсь собой', value: '3', correct: true },
                    { text: 'Чувствую себя скованно', value: '2', correct: false },
                    { text: 'Стараюсь избегать формальных мероприятий', value: '1', correct: false }
                ],
                points: 3
            },
            {
                type: 'multi',
                text: 'Какие навыки помогают в переговорах? (выберите до 3)',
                options: [
                    { text: 'Умение аргументировать', value: 'аргументы', correct: true },
                    { text: 'Понимание интересов другой стороны', value: 'понимание', correct: true },
                    { text: 'Способность идти на компромисс', value: 'компромисс', correct: true },
                    { text: 'Агрессивность', value: 'агрессия', correct: false },
                    { text: 'Упрямство', value: 'упрямство', correct: false },
                    { text: 'Манипуляции', value: 'манипуляции', correct: false }
                ],
                points: 3,
                maxChoices: 3
            }
        ];
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
        const testInfo = {
            eq: {
                title: '🧠 Тест на эмоциональный интеллект',
                description: '10 вопросов для оценки вашего EQ',
                time: '5-7 минут'
            },
            empathy: {
                title: '💝 Тест на эмпатию',
                description: '5 вопросов для оценки способности понимать чувства других',
                time: '3-5 минут'
            },
            social: {
                title: '👥 Тест на социальный интеллект',
                description: '5 вопросов для оценки коммуникативных навыков',
                time: '3-5 минут'
            }
        };

        const info = testInfo[testType];
        if (!info) return;

        this.currentTest = testType;
        
        // Обновляем описание
        document.getElementById('test-title').textContent = info.title;
        document.getElementById('test-description').textContent = info.description;
        document.getElementById('test-time').textContent = info.time;
        document.getElementById('test-questions').textContent = this.allQuestions[testType].length + ' вопросов';
        document.getElementById('test-parts').textContent = 'Теория + Практика';
    }

    startTest() {
        if (!this.currentTest) {
            alert('Выберите тест для начала');
            return;
        }

        this.testInProgress = true;
        this.testCompleted = false;
        this.currentQuestion = 0;
        this.userAnswers = new Array(this.allQuestions[this.currentTest].length).fill(null);
        
        // Показываем контейнер теста
        document.getElementById('test-container').style.display = 'block';
        document.querySelector('.test-description').style.display = 'none';
        document.querySelector('.tests-selection').style.display = 'none';
        
        // Загружаем первый вопрос
        this.loadQuestion();
        this.updateProgress();
    }

    loadQuestion() {
        const questions = this.allQuestions[this.currentTest];
        const question = questions[this.currentQuestion];
        
        if (!question) {
            this.completeTest();
            return;
        }

        // Создаем HTML вопроса
        let questionHTML = `
            <div class="question" data-index="${this.currentQuestion}">
                <h3>${question.text}</h3>
        `;

        if (question.type === 'theory') {
            // Одиночный выбор
            questionHTML += '<div class="options">';
            question.options.forEach((option, index) => {
                const isSelected = this.userAnswers[this.currentQuestion] === option.value;
                questionHTML += `
                    <div class="option ${isSelected ? 'selected' : ''}" 
                         data-value="${option.value}" 
                         data-correct="${option.correct}">
                        <span>${option.text}</span>
                    </div>
                `;
            });
            questionHTML += '</div>';
        } 
        else if (question.type === 'multi') {
            // Множественный выбор
            const selected = this.userAnswers[this.currentQuestion] || [];
            questionHTML += `
                <p class="multiple-hint">Можно выбрать до ${question.maxChoices || 3} вариантов</p>
                <div class="options multiple">
            `;
            question.options.forEach((option, index) => {
                const isSelected = selected.includes(option.value);
                questionHTML += `
                    <div class="option ${isSelected ? 'selected' : ''}" 
                         data-value="${option.value}"
                         data-correct="${option.correct}">
                        <div class="checkbox ${isSelected ? 'checked' : ''}"></div>
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

    setupQuestionHandlers(question) {
        if (question.type === 'theory') {
            const options = document.querySelectorAll('.option');
            options.forEach(option => {
                option.addEventListener('click', () => {
                    if (this.testCompleted) return;
                    
                    // Снимаем выделение со всех
                    options.forEach(opt => opt.classList.remove('selected'));
                    
                    // Выделяем выбранный
                    option.classList.add('selected');
                    
                    // Сохраняем ответ
                    this.userAnswers[this.currentQuestion] = option.dataset.value;
                    
                    // Показываем правильность (опционально)
                    if (this.showAnswers) {
                        options.forEach(opt => {
                            if (opt.dataset.correct === 'true') {
                                opt.classList.add('correct-answer');
                            } else if (opt.dataset.correct === 'false') {
                                opt.classList.add('incorrect-answer');
                            }
                        });
                    }
                });
            });
        } 
        else if (question.type === 'multi') {
            const options = document.querySelectorAll('.option');
            const maxChoices = question.maxChoices || 3;
            
            options.forEach(option => {
                option.addEventListener('click', () => {
                    if (this.testCompleted) return;
                    
                    const selected = option.classList.contains('selected');
                    const currentSelected = document.querySelectorAll('.option.selected').length;
                    
                    if (!selected && currentSelected >= maxChoices) {
                        alert(`Можно выбрать не более ${maxChoices} вариантов`);
                        return;
                    }
                    
                    option.classList.toggle('selected');
                    const checkbox = option.querySelector('.checkbox');
                    if (checkbox) checkbox.classList.toggle('checked');
                    
                    // Сохраняем выбранные значения
                    const selectedValues = Array.from(document.querySelectorAll('.option.selected'))
                        .map(opt => opt.dataset.value);
                    this.userAnswers[this.currentQuestion] = selectedValues;
                });
            });
        }
    }

    nextQuestion() {
        const questions = this.allQuestions[this.currentTest];
        
        // Проверяем, что ответ дан
        if (this.userAnswers[this.currentQuestion] === null || 
            (Array.isArray(this.userAnswers[this.currentQuestion]) && 
             this.userAnswers[this.currentQuestion].length === 0)) {
            alert('Пожалуйста, ответьте на вопрос');
            return;
        }

        // Переходим к следующему вопросу
        this.currentQuestion++;
        
        if (this.currentQuestion < questions.length) {
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
        const questions = this.allQuestions[this.currentTest];
        const progress = ((this.currentQuestion + 1) / questions.length) * 100;
        
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) {
            progressText.textContent = `Вопрос ${this.currentQuestion + 1} из ${questions.length}`;
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
        const questions = this.allQuestions[this.currentTest];
        let totalScore = 0;
        let maxScore = 0;
        
        // Проходим по всем вопросам
        questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            
            // Максимальный балл за вопрос
            maxScore += question.points || 1;
            
            // Подсчет баллов
            if (question.type === 'theory') {
                // Теоретический вопрос
                const selectedOption = question.options.find(opt => opt.value === userAnswer);
                if (selectedOption && selectedOption.correct) {
                    totalScore += question.points || 1;
                }
            } 
            else if (question.type === 'multi') {
                // Множественный выбор
                if (!userAnswer || !Array.isArray(userAnswer)) return;
                
                let correctCount = 0;
                const correctOptions = question.options.filter(opt => opt.correct);
                
                // Считаем правильные ответы
                userAnswer.forEach(answer => {
                    const option = question.options.find(opt => opt.value === answer);
                    if (option && option.correct) {
                        correctCount++;
                    }
                });
                
                // Начисляем баллы пропорционально
                if (correctOptions.length > 0) {
                    const percentage = correctCount / correctOptions.length;
                    totalScore += Math.round((question.points || 1) * percentage);
                }
            }
        });
        
        // Сохраняем результаты
        this.results = {
            totalScore: totalScore,
            maxScore: maxScore,
            percentage: Math.round((totalScore / maxScore) * 100)
        };
        
        // Показываем результаты
        this.displayResults();
        
        // Сохраняем статистику
        this.saveTestStats();
    }

    displayResults() {
        const totalScoreElement = document.getElementById('total-score');
        const messageElement = document.getElementById('result-message');
        
        if (totalScoreElement) {
            totalScoreElement.textContent = 
                `${this.results.totalScore}/${this.results.maxScore} (${this.results.percentage}%)`;
        }
        
        if (messageElement) {
            messageElement.textContent = this.getResultMessage(this.results.percentage);
        }
        
        // Рекомендации
        const recommendationsElement = document.getElementById('recommendations');
        if (recommendationsElement) {
            recommendationsElement.innerHTML = this.getRecommendations(this.results.percentage);
        }
    }

    getResultMessage(percentage) {
        if (percentage >= 90) return 'Отличный результат! 🎉';
        if (percentage >= 70) return 'Хороший результат! 👍';
        if (percentage >= 50) return 'Средний результат. Есть куда расти 📈';
        return 'Есть над чем поработать 💪';
    }

    getRecommendations(percentage) {
        let recommendations = '<h4>📋 Рекомендации</h4><ul>';
        
        if (percentage < 70) {
            if (this.currentTest === 'eq') {
                recommendations += `
                    <li>Ведите дневник эмоций</li>
                    <li>Практикуйте осознанность</li>
                    <li>Наблюдайте за своими реакциями</li>
                `;
            } else if (this.currentTest === 'empathy') {
                recommendations += `
                    <li>Практикуйте активное слушание</li>
                    <li>Задавайте больше вопросов о чувствах</li>
                    <li>Читайте художественную литературу</li>
                `;
            } else if (this.currentTest === 'social') {
                recommendations += `
                    <li>Участвуйте в групповых обсуждениях</li>
                    <li>Тренируйтесь в публичных выступлениях</li>
                    <li>Изучайте техники коммуникации</li>
                `;
            }
        } else {
            recommendations += `
                <li>Продолжайте развивать свои навыки</li>
                <li>Помогайте другим в развитии</li>
                <li>Ищите новые вызовы для себя</li>
            `;
        }
        
        recommendations += '</ul>';
        return recommendations;
    }

    saveTestStats() {
        const stats = JSON.parse(localStorage.getItem('testStats') || '{}');
        
        if (!stats[this.currentTest]) {
            stats[this.currentTest] = [];
        }
        
        const testResult = {
            date: new Date().toISOString(),
            score: this.results.totalScore,
            maxScore: this.results.maxScore,
            percentage: this.results.percentage,
            testType: this.currentTest
        };
        
        stats[this.currentTest].push(testResult);
        
        // Сохраняем только последние 5 результатов
        if (stats[this.currentTest].length > 5) {
            stats[this.currentTest] = stats[this.currentTest].slice(-5);
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
        let lastTest = '-';
        
        Object.keys(stats).forEach(testType => {
            totalTests += stats[testType].length;
            
            if (stats[testType].length > 0) {
                const last = stats[testType][stats[testType].length - 1];
                const lastDate = new Date(last.date).toLocaleDateString('ru-RU');
                if (lastTest === '-' || new Date(last.date) > new Date(lastTest)) {
                    lastTest = lastDate;
                }
            }
        });
        
        const totalTestsElement = document.getElementById('total-tests');
        const lastTestElement = document.getElementById('last-test');
        
        if (totalTestsElement) totalTestsElement.textContent = totalTests;
        if (lastTestElement) lastTestElement.textContent = lastTest;
        
        // Считаем средний процент по EQ
        let eqTotal = 0;
        let eqCount = 0;
        if (stats.eq && stats.eq.length > 0) {
            stats.eq.forEach(result => {
                eqTotal += result.percentage;
                eqCount++;
            });
        }
        
        const avgEqElement = document.getElementById('avg-eq');
        if (avgEqElement) {
            avgEqElement.textContent = eqCount > 0 ? Math.round(eqTotal / eqCount) + '%' : '-';
        }
        
        // Прогресс
        const progressElement = document.getElementById('progress');
        if (progressElement) {
            const totalQuestions = Object.values(this.allQuestions).reduce((sum, q) => sum + q.length, 0);
            const progress = Math.min(100, Math.round((totalTests * 10) / totalQuestions));
            progressElement.textContent = progress + '%';
        }
    }

    saveResultsToJournal() {
        const testName = {
            eq: 'EQ тест',
            empathy: 'Тест на эмпатию',
            social: 'Тест на социальный интеллект'
        }[this.currentTest];
        
        if (!window.moodJournal) {
            // Сохраняем в localStorage
            const entries = JSON.parse(localStorage.getItem('moodJournalEntries') || '[]');
            const entry = {
                id: Date.now(),
                date: new Date().toISOString(),
                mood: Math.max(1, Math.min(5, Math.round(this.results.percentage / 20))),
                moodText: this.getMoodText(this.results.percentage),
                notes: `Результат ${testName}: ${this.results.totalScore}/${this.results.maxScore} баллов (${this.results.percentage}%)`,
                activities: ['тест', this.currentTest],
                tags: ['тест', 'психология', 'результат'],
                createdAt: new Date().toISOString()
            };
            
            entries.unshift(entry);
            localStorage.setItem('moodJournalEntries', JSON.stringify(entries));
            alert('Результат сохранён в дневник!');
        } else {
            window.moodJournal.addEntry({
                mood: Math.max(1, Math.min(5, Math.round(this.results.percentage / 20))),
                moodText: this.getMoodText(this.results.percentage),
                notes: `Результат ${testName}: ${this.results.totalScore}/${this.results.maxScore} баллов (${this.results.percentage}%)`,
                activities: ['тест', this.currentTest],
                tags: ['тест', 'психология', 'результат']
            });
            alert('Результат сохранён в дневник!');
        }
    }

    getMoodText(percentage) {
        if (percentage >= 80) return 'Отличное';
        if (percentage >= 60) return 'Хорошее';
        if (percentage >= 40) return 'Нормальное';
        if (percentage >= 20) return 'Подавленное';
        return 'Плохое';
    }

    retakeTest() {
        document.getElementById('test-results').style.display = 'none';
        document.getElementById('current-test').style.display = 'block';
        document.getElementById('next-question').style.display = 'block';
        
        this.startTest();
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.testSystem = new SimpleTestSystem();
});
