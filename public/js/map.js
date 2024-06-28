

mapboxgl.accessToken = map_Token;
  const map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: coordinates, // starting position [lng, lat]
      zoom: 9 // starting zoom
  });

  console.log(coordinates);
  

const marker=new mapboxgl.Marker({color: "red"})
  .setLngLat(coordinates)
  .setPopup(new mapboxgl.Popup({offset: 25,closeButton: false}).setHTML(`<div class="mapClass"> <h4>${title}</h4> <p>Exact Location provided after booking</p></div> `))
  .addTo(map);

  marker.getElement().addEventListener('mouseenter', () => {
    marker.togglePopup();
});

marker.getElement().addEventListener('mouseleave', () => {
    marker.togglePopup();
});
{/* <a href="https://www.freepik.com/icon/location-pin_8457281#fromView=search&page=1&position=16&uuid=2d056850-938f-4365-b4ab-71fb29db993f">Icon by Freepik</a> */}

//map toggle


	
    // Add GeoJSON source and layer
    function addAdditionalSourceAndLayer() {
        map.addSource('routeSource', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': 
                       coordinates
                    
                }
            }
        });
        map.addLayer({
            'id': 'routeLayer',
            'type': 'line',
            'source': 'routeSource',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#33bb6a',
                'line-width': 8
            }
        });
    }

    // Add source and layer whenever base style is loaded
    map.on('style.load', () => {
        addAdditionalSourceAndLayer();
    });

    const layerList = document.getElementById('menu');
    const inputs = layerList.getElementsByTagName('input');

    for (const input of inputs) {
        input.onclick = (layer) => {
            const layerId = layer.target.id;
            map.setStyle('mapbox://styles/mapbox/' + layerId);
        };
    }


//icon

