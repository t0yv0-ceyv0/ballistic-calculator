document.querySelectorAll(".accordion-header").forEach((header) => {
    header.addEventListener("click", () => {
        const content = header.nextElementSibling;

        // Перемикання видимості вмісту
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
});
