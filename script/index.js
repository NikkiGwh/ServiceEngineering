// TODO hier müssen die Koordinaten aus Wikipedia hin (Reihenfolge der Koordinaten beachten; hier: Longitude -> Latitude)
let marker = [
    [11.5983084, 52.1224085],
    [11.622055, 52.131479]
];

// Berechne Bounding Box, um das anzuzeigende Fenster einzustellen
var longBounds = getMinMaxOf2dArray(marker, 0);
var latBounds = getMinMaxOf2dArray(marker, 1);
var bbox = [
    [longBounds.min, latBounds.min],
    [longBounds.max, latBounds.max]
];

// Initialisiere die Karte
mapboxgl.accessToken =
    'pk.eyJ1Ijoic2VydmljZS1lbmdpbmVlcmluZzIxIiwiYSI6ImNrcHFvNTU5OTAwYzUycHBtd2liNGZ2enYifQ.uBbDX5hrbEbEGGMvabAPMw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    bounds: bbox,
    fitBoundsOptions: {
        padding: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
        }
    }
});


// Setze die Markierungen
marker.forEach(coordinates => {
    new mapboxgl.Marker()
        .setLngLat(coordinates)
        .addTo(map);
});


function getMinMaxOf2dArray(arr, idx) {
    return {
        min: Math.min.apply(null, arr.map(function (e) {
            return e[idx]
        })),
        max: Math.max.apply(null, arr.map(function (e) {
            return e[idx]
        }))
    }
}