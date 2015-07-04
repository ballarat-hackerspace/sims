
var points = [];
points.push(new google.maps.LatLng(-37.5500, 143.8500));
points.push(new google.maps.LatLng(-37.5400, 143.8500));
points.push(new google.maps.LatLng(-37.5600, 143.8000));

var map = null;
var heatmap = null;

var gradient = [
    'rgba(0, 255, 255, 0)',
    'rgba(255, 0, 0, 1)'
]


function plot_points(map){
    points.map( function(point) {
        // Draw marker
        console.log(point);
        var marker = new google.maps.Marker({
            position: point,
            map: map,
            title: 'Hello World!'
        });
        // Draw circle around it
        var greenCircleOptions = {
            strokeColor: '#111100',
            strokeOpacity: 0.4,
            strokeWeight: 2,
            fillColor: '#005522',
            fillOpacity: 0.35,
            map: map,
            center: point,
            radius: 1000  // In meters
        };
        // Add the circle for this city to the map.
        //cityCircle = new google.maps.Circle(greenCircleOptions);
    });
}

function heat_map(map){
    console.log("Starting heatmap");
    heatmap = new HeatmapOverlay(map,
        {
            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
            "radius": 0.01,
            "maxOpacity": 0.8,
            // scales the radius based on map zoom
            "scaleRadius": true,
            // if set to false the heatmap uses the global maximum for colorization
            // if activated: uses the data maximum within the current map boundaries
            //   (there will always be a red spot with useLocalExtremas true)
            "useLocalExtrema": true,
            // which field name in your data represents the latitude - default "lat"
            latField: 'lat',
            // which field name in your data represents the longitude - default "lng"
            lngField: 'lng',
            // which field name in your data represents the data value - default "value"
            valueField: 'count',
            blur: .1,
            gradient: {
                // enter n keys between 0 and 1 here
                // for gradient color customization
                '.9': 'green',
                '.99': 'green'
            }
        }
    );

    var data = [];
    points.map( function(point) {
        data.push({lat: point.lat(), lng: point.lng(), count:5});
        console.log(data);
    });

    var heatmap_data = {
        max: 8,
        data: data
    };

    heatmap.setData(heatmap_data);
}

function initialize() {
    var mapOptions = {
        zoom: 10,
        center: points[0]
    }
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    plot_points(map);
    heat_map(map);
}

google.maps.event.addDomListener(window, 'load', initialize);


