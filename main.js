(function () {
    var h = React.createElement;

    var Timeline = React.createClass({
        render: function () {
            return h('div', null, 'Timeline');
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
