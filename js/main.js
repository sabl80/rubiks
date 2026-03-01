import { Cube } from "./cube.js";
import { drawCubeNet } from "./render.js";

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const timeEl = document.getElementById("time");
const movesEl = document.getElementById("moves");
const solvedEl = document.getElementById("solved");

const btnScramble = document.getElementById("scramble");
const btnReset = document.getElementById("reset");
const btnCheck = document.getElementById("check");

const cube = new Cube();

let moveCount = 0;
let startTime = null;
let timerId = null;

/**
 * Matcher canvas sin interne pixelstørrelse til CSS-størrelsen
 * så tegningen blir skarp og alltid passer.
 */
function resizeCanvasToCssSize() {
  const rect = canvas.getBoundingClientRect();

  // CSS bestemmer "visuell" størrelse. Her setter vi faktiske piksler.
  // devicePixelRatio gjør det skarpere på mobil/retina.
  const dpr = window.devicePixelRatio || 1;

  const cssW = Math.max(320, Math.floor(rect.width));
  const cssH = Math.max(260, Math.floor(rect.height));

  const pxW = Math.floor(cssW * dpr);
  const pxH = Math.floor(cssH * dpr);

  if (canvas.width !== pxW) canvas.width = pxW;
  if (canvas.height !== pxH) canvas.height = pxH;

  // Viktig: skaler koordinatsystemet tilbake til CSS-piksler
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

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
  resizeCanvasToCssSize();
  drawCubeNet(ctx, cube.faces);
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

// Re-render ved resize (mobil/PC)
window.addEventListener("resize", () => render());

// init
setSolvedUI(true);
render();

function formatMs(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}