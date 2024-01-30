# TESCOdle

## About 

TESCOdle is an interactive web-based game inspired by wordle and costcodle. In this game, players are challenged with guessing the prices of products from Tesco. The game uses data scraped from Tesco using [tesco-webscraper](https://github.com/wdoyle123/tesco-webscraper.git). The game refreshes once per day offering users a daily guessing game.

<div align=center>
<img src="figures/game.png" alt="game_overview" width="50%"/>
<div align=left>

## Demo

<details>
<summary>Feedback to User Input</summary>
<p>
TESCOdle provides feedback to user input in the form of colours and arrows to aid the user to find the correct product price.
</p>
<div align=center>
<img src="figures/game_overview.png" alt="game_overview" width="50%"/>
<div align=left>
</details>

<details>
<summary>Game Rules</summary>
<p>
TESCOdle provides rules that explain the game to new users.
</p>
<div align=center>
<img src="figures/game_rules.png" alt="game_rules" width="50%"/>
<div align=left>
</details>

<details>
<summary>Score Tracking and Graph</summary>
<p>
TESCOdle keeps track of the users' score and features a graph to show score distributions.
</p>
<div align=center>
<img src="figures/game_score.png" alt="game_score" width="50%"/>
<div align=left>
</details>


## Technical Features

TESCOdle's game functions are written in javascript and uses the users local storage on their browser to keep track of scores.

## Installation

To install TESCOdle on your local machine, follow these steps:

1. Clone the repository:

```
git clone https://github.com/wdoyle123/TESCOdle.git
```

2. Navigate to the cloned repository

```
cd TESCOdle
```

3. Start the local server

```
npm start # or python -m http.server
```

## Licence

See [LICENCE](LICENCE)

## Acknowledgements

- My friend Henry, for suggesting an adaption of Costcodle to suit a British audience.

- Kerm, for his work on [Costcodle](https://github.com/KermWasTaken/costcodle) from which inspired TESCOdle.

- Tesco, for the source of the data.