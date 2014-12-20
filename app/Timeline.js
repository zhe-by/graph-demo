(function () {
    'use strict';
    var TimelineScale = React.createClass({
        mixins: [React.addons.PureRenderMixin],
        render: function () {
            var events = this.props.events;
            var lines = _(events)
                .sortBy('importance')
                .map(function (event) {
                    if (event.type === 'eventOnce') {
                        return h('div', {
                            className: 'event event-once-line',
                            style: {
                                height: zhe.Timeline.getLineHeightByImportance(event.importance),
                                top: this.props.getPxForDate(event.date),
                                backgroundColor: zhe.Timeline.getEventColorByImportance(event.importance)
                            },
                            onMouseOver: this.props.onHoverLine.bind(null, events.indexOf(event))
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
            var titles = _(this.props.events)
                .sortBy(function (event) {
                    return -event.importance;
                })
                .filter(function (event) {
                    var newTop = this.props.getPxForDate(event.date);
                    if (newTop - this.props.titleSize <= 0) {
                        return false;
                    }
                    var isPlaceUsed = _.some(renderedTitles, function (top) {
                        return newTop - this.props.titleSize <= top && top <= newTop + this.props.titleSize;
                    }.bind(this));
                    if (isPlaceUsed) {
                        return false;
                    }
                    renderedTitles.push(newTop);
                    return true;
                }.bind(this))
                .map(function (event) {
                    return h('div', {
                        className: 'event-title',
                        style: {
                            top: this.props.getPxForDate(event.date) - this.props.titleSize,
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

    var TimelineOver = React.createClass({
        mixins: [React.addons.PureRenderMixin],
        render: function () {
            var titleOver = h('div', {
                    className: 'event-title event-over',
                    style: {
                        top: this.props.getPxForDate(this.props.event.date) - this.props.titleSize,
                        borderBottomWidth: zhe.Timeline.getLineHeightByImportance(this.props.event.importance),
                        borderColor: zhe.Timeline.getEventColorByImportance(this.props.event.importance)
                    }
                },
                h('span', null, moment.unix(this.props.event.date).year()),
                h('span', null, ' ' + this.props.event.title)
            );

            return h('div', {
                    className: 'event-over'
                },
                titleOver
            );
        }
    });

    zhe.Timeline = React.createClass({
        statics: {
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
        getDefaultProps: function () {
            return {
                titleSize: 20
            };
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
                return h('div', {
                    className: 'timeline'
                });
            }

            return h('div', {
                    className: 'timeline'
                },
                h(TimelineScale, {
                    events: this.state.events,
                    getPxForDate: this.state.getPxForDate,
                    onHoverLine: this.onHoverLine
                }),
                h('div', {
                        className: 'timeline-titles'
                    },
                    h(TimelineTitles, {
                        events: this.state.events,
                        getPxForDate: this.state.getPxForDate,
                        titleSize: this.props.titleSize
                    }),

                    !!this.state.over && h(TimelineOver, {
                        event: this.state.events[this.state.over],
                        getPxForDate: this.state.getPxForDate,
                        titleSize: this.props.titleSize
                    })
                )
            );
        },
        onHoverLine: function (i, e) {
            this.setState({
                over: i
            });
        }
    });
}());
