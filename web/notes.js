function createNote(distance, elevation, arrivalTime, uuid) {
    const notesContainer = document.getElementById("notes");

    const noteContainer = document.createElement("div");
    noteContainer.classList.add("note");
    noteContainer.id = uuid;

    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.id = "color_picker";
    colorPicker.value = "#fc0303";

    const noteNumber = document.createElement("p");
    noteNumber.id = "noteNumber";
    noteNumber.textContent = "№: ";

    const distanceP = document.createElement("p");
    distanceP.textContent = `Дистанція: ${distance}`;

    const elevationP = document.createElement("p");
    elevationP.textContent = `Потрібний кут нахилу: ${elevation}°`;

    const arrivalTimeP = document.createElement("p");
    arrivalTimeP.textContent = `Час підльоту: ${arrivalTime} с`;

    noteContainer.appendChild(colorPicker);
    noteContainer.appendChild(noteNumber);
    noteContainer.appendChild(distanceP);
    noteContainer.appendChild(elevationP);
    noteContainer.appendChild(arrivalTimeP);

    notesContainer.prepend(noteContainer);
    
    colorPicker.addEventListener('input', function () {
        const selectedColor = colorPicker.value;
        
        if (mapElements[uuid]?.lines) {
            mapElements[uuid].lines.setStyle({ color: selectedColor });
        }
    });

    updateNoteNumbers();
}

function deleteNote(uuid) {
    const notesContainer = document.getElementById("notes");
    const noteToDelete = document.getElementById(uuid);

    if (noteToDelete) {
        notesContainer.removeChild(noteToDelete);
        updateNoteNumbers();
    } else {
        console.log("Note not found.");
    }
}

function updateNoteNumbers() {
    const notesContainer = document.getElementById("notes");
    const notes = Array.from(notesContainer.querySelectorAll('.note')).reverse();
    notes.forEach((note, index) => {
        const numberElement = note.querySelector('#noteNumber');
        numberElement.textContent = `№ ${index + 1}`;
    });
}