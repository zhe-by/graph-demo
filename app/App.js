zhe.App = React.createClass({
    render: function () {
        return h('div', {
                className: 'container'
            },
            h('div', {
                    className: 'column column-first'
                },
                h(zhe.Timeline, {
                    onSelect: function () {
                        // todo filter by event
                    },
                    events: zhe.graph.getEvents()
                })
            ),
            h('div', {
                    className: 'column column-second'
                },
                h('div', {
                        className: 'row row-map'
                    },
                    h(zhe.Map)
                ),
                h('div', {
                        className: 'row row-persons'
                    },
                    h(zhe.Persons)
                )
            ),
            h('div', {
                    className: 'column column-third'
                },
                h('div', {
                        className: 'row row-cloud'
                    },
                    h(zhe.Cloud)
                ),
                h('div', {
                        className: 'row row-wiki'
                    },
                    h(zhe.Wiki)
                )
            )
        );
    }
});
