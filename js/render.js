// Tegner en utfoldet kube ("net").
// Layout:
//      [U]
// [L] [F] [R] [B]
//      [D]

const COLOR = {
  W: "#f3f6ff",
  Y: "#ffe066",
  G: "#58d68d",
  B: "#5dade2",
  O: "#ff9f43",
  R: "#ff6b6b",
};

export function drawCubeNet(ctx, faces) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Bakgrunn-ruter
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(0, 0, w, h);

  const size = Math.min(w, h) * 0.14;  // størrelse på en liten sticker
  const gap = size * 0.10;
  const faceSize = size * 3 + gap * 2;

  const originX = (w - faceSize * 4 - gap * 3) / 2; // 4 flater på midtraden
  const originY = (h - faceSize * 3 - gap * 2) / 2; // 3 rader (U + midt + D)

  function drawFace(faceKey, fx, fy, label) {
    const arr = faces[faceKey];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const i = r * 3 + c;
        const x = fx + c * (size + gap);
        const y = fy + r * (size + gap);

        ctx.fillStyle = COLOR[arr[i]] ?? "#999";
        roundRect(ctx, x, y, size, size, Math.max(4, size * 0.18), true, false);

        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.lineWidth = Math.max(1, size * 0.06);
        roundRect(ctx, x, y, size, size, Math.max(4, size * 0.18), false, true);
      }
    }

    // face label
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.font = "700 14px system-ui, sans-serif";
    ctx.fillText(label, fx, fy - 10);
  }

  const Ux = originX + (faceSize + gap) * 1;
  const Uy = originY + (faceSize + gap) * 0;

  const Lx = originX + (faceSize + gap) * 0;
  const Ly = originY + (faceSize + gap) * 1;

  const Fx = originX + (faceSize + gap) * 1;
  const Fy = originY + (faceSize + gap) * 1;

  const Rx = originX + (faceSize + gap) * 2;
  const Ry = originY + (faceSize + gap) * 1;

  const Bx = originX + (faceSize + gap) * 3;
  const By = originY + (faceSize + gap) * 1;

  const Dx = originX + (faceSize + gap) * 1;
  const Dy = originY + (faceSize + gap) * 2;

  drawFace("U", Ux, Uy, "U (Top)");
  drawFace("L", Lx, Ly, "L");
  drawFace("F", Fx, Fy, "F (Front)");
  drawFace("R", Rx, Ry, "R");
  drawFace("B", Bx, By, "B (Back)");
  drawFace("D", Dx, Dy, "D (Bottom)");

  // liten forklaring
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText("Mål: Få hver flate til én farge.", 16, h - 18);
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
