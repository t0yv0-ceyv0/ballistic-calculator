let mapElements = {};
let map;
let mapWidthMeters;
let mapHeightMeters;
let currentMenu = null;

function updateZoomLimits(minZoom, maxZoom) {
    if (map) {
        map.setMinZoom(minZoom);
        map.setMaxZoom(maxZoom);
    }
}

function setMapWidth(newWidth) {
    mapWidthMeters = newWidth;
}

function setMapHeight(newHeight) {
    mapHeightMeters = newHeight;
}

function setMapImgURL(event) {
    const newImg = event.target.files[0];
    if (newImg && newImg.type === 'image/png') {
        const reader = new FileReader();

        reader.onload = function(e) {
           const imageURL = e.target.result;
           initializeMap(imageURL);
        };

        reader.readAsDataURL(newImg);
    } else {
        console.error("Будь ласка, виберіть файл PNG.");
    }
}

function initializeMap(imageURL) {
    if (map) {
        map.remove();
        mapElements = {};
        clearNotes();
    }

    const img = new Image();
    img.src = imageURL;

    img.onload = () => {
        initializeMapAndOverlay(imageURL, img);
    };
}

function initializeMapAndOverlay(imageURL, img) {
    const imageWidth = img.width;
    const imageHeight = img.height;

    setMetersPerPixel(mapWidthMeters, mapHeightMeters, imageWidth, imageHeight);

    const bounds = [[0, 0], [imageHeight, imageWidth]];
    const buffer = 250;
    const extendedBounds = [[-buffer, -buffer], [imageHeight + buffer, imageWidth + buffer]];

    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -3.5,
        maxZoom: 2,
    });

    L.imageOverlay(imageURL, bounds).addTo(map);

    map.setMaxBounds(extendedBounds);
    map.fitBounds(bounds);

    map.on('contextmenu', function (e) {
        const latLng = e.latlng;
        showContextMenu(latLng, e.originalEvent);
    });

    addMapClickListener();
}

function showContextMenu(latLng, event) {
    if (currentMenu) {
        currentMenu.remove();
    }

    const menu = L.DomUtil.create('div', 'context-menu');
    menu.innerHTML = `<div class="menu-item">Створити точку тут</div>`;

    menu.style.position = 'absolute';
    menu.style.left = `${event.pageX}px`;
    menu.style.top = `${event.pageY}px`;
    menu.style.backgroundColor = 'white';
    menu.style.padding = '10px';
    menu.style.border = '1px solid black';
    menu.style.zIndex = '1000';
    menu.style.cursor = 'pointer';

    document.body.appendChild(menu);

    currentMenu = menu;

    menu.querySelector('.menu-item').onclick = function () {
        createMarker(latLng);
        menu.remove();
        currentMenu = null;
    };

    L.DomEvent.on(document, 'click', function () {
        if (currentMenu) {
            currentMenu.remove();
            currentMenu = null;
        }
    });

    event.stopPropagation();
}

function createMarker(latLng) {
    L.marker([latLng.lat, latLng.lng]).addTo(map)
        .bindPopup('Точка створена тут')
        .openPopup();
}

function createButton() {
    const createMarkerButton = L.control({ position: 'topleft' });
    createMarkerButton.onAdd = function (map) {
        const button = addButton('./assets/marker_butoon.png', onButtonActive1, onButtonInactive1);
        return button;
    };
    createMarkerButton.addTo(map);
}

function addButton(buttonImg, onActive, onInactive) {
    let active = false;

    const button = L.DomUtil.create('button', 'custom-button');

    button.innerHTML = `<img src="${buttonImg}" alt="Button" class="button-image">`;

    button.style.backgroundColor = 'transparent';
    button.style.border = 'none';
    button.style.padding = '0';
    button.style.cursor = 'pointer';
    button.style.pointerEvents = 'auto';

    button.onclick = function (e) {
        active = !active;
        e.stopPropagation();
        if (active) {
            onInactive();
        } else {
            onActive();
        }

        if (active) {
            button.style.backgroundColor = '#28a745';
        } else {
            button.style.backgroundColor = 'transparent';
        }
    }

    return button;

}

function addMapClickListener() {
    let markers = [];
    let points = [];

    map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        const marker = L.marker([lat, lng]).addTo(map);

        points.push([lat, lng]);
        markers.push(marker);

        if (points.length === 2) {
            handleLineAndMarkers(points, markers);
            points = [];
            markers = [];
        }
    });
}

function handleLineAndMarkers(points, markers) {
    const uniqueId = crypto.randomUUID();

    if (!mapElements[uniqueId]) {
        mapElements[uniqueId] = { markers: {}, lines: {} };
    }

    mapElements[uniqueId].markers = markers;

    const line = L.polyline(points, { color: 'red', weight: 3 }).addTo(map);

    line.bindPopup(`
        <b>Маркер ${uniqueId}</b><br>
        <button 
            class="line-delete-button" 
            data-note-uuid="${uniqueId}" 
        >Видалити нотаток</button>
    `);

    line.on('popupopen', function() {
        $(".line-delete-button").click(function () {
            const noteUUID = $(this).data('note-uuid');
            deleteNoteByUUID(noteUUID);
        });
    });

    mapElements[uniqueId].lines = line;

    const distanceMeters = calculateDistance(points[0][1], points[0][0], points[1][1], points[1][0]);
    const elevationAngle = calculateElevationAngle(distanceMeters);
    const arrivalTime = calculateArrivalTime(distanceMeters);

    createNote(distanceMeters, elevationAngle, arrivalTime, uniqueId);

    const tooltipText = `Дистанція: ${distanceMeters} метрів; <br> Кут: ${elevationAngle} градусів; <br> Час підльоту: ${arrivalTime} с;`;
    line.bindTooltip(tooltipText).openTooltip();
}

function deleteNoteByUUID(noteUUID) {
    if (mapElements[noteUUID]?.lines) {
        map.removeLayer(mapElements[noteUUID].lines);
        delete mapElements[noteUUID].lines;
    }

    if (mapElements[noteUUID]?.markers) {
        Object.keys(mapElements[noteUUID].markers).forEach(markerId => {
            map.removeLayer(mapElements[noteUUID].markers[markerId]);
            delete mapElements[noteUUID].markers[markerId];
        });
    }

    deleteNote(noteUUID);
}

function onButtonActive1(){
    console.log("Active");
}

function onButtonInactive1(){
    console.log("Inactive");
}