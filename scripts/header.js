document.addEventListener('DOMContentLoaded', () => {
    // Event listeners for overlay toggling
    const infoButton = document.getElementById("info-button");
    const statsButton = document.getElementById("stats-button");
    const title = document.getElementById("title");
    
    if (infoButton && statsButton && title) {
        infoButton.addEventListener("click", () => toggleOverlay('info-overlay'));
        statsButton.addEventListener("click", () => toggleOverlay('stats-overlay'));
        title.addEventListener("click", () => toggleOverlay('none'));
    }

    // Date input and display functionality
    const dateInput = document.getElementById("custom-date-picker"); 
    const leftArrow = document.getElementById("archive-arrow-left");
    const rightArrow = document.getElementById("archive-arrow-right");

    if (dateInput && leftArrow && rightArrow) {
        const startDate = '2020-01-01'; 
        const today = new Date().toISOString().split('T')[0]; 

        // Initialize the date input
        dateInput.type = 'date';
        dateInput.min = startDate;
        dateInput.max = today;
        dateInput.value = today;

        dateInput.addEventListener('change', function() {
        });

        // Event listeners for arrow buttons
        leftArrow.addEventListener("click", () => arrowClick('left', dateInput));
        rightArrow.addEventListener("click", () => arrowClick('right', dateInput));

        // Event listener for calendar icon button
        const calendarButton = document.querySelector('.calendar-icon-button');
        if (calendarButton) {
            calendarButton.addEventListener("click", () => {
                dateInput.focus(); 
            });
        }
    }
});

function toggleOverlay(overlayId) {
    const mainContainer = document.querySelector('.game-container');
    const infoOverlay = document.getElementById('info-overlay');
    const statsOverlay = document.getElementById('stats-overlay');

    if (overlayId === 'none') {
        // Hide both overlays and show the main container
        if (infoOverlay) infoOverlay.style.display = "none";
        if (statsOverlay) statsOverlay.style.display = "none";
        if (mainContainer) mainContainer.style.display = "flex";
    } else {
        const currentOverlay = document.getElementById(overlayId);
        const otherOverlay = overlayId === 'info-overlay' ? statsOverlay : infoOverlay;

        // Hide the other overlay if it's visible
        if (otherOverlay && otherOverlay.style.display === "flex") {
            otherOverlay.style.display = "none";
        }

        // Toggle the visibility of the current overlay
        if (currentOverlay) {
            if (currentOverlay.style.display === "none" || currentOverlay.style.display === "") {
                if (mainContainer) mainContainer.style.display = "none";
                currentOverlay.style.display = "flex";
            } else {
                currentOverlay.style.display = "none";
                if (mainContainer) mainContainer.style.display = "flex";
            }
        }
    }
}

function arrowClick(direction, dateInput) {
    let currentDate = new Date(dateInput.value);

    // If the current date is invalid, default to the minimum date
    if (isNaN(currentDate)) {
        currentDate = new Date(dateInput.min);
    }

    // Adjust the date based on the arrow direction
    if (direction === 'left') {
        currentDate.setDate(currentDate.getDate() - 1);
    } else if (direction === 'right') {
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const minDate = new Date(dateInput.min);
    const maxDate = new Date(dateInput.max);

    // Ensure the new date is within the allowed range
    if (currentDate >= minDate && currentDate <= maxDate) {
        // Format the date to 'YYYY-MM-DD'
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); 
        const day = String(currentDate.getDate()).padStart(2, '0');
        const newDate = `${year}-${month}-${day}`;

        dateInput.value = newDate;
        
        const event = new Event('change');
        dateInput.dispatchEvent(event);
    }
}
