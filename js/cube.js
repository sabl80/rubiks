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

  cloneFaces() {
    const out = {};
    for (const k of Object.keys(this.faces)) out[k] = this.faces[k].slice();
    return out;
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
    // 0 1 2     6 3 0
    // 3 4 5 --> 7 4 1
    // 6 7 8     8 5 2
    this.faces[faceKey] = [f[6], f[3], f[0], f[7], f[4], f[1], f[8], f[5], f[2]];
  }

  // Rotér en flate 90° mot klokka (3x CW)
  rotateFaceCCW(faceKey) {
    this.rotateFaceCW(faceKey);
    this.rotateFaceCW(faceKey);
    this.rotateFaceCW(faceKey);
  }

  // Hjelper: flytt 3-lister i en 4-syklus
  cycle4(a, b, c, d) {
    // a,b,c,d: arrays med {face, idx[]} (idx er 3 posisjoner)
    const tmp = a.idx.map(i => this.faces[a.face][i]);
    for (let j = 0; j < 3; j++) this.faces[a.face][a.idx[j]] = this.faces[d.face][d.idx[j]];
    for (let j = 0; j < 3; j++) this.faces[d.face][d.idx[j]] = this.faces[c.face][c.idx[j]];
    for (let j = 0; j < 3; j++) this.faces[c.face][c.idx[j]] = this.faces[b.face][b.idx[j]];
    for (let j = 0; j < 3; j++) this.faces[b.face][b.idx[j]] = tmp[j];
  }

  // Standard trekk (Singmaster). moveString f.eks "U" eller "R'"
  move(moveString) {
    const m = moveString.trim();
    if (!m) return;

    const prime = m.endsWith("'");
    const base = prime ? m.slice(0, -1) : m;

    // Gjør 1 gang for normal, 3 ganger for prime (motsatt)
    const times = prime ? 3 : 1;
    for (let t = 0; t < times; t++) this._moveBase(base);
  }

  _moveBase(base) {
    switch (base) {
      case "U":
        this.rotateFaceCW("U");
        // U påvirker topp-raden på F,R,B,L
        this.cycle4(
          { face: "F", idx: [0,1,2] },
          { face: "R", idx: [0,1,2] },
          { face: "B", idx: [0,1,2] },
          { face: "L", idx: [0,1,2] },
        );
        break;

      case "D":
        this.rotateFaceCW("D");
        // D påvirker bunn-raden på F,L,B,R (merk rekkefølge)
        this.cycle4(
          { face: "F", idx: [6,7,8] },
          { face: "L", idx: [6,7,8] },
          { face: "B", idx: [6,7,8] },
          { face: "R", idx: [6,7,8] },
        );
        break;

      case "L":
        this.rotateFaceCW("L");
        // L påvirker venstre kolonne: U,F,D,B (B er speilvendt)
        this.cycle4(
          { face: "U", idx: [0,3,6] },
          { face: "F", idx: [0,3,6] },
          { face: "D", idx: [0,3,6] },
          { face: "B", idx: [8,5,2] },
        );
        break;

      case "R":
        this.rotateFaceCW("R");
        // R påvirker høyre kolonne: U,B,D,F (B speil)
        this.cycle4(
          { face: "U", idx: [2,5,8] },
          { face: "B", idx: [6,3,0] },
          { face: "D", idx: [2,5,8] },
          { face: "F", idx: [2,5,8] },
        );
        break;

      case "F":
        this.rotateFaceCW("F");
        // F påvirker: U bunn-rad, R venstre kol, D topp-rad, L høyre kol
        this.cycle4(
          { face: "U", idx: [6,7,8] },
          { face: "R", idx: [0,3,6] },
          { face: "D", idx: [2,1,0] }, // revers
          { face: "L", idx: [8,5,2] }, // revers
        );
        break;

      case "B":
        this.rotateFaceCW("B");
        // B påvirker: U topp-rad, L venstre kol, D bunn-rad, R høyre kol
        this.cycle4(
          { face: "U", idx: [2,1,0] }, // revers
          { face: "L", idx: [0,3,6] },
          { face: "D", idx: [6,7,8] },
          { face: "R", idx: [8,5,2] }, // revers
        );
        break;

      default:
        // Ignorer ukjent input
        break;
    }
  }

  scramble(steps = 20) {
    const moves = ["U","D","L","R","F","B"];
    for (let i = 0; i < steps; i++) {
      const base = moves[Math.floor(Math.random() * moves.length)];
      const prime = Math.random() < 0.5 ? "'" : "";
      this.move(base + prime);
    }
  }
}
