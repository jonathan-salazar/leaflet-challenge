earthquakesUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
platesUrl = "static/data/PB2002_boundaries.json"

function getColor(mag) {
    if (mag >= 5) {
        return "rgb(240, 107, 107)" 
    } else {
        if (mag > 4) {
            return "rgb(240, 167, 107)"
        } else {
            if (mag > 3) {
                return "rgb(243, 186, 77)"
            } else {
                if (mag > 2) {
                    return "rgb(243, 219, 77)"
                } else {
                    if (mag > 1) {
                        return "rgb(226, 243, 77)"
                    } else {
                        return "rgb(183, 243, 77)"
                    }
                }
            }
        }
    }
};

function createFeatures(earthquakeData, platesData) {
    function onEachFeature(feature, layer) {
        layer.bindPopup("<p>" + feature.properties.title + "</p>" +
            "<p>Type: " + feature.properties.type + "</p>" +
            "<p>Magnitude: " + feature.properties.mag + "</p>");
    }
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return new L.CircleMarker(latlng, {
                radius: feature.properties.mag * 5,
                fillOpacity: 1,
                color: getColor(feature.properties.mag)
            })
        },
        onEachFeature: onEachFeature
    });
    var plates = L.geoJSON(platesData, {
        style: function() {
            return {
                color: "orange",
                weight: 1.5
            }
        }
    });
    createMap(earthquakes, plates);
};

function createMap(earthquakes, plates) {
    var light = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/light-v10",
      accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-streets-v11",
        accessToken: API_KEY
    });

    var baseMaps = {
        Light: light,
        Outdoors: outdoors,
        Satellite: satellite
    };

    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Fault Lines": plates
    }

    var myMap = L.map("map", {
        center: [29.876019, -107.224121],
        zoom: 4.5,
        layers: [satellite, earthquakes, plates]
    });

    var legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var colors = [
            "rgb(183, 243, 77)",
            "rgb(226, 243, 77)",
            "rgb(243, 219, 77)",
            "rgb(243, 186, 77)",
            "rgb(240, 167, 107)",
            "rgb(240, 107, 107)"];
        var labels = [];

        var legendInfo = "<h1>Earthquake intensity<h1>" + 
            "<div class=\"labels\">" +
                "<div class=\"max\">5+</div>" +
                "<div class=\"fourth\">4-5</div>" +
                "<div class=\"third\">3-4</div>" +
                "<div class=\"second\">2-3</div>" +
                "<div class=\"first\">1-2</div>" +
                "<div class=\"min\">0-1</div>"
            "</div>";

        div.innerHTML = legendInfo;

        colors.forEach(function(color) {
            labels.push("<li style=\"background-color: " + color + "\"></li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    legend.addTo(myMap);
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);
};


d3.json(earthquakesUrl, function(earthquakeData) {

    d3.json(platesUrl, function(platesData) {

        createFeatures(earthquakeData.features, platesData.features)
    });
});