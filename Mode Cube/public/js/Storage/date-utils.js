// утилиты для работы с датами

class DateUtils {
    // форматирование даты
    static formatDate(dateString, format = 'full') {
        const date = new Date(dateString);
        
        const formats = {
            short: date.toLocaleDateString('ru-RU'),
            full: date.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            time: date.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        return formats[format] || formats.full;
    }

    // получение начала недели
    static getWeekStart(date = new Date()) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    // Получение конца недели
    static getWeekEnd(date = new Date()) {
        const start = this.getWeekStart(date);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return end;
    }

    // разница в днях между датами
    static getDaysDiff(date1, date2) {
        const diffTime = Math.abs(date2 - date1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // является ли дата сегодняшним днем
    static isToday(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    // является ли дата текущей неделей
    static isCurrentWeek(dateString) {
        const date = new Date(dateString);
        const weekStart = this.getWeekStart();
        const weekEnd = this.getWeekEnd();
        return date >= weekStart && date <= weekEnd;
    }
}