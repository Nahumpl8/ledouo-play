// server/punchImage.js
import express from "express";
import { createCanvas, loadImage } from "@napi-rs/canvas";

export const punchRouter = express.Router();

// ⚙️ EDITABLE: Coordenadas (x, y, radio) de cada chef en la imagen
// TODO: Ajustar estos valores mirando la imagen real en un editor
const STAMP_SPOTS = [
  // Fila superior (4 chefs)
  { x: 180, y: 220, r: 62 },  // Chef 1
  { x: 420, y: 220, r: 62 },  // Chef 2
  { x: 660, y: 220, r: 62 },  // Chef 3
  { x: 900, y: 220, r: 62 },  // Chef 4
  // Fila inferior (4 chefs)
  { x: 180, y: 460, r: 62 },  // Chef 5
  { x: 420, y: 460, r: 62 },  // Chef 6
  { x: 660, y: 460, r: 62 },  // Chef 7
  { x: 900, y: 460, r: 62 },  // Chef 8
];

const OPAQUE_URL = "https://i.ibb.co/spTjj1x4/le-Duo-Stamps.png";
const COLOR_URL = "https://i.ibb.co/3YRsZfBC/le-Duo-Stamps-1.png";

async function loadImageFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} al cargar ${url}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return await loadImage(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error(`Error loading image from ${url}:`, err);
    throw new Error(`Failed to load image: ${url}`);
  }
}

punchRouter.get("/punch-image", async (req, res) => {
  try {
    const stamps = Math.max(0, Math.min(STAMP_SPOTS.length, parseInt(req.query.stamps || "0", 10)));

    // Cargar ambas imágenes en paralelo
    const [opaqueImg, colorImg] = await Promise.all([
      loadImageFromUrl(OPAQUE_URL),
      loadImageFromUrl(COLOR_URL),
    ]);

    // Crear canvas del mismo tamaño que las imágenes
    const width = opaqueImg.width;
    const height = opaqueImg.height;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // 1️⃣ Dibujar imagen base (todos opacos)
    ctx.drawImage(opaqueImg, 0, 0);

    // 2️⃣ Revelar N chefs a color usando máscaras circulares
    for (let i = 0; i < stamps; i++) {
      const spot = STAMP_SPOTS[i];
      if (!spot) break;
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(colorImg, 0, 0);
      ctx.restore();
    }

    // 3️⃣ Enviar PNG con cache
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300"); // 5 min
    return res.send(canvas.toBuffer("image/png"));
    
  } catch (err) {
    console.error("punch-image generation error:", err);
    return res.status(500).json({ 
      error: "No se pudo generar la imagen dinámica",
      details: err.message 
    });
  }
});
