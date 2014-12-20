/*global React,_,moment*/
(function () {
    'use strict';

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

    _.reduce(_.times(1000), function (year, i) {
        graph.addFact('eventOnce', 'Тест', null, null, {
            importance: Math.ceil(Math.random() * 100),
            date: moment([year]).unix()
        });
        return year + (Math.ceil(Math.random() * 4));
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

    var TimelineScale = React.createClass({
        mixins: [React.addons.PureRenderMixin],
        render: function () {
            var events = this.props.events;
            var lines = _(events).sortBy(function (a, b) {
                    if (a.importance === b.importance) {
                        return 0;
                    } else if (a.importance > b.importance) {
                        return 1;
                    } else {
                        return -1;
                    }
                }).map(function (event) {
                    if (event.type === 'eventOnce') {
                        return h('div', {
                            className: 'event event-once-line',
                            style: {
                                height: Timeline.getLineHeightByImportance(event.importance),
                                top: this.props.getPxForDate(event.date),
                                backgroundColor: Timeline.getEventColorByImportance(event.importance)
                            },
                            onMouseOver: this.props._onMouseOver.bind(null, events.indexOf(event))
                        });
                    } else if (event.type === 'eventLong') {
                        // todo
                    } else if (event.type === 'eventApproximate') {
                        // todo
                    }
                }.bind(this))
                .valueOf();
            return h('div', {
                className: 'timeline-scale'
            }, lines);
        }
    });

    var TimelineTitles = React.createClass({
        mixins: [React.addons.PureRenderMixin],
        render: function () {
            var renderedTitles = [];
            var titles = _(this.props.events).sortBy(function (a, b) {
                    if (a.importance === b.importance) {
                        return 0;
                    } else if (a.importance > b.importance) {
                        return -1;
                    } else {
                        return 1;
                    }
                }.bind(this)).filter(function (event) {
                    var newTop = this.props.getPxForDate(event.date);
                    if (newTop - Timeline.TITLE_SIZE <= 0) {
                        return false;
                    }
                    if (renderedTitles.some(function (top) {
                            return newTop - Timeline.TITLE_SIZE <= top && top <= newTop + Timeline.TITLE_SIZE;
                        })) {
                        return false;
                    }
                    renderedTitles.push(newTop);
                    return true;
                }.bind(this)).map(function (event) {
                    return h('div', {
                        className: 'event-title',
                        style: {
                            top: this.props.getPxForDate(event.date) - Timeline.TITLE_SIZE,
                            borderBottomWidth: Timeline.getLineHeightByImportance(event.importance),
                            borderColor: Timeline.getEventColorByImportance(event.importance)
                        }
                    }, event.title);
                }.bind(this))
                .valueOf();
            return h('div', {
                className: 'timeline-titles-statics'
            }, titles);
        }
    });

    var Timeline = React.createClass({
        statics: {
            TITLE_SIZE: 20,
            getEventColorByImportance: function (importance) {
                if (importance > 90) {
                    return '#d9534f';
                }
                if (importance > 50) {
                    return '#f0ad4e';
                }
                return '#337ab7';
            },
            getLineHeightByImportance: function (importance) {
                if (importance > 90) {
                    return 3;
                }
                if (importance > 50) {
                    return 2;
                }
                return 1;
            }
        },
        getInitialState: function () {
            return {
                start: moment([1000]).unix(),
                end: moment([2000]).unix(),
                events: graph.getEventsInRange(
                    moment([1000]).unix(), moment([2000]).unix()),
                getPxForDate: function (date) {
                    var pxSize = this.getDOMNode().offsetHeight;
                    var timeSize = this.state.end - this.state.start;
                    var msPerPx = timeSize / pxSize;
                    return (date - this.state.start) / msPerPx;
                }.bind(this)
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
            var events = this.state.events;
            var getPxForDate = this.state.getPxForDate;

            var titleOver;
            if (this.state.over) {
                var event = events[this.state.over];
                titleOver = h('div', {
                    className: 'event-title event-over',
                    style: {
                        top: getPxForDate(event.date) - Timeline.TITLE_SIZE,
                        borderBottomWidth: Timeline.getLineHeightByImportance(event.importance),
                        borderColor: Timeline.getEventColorByImportance(event.importance)
                    }
                }, event.title);
            }

            return h('div', {
                    className: 'timeline'
                },
                h(TimelineScale, {
                    events: events,
                    getPxForDate: getPxForDate,
                    _onMouseOver: this._onMouseOver
                }),
                h('div', {
                        className: 'timeline-titles'
                    },
                    h(TimelineTitles, {
                        events: events,
                        getPxForDate: getPxForDate
                    }),

                    !!titleOver && h('div', {
                            className: 'event-over'
                        },
                        titleOver
                    )
                )
            );
        },
        _onMouseOver: function (i, e) {
            this.setState({
                over: i
            });
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
