class SimpleTestSystem {
    constructor() {
        this.currentTest = null;
        this.currentQuestion = 0;
        this.userAnswers = [];
        this.testInProgress = false;
        this.testCompleted = false;
        this.allQuestions = {};
        this.selectedQuestions = [];

        this.questionLimit = {
            eq: 10,      
            empathy: 10,  
            social: 10    
        };
        
        this.init();
    }

    init() {
        this.loadQuestions();
        this.setupEventListeners();
        this.loadTestStats();
        this.autoSelectFirstTest();
    }

    loadQuestions() {
    // база вопросов для EQ (47 вопросов)
    this.allQuestions.eq = [
        {
            type: 'theory',
            text: 'Когда вы видите, что кто-то расстроен, вы обычно:',
            options: [
                { text: 'Часто не замечаете, пока человек сам не скажет', value: '1', correct: false },
                { text: 'Сразу понимаете, что человек чувствует и почему', value: '3', correct: true },
                { text: 'Замечаете, что что-то не так, но не всегда понимаете причину', value: '2', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'В стрессовой ситуации вы:',
            options: [
                { text: 'Часто поддаётесь панике или гневу', value: '1', correct: false },
                { text: 'Сохраняете спокойствие и ясно мыслите', value: '3', correct: true },
                { text: 'Иногда теряете самообладание, но быстро восстанавливаетесь', value: '2', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Как вы обычно реагируете на критику?',
            options: [
                { text: 'Сразу обижаюсь или злюсь', value: '1', correct: false },
                { text: 'Слушаю, анализирую и извлекаю уроки', value: '3', correct: true },
                { text: 'Защищаюсь, но потом обдумываю', value: '2', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Если вы опаздываете на важную встречу, как вы себя ведёте?',
            options: [
                { text: 'Как я мог опоздать? Буду очень торопиться и винить себя', value: '1', correct: false },
                { text: 'Стараюсь успокоиться и не винить себя', value: '3', correct: true },
                { text: 'Придумываю как оправдаться, стараюсь успокоиться', value: '2', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'multi',
            text: 'Какие эмоции вы чаще всего испытываете в течение дня? (выберите до 3)',
            options: [
                { text: 'тревога', value: 'тревога', correct: false },
                { text: 'радость', value: 'радость', correct: true },
                { text: 'скука', value: 'скука', correct: false },
                { text: 'спокойствие', value: 'спокойствие', correct: true },
                { text: 'гнев', value: 'гнев', correct: false },
                { text: 'интерес', value: 'интерес', correct: true }
            ].sort(() => Math.random() - 0.5),
            points: 3,
            maxChoices: 3
        },
        {
            type: 'theory',
            text: 'Когда вы чувствуете себя счастливым, вы обычно:',
            options: [
                { text: 'Боитесь, что это скоро закончится', value: '1', correct: false },
                { text: 'Наслаждаетесь моментом в одиночестве', value: '2', correct: false },
                { text: 'Делитесь своим состоянием с другими', value: '3', correct: true }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Как вы справляетесь с разочарованием?',
            options: [
                { text: 'Долго не могу прийти в себя', value: '1', correct: false },
                { text: 'Расстраиваюсь, но потом отпускаю', value: '2', correct: false },
                { text: 'Анализирую причины и делаю выводы', value: '3', correct: true }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Как вы реагируете на успехи других людей?',
            options: [
                { text: 'Сравниваю с собой и часто завидую', value: '1', correct: false },
                { text: 'Стараюсь порадоваться, но иногда зависть мешает', value: '2', correct: false },
                { text: 'Искренне радуюсь за них', value: '3', correct: true }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'multi',
            text: 'Что помогает вам улучшить настроение? (выберите до 3)',
            options: [
                { text: 'Еда', value: 'еда', correct: false },
                { text: 'Общение с близкими', value: 'общение', correct: true },
                { text: 'Алкоголь', value: 'алкоголь', correct: false },
                { text: 'Любимое хобби', value: 'хобби', correct: true },
                { text: 'Игнорирование проблемы', value: 'игнорирование', correct: false },
                { text: 'Физическая активность', value: 'спорт', correct: true }
            ].sort(() => Math.random() - 0.5),
            points: 3,
            maxChoices: 3
        },
        {
            type: 'theory',
            text: 'Как вы принимаете важные решения?',
            options: [
                { text: 'Руководствуюсь только логикой, игнорируя чувства', value: '1', correct: false },
                { text: 'Учитываю и логику, и свои эмоции', value: '3', correct: true },
                { text: 'Действую на эмоциях, потом жалею', value: '2', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Когда вам нужно сказать "нет", вы:',
            options: [
                { text: 'Говорите прямо, но тактично', value: '3', correct: true },
                { text: 'Испытываете вину, но отказываете', value: '2', correct: false },
                { text: 'Соглашаетесь, чтобы не обидеть', value: '1', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'multi',
            text: 'Что вызывает у вас чувство тревоги? (выберите до 3)',
            options: [
                { text: 'Неопределенность будущего', value: 'неопределенность', correct: true },
                { text: 'Конфликты с близкими', value: 'конфликты', correct: true },
                { text: 'Радостные события', value: 'радость', correct: false },
                { text: 'Публичные выступления', value: 'выступления', correct: true },
                { text: 'Спокойный отдых', value: 'отдых', correct: false },
                { text: 'Рутинные задачи', value: 'рутина', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3,
            maxChoices: 3
        },
        {
            type: 'theory',
            text: 'Как вы восстанавливаете силы после тяжелого дня?',
            options: [
                { text: 'Занимаюсь самоанализом, медитирую или отдыхаю', value: '3', correct: true },
                { text: 'Смотрю телевизор или играю в игры', value: '2', correct: false },
                { text: 'Ничего не делаю, лежу в подавленном состоянии', value: '1', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Как вы относитесь к своим ошибкам?',
            options: [
                { text: 'Воспринимаю как опыт для роста', value: '3', correct: true },
                { text: 'Стараюсь быстро забыть', value: '2', correct: false },
                { text: 'Долго ругаю себя за них', value: '1', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'multi',
            text: 'Какие чувства вы цените в отношениях? (выберите до 3)',
            options: [
                { text: 'Доверие', value: 'доверие', correct: true },
                { text: 'Искренность', value: 'искренность', correct: true },
                { text: 'Контроль', value: 'контроль', correct: false },
                { text: 'Зависть', value: 'зависть', correct: false },
                { text: 'Поддержка', value: 'поддержка', correct: true },
                { text: 'Равнодушие', value: 'равнодушие', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3,
            maxChoices: 3
        },
        {
            type: 'theory',
            text: 'Когда вы злитесь, как вы поступаете?',
            options: [
                { text: 'Выражаю злость конструктивно, объясняя причину', value: '3', correct: true },
                { text: 'Молчу, но внутри киплю', value: '2', correct: false },
                { text: 'Кричу или срываюсь на окружающих', value: '1', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Как вы мотивируете себя на сложные задачи?',
            options: [
                { text: 'Разбиваю задачу на этапы и награждаю себя', value: '3', correct: true },
                { text: 'Жду последнего момента и делаю на адреналине', value: '2', correct: false },
                { text: 'Избегаю задач, которые вызывают дискомфорт', value: '1', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Как вы чувствуете себя в одиночестве?',
            options: [
                { text: 'Комфортно, это время для саморазвития', value: '3', correct: true },
                { text: 'Нормально, но предпочитаю компанию', value: '2', correct: false },
                { text: 'Невыносимо, сразу ищу общения', value: '1', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'multi',
            text: 'Что для вас значит эмоциональная зрелость? (выберите до 3)',
            options: [
                { text: 'Умение управлять своими эмоциями', value: 'управление', correct: true },
                { text: 'Понимание чувств других', value: 'понимание', correct: true },
                { text: 'Игнорирование негативных эмоций', value: 'игнорирование', correct: false },
                { text: 'Ответственность за свои реакции', value: 'ответственность', correct: true },
                { text: 'Подавление всех эмоций', value: 'подавление', correct: false },
                { text: 'Частая смена настроений', value: 'нестабильность', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3,
            maxChoices: 3
        },
        {
            type: 'theory',
            text: 'Как вы проявляете заботу о себе?',
            options: [
                { text: 'Регулярно уделяю время своим потребностям', value: '3', correct: true },
                { text: 'Только когда уже совсем плохо', value: '2', correct: false },
                { text: 'Считаю, что это эгоизм', value: '1', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Как вы реагируете на неожиданные перемены в жизни?',
            options: [
                { text: 'Паникую и сопротивляюсь изменениям', value: '1', correct: false },
                { text: 'Принимаю с трудом, но постепенно адаптируюсь', value: '2', correct: false },
                { text: 'Воспринимаю как новый опыт и возможность роста', value: '3', correct: true }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Когда вы чувствуете себя перегруженным, как вы действуете?',
            options: [
                { text: 'Продолжаю работать через силу, пока не упаду', value: '1', correct: false },
                { text: 'Стараюсь игнорировать усталость', value: '2', correct: false },
                { text: 'Осознаю свои пределы и даю себе отдых', value: '3', correct: true }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Как вы относитесь к своим сильным сторонам?',
            options: [
                { text: 'Стесняюсь их и стараюсь не выделяться', value: '1', correct: false },
                { text: 'Использую их, но не придаю особого значения', value: '2', correct: false },
                { text: 'Признаю и ценю их, развиваю дальше', value: '3', correct: true }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'multi',
            text: 'Какие из этих утверждений о эмоциях верны? (выберите до 3)',
            options: [
                { text: 'Эмоции мешают рациональному мышлению', value: 'мешают', correct: false },
                { text: 'Все эмоции важны и имеют значение', value: 'важны', correct: true },
                { text: 'Сильные эмоции нужно подавлять', value: 'подавлять', correct: false },
                { text: 'Эмоции дают ценную информацию о потребностях', value: 'информация', correct: true },
                { text: 'Только позитивные эмоции полезны', value: 'позитивные', correct: false },
                { text: 'Навык управления эмоциями можно развивать', value: 'развивать', correct: true }
            ].sort(() => Math.random() - 0.5),
            points: 3,
            maxChoices: 3
        },
        {
            type: 'multi',
            text: 'Что помогает вам восстанавливать эмоциональный баланс? (выберите до 3)',
            options: [
                { text: 'Чрезмерная самокритика', value: 'самокритика', correct: false },
                { text: 'Практика благодарности', value: 'благодарность', correct: true },
                { text: 'Прогулки на природе', value: 'природа', correct: true },
                { text: 'Изоляция от всех', value: 'изоляция', correct: false },
                { text: 'Общение с поддерживающими людьми', value: 'общение', correct: true },
                { text: 'Игнорирование усталости', value: 'игнорирование', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3,
            maxChoices: 3
        }
    ];
        

    // База вопросов для эмпатии (10 вопросов)
    this.allQuestions.empathy = [
        {
            type: 'theory',
            text: 'Когда друг рассказывает о своей проблеме, вы обычно:',
            options: [
                { text: 'Слушаете, но иногда отвлекаетесь', value: '2', correct: false },
                { text: 'Сразу предлагаете решение', value: '1', correct: false },
                { text: 'Слушаете внимательно, задаете уточняющие вопросы', value: '3', correct: true }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Если вы видите, что незнакомый человек плачет в общественном месте, вы:',
            options: [
                { text: 'Пройдете мимо, не обращая внимания', value: '1', correct: false },
                { text: 'Подойдете и спросите, нужна ли помощь', value: '3', correct: true },
                { text: 'Почувствуете неловкость, но не подойдете', value: '2', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Когда вы видите несправедливость по отношению к другому человеку, вы:',
            options: [
                { text: 'Стараетесь помочь, если это в ваших силах', value: '3', correct: true },
                { text: 'Не обращаете внимания, это не ваше дело', value: '1', correct: false },
                { text: 'Сочувствуете, но не вмешиваетесь', value: '2', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'multi',
            text: 'Как вы проявляете заботу о близких? (выберите до 3)',
            options: [
                { text: 'Слушаю и поддерживаю', value: 'слушаю', correct: true },
                { text: 'Игнорирую, пока не попросят', value: 'игнорирую', correct: false },
                { text: 'Даю советы', value: 'советы', correct: false },
                { text: 'Помогаю практическими делами', value: 'помогаю', correct: true },
                { text: 'Дарю подарки', value: 'подарки', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3,
            maxChoices: 3
        },
        {
            type: 'theory',
            text: 'Когда коллега приходит на работу в плохом настроении, вы:',
            options: [
                { text: 'Спрашиваете, все ли в порядке, предлагаете помощь', value: '3', correct: true },
                { text: 'Делаете вид, что не замечаете', value: '2', correct: false },
                { text: 'Раздражаетесь из-за их настроения', value: '1', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'multi',
            text: 'Что помогает вам понять чувства другого человека? (выберите до 3)',
            options: [
                { text: 'Внимание к невербальным сигналам', value: 'невербальные', correct: true },
                { text: 'Собственный похожий опыт', value: 'опыт', correct: true },
                { text: 'Критика их поведения', value: 'критика', correct: false },
                { text: 'Активное слушание', value: 'слушание', correct: true },
                { text: 'Оценка их внешности', value: 'внешность', correct: false },
                { text: 'Сравнение с собой', value: 'сравнение', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3,
            maxChoices: 3
        },
        {
            type: 'theory',
            text: 'Если друг совершил ошибку и расстроен, вы:',
            options: [
                { text: 'Помогаете извлечь урок, не осуждая', value: '3', correct: true },
                { text: 'Говорите "я же предупреждал"', value: '1', correct: false },
                { text: 'Минимально утешаете, чтобы побыстрее закончить', value: '2', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'multi',
            text: 'В каких ситуациях вам труднее всего проявить эмпатию? (выберите до 3)',
            options: [
                { text: 'Когда человек повторяет одну и ту же ошибку', value: 'повтор', correct: true },
                { text: 'В конфликтных ситуациях', value: 'конфликт', correct: true },
                { text: 'Когда вы сами устали', value: 'усталость', correct: true },
                { text: 'С близкими людьми', value: 'близкие', correct: false },
                { text: 'В радостных ситуациях', value: 'радость', correct: false },
                { text: 'Когда просят совета', value: 'совет', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3,
            maxChoices: 3
        },
        {
            type: 'theory',
            text: 'Как вы реагируете на чужую боль?',
            options: [
                { text: 'Стараюсь почувствовать, что переживает человек', value: '3', correct: true },
                { text: 'Сочувствую, но дистанцируюсь', value: '2', correct: false },
                { text: 'Избегаю таких ситуаций', value: '1', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Когда вы не согласны с чьими-то чувствами, вы:',
            options: [
                { text: 'Принимаете их право на эти чувства', value: '3', correct: true },
                { text: 'Пытаетесь переубедить', value: '2', correct: false },
                { text: 'Считаете их неправильными', value: '1', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Когда вы общаетесь с человеком другой культуры, вы:',
            options: [
                { text: 'Стараюсь понять его точку зрения и особенности', value: '3', correct: true },
                { text: 'Оцениваю его через призму своих ценностей', value: '2', correct: false },
                { text: 'Избегаю глубокого общения из-за различий', value: '1', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Если вы видите, что кто-то радуется чему-то, что вам не нравится, вы:',
            options: [
                { text: 'Могу разделить их радость, даже если не понимаю причину', value: '3', correct: true },
                { text: 'Вежливо улыбаюсь, но внутри не понимаю', value: '2', correct: false },
                { text: 'Сразу говорю, что не разделяю их восторг', value: '1', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'multi',
            text: 'Какие признаки показывают, что человек нуждается в поддержке? (выберите до 3)',
            options: [
                { text: 'Изменение тона голоса', value: 'тон', correct: true },
                { text: 'Избегание зрительного контакта', value: 'взгляд', correct: true },
                { text: 'Чрезмерная веселость', value: 'веселость', correct: false },
                { text: 'Необычная молчаливость', value: 'молчание', correct: true },
                { text: 'Обычное поведение без изменений', value: 'обычное', correct: false },
                { text: 'Излишняя самокритика', value: 'самокритика', correct: true }
            ].sort(() => Math.random() - 0.5),
            points: 3,
            maxChoices: 3
        }
    ];

    // База вопросов для социального интеллекта (10 вопросов)
    this.allQuestions.social = [
        {
            type: 'theory',
            text: 'В новой компании вы обычно:',
            options: [
                { text: 'Быстро находите общий язык со всеми', value: '3', correct: true },
                { text: 'Ждете, когда к вам подойдут', value: '1', correct: false },
                { text: 'Присматриваетесь, затем вступаете в контакт', value: '2', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'При конфликте в коллективе вы:',
            options: [
                { text: 'Избегаете участия в конфликте', value: '1', correct: false },
                { text: 'Стараетесь найти компромисс', value: '3', correct: true },
                { text: 'Поддерживаете ту сторону, с которой согласны', value: '2', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Как вы ведете себя в формальной обстановке?',
            options: [
                { text: 'Чувствую себя скованно', value: '2', correct: false },
                { text: 'Соблюдаю правила этикета, но остаюсь собой', value: '3', correct: true },
                { text: 'Стараюсь избегать формальных мероприятий', value: '1', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'multi',
            text: 'Что важно для успешного общения? (выберите до 3)',
            options: [
                { text: 'Умение слушать', value: 'слушать', correct: true },
                { text: 'Частое перебивание', value: 'перебивание', correct: false },
                { text: 'Уважение к собеседнику', value: 'уважение', correct: true },
                { text: 'Уклонение от спорных тем', value: 'уклонение', correct: false },
                { text: 'Четкость выражения мыслей', value: 'четкость', correct: true },
                { text: 'Доминирование в разговоре', value: 'доминирование', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3,
            maxChoices: 3
        },
        {
            type: 'theory',
            text: 'Как вы строите отношения с новыми людьми?',
            options: [
                { text: 'Ищу общие интересы и точки соприкосновения', value: '3', correct: true },
                { text: 'Жду, когда проявят инициативу', value: '2', correct: false },
                { text: 'Избегаю новых знакомств', value: '1', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'multi',
            text: 'Какие качества помогают в социальных ситуациях? (выберите до 3)',
            options: [
                { text: 'Гибкость в общении', value: 'гибкость', correct: true },
                { text: 'Чрезмерная прямолинейность', value: 'прямолинейность', correct: false },
                { text: 'Наблюдательность', value: 'наблюдательность', correct: true },
                { text: 'Замкнутость', value: 'замкнутость', correct: false },
                { text: 'Чувство юмора', value: 'юмор', correct: true },
                { text: 'Высокомерие', value: 'высокомерие', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3,
            maxChoices: 3
        },
        {
            type: 'theory',
            text: 'Когда вас не понимают с первого раза, вы:',
            options: [
                { text: 'Объясняю другими словами, сохраняя терпение', value: '3', correct: true },
                { text: 'Раздражаюсь и прекращаю объяснять', value: '1', correct: false },
                { text: 'Повторяю то же самое громче', value: '2', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Как вы ведете себя в групповом обсуждении?',
            options: [
                { text: 'Высказываюсь, когда есть что сказать, и слушаю других', value: '3', correct: true },
                { text: 'Стараюсь доминировать в разговоре', value: '2', correct: false },
                { text: 'Предпочитаю молчать и наблюдать', value: '1', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'multi',
            text: 'Что помогает разрешать социальные конфликты? (выберите до 3)',
            options: [
                { text: 'Умение идти на уступки', value: 'уступки', correct: true },
                { text: 'Упрямое стояние на своем', value: 'упрямство', correct: false },
                { text: 'Понимание позиции другой стороны', value: 'понимание', correct: true },
                { text: 'Спокойный тон общения', value: 'спокойствие', correct: true },
                { text: 'Переход на личности', value: 'личности', correct: false },
                { text: 'Игнорирование проблемы', value: 'игнорирование', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3,
            maxChoices: 3
        },
        {
            type: 'theory',
            text: 'Как вы адаптируетесь к разным социальным группам?',
            options: [
                { text: 'Легко нахожу подход к разным людям', value: '3', correct: true },
                { text: 'Стараюсь быть собой, но это не всегда работает', value: '2', correct: false },
                { text: 'Чувствую себя не в своей тарелке', value: '1', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Как вы ведете себя, когда нужно выразить несогласие с авторитетным лицом?',
            options: [
                { text: 'Высказываю свое мнение уважительно и аргументированно', value: '3', correct: true },
                { text: 'Молчу, чтобы не создавать конфликт', value: '2', correct: false },
                { text: 'Говорю резко, защищая свою позицию', value: '1', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'theory',
            text: 'Когда вы замечаете, что в разговоре доминируете, вы:',
            options: [
                { text: 'Сознательно даю слово другим, задаю вопросы', value: '3', correct: true },
                { text: 'Продолжаю говорить, раз уж начал', value: '2', correct: false },
                { text: 'Не замечаю этого и продолжаю', value: '1', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3
        },
        {
            type: 'multi',
            text: 'Что важно для построения долгосрочных отношений? (выберите до 3)',
            options: [
                { text: 'Честность и открытость', value: 'честность', correct: true },
                { text: 'Постоянный контроль друга', value: 'контроль', correct: false },
                { text: 'Умение прощать ошибки', value: 'прощение', correct: true },
                { text: 'Полное совпадение интересов', value: 'совпадение', correct: false },
                { text: 'Взаимное уважение границ', value: 'границы', correct: true },
                { text: 'Ежедневное общение', value: 'ежедневно', correct: false }
            ].sort(() => Math.random() - 0.5),
            points: 3,
            maxChoices: 3
        }
    ];
}

    selectRandomQuestions(testType) {
    const allQuestions = this.allQuestions[testType];
    const limit = this.questionLimit[testType];
    
    if (!allQuestions || allQuestions.length === 0) {
        console.error('Нет вопросов для теста:', testType);
        return [];
    }
    
    // Если вопросов меньше или равно лимиту - просто перемешиваем все вопросы
    if (allQuestions.length <= limit) {
        return [...allQuestions].sort(() => Math.random() - 0.5);
    }
    
    // Используем Set для отслеживания уже выбранных вопросов
    const selectedIndices = new Set();
    const result = [];
    
    // Выбираем случайные уникальные вопросы
    while (result.length < limit) {
        const randomIndex = Math.floor(Math.random() * allQuestions.length);
        
        // Проверяем, что этот вопрос еще не выбран
        if (!selectedIndices.has(randomIndex)) {
            selectedIndices.add(randomIndex);
            result.push(allQuestions[randomIndex]);
        }
        
        // Защита от бесконечного цикла (на всякий случай)
        if (selectedIndices.size >= allQuestions.length) {
            break; // Все вопросы уже выбраны
        }
    }
    
    return result;
}

    setupEventListeners() {
    const testCategories = document.querySelector('.test-categories');
    
    if (!testCategories) {
        console.warn('Элемент .test-categories не найден!');
        return;
    }
    
    // Используем стрелочную функцию, чтобы сохранить контекст this
    testCategories.addEventListener('click', (e) => {
        // Ищем ближайшую кнопку, начиная от элемента, по которому кликнули
        const button = e.target.closest('.test-category-btn');
        
        if (!button) return; // Клик был не по кнопке
        
        // Получаем тип теста из data-атрибута
        const testType = button.dataset.test;
        
        if (!testType) {
            console.warn('У кнопки нет data-test атрибута!');
            return;
        }
        
        // Снимаем активный класс со всех кнопок
        document.querySelectorAll('.test-category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Добавляем активный класс нажатой кнопке
        button.classList.add('active');
        
        // Вызываем метод selectTest с правильным контекстом
        this.selectTest(testType);
    });

        // Кнопка начала теста
        const startBtn = document.getElementById('start-test');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startTest());
        }

        // Кнопки навигации
        const prevBtn = document.getElementById('prev-question');
        const nextBtn = document.getElementById('next-question');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevQuestion());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextQuestion());

        // Действия с результатами
        const saveBtn = document.getElementById('save-to-journal');
        const retakeBtn = document.getElementById('retake-test');
        
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveResultsToJournal());
        if (retakeBtn) retakeBtn.addEventListener('click', () => this.retakeTest());
    }

    selectTest(testType) {
    const testInfo = {
        eq: {
            title: '🧠 Тест на эмоциональный интеллект',
            description: `${this.questionLimit.eq} случайных вопросов из базы`,
            time: '5-7 минут'
        },
        empathy: {
            title: '💝 Тест на эмпатию',
            description: `${this.questionLimit.empathy} случайных вопросов из базы`,
            time: '3-5 минут'
        },
        social: {
            title: '👥 Тест на социальный интеллект',
            description: `${this.questionLimit.social} случайных вопросов из базы`,
            time: '3-5 минут'
        }
    };

    const info = testInfo[testType];
    if (!info) return;

    this.currentTest = testType;
    
    // Обновляем описание
    document.getElementById('test-title').textContent = info.title;
    document.getElementById('test-description').textContent = info.description;
    document.getElementById('test-time').textContent = info.time;
    document.getElementById('test-questions').textContent = `${this.questionLimit[testType]} случайных вопросов`;
    document.getElementById('test-parts').textContent = 'Теория + Практика';
}

    startTest() {
    if (!this.currentTest) {
        alert('Выберите тест для начала');
        return;
    }

    this.testInProgress = true;
    this.testCompleted = false;
    this.currentQuestion = 0;
    this.selectedQuestions = this.selectRandomQuestions(this.currentTest);
    
    // Проверяем, что вопросы выбрались
    if (this.selectedQuestions.length === 0) {
        alert('Не удалось загрузить вопросы для теста');
        return;
    }
    
    this.userAnswers = new Array(this.selectedQuestions.length).fill(null);
    
    // Показываем контейнер теста
    document.getElementById('test-container').style.display = 'block';
    document.querySelector('.test-description').style.display = 'none';
    document.querySelector('.tests-selection').style.display = 'none';
    
    // Загружаем первый вопрос
    this.loadQuestion();
    this.updateProgress();
}

    loadQuestion() {
        const question = this.selectedQuestions[this.currentQuestion];
        
        if (!question) {
            this.completeTest();
            return;
        }

        // Создаем HTML вопроса
        let questionHTML = `
            <div class="question" data-index="${this.currentQuestion}">
                <h3>${question.text}</h3>
        `;

        if (question.type === 'theory') {
            // Одиночный выбор
            questionHTML += '<div class="options">';
            question.options.forEach((option, index) => {
                const isSelected = this.userAnswers[this.currentQuestion] === option.value;
                questionHTML += `
                    <div class="option ${isSelected ? 'selected' : ''}" 
                         data-value="${option.value}" 
                         data-correct="${option.correct}">
                        <span>${option.text}</span>
                    </div>
                `;
            });
            questionHTML += '</div>';
        } 
        else if (question.type === 'multi') {
            // Множественный выбор
            const selected = this.userAnswers[this.currentQuestion] || [];
            questionHTML += `
                <p class="multiple-hint">Можно выбрать до ${question.maxChoices || 3} вариантов</p>
                <div class="options multiple">
            `;
            question.options.forEach((option, index) => {
                const isSelected = selected.includes(option.value);
                questionHTML += `
                    <div class="option ${isSelected ? 'selected' : ''}" 
                         data-value="${option.value}"
                         data-correct="${option.correct}">
                        <div class="checkbox ${isSelected ? 'checked' : ''}"></div>
                        <span>${option.text}</span>
                    </div>
                `;
            });
            questionHTML += '</div>';
        }

        questionHTML += '</div>';

        // Вставляем вопрос
        document.getElementById('current-test').innerHTML = questionHTML;

        // Добавляем обработчики
        this.setupQuestionHandlers(question);

        // Обновляем кнопку "Назад"
        const prevBtn = document.getElementById('prev-question');
        if (prevBtn) {
            prevBtn.style.display = this.currentQuestion > 0 ? 'block' : 'none';
        }
    }

    setupQuestionHandlers(question) {
        if (question.type === 'theory') {
            const options = document.querySelectorAll('.option');
            options.forEach(option => {
                option.addEventListener('click', () => {
                    if (this.testCompleted) return;
                    
                    // Снимаем выделение со всех
                    options.forEach(opt => opt.classList.remove('selected'));
                    
                    // Выделяем выбранный
                    option.classList.add('selected');
                    
                    // Сохраняем ответ
                    this.userAnswers[this.currentQuestion] = option.dataset.value;
                    
                    // Показываем правильность (опционально)
                    if (this.showAnswers) {
                        options.forEach(opt => {
                            if (opt.dataset.correct === 'true') {
                                opt.classList.add('correct-answer');
                            } else if (opt.dataset.correct === 'false') {
                                opt.classList.add('incorrect-answer');
                            }
                        });
                    }
                });
            });
        } 
        else if (question.type === 'multi') {
            const options = document.querySelectorAll('.option');
            const maxChoices = question.maxChoices || 3;
            
            options.forEach(option => {
                option.addEventListener('click', () => {
                    if (this.testCompleted) return;
                    
                    const selected = option.classList.contains('selected');
                    const currentSelected = document.querySelectorAll('.option.selected').length;
                    
                    if (!selected && currentSelected >= maxChoices) {
                        alert(`Можно выбрать не более ${maxChoices} вариантов`);
                        return;
                    }
                    
                    option.classList.toggle('selected');
                    const checkbox = option.querySelector('.checkbox');
                    if (checkbox) checkbox.classList.toggle('checked');
                    
                    // Сохраняем выбранные значения
                    const selectedValues = Array.from(document.querySelectorAll('.option.selected'))
                        .map(opt => opt.dataset.value);
                    this.userAnswers[this.currentQuestion] = selectedValues;
                });
            });
        }
    }

    nextQuestion() {
        const questions = this.selectedQuestions;
        
        // Проверяем, что ответ дан
        if (this.userAnswers[this.currentQuestion] === null || 
            (Array.isArray(this.userAnswers[this.currentQuestion]) && 
             this.userAnswers[this.currentQuestion].length === 0)) {
            alert('Пожалуйста, ответьте на вопрос');
            return;
        }

        // Переходим к следующему вопросу
        this.currentQuestion++;
        
        if (this.currentQuestion < questions.length) {
            this.loadQuestion();
            this.updateProgress();
        } else {
            this.completeTest();
        }
    }

    prevQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.loadQuestion();
            this.updateProgress();
        }
    }

    updateProgress() {
        const questions = this.selectedQuestions;
        const progress = ((this.currentQuestion + 1) / questions.length) * 100;
        
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) {
            progressText.textContent = `Вопрос ${this.currentQuestion + 1} из ${questions.length}`;
        }
    }

    completeTest() {
        this.testInProgress = false;
        this.testCompleted = true;
        
        // Скрываем вопросы, показываем результаты
        document.getElementById('current-test').style.display = 'none';
        document.getElementById('test-results').style.display = 'block';
        
        const nextBtn = document.getElementById('next-question');
        const prevBtn = document.getElementById('prev-question');
        
        if (nextBtn) nextBtn.style.display = 'none';
        if (prevBtn) prevBtn.style.display = 'none';
        
        // Рассчитываем результаты
        this.calculateResults();
    }

    calculateResults() {
        const questions = this.selectedQuestions;
        let totalScore = 0;
        let maxScore = 0;
        
        // Проходим по всем вопросам
        questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            
            // Максимальный балл за вопрос
            maxScore += question.points || 1;
            
            // Подсчет баллов
            if (question.type === 'theory') {
                // Теоретический вопрос
                const selectedOption = question.options.find(opt => opt.value === userAnswer);
                if (selectedOption && selectedOption.correct) {
                    totalScore += question.points || 1;
                }
            } 
            else if (question.type === 'multi') {
                // Множественный выбор
                if (!userAnswer || !Array.isArray(userAnswer)) return;
                
                let correctCount = 0;
                const correctOptions = question.options.filter(opt => opt.correct);
                
                // Считаем правильные ответы
                userAnswer.forEach(answer => {
                    const option = question.options.find(opt => opt.value === answer);
                    if (option && option.correct) {
                        correctCount++;
                    }
                });
                
                // Начисляем баллы пропорционально
                if (correctOptions.length > 0) {
                    const percentage = correctCount / correctOptions.length;
                    totalScore += Math.round((question.points || 1) * percentage);
                }
            }
        });
        
        // Сохраняем результаты
        this.results = {
            totalScore: totalScore,
            maxScore: maxScore,
            percentage: Math.round((totalScore / maxScore) * 100)
        };
        
        // Показываем результаты
        this.displayResults();
        
        // Сохраняем статистику
        this.saveTestStats();
    }

    displayResults() {
        const totalScoreElement = document.getElementById('total-score');
        const messageElement = document.getElementById('result-message');
        
        if (totalScoreElement) {
            totalScoreElement.textContent = 
                `${this.results.totalScore}/${this.results.maxScore} (${this.results.percentage}%)`;
        }
        
        if (messageElement) {
            messageElement.textContent = this.getResultMessage(this.results.percentage);
        }
        
        // Рекомендации
        const recommendationsElement = document.getElementById('recommendations');
        if (recommendationsElement) {
            recommendationsElement.innerHTML = this.getRecommendations(this.results.percentage);
        }
    }

    getResultMessage(percentage) {
        if (percentage >= 90) return 'Отличный результат! Вы обладаете выдающимся эмоциональным интеллектом. Вы не только прекрасно понимаете и управляете своими эмоциями, но и с необычайной точностью считываете эмоции, потребности и мотивы окружающих. Вы — «эмоциональный лидер», к которому люди тянутся за советом и поддержкой. Ваша коммуникация эффективна, вы мастерски разрешаете конфликты и создаёте вокруг себя позитивную и доверительную атмосферу. Ваши решения взвешены, так как вы умеете интегрировать логику и интуицию. 🎉';
        if (percentage >= 70) return 'Хороший результат! У вас очень хороший, развитый эмоциональный интеллект. Вы стабильно понимаете свои эмоции и в большинстве ситуаций хорошо справляетесь с ними. Вы надежный и приятный собеседник, умеете поддерживать и работать в команде. Иногда в состоянии сильного стресса или в абсолютно новых ситуациях вы можете реагировать импульсивно или не сразу понять скрытые эмоции других. Это уровень осознанной компетентности. 👍';
        if (percentage >= 50) return 'Средний результат. Ваш эмоциональный интеллект находится в развитии. Вы осознаёте его важность, но применение навыков ещё не стало автоматическим. Вы хорошо справляетесь в знакомых и спокойных обстоятельствах, однако в стрессе или конфликте можете «наступать на те же грабли»: замолкать, давать волю гневу или misinterpretować (неверно истолковывать) слова других. Это точка роста, где уже есть база для значительного прогресса. 📈';
        if (percentage >= 30) return 'Ваш эмоциональный интеллект пока ограничен. Эмоции (свои и чужие) могут казаться вам сложными, непонятными или даже мешающими. Вы скорее полагаетесь на логику, но можете сталкиваться с необъяснимыми конфликтами, чувством непонимания со стороны окружающих или сложностями в управлении своим настроением. Часто реакции бывают импульсивными. Это нормальная отправная точка для целенаправленной работы. 📈';
        return 'Вы испытываете серьёзные сложности в эмоциональной сфере. Мир эмоций может казаться вам чужим и угрожающим. Вероятны частые конфликты, ощущение изоляции, непонимание социальных сигналов и сильные эмоциональные всплески или, наоборот, «оцепенение». Такие результаты могут быть связаны с рядом глубоких причин, включая психологические травмы, неврологические особенности или длительное подавление эмоций';
    }

    getRecommendations(percentage) {
        let recommendations = '<h4>📋 Рекомендации</h4><ul>';
        
        if (percentage < 70) {
            if (this.currentTest === 'eq') {
                recommendations += `
                    <li>Работа со стрессом: Углубите практики осознанности (медитация, ведение дневника эмоций) для управления реакциями в моменты пикового напряжения.</li>
                    <li>Любопытство к другим: Практикуйте «активное любопытство»: задавайте больше уточняющих вопросов («Что ты при этом чувствовал?», «Что для тебя было самым важным?»), чтобы лучше понимать скрытые мотивы.</li>
                    <li>Обратная связь: Просите доверенных людей давать вам обратную связь о вашем поведении в конфликтных ситуациях.</li>
                    <li>Расширение словаря эмоций: Учитесь различать и называть более тонкие оттенки эмоций (например, раздражение vs. досада vs. обида).</li>
                `;
            } else if (this.currentTest === 'empathy') {
                recommendations += `
                    <li>Работайте над активным и направленным слушанием. Ваша цель — не дать совет или рассказать свою историю, а полностью сосредоточиться на другом.</li>
                    <li>Практикуйте верификацию чувств: «Если я правильно понимаю, ты сейчас злишься из-за несправедливости, да?».</li>
                    <li>Расширяйте свой эмоциональный словарь для более точного понимания оттенков (не просто «плохо», а «беспомощно», «уязвимо», «разочарованно»). Развивайте когнитивную эмпатию (понимание мыслей другого) через чтение художественной литературы и просмотр кино с глубоким погружением в персонажей.</li>
                `;
            } else if (this.currentTest === 'social') {
                recommendations += `
                    <li>Перейдите от участия к анализу и стратегии. Перед важной встречей или событием планируйте: кто будет присутствовать, каковы их роли и возможные цели?</li>
                    <li>Практикуйте светскую беседу (small talk) как инструмент для установления контакта, а не как пустую болтовню. Просите обратную связь после публичных выступлений или презентаций</li>
                    <li>Обращайте внимание не только на слова, но и на невербальные коды (позы, дистанцию, микровыражения) и социальную иерархию.</li>
                `;
            }
        }
        else if (percentage < 50) {
            if (this.currentTest === 'eq') {
                recommendations += `
                    <li>Пауза перед реакцией: Введите правило «сделать три глубоких вдоха» перед ответом в напряжённом разговоре.</li>
                    <li>Изучайте себя: Каждые вечер 5-10 минут анализируйте: «Какая эмоция была самой сильной сегодня? Что её вызвало? Как я отреагировал?»</li>
                    <li>Наблюдайте за другими: В транспорте или на совещаниях наблюдайте за языком тела и тоном голоса людей, пытайтесь угадать их эмоциональное состояние (без оценок).</li>
                `;
            } else if (this.currentTest === 'empathy') {
                recommendations += `
                    <li>Тренируйте базовую эмпатию: Практикуйте технику «отражения»: «Правильно ли я понимаю, что ты расстроен из-за...?»</li>
                    <li>Начинайте с самого себя и основ. Если сложно с эмоциями других, сначала учитесь лучше идентифицировать свои эмоции (что я чувствую сейчас? где в теле это ощущается?)</li>
                    <li>Используйте внешние опоры: «Шкалу эмоций» с картинками или списком состояний, чтобы сверяться. Задавайте простые, формализованные вопросы: «По шкале от 1 до 10, насколько это тебя расстроило?»</li>
                    <li>Фокусируйтесь на фактах и поведении, а не на попытке «прочувствовать»: «Я вижу, что ты сжал кулаки и говоришь громче. Похоже, эта тема для тебя очень важна». Рассмотрите консультацию со специалистом, чтобы исключить возможные причины (например, алекситимию).»</li>
                `;
            } else if (this.currentTest === 'social') {
                recommendations += `
                    <li>Начинайте с социального картирования и скриптов. Учитесь как актер: наблюдайте за успешными в общении людьми и заимствуйте их фразы, реакции, манеры для типовых ситуаций (знакомство, благодарность, извинение)</li>
                    <li>Сосредоточьтесь на одном навыке за раз (например, поддержание зрительного контакта или умение задавать открытые вопросы). Используйте «социальные тренировки» в безопасной обстановке (разговор с кассиром, вопрос коллеге о выходных).</li>
                    <li>Читайте книги или смотрите фильмы с последующим разбором мотивов и отношений персонажей.</li>
                `;
            }
        }
            
        else {
            recommendations += `
                <li>Менторство: Помогайте другим развивать их EQ, делитесь своим опытом.</li>
                <li>Глубокие задачи: Возьмитесь за проекты, требующие урегулирования затяжных конфликтов или преобразования корпоративной культуры.</li>
                <li>Самоконтроль границ: Учитывая вашу высокую эмпатию, следите за эмоциональным выгоранием, учитесь мягко дистанцироваться, когда это необходимо</li>
            `;
        }
        
        recommendations += '</ul>';
        return recommendations;
    }

    saveTestStats() {
        const stats = JSON.parse(localStorage.getItem('testStats') || '{}');
        
        if (!stats[this.currentTest]) {
            stats[this.currentTest] = [];
        }
        
        const testResult = {
            date: new Date().toISOString(),
            score: this.results.totalScore,
            maxScore: this.results.maxScore,
            percentage: this.results.percentage,
            testType: this.currentTest
        };
        
        stats[this.currentTest].push(testResult);
        
        // сохраняем только последние 5 результатов
        if (stats[this.currentTest].length > 5) {
            stats[this.currentTest] = stats[this.currentTest].slice(-5);
        }
        
        localStorage.setItem('testStats', JSON.stringify(stats));
        this.updateTestStats();
    }

    loadTestStats() {
        this.updateTestStats();
    }

    updateTestStats() {
        const stats = JSON.parse(localStorage.getItem('testStats') || '{}');
        
        let totalTests = 0;
        let lastTest = '-';
        
        Object.keys(stats).forEach(testType => {
            totalTests += stats[testType].length;
            
            if (stats[testType].length > 0) {
                const last = stats[testType][stats[testType].length - 1];
                const lastDate = new Date(last.date).toLocaleDateString('ru-RU');
                if (lastTest === '-' || new Date(last.date) > new Date(lastTest)) {
                    lastTest = lastDate;
                }
            }
        });
        
        const totalTestsElement = document.getElementById('total-tests');
        const lastTestElement = document.getElementById('last-test');
        
        if (totalTestsElement) totalTestsElement.textContent = totalTests;
        if (lastTestElement) lastTestElement.textContent = lastTest;
        
        // Считаем средний процент по EQ
        let eqTotal = 0;
        let eqCount = 0;
        if (stats.eq && stats.eq.length > 0) {
            stats.eq.forEach(result => {
                eqTotal += result.percentage;
                eqCount++;
            });
        }
        
        const avgEqElement = document.getElementById('avg-eq');
        if (avgEqElement) {
            avgEqElement.textContent = eqCount > 0 ? Math.round(eqTotal / eqCount) + '%' : '-';
        }
        
        // ПРогресс
        const progressElement = document.getElementById('progress');
        if (progressElement) {
            const totalPossibleTests = 3; // eq + empathy + social
            const progress = Math.min(100, Math.round((totalTests / totalPossibleTests) * 33.3));
            progressElement.textContent = progress + '%';
        }
    }

    saveResultsToJournal() {
        const testName = {
            eq: 'EQ тест',
            empathy: 'Тест на эмпатию',
            social: 'Тест на социальный интеллект'
        }[this.currentTest];
        
        if (!window.moodJournal) {
            // Сохраняем в localStorage
            const entries = JSON.parse(localStorage.getItem('moodJournalEntries') || '[]');
            const entry = {
                id: Date.now(),
                date: new Date().toISOString(),
                mood: Math.max(1, Math.min(5, Math.round(this.results.percentage / 20))),
                moodText: this.getMoodText(this.results.percentage),
                notes: `Результат ${testName}: ${this.results.totalScore}/${this.results.maxScore} баллов (${this.results.percentage}%)`,
                activities: ['тест', this.currentTest],
                tags: ['тест', 'психология', 'результат'],
                createdAt: new Date().toISOString()
            };
            
            entries.unshift(entry);
            localStorage.setItem('moodJournalEntries', JSON.stringify(entries));
            alert('Результат сохранён в дневник!');
        } else {
            window.moodJournal.addEntry({
                mood: Math.max(1, Math.min(5, Math.round(this.results.percentage / 20))),
                moodText: this.getMoodText(this.results.percentage),
                notes: `Результат ${testName}: ${this.results.totalScore}/${this.results.maxScore} баллов (${this.results.percentage}%)`,
                activities: ['тест', this.currentTest],
                tags: ['тест', 'психология', 'результат']
            });
            alert('Результат сохранён в дневник!');
        }
    }

    getMoodText(percentage) {
        if (percentage >= 80) return 'Отличное';
        if (percentage >= 60) return 'Хорошее';
        if (percentage >= 40) return 'Нормальное';
        if (percentage >= 20) return 'Подавленное';
        return 'Плохое';
    }

    retakeTest() {
    // Полностью сбрасываем состояние
    this.testInProgress = false;
    this.testCompleted = false;
    this.currentQuestion = 0;
    this.userAnswers = [];
    this.selectedQuestions = [];
    
    // Скрываем результаты, показываем контейнер теста
    document.getElementById('test-results').style.display = 'none';
    document.getElementById('test-container').style.display = 'block';
    document.getElementById('current-test').style.display = 'block';
    document.getElementById('next-question').style.display = 'block';
    
    // Прячем описание теста и выбор теста (если они еще видны)
    document.querySelector('.test-description').style.display = 'none';
    document.querySelector('.tests-selection').style.display = 'none';
    
    // запускаем тест заново
    this.startTest();
}
}

document.addEventListener('DOMContentLoaded', () => {
    window.testSystem = new SimpleTestSystem();
});







