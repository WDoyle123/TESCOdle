// Utility Functions
async function fetchCSV(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error fetching CSV:", error);
    return "";
  }
}

function parseCSV(csvContent) {
  const lines = csvContent.split("\n").filter((line) => line.trim() !== "");
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map((header) => header.trim());
  const data = lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] || "";
      return obj;
    }, {});
  });
  return data;
}

function dateDiffInDays(date1, date2) {
  const oneDay = 1000 * 60 * 60 * 24;
  const diffTime = date2.getTime() - date1.getTime();
  return Math.ceil(diffTime / oneDay);
}

// Utility Function to Format Date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Game State Management
async function getTodaysProduct() {
  const csvFilePath = "../static/data/tesco_scrape.csv";
  const csvData = await fetchCSV(csvFilePath);
  const parsedData = parseCSV(csvData);

  const startDate = new Date("2022-01-10"); // Fixed start date
  const today = new Date();
  const dayIndex = dateDiffInDays(startDate, today) - 1;

  const todayStr = formatDate(today); // Use YYYY-MM-DD format
  const lastPlayedStr = window.localStorage.getItem("lastPlayed");

  console.log(`Today's Date: ${todayStr}`);
  console.log(`Last Played Date: ${lastPlayedStr}`);

  // Check if a new day has started
  if (lastPlayedStr !== todayStr) {
    console.log("New day detected. Resetting game state.");
    resetGameState();
    window.localStorage.setItem("lastPlayed", todayStr);

    // Refresh the page to reset the game state for the new day
    window.location.reload();
    return;
  }

  if (dayIndex >= 0 && dayIndex < parsedData.length) {
    console.log(`Fetching product for day index: ${dayIndex}`);
    return parsedData[dayIndex];
  } else {
    console.warn("No product found for today's date.");
    return null;
  }
}

function resetGameState() {
  console.log("Resetting game state...");

  // Clear all guess-related data
  window.localStorage.removeItem("currentGuessCount"); // Reset the guess counter
  for (let i = 0; i < maxGuesses; i++) {
    window.localStorage.removeItem(i.toString());
  }
  window.localStorage.removeItem("completedToday");
  window.localStorage.removeItem("gameState"); // Reset the saved game state
  window.localStorage.removeItem("priceReveal");

  console.log("Cleared localStorage items related to the game.");

  // Initialize localStorage with default values
  window.localStorage.setItem("currentGuessCount", "0");
  window.localStorage.setItem("completedToday", "false");
  window.localStorage.setItem("gameState", "active"); // Explicitly set gameState to active
  for (let i = 0; i < maxGuesses; i++) {
    window.localStorage.setItem(i.toString(), "");
  }

  console.log("Initialized localStorage with default game values.");

  // Optionally, clear the guess inputs from the DOM
  const guessInputContainer = document.getElementById("guessInputs");
  if (guessInputContainer) {
    guessInputContainer.innerHTML = "";
    console.log("Cleared guess input container.");
  }
}

// Initialize Game Variables
let productPrice = 0; // This will be set when fetching the product
const maxGuesses = 4;
let currentGuessCount = 0; // Represents the number of completed guesses
let gameState = "active"; // Changed to string for consistency
let productPriceElement = null; // To be initialized later

// Counter Display Function
function updateGuessCounter() {
  const guessCountElement = document.querySelector(".guess-count");
  if (guessCountElement) {
    guessCountElement.textContent = `${currentGuessCount} / ${maxGuesses}`;
    console.log(`Guess counter updated to: ${currentGuessCount} / ${maxGuesses}`);
  }
}

// Initialize Local Storage for a New Game
function initLocalStorage() {
  window.localStorage.setItem("completedToday", "false");
  window.localStorage.setItem("currentGuessCount", "0"); // Initialize guess count
  window.localStorage.setItem("gameState", "active"); // Initialize gameState
  for (let i = 0; i < maxGuesses; i++) {
    window.localStorage.setItem(i.toString(), "");
  }
  console.log("Initialized localStorage with default values.");
}

// Add a Guess Input Field
function addGuessInput(
  guessDetails = null,
  isRestored = false,
  guessIndex = null
) {
  const guessInputContainer = document.getElementById("guessInputs");
  if (!guessInputContainer) return;

  // Determine the guessIndex
  if (guessIndex === null) {
    // Assign the next index for new guesses
    guessIndex = currentGuessCount;
  }

  // Create a new input element
  const newInput = document.createElement("input");
  newInput.className = "price-form";
  newInput.type = "number"; // Changed to 'number' for numeric input
  newInput.placeholder = "0.00";
  newInput.id = "guess" + guessIndex;
  newInput.setAttribute("inputmode", "decimal"); // Suggest numeric keypad on mobile

  // Create a new 'Add' button
  const addButton = document.createElement("button");
  addButton.className = "add-button";
  addButton.textContent = "Add";
  addButton.id = "addButton" + guessIndex;

  // Create an error message element
  const errorMessage = document.createElement("div");
  errorMessage.className = "error-message";
  errorMessage.style.color = "red";
  errorMessage.style.fontSize = "0.8em";
  errorMessage.style.display = "none"; // Hidden by default

  if (guessDetails && isRestored) {
    newInput.value = guessDetails.value;
    newInput.style.backgroundColor = guessDetails.color;
    addButton.textContent = guessDetails.buttonText;
    newInput.disabled = true;
    addButton.disabled = true;
    console.log(`Restored guess input ${guessIndex}.`);
  } else {
    setTimeout(() => newInput.focus(), 0);
    console.log(`Added new guess input ${guessIndex}.`);
  }

  addButton.onclick = () => {
    submitGuess(newInput, addButton, errorMessage);
  };

  // Add event listener for 'Enter' key
  newInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter" || event.keyCode === 13) {
      submitGuess(newInput, addButton, errorMessage);
    }
  });

  // Append the newInput, addButton, and errorMessage to the guessInputContainer
  guessInputContainer.appendChild(newInput);
  guessInputContainer.appendChild(addButton);
  guessInputContainer.appendChild(errorMessage);

  // Do NOT increment the guess count here
  // The guess count should only increment after a successful guess submission

  updateGuessCounter(); // Update the display
  console.log("Updated guess counter display.");
}

// Handle Guess Submission
function submitGuess(newInput, addButton, errorMessage) {
  const inputValue = newInput.value.trim();

  // Reset previous error message
  errorMessage.style.display = "none";
  errorMessage.textContent = "";

  if (inputValue === "") {
    errorMessage.textContent = "Please enter a guess before submitting.";
    errorMessage.style.display = "block";
    console.warn("User attempted to submit an empty guess.");
    return; // Do nothing if the input is empty
  }

  const guessValue = parseFloat(inputValue);

  if (isNaN(guessValue)) {
    errorMessage.textContent = "Invalid input. Please enter a valid number.";
    errorMessage.style.display = "block";
    console.warn("User entered an invalid number.");
    return; // Do not process invalid input
  }

  if (guessValue < 0) {
    // Assuming prices can't be negative
    errorMessage.textContent = "Price cannot be negative.";
    errorMessage.style.display = "block";
    console.warn("User entered a negative price.");
    return;
  }

  if (!newInput.disabled) {
    // Increment the guess count first
    currentGuessCount++;
    window.localStorage.setItem(
      "currentGuessCount",
      currentGuessCount.toString()
    );
    console.log(`Incremented guess count to ${currentGuessCount}.`);

    // Update the guess counter immediately
    updateGuessCounter();

    // Now, check the guess
    checkGuess(newInput, errorMessage);

    newInput.disabled = true;
    addButton.disabled = true;
    console.log(
      `Disabled input and button for guess ${currentGuessCount - 1}.`
    );

    // If there are guesses left and the game hasn't ended, add a new input
    if (currentGuessCount < maxGuesses && gameState !== "end") {
      addGuessInput();
    }
  }
}

// Check the User's Guess
function checkGuess(inputElement, errorMessage) {
  const inputValue = inputElement.value.trim();
  const guessValue = parseFloat(inputValue);

  if (isNaN(guessValue)) {
    errorMessage.textContent = "Invalid input. Please enter a valid number.";
    errorMessage.style.display = "block";
    console.warn("User entered an invalid number during guess check.");
    return;
  }

  if (guessValue < 0) {
    // Assuming prices can't be negative
    errorMessage.textContent = "Price cannot be negative.";
    errorMessage.style.display = "block";
    console.warn("User entered a negative price during guess check.");
    return;
  }

  const lowerBound = productPrice * 0.95;
  const upperBound = productPrice * 1.05;
  const lowerBound10 = productPrice * 0.9;
  const upperBound10 = productPrice * 1.1;
  const lowerBound25 = productPrice * 0.75;
  const upperBound25 = productPrice * 1.25;

  let color = "";
  let buttonText = "";

  if (
    guessValue === productPrice ||
    (guessValue >= lowerBound && guessValue <= upperBound)
  ) {
    color = "lightgreen";
    buttonText = "Correct";
    indicateHighLow(inputElement, guessValue, color, buttonText);
    console.log("Correct guess made.");
    endGame(inputElement, true);
  } else if (guessValue >= lowerBound10 && guessValue <= upperBound10) {
    color = "#fbfb70"; // Yellow
    buttonText = guessValue > productPrice ? "↓ DOWN" : "↑ UP";
    indicateHighLow(inputElement, guessValue, color, buttonText);
    console.log(`Guess within 10% range. Suggesting: ${buttonText}`);
  } else if (guessValue >= lowerBound25 && guessValue <= upperBound25) {
    color = "#fed285"; // Orange
    buttonText = guessValue > productPrice ? "↓ DOWN" : "↑ UP";
    indicateHighLow(inputElement, guessValue, color, buttonText);
    console.log(`Guess within 25% range. Suggesting: ${buttonText}`);
  } else {
    color = "#ed6a5b"; // Red
    buttonText = guessValue > productPrice ? "↓ DOWN" : "↑ UP";
    indicateHighLow(inputElement, guessValue, color, buttonText);
    console.log(`Guess outside 25% range. Suggesting: ${buttonText}`);
  }

  if (currentGuessCount >= maxGuesses && gameState !== "end") {
    console.log("All guesses exhausted. Ending game.");
    endGame(null, false);
  }
}

// Indicate Guess Result
function indicateHighLow(inputElement, guessValue, color, buttonText = "") {
  inputElement.style.backgroundColor = color;

  const addButton = inputElement.nextElementSibling;
  const errorMessage = addButton.nextElementSibling; // Assuming the error message follows the button

  if (addButton && addButton.classList.contains("add-button")) {
    if (buttonText === "Correct") {
      addButton.textContent = "Correct!";
    } else if (buttonText !== "") {
      addButton.textContent = buttonText;
    } else {
      addButton.textContent = guessValue > productPrice ? "↓ DOWN" : "↑ UP";
    }

    // Correctly determine the guessKey based on the input's guessIndex
    const guessIndex = parseInt(inputElement.id.replace("guess", ""), 10);
    window.localStorage.setItem(
      guessIndex.toString(),
      JSON.stringify({
        value: inputElement.value,
        color,
        buttonText: addButton.textContent,
      })
    );
    console.log(`Stored guess ${guessIndex} in localStorage.`);
  }
}

// End the Game
function endGame(correctInputElement = null, gameWon = false) {
  console.log(`endGame called with gameWon = ${gameWon}`);

  if (gameState === "end") {
    console.log("Game has already ended. Exiting endGame.");
    return;
  }

  gameState = "end";
  window.localStorage.setItem("gameState", "end");
  console.log("Game state set to end.");

  if (gameWon) {
    console.log("Game won! Recording score.");
    recordScore(currentGuessCount);
  } else {
    console.log("Game lost. No score to record.");
  }

  displayStats();
  console.log("Displayed stats.");

  if (correctInputElement) {
    correctInputElement.style.backgroundColor = "lightgreen";
    console.log("Highlighted correct guess input.");
  }

  // **Begin: Reveal the Product Price**
  // Set 'priceReveal' in localStorage with formatted price
  if (productPrice && !isNaN(productPrice)) {
    const formattedPrice = `£${productPrice.toFixed(2)}`;
    window.localStorage.setItem("priceReveal", formattedPrice);
    console.log(`priceReveal set to ${formattedPrice} in localStorage.`);

    // Update the productPriceElement to display the actual price
    if (productPriceElement) {
      productPriceElement.textContent = formattedPrice;
      console.log(`productPriceElement updated to ${formattedPrice}.`);
    } else {
      console.warn("productPriceElement not found in the DOM.");
    }
  } else {
    console.error("Invalid productPrice:", productPrice);
    if (productPriceElement) {
      productPriceElement.textContent = "£?.??";
      console.log(
        "productPriceElement set to placeholder £?.?? due to invalid productPrice."
      );
    }
  }
  // **End: Reveal the Product Price**

  disableAllInputsAndButtons();
  console.log("All inputs and buttons disabled.");

  // **Debugging Logs**
  console.log(
    `Game Ended. Game Won: ${gameWon}. Price Revealed: £${productPrice.toFixed(
      2
    )}`
  );
}

// Record the User's Score
function recordScore(score) {
  let stats = JSON.parse(localStorage.getItem("gameStats")) || {
    scores: {},
    totalGames: 0,
    totalPoints: 0,
  };

  const pointsMap = { 1: 10, 2: 5, 3: 2, 4: 1 };

  stats.scores[score] = (stats.scores[score] || 0) + 1;
  stats.totalGames += 1;
  stats.totalPoints += pointsMap[score] || 0;

  window.localStorage.setItem("gameStats", JSON.stringify(stats));
  console.log(`Recorded score: ${score}. Updated gameStats.`);
}

// Display Game Statistics
function displayStats() {
  let stats = JSON.parse(localStorage.getItem("gameStats")) || {
    scores: {},
    totalGames: 0,
    totalPoints: 0,
  };

  const xValues = []; // Scores (1, 2, 3, 4)
  const yValues = []; // Number of times each score was achieved

  for (let i = 1; i <= maxGuesses; i++) {
    xValues.push(`Score ${i}`);
    yValues.push(stats.scores[i] || 0);
  }

  // Reverse the data arrays to order the bars correctly
  xValues.reverse();
  yValues.reverse();

  var trace1 = {
    x: yValues,
    y: xValues,
    type: "bar",
    orientation: "h",
    text: yValues.map(String),
    textposition: "auto",
    hoverinfo: "none",
    marker: {
      color: "rgb(158,202,225)",
      opacity: 0.6,
      line: {
        color: "rgb(8,48,107)",
        width: 1.5,
      },
    },
  };

  var data = [trace1];

  var layout = {
    title: "Guess Distribution",
    barmode: "stack",
    width: 224,
    height: 250,
    margin: {
      l: 40,
      r: 10,
      t: 20,
      b: 20,
    },
    font: {
      size: 8,
    },
    xaxis: {
      tickmode: "linear",
      dtick: 1,
    },
    yaxis: {
      tickfont: {
        margin: 20,
      },
    },
    displayModeBar: false,
  };

  // Display total points and games
  const pointsContainer = document.getElementById("pointsContainer");
  if (pointsContainer) {
    pointsContainer.innerHTML = "";
    const totalPointsElement = document.createElement("div");
    totalPointsElement.textContent = `Total Points: ${stats.totalPoints}`;
    pointsContainer.appendChild(totalPointsElement);
    const totalGamesElement = document.createElement("div");
    totalGamesElement.textContent = `Total Games: ${stats.totalGames}`;
    pointsContainer.appendChild(totalGamesElement);
    console.log("Displayed total points and games.");
  }

  // Handle the display of the graph toggle button
  const graphToggleButton = document.getElementById("graphToggleButton");
  const statsContainer = document.getElementById("statsContainer");
  if (statsContainer && graphToggleButton) {
    if (stats.totalGames > 0) {
      graphToggleButton.style.display = "block"; // Show button
      Plotly.newPlot("statsContainer", data, layout, { staticPlot: true });
      console.log("Displayed stats graph.");
    } else {
      graphToggleButton.style.display = "none"; // Hide button and graph
      statsContainer.style.display = "none";
      console.log("No stats to display. Hiding graph.");
    }
  }
}

// Toggle Graph Visibility
function toggleGraphVisibility() {
  const statsContainer = document.getElementById("statsContainer");
  const graphToggleButton = document.getElementById("graphToggleButton");
  if (statsContainer && graphToggleButton) {
    if (
      statsContainer.style.display === "none" ||
      statsContainer.style.display === ""
    ) {
      statsContainer.style.display = "block";
      graphToggleButton.textContent = "-";
      console.log("Graph visibility toggled to visible.");
    } else {
      statsContainer.style.display = "none";
      graphToggleButton.textContent = "+";
      console.log("Graph visibility toggled to hidden.");
    }
  }
}

// Disable All Inputs and Buttons
function disableAllInputsAndButtons() {
  const allInputs = document.querySelectorAll(".price-form");
  allInputs.forEach((input) => (input.disabled = true));
  const allAddButtons = document.querySelectorAll(".add-button");
  allAddButtons.forEach((button) => (button.disabled = true));
  console.log("All inputs and buttons have been disabled.");
}

// Initialize the Game on Page Load
document.addEventListener("DOMContentLoaded", () => {
  // First, handle game state based on the date
  getTodaysProduct().then((product) => {
    const productNameElement = document.getElementById("productName");
    productPriceElement = document.getElementById("productPrice");
    const productImageElement = document.getElementById("productImage");

    if (product) {
      // If product data is available
      if (productNameElement) {
        productNameElement.textContent = product.Product || "Unnamed Product";
        console.log(
          `Product Name set to: ${product.Product || "Unnamed Product"}`
        );
      }
      if (productPriceElement && productPriceElement.textContent.trim() === "") {
        productPriceElement.textContent = "£?.??";
        console.log("Product price placeholder set.");
      }
      if (productImageElement) {
        productImageElement.src = `../static/data/images/${product.Image || "default.png"}`;
        console.log(`Product image set to: ${product.Image || "default.png"}`);
      }
      productPrice = parseFloat(product.Price.replace(/[£,]/g, "")) || 0; // Handle currency symbols and commas
      console.log(`productPrice initialized to: ${productPrice}`);

      if (isNaN(productPrice) || productPrice <= 0) {
        console.error("Invalid product price:", productPrice);
        // Optionally, handle invalid price scenario
      }
    } else {
      // If product data is not available
      console.log("Product not found for today's date");
      if (productNameElement) {
        productNameElement.textContent = "No product available for today";
        console.log('Product name set to "No product available for today".');
      }
      if (productPriceElement) {
        productPriceElement.textContent = "Out of Stock";
        console.log('Product price set to "Out of Stock".');
      }
      if (productImageElement) {
        productImageElement.src = "../static/data/image_unavailable.png";
        console.log('Product image set to "image_unavailable.png".');
      }
    }

    // After setting the product price, check if 'priceReveal' exists to display it
    const priceReveal = window.localStorage.getItem("priceReveal");
    if (priceReveal && productPriceElement) {
      productPriceElement.textContent = priceReveal;
      console.log(`priceReveal found in localStorage and applied: ${priceReveal}`);
    }

    // Now, initialize the game based on the current state
    displayStats();

    // Retrieve and synchronize currentGuessCount from localStorage
    const savedGameState = window.localStorage.getItem("gameState");
    const savedGuessCount = parseInt(
      window.localStorage.getItem("currentGuessCount"),
      10
    );
    currentGuessCount = isNaN(savedGuessCount) ? 0 : savedGuessCount;

    console.log(`Current Guess Count: ${currentGuessCount}`);
    console.log(`Saved Game State: ${savedGameState}`);

    // Restore guesses
    for (let i = 0; i < currentGuessCount; i++) {
      const savedGuess = window.localStorage.getItem(i.toString());
      if (savedGuess) {
        const guessDetails = JSON.parse(savedGuess);
        addGuessInput(guessDetails, true, i); // Pass the correct guessIndex
        console.log(`Restored guess ${i}:`, guessDetails);
      }
    }

    // Add a new input field only if the game hasn't ended and there are guesses left
    if (currentGuessCount < maxGuesses && savedGameState !== "end") {
      addGuessInput();
      console.log("Added a new guess input field.");
    }

    updateGuessCounter();
    console.log("Updated guess counter display.");
  });
});

// DEBUGGING
//(function() {
//  const OriginalDate = Date;
//  const mockedDate = new OriginalDate('2024-09-22T12:00:00'); // Set to a desired past date
// 
//  // Override the Date constructor
//  function MockDate(...args) {
//    if (args.length === 0) {
//      return new OriginalDate(mockedDate);
//    } else {
//      return new OriginalDate(...args);
//    }
//  }
// 
//  MockDate.now = function() {
//    return mockedDate.getTime();
//  };
// 
//  MockDate.parse = OriginalDate.parse;
//  MockDate.UTC = OriginalDate.UTC;
// 
//  // Replace the global Date with MockDate
//  window.Date = MockDate;
// 
//  console.log(`Date object overridden. Current date is set to: ${mockedDate}`);
//})();

