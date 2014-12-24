define(function (require) {
    'use strict';

    var facts = [];
    var edges = [];

    var factTypes = {
        eventOnce: ['event'],
        eventLong: ['event'],
        eventApproximate: ['event', 'eventLong'],
        term: [],
        person: [],
        town: ['point'],
        battle: ['point'],
        country: ['point', 'area'],
        mapStatistic: ['point', 'area'],
        vectorBatch: ['point', 'vector'],
        vectorSimple: ['point', 'vector']
    };

    var titles = [
        'Боснийская война',
        'Присоединение к ЕС Австрии, Финляндии и Швеции',
        'Начало работы Всемирной торговой организации в Женеве',
        'Фернанду Кардозу вступил в должность президента Бразилии',
        'Первая чеченская война',
        'Малави Хастингс Банда арестован',
        'Таможенный союз между Республикой Беларусь и Российской Федерацией',
        'В море у острова Флорес (Индонезия) потерпел катастрофу самолёт',
        'Картахена, Колумбия. Потерпел катастрофу самолёт',
        'Начало войны Альто-Сенепа между Эквадором и Перу',
        'Катастрофа Ан-70 под Бородянкой',
        'Старт космического корабля Союз ТМ-21'
    ];

    _.reduce(_.times(5000), function (date, i) {
        addFact('eventOnce', titles[Math.ceil(Math.random() * (titles.length - 1))], null, null, {
            importance: Math.ceil(Math.random() * 100),
            date: date
        });
        return moment.unix(date).add((Math.ceil(Math.random() * 10) + 1), 'd').unix();
    }, moment([1000]).unix());

    function addFact(type, title, description, wikiUrl, data) {
        var fact = {
            type: type,
            title: title
        };
        if (description) {
            fact.description = description;
        }
        if (wikiUrl) {
            fact.wikiUrl = wikiUrl;
        }
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                fact[i] = data[i];
            }
        }
        facts.push(fact);
    }

    function addEdge(idOne, idTwo, type, size, data) {
        var edge = {
            idOne: idOne,
            idTwo: idTwo,
            type: type,
            size: size
        };
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                edge[i] = data[i];
            }
        }
        edges.push(edge);
    }

    function getEvents() {
        return _.filter(facts, function (fact) {
            return fact.type === 'eventOnce';
        });
    }

    return {
        addFact: addFact,
        addEdge: addEdge,
        getEvents: getEvents
    };
});
