// En enkel 3x3 Rubik's kube-representasjon med 6 flater.
// Indekser: 0..8 på hver flate (radvis).
// Farger (klassisk): U=White, D=Yellow, F=Green, B=Blue, L=Orange, R=Red

export class Cube {
  constructor() {
    this.reset();
  }

  reset() {
    this.faces = {
      U: Array(9).fill("W"),
      D: Array(9).fill("Y"),
      F: Array(9).fill("G"),
      B: Array(9).fill("B"),
      L: Array(9).fill("O"),
      R: Array(9).fill("R"),
    };
  }

  isSolved() {
    for (const k of Object.keys(this.faces)) {
      const f = this.faces[k];
      if (!f.every(v => v === f[0])) return false;
    }
    return true;
  }

  // Rotér en flate 90° med klokka
  rotateFaceCW(faceKey) {
    const f = this.faces[faceKey];
    this.faces[faceKey] = [f[6], f[3], f[0], f[7], f[4], f[1], f[8], f[5], f[2]];
  }

  // Flytt 3-lister i en 4-syklus
  cycle4(a, b, c, d) {
    const tmp = a.idx.map(i => this.faces[a.face][i]);

    for (let j = 0; j < 3; j++) this.faces[a.face][a.idx[j]] = this.faces[d.face][d.idx[j]];
    for (let j = 0; j < 3; j++) this.faces[d.face][d.idx[j]] = this.faces[c.face][c.idx[j]];
    for (let j = 0; j < 3; j++) this.faces[c.face][c.idx[j]] = this.faces[b.face][b.idx[j]];
    for (let j = 0; j < 3; j++) this.faces[b.face][b.idx[j]] = tmp[j];
  }

  // moveString f.eks "U" eller "R'"
  move(moveString) {
    const m = moveString.trim();
    if (!m) return;

    const prime = m.endsWith("'");
    const base = prime ? m.slice(0, -1) : m;

    // normal: 1x, prime: 3x (motsatt retning)
    const times = prime ? 3 : 1;
    for (let t = 0; t < times; t++) this._moveBase(base);
  }

  _moveBase(base) {
    switch (base) {
      case "U":
        this.rotateFaceCW("U");
        this.cycle4(
          { face: "F", idx: [0, 1, 2] },
          { face: "R", idx: [0, 1, 2] },
          { face: "B", idx: [0, 1, 2] },
          { face: "L", idx: [0, 1, 2] },
        );
        break;

      case "D":
        this.rotateFaceCW("D");
        this.cycle4(
          { face: "F", idx: [6, 7, 8] },
          { face: "L", idx: [6, 7, 8] },
          { face: "B", idx: [6, 7, 8] },
          { face: "R", idx: [6, 7, 8] },
        );
        break;

      case "L":
        this.rotateFaceCW("L");
        this.cycle4(
          { face: "U", idx: [0, 3, 6] },
          { face: "F", idx: [0, 3, 6] },
          { face: "D", idx: [0, 3, 6] },
          { face: "B", idx: [8, 5, 2] }, // speil
        );
        break;

      case "R":
        this.rotateFaceCW("R");
        this.cycle4(
          { face: "U", idx: [2, 5, 8] },
          { face: "B", idx: [6, 3, 0] }, // speil
          { face: "D", idx: [2, 5, 8] },
          { face: "F", idx: [2, 5, 8] },
        );
        break;

      case "F":
        this.rotateFaceCW("F");
        this.cycle4(
          { face: "U", idx: [6, 7, 8] },
          { face: "R", idx: [0, 3, 6] },
          { face: "D", idx: [2, 1, 0] }, // revers
          { face: "L", idx: [8, 5, 2] }, // revers
        );
        break;

      case "B":
        this.rotateFaceCW("B");
        this.cycle4(
          { face: "U", idx: [2, 1, 0] }, // revers
          { face: "L", idx: [0, 3, 6] },
          { face: "D", idx: [6, 7, 8] },
          { face: "R", idx: [8, 5, 2] }, // revers
        );
        break;

      default:
        break;
    }
  }

  scramble(steps = 20) {
    const moves = ["U", "D", "L", "R", "F", "B"];
    let last = null;

    for (let i = 0; i < steps; i++) {
      // liten forbedring: unngå å gjøre samme trekk 2 ganger på rad
      let base = moves[Math.floor(Math.random() * moves.length)];
      if (base === last) {
        base = moves[Math.floor(Math.random() * moves.length)];
      }
      last = base;

      const prime = Math.random() < 0.5 ? "'" : "";
      this.move(base + prime);
    }
  }
}