(function () {
    'use strict';
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
                                height: zhe.Timeline.getLineHeightByImportance(event.importance),
                                top: this.props.getPxForDate(event.date),
                                backgroundColor: zhe.Timeline.getEventColorByImportance(event.importance)
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
                    if (newTop - zhe.Timeline.TITLE_SIZE <= 0) {
                        return false;
                    }
                    if (renderedTitles.some(function (top) {
                            return newTop - zhe.Timeline.TITLE_SIZE <= top && top <= newTop + zhe.Timeline.TITLE_SIZE;
                        })) {
                        return false;
                    }
                    renderedTitles.push(newTop);
                    return true;
                }.bind(this)).map(function (event) {
                    return h('div', {
                        className: 'event-title',
                        style: {
                            top: this.props.getPxForDate(event.date) - zhe.Timeline.TITLE_SIZE,
                            borderBottomWidth: zhe.Timeline.getLineHeightByImportance(event.importance),
                            borderColor: zhe.Timeline.getEventColorByImportance(event.importance)
                        }
                    }, event.title);
                }.bind(this))
                .valueOf();
            return h('div', {
                className: 'timeline-titles-statics'
            }, titles);
        }
    });

    zhe.Timeline = React.createClass({
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
                events: zhe.graph.getEventsInRange(
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
                        top: getPxForDate(event.date) - zhe.Timeline.TITLE_SIZE,
                        borderBottomWidth: zhe.Timeline.getLineHeightByImportance(event.importance),
                        borderColor: zhe.Timeline.getEventColorByImportance(event.importance)
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
}());
