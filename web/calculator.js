const g = 9.8;

let metersPerPixelX;
let metersPerPixelY;
let shellVelocity;

function setMetersPerPixel(mapWidthMeters, mapHeightMeters, imageWidth, imageHeight) {
    metersPerPixelX = mapWidthMeters / imageWidth;
    metersPerPixelY = mapHeightMeters / imageHeight;
}

function setShellStartVelocity(velocity) {
    shellVelocity = velocity;
}

function calculateDistance(x1, y1, x2, y2) {
    const distancePixels = Math.hypot(x2 - x1, y2 - y1);

    const distanceMeters = distancePixels * Math.sqrt(metersPerPixelX * metersPerPixelY);

    return distanceMeters.toFixed(2);
}

function calculateElevationAngle(distance) {
    if ((distance * g) / (shellVelocity ** 2) > 1) {
        return "Неможливо досягти такої дистанції з даною швидкістю";
    }

    const angleRad = 0.5 * Math.asin((distance * g) / Math.pow(shellVelocity, 2)); 
    const angleDeg = angleRad * (180 / Math.PI);

    return angleDeg.toFixed(2);
}

function calculateArrivalTime (distance) {
    const time = distance / shellVelocity;
    return time.toFixed(2);
}