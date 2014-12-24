define(function (require) {
    'use strict';
    React.initializeTouchEvents(true);

    var App = require('app/App');
    React.render(
        h(App),
        document.getElementById('application')
    );
});
