(function () {
    'use strict';
    var PxDateMixin = {
        getPxForDate: function (date) {
            return (function (sizePx, start, end, date) {
                return Math.ceil((date - start) / (end - start) * sizePx);
            }(this.getDOMNode().offsetHeight,
                this.props.start,
                this.props.end,
                date));
        },
        getDateForPx: function (px) {
            return (function (sizePx, start, end, px) {
                return (px / sizePx) * (end - start) + start;
            }(this.getDOMNode().offsetHeight,
                this.props.start,
                this.props.end,
                px));
        }
    };

    var TimelineScale = React.createClass({
        displayName: 'TimelineScale',
        mixins: [
            React.addons.PureRenderMixin,
            PxDateMixin
        ],
        render: function () {
            if (!this.isMounted()) {
                setTimeout(this.forceUpdate.bind(this), 0);
                return h('div', {
                    className: 'timeline-scale'
                });
            }

            var lines = _(this.props.events)
                .sortBy('importance')
                .map(function (event) {
                    if (event.type === 'eventOnce') {
                        return h('div', {
                            key: event.date + event.title,
                            className: 'event event-once-line',
                            style: {
                                height: zhe.Timeline.getLineHeightByImportance(event.importance),
                                top: this.getPxForDate(event.date),
                                backgroundColor: zhe.Timeline.getEventColorByImportance(event.importance),
                                opacity: zhe.Timeline.getLineOpacityByImportance(event.importance)
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
                h('div', null, lines),
                h(TimelineRangeSelect, {
                    onZoom: this.props.onZoom,
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

            this.props.onZoom(start, end);
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
                    this.props.onZoom(this.state.newStart, this.state.newEnd);
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
                            borderBottomWidth: zhe.Timeline.getLineHeightByImportance(event.importance),
                            borderColor: zhe.Timeline.getEventColorByImportance(event.importance),
                            opacity: zhe.Timeline.getLineOpacityByImportance(event.importance)
                        }
                    }, event.title);
                }.bind(this))
                .valueOf();
            return h('div', {
                className: 'timeline-titles-statics',
                onWheel: this.onWheel
            }, titles);
        },
        onWheel: function (e) {
            var delta = (this.props.end - this.props.start) / 10;
            this.props.onZoom(this.props.start + (e.deltaY > 0 ? delta : -delta), this.props.end + (e.deltaY > 0 ? delta : -delta));
        }
    });

    var TimelineOver = React.createClass({
        displayName: 'TimelineOver',
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
        displayName: 'Timeline',
        mixins: [React.addons.PureRenderMixin],
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
                        end: this.state.end,
                        onZoom: this.onZoom
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
