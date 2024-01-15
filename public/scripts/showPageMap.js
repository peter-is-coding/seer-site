mapboxgl.accessToken = mapToken;
const point = coords.split(",");
const map = new mapboxgl.Map({
    container: "map", // container ID
    center: point, // starting position [lng, lat] // ,
    zoom: 12, // starting zoom
});

const marker = new mapboxgl.Marker()
    .setLngLat(point)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<span class="text-muted">${landmarkname}</span>`
        )
    )
    .addTo(map);
