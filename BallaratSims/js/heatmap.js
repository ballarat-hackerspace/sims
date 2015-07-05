
var points = [];

var map = null;
var heatmap = null;

var gridX = 15;
var gridY = 30;

var service_type = 'EDU';
var transport_type = 'WALK';

var gradient = [
    'rgba(0, 255, 255, 0)',
    'rgba(255, 0, 0, 1)'
];

var distances_travelled = {'WALK': 0.00833, "RIDE": 0.02583, "DRIVE": 0.06666};
$WALKDISTANCE = 833; //Average distance a person can walk in 10 minutes (m)
$RIDEDISTANCE = 2583; //Average distance a person can ride in 10 minutes (m)
$DRIVEDISTANCE = 6666; //Distance that can be driven in 10 minutes based on a 40km/h average speed (m)

var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(-37.5500, 143.8500)
    };
map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    

function heat_map(){
    console.log("Starting heatmap");
    var data = [];

    points.map( function(point) {
        //data.push({lat: point.lat(), lng: point.lng(), count:temp});
        data.push({lat: point.lat, lng: point.lon, count:point.heat});
    });

    var heatmap_data = {
        max: 200,
        data: data
    };

    heatmap.setData(heatmap_data);
}

function update_map(result){
    points = [];
    result.map(function(row){
        points.push(new google.maps.LatLng(row['lat'], row['lon']))
    });

    console.log("Setting size: " + distances_travelled[transport_type]);
    heatmap.configure({radius: distances_travelled[transport_type]});
    heat_map();
}


function initialize(result) {
    points = [];
    result.map(function(row){
        //points.push(new google.maps.LatLng(row['lat'], row['lon']))
        points.push({lat: row['lat'], lon: row['lon'], heat: row['heat']})
    });

    var bounds = map.getBounds();
    alert(bounds);
        google.maps.event.addListener(map, 'zoom_changed', update_city_heatmap);
    google.maps.event.addListener(map, 'drag_end', update_city_heatmap);
    
    $radius = (google.maps.geometry.spherical.computeDistanceBetween(bounds.getNorthEast(), bounds.getSouthWest()) / 4000000);
    console.log($radius);
    
    heatmap = new HeatmapOverlay(map,
        {
            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
            "radius": $radius,
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
            blur: .5,
            gradient: {
                // enter n keys between 0 and 1 here
                // for gradient color customization
                '0.0001': 'red',
                '0.5': 'orange',
                '0.99': 'green'
            }
        }
    );
    heatmap.setMap(map);
    heat_map();
    
    google.maps.event.addListener(map, 'idle', function() {
        heatmap.draw();
    });


}



function load_initial_points(){
/*
    var data_url = "http://planr.ballarathackerspace.org.au/sims/api/services/EDU";
    $.ajax(data_url, {
        success: initialize,
        dataType: "json"
    });
  */  
    
    var bounds = map.getBounds();
    var NE = bounds.getNorthEast();
    var SW = bounds.getSouthWest();
    var points_url = "http://planr.ballarathackerspace.org.au/sims/api/utils/getGrid/" + $("#transport_type").val() + "/" + NE.lat() + "," + NE.lng() + "," + SW.lat() + "," + SW.lng() + ","+gridX+","+gridY;
    
        $.ajax(points_url, {
        success: initialize,
        dataType: "json"
    });
}

google.maps.event.addDomListener(window, 'load', load_initial_points);
google.maps.event.addListener(map, 'zoom_changed', update_city_heatmap);
google.maps.event.addListener(map, 'drag_end', update_city_heatmap);
//google.maps.event.addListener(map, 'bounds_changed', update_city_heatmap);


function update_city_heatmap(){
    var mapOptions = {
        zoom: map.getZoom(),
        center: map.getCenter()
    };
    map = null;
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var bounds = map.getBounds();
    var NE = bounds.getNorthEast();
    var SW = bounds.getSouthWest();
    var points_url = "http://planr.ballarathackerspace.org.au/sims/api/utils/getGrid/" + $("#transport_type").val() + "/" + NE.lat() + "," + NE.lng() + "," + SW.lat() + "," + SW.lng() + ","+gridX+","+gridY;
    
        $.ajax(points_url, {
        success: initialize,
        dataType: "json"
    });
}