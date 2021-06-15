// TODO hier müssen die Koordinaten aus Wikipedia hin (Reihenfolge der Koordinaten beachten; hier: Longitude -> Latitude)


//get user Postion, Wiki-article Positions, then call methods to build UI
function Initialize() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            let marker = [[longitude, latitude]];
            //TODO get n wikipedia articles which are cloesest
            getWikipedia(100, marker);
        });
    } else {
        console.log("geolocation is not supported");
    }
}

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

function getWikipedia(n, marker) {
    var url = "https://en.wikipedia.org/w/api.php";

    var params = {
        action: "query",
        list: "geosearch",
        gscoord: "37.7891838|-122.4033522",
        gsradius: "10000",
        gslimit: n.toString(),
        prop: "coordinates",
        format: "json"
    };

    url = url + "?origin=*";
    Object.keys(params).forEach(function (key) { url += "&" + key + "=" + params[key]; });

    fetch(url)
        .then(function (response) { return response.json(); })
        .then(function (response) {
            var pages = response.query.geosearch;
            for (var page in pages) {
                marker.push([pages[page].lon, pages[page].lat])
            }
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
        })
        .catch(function (error) { console.log(error); });
}

Initialize();



