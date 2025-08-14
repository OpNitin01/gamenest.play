//Defining Variables
let navdetails = document.getElementsByTagName('a')
let buttons = document.getElementsByTagName('button')
let tttGame = document.getElementsByClassName('ttt')
let typerGame = document.getElementsByClassName('typer')
let catcherGame = document.getElementsByClassName('catcher')
let clickingGame = document.getElementsByClassName('clicking')
let snakesGame = document.getElementsByClassName('snakes')
let shootGame = document.getElementsByClassName('shoot')


//Give alert when aomeone clicked on "a" & "Buttons"
for (let i = 0; i < navdetails.length; i++) {
  navdetails[i].addEventListener('click', () => {
    alert("Oops! These features aren't available right now. We're working on updates—please check back soon!");
  });
}

for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', () => {
    alert("Oops! These features aren't available right now. We're working on updates—please check back soon!");
  });
}


//Reacting on clicking on a game

for (let i = 0; i < tttGame.length; i++) {
  tttGame[i].addEventListener('click', () => {
    window.location.href = 'Tic-Tac-Toe/TicTacToe.html';
  });
}

for (let i = 0; i < typerGame.length; i++) {
  typerGame[i].addEventListener('click', () => {
    window.location.href = 'Typing-Speed/TypeRacerPro.html';
  });
}

for (let i = 0; i < catcherGame.length; i++) {
  catcherGame[i].addEventListener('click', () => {
    window.location.href = 'Neon-Catcher/CatchingObjects.html';
  });
}

for (let i = 0; i < clickingGame.length; i++) {
  clickingGame[i].addEventListener('click', () => {
    window.location.href = 'Clicking/ClickingTarget.html';
  });
}

for (let i = 0; i < snakesGame.length; i++) {
  snakesGame[i].addEventListener('click', () => {
    window.location.href = 'Snakes/Snakes.html';
  });
}

for (let i = 0; i < shootGame.length; i++) {
  shootGame[i].addEventListener('click', () => {
    window.location.href = 'ShootOut/ShootOut.html';
  });
}