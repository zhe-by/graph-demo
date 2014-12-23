define(function (require) {
    'use strict';
    var App = require('app/App');
    React.render(
        h(App),
        document.getElementById('application')
    );
});
