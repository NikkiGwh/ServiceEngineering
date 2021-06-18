const MAPBOX_KEY =
  "pk.eyJ1Ijoic2VydmljZS1lbmdpbmVlcmluZzIxIiwiYSI6ImNrcHFvNTU5OTAwYzUycHBtd2liNGZ2enYifQ.uBbDX5hrbEbEGGMvabAPMw";

//get user Postion, Wiki-article Positions, then call methods to build UI
function Initialize() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      let marker = [[longitude, latitude]];
      //TODO get n wikipedia articles which are cloesest
      getWikipedia(10, marker);
      updateAddress(longitude, latitude);
    });
  } else {
    console.log("geolocation is not supported");
  }
}

function getMinMaxOf2dArray(arr, idx) {
  return {
    min: Math.min.apply(
      null,
      arr.map(function (e) {
        return e[idx];
      })
    ),
    max: Math.max.apply(
      null,
      arr.map(function (e) {
        return e[idx];
      })
    ),
  };
}

function getWikipedia(n, marker) {
  var url = "https://en.wikipedia.org/w/api.php";
  var params = {
    action: "query",
    generator: "geosearch",
    inprop: "url",
    ggscoord: marker[0][1] + "|" + marker[0][0],
    ggsradius: "10000",
    ggslimit: n.toString(),
    prop: "coordinates|title|info",
    format: "json",
  };

  url = url + "?origin=*";
  Object.keys(params).forEach(function (key) {
    url += "&" + key + "=" + params[key];
  });

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      var pages = response.query.pages;
      for (var page in pages) {
        marker.push([
          pages[page].coordinates[0].lon,
          pages[page].coordinates[0].lat,
          pages[page].title,
          pages[page].fullurl,
        ]);
      }
      // Berechne Bounding Box, um das anzuzeigende Fenster einzustellen
      console.log(marker);
      var longBounds = getMinMaxOf2dArray(marker, 0);
      var latBounds = getMinMaxOf2dArray(marker, 1);
      var bbox = [
        [longBounds.min, latBounds.min],
        [longBounds.max, latBounds.max],
      ];

      // Initialisiere die Karte
      mapboxgl.accessToken = MAPBOX_KEY;
      var map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        bounds: bbox,
        fitBoundsOptions: {
          padding: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          },
        },
      });
      // Img-Tag für Marker der eigenen Position
      const img = document.createElement("img");
      img.src =
        "https://upload.wikimedia.org/wikipedia/commons/2/2f/Map-circle-blue.svg";
      img.style.height = "30px";
      // Marker der eigenen Position erzeugen
      new mapboxgl.Marker({
        element: img,
      })
        .setLngLat(marker.shift().slice(0, 2))
        //.setPopup(new mapboxgl.Popup().setHTML("<div id=\"address-container\"></div>"))
        .setPopup(new mapboxgl.Popup().setHTML("<p>Eigene Position</p>"))
        .addTo(map);

      // Markierungen für Wikipedia-Artikel
      marker.forEach((coordinates) => {
        new mapboxgl.Marker()
          .setLngLat(coordinates.slice(0, 2))
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<a target="_blank" href="${coordinates[3]}">${coordinates[2]}</a>`
            )
          )
          .addTo(map);
      });
    })
    .catch(function (error) {
      console.log(error);
    });
}

function updateAddress(longitude, latitude) {
  var url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?`
  );
  var params = {
    access_token: MAPBOX_KEY,
    language: "DE",
    limit: 1,
    types: "address",
  };
  url.search = new URLSearchParams(params);
  fetch(url.toString())
    .then((response) => response.json())
    .then((data) => {
      let address_full = data.features[0].place_name;
      let address = address_full.substr(0, address_full.lastIndexOf(","));
      document.getElementById("address-container").textContent = address;
    });
}

Initialize();
