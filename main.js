(function () {
    var h = React.createElement;

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

    var graph = (function () {
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

        function getEventsInRange(start, end) {
            return _.filter(facts, function (fact) {
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

    _.reduce(_.times(100), function (year, i) {
        graph.addFact('eventOnce', 'Тест', null, null, {
            importance: ~~(Math.random() * 100),
            date: moment([year]).unix()
        });
        return year + (~~(Math.random() * 30));
    }, 800);

    graph.addFact('eventOnce', 'Тест', null, null, {
        importance: 1,
        date: moment([1455]).unix()
    });
    graph.addFact('eventOnce', 'Тест', null, null, {
        importance: 1,
        date: moment([1666]).unix()
    });
    graph.addFact('eventOnce', 'Тест', null, null, {
        importance: 1,
        date: moment([1888]).unix()
    });

    var Timeline = React.createClass({
        statics: {
            getEventColorByImportance: function (importance) {
                if (importance > 90) {
                    return 'red';
                }
                if (importance > 50) {
                    return 'yellow';
                }
                return '#000';
            },
            getLineHeightByImportance: function (importance) {
                if (importance > 90) {
                    return 5;
                }
                if (importance > 50) {
                    return 3;
                }
                return 1;
            }
        },
        getInitialState: function () {
            return {
                start: moment([1000]).unix(),
                end: moment([2000]).unix()
            };
        },
        render: function () {
            if (!this.isMounted()) {
                setTimeout(function () {
                    this.forceUpdate();
                }.bind(this), 0);
                // todo set this div to full height
                return h('div', {
                    className: 'timeline'
                });
            }
            var pxSize = this.getDOMNode().offsetHeight;
            var timeSize = this.state.end - this.state.start;
            var msPerPx = timeSize / pxSize;
            var events = graph.getEventsInRange(
                this.state.start, this.state.end);

            var getPxForDate = function (date) {
                return (date - this.state.start) / msPerPx;
            }.bind(this);

            var lines = events.map(function (event) {
                if (event.type === 'eventOnce') {
                    return h('div', {
                        className: 'event event-once-line',
                        style: {
                            height: Timeline.getLineHeightByImportance(event.importance),
                            top: getPxForDate(event.date),
                            backgroundColor: Timeline.getEventColorByImportance(event.importance)
                        }
                    });
                } else if (event.type === 'eventLong') {
                    // todo
                } else if (event.type === 'eventApproximate') {
                    // todo
                }
            });
            return h('div', {
                    className: 'timeline'
                },
                h('div', {
                    className: 'timeline-scale'
                }, lines),
                h('div', {
                    className: 'timeline-titles'
                }, 'titles')
            );
        }
    });
    var Map = React.createClass({
        render: function () {
            return h('div', null, 'Map');
        }
    });
    var Persons = React.createClass({
        render: function () {
            return h('div', null, 'Persons');
        }
    });
    var Cloud = React.createClass({
        render: function () {
            return h('div', null, 'Cloud');
        }
    });
    var Wiki = React.createClass({
        render: function () {
            return h('div', null, 'Wiki');
        }
    });

    var App = React.createClass({
        render: function () {
            return h('div', {
                    className: 'container'
                },
                h('div', {
                    className: 'column column-first'
                }, h(Timeline)),
                h('div', {
                        className: 'column column-second'
                    },
                    h('div', {
                            className: 'row row-map'
                        },
                        h(Map)
                    ),
                    h('div', {
                            className: 'row row-persons'
                        },
                        h(Persons)
                    )
                ),
                h('div', {
                        className: 'column column-third'
                    },
                    h('div', {
                            className: 'row row-cloud'
                        },
                        h(Cloud)
                    ),
                    h('div', {
                            className: 'row row-wiki'
                        },
                        h(Wiki)
                    )
                )
            );
        }
    });

    React.render(
        h(App),
        document.getElementById('application')
    );
}());
