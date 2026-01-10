// скрипт для страницы истории

document.addEventListener('DOMContentLoaded', function() {
    loadHistoryPage();
});

function loadHistoryPage() {
    displayLifetimeStats();
    displayWeeklyHistory();
    displayRecentResults();
}

function displayLifetimeStats() {
    const stats = window.moodStorage.getStats();
    const allResults = window.moodStorage.getAllResults();
    
    const statsHTML = `
        <div class="stat-card">
            <div class="stat-label">Всего тестов</div>
            <div class="stat-value">${stats.totalTests}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">На этой неделе</div>
            <div class="stat-value">${stats.weeklyTests}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Средний балл</div>
            <div class="stat-value">${stats.averageScore.toFixed(1)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Текущая неделя</div>
            <div class="stat-value">${stats.currentWeek}</div>
        </div>
    `;
    
    document.getElementById('lifetime-stats').innerHTML = statsHTML;
}

function displayWeeklyHistory() {
    const weeklyHistory = window.moodStorage.getWeeklyHistory();
    const weeklyContainer = document.getElementById('weekly-history');
    
    if (Object.keys(weeklyHistory).length === 0) {
        weeklyContainer.innerHTML = '<p>Пока нет данных по неделям</p>';
        return;
    }
    
    let weeklyHTML = '';
    
    Object.keys(weeklyHistory).sort().reverse().forEach(weekKey => {
        const weekResults = weeklyHistory[weekKey];
        const averageScore = window.moodStorage.calculateAverageScore(weekResults);
        const weekDate = new Date(weekResults[0].date);
        
        weeklyHTML += `
            <div class="weekly-section">
                <div class="week-header" onclick="toggleWeek('${weekKey}')">
                    <h4>Неделя ${weekKey} (${DateUtils.formatDate(weekDate, 'short')})</h4>
                    <div>Тестов: ${weekResults.length} | Средний балл: ${averageScore.toFixed(1)}</div>
                </div>
                <div class="week-results" id="week-${weekKey}">
                    ${weekResults.map(result => createResultHTML(result)).join('')}
                </div>
            </div>
        `;
    });
    
    weeklyContainer.innerHTML = weeklyHTML;
}

function displayRecentResults() {
    const allResults = window.moodStorage.getAllResults();
    const recentResults = allResults.slice(-10).reverse(); // последние 10 результатов
    
    const recentContainer = document.getElementById('recent-results');
    
    if (recentResults.length === 0) {
        recentContainer.innerHTML = '<p>Пока нет результатов тестов</p>';
        return;
    }
    
    recentContainer.innerHTML = recentResults.map(result => createResultHTML(result)).join('');
}

function createResultHTML(result) {
    const moodColors = {
        'Отличное 🌟': '#4CAF50',
        'Хорошее 😊': '#8BC34A',
        'Нормальное 🙂': '#FFC107',
        'Подавленное 😔': '#FF9800',
        'Плохое 😞': '#F44336'
    };
    
    const color = moodColors[result.moodText] || '#00dbde';
    
    return `
        <div class="result-item" style="border-left-color: ${color}">
            <div class="result-date">
                ${DateUtils.formatDate(result.date, 'full')}
                ${DateUtils.isToday(result.date) ? ' (Сегодня)' : ''}
            </div>
            <div class="result-score">${result.score.toFixed(1)}/5</div>
            <div class="result-mood" style="background: ${color}20; color: ${color}">
                ${result.moodText}
            </div>
        </div>
    `;
}

function toggleWeek(weekKey) {
    const weekElement = document.getElementById(`week-${weekKey}`);
    weekElement.classList.toggle('expanded');
}

function exportData() {
    const allResults = window.moodStorage.getAllResults();
    const dataStr = JSON.stringify(allResults, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `mood-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

function clearData() {
    if (confirm('Вы уверены, что хотите очистить всю историю? Это действие нельзя отменить.')) {
        window.moodStorage.clearAllData();
        loadHistoryPage();
        alert('История очищена');
    }
}