// Тесты на эмоциональный интеллект
const eqTests = {
    theoretical: [
        {
            question: "Когда вы видите, что кто-то расстроен, вы обычно:",
            options: [
                { text: "Сразу понимаете, что человек чувствует и почему", value: 3 },
                { text: "Замечаете, что что-то не так, но не всегда понимаете причину", value: 2 },
                { text: "Часто не замечаете, пока человек сам не скажет", value: 1 }
            ],
            aspect: "empathy"
        },
        {
            question: "В стрессовой ситуации вы:",
            options: [
                { text: "Сохраняете спокойствие и ясно мыслите", value: 3 },
                { text: "Иногда теряете самообладание, но быстро восстанавливаетесь", value: 2 },
                { text: "Часто поддаётесь панике или гневу", value: 1 }
            ],
            aspect: "self_control"
        },
        {
            question: "Когда вы совершаете ошибку, вы:",
            options: [
                { text: "Признаёте её, извлекаете уроки и двигаетесь дальше", value: 3 },
                { text: "Расстраиваетесь, но в итоге принимаете", value: 2 },
                { text: "Долго переживаете и критикуете себя", value: 1 }
            ],
            aspect: "self_awareness"
        },
        {
            question: "В конфликтной ситуации вы обычно:",
            options: [
                { text: "Слушаете другую сторону и ищете компромисс", value: 3 },
                { text: "Выражаете свою позицию, но можете уступить", value: 2 },
                { text: "Настаиваете на своём или избегаете конфликта", value: 1 }
            ],
            aspect: "social_skills"
        }
    ],
    practical: [
        {
            question: "Какие из этих ситуаций обычно вызывают у вас сильные эмоции? (выберите все подходящие)",
            options: [
                { text: "Критика в мой адрес", value: "emotional_triggers" },
                { text: "Несправедливое отношение", value: "emotional_triggers" },
                { text: "Конфликты в коллективе", value: "emotional_triggers" },
                { text: "Неопределенность и изменения", value: "emotional_triggers" },
                { text: "Ошибки и неудачи", value: "emotional_triggers" }
            ],
            aspect: "emotional_triggers",
            multiple: true
        },
        {
            question: "Какие техники вы используете для управления эмоциями? (выберите все применяемые)",
            options: [
                { text: "Глубокое дыхание и паузы", value: "coping_strategies" },
                { text: "Физическая активность", value: "coping_strategies" },
                { text: "Анализ причин эмоций", value: "coping_strategies" },
                { text: "Разговор с близкими", value: "coping_strategies" },
                { text: "Смена деятельности", value: "coping_strategies" },
                { text: "Медитация или релаксация", value: "coping_strategies" }
            ],
            aspect: "coping_strategies",
            multiple: true
        },
        {
            question: "В каких ситуациях вы проявляете эмпатию? (выберите все характерные для вас)",
            options: [
                { text: "Когда близкому человеку плохо", value: "empathy_expression" },
                { text: "При работе в команде", value: "empathy_expression" },
                { text: "В конфликтных ситуациях", value: "empathy_expression" },
                { text: "При принятии решений", value: "empathy_expression" },
                { text: "Редко проявляю сознательную эмпатию", value: "empathy_expression" }
            ],
            aspect: "empathy_expression",
            multiple: true
        }
    ]
};

// Аспекты EQ для детального анализа
const eqAspects = {
    empathy: { name: "Эмпатия", description: "Способность понимать и разделять чувства других" },
    self_control: { name: "Самоконтроль", description: "Умение управлять своими эмоциями и реакциями" },
    self_awareness: { name: "Самосознание", description: "Понимание собственных эмоций и их причин" },
    social_skills: { name: "Социальные навыки", description: "Эффективное взаимодействие с другими людьми" },
    emotional_triggers: { name: "Эмоциональные триггеры", description: "Ситуации, вызывающие сильные эмоциональные реакции" },
    coping_strategies: { name: "Стратегии совладания", description: "Методы управления стрессом и эмоциями" },
    empathy_expression: { name: "Проявление эмпатии", description: "Ситуации, в которых вы проявляете сопереживание" }
};

let currentTest = { part: 'theoretical', index: 0 };
let eqScore = 0;
let testCompleted = false;
let userSelections = {
    theoretical: [],
    practical: []
};

// Загрузка теста EQ
function loadEQTest() {
    const testContainer = document.getElementById('eq-test');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const typeIndicator = document.getElementById('test-type-indicator');
    
    const totalQuestions = eqTests.theoretical.length + eqTests.practical.length;
    const currentQuestionNumber = currentTest.part === 'theoretical' 
        ? currentTest.index + 1 
        : eqTests.theoretical.length + currentTest.index + 1;
    
    // Обновление прогресса
    const progressPercent = (currentQuestionNumber / totalQuestions) * 100;
    progressFill.style.width = `${progressPercent}%`;
    progressText.textContent = `Вопрос ${currentQuestionNumber} из ${totalQuestions}`;
    
    // Обновление индикатора типа теста
    typeIndicator.textContent = currentTest.part === 'theoretical' 
        ? '📚 Теоретическая часть' 
        : '💡 Практическая часть';
    
    const currentPart = eqTests[currentTest.part];
    
    if (currentTest.index < currentPart.length) {
        const test = currentPart[currentTest.index];
        
        testContainer.innerHTML = `
            <div class="question">
                <h3>${test.question}</h3>
                ${test.multiple ? '<p class="multiple-hint">Можно выбрать несколько вариантов</p>' : ''}
                <div class="options ${test.multiple ? 'multiple' : 'single'}">
                    ${test.options.map((option, index) => `
                        <div class="option" data-value="${test.multiple ? option.value : option.value}" data-index="${index}">
                            ${test.multiple ? '<div class="checkbox"></div>' : ''}
                            <span>${option.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Добавляем обработчики для опций
        const options = testContainer.querySelectorAll('.option');
        let selectedOptions = [];
        
        options.forEach(option => {
            option.addEventListener('click', () => {
                if (testCompleted) return;
                
                if (test.multiple) {
                    // Множественный выбор
                    option.classList.toggle('selected');
                    const checkbox = option.querySelector('.checkbox');
                    checkbox.classList.toggle('checked');
                } else {
                    // Одиночный выбор
                    options.forEach(opt => {
                        opt.classList.remove('selected');
                        if (opt.querySelector('.checkbox')) {
                            opt.querySelector('.checkbox').classList.remove('checked');
                        }
                    });
                    option.classList.add('selected');
                    if (option.querySelector('.checkbox')) {
                        option.querySelector('.checkbox').classList.add('checked');
                    }
                }
                
                // Обновляем выбранные опции
                selectedOptions = [];
                options.forEach(opt => {
                    if (opt.classList.contains('selected')) {
                        selectedOptions.push({
                            value: opt.getAttribute('data-value'),
                            index: parseInt(opt.getAttribute('data-index'))
                        });
                    }
                });
                
                // Управление кнопкой продолжения
                const existingBtn = testContainer.querySelector('.next-btn');
                if (existingBtn) existingBtn.remove();
                
                if (selectedOptions.length > 0 || !test.multiple) {
                    const nextBtn = document.createElement('button');
                    nextBtn.className = 'submit-btn next-btn';
                    nextBtn.textContent = getNextButtonText();
                    nextBtn.style.marginTop = '20px';
                    
                    testContainer.appendChild(nextBtn);
                    
                    const handleNextClick = () => {
                        saveUserSelection(test, selectedOptions);
                        moveToNextQuestion();
                    };
                    
                    nextBtn.addEventListener('click', handleNextClick);
                }
            });
        });
    }
}

// Сохранение выбора пользователя
function saveUserSelection(test, selectedOptions) {
    const selection = {
        question: test.question,
        aspect: test.aspect,
        selected: selectedOptions.map(opt => ({
            value: opt.value,
            index: opt.index
        })),
        isMultiple: test.multiple || false
    };
    
    userSelections[currentTest.part].push(selection);
}

// Переход к следующему вопросу
function moveToNextQuestion() {
    const currentPart = eqTests[currentTest.part];
    
    currentTest.index++;
    
    if (currentTest.index >= currentPart.length) {
        // Переход к следующей части или завершение
        if (currentTest.part === 'theoretical') {
            currentTest.part = 'practical';
            currentTest.index = 0;
            loadEQTest();
        } else {
            testCompleted = true;
            calculateResults();
            showEQResult();
        }
    } else {
        loadEQTest();
    }
}

// Получение текста для кнопки продолжения
function getNextButtonText() {
    const currentPart = eqTests[currentTest.part];
    
    if (currentTest.index < currentPart.length - 1) {
        return 'Следующий вопрос';
    } else if (currentTest.part === 'theoretical') {
        return 'Перейти к практической части';
    } else {
        return 'Завершить тест';
    }
}

// Расчет результатов
function calculateResults() {
    // Расчет баллов за теоретическую часть
    userSelections.theoretical.forEach(selection => {
        if (selection.selected.length > 0) {
            const optionValue = eqTests.theoretical.find(t => 
                t.question === selection.question
            ).options[selection.selected[0].index].value;
            
            eqScore += optionValue;
        }
    });
    
    // Практическая часть анализируется качественно
}

// Показ результатов EQ теста
async function showEQResult() {
    const maxTheoreticalScore = eqTests.theoretical.length * 3;
    const percentage = (eqScore / maxTheoreticalScore) * 100;
    
    let eqLevel, message;
    
    if (percentage >= 80) {
        eqLevel = "Высокий";
        message = "Отличный результат! У вас высокий эмоциональный интеллект.";
    } else if (percentage >= 60) {
        eqLevel = "Средний";
        message = "Хороший результат! Ваш EQ на среднем уровне.";
    } else {
        eqLevel = "Развивающийся";
        message = "Есть над чем поработать! EQ можно развивать.";
    }
    
    // Сохранение результатов
    await saveEQResult(eqScore, eqLevel);
    
    // Обновление статистики
    await updateUserStats();
    
    // Показ основных результатов
    document.getElementById('eq-result').innerHTML = `
        <h3>${message}</h3>
        <p>Ваш балл за теоретическую часть: <strong>${eqScore}/${maxTheoreticalScore}</strong></p>
        <p>Уровень EQ: <strong>${eqLevel}</strong></p>
    `;
    
    // Показ детальных результатов
    showDetailedResults();
    
    document.getElementById('submit-eq').style.display = 'none';
    document.getElementById('eq-test').innerHTML = '<p>Тест завершен! Спасибо за участие.</p>';
}

// Показ детальных результатов по аспектам
function showDetailedResults() {
    const aspectsGrid = document.getElementById('aspects-grid');
    const detailedResults = document.getElementById('detailed-results');
    
    let aspectsHTML = '';
    
    // Анализ теоретической части
    Object.keys(eqAspects).forEach(aspectKey => {
        const aspect = eqAspects[aspectKey];
        const theoreticalAnswers = userSelections.theoretical.filter(s => s.aspect === aspectKey);
        
        if (theoreticalAnswers.length > 0) {
            const score = theoreticalAnswers[0].selected[0]?.value || 0;
            let level, description;
            
            if (score >= 3) {
                level = "Высокий";
                description = "У вас хорошо развит этот аспект EQ";
            } else if (score >= 2) {
                level = "Средний";
                description = "Этот аспект развит, но если вы немного постараетесь вы получите лучший результат. Попробуйте лучше анализировать свои ситуации и ставить себя на место других";
            } else {
                level = "Развивающийся";
                description = "Рекоумендуем чаще смотреть на себя со стороны и ставить себя на места людей. Не огорчайтесь на счёт результата, его можно качественно улучшить если вы постараетесь!";
            }
            
            aspectsHTML += `
                <div class="aspect-item">
                    <h4>${aspect.name}</h4>
                    <p class="aspect-description">${aspect.description}</p>
                    <div class="aspect-level ${level.toLowerCase()}">${level}</div>
                    <p class="aspect-advice">${description}</p>
                </div>
            `;
        }
    });
    
    // Анализ практической части
    userSelections.practical.forEach(selection => {
        const aspect = eqAspects[selection.aspect];
        if (aspect) {
            const selectedCount = selection.selected.length;
            const totalCount = eqTests.practical.find(p => p.aspect === selection.aspect)?.options.length || 1;
            
            aspectsHTML += `
                <div class="aspect-item">
                    <h4>${aspect.name}</h4>
                    <p class="aspect-description">${aspect.description}</p>
                    <div class="aspect-stats">Выбрано: ${selectedCount} из ${totalCount}</div>
                    <div class="selected-options">
                        <strong>Ваши ответы:</strong>
                        <ul>
                            ${selection.selected.map(opt => {
                                const optionText = eqTests.practical
                                    .find(p => p.aspect === selection.aspect)
                                    ?.options[opt.index]?.text || '';
                                return `<li>${optionText}</li>`;
                            }).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
    });
    
    aspectsGrid.innerHTML = aspectsHTML;
    detailedResults.style.display = 'block';
}

// Сохранение результатов EQ теста
async function saveEQResult(score, level) {
    try {
        await fetch('/save-eq-result', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                eqScore: score, 
                eqLevel: level,
                selections: userSelections 
            })
        });
    } catch (error) {
        console.error('Ошибка сохранения результатов EQ:', error);
    }
}

// Обновление статистики пользователя
async function updateUserStats() {
    try {
        const response = await fetch('/get-color');
        const data = await response.json();
        
        if (data.score) {
            let moodLevel;
            if (data.score <= 4) moodLevel = "Отличное";
            else if (data.score <= 7) moodLevel = "Хорошее";
            else if (data.score <= 10) moodLevel = "Нормальное";
            else moodLevel = "Требует внимания";
            
            document.getElementById('mood-stat').textContent = moodLevel;
        }
        
        if (data.eqLevel) {
            document.getElementById('eq-stat').textContent = data.eqLevel;
        }
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// Сброс теста
function resetEQTest() {
    currentTest = { part: 'theoretical', index: 0 };
    eqScore = 0;
    testCompleted = false;
    userSelections = {
        theoretical: [],
        practical: []
    };
    loadEQTest();
    document.getElementById('eq-result').textContent = '';
    document.getElementById('eq-recommendations').style.display = 'none';
    document.getElementById('detailed-results').style.display = 'none';
    document.getElementById('submit-eq').style.display = 'none';
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.getElementById('submit-eq');
    
    if (submitBtn) {
        loadEQTest();
        updateUserStats();
        
        // Добавляем кнопку сброса теста
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Пройти тест заново';
        resetBtn.className = 'submit-btn';
        resetBtn.style.marginTop = '10px';
        resetBtn.addEventListener('click', resetEQTest);
        
        document.querySelector('.quiz-container').appendChild(resetBtn);
    }
});