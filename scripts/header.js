document.addEventListener('DOMContentLoaded', () => {
    // Set up event listener for the '?' button
    document.getElementById("info-button").addEventListener("click", switchState);
});

function switchState() {
    const mainContainer = document.querySelector('.game-container');
    const infoOverlay = document.getElementById('info-overlay');

    // Toggle the visibility of the main container and info overlay
    if (infoOverlay.style.display === "none") {
        mainContainer.style.display = "none"; // Hide the main content
        infoOverlay.style.display = "flex"; // Show the info overlay
    } else {
        infoOverlay.style.display = "none"; // Hide the info overlay
        mainContainer.style.display = "flex"; // Show the main content
    }
}

