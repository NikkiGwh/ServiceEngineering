const MAPBOX_KEY = 'pk.eyJ1Ijoic2VydmljZS1lbmdpbmVlcmluZzIxIiwiYSI6ImNrcHFvNTU5OTAwYzUycHBtd2liNGZ2enYifQ.uBbDX5hrbEbEGGMvabAPMw';


//get user Postion, Wiki-article Positions, then call methods to build UI
function Initialize() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            let marker = [[longitude, latitude]];
            //TODO get n wikipedia articles which are cloesest
            getWikipedia(4, marker);
            updateAddress(longitude, latitude);
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
        gscoord: marker[0][1] + "|" + marker[0][0],
        gsradius: "10000",
        gslimit: n.toString(),
        prop: "coordinates|title",
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
            console.log(marker);
            var longBounds = getMinMaxOf2dArray(marker, 0);
            var latBounds = getMinMaxOf2dArray(marker, 1);
            var bbox = [
                [longBounds.min, latBounds.min],
                [longBounds.max, latBounds.max]
            ];

            // Initialisiere die Karte
            mapboxgl.accessToken = MAPBOX_KEY;
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

function updateAddress(longitude, latitude) {
    var url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?`);
    var params = {
        access_token: MAPBOX_KEY,
        language: "DE",
        limit: 1,
        types: "address",
    };
    url.search = new URLSearchParams(params);
    fetch(url.toString())
        .then(response => response.json())
        .then(data => {
            let address_full = data.features[0].place_name;
            let address = address_full.substr(0, address_full.lastIndexOf(','));
            document.getElementById('address-container').textContent = address;
        });
}

Initialize();



