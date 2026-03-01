import { Cube } from "./cube.js";
import { Renderer3D } from "./renderer3d.js";

const timeEl = document.getElementById("time");
const movesEl = document.getElementById("moves");
const solvedEl = document.getElementById("solved");

const btnScramble = document.getElementById("scramble");
const btnReset = document.getElementById("reset");
const btnCheck = document.getElementById("check");

const viewEl = document.getElementById("view");

const cube = new Cube();
const r3d = new Renderer3D(viewEl);

let moveCount = 0;
let startTime = null;
let timerId = null;

function startTimerIfNeeded() {
  if (startTime !== null) return;
  startTime = Date.now();
  timerId = setInterval(() => {
    timeEl.textContent = formatMs(Date.now() - startTime);
  }, 250);
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function setSolvedUI(isSolved) {
  solvedEl.textContent = isSolved ? "Løst! 🎉" : "Ikke løst";
  solvedEl.classList.toggle("good", isSolved);
  solvedEl.classList.toggle("bad", !isSolved);
}

function render() {
  r3d.updateFaces(cube.faces);
}

function doMove(m) {
  startTimerIfNeeded();
  cube.move(m);
  moveCount++;
  movesEl.textContent = String(moveCount);

  const solved = cube.isSolved();
  setSolvedUI(solved);
  if (solved) stopTimer();

  render();
}

// Klikk på move-knapper
document.querySelectorAll("button[data-move]").forEach(btn => {
  btn.addEventListener("click", () => doMove(btn.dataset.move));
});

// Scramble
btnScramble.addEventListener("click", () => {
  cube.scramble(20);
  moveCount = 0;
  movesEl.textContent = "0";
  startTime = null;
  stopTimer();
  timeEl.textContent = "00:00";
  setSolvedUI(cube.isSolved());
  render();
});

// Reset
btnReset.addEventListener("click", () => {
  cube.reset();
  moveCount = 0;
  movesEl.textContent = "0";
  startTime = null;
  stopTimer();
  timeEl.textContent = "00:00";
  setSolvedUI(true);
  render();
});

// Sjekk
btnCheck.addEventListener("click", () => {
  setSolvedUI(cube.isSolved());
});

// Tastatur: U/D/L/R/F/B, SHIFT = prime (U')
window.addEventListener("keydown", (e) => {
  const k = e.key.toUpperCase();
  const valid = ["U","D","L","R","F","B"];
  if (!valid.includes(k)) return;

  const move = e.shiftKey ? `${k}'` : k;
  doMove(move);
});

// init
setSolvedUI(true);
render();

function formatMs(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}