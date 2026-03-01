import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

const FACE_ORDER = ["R", "L", "U", "D", "F", "B"]; // matcher material-rekkefølge på BoxGeometry

const COLOR = {
  W: "#f3f6ff",
  Y: "#ffe066",
  G: "#58d68d",
  B: "#5dade2",
  O: "#ff9f43",
  R: "#ff6b6b",
};

function makeFaceCanvas(sizePx = 256) {
  const c = document.createElement("canvas");
  c.width = sizePx;
  c.height = sizePx;
  return c;
}

function drawFaceToCanvas(canvas, faceArray) {
  const ctx = canvas.getContext("2d");
  const s = canvas.width;

  ctx.clearRect(0, 0, s, s);

  // bakgrunn
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, s, s);

  const pad = Math.floor(s * 0.08);
  const gap = Math.floor(s * 0.03);
  const tile = Math.floor((s - pad * 2 - gap * 2) / 3);

  // 3x3 stickers
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const i = r * 3 + c;
      const x = pad + c * (tile + gap);
      const y = pad + r * (tile + gap);

      ctx.fillStyle = COLOR[faceArray[i]] ?? "#999";
      roundRect(ctx, x, y, tile, tile, Math.max(8, Math.floor(tile * 0.18)));

      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.lineWidth = Math.max(2, Math.floor(tile * 0.06));
      strokeRoundRect(ctx, x, y, tile, tile, Math.max(8, Math.floor(tile * 0.18)));
    }
  }

  // liten kant
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, s - 3, s - 3);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

function strokeRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.stroke();
}

export class Renderer3D {
  constructor(containerEl) {
    this.container = containerEl;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(2.6, 2.2, 2.8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.container.appendChild(this.renderer.domElement);

    // Lys
    const amb = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(amb);

    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(4, 6, 3);
    this.scene.add(dir);

    // Kontroller
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.rotateSpeed = 0.6;
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 6.0;

    // Face canvases + textures
    this.faceCanvases = {};
    this.faceTextures = {};
    this.materials = [];

    for (const key of FACE_ORDER) {
      const canvas = makeFaceCanvas(256);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;

      this.faceCanvases[key] = canvas;
      this.faceTextures[key] = tex;

      this.materials.push(new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.6,
        metalness: 0.05,
      }));
    }

    // Kube
    const geom = new THREE.BoxGeometry(1.8, 1.8, 1.8);
    this.cubeMesh = new THREE.Mesh(geom, this.materials);
    this.scene.add(this.cubeMesh);

    // Litt “outline” følelse
    const edges = new THREE.EdgesGeometry(geom);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 })
    );
    this.cubeMesh.add(line);

    // Resize + loop
    this.resize();
    window.addEventListener("resize", () => this.resize());

    this._running = true;
    this._tick = this._tick.bind(this);
    requestAnimationFrame(this._tick);
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width));
    const h = Math.max(260, Math.floor(rect.height));

    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  updateFaces(faces) {
    // tegn hver side inn i canvas, oppdater texture
    for (const key of FACE_ORDER) {
      drawFaceToCanvas(this.faceCanvases[key], faces[key]);
      this.faceTextures[key].needsUpdate = true;
    }
  }

  _tick() {
    if (!this._running) return;

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this._tick);
  }

  destroy() {
    this._running = false;
    this.controls.dispose();
    this.renderer.dispose();
  }
}