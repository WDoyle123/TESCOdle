async function fetchCSV(filePath) {
    const response = await fetch(filePath);
    return await response.text();
}

function parseCSV(csvContent) {
    const lines = csvContent.split("\n");
    const headers = lines[0].split(",").map(header => header.trim());
    const data = lines.slice(1).map(line => {
        const values = line.split(",").map(value => value.trim());
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
        }, {});
    });
    return data;
}

async function getTodaysProduct() {
    const csvFilePath = '../static/data/tesco_scrape.csv';
    const csvData = await fetchCSV(csvFilePath);
    const parsedData = parseCSV(csvData);

    const startDate = new Date("2022-01-10"); // Fixed start date
    const today = new Date();
    const dayIndex = dateDiffInDays(startDate, today) - 1;

    const todayStr = today.toDateString();
    const lastPlayedStr = window.localStorage.getItem('lastPlayed');

    // Check if a new day has started
    if (lastPlayedStr !== todayStr) {
        resetGameState();
        window.localStorage.setItem('lastPlayed', todayStr);

        // Refresh the page to reset the game state for the new day
        window.location.reload();
        return;
    }

    if (dayIndex >= 0 && dayIndex < parsedData.length) {
        return parsedData[dayIndex];
    } else {
        return null;
    }
}

function resetGameState() {
    for (let i = 0; i < maxGuesses; i++) {
        window.localStorage.removeItem(i.toString());
    }
    window.localStorage.removeItem('completedToday');
    window.localStorage.removeItem('lastPlayed');
    window.localStorage.removeItem('gameState'); // Reset the saved game state
    window.localStorage.removeItem('priceReveal');
}

function dateDiffInDays(date1, date2) {
    const diffTime = Math.abs(date2 - date1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

let productPrice = 0; // This will be set when fetching the product
let maxGuesses = 4;
let currentGuessCount = 0;
let gameState = 0

function updateGuessCounter() {
    const guessCountElement = document.querySelector('.guess-count');
    if (guessCountElement) {
        guessCountElement.textContent = `${currentGuessCount} / ${maxGuesses}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    displayStats(); 

    let restoredCount = 0;
    const savedGameState = window.localStorage.getItem('gameState');

    if (savedGameState == 'end') {
        const price = document.getElementById('productPrice');
        price.textContent = window.localStorage.getItem('priceReveal');

    }


    for (let i = 0; i < maxGuesses; i++) {
        const savedGuess = window.localStorage.getItem(i);
        if (savedGuess) {
            const guessDetails = JSON.parse(savedGuess);
            addGuessInput(guessDetails, true);
            restoredCount++;
        }
    }

    // Add a new input field only if the game hasn't ended and there are guesses left
    if (restoredCount < maxGuesses && savedGameState !== 'end') {
        addGuessInput();
    }

    updateGuessCounter();
});

// Function to store saved game state
function initLocalStorage() {

    // Clear local game state
    window.localStorage.setItem('completedToday', false);
    window.localStorage.setItem('0', '')
    window.localStorage.setItem('1', '')
    window.localStorage.setItem('2', '')
    window.localStorage.setItem('3', '')
}

function addGuessInput(guessDetails = null, isRestored = false) {
    const guessInputContainer = document.getElementById('guessInputs');
    const guessIndex = currentGuessCount;

    // Create a new input element
    const newInput = document.createElement('input');
    newInput.className = 'price-form';
    newInput.type = 'text';
    newInput.placeholder = '0.00';
    newInput.id = 'guess' + guessIndex;

    // Create a new 'Add' button
    const addButton = document.createElement('button');
    addButton.className = 'add-button';
    addButton.textContent = 'Add';
    addButton.id = 'addButton' + guessIndex;

    if (guessDetails && isRestored) {
        newInput.value = guessDetails.value;
        newInput.style.backgroundColor = guessDetails.color;
        addButton.textContent = guessDetails.buttonText;
        newInput.disabled = true;
        addButton.disabled = true;
    }

    addButton.onclick = () => {
        if (!newInput.disabled) {
            checkGuess(newInput);
            newInput.disabled = true;
            addButton.disabled = true;
        }

        if (currentGuessCount < maxGuesses && gameState !== 'end') {
            addGuessInput();
        }
    };

    // Append new input and button to the container
    guessInputContainer.appendChild(newInput);
    guessInputContainer.appendChild(addButton);

    currentGuessCount++;
    updateGuessCounter();
}

function checkGuess(inputElement) {
    const guessValue = parseFloat(inputElement.value);
    if (!isNaN(guessValue)) {
        const lowerBound = productPrice * 0.95; // CORRECT
        const upperBound = productPrice * 1.05; // CORRECT
        const lowerBound10 = productPrice * 0.90; // YELLOW
        const upperBound10 = productPrice * 1.10 // YELLOW
        const lowerBound25 = productPrice * 0.75; // ORANGE 
        const upperBound25 = productPrice * 1.25; // ORANGE 
        // Determine color and button text
        let color = '';
        let buttonText = '';
        if ((guessValue == productPrice) || (guessValue >= lowerBound && guessValue <= upperBound)) {
            color = 'lightgreen';
            buttonText = 'Correct';
            indicateHighLow(inputElement, guessValue, color)
            endGame(inputElement, true);
        } else if (guessValue >= lowerBound10 && guessValue <= upperBound10) {
            indicateHighLow(inputElement, guessValue, '#fbfb70');
        } else if (guessValue >= lowerBound25 && guessValue <= upperBound25) {
            indicateHighLow(inputElement, guessValue, '#fed285');
        } else {
            indicateHighLow(inputElement, guessValue, '#ed6a5b');
        }

        if (currentGuessCount >= maxGuesses) {
            endGame(null, false);
        }
    }
}

function endGame(correctInputElement = null, gameWon = false) {
    if (gameState === 'end') {
        // Game has already ended, do not proceed further
        return;
    }

    gameState = 'end'; // Set game state to 'end'
    window.localStorage.setItem('gameState', 'end');

    if (gameWon) {
        recordScore(currentGuessCount);
    } else if (currentGuessCount >= maxGuesses) {
        // Handle case where all guesses are used but the last guess is not correct
        recordScore(currentGuessCount);
    }

    displayStats();

    // Highlight the correct input field in green, if provided
    if (correctInputElement) {
        correctInputElement.style.backgroundColor = 'lightgreen';
    }

    // Reveal the actual price
    if (productPriceElement) {
        productPriceElement.textContent = `£${productPrice.toFixed(2)}`;
        window.localStorage.setItem('priceReveal', productPriceElement.textContent);
    }

    disableAllInputsAndButtons(); // Disable inputs and buttons
}

function recordScore(score) {
    let stats = JSON.parse(localStorage.getItem('gameStats')) || { 
        scores: {}, 
        totalGames: 0, 
        totalPoints: 0 
    };

    // Scoring system with points
    const pointsMap = { 1: 10, 2: 5, 3: 2, 4: 1 };

    stats.scores[score] = (stats.scores[score] || 0) + 1;
    stats.totalGames += 1;
    stats.totalPoints += (pointsMap[score] || 0);

    localStorage.setItem('gameStats', JSON.stringify(stats));
}

function displayStats() {
    let stats = JSON.parse(localStorage.getItem('gameStats')) || { 
        scores: {}, 
        totalGames: 0, 
        totalPoints: 0 
    };

    const xValues = []; // Scores (1, 2, 3, 4)
    const yValues = []; // Number of times each score was achieved

    // Prepare data for Plotly
    for (let i = 1; i <= maxGuesses; i++) {
        xValues.push(`Score ${i}`);
        yValues.push(stats.scores[i] || 0);
    }
    // Reverse the data arrays to order the bars correctly
    xValues.reverse();
    yValues.reverse();

    // Plotly data trace
    var trace1 = {
        x: yValues,
        y: xValues,
        type: 'bar',
        orientation: 'h', // Horizontal bars
        text: yValues.map(String),
        textposition: 'auto',
        hoverinfo: 'none', // Removes hover text
        marker: {
            color: 'rgb(158,202,225)',
            opacity: 0.6,
            line: {
                color: 'rgb(8,48,107)',
                width: 1.5
            }
        }
    };

    var data = [trace1];

    var layout = {
        barmode: 'stack',
        width: 150, // Adjusted for the container size
        height: 250, // You may need to adjust the height as well
        margin: {
            l: 40, // Left margin
            r: 10, // Right margin
            t: 20, // Top margin
            b: 20, // Bottom margin
        },
        font: {
            size: 8 // Reduced font size
        },
        // Disable the mode bar
        displayModeBar: false
    };
    
    // Now, handle the display of total points and games in 'pointsContainer'
    const pointsContainer = document.getElementById('pointsContainer');
    pointsContainer.innerHTML = ''; // Clear previous contents

    // Display total points
    const totalPointsElement = document.createElement('div');
    totalPointsElement.textContent = `Total Points: ${stats.totalPoints}`;
    pointsContainer.appendChild(totalPointsElement);

    // Display total games played
    const totalGamesElement = document.createElement('div');
    totalGamesElement.textContent = `Total Games: ${stats.totalGames}`;
    pointsContainer.appendChild(totalGamesElement);
    
    if (stats.totalGames > 0) {
    // Use Plotly to create the bar chart in the 'statsContainer' div
    Plotly.newPlot('statsContainer', data, layout, {staticPlot: true});
    }

}


function disableAllInputsAndButtons() {
    // Disable all input fields and 'Add' buttons
    const allInputs = document.querySelectorAll('.price-form');
    allInputs.forEach(input => input.disabled = true);
    const allAddButtons = document.querySelectorAll('.add-button');
    allAddButtons.forEach(button => button.disabled = true);
}

function indicateHighLow(inputElement, guessValue, color) {
    inputElement.style.backgroundColor = color;

    const addButton = inputElement.nextElementSibling;
    if (addButton && addButton.classList.contains('add-button')) {
        if (color == 'lightgreen') {
            addButton.textContent = 'Correct!'
        } else {
            addButton.textContent = guessValue > productPrice ? '↓ DOWN' : '↑ UP';
        }
        // Save the updated guess details to localStorage
        const guessDetails = { value: inputElement.value, color, buttonText: addButton.textContent };
        window.localStorage.setItem(currentGuessCount - 1, JSON.stringify(guessDetails));
    }
}

getTodaysProduct().then(product => {
    const productNameElement = document.getElementById('productName');
    productPriceElement = document.getElementById('productPrice');
    const productImageElement = document.getElementById('productImage');

    if (product) {
        // If product data is available
        if (productNameElement) {
            productNameElement.textContent = product.Product;
        }
        if (productPriceElement.textContent == '') {
            productPriceElement.textContent = "£?.??";
        }
        if (productImageElement) {
            productImageElement.src = `../static/data/images/${product.Image}`;
        }
        productPrice = parseFloat(product.Price.substring(1)); // Set the global product price
    } else {
        // If product data is not available
        console.log('Product not found for today\'s date');
        if (productNameElement) {
            productNameElement.textContent = "No product available for today";
        }
        if (productPriceElement) {
            productPriceElement.textContent = 'Out of Stock';
        }
        if (productImageElement) {
            productImageElement.src = '../static/data/image_unavailable.png';
        }
    }
});


