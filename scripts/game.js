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

    const startDate = new Date("2024-01-18"); // Fixed start date
    const today = new Date();
    const dayIndex = dateDiffInDays(startDate, today) - 1;

    if (dayIndex >= 0 && dayIndex < parsedData.length) {
        return parsedData[dayIndex];
    } else {
        return null;
    }
}

function dateDiffInDays(date1, date2) {
    const diffTime = Math.abs(date2 - date1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

let productPrice = 0; // This will be set when fetching the product
let maxGuesses = 4;
let currentGuessCount = 1;
let gameState = 0

function updateGuessCounter() {
    const guessCountElement = document.querySelector('.guess-count');
    if (guessCountElement) {
        guessCountElement.textContent = `${currentGuessCount} / ${maxGuesses}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const initialAddButton = document.querySelector('.add-button');
    initialAddButton.id = 'addButton0';
    initialAddButton.onclick = () => {
        const initialInput = document.getElementById('guess0');
        // Check the first guess when the initial 'Add' button is clicked
        checkGuess(initialInput);
        if (currentGuessCount < maxGuesses) {
            addGuessInput();
        }
        initialInput.disabled = true;
        initialAddButton.disabled = true;
    };

    // Initialize guess counter display
    updateGuessCounter();
});

function addGuessInput() {

    if (gameState == 'end') {
        return;
    }
    const guessInputContainer = document.getElementById('guessInputs');
    const guessIndex = guessInputContainer.querySelectorAll('.price-form').length;

    // Create a new input element
    const newInput = document.createElement('input');
    newInput.className = 'price-form';
    newInput.type = 'text';
    newInput.placeholder = 'Enter Price...';
    newInput.id = 'guess' + guessIndex;

    // Create a new 'Add' button
    const addButton = document.createElement('button');
    addButton.className = 'add-button';
    addButton.textContent = 'Add';
    addButton.id = 'addButton' + guessIndex;
    addButton.onclick = () => {
        checkGuess(newInput); // Check the guess when 'Add' is clicked
        newInput.disabled = true; // Disable this input
        addButton.disabled = true; // Disable this 'Add' button

        if (currentGuessCount >= maxGuesses || gameState == 'end') {
            endGame(); // End the game if max guesses reached and not already ended
        } else if (currentGuessCount < maxGuesses) {
            addGuessInput(); // Add another guess input only if under max guesses
        }
    };

    // Append new input and button to the container
    guessInputContainer.appendChild(newInput);
    guessInputContainer.appendChild(addButton);

    // Increment current guess count and update the guess counter
    currentGuessCount++;
    updateGuessCounter();
}

function checkGuess(inputElement) {
    const guessValue = parseFloat(inputElement.value);
    if (!isNaN(guessValue)) {
        const lowerBound = productPrice * 0.95;
        const upperBound = productPrice * 1.05;
        const lowerBound10 = productPrice * 0.90;
        const upperBound10 = productPrice * 1.10
        const lowerBound15 = productPrice * 0.85;
        const upperBound15 = productPrice * 1.15;

        console.log(guessValue)
        console.log(productPrice)

        if ((guessValue == productPrice) || (guessValue >= lowerBound && guessValue <= upperBound)) {
            // Stop the game if guess is exactly right or within 5%
            endGame(inputElement);
        } else if (guessValue >= lowerBound10 && guessValue <= upperBound10) {
            // Change color only if the guess is within 25% but not within 10%
            indicateHighLow(inputElement, '#fbfb70');
        } else if (guessValue >= lowerBound15 && guessValue <= upperBound15) {
            // Change color only if the guess is within 25% but not within 15%
            indicateHighLow(inputElement, '#fed285');
        } else {
            inputElement.style.backgroundColor = '#ed6a5b'; // Reset color if not within 15%
        }
    }
}

function endGame(correctInputElement = null) {
    gameState = 'end'; // Set game state to 'end'

    // Highlight the correct input field in green, if provided
    if (correctInputElement) {
        correctInputElement.style.backgroundColor = 'lightgreen';
    }

    // Reveal the actual price
    if (productPriceElement) {
        productPriceElement.textContent = `£${productPrice.toFixed(2)}`;
    }

    disableAllInputsAndButtons(); // Disable inputs and buttons
}

function disableAllInputsAndButtons() {
    // Disable all input fields and 'Add' buttons
    const allInputs = document.querySelectorAll('.price-form');
    allInputs.forEach(input => input.disabled = true);
    const allAddButtons = document.querySelectorAll('.add-button');
    allAddButtons.forEach(button => button.disabled = true);
}

function indicateHighLow(inputElement, color) {
    // Change the background color of the input element to yellow
    inputElement.style.backgroundColor = color;
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
        if (productPriceElement) {
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
