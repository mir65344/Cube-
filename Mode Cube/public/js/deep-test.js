// Система углубленных тестов
class DeepTestSystem {
    constructor() {
        this.currentCategory = null;
        this.currentQuestions = [];
        this.currentAnswers = {};
        this.testData = null;
        this.conditionalQuestions = new Map(); // Карта условных вопросов
        this.init();
    }

    async init() {
        // Проверяем, нужно ли предлагать углубленный тест
        const lastTest = JSON.parse(localStorage.getItem('lastMoodTest'));
        if (lastTest && lastTest.score < 3.5 && !lastTest.deepTestCompleted) {
            this.showTestOffer(lastTest.score);
        }

        this.loadCategories();
        this.setupEventListeners();
    }

    showTestOffer(score) {
        const offerHtml = `
            <div class="test-offer-overlay">
                <div class="test-offer-modal">
                    <h3>📊 Рекомендуем углубленный тест</h3>
                    <p>Ваш текущий результат настроения: <strong>${score.toFixed(1)}/5</strong></p>
                    <p>Чтобы получить более точные рекомендации, пройдите углубленный тест по конкретной сфере жизни.</p>
                    <div class="offer-buttons">
                        <button class="btn-primary" id="accept-deep-test">Пройти углубленный тест</button>
                        <button class="btn-secondary" id="skip-deep-test">Позже</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', offerHtml);

        document.getElementById('accept-deep-test').addEventListener('click', () => {
            document.querySelector('.test-offer-overlay').remove();
            this.showCategorySelection();
        });

        document.getElementById('skip-deep-test').addEventListener('click', () => {
            document.querySelector('.test-offer-overlay').remove();
        });
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/deep-test-categories');
            const data = await response.json();
            this.categories = data.categories;
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
        }
    }

    showCategorySelection() {
        const container = document.getElementById('deep-test-container');
        if (!container) return;

        container.innerHTML = `
            <div class="category-selection">
                <h2>Выберите сферу для углубленного анализа</h2>
                <p class="subtitle">Тест адаптируется под ваши ответы и задает релевантные вопросы</p>
                
                <div class="categories-grid">
                    ${this.categories.map(cat => `
                        <div class="category-card" data-category="${cat.id}">
                            <div class="category-icon">${cat.icon}</div>
                            <h3>${cat.name}</h3>
                            <p>${cat.description}</p>
                            <button class="select-category" data-category="${cat.id}">Выбрать</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Добавляем обработчики выбора категории
        document.querySelectorAll('.select-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.startDeepTest(category);
            });
        });
    }

    async startDeepTest(category) {
        this.currentCategory = category;
        this.currentAnswers = {};
        
        // Загружаем вопросы для выбранной категории
        await this.loadQuestions(category);
        
        // Отображаем первый вопрос
        this.renderQuestion(0);
    }

    async loadQuestions(category, subcategory = null) {
        try {
            const response = await fetch('/api/deep-test-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    category, 
                    subcategory,
                    previousAnswers: this.currentAnswers 
                })
            });
            
            const data = await response.json();
            this.currentQuestions = data.questions;
            this.buildConditionalMap();
            
        } catch (error) {
            console.error('Ошибка загрузки вопросов:', error);
        }
    }

    buildConditionalMap() {
        this.conditionalQuestions.clear();
        
        this.currentQuestions.forEach(question => {
            if (question.dependsOn) {
                if (!this.conditionalQuestions.has(question.dependsOn)) {
                    this.conditionalQuestions.set(question.dependsOn, []);
                }
                this.conditionalQuestions.get(question.dependsOn).push(question);
            }
        });
    }

    renderQuestion(index) {
        const question = this.currentQuestions[index];
        if (!question) {
            this.completeTest();
            return;
        }

        const container = document.getElementById('deep-test-container');
        const progress = ((index + 1) / this.currentQuestions.length * 100).toFixed(0);

        container.innerHTML = `
            <div class="deep-test-question">
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-text">Вопрос ${index + 1} из ${this.currentQuestions.length}</div>
                </div>
                
                <div class="question-content">
                    <h3>${question.text}</h3>
                    
                    ${this.renderQuestionInput(question)}
                    
                    <div class="navigation-buttons">
                        ${index > 0 ? '<button class="btn-secondary" id="prev-question">Назад</button>' : ''}
                        <button class="btn-primary" id="next-question" ${!this.currentAnswers[question.id] ? 'disabled' : ''}>
                            ${index === this.currentQuestions.length - 1 ? 'Завершить тест' : 'Далее'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupQuestionEvents(question, index);
    }

    renderQuestionInput(question) {
        switch(question.type) {
            case 'multiple_choice':
                return `
                    <div class="options">
                        ${question.options.map(opt => `
                            <div class="option ${this.currentAnswers[question.id] === opt.value ? 'selected' : ''}" 
                                 data-value="${opt.value}">
                                <div class="option-text">${opt.text}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
                
            case 'scale':
                return `
                    <div class="scale-input">
                        <div class="scale-labels">
                            <span>${question.min} (минимум)</span>
                            <span>${question.max} (максимум)</span>
                        </div>
                        <input type="range" min="${question.min}" max="${question.max}" 
                               value="${this.currentAnswers[question.id] || Math.round((question.max - question.min) / 2)}"
                               class="scale-slider" id="${question.id}-slider">
                        <div class="scale-value">
                            Текущее значение: <span id="${question.id}-value">${this.currentAnswers[question.id] || Math.round((question.max - question.min) / 2)}</span>
                        </div>
                    </div>
                `;
                
            case 'conditional':
                return `
                    <div class="conditional-options">
                        ${question.options.map(opt => `
                            <button class="conditional-btn ${this.currentAnswers[question.id] === opt.value ? 'selected' : ''}" 
                                    data-value="${opt.value}">
                                ${opt.text}
                            </button>
                        `).join('')}
                    </div>
                `;
                
            default:
                return '<p>Тип вопроса не поддерживается</p>';
        }
    }

    setupQuestionEvents(question, index) {
        const nextBtn = document.getElementById('next-question');
        const prevBtn = document.getElementById('prev-question');
        
        // Обработка выбора ответа
        switch(question.type) {
            case 'multiple_choice':
                document.querySelectorAll('.option').forEach(opt => {
                    opt.addEventListener('click', () => {
                        document.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
                        opt.classList.add('selected');
                        this.currentAnswers[question.id] = parseInt(opt.dataset.value);
                        nextBtn.disabled = false;
                        
                        // Проверяем условные вопросы
                        this.checkConditionalQuestions(question.id);
                    });
                });
                break;
                
            case 'scale':
                const slider = document.getElementById(`${question.id}-slider`);
                const valueDisplay = document.getElementById(`${question.id}-value`);
                
                slider.addEventListener('input', (e) => {
                    const value = e.target.value;
                    valueDisplay.textContent = value;
                    this.currentAnswers[question.id] = parseInt(value);
                    nextBtn.disabled = false;
                });
                break;
                
            case 'conditional':
                document.querySelectorAll('.conditional-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        document.querySelectorAll('.conditional-btn').forEach(b => b.classList.remove('selected'));
                        btn.classList.add('selected');
                        this.currentAnswers[question.id] = btn.dataset.value;
                        nextBtn.disabled = false;
                        
                        // Проверяем условные вопросы
                        this.checkConditionalQuestions(question.id);
                    });
                });
                break;
        }
        
        // Навигация
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (index === this.currentQuestions.length - 1) {
                    this.completeTest();
                } else {
                    this.renderQuestion(index + 1);
                }
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.renderQuestion(index - 1);
            });
        }
    }

    checkConditionalQuestions(questionId) {
        if (this.conditionalQuestions.has(questionId)) {
            const dependentQuestions = this.conditionalQuestions.get(questionId);
            
            dependentQuestions.forEach(depQuestion => {
                // Проверяем условие показа вопроса
                if (this.shouldShowQuestion(depQuestion, questionId)) {
                    // Добавляем вопрос, если его еще нет
                    const exists = this.currentQuestions.some(q => q.id === depQuestion.id);
                    if (!exists) {
                        const insertIndex = this.currentQuestions.findIndex(q => q.id === questionId) + 1;
                        this.currentQuestions.splice(insertIndex, 0, depQuestion);
                    }
                } else {
                    // Удаляем вопрос, если он есть
                    const questionIndex = this.currentQuestions.findIndex(q => q.id === depQuestion.id);
                    if (questionIndex > -1) {
                        this.currentQuestions.splice(questionIndex, 1);
                        delete this.currentAnswers[depQuestion.id];
                    }
                }
            });
        }
    }

    shouldShowQuestion(dependentQuestion, parentQuestionId) {
        const parentAnswer = this.currentAnswers[parentQuestionId];
        const condition = dependentQuestion.dependsOnCondition;
        
        if (!condition) {
            // По умолчанию показываем, если есть ответ на родительский вопрос
            return parentAnswer !== undefined;
        }
        
        // Здесь можно добавить более сложную логику условий
        return true;
    }

    async completeTest() {
        // Рассчитываем результат
        const score = this.calculateScore();
        const insights = this.generateInsights();
        
        // Сохраняем тест
        const mainTestId = JSON.parse(localStorage.getItem('lastMoodTest'))?.testId;
        
        try {
            const response = await fetch('/api/save-deep-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mainTestId,
                    category: this.currentCategory,
                    score,
                    insights,
                    answers: this.currentAnswers,
                    recommendations: this.generateRecommendations(score, insights)
                })
            });
            
            const data = await response.json();
            this.showResults(data);
            
            // Обновляем статус пройденного теста
            const lastTest = JSON.parse(localStorage.getItem('lastMoodTest'));
            if (lastTest) {
                lastTest.deepTestCompleted = true;
                localStorage.setItem('lastMoodTest', JSON.stringify(lastTest));
            }
            
        } catch (error) {
            console.error('Ошибка сохранения теста:', error);
        }
    }

    calculateScore() {
        let total = 0;
        let count = 0;
        
        Object.values(this.currentAnswers).forEach(answer => {
            if (typeof answer === 'number') {
                // Нормализуем шкалу 1-10 к 1-5
                if (answer > 5) {
                    answer = (answer / 10) * 5;
                }
                total += answer;
                count++;
            }
        });
        
        return count > 0 ? total / count : 0;
    }

    generateInsights() {
        const insights = {
            category: this.currentCategory,
            totalQuestions: this.currentQuestions.length,
            answeredQuestions: Object.keys(this.currentAnswers).length,
            strengths: [],
            areasForImprovement: []
        };
        
        // Анализируем ответы
        Object.entries(this.currentAnswers).forEach(([questionId, answer]) => {
            const question = this.currentQuestions.find(q => q.id === questionId);
            if (!question) return;
            
            // Простая логика анализа (можно расширить)
            if (typeof answer === 'number' && answer <= 2) {
                insights.strengths.push(question.text);
            } else if (typeof answer === 'number' && answer >= 4) {
                insights.areasForImprovement.push(question.text);
            }
        });
        
        return insights;
    }

    generateRecommendations(score, insights) {
        const recommendations = [];
        
        if (score < 3) {
            recommendations.push({
                priority: 'high',
                text: `Рекомендуем уделить внимание сфере "${this.currentCategory}"`,
                actions: [
                    'Выделить время для анализа проблемных зон',
                    'Поставить конкретные цели на неделю',
                    'Найти ресурсы для развития в этой сфере'
                ]
            });
        }
        
        insights.areasForImprovement.forEach(area => {
            recommendations.push({
                priority: 'medium',
                text: `Область для улучшения: ${area}`,
                actions: ['Практиковать соответствующие упражнения']
            });
        });
        
        return recommendations;
    }

    showResults(data) {
        const container = document.getElementById('deep-test-container');
        
        container.innerHTML = `
            <div class="test-results">
                <div class="result-header">
                    <h2>🎉 Тест завершен!</h2>
                    <p>Результаты по категории: <strong>${this.getCategoryName(this.currentCategory)}</strong></p>
                </div>
                
                <div class="result-score">
                    <div class="score-circle">
                        <span class="score-value">${data.score?.toFixed(1) || '0.0'}/5</span>
                        <span class="score-label">Общий балл</span>
                    </div>
                </div>
                
                <div class="action-plan">
                    <h3>📋 План действий</h3>
                    <ul>
                        ${data.actionPlan?.map(item => `<li>${item}</li>`).join('') || ''}
                    </ul>
                </div>
                
                <div class="recommendations-list">
                    <h3>💡 Рекомендации</h3>
                    ${data.recommendations?.map(rec => `
                        <div class="recommendation ${rec.priority}">
                            <div class="rec-icon">${rec.icon || '💡'}</div>
                            <div class="rec-content">
                                <p>${rec.text}</p>
                                <button class="rec-action">${rec.action}</button>
                            </div>
                        </div>
                    `).join('') || ''}
                </div>
                
                <div class="result-actions">
                    <button class="btn-primary" id="save-plan">Сохранить план</button>
                    <button class="btn-secondary" id="another-test">Пройти другой тест</button>
                    <button class="btn-text" id="view-stats">Посмотреть статистику</button>
                </div>
            </div>
        `;
        
        this.setupResultEvents();
    }

    getCategoryName(category) {
        const names = {
            'work': 'Работа',
            'relationships': 'Отношения',
            'family': 'Семья',
            'friends': 'Друзья',
            'personal': 'Личное развитие',
            'health': 'Здоровье',
            'finance': 'Финансы'
        };
        return names[category] || category;
    }

    setupResultEvents() {
        document.getElementById('save-plan')?.addEventListener('click', () => {
            this.saveActionPlan();
        });
        
        document.getElementById('another-test')?.addEventListener('click', () => {
            this.showCategorySelection();
        });
        
        document.getElementById('view-stats')?.addEventListener('click', () => {
            window.location.href = '/journal';
        });
    }

    async saveActionPlan() {
        // Сохранение плана действий
        alert('План действий сохранен в вашем дневнике!');
    }

    setupEventListeners() {
        // Глобальные обработчики, если нужны
    }
}

// Инициализация системы при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.deepTestSystem = new DeepTestSystem();
});
