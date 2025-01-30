function validateInput(input) {
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    const value = parseFloat(input.value);

    input.value = value === '' ? min : Math.max(min, Math.min(value, max));

    const actions = {
        'max_scale': () => {
            const maxScale = parseFloat(document.getElementById('max_scale').value);
            const minScale = parseFloat(document.getElementById('min_scale').value);
            updateZoomLimits(minScale, maxScale);
        },
        'min_scale': () => {
            const maxScale = parseFloat(document.getElementById('max_scale').value);
            const minScale = parseFloat(document.getElementById('min_scale').value);
            updateZoomLimits(minScale, maxScale);
        },
        'map_height': () => setMapHeight(input.value),
        'map_width': () => setMapWidth(input.value),
        'shell_start_velocity': () => setShellStartVelocity(input.value)
    };

    if (actions[input.id]) {
        actions[input.id]();
    }
}

const inputs = document.querySelectorAll('.settings input[type="number"]');

inputs.forEach(input => {
    input.addEventListener('change', () => validateInput(input));
});

document.getElementById('map-upload').addEventListener('change', setMapImgURL);

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        'shell_start_velocity': setShellStartVelocity,
        'map_height': setMapHeight,
        'map_width': setMapWidth
    };

    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const value = element.value;
            elements[id](value);
        }
    });
});