// public/js/main.js - Главный загрузчик модулей

class ModuleLoader {
    constructor() {
        this.loadedModules = new Set();
        this.init();
    }

    async init() {
        // Загружаем утилиты
        await this.loadStorageUtils();
        
        // Определяем текущую страницу
        const page = this.detectPage();
        
        // Загружаем модули для текущей страницы
        await this.loadPageModules(page);
        
        // Инициализируем навигацию
        this.setupNavigation();
    }

    detectPage() {
        const path = window.location.pathname;
        if (path.includes('deep-test')) return 'deep-test';
        if (path.includes('journal')) return 'journal';
        if (path.includes('tests')) return 'tests';
        return 'home';
    }

    async loadStorageUtils() {
        try {
            // Загружаем утилиты для работы с хранилищем
            await this.loadScript('/js/storage/date-utils.js');
            await this.loadScript('/js/storage/storage.js');
            
            // Проверяем, загрузились ли утилиты
            if (!window.DateUtils || !window.moodStorage) {
                console.warn('Storage utilities not loaded, using fallback');
                this.initFallbackStorage();
            }
            
        } catch (error) {
            console.error('Error loading storage utilities:', error);
            this.initFallbackStorage();
        }
    }

    initFallbackStorage() {
        // Простое хранилище для fallback
        if (!window.moodStorage) {
            window.moodStorage = {
                saveTestResult: (data) => {
                    const results = JSON.parse(localStorage.getItem('mood_results') || '[]');
                    results.push({...data, date: new Date().toISOString()});
                    localStorage.setItem('mood_results', JSON.stringify(results));
                    return data;
                },
                getAllResults: () => JSON.parse(localStorage.getItem('mood_results') || '[]'),
                getStats: () => {
                    const results = JSON.parse(localStorage.getItem('mood_results') || '[]');
                    return {
                        totalTests: results.length,
                        weeklyTests: results.length,
                        averageScore: results.length > 0 ? 
                            results.reduce((sum, r) => sum + r.score, 0) / results.length : 0
                    };
                }
            };
        }

        if (!window.DateUtils) {
            window.DateUtils = {
                formatDate: (dateString, format = 'full') => {
                    const date = new Date(dateString);
                    if (format === 'short') return date.toLocaleDateString('ru-RU');
                    return date.toLocaleString('ru-RU');
                },
                isToday: (dateString) => {
                    const date = new Date(dateString);
                    const today = new Date();
                    return date.toDateString() === today.toDateString();
                }
            };
        }
    }

    async loadPageModules(page) {
        const modules = {
            'home': ['quiz', 'cube'],
            'deep-test': ['deep-test'],
            'journal': ['journal'],
            'tests': ['eq-test', 'tests']
        };

        const pageModules = modules[page] || [];
        
        for (const module of pageModules) {
            try {
                await this.loadScript(`/js/modules/${module}.js`);
                this.loadedModules.add(module);
                
                // Инициализируем модуль, если у него есть метод init
                if (window[`${module}Module`] && typeof window[`${module}Module`].init === 'function') {
                    window[`${module}Module`].init();
                }
                
            } catch (error) {
                console.error(`Error loading module ${module}:`, error);
            }
        }

        // Если на главной странице, инициализируем куб и тест
        if (page === 'home') {
            this.initializeHomePage();
        }
    }

    async loadScript(src) {
        return new Promise((resolve, reject) => {
            // Проверяем, не загружен ли уже скрипт
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log(`Loaded: ${src}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`Failed to load: ${src}`);
                reject(new Error(`Failed to load script: ${src}`));
            };
            document.head.appendChild(script);
        });
    }

    setupNavigation() {
        // Обновляем активные ссылки
        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (href.startsWith('/')) {
                // Убедимся, что ссылки указывают на правильные HTML файлы
                if (!href.endsWith('.html') && href !== '/') {
                    link.setAttribute('href', href + '.html');
                }
            }
        });
    }

    initializeHomePage() {
        // Инициализация куба
        if (typeof initializeCube === 'function') {
            initializeCube();
        }
        
        // Инициализация теста настроения
        if (typeof initializeQuiz === 'function') {
            initializeQuiz();
        }
        
        // Загружаем историю тестов
        this.loadTestHistory();
    }

    async loadTestHistory() {
        try {
            if (typeof loadTestHistory === 'function') {
                await loadTestHistory();
            }
        } catch (error) {
            console.error('Error loading test history:', error);
        }
    }
}

// Глобальный доступ к загрузчику
window.moduleLoader = new ModuleLoader();
