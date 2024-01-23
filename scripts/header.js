document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners for the buttons
    document.getElementById("info-button").addEventListener("click", () => toggleOverlay('info-overlay'));
    document.getElementById("stats-button").addEventListener("click", () => toggleOverlay('stats-overlay'));
    document.getElementById("title").addEventListener("click", () => toggleOverlay('none'));
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

