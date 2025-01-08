let mapElements = {};
let map;
let mapWidthMeters;
let mapHeightMeters;

function updateZoomLimits(minZoom, maxZoom) {
    map.setMinZoom(minZoom);
    map.setMaxZoom(maxZoom);
}

function setMapWidth(newWidth) {
    mapWidthMeters = newWidth;
}

function setMapHeight(newHeight) {
    mapHeightMeters = newHeight;
}

function setMapURL(event) {
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
    
        let markers = [];
        let points = [];
    
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            const marker = L.marker([lat, lng]).addTo(map);
    
            points.push([lat, lng]);
            markers.push(marker);
    
            if (points.length === 2) {
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
                    });
                });
    
                mapElements[uniqueId].lines = line;
    
                const distanceMeters = calculateDistance(points[0][1], points[0][0], points[1][1], points[1][0]);
                const elevationAngle = calculateElevationAngle(distanceMeters);
                const arrivalTime = calculateArrivalTime(distanceMeters);
                
                createNote(distanceMeters, elevationAngle, arrivalTime, uniqueId);
    
                const tooltipText = `Дистанція: ${distanceMeters} метрів; <br> Кут: ${elevationAngle} градусів; <br> Час підльоту: ${arrivalTime} с;`;
                line.bindTooltip(tooltipText).openTooltip();
    
                points = [];
                markers = [];
            }
    
        });
    
    };
}