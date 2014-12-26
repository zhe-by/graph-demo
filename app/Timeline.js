define(function (require) {
    'use strict';
    var PxDateMixin = {
        getPxForDate: function (date) {
            return (function (sizePx, start, end, date) {
                return Math.ceil((date - start) / (end - start) * sizePx);
            }(this.height || (this.height = this.getDOMNode().offsetHeight),
                this.props.start,
                this.props.end,
                date));
        },
        getDateForPx: function (px) {
            return (function (sizePx, start, end, px) {
                return (px / sizePx) * (end - start) + start;
            }(this.height || (this.height = this.getDOMNode().offsetHeight),
                this.props.start,
                this.props.end,
                px));
        }
    };

    var TimelineScaleDates = React.createClass({
        displayName: 'TimelineScaleDates',
        statics: {
            durations: [{
                y: 500
            }, {
                y: 100
            }, {
                y: 50
            }, {
                y: 10
            }, {
                y: 5
            }, {
                y: 1
            }, {
                M: 4
            }, {
                M: 1
            }, {
                d: 7
            }, {
                d: 1
            }, {
                h: 4
            }, {
                h: 1
            }, {
                m: 15
            }, {
                m: 1
            }],
            durationTypes: [{
                type: 'y',
                format: 'YYYY'
            }, {
                type: 'M',
                format: 'MMM'
            }, {
                type: 'd',
                format: 'D'
            }, {
                type: 'h',
                format: 'H'
            }, {
                type: 'm',
                format: 'mm'
            }]
        },
        mixins: [
            React.addons.PureRenderMixin,
            PxDateMixin
        ],
        propTypes: {
            start: t.number.isRequired,
            end: t.number.isRequired
        },
        render: function () {
            if (!this.isMounted()) {
                setTimeout(this.forceUpdate.bind(this), 0);
                return h('div', {
                    className: 'timeline-scale-dates-container'
                });
            }
            var MARKS_MAX = 40;
            var minMarkDelta = (this.props.end - this.props.start) / MARKS_MAX;
            var duration = _.findLast(TimelineScaleDates.durations, function (duration) {
                return moment.duration(duration).asSeconds() > minMarkDelta;
            });
            var durationDeltaUnits = _.values(duration)[0];
            var durationType = _.keys(duration)[0];
            var durationTypeIndex = _.findIndex(TimelineScaleDates.durationTypes, {
                type: durationType
            });
            var startMoment = moment.unix(this.props.start);
            var markMoment = startMoment.clone().startOf(durationType);
            if (durationDeltaUnits !== 1) {
                markMoment.set(
                    durationType === 'd' ? 'D' : durationType,
                    Math.ceil(markMoment.get(durationType === 'd' ? 'D' : durationType) / durationDeltaUnits) * durationDeltaUnits + (durationType === 'd' ? 1 : 0)
                );
            }
            var marks = [];
            while (markMoment.unix() < this.props.end) {
                var durationFormat = TimelineScaleDates.durationTypes[durationTypeIndex].format;
                var parentFormat = durationTypeIndex ? TimelineScaleDates.durationTypes[durationTypeIndex - 1].format : '';
                var text = markMoment.format(parentFormat + ' ' + durationFormat);
                var mark = h('div', {
                        className: 'date-mark',
                        style: {
                            top: this.getPxForDate(markMoment.unix())
                        }
                    },
                    h('span', {
                            className: 'date-mark-text'
                        },
                        text
                    )
                );
                marks.push(mark);
                markMoment.add(durationDeltaUnits, durationType);
            }
            return h('div', {
                className: 'timeline-scale-dates-container'
            }, marks);
        }
    });

    var TimelineScale = React.createClass({
        displayName: 'TimelineScale',
        mixins: [
            React.addons.PureRenderMixin,
            PxDateMixin
        ],
        propTypes: {
            events: t.array.isRequired,
            start: t.number.isRequired,
            end: t.number.isRequired,
            onBoundsChange: t.func.isRequired,
            onHoverLine: t.func.isRequired,
            onSelect: t.func.isRequired
        },
        render: function () {
            if (!this.isMounted()) {
                setTimeout(this.forceUpdate.bind(this), 0);
                return h('div', {
                    className: 'timeline-scale'
                });
            }

            var lines = _(this.props.events)
                .map(function (event) {
                    if (event.type === 'eventOnce') {
                        return h('div', {
                            key: event.date + event.title,
                            className: 'event event-once-line',
                            style: {
                                height: Timeline.getLineHeightByImportance(event.importance),
                                top: this.getPxForDate(event.date),
                                backgroundColor: Timeline.getEventColorByImportance(event.importance),
                                opacity: Timeline.getLineOpacityByImportance(event.importance),
                                zIndex: event.importance
                            }
                        });
                    } else if (event.type === 'eventLong') {
                        // todo
                    } else if (event.type === 'eventApproximate') {
                        // todo
                    }
                }.bind(this))
                .valueOf();
            return h('div', {
                    className: 'timeline-scale',
                    onMouseMove: this.onHover,
                    onWheel: this.onWheel,
                    onClick: this.onClick
                },
                h('div', {
                    className: 'timeline-scale-lines'
                }, lines),
                h(TimelineScaleDates, {
                    start: this.props.start,
                    end: this.props.end
                }),
                h(TimelineRangeSelect, {
                    onBoundsChange: this.props.onBoundsChange,
                    start: this.props.start,
                    end: this.props.end
                })
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

            var start = hovered.date - (hovered.date - this.props.start) * (e.deltaY > 0 ? 1.2 : 0.8);
            var end = hovered.date + (this.props.end - hovered.date) * (e.deltaY > 0 ? 1.2 : 0.8);

            this.props.onBoundsChange(start, end);
        },
        onClick: function (e) {
            var hovered = this.findClosest(e.clientY).value;
            this.props.onSelect(hovered);
        }
    });

    var TimelineRangeSelect = React.createClass({
        displayName: 'TimelineRangeSelect',
        mixins: [
            React.addons.PureRenderMixin,
            PxDateMixin
        ],
        propTypes: {
            start: t.number.isRequired,
            end: t.number.isRequired,
            onBoundsChange: t.func.isRequired
        },
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
                    className: 'timeline-scale-zoom'
                });
            }
            var zoom;
            if (this.state.newStart) {
                zoom = h('div', {
                    className: 'timeline-scale-zoom-selection',
                    style: (function () {
                        var topPx = this.getPxForDate(this.state.newStart);
                        var heightPx = this.getPxForDate(this.state.newEnd) - topPx;
                        return {
                            top: topPx,
                            height: heightPx
                        };
                    }.call(this))
                });
            }
            return h('div', {
                    className: 'timeline-scale-zoom',
                    onMouseDown: this.onMouseDown
                },

                !!this.state.newStart && zoom
            );
        },
        onMouseDown: function (e) {
            var startPos = e.clientY;
            var MIN_ZOOM = 20;

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
                document.body.classList.remove('noselect');
                var endPos = e.clientY;
                if (Math.abs(startPos - endPos) > MIN_ZOOM) {
                    this.props.onBoundsChange(this.state.newStart, this.state.newEnd);
                }
                this.setState({
                    newStart: null,
                    newEnd: null
                });
            }.bind(this);

            document.body.addEventListener('mouseup', end);
            document.body.addEventListener('mousemove', move);
            document.body.classList.add('noselect');
        }
    });

    var TimelineTitles = React.createClass({
        displayName: 'TimelineTitles',
        mixins: [
            React.addons.PureRenderMixin,
            PxDateMixin
        ],
        propTypes: {
            events: t.array.isRequired,
            titleSize: t.number.isRequired,
            start: t.number.isRequired,
            end: t.number.isRequired
        },
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
                            key: event.date + event.title,
                            className: 'event-title',
                            style: {
                                top: this.getPxForDate(event.date) - this.props.titleSize,
                                borderBottomWidth: Timeline.getLineHeightByImportance(event.importance),
                                borderColor: Timeline.getEventColorByImportance(event.importance),
                                opacity: Timeline.getLineOpacityByImportance(event.importance)
                            }
                        },
                        h('div', {
                                className: 'event-title-text'
                            },
                            h('div', {
                                className: 'event-title-date'
                            }, moment.unix(event.date).format('ll')),
                            ' ' + event.title
                        )
                    );
                }.bind(this))
                .valueOf();
            return h('div', {
                className: 'timeline-titles-statics',
                onWheel: this.onWheel,
                onMouseDown: this.onMouseDown
            }, titles);
        },
        onWheel: function (e) {
            var delta = (this.props.end - this.props.start) / 10;
            this.props.onBoundsChange(this.props.start + (e.deltaY > 0 ? delta : -delta), this.props.end + (e.deltaY > 0 ? delta : -delta));
        },
        onMouseDown: function (e) {
            var startPos = e.clientY;
            var MIN_MOVE = 10;

            var move = function (e) {
                var newPos = e.clientY;
                if (Math.abs(startPos - newPos) > MIN_MOVE) {
                    var deltaPx = startPos - newPos;
                    var heightPx = this.getDOMNode().offsetHeight;
                    var delta = deltaPx / heightPx * (this.props.end - this.props.start);
                    this.props.onBoundsChange(this.props.start + delta, this.props.end + delta);
                    startPos = newPos;
                }
            }.bind(this);

            var end = function (e) {
                document.body.removeEventListener('mouseup', end);
                document.body.removeEventListener('mousemove', move);
                document.body.classList.remove('noselect');
            };

            document.body.addEventListener('mouseup', end);
            document.body.addEventListener('mousemove', move);
            document.body.classList.add('noselect');
        }
    });

    var TimelineOver = React.createClass({
        displayName: 'TimelineOver',
        mixins: [
            React.addons.PureRenderMixin,
            PxDateMixin
        ],
        propTypes: {
            event: t.object.isRequired,
            titleSize: t.number.isRequired,
            start: t.number.isRequired,
            end: t.number.isRequired
        },
        render: function () {
            if (!this.isMounted()) {
                setTimeout(this.forceUpdate.bind(this), 0);
                return h('div', {
                    className: 'event-over-container'
                });
            }
            var event = this.props.event;
            var titleOver = h('div', {
                    className: 'event-title event-over',
                    style: {
                        top: this.getPxForDate(event.date) - this.props.titleSize,
                        borderBottomWidth: Timeline.getLineHeightByImportance(event.importance),
                        borderColor: Timeline.getEventColorByImportance(event.importance)
                    }
                },
                h('div', {
                        className: 'event-title-text'
                    },
                    h('div', {
                        className: 'event-title-date'
                    }, moment.unix(event.date).format('ll')),
                    ' ' + event.title
                )
            );

            return h('div', {
                    className: 'event-over-container'
                },
                titleOver
            );
        }
    });

    var TimelineScrollHandler = React.createClass({
        displayName: 'TimelineScrollHandler',
        mixins: [
            React.addons.PureRenderMixin,
            PxDateMixin
        ],
        propTypes: {
            startScroll: t.number.isRequired,
            endScroll: t.number.isRequired,
            start: t.number.isRequired,
            end: t.number.isRequired
        },
        getInitialState: function () {
            return {
                isDragging: false
            };
        },
        render: function () {
            if (!this.isMounted()) {
                setTimeout(this.forceUpdate.bind(this), 0);
                return h('div', {
                    className: 'timeline-scroll-handler-container'
                });
            }
            return h('div', {
                    className: 'timeline-scroll-handler-container',
                    onWheel: this.onWheel
                },
                h('div', {
                    className: cx({
                        'timeline-scroll-handler': true,
                        'is-dragging': this.state.isDragging
                    }),
                    style: (function () {
                        var topPx = this.getPxForDate(this.props.startScroll);
                        var heightPx = this.getPxForDate(this.props.endScroll) - topPx;
                        return {
                            top: topPx,
                            height: heightPx
                        };
                    }.call(this)),
                    onMouseDown: this.onMouseDown
                })
            );
        },
        onWheel: function (e) {
            var delta = (this.props.endScroll - this.props.startScroll) / 2;
            this.props.onBoundsChange(this.props.startScroll + (e.deltaY > 0 ? delta : -delta), this.props.endScroll + (e.deltaY > 0 ? delta : -delta));
        },
        onMouseDown: function (e) {
            e.stopPropagation();
            var startPos = e.clientY;
            var MIN_MOVE = 3;
            this.setState({
                isDragging: true
            });

            var move = function (e) {
                var newPos = e.clientY;
                if (Math.abs(startPos - newPos) > MIN_MOVE) {
                    var deltaPx = startPos - newPos;
                    var heightPx = this.getDOMNode().offsetHeight;
                    var delta = deltaPx / heightPx * (this.props.end - this.props.start);
                    this.props.onBoundsChange(this.props.startScroll - delta, this.props.endScroll - delta);
                    startPos = newPos;
                }
            }.bind(this);

            var end = function (e) {
                this.setState({
                    isDragging: false
                });
                document.body.removeEventListener('mouseup', end);
                document.body.removeEventListener('mousemove', move);
                document.body.classList.remove('noselect');
            }.bind(this);

            document.body.addEventListener('mouseup', end);
            document.body.addEventListener('mousemove', move);
            document.body.classList.add('noselect');
        }
    });

    var TimelineScroll = React.createClass({
        displayName: 'TimelineScroll',
        mixins: [
            React.addons.PureRenderMixin,
            PxDateMixin
        ],
        propTypes: {
            startScroll: t.number.isRequired,
            endScroll: t.number.isRequired,
            start: t.number.isRequired,
            end: t.number.isRequired,
            onBoundsChange: t.func.isRequired
        },
        render: function () {
            return h('div', {
                    className: 'timeline-scroll',
                    onMouseDown: this.onMouseDown
                },
                h(TimelineScrollHandler, {
                    startScroll: this.props.startScroll,
                    endScroll: this.props.endScroll,
                    start: this.props.start,
                    end: this.props.end,
                    onBoundsChange: this.props.onBoundsChange
                })
            );
        },
        onMouseDown: function (e) {
            var down = true;
            var newPosPx = e.clientY;
            (function move(timeout) {
                function up() {
                    down = false;
                }
                if (!down) {
                    document.body.removeEventListener('mouseup', up);
                    return;
                }
                var newPos = this.getDateForPx(newPosPx);
                var delta = Math.abs(this.props.endScroll - this.props.startScroll);
                if (newPos < this.props.startScroll) {
                    if (this.props.startScroll - delta < this.props.start) {
                        delta = this.props.startScroll - this.props.start;
                    }
                    this.props.onBoundsChange(
                        this.props.startScroll - delta,
                        this.props.endScroll - delta);
                } else if (newPos > this.props.endScroll) {
                    if (this.props.endScroll + delta > this.props.end) {
                        delta = this.props.end - this.props.endScroll;
                    }
                    this.props.onBoundsChange(
                        this.props.startScroll + delta,
                        this.props.endScroll + delta);
                }
                document.body.addEventListener('mouseup', up);
                setTimeout(move.bind(this, timeout / 2), timeout);
            }.call(this, 300));
        }
    });

    var Timeline = React.createClass({
        displayName: 'Timeline',
        mixins: [React.addons.PureRenderMixin],
        propTypes: {
            onSelect: t.func.isRequired,
            events: t.array.isRequired
        },
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
            getLineOpacityByImportance: function (importance) {
                if (importance > 30) {
                    return 1;
                }
                return Math.ceil((importance / 30 * 0.7 + 0.3) * 100) / 100;
            },
            getEventsInRange: function (events, start, end) {
                var onlyEvents = _.filter(events, function (fact) {
                    if (fact.type === 'eventOnce') {
                        return start <= fact.date && fact.date <= end;
                    } else if (fact.type === 'eventLong') {
                        // todo
                    } else if (fact.type === 'eventApproximate') {
                        // todo
                    }
                });
                if (end - start > (moment([100]).unix() - moment([0]).unix())) {
                    return _.filter(onlyEvents, function (event) {
                        return event.importance > 80;
                    });
                }
                if (end - start > (moment([10]).unix() - moment([0]).unix())) {
                    return _.filter(onlyEvents, function (event) {
                        return event.importance > 50;
                    });
                }
                return onlyEvents;
            }
        },
        getDefaultProps: function () {
            return {
                titleSize: 40
            };
        },
        getInitialState: function () {
            var start = moment([1000]).unix();
            var end = moment([1100]).unix();
            return {
                start: start,
                end: end,
                eventsVisible: Timeline.getEventsInRange(
                    this.props.events, start, end)
            };
        },
        render: function () {
            return h('div', {
                    className: 'timeline'
                },
                h(TimelineScale, {
                    events: this.state.eventsVisible,
                    start: this.state.start,
                    end: this.state.end,
                    onHoverLine: this.onHoverLine,
                    onBoundsChange: this.onBoundsChange,
                    onSelect: this.props.onSelect
                }),
                h('div', {
                        className: 'timeline-titles'
                    },
                    h(TimelineTitles, {
                        events: this.state.eventsVisible,
                        titleSize: this.props.titleSize,
                        start: this.state.start,
                        end: this.state.end,
                        onBoundsChange: this.onBoundsChange
                    }),

                    !!this.state.over && h(TimelineOver, {
                        event: this.state.over,
                        start: this.state.start,
                        end: this.state.end,
                        titleSize: this.props.titleSize
                    })
                ),
                h(TimelineScroll, {
                    startScroll: this.state.start,
                    endScroll: this.state.end,
                    start: this.props.events[0].date,
                    end: this.props.events[this.props.events.length - 1].date,
                    onBoundsChange: this.onBoundsChange
                })
            );
        },
        onHoverLine: function (eventHovered) {
            this.setState({
                over: eventHovered
            });
        },
        onBoundsChange: function (start, end) {
            this.setState({
                start: start,
                end: end,
                eventsVisible: Timeline.getEventsInRange(
                    this.props.events, start, end)
            });
        }
    });
    return Timeline;
});
