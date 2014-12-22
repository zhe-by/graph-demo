(function () {
    'use strict';
    var PxDateMixin = {
        getPxForDate: function (date) {
            return zhe.Timeline.getPxForDate(
                this.getDOMNode().offsetHeight,
                this.props.start,
                this.props.end,
                date);
        },
        getDateForPx: function (px) {
            return zhe.Timeline.getDateForPx(
                this.getDOMNode().offsetHeight,
                this.props.start,
                this.props.end,
                px);
        }
    };

    var TimelineScale = React.createClass({
        mixins: [
            React.addons.PureRenderMixin,
            PxDateMixin
        ],
        getInitialState: function () {
            return {
                newStart: null,
                newEnd: null
            };
        },
        render: function () {
            if (!this.isMounted()) {
                setTimeout(this.forceUpdate.bind(this), 0);
                return h('div', {
                    className: 'timeline-scale'
                });
            }

            var events = this.props.events;

            var lines = _(events)
                .sortBy('importance')
                .map(function (event) {
                    if (event.type === 'eventOnce') {
                        return h('div', {
                            className: 'event event-once-line',
                            style: {
                                height: zhe.Timeline.getLineHeightByImportance(event.importance),
                                top: this.getPxForDate(event.date),
                                backgroundColor: zhe.Timeline.getEventColorByImportance(event.importance)
                            }
                        });
                    } else if (event.type === 'eventLong') {
                        // todo
                    } else if (event.type === 'eventApproximate') {
                        // todo
                    }
                }.bind(this))
                .valueOf();
            var zoom;
            if (this.state.newStart) {
                zoom = h('div', {
                    className: 'timeline-scale-zoom',
                    style: {
                        top: this.getPxForDate(this.state.newStart),
                        height: this.getPxForDate(this.state.newEnd) -
                            this.getPxForDate(this.state.newStart)
                    }
                });
            }
            return h('div', {
                    className: 'timeline-scale',
                    onMouseMove: this.onHover,
                    onWheel: this.onWheel,
                    onClick: this.onClick,
                    onMouseDown: function (e) {
                        var startPos = e.clientY;
                        var MIN_ZOOM = 50;

                        var move = function (e) {
                            var newPos = e.clientY;
                            if (Math.abs(startPos - newPos) > MIN_ZOOM) {
                                this.setState({
                                    newStart: this.getDateForPx(startPos > newPos ? newPos : startPos),
                                    newEnd: this.getDateForPx(startPos > newPos ? startPos : newPos)
                                });
                            }
                        }.bind(this);

                        var end = function (e) {
                            document.body.removeEventListener('mouseup', end);
                            document.body.removeEventListener('mousemove', move);
                            var endPos = e.clientY;
                            if (Math.abs(startPos - endPos) > MIN_ZOOM) {
                                this.props.onZoom(this.state.newStart, this.state.newEnd);
                            }
                            this.setState({
                                newStart: null,
                                newEnd: null
                            });
                        }.bind(this);

                        document.body.addEventListener('mouseup', end);
                        document.body.addEventListener('mousemove', move);
                    }.bind(this)
                },
                h('div', null, lines),

                !!this.state.newStart && zoom
            );
        },
        findClosest: function (y) {
            return _.reduce(this.props.events,
                function (result, event, i) {
                    var lineY = this.getPxForDate(event.date);
                    if (Math.abs(lineY - y) < result.min) {
                        result.min = Math.abs(lineY - y);
                        result.index = i;
                        result.value = event;
                    }
                    return result;
                }.bind(this), {
                    min: Infinity,
                    index: -1,
                    value: undefined
                });
        },
        onHover: function (e) {
            var hovered = this.findClosest(e.clientY).value;
            this.props.onHoverLine(hovered);
        },
        onWheel: function (e) {
            var hovered = this.findClosest(e.clientY).value;
            var zoom = e.deltaY > 0 ? 1 : -1;

            var start = hovered.date - (hovered.date - this.props.start) * (zoom > 0 ? 1.1 : 0.9);
            var end = hovered.date + (this.props.end - hovered.date) * (zoom > 0 ? 1.1 : 0.9);

            this.props.onZoom(start, end);
        },
        onClick: function (e) {
            var hovered = this.findClosest(e.clientY).value;
            this.props.onSelect(hovered);
        }
    });

    var TimelineTitles = React.createClass({
        mixins: [
            React.addons.PureRenderMixin,
            PxDateMixin
        ],
        render: function () {
            if (!this.isMounted()) {
                setTimeout(this.forceUpdate.bind(this), 0);
                return h('div', {
                    className: 'timeline-titles-statics'
                });
            }

            var renderedTitles = [];
            var titles = _(this.props.events)
                .sortBy(function (event) {
                    return -event.importance;
                })
                .filter(function (event) {
                    var newTop = this.getPxForDate(event.date);
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
                            top: this.getPxForDate(event.date) - this.props.titleSize,
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
        mixins: [
            React.addons.PureRenderMixin,
            PxDateMixin
        ],
        render: function () {
            if (!this.isMounted()) {
                setTimeout(this.forceUpdate.bind(this), 0);
                return h('div', {
                    className: 'event-over-container'
                });
            }

            var titleOver = h('div', {
                    className: 'event-title event-over',
                    style: {
                        top: this.getPxForDate(this.props.event.date) - this.props.titleSize,
                        borderBottomWidth: zhe.Timeline.getLineHeightByImportance(this.props.event.importance),
                        borderColor: zhe.Timeline.getEventColorByImportance(this.props.event.importance)
                    }
                },
                h('span', null, moment.unix(this.props.event.date).year()),
                h('span', null, ' ' + this.props.event.title)
            );

            return h('div', {
                    className: 'event-over-container'
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
            },
            getPxForDate: function (sizePx, start, end, date) {
                function get(date) {
                    return (date - start) / (end - start) * sizePx;
                }
                return date ? get(date) : get;
            },
            getDateForPx: function (sizePx, start, end, px) {
                function get(px) {
                    return (px / sizePx) * (end - start) + start;
                }
                return px ? get(px) : get;
            }
        },
        getDefaultProps: function () {
            return {
                titleSize: 20
            };
        },
        getInitialState: function () {
            var start = moment([1000]).unix();
            var end = moment([2000]).unix();
            return {
                start: start,
                end: end,
                events: zhe.graph.getEventsInRange(start, end)
            };
        },
        render: function () {
            return h('div', {
                    className: 'timeline'
                },
                h(TimelineScale, {
                    events: this.state.events,
                    start: this.state.start,
                    end: this.state.end,
                    onHoverLine: this.onHoverLine,
                    onZoom: this.onZoom,
                    onSelect: this.props.onSelect
                }),
                h('div', {
                        className: 'timeline-titles'
                    },
                    h(TimelineTitles, {
                        events: this.state.events,
                        titleSize: this.props.titleSize,
                        start: this.state.start,
                        end: this.state.end
                    }),

                    !!this.state.over && h(TimelineOver, {
                        event: this.state.over,
                        start: this.state.start,
                        end: this.state.end,
                        titleSize: this.props.titleSize
                    })
                )
            );
        },
        onHoverLine: function (eventHovered) {
            this.setState({
                over: eventHovered
            });
        },
        onZoom: function (start, end) {
            this.setState({
                start: start,
                end: end,
                events: zhe.graph.getEventsInRange(start, end)
            });
        }
    });
}());
