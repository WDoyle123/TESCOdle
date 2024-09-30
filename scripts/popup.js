document.addEventListener('DOMContentLoaded', function () {
    const changelogOverlay = document.getElementById('changelog-overlay');
    const changelogClose = document.getElementById('changelog-close');

    // Function to show the changelog
    function showChangelog() {
        changelogOverlay.classList.add('active');
    }

    // Function to hide the changelog and set localStorage
    function hideChangelog() {
        changelogOverlay.classList.remove('active');
        localStorage.setItem('changelogShown', 'true');
    }

    // Check if the changelog has been shown before
    if (!localStorage.getItem('changelogShown')) {
        showChangelog();
    }

    // Event listener for the close button
    if (changelogClose) { // Ensure the element exists
        changelogClose.addEventListener('click', hideChangelog);
    }

    // Optional: Close the popup when clicking outside the popup content
    if (changelogOverlay) { // Ensure the element exists
        changelogOverlay.addEventListener('click', function (e) {
            if (e.target === changelogOverlay) {
                hideChangelog();
            }
        });
    }
});

