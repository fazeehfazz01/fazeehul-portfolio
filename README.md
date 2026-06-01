# Fazeehul Lisan Premium Portfolio

Next.js App Router portfolio rebuilt from `Fazeeh Portfolio.pdf` as the source for portfolio content, work categories, assets, contact details, skills, software, and process.

## What Is Included

- Cinematic loading screen and fullscreen hero reveal
- Premium black, white, and red editorial visual system
- Torn-paper effects inspired by the PDF
- About, skills, software, process, and contact sections
- PDF-extracted case-study showcases for logo, branding, packaging, brochure, menu card, and social poster work
- Immersive social poster scrolling showcase
- GSAP scroll animation hooks, Framer Motion transitions, Lenis smooth scroll, Three.js atmosphere, custom cursor, magnetic CTA, and sound-ready event bridge

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Regenerate PDF Assets

The generated assets already live in `public/portfolio/assets` and the structured content lives in `src/data/portfolio.ts`.

To rebuild from the PDF again:

```bash
python scripts/extract_pdf_assets.py
```

The extractor reads:

```text
C:\Users\LENOVO\Downloads\portfolio\my7\Fazeeh Portfolio.pdf
```
