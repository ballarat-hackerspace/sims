
var points = [];
//points.push(new google.maps.LatLng(-37.5500, 143.8500));
//points.push(new google.maps.LatLng(-37.5400, 143.8500));
//points.push(new google.maps.LatLng(-37.5600, 143.8000));

var map = null;
var heatmap = null;

var point_marker = null;
var new_service_point = null;

var service_type = 'EDU';
var transport_type = 'WALK';

var gradient = [
    'rgba(0, 255, 255, 0)',
    'rgba(255, 0, 0, 1)'
];

var distances_travelled = {'WALK': 0.00833, "RIDE": 0.02583, "DRIVE": 0.06666};

var circle_colours = {'WALK': "#A3D995", "RIDE": "#FFDAAF", "DRIVE": "#A578AD"};

var transport_mode = {"WALK": "walking", "RIDE": "riding", "DRIVE": "driving"};

var human_readable = {"EDU": "Education", "BUS": "Busses", "PLAYGROUND": "Playground",
                      "HOSPITAL": "Hospitals", "TOILET": "Public Toilets",
                      "SHOP": "Shops", "KINDER":"Kindergarten"};

function plot_points(map){
    points.map( function(point) {
        // Draw marker
        var marker = new google.maps.Marker({
            position: point,
            map: map,
            title: 'Hello World!'
        });
        // Draw circle around it
        var greenCircleOptions = {
            strokeColor: '#111100',
            strokeOpacity: 0.5,
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
    console.log("Starting heatmap");
    var data = [];
    points.map( function(point) {
        data.push({lat: point.lat(), lng: point.lng(), count:5});
    });

    if (new_service_point != null){
        data.push({lat: new_service_point.lat(), lng: new_service_point.lng(), count:5});
    }

    var heatmap_data = {
        max: 100,
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
        points.push(new google.maps.LatLng(row['lat'], row['lon']))
    });
    var mapOptions = {
        zoom: 11,
        center: new google.maps.LatLng(-37.5500, 143.8500)
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    heatmap = new HeatmapOverlay(map,
        {
            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
            "radius": distances_travelled[transport_type],
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
                '.9': circle_colours[transport_type],
                '.99': circle_colours[transport_type]
            }
        }
    );
    //plot_points(map);
    heat_map();
    google.maps.event.addListener(map, 'idle', function() {
        heatmap.draw();
    });

    if (map_type == "services") {
        google.maps.event.addListener(map, 'click', add_popup_onclick);
    }else{
        google.maps.event.addListener(map, 'click', add_new_service);
    }

}



function load_initial_points(){
    var data_url = "http://planr.ballarathackerspace.org.au/sims/api/services/EDU";
    $.ajax(data_url, {
        success: initialize,
        dataType: "json"
    });
}

google.maps.event.addDomListener(window, 'load', load_initial_points);


function update_city_heatmap(){
    // 1 get service type
    service_type = $("#service_type").val();
    // 2 service type
    transport_type = $("#transport_type").val();
    var data_url = "http://planr.ballarathackerspace.org.au/sims/api/services/" + service_type;
    $.ajax(data_url, {
        success: initialize,
        dataType: 'json'
    })
}


function add_popup_onclick( event ) {
    var lat = event.latLng.lat();
    var lon = event.latLng.lng();
    var data_url = "http://planr.ballarathackerspace.org.au/sims/api/services/within10/" + transport_mode[transport_type] +
                   "/" + lat + "," + lon;
    console.log("Getting point data from " + data_url);
    $.ajax(data_url, {
        success: function(result){
            if (point_marker != null){
                point_marker.setMap(null);
            }
            point_marker = new google.maps.Marker({
                position: event.latLng,
                map: map
            }); //end marker
            console.log(result);
            var result_list = "<h4>Services within 10 minutes</h4><ul style=\"text-align:left\">";
            for (var i=0; i<result.length; i++){
                result_list += "<li>" + human_readable[result[i]['category']] + "</li>";
            }
            result_list += "</ul>";
            var infowindow = new google.maps.InfoWindow({content: "<div class='map_bg_logo'>" + result_list + "</div>"});
            //alert( "Latitude: "+event.latLng.lat()+" "+", longitude: "+event.latLng.lng() );
            infowindow.open(map, point_marker);
        },
        dataType: 'json'
    });
}

function add_new_service(event){
    if (point_marker != null){
        point_marker.setMap(null);
    }
    new_service_point = event.latLng;
    point_marker = new google.maps.Marker({
        position: event.latLng,
        map: map
    });
    heat_map();
}