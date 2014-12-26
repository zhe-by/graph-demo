define(function (require) {
    'use strict';

    var mapId = 'map';

    function renderMap (elementId, objects) {
        L.mapbox.accessToken = 'pk.eyJ1IjoieWFoZW4iLCJhIjoiRHlMalFDcyJ9.2NT-F0P1hgNDr7804742nQ';
        L.mapbox.map(elementId, 'yahen.kigp3i1m');
    }

    return React.createClass({
        render: function () {
            return h('div', {
                id:mapId, 
                className: 'map'
            });
        },
        componentDidMount: function() {
            renderMap(mapId, this.props.objects);
        },
        shouldComponentUpdate: function(props) {
            renderMap(mapId, this.props.objects);   
            return false;
        }
    });    
});