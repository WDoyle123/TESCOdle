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
    // Initialize the first guess input and button
    addGuessInput();
    updateGuessCounter();
});

function addGuessInput() {
    if (gameState === 'end' || currentGuessCount > maxGuesses) {
        return;
    }

    const guessInputContainer = document.getElementById('guessInputs');
    const guessIndex = currentGuessCount - 1;

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

    if (currentGuessCount === 1) { // Only increment count and update counter for subsequent guesses
        return;
    }

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
        const lowerBound20 = productPrice * 0.80; // ORANGE 
        const upperBound20 = productPrice * 1.20; // ORANGE 

    if ((guessValue == productPrice) || (guessValue >= lowerBound && guessValue <= upperBound)) {
        // Correct guess logic
        endGame(inputElement);
    } else if (guessValue >= lowerBound10 && guessValue <= upperBound10) {
        // Guess within 10% but not correct
        indicateHighLow(inputElement, guessValue, '#fbfb70');
    } else if (guessValue >= lowerBound20 && guessValue <= upperBound20) {
        // Guess within 20% but not within 10%
        indicateHighLow(inputElement, guessValue, '#fed285');
    } else {
        // Guess not within 20%
        indicateHighLow(inputElement, guessValue, '#ed6a5b');
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

function indicateHighLow(inputElement, guessValue, color) {
    inputElement.style.backgroundColor = color;

    const addButton = inputElement.nextElementSibling;
    console.log(addButton)
    if (addButton && addButton.classList.contains('add-button')) {
        console.log("Updating Add button: ", guessValue, productPrice); // Debug log
        addButton.textContent = guessValue > productPrice ? '↓ DOWN' : '↑ UP';
    } else {
        console.log("Next sibling is not an Add button: ", addButton); // Debug log
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
