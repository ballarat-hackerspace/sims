
var points = [];
points.push(new google.maps.LatLng(-37.5500, 143.8500));
points.push(new google.maps.LatLng(-37.5400, 143.8500));
points.push(new google.maps.LatLng(-37.5600, 143.8000));

var map = null;
var heatmap = null;

function plot_points(){
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

function heat_map(){
    var pointArray = new google.maps.MVCArray(points);

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: points
    });
    var gradient = [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 0, 191, 1)',
        'rgba(255, 0, 0, 1)'
    ]
    heatmap.setMap(map);
    heatmap.set('gradient', gradient);
    heatmap.set('radius', getNewRadius(1000));
}


function initialize() {
    var mapOptions = {
        zoom: 10,
        center: points[0]
    }
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    plot_points();
    heat_map();

    google.maps.event.addListener(map, 'zoom_changed', function () {
        heatmap.setOptions({radius:getNewRadius(1000)});
    });
}

var TILE_SIZE = 256;

// Conversion from meters to pixels from: view-source:http://output.jsbin.com/rorecuce/1/
//Mercator --BEGIN--
function bound(value, opt_min, opt_max) {
    if (opt_min !== null) value = Math.max(value, opt_min);
    if (opt_max !== null) value = Math.min(value, opt_max);
    return value;
}

function degreesToRadians(deg) {
    return deg * (Math.PI / 180);
}

function radiansToDegrees(rad) {
    return rad / (Math.PI / 180);
}

function MercatorProjection() {
    this.pixelOrigin_ = new google.maps.Point(TILE_SIZE / 2,
        TILE_SIZE / 2);
    this.pixelsPerLonDegree_ = TILE_SIZE / 360;
    this.pixelsPerLonRadian_ = TILE_SIZE / (2 * Math.PI);
}

MercatorProjection.prototype.fromLatLngToPoint = function (latLng,
                                                           opt_point) {
    var me = this;
    var point = opt_point || new google.maps.Point(0, 0);
    var origin = me.pixelOrigin_;

    point.x = origin.x + latLng.lng() * me.pixelsPerLonDegree_;

    // NOTE(appleton): Truncating to 0.9999 effectively limits latitude to
    // 89.189.  This is about a third of a tile past the edge of the world
    // tile.
    var siny = bound(Math.sin(degreesToRadians(latLng.lat())), - 0.9999,
        0.9999);
    point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -me.pixelsPerLonRadian_;
    return point;
};

MercatorProjection.prototype.fromPointToLatLng = function (point) {
    var me = this;
    var origin = me.pixelOrigin_;
    var lng = (point.x - origin.x) / me.pixelsPerLonDegree_;
    var latRadians = (point.y - origin.y) / -me.pixelsPerLonRadian_;
    var lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);
    return new google.maps.LatLng(lat, lng);
};

//Mercator --END--

function getNewRadius(desiredRadiusPerPointInMeters) {
    var numTiles = 1 << map.getZoom();
    var center = map.getCenter();
    var moved = google.maps.geometry.spherical.computeOffset(center, 10000, 90); /*1000 meters to the right*/
    var projection = new MercatorProjection();
    var initCoord = projection.fromLatLngToPoint(center);
    var endCoord = projection.fromLatLngToPoint(moved);
    var initPoint = new google.maps.Point(
        initCoord.x * numTiles,
        initCoord.y * numTiles);
    var endPoint = new google.maps.Point(
        endCoord.x * numTiles,
        endCoord.y * numTiles);
    var pixelsPerMeter = (Math.abs(initPoint.x-endPoint.x))/10000.0;
    var totalPixelSize = Math.floor(desiredRadiusPerPointInMeters*pixelsPerMeter);
    console.log(totalPixelSize);
    return totalPixelSize;

}


google.maps.event.addDomListener(window, 'load', initialize);


