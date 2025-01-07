function validateInput(input) {
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    const value = parseFloat(input.value);

    if (input.value === '') {
        input.value = min;
    }
    else if (value < min) {
        input.value = min;
    }
    else if (value > max) {
        input.value = max;
    }

    if (input.id === 'max_scale' || input.id === 'min_scale') {
        const maxScale = parseFloat(document.getElementById('max_scale').value);
        const minScale = parseFloat(document.getElementById('min_scale').value);
        updateZoomLimits(minScale, maxScale);
    }
    else if (input.id === 'shell_start_velocity') {
        setShellStartVelocity(input.value);
    }

}

const inputs = document.querySelectorAll('.settings input[type="number"]');

inputs.forEach(input => {
    input.addEventListener('change', () => validateInput(input));
});

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('shell_start_velocity');
    if (input) {
        setShellStartVelocity(input.value);
    }
});