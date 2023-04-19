// map.js

// You can remove the following line if you don't need support for RTL (right-to-left) labels:
mapboxgl.setRTLTextPlugin('https://cdn.maptiler.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.1.2/mapbox-gl-rtl-text.js');

var map = new mapboxgl.Map({
    container: 'map',
    style: 'https://api.maptiler.com/maps/' + maptiler_map.tileset_id + '/style.json?key=' + maptiler_map.access_token,
    center: [-118.2437, 34.0522],
    zoom: 10
});

var stations = null;
var trains = null;

function addStationsToMap() {
    // Create LineString features for blue and green lines
    let blueLineFeature = {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: stations.filter(function(station) {
                return station.line === 'Blue';
            }).map(function(station) {
                return [station.longitude, station.latitude];
            })
        },
        properties: {
            color: 'blue'
        }
    };

    let greenLineFeature = {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: stations.filter(function(station) {
                return station.line === 'Green';
            }).map(function(station) {
                return [station.longitude, station.latitude];
            })
        },
        properties: {
            color: 'green'
        }
    };

    map.addSource('stations', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            // Add the line features along with the point features
            features: stations.map(function(station) {
                return {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [station.longitude, station.latitude]
                    },
                    properties: {
                        name: station.name,
                        line: station.line,
                        color: station.line === 'Blue' ? 'blue' : 'green'
                    }
                }
            }).concat(blueLineFeature, greenLineFeature)
        }
    });

    // Add blue line stations
    map.addLayer({
        id: 'Blue-line-stations',
        type: 'circle',
        source: 'stations',
        filter: ['==', ['get', 'line'], 'Blue'],
        paint: {
            'circle-color': 'blue',
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': 'white'
        }
    });

    map.addLayer({
        id: 'Blue-line',
        type: 'line',
        source: 'stations',
        // Filter by the LineString feature
        filter: ['==', ['get', 'color'], 'blue'],
        paint: {
            'line-color': 'blue',
            'line-width': 5
        }
    });

    map.addLayer({
        id: 'Blue-line-station-labels',
        type: 'symbol',
        source: 'stations',
        filter: ['==', ['get', 'line'], 'Blue'],
        layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Open Sans Bold'],
            'text-size': 14,
            'text-offset': [3, 0],
            'text-anchor': 'top'
        }
    });

    // Add green line stations
    map.addLayer({
        id: 'Green-line-stations',
        type: 'circle',
        source: 'stations',
        filter: ['==', ['get', 'line'], 'Green'],
        paint: {
            'circle-color': 'green',
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': 'white'
        }
    });

    map.addLayer({
        id: 'Green-line',
        type: 'line',
        source: 'stations',
        // Filter by the LineString feature
        filter: ['==', ['get', 'color'], 'green'],
        paint: {
            'line-color': 'green',
            'line-width': 5
        }
    });

    map.addLayer({
        id: 'Green-line-station-labels',
        type: 'symbol',
        source: 'stations',
        filter: ['==', ['get', 'line'], 'Green'],
        layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Open Sans Bold'],
            'text-size': 14,
            'text-offset': [3, 0],
            'text-anchor': 'top'
        }
    });
}


function addTrainsToMap() {
    setInterval(function() {
        fetch("/train_locations").then(function(response) {
            return response.json();
        }).then(function(data) {
            trains = data.items;

            // Remove old train markers
            var oldMarkers = document.getElementsByClassName("train-marker");
            for (var i = oldMarkers.length-1; i >= 0; i--) {
                oldMarkers[i].parentNode.removeChild(oldMarkers[i]);
            }

            // Add new train markers
            for (var i = 0; i < trains.length; i++) {
                var train = trains[i];
                var el = document.createElement('div');
                el.className = 'train-marker';
                el.style.backgroundImage = 'url(static/metro_logo.png)';
                el.style.width = '25px';
                el.style.height = '25px';
                new mapboxgl.Marker(el)
                    .setLngLat([train.longitude, train.latitude])
                    .addTo(map);
            }
        });
    }, 5000);
}

function refreshMapData() {
    // Remove old stations and trains data
    if (map.getSource('stations')) {
        map.removeSource('stations');
    }
    stations = null;
    trains = null;

    // Fetch new stations and trains data
    fetch("/stations")
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            stations = data.items;
            addStationsToMap();
        });

    fetch("/train_locations")
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            trains = data.items;
            addTrainsToMap();
        });
}

map.on('load', function() {
    // call refreshMapData() function here
    refreshMapData(); // call the function to populate the map with data initially and refresh data every 5 seconds.
});