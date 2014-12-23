(function () {
    zhe.facts = [];
    zhe.edges = [];

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

    zhe.graph = (function () {
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
            zhe.facts.push(fact);
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
            zhe.edges.push(edge);
        }

        function getEventsInRange(start, end) {
            return _.filter(zhe.facts, function (fact) {
                if (fact.type === 'eventOnce') {
                    return start <= fact.date && fact.date <= end;
                } else if (fact.type === 'eventLong') {
                    // todo
                } else if (fact.type === 'eventApproximate') {
                    // todo
                }
            });
        }

        return {
            addFact: addFact,
            addEdge: addEdge,
            getEventsInRange: getEventsInRange
        };
    }());

    _.reduce(_.times(500), function (year, i) {
        zhe.graph.addFact('eventOnce', 'Тест', null, null, {
            importance: Math.ceil(Math.random() * 100),
            date: moment([year]).unix()
        });
        return year + (Math.ceil(Math.random() * 4) + 1);
    }, 800);

}());
