const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const logEl = document.getElementById('log');
const modePVE = document.getElementById('mode-pve');
const modePVP = document.getElementById('mode-pvp');

let board = Array(9).fill('');
let currentPlayer = 'X';
let gameOver = false;
let moveCount = 1;
let mode = null; // 'PVE' or 'PVP'

const winningCombos = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

modePVE.addEventListener('click', () => {
  mode = 'PVE';
  resetGame();
});

modePVP.addEventListener('click', () => {
  mode = 'PVP';
  resetGame();
});

function renderBoard() {
  boardEl.innerHTML = '';
  board.forEach((cell, i) => {
    const cellEl = document.createElement('div');
    cellEl.classList.add('cell');
    cellEl.textContent = cell;
    cellEl.addEventListener('click', () => handleClick(i));
    boardEl.appendChild(cellEl);
  });
  if (!gameOver) {
    statusEl.textContent = `Player ${currentPlayer}'s turn (${mode})`;
  }
}

function handleClick(index) {
  if (board[index] !== '' || gameOver) return;
  if (mode === 'PVE' && currentPlayer !== 'X') return;

  makeMove(index, currentPlayer);

  if (!gameOver && mode === 'PVE' && currentPlayer === 'O') {
    setTimeout(aiMove, 300);
  }
}

function makeMove(index, player) {
  board[index] = player;
  log(`Move ${moveCount++}: ${player} to cell ${index + 1}`);
  renderBoard();

  if (checkWin(player)) {
    statusEl.textContent = `Player ${player} wins!`;
    gameOver = true;
  } else if (board.every(cell => cell !== '')) {
    statusEl.textContent = "It's a draw!";
    gameOver = true;
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  }
}

function aiMove() {
  if (gameOver) return;
  const bestMove = getBestMove(board, 'O');
  makeMove(bestMove.index, 'O');
}

function getBestMove(newBoard, player) {
  const huPlayer = 'X';
  const aiPlayer = 'O';

  const availSpots = newBoard
    .map((val, idx) => val === '' ? idx : null)
    .filter(x => x !== null);

  if (checkWinner(newBoard, huPlayer)) return { score: -10 };
  if (checkWinner(newBoard, aiPlayer)) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = availSpots[i];
    newBoard[move.index] = player;

    const result = getBestMove(newBoard, player === aiPlayer ? huPlayer : aiPlayer);
    move.score = result.score;

    newBoard[move.index] = '';
    moves.push(move);
  }

  let bestMove;
  if (player === aiPlayer) {
    let bestScore = -Infinity;
    for (let m of moves) {
      if (m.score > bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let m of moves) {
      if (m.score < bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    }
  }

  return bestMove;
}

function checkWin(player) {
  return winningCombos.some(combo =>
    combo.every(i => board[i] === player)
  );
}

function checkWinner(brd, player) {
  return winningCombos.some(combo =>
    combo.every(i => brd[i] === player)
  );
}

function log(message) {
  const li = document.createElement('li');
  li.textContent = message;
  logEl.appendChild(li);
}

function resetGame() {
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameOver = false;
  moveCount = 1;
  logEl.innerHTML = '';
  renderBoard();
}

restartBtn.addEventListener('click', resetGame);
