// Система управления тестами
class TestManager {
    constructor() {
        this.tests = [];
        this.init();
    }

    async init() {
        await this.loadTests();
        this.renderTests();
    }

    async loadTests() {
        // Здесь можно загружать тесты с сервера
        this.tests = [
            {
                id: 'eq-1',
                title: 'Тест эмоционального интеллекта',
                description: 'Измерьте вашу способность понимать и управлять эмоциями',
                icon: '🧠',
                duration: '10 минут',
                questions: 20,
                category: 'EQ'
            },
            {
                id: 'stress-1',
                title: 'Уровень стресса',
                description: 'Оцените ваш текущий уровень стресса и получите рекомендации',
                icon: '⚡',
                duration: '5 минут',
                questions: 15,
                category: 'Стресс'
            },
            {
                id: 'burnout-1',
                title: 'Тест на выгорание',
                description: 'Определите признаки профессионального выгорания',
                icon: '🔥',
                duration: '8 минут',
                questions: 12,
                category: 'Профессия'
            },
            {
                id: 'communication-1',
                title: 'Навыки коммуникации',
                description: 'Оцените ваши коммуникативные способности',
                icon: '💬',
                duration: '7 минут',
                questions: 18,
                category: 'Коммуникация'
            }
        ];
    }

    renderTests() {
        const container = document.getElementById('testsGrid');
        if (!container) return;

        container.innerHTML = `
            <div class="tests-intro">
                <h2>Доступные тесты</h2>
                <p>Выберите тест для прохождения. Все тесты адаптируются под ваши ответы.</p>
            </div>
            
            <div class="tests-list">
                ${this.tests.map(test => `
                    <div class="test-card" data-test-id="${test.id}">
                        <div class="test-icon">${test.icon}</div>
                        <div class="test-content">
                            <h3>${test.title}</h3>
                            <p>${test.description}</p>
                            <div class="test-meta">
                                <span>⏱️ ${test.duration}</span>
                                <span>❓ ${test.questions} вопросов</span>
                                <span>🏷️ ${test.category}</span>
                            </div>
                            <button class="start-test" data-test-id="${test.id}">Начать тест</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <style>
                .tests-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 25px;
                    margin-top: 30px;
                }
                
                .test-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 25px;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                }
                
                .test-card:hover {
                    transform: translateY(-10px);
                    border-color: rgba(0, 219, 222, 0.5);
                }
                
                .test-icon {
                    font-size: 3rem;
                    margin-bottom: 15px;
                }
                
                .test-meta {
                    display: flex;
                    gap: 15px;
                    margin: 15px 0;
                    font-size: 0.9rem;
                    color: #a0a0c0;
                    flex-wrap: wrap;
                }
                
                .start-test {
                    padding: 10px 20px;
                    background: rgba(0, 219, 222, 0.2);
                    border: 1px solid rgba(0, 219, 222, 0.5);
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s;
                    width: 100%;
                }
                
                .start-test:hover {
                    background: rgba(0, 219, 222, 0.4);
                }
                
                @media (max-width: 768px) {
                    .tests-list {
                        grid-template-columns: 1fr;
                    }
                    
                    .test-meta {
                        flex-direction: column;
                        gap: 5px;
                    }
                }
            </style>
        `;

        // Добавляем обработчики
        document.querySelectorAll('.start-test').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const testId = e.target.dataset.testId;
                this.startTest(testId);
            });
        });
    }

    startTest(testId) {
        // Здесь можно реализовать запуск конкретного теста
        alert(`Запуск теста: ${testId}\n\nЭто демо-версия. Полная версия в разработке.`);
        
        // В полной версии можно перенаправлять на страницу теста
        // window.location.href = `/test/${testId}`;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.testManager = new TestManager();
});
