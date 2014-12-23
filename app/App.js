define(function (require) {
    'use strict';
    var Timeline = require('app/Timeline');
    var graph = require('app/graph');
    var Persons = require('app/Persons');
    var Map = require('app/Map');
    var Cloud = require('app/Cloud');
    var Wiki = require('app/Wiki');

    return React.createClass({
        render: function () {
            return h('div', {
                    className: 'container'
                },
                h('div', {
                        className: 'column column-first'
                    },
                    h(Timeline, {
                        onSelect: function () {
                            // todo filter by event
                        },
                        events: graph.getEvents()
                    })
                ),
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

});
