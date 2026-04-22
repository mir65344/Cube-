class MoodJournal {
    constructor() {
        // Конфиги
        this.STORAGE_KEY = 'moodJournalEntries';
        this.ENTRIES_PER_PAGE = 10;
        this.currentFilter = 'all';
        this.chartPeriod = 'all';
        this.moodChart = null;
        
        // DOM
        this.elements = {};
        
        this.init();
    }

    /**
        ИНИЦИАЛИЗАЦИЯ
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadEntries();
        this.updateStats();
        this.renderEntries();
        this.initChart();
        this.generateInsights();
        
        // Устанавливаем текущую дату/время
        const now = new Date();
        const localDateTime = now.toISOString().slice(0, 16);
        document.getElementById('entry-datetime').value = localDateTime;
    }

    /**
     * ВЕСЬ JS УЖЕ НАХОДИТСЯ В ИСПОЛНЯЕМОМ ФАЙЛЕ ДЛЯ СТРАНИЦЫ. НЕ НУЖНО ВНОСИТЬ СЮДА ИЗМЕНЕНИЯ. ГИТХАБ НЕ ИНИЦИАЛИЗИРУЕТ ЭТОТ ФАЙЛ!!!
     */
    cacheElements() {
        this.elements = {
            // формы
            quickNote: document.getElementById('quick-note'),
            saveQuickBtn: document.getElementById('save-quick-entry'),
            moodOptions: document.querySelectorAll('.mood-option'),
            quickTags: document.querySelectorAll('.quick-tags .tag'),
            
            // Ддтальная форма
            detailedForm: document.getElementById('detailed-form'),
            moodSlider: document.getElementById('mood-slider'),
            moodValue: document.getElementById('mood-value'),
            energySlider: document.getElementById('energy-slider'),
            stressSlider: document.getElementById('stress-slider'),
            sleepHours: document.getElementById('sleep-hours'),
            detailedNotes: document.getElementById('detailed-notes'),
            activityCheckboxes: document.querySelectorAll('input[name="activity"]'),
            saveDetailedBtn: document.getElementById('save-detailed-entry'),
            cancelDetailedBtn: document.getElementById('cancel-detailed'),
            
            // переключение форм
            toggleDetailBtn: document.getElementById('toggle-detail-btn'),
            
            // фильтры
            timeFilter: document.getElementById('time-filter'),
            moodFilter: document.getElementById('mood-filter'),
            exportBtn: document.getElementById('export-btn'),
            
            // статистика
            totalEntries: document.getElementById('total-entries'),
            avgMood: document.getElementById('avg-mood'),
            bestDay: document.getElementById('best-day'),
            currentStreak: document.getElementById('current-streak'),
            
            // Список записей
            entriesList: document.getElementById('entries-list'),
            noEntries: document.getElementById('no-entries'),
            
            // График
            moodChart: document.getElementById('moodChart'),
            chartControls: document.querySelectorAll('.chart-controls .nav-btn'),
            
            // Инсайты
            insightsList: document.getElementById('insights-list')
        };
    }

    /**
    ПРИВЯЗКА СОБЫТИЙ
     */
    bindEvents() {
        // Быстрая запись
        this.elements.saveQuickBtn.addEventListener('click', () => this.saveQuickEntry());
        this.elements.moodOptions.forEach(option => {
            option.addEventListener('click', (e) => this.selectMoodOption(e.target));
        });
        this.elements.quickTags.forEach(tag => {
            tag.addEventListener('click', (e) => this.toggleTag(e.target));
        });

        this.elements.moodSlider.addEventListener('input', (e) => {
            this.elements.moodValue.textContent = e.target.value;
        });
        this.elements.saveDetailedBtn.addEventListener('click', () => this.saveDetailedEntry());
        this.elements.cancelDetailedBtn.addEventListener('click', () => this.toggleForm());

        this.elements.toggleDetailBtn.addEventListener('click', () => this.toggleForm());

        // Фильтры
        this.elements.timeFilter.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderEntries();
            this.updateStats();
        });
        this.elements.moodFilter.addEventListener('change', () => this.renderEntries());
        this.elements.exportBtn.addEventListener('click', () => this.exportData());

        // График
        this.elements.chartControls.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.elements.chartControls.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.chartPeriod = e.target.dataset.period;
                this.updateChart();
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveQuickEntry();
            }
        });
    }

    /**
     РАБОТА С ХРАНИЛИЩЕМ
     */
    
    // Загрузить все записи
    loadEntries() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            this.entries = data ? JSON.parse(data) : [];
            this.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Ошибка загрузки записей:', error);
            this.entries = [];
        }
    }

    // Сохранить все записи
    saveEntries() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.entries));
        } catch (error) {
            console.error('Ошибка сохранения записей:', error);
        }
    }

    // Добавить новую запись
    addEntry(entryData) {
        const entry = {
            id: Date.now(),
            date: entryData.date || new Date().toISOString(),
            mood: parseFloat(entryData.mood) || 3,
            moodText: this.getMoodText(entryData.mood || 3),
            notes: entryData.notes || '',
            activities: entryData.activities || [],
            tags: entryData.tags || [],
            energy: entryData.energy || 3,
            stress: entryData.stress || 3,
            sleepHours: entryData.sleepHours || null,
            weather: entryData.weather || '',
            location: entryData.location || '',
            createdAt: new Date().toISOString()
        };

        this.entries.unshift(entry); 
        this.saveEntries();
        this.renderEntries();
        this.updateStats();
        this.updateChart();
        this.generateInsights();
        
        return entry;
    }


    deleteEntry(id) {
        if (confirm('Удалить эту запись?')) {
            this.entries = this.entries.filter(entry => entry.id !== id);
            this.saveEntries();
            this.renderEntries();
            this.updateStats();
            this.updateChart();
            this.generateInsights();
        }
    }


    renderEntries() {
        const filteredEntries = this.filterEntries();
        
        if (filteredEntries.length === 0) {
            this.elements.entriesList.innerHTML = `
                <h3>📅 История записей</h3>
                <div class="no-entries">
                    <p>${this.getNoEntriesMessage()}</p>
                </div>
            `;
            return;
        }

        let html = '<h3>📅 История записей</h3>';
        

        const groupedEntries = this.groupEntriesByDay(filteredEntries);
        
        Object.keys(groupedEntries).sort().reverse().forEach(date => {
            html += this.renderDaySection(date, groupedEntries[date]);
        });

        this.elements.entriesList.innerHTML = html;
        

        document.querySelectorAll('.delete-entry').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.journal-entry').dataset.id);
                this.deleteEntry(id);
            });
        });
    }


    filterEntries() {
        let filtered = [...this.entries];


        const now = new Date();
        switch (this.currentFilter) {
            case 'today':
                const today = now.toISOString().split('T')[0];
                filtered = filtered.filter(entry => 
                    entry.date.split('T')[0] === today
                );
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filtered = filtered.filter(entry => 
                    new Date(entry.date) >= weekAgo
                );
                break;
            case 'month':
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                filtered = filtered.filter(entry => 
                    new Date(entry.date) >= monthAgo
                );
                break;
            case 'last7':
                const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filtered = filtered.filter(entry => 
                    new Date(entry.date) >= last7
                );
                break;
            case 'last30':
                const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                filtered = filtered.filter(entry => 
                    new Date(entry.date) >= last30
                );
                break;
        }


        const moodFilter = this.elements.moodFilter.value;
        if (moodFilter !== 'all') {
            filtered = filtered.filter(entry => 
                Math.round(entry.mood).toString() === moodFilter
            );
        }

        return filtered;
    }

    groupEntriesByDay(entries) {
        return entries.reduce((groups, entry) => {
            const date = new Date(entry.date).toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            if (!groups[date]) groups[date] = [];
            groups[date].push(entry);
            return groups;
        }, {});
    }

    renderDaySection(date, dayEntries) {
        const avgMood = dayEntries.reduce((sum, entry) => sum + entry.mood, 0) / dayEntries.length;
        const moodEmoji = this.getMoodEmoji(avgMood);
        
        return `
            <div class="day-section">
                <div class="day-header">
                    <h4>${date} ${moodEmoji}</h4>
                    <span class="day-stats">${dayEntries.length} записей, среднее: ${avgMood.toFixed(1)}/5</span>
                </div>
                <div class="day-entries">
                    ${dayEntries.map(entry => this.renderEntry(entry)).join('')}
                </div>
            </div>
        `;
    }

    renderEntry(entry) {
        const date = new Date(entry.date);
        const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const moodEmoji = this.getMoodEmoji(entry.mood);
        
        return `
            <div class="journal-entry" data-id="${entry.id}">
                <div class="entry-header">
                    <div class="entry-time">${time}</div>
                    <div class="entry-mood">
                        <span class="mood-emoji">${moodEmoji}</span>
                        <span class="mood-value">${entry.mood.toFixed(1)}/5</span>
                    </div>
                    <button class="delete-entry" title="Удалить">×</button>
                </div>
                ${entry.notes ? `<div class="entry-notes">${entry.notes}</div>` : ''}
                ${entry.activities.length > 0 ? `
                    <div class="entry-activities">
                        ${entry.activities.map(act => `<span class="activity-tag">${act}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="entry-meta">
                    ${entry.energy ? `<span>⚡ ${entry.energy}/5</span>` : ''}
                    ${entry.stress ? `<span>💥 ${entry.stress}/5</span>` : ''}
                    ${entry.sleepHours ? `<span>😴 ${entry.sleepHours}ч</span>` : ''}
                </div>
            </div>
        `;
    }

    updateStats() {
        if (this.entries.length === 0) {
            this.elements.totalEntries.textContent = '0';
            this.elements.avgMood.textContent = '-';
            this.elements.bestDay.textContent = '-';
            this.elements.currentStreak.textContent = '0 дней';
            return;
        }

        this.elements.totalEntries.textContent = this.entries.length;
        
        // Среднее настроение
        const avgMood = this.entries.reduce((sum, entry) => sum + entry.mood, 0) / this.entries.length;
        this.elements.avgMood.textContent = avgMood.toFixed(1);
        
        // Лучший день
        const bestEntry = this.entries.reduce((best, entry) => 
            entry.mood > best.mood ? entry : best
        );
        const bestDate = new Date(bestEntry.date).toLocaleDateString('ru-RU', {
            month: 'short',
            day: 'numeric'
        });
        this.elements.bestDay.textContent = `${bestDate} (${bestEntry.mood.toFixed(1)})`;
        
        // Текущая серия (дни подряд с записями)
        this.elements.currentStreak.textContent = this.calculateStreak() + ' дней';

        this.displayPatternInsights();
    }

    displayPatternInsights() {
    const patterns = this.analyzeEntryPatterns();
    if (!patterns || patterns.length === 0) return;
    
    let insightsHTML = '<h4 style="margin-bottom: 15px; color: #00dbde;">🔍 Авто-анализ закономерностей</h4>';
    
    patterns.forEach(pattern => {
        insightsHTML += `
            <div class="pattern-insight ${pattern.type}">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <span style="font-size: 1.2rem;">${pattern.icon}</span>
                    <strong style="color: ${pattern.type === 'warning' ? '#ff6464' : '#4CAF50'}">
                        ${pattern.text}
                    </strong>
                </div>
                <div style="color: #a0a0c0; font-size: 0.9rem; margin-left: 34px;">
                    ${pattern.details}
                </div>
            </div>
        `;
    });
    
    // Находим или создаем контейнер
    let insightsContainer = document.getElementById('pattern-insights');
    if (!insightsContainer) {
        insightsContainer = document.createElement('div');
        insightsContainer.id = 'pattern-insights';
        insightsContainer.style.cssText = `
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 20px;
            margin-top: 20px;
            border-left: 4px solid #00dbde;
        `;
        
        // Вставляем после статистики
        const statsContainer = document.querySelector('.journal-controls');
        if (statsContainer) {
            statsContainer.appendChild(insightsContainer);
        }
    }
    
    insightsContainer.innerHTML = insightsHTML;
}

    // Рассчитать серию дней подряд
    calculateStreak() {
        if (this.entries.length === 0) return 0;
        
        const entriesByDate = new Set(
            this.entries.map(entry => entry.date.split('T')[0])
        );
        
        const dates = Array.from(entriesByDate).sort().reverse();
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        let currentDate = today;
        
        for (let i = 0; i < dates.length; i++) {
            const entryDate = dates[i];
            if (this.isConsecutiveDays(currentDate, entryDate)) {
                streak++;
                currentDate = this.getPreviousDay(currentDate);
            } else {
                break;
            }
        }
        
        return streak;
    }

    // Проверить, идут ли дни подряд
    isConsecutiveDays(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diff = Math.abs((d1 - d2) / (1000 * 60 * 60 * 24));
        return diff <= 1;
    }

    // Получить предыдущий день
    getPreviousDay(date) {
        const d = new Date(date);
        d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
    }

    /**
     * ГРАФИК НАСТРОЕНИЯ
     */

    // Инициализировать график
    initChart() {
        const ctx = this.elements.moodChart.getContext('2d');
        
        this.moodChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Настроение',
                    data: [],
                    borderColor: '#00dbde',
                    backgroundColor: 'rgba(0, 219, 222, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Настроение: ${context.parsed.y.toFixed(1)}/5`
                        }
                    }
                },
                scales: {
                    y: {
                        min: 1,
                        max: 5,
                        ticks: {
                            callback: (value) => {
                                const emojis = ['😢', '😔', '😐', '😊', '😄'];
                                return emojis[value - 1] || value;
                            }
                        }
                    }
                }
            }
        });
        
        this.updateChart();
    }

    // Обновить график
    updateChart() {
        const filteredEntries = this.filterEntriesForChart();
        
        if (filteredEntries.length === 0) {
            this.moodChart.data.labels = ['Нет данных'];
            this.moodChart.data.datasets[0].data = [0];
            this.moodChart.update();
            return;
        }
        
        // Подготовка данных
        const labels = filteredEntries.map(entry => 
            new Date(entry.date).toLocaleDateString('ru-RU', { 
                month: 'short', 
                day: 'numeric' 
            })
        );
        
        const data = filteredEntries.map(entry => entry.mood);
        
        // Обновление графика
        this.moodChart.data.labels = labels;
        this.moodChart.data.datasets[0].data = data;
        this.moodChart.update();
    }

    // Отфильтровать записи для графика
    filterEntriesForChart() {
        let filtered = [...this.entries];
        
        // Применяем период для графика
        if (this.chartPeriod !== 'all') {
            const days = parseInt(this.chartPeriod);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            filtered = filtered.filter(entry => 
                new Date(entry.date) >= cutoffDate
            );
        }
        
        // Ограничиваем количество точек на графике
        if (filtered.length > 30) {
            const step = Math.ceil(filtered.length / 30);
            filtered = filtered.filter((_, index) => index % step === 0);
        }
        
        return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    /**
     * ИНСАЙТЫ И АНАЛИЗ
     */

    // Сгенерировать инсайты
    generateInsights() {
        if (this.entries.length < 3) {
            this.elements.insightsList.innerHTML = `
                <div class="insight info">
                    <div class="insight-icon">💡</div>
                    <div class="insight-text">
                        Добавьте больше записей, чтобы увидеть закономерности в вашем настроении
                    </div>
                </div>
            `;
            return;
        }
        
        const insights = [];
        const lastWeekEntries = this.getEntriesFromLastDays(7);
        
        // Среднее настроение за неделю
        if (lastWeekEntries.length >= 3) {
            const avgMoodWeek = lastWeekEntries.reduce((sum, entry) => sum + entry.mood, 0) / lastWeekEntries.length;
            const avgMoodAll = this.entries.reduce((sum, entry) => sum + entry.mood, 0) / this.entries.length;
            
            if (avgMoodWeek > avgMoodAll + 0.5) {
                insights.push({
                    type: 'positive',
                    icon: '📈',
                    text: 'Отличная неделя! Ваше настроение выше среднего.'
                });
            } else if (avgMoodWeek < avgMoodAll - 0.5) {
                insights.push({
                    type: 'warning',
                    icon: '📉',
                    text: 'На этой неделе настроение ниже обычного. Может, стоит отдохнуть?'
                });
            }
        }
        
        // Лучшие дни недели
        const bestDay = this.findBestDayOfWeek();
        if (bestDay) {
            insights.push({
                type: 'info',
                icon: '⭐',
                text: `Судя по статистике, ${bestDay.day} — ваши самые продуктивные дни`
            });
        }
        
        // Серия записей
        const streak = this.calculateStreak();
        if (streak >= 3) {
            insights.push({
                type: 'positive',
                icon: '🔥',
                text: `Отлично! Вы ведёте дневник уже ${streak} дней подряд`
            });
        }
        
        // Если нет инсайтов
        if (insights.length === 0) {
            insights.push({
                type: 'info',
                icon: '🔍',
                text: 'Продолжайте вести дневник, чтобы увидеть больше закономерностей'
            });
        }
        
        // Отображаем инсайты
        this.elements.insightsList.innerHTML = insights.map(insight => `
            <div class="insight ${insight.type}">
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-text">${insight.text}</div>
            </div>
        `).join('');
    }

    analyzeEntryPatterns() {
    if (this.entries.length < 3) return null;
    
    const lastWeekEntries = this.getEntriesFromLastDays(7);
    if (lastWeekEntries.length < 3) return null;
    
    const insights = [];
    
    // 1. Среднее настроение за неделю
    const avgMoodWeek = lastWeekEntries.reduce((sum, entry) => sum + entry.mood, 0) / lastWeekEntries.length;
    
    // 2. Низкое настроение 3 дня подряд
    let lowMoodStreak = 0;
    let maxLowMoodStreak = 0;
    
    // Сортируем по дате
    const sortedEntries = [...lastWeekEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    for (let i = 0; i < sortedEntries.length; i++) {
        if (sortedEntries[i].mood < 2.5) {
            lowMoodStreak++;
            maxLowMoodStreak = Math.max(maxLowMoodStreak, lowMoodStreak);
        } else {
            lowMoodStreak = 0;
        }
    }
    
    if (maxLowMoodStreak >= 3) {
        insights.push({
            type: 'warning',
            icon: '⚠️',
            text: `Обнаружена серия из ${maxLowMoodStreak} дней с низким настроением подряд`,
            details: 'Это может указывать на накопленный стресс. Рекомендуется отдых и расслабление.'
        });
    }
    
    // 3. Сравнение с предыдущими днями
    if (sortedEntries.length >= 2) {
        const lastEntry = sortedEntries[sortedEntries.length - 1];
        const prevEntry = sortedEntries[sortedEntries.length - 2];
        
        if (lastEntry.mood < prevEntry.mood - 1) {
            insights.push({
                type: 'warning',
                icon: '📉',
                text: 'Резкое падение настроения',
                details: `С ${prevEntry.mood.toFixed(1)} до ${lastEntry.mood.toFixed(1)}. Возможно, нужна смена деятельности.`
            });
        } else if (lastEntry.mood > prevEntry.mood + 1) {
            insights.push({
                type: 'positive',
                icon: '📈',
                text: 'Значительное улучшение настроения',
                details: 'Отличный прогресс! Продолжайте в том же духе.'
            });
        }
    }
    
    // 4. Низкая энергия
    const lowEnergyEntries = lastWeekEntries.filter(entry => entry.energy && entry.energy < 2);
    if (lowEnergyEntries.length >= 3) {
        insights.push({
            type: 'warning',
            icon: '⚡',
            text: 'Несколько дней низкой энергии',
            details: `${lowEnergyEntries.length} из ${lastWeekEntries.length} дней. Проверьте режим сна и питания.`
        });
    }
    
    // 5. Высокий стресс
    const highStressEntries = lastWeekEntries.filter(entry => entry.stress && entry.stress > 4);
    if (highStressEntries.length >= 2) {
        insights.push({
            type: 'warning',
            icon: '💥',
            text: 'Периоды высокого стресса',
            details: `Заметили ${highStressEntries.length} дня с высоким уровнем стресса. Рекомендуем техники релаксации.`
        });
    }
    
    return insights;
}


    // Найти лучший день недели
    findBestDayOfWeek() {
        if (this.entries.length < 7) return null;
        
        const dayStats = {};
        const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
        
        this.entries.forEach(entry => {
            const day = new Date(entry.date).getDay();
            if (!dayStats[day]) {
                dayStats[day] = { sum: 0, count: 0 };
            }
            dayStats[day].sum += entry.mood;
            dayStats[day].count++;
        });
        
        // Находим день с максимальным средним
        let bestDay = null;
        let bestAvg = 0;
        
        Object.keys(dayStats).forEach(day => {
            const avg = dayStats[day].sum / dayStats[day].count;
            if (avg > bestAvg) {
                bestAvg = avg;
                bestDay = {
                    day: days[day],
                    avg: avg
                };
            }
        });
        
        return bestDay;
    }

    // Получить записи за последние N дней
    getEntriesFromLastDays(days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return this.entries.filter(entry => 
            new Date(entry.date) >= cutoffDate
        );
    }

    /**
     * ФОРМЫ И ВВОД ДАННЫХ
     */

    // Сохранить быструю запись
    saveQuickEntry() {
        const selectedMood = document.querySelector('.mood-option.selected');
        if (!selectedMood) {
            alert('Пожалуйста, выберите настроение');
            return;
        }
        
        const mood = parseFloat(selectedMood.dataset.value);
        const notes = this.elements.quickNote.value.trim();
        const selectedTags = Array.from(document.querySelectorAll('.quick-tags .tag.selected'))
            .map(tag => tag.dataset.tag);
        
        const entryData = {
            mood: mood,
            notes: notes,
            tags: selectedTags,
            date: new Date().toISOString()
        };
        
        this.addEntry(entryData);
        
        // Сброс формы
        this.elements.quickNote.value = '';
        document.querySelectorAll('.quick-tags .tag.selected').forEach(tag => {
            tag.classList.remove('selected');
        });
        
        // Показать уведомление
        this.showNotification('Запись сохранена!', 'success');
    }

    // Сохранить детальную запись
    saveDetailedEntry() {
        const mood = parseFloat(this.elements.moodSlider.value);
        const notes = this.elements.detailedNotes.value.trim();
        const energy = parseInt(this.elements.energySlider.value);
        const stress = parseInt(this.elements.stressSlider.value);
        const sleepHours = parseFloat(this.elements.sleepHours.value);
        const date = this.elements.datetime.value || new Date().toISOString();
        
        const activities = Array.from(this.elements.activityCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        
        const entryData = {
            mood: mood,
            notes: notes,
            energy: energy,
            stress: stress,
            sleepHours: sleepHours,
            activities: activities,
            date: date
        };
        
        this.addEntry(entryData);
        this.toggleForm();
        this.showNotification('Детальная запись сохранена!', 'success');
    }

    // Переключить между быстрой и детальной формой
    toggleForm() {
        const isDetailedVisible = this.elements.detailedForm.style.display !== 'none';
        
        if (isDetailedVisible) {
            this.elements.detailedForm.style.display = 'none';
            this.elements.toggleDetailBtn.textContent = '📋 Перейти к детальной записи';
        } else {
            this.elements.detailedForm.style.display = 'block';
            this.elements.toggleDetailBtn.textContent = '📝 Вернуться к быстрой записи';
            
            // Сброс детальной формы
            this.elements.moodSlider.value = 3;
            this.elements.moodValue.textContent = '3.0';
            this.elements.energySlider.value = 3;
            this.elements.stressSlider.value = 3;
            this.elements.sleepHours.value = 7.5;
            this.elements.detailedNotes.value = '';
            this.elements.activityCheckboxes.forEach(cb => cb.checked = false);
        }
    }

    // Выбрать настроение в быстрой форме
    selectMoodOption(element) {
        document.querySelectorAll('.mood-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        element.classList.add('selected');
    }

    // Выбрать/отменить тег
    toggleTag(element) {
        element.classList.toggle('selected');
    }

    /**
     * ЭКСПОРТ ДАННЫХ
     */

    // Экспортировать данные
    exportData() {
        const data = {
            exportedAt: new Date().toISOString(),
            totalEntries: this.entries.length,
            entries: this.entries
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `mood-journal-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Данные экспортированы!', 'success');
    }

    /**
     * УТИЛИТЫ
     */

    // Получить текстовое описание настроения
    getMoodText(moodValue) {
        const mood = parseFloat(moodValue);
        if (mood >= 4.5) return 'Отличное';
        if (mood >= 3.5) return 'Хорошее';
        if (mood >= 2.5) return 'Нормальное';
        if (mood >= 1.5) return 'Подавленное';
        return 'Плохое';
    }

    // Получить emoji для настроения
    getMoodEmoji(moodValue) {
        const mood = parseFloat(moodValue);
        if (mood >= 4.5) return '😄';
        if (mood >= 3.5) return '😊';
        if (mood >= 2.5) return '😐';
        if (mood >= 1.5) return '😔';
        return '😢';
    }

    // Получить сообщение при отсутствии записей
    getNoEntriesMessage() {
        switch (this.currentFilter) {
            case 'today': return 'Сегодня ещё нет записей';
            case 'week': return 'На этой неделе нет записей';
            case 'month': return 'В этом месяце нет записей';
            default: return 'Пока нет записей. Добавьте первую!';
        }
    }

    // Показать уведомление
    showNotification(message, type = 'info') {
        // Удаляем старое уведомление
        const oldNotification = document.querySelector('.journal-notification');
        if (oldNotification) oldNotification.remove();
        
        // Создаем новое
        const notification = document.createElement('div');
        notification.className = `journal-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Автоматическое скрытие
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, находимся ли мы на странице дневника
    if (document.querySelector('.journal-container')) {
        window.moodJournal = new MoodJournal();
    }
});

/**
 * Функция для интеграции с quiz.js
 * Сохранить результат теста в дневник
 */
function saveTestToJournal(score, moodText, answers) {
    if (!window.moodJournal) {
        // Если дневник не инициализирован, создаем временный экземпляр
        if (!localStorage.getItem('moodJournalEntries')) {
            localStorage.setItem('moodJournalEntries', JSON.stringify([]));
        }
        
        const entries = JSON.parse(localStorage.getItem('moodJournalEntries') || '[]');
        const entry = {
            id: Date.now(),
            date: new Date().toISOString(),
            mood: score,
            moodText: moodText,
            notes: `Результат теста настроения: ${score.toFixed(1)}/5\n${answers ? 'Ответы: ' + JSON.stringify(answers) : ''}`,
            activities: ['тест'],
            tags: ['тест', 'авто'],
            createdAt: new Date().toISOString()
        };
        
        entries.unshift(entry);
        localStorage.setItem('moodJournalEntries', JSON.stringify(entries));
        
        alert('Результат теста сохранён в дневник!');
    } else {
        // Используем существующий журнал
        window.moodJournal.addEntry({
            mood: score,
            moodText: moodText,
            notes: `Результат теста настроения: ${score.toFixed(1)}/5`,
            activities: ['тест'],
            tags: ['тест', 'авто']
        });
        
        window.moodJournal.showNotification('Результат теста сохранён в дневник!', 'success');
    }
}
