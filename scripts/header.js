document.addEventListener('DOMContentLoaded', () => {
    // Existing overlay functionality
    document.getElementById("info-button").addEventListener("click", () => toggleOverlay('info-overlay'));
    document.getElementById("stats-button").addEventListener("click", () => toggleOverlay('stats-overlay'));
    document.getElementById("title").addEventListener("click", () => toggleOverlay('none'));

    // Date input and display functionality
    const dateInput = document.getElementById("custom-date-picker"); // ID of the hidden Flatpickr input
    const dateDisplay = document.getElementById("archive-display"); // ID of the display element

    // Initialize Flatpickr with custom settings
    flatpickr(dateInput, {
        defaultDate: new Date(), // Set today's date as default
        dateFormat: "Y-m-d", // Format the date as YYYY-MM-DD
        onChange: function(selectedDates, dateStr, instance) {
            // Update the display when date is changed
            dateDisplay.textContent = dateStr;
        },
        appendTo: dateDisplay, // Append calendar near the display element
        static: true // Ensures the calendar is statically positioned
    });

    // Click on display to open Flatpickr calendar
    dateDisplay.addEventListener('click', function() {
        // Trigger the Flatpickr calendar when display element is clicked
        dateInput._flatpickr.open();
    });
});

function toggleOverlay(overlayId) {
    const mainContainer = document.querySelector('.game-container');
    const infoOverlay = document.getElementById('info-overlay');
    const statsOverlay = document.getElementById('stats-overlay');

    if (overlayId === 'none') {
        // Hide both overlays and show the main container
        infoOverlay.style.display = "none";
        statsOverlay.style.display = "none";
        mainContainer.style.display = "flex";
    } else {
        const currentOverlay = document.getElementById(overlayId);
        const otherOverlay = overlayId === 'info-overlay' ? statsOverlay : infoOverlay;

        // Hide the other overlay if it's visible
        if (otherOverlay.style.display === "flex") {
            otherOverlay.style.display = "none";
        }

        // Toggle the visibility of the current overlay
        if (currentOverlay.style.display === "none") {
            mainContainer.style.display = "none";
            currentOverlay.style.display = "flex";
        } else {
            currentOverlay.style.display = "none";
            mainContainer.style.display = "flex";
        }
    }
}

