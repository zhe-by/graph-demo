(function () {
    var h = React.createElement;
    var Timeline = React.createClass({
        render: function () {
            return h('div', null, 'Timeline');
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
                    }, 'Map'),
                    h('div', {
                        className: 'row row-persons'
                    }, 'Persons')
                ),
                h('div', {
                        className: 'column column-third'
                    },
                    h('div', {
                        className: 'row row-cloud'
                    }, 'Cloud'),
                    h('div', {
                        className: 'row row-wiki'
                    }, 'Wiki')
                )
            );
        }
    });
    React.render(h(App), document.getElementById('application'));
}());
