// ''элементы DOM для движения
const cube = document.getElementById('cube');
const rotateXBtn = document.getElementById('rotateX');
const rotateYBtn = document.getElementById('rotateY');
const rotateZBtn = document.getElementById('rotateZ');
const resetBtn = document.getElementById('reset');

// переменные для управления вращением
let rotation = {
    x: -15,
    y: 15,
    z: 0
};

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// цветовая палитра для разных уровней настроения
const moodColors = {
    1: { // очень плохое настроение
        primary: '#663366',
        secondary: '#330033',
        gradient: 'linear-gradient(135deg, #663366 0%, #330033 100%)'
    },
    2: { // плохое настроение
        primary: '#ff6666',
        secondary: '#cc3366',
        gradient: 'linear-gradient(135deg, #ff6666 0%, #cc3366 100%)'
    },
    3: { // нормальное настроение (нейтральный начальный)
        primary: '#a0a0ff',
        secondary: '#8080ff',
        gradient: 'linear-gradient(135deg, #a0a0ff 0%, #8080ff 100%)'
    },
    4: { // хорошее настроение
        primary: '#ffcc00',
        secondary: '#ff6600',
        gradient: 'linear-gradient(135deg, #ffcc00 0%, #ff6600 100%)'
    },
    5: { // отличное настроение
        primary: '#00ff88',
        secondary: '#0088ff',
        gradient: 'linear-gradient(135deg, #00ff88 0%, #0088ff 100%)'
    }
};

// функция для смешивания двух цветов
function mixColors(color1, color2, weight = 0.5) {
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    const r = Math.round(rgb1.r * (1 - weight) + rgb2.r * weight);
    const g = Math.round(rgb1.g * (1 - weight) + rgb2.g * weight);
    const b = Math.round(rgb1.b * (1 - weight) + rgb2.b * weight);

    return rgbToHex(r, g, b);
}

// функция для создания градиента по уровню настроения
function createMoodGradient(moodLevel) {
    const baseLevel = Math.floor(moodLevel);
    const nextLevel = Math.min(baseLevel + 1, 5);
    const blendFactor = moodLevel - baseLevel;

    if (blendFactor === 0 || nextLevel > 5) {
        return moodColors[baseLevel].gradient;
    }

    const baseColor = moodColors[baseLevel].primary;
    const nextColor = moodColors[nextLevel].primary;
    const mixedColor = mixColors(baseColor, nextColor, blendFactor);

    return `linear-gradient(135deg, ${mixedColor} 0%, ${mixColors(moodColors[baseLevel].secondary, moodColors[nextLevel].secondary, blendFactor)} 100%)`;
}

// функция обновления цвета куба на основе настроения
function updateCubeColor(moodLevel) {
    const gradient = createMoodGradient(moodLevel);
    const faces = document.querySelectorAll('.face');
    
    faces.forEach(face => {
        face.style.background = gradient;
        face.style.transition = 'all 1.5s ease';
        
        const glowColor = mixColors(moodColors[Math.round(moodLevel)].primary, '#ffffff', 0.3);
        face.style.boxShadow = `
            inset 0 0 30px rgba(255, 255, 255, 0.2),
            0 0 40px ${glowColor}
        `;
    });

    saveCubeColor(gradient, moodLevel);
}

// функция обновления вращения
function updateCubeRotation() {
    cube.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`;
}

// загрузка сохраненного цвета куба
function loadCubeColor() {
    try {
        const savedColor = localStorage.getItem('cubeColor');
        const savedScore = localStorage.getItem('moodScore');
        
        if (savedColor && savedScore) {
            const faces = document.querySelectorAll('.face');
            faces.forEach(face => {
                face.style.background = savedColor;
            });
        }
        // если нет сохраненного цвета куб остается с нейтральным цветом по умолчанию
    } catch (error) {
        console.log('Цвет куба не загружен');
    }
}

// обработчики кнопок вращения
if (rotateXBtn) {
    rotateXBtn.addEventListener('click', () => {
        rotation.x += 45;
        updateCubeRotation();
    });
}

if (rotateYBtn) {
    rotateYBtn.addEventListener('click', () => {
        rotation.y += 45;
        updateCubeRotation();
    });
}

if (rotateZBtn) {
    rotateZBtn.addEventListener('click', () => {
        rotation.z += 45;
        updateCubeRotation();
    });
}

if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        rotation = { x: -15, y: 15, z: 0 };
        updateCubeRotation();
    });
}

// свободное вращение мышью
if (cube) {
    cube.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
        cube.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        rotation.y += deltaX * 0.5;
        rotation.x -= deltaY * 0.5;
        
        updateCubeRotation();
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        cube.style.cursor = 'grab';
    });

    cube.addEventListener('touchstart', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        e.preventDefault();
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;
        
        rotation.y += deltaX * 0.5;
        rotation.x -= deltaY * 0.5;
        
        updateCubeRotation();
        
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        e.preventDefault();
    });

    document.addEventListener('touchend', () => {
        isDragging = false;
    });

    cube.style.cursor = 'grab';
}

// сохранение цвета куба
function saveCubeColor(color, score) {
    try {
        localStorage.setItem('cubeColor', color);
        localStorage.setItem('moodScore', score);
        localStorage.setItem('lastTestDate', new Date().toISOString());
    } catch (error) {
        console.error('Ошибка сохранения цвета:', error);
    }
}

// загрузка при старте
document.addEventListener('DOMContentLoaded', () => {
    loadCubeColor();
    updateCubeRotation();
});

// экспортируем функции для использования в других файлах
window.cubeController = {
    updateCubeColor,
    mixColors,
    createMoodGradient
};