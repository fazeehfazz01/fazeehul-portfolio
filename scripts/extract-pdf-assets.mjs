import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pdfPath =
  process.argv[2] ||
  "C:\\Users\\LENOVO\\Downloads\\portfolio\\my7\\Fazeeh Portfolio.pdf";
const publicDir = path.join(root, "public");
const assetDir = path.join(publicDir, "portfolio");
const dataDir = path.join(root, "src", "data");
const runtimeNodeModules =
  process.env.NODE_PATH ||
  "C:\\Users\\LENOVO\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules";

const pdfJsPath = path.join(runtimeNodeModules, "pdfjs-dist", "build", "pdf.mjs");
const pdfWorkerPath = path.join(runtimeNodeModules, "pdfjs-dist", "build", "pdf.worker.mjs");

await fs.mkdir(assetDir, { recursive: true });
await fs.mkdir(dataDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1800, height: 2400 }, deviceScaleFactor: 1 });

const html = `<!doctype html>
<meta charset="utf-8" />
<style>
  html, body { margin: 0; background: #050505; color: white; font-family: sans-serif; }
  canvas { display: block; margin: 0; background: white; }
</style>
<canvas id="canvas"></canvas>
<script type="module">
  import * as pdfjsLib from "${pathToFileURL(pdfJsPath).href}";
  pdfjsLib.GlobalWorkerOptions.workerSrc = "${pathToFileURL(pdfWorkerPath).href}";
  const data = new Uint8Array(await (await fetch("${pathToFileURL(pdfPath).href}")).arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  window.__portfolioPdf = pdf;
  window.__pageText = async (pageNumber) => {
    const p = await pdf.getPage(pageNumber);
    const text = await p.getTextContent();
    return text.items.map((item) => item.str).join(" ").replace(/\\s+/g, " ").trim();
  };
  window.__renderPage = async (pageNumber) => {
    const p = await pdf.getPage(pageNumber);
    const viewport = p.getViewport({ scale: 2.25 });
    const canvas = document.getElementById("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";
    await p.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    return { width: canvas.width, height: canvas.height, dataUrl: canvas.toDataURL("image/png") };
  };
  window.__pageCount = pdf.numPages;
</script>`;

await page.setContent(html, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__pageCount > 0);
const pageCount = await page.evaluate(() => window.__pageCount);

const rawPages = [];
for (let i = 1; i <= pageCount; i += 1) {
  const [rendered, text] = await Promise.all([
    page.evaluate((pageNumber) => window.__renderPage(pageNumber), i),
    page.evaluate((pageNumber) => window.__pageText(pageNumber), i),
  ]);
  const png = Buffer.from(rendered.dataUrl.split(",")[1], "base64");
  const filename = `page-${String(i).padStart(2, "0")}.png`;
  await fs.writeFile(path.join(assetDir, filename), png);
  rawPages.push({
    page: i,
    src: `/portfolio/${filename}`,
    width: rendered.width,
    height: rendered.height,
    text,
  });
}

await browser.close();

const keywords = [
  ["Packaging Design", ["packaging", "package", "label", "box"]],
  ["Brochure Design", ["brochure", "flyer", "leaflet", "print"]],
  ["Menu Card Design", ["menu", "restaurant", "card"]],
  ["Social Media Posters", ["social", "poster", "instagram", "feed"]],
  ["Logo Design", ["logo", "mark", "identity"]],
  ["Branding", ["branding", "brand", "visual identity", "stationery"]],
];

function categoryFor(page) {
  const text = page.text.toLowerCase();
  const found = keywords.find(([, words]) => words.some((word) => text.includes(word)));
  if (found) return found[0];
  if (page.page <= 3) return "Branding";
  if (page.page <= 6) return "Logo Design";
  if (page.page <= 8) return "Packaging Design";
  if (page.page <= 10) return "Brochure Design";
  if (page.page <= 12) return "Menu Card Design";
  return "Social Media Posters";
}

const categoryOrder = [
  "Logo Design",
  "Branding",
  "Packaging Design",
  "Brochure Design",
  "Menu Card Design",
  "Social Media Posters",
];

const pages = rawPages.map((page) => ({ ...page, category: categoryFor(page) }));
const categories = categoryOrder.map((name) => ({
  name,
  pages: pages.filter((page) => page.category === name),
}));

const allText = pages.map((page) => page.text).join(" ");
const email = allText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/i)?.[0] || "";
const phone = allText.match(/(?:\\+?\\d[\\d\\s().-]{7,}\\d)/)?.[0]?.trim() || "";
const instagram = allText.match(/(?:@|instagram\\s*[:/ ]+)([a-z0-9._]{3,})/i)?.[1] || "";

const content = {
  designer: "Fazeehul Lisan",
  role: "Graphic Designer",
  specialties: [
    "Branding Design",
    "Graphic Design",
    "Logo Design",
    "Print Design",
    "Social Media Design",
  ],
  software: ["Photoshop", "Illustrator", "Premiere Pro", "Lightroom"],
  contact: { email, phone, instagram },
  pages,
  categories,
};

await fs.writeFile(
  path.join(dataDir, "portfolio.ts"),
  `export const portfolio = ${JSON.stringify(content, null, 2)} as const;\n`,
);

console.log(`Extracted ${pageCount} portfolio pages to ${assetDir}`);
