// система хранения результатов с недельным сбросом

const STORAGE_KEYS = {
    CURRENT_WEEK: 'mood_current_week',
    WEEKLY_RESULTS: 'mood_weekly_results',
    ALL_RESULTS: 'mood_all_results',
    USER_STATS: 'mood_user_stats'
};

class MoodStorage {
    constructor() {
        this.init();
    }

    // инициализация системы хранения
    init() {
        this.checkWeekReset();
    }

    // проверка и сброс недельных результатов
    checkWeekReset() {
        const currentWeek = this.getCurrentWeekNumber();
        const storedWeek = localStorage.getItem(STORAGE_KEYS.CURRENT_WEEK);

        if (!storedWeek || storedWeek !== currentWeek) {
            // новая неделя - сохраняем старые результаты и очищаем текущие
            this.archiveWeeklyResults();
            localStorage.setItem(STORAGE_KEYS.CURRENT_WEEK, currentWeek);
            localStorage.setItem(STORAGE_KEYS.WEEKLY_RESULTS, JSON.stringify([]));
        }
    }

    // получение номера текущей недели
    getCurrentWeekNumber() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const pastDaysOfYear = (now - startOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    }

    // Сохранение результата теста
    saveTestResult(testData) {
        // Добавляем дату прохождения
        const resultWithDate = {
            ...testData,
            date: new Date().toISOString(),
            week: this.getCurrentWeekNumber(),
            timestamp: Date.now()
        };

        // Сохраняем в текущую неделю
        this.saveToWeeklyResults(resultWithDate);
        
        // Сохраняем в общую базу
        this.saveToAllResults(resultWithDate);

        return resultWithDate;
    }

    // Сохранение в недельные результаты
    saveToWeeklyResults(result) {
        const weeklyResults = this.getWeeklyResults();
        weeklyResults.push(result);
        localStorage.setItem(STORAGE_KEYS.WEEKLY_RESULTS, JSON.stringify(weeklyResults));
    }

    // Сохранение в общую базу
    saveToAllResults(result) {
        const allResults = this.getAllResults();
        allResults.push(result);
        
        // Сохраняем только последние 100 результатов
        const limitedResults = allResults.slice(-100);
        localStorage.setItem(STORAGE_KEYS.ALL_RESULTS, JSON.stringify(limitedResults));
    }

    // Архивирование недельных результатов
    archiveWeeklyResults() {
        const weeklyResults = this.getWeeklyResults();
        if (weeklyResults.length > 0) {
            const archive = {
                week: this.getCurrentWeekNumber() - 1, // Прошлая неделя
                year: new Date().getFullYear(),
                results: weeklyResults,
                averageScore: this.calculateAverageScore(weeklyResults)
            };
            
            // Можно сохранить архив или отправить на сервер
            console.log('Архив недельных результатов:', archive);
        }
    }

    // Получение недельных результатов
    getWeeklyResults() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.WEEKLY_RESULTS) || '[]');
    }

    // Получение всех результатов
    getAllResults() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_RESULTS) || '[]');
    }

    // Получение статистики
    getStats() {
        const allResults = this.getAllResults();
        const weeklyResults = this.getWeeklyResults();

        return {
            totalTests: allResults.length,
            weeklyTests: weeklyResults.length,
            averageScore: this.calculateAverageScore(allResults),
            weeklyAverage: this.calculateAverageScore(weeklyResults),
            lastTest: allResults[allResults.length - 1] || null,
            currentWeek: this.getCurrentWeekNumber()
        };
    }

    // Расчет среднего балла
    calculateAverageScore(results) {
        if (results.length === 0) return 0;
        const total = results.reduce((sum, result) => sum + result.score, 0);
        return total / results.length;
    }

    // получение результатов за период
    getResultsByPeriod(startDate, endDate) {
        const allResults = this.getAllResults();
        return allResults.filter(result => {
            const resultDate = new Date(result.date);
            return resultDate >= startDate && resultDate <= endDate;
        });
    }

    // получение результатов по неделям
    getWeeklyHistory() {
        const allResults = this.getAllResults();
        const weeklyGroups = {};

        allResults.forEach(result => {
            const weekKey = `${result.year || new Date(result.date).getFullYear()}-W${result.week}`;
            if (!weeklyGroups[weekKey]) {
                weeklyGroups[weekKey] = [];
            }
            weeklyGroups[weekKey].push(result);
        });

        return weeklyGroups;
    }

    // очистка всех данных
    clearAllData() {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.init();
    }
}

// создаем глобальный экземпляр
window.moodStorage = new MoodStorage();