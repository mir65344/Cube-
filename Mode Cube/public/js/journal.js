// Система дневника настроения
class MoodJournal {
    constructor() {
        this.entries = [];
        this.selectedTags = new Set();
        this.currentPage = 1;
        this.pageSize = 10;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadEntries();
        await this.loadStatistics();
        this.setupChart();
    }

    setupEventListeners() {
        // Слайдер настроения
        const moodSlider = document.getElementById('moodSlider');
        const moodValue = document.getElementById('moodValue');
        
        if (moodSlider && moodValue) {
            moodSlider.addEventListener('input', (e) => {
                moodValue.textContent = e.target.value;
            });
        }

        // Выбор тегов
        document.querySelectorAll('.tag-option').forEach(tag => {
            tag.addEventListener('click', () => {
                const tagValue = tag.dataset.tag;
                if (this.selectedTags.has(tagValue)) {
                    this.selectedTags.delete(tagValue);
                    tag.classList.remove('selected');
                } else {
                    this.selectedTags.add(tagValue);
                    tag.classList.add('selected');
                }
            });
        });

        // Сохранение записи
        document.getElementById('saveEntry')?.addEventListener('click', () => {
            this.saveEntry();
        });

        // Быстрый тест
        document.getElementById('quickTest')?.addEventListener('click', () => {
            window.location.href = '/';
        });

        // Загрузка дополнительных записей
        document.getElementById('loadMore')?.addEventListener('click', () => {
            this.loadMoreEntries();
        });
    }

    async loadEntries() {
        try {
            const response = await fetch(`/api/journal-entries?limit=${this.pageSize}`);
            const data = await response.json();
            
            this.entries = data.entries || [];
            this.renderEntries();
            
        } catch (error) {
            console.error('Ошибка загрузки записей:', error);
        }
    }

    renderEntries() {
        const container = document.getElementById('journalEntries');
        if (!container) return;

        if (this.entries.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>📝 У вас еще нет записей в дневнике.</p>
                    <p>Создайте первую запись, чтобы начать отслеживать настроение!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.entries.map(entry => `
            <div class="journal-entry">
                <div class="entry-header">
                    <div class="entry-date">${this.formatDate(entry.date)}</div>
                    <div class="entry-mood ${this.getMoodClass(entry.mood_score)}">
                        Настроение: ${entry.mood_score}/5
                    </div>
                </div>
                
                ${entry.notes ? `
                    <div class="entry-notes">
                        ${this.escapeHtml(entry.notes)}
                    </div>
                ` : ''}
                
                ${entry.tags ? `
                    <div class="entry-tags">
                        ${JSON.parse(entry.tags).map(tag => `
                            <span class="tag">${tag}</span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    async saveEntry() {
        const moodScore = document.getElementById('moodSlider').value;
        const notes = document.getElementById('journalNotes').value;
        const tags = Array.from(this.selectedTags);

        try {
            const response = await fetch('/api/save-journal-entry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moodScore: parseFloat(moodScore),
                    notes: notes.trim(),
                    tags: tags
                })
            });

            const data = await response.json();
            
            if (data.success) {
                alert('✅ Запись сохранена!');
                
                // Сброс формы
                document.getElementById('moodSlider').value = 3;
                document.getElementById('moodValue').textContent = '3';
                document.getElementById('journalNotes').value = '';
                document.querySelectorAll('.tag-option.selected').forEach(tag => {
                    tag.classList.remove('selected');
                });
                this.selectedTags.clear();
                
                // Перезагрузка данных
                await this.loadEntries();
                await this.loadStatistics();
                this.updateChart();
            }
            
        } catch (error) {
            console.error('Ошибка сохранения записи:', error);
            alert('❌ Ошибка сохранения записи');
        }
    }

    async loadStatistics() {
        try {
            // Загружаем статистику за неделю
            const response = await fetch('/api/mood-stats?period=week');
            const data = await response.json();
            
            this.updateStatsDisplay(data);
            this.generateInsights(data);
            
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    }

    updateStatsDisplay(stats) {
        // Обновляем отображение статистики
        document.getElementById('avgMood').textContent = stats.averageScore ? stats.averageScore.toFixed(1) : '-';
        document.getElementById('totalEntries').textContent = stats.totalTests || 0;
        
        // Тренд настроения
        const trendElement = document.getElementById('moodTrend');
        if (stats.trends) {
            trendElement.innerHTML = `
                <div class="trend-indicator">
                    ${stats.trends.direction === 'improving' ? '↗️ Улучшение' : 
                      stats.trends.direction === 'declining' ? '↘️ Снижение' : '➡️ Стабильно'}
                    ${stats.trends.change !== '0.0' ? `${stats.trends.change}%` : ''}
                </div>
            `;
        }
        
        // Лучший день
        if (stats.dailyStats && stats.dailyStats.length > 0) {
            const bestDay = stats.dailyStats.reduce((best, current) => 
                current.avg_score > best.avg_score ? current : best
            );
            document.getElementById('bestDay').textContent = bestDay.avg_score.toFixed(1);
            document.getElementById('bestDayDate').textContent = this.formatDate(bestDay.date);
        }
        
        // Текущая серия
        this.calculateStreak(stats.dailyStats || []);
    }

    calculateStreak(dailyStats) {
        // Простой расчет серии дней подряд с записями
        const today = new Date().toISOString().split('T')[0];
        let streak = 0;
        
        for (let i = dailyStats.length - 1; i >= 0; i--) {
            streak++;
        }
        
        document.getElementById('currentStreak').textContent = `${streak} дней`;
    }

    setupChart() {
        const ctx = document.getElementById('moodChartCanvas')?.getContext('2d');
        if (!ctx) return;

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Настроение',
                    data: [],
                    borderColor: '#00dbde',
                    backgroundColor: 'rgba(0, 219, 222, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        min: 1,
                        max: 5,
                        ticks: {
                            callback: function(value) {
                                const moods = ['😞', '😐', '🙂', '😊', '😁'];
                                return moods[value - 1] || value;
                            }
                        }
                    }
                }
            }
        });
    }

    updateChart() {
        if (!this.chart) return;

        // Здесь можно добавить загрузку данных для графика
        // Временно используем тестовые данные
        const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        const data = [3.2, 3.8, 4.1, 3.5, 4.2, 4.5, 3.9];
        
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.update();
    }

    generateInsights(stats) {
        const container = document.getElementById('insightsContainer');
        const list = document.getElementById('insightsList');
        
        if (!stats.dailyStats || stats.dailyStats.length < 3) {
            container.style.display = 'none';
            return;
        }
        
        const insights = [];
        
        // Анализ тренда
        if (stats.trends.direction === 'improving') {
            insights.push({
                icon: '📈',
                text: 'Ваше настроение улучшается! Продолжайте в том же духе.',
                type: 'positive'
            });
        } else if (stats.trends.direction === 'declining') {
            insights.push({
                icon: '⚠️',
                text: 'Наблюдается снижение настроения. Рекомендуем обратить на это внимание.',
                type: 'warning'
            });
        }
        
        // Поиск паттернов
        const weekdayStats = this.analyzeWeekdayPatterns(stats.dailyStats);
        if (weekdayStats.bestDay) {
            insights.push({
                icon: '🌟',
                text: `Лучшие дни для вас: ${weekdayStats.bestDay}. Планируйте важные дела на эти дни.`,
                type: 'info'
            });
        }
        
        if (insights.length > 0) {
            container.style.display = 'block';
            list.innerHTML = insights.map(insight => `
                <div class="insight ${insight.type}">
                    <div class="insight-icon">${insight.icon}</div>
                    <div class="insight-text">${insight.text}</div>
                </div>
            `).join('');
        } else {
            container.style.display = 'none';
        }
    }

    analyzeWeekdayPatterns(dailyStats) {
        const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const scoresByDay = {};
        
        dailyStats.forEach(stat => {
            const date = new Date(stat.date);
            const day = weekdays[date.getDay()];
            
            if (!scoresByDay[day]) {
                scoresByDay[day] = { total: 0, count: 0 };
            }
            
            scoresByDay[day].total += stat.avg_score;
            scoresByDay[day].count++;
        });
        
        // Находим лучший день
        let bestDay = null;
        let bestScore = 0;
        
        Object.entries(scoresByDay).forEach(([day, data]) => {
            const avg = data.total / data.count;
            if (avg > bestScore) {
                bestScore = avg;
                bestDay = day;
            }
        });
        
        return { bestDay, bestScore };
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Сегодня';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Вчера';
        } else {
            return date.toLocaleDateString('ru-RU', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    getMoodClass(score) {
        if (score >= 4.5) return 'mood-excellent';
        if (score >= 3.5) return 'mood-good';
        if (score >= 2.5) return 'mood-normal';
        if (score >= 1.5) return 'mood-poor';
        return 'mood-bad';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async loadMoreEntries() {
        this.currentPage++;
        await this.loadEntries();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.moodJournal = new MoodJournal();
});
