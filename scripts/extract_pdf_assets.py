from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
PDF = Path(r"C:\Users\LENOVO\Downloads\portfolio\my7\Fazeeh Portfolio.pdf")
ASSET_DIR = ROOT / "public" / "portfolio" / "assets"
DATA_DIR = ROOT / "src" / "data"


def category_for(page_number: int, text: str) -> str:
    lower = text.lower()
    if "menu" in lower:
        return "Menu Card Design"
    if "brochure" in lower:
        return "Brochure Design"
    if "poster" in lower or page_number >= 24:
        return "Social Media Posters"
    if "packaging" in lower or 12 <= page_number <= 16:
        return "Packaging Design"
    if "branding" in lower or 6 <= page_number <= 11:
        return "Branding"
    if "logo" in lower or 4 <= page_number <= 5:
        return "Logo Design"
    return "Branding"


def title_for(page_number: int, text: str, category: str) -> str:
    clean = re.sub(r"\s+", " ", text).strip()
    if "Ren/loaf" in clean or "Loaf" in clean:
        return "Ren/loaf Brand Identity"
    if "Fresh Crunch" in clean or "Perfect Blend" in clean:
        return "Premium Nuts Packaging"
    if "BROCHURE" in clean.upper():
        return "Editorial Brochure System"
    if "MENUCARD" in clean.upper() or "MENU" in clean.upper():
        return "Restaurant Menu Card"
    if "CREATIVE POSTER" in clean.upper():
        return "Creative Poster Series"
    if category == "Logo Design":
        return "Logo Design Studies"
    if category == "Branding":
        return "Brand Identity System"
    return category


def save_image(image: Image.Image, output: Path) -> tuple[int, int]:
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
    image.save(output, "PNG", optimize=True)
    return image.size


def main() -> None:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    reader = PdfReader(str(PDF))
    seen: dict[str, str] = {}
    pages = []

    for page_index, page in enumerate(reader.pages, start=1):
        text = re.sub(r"\s+", " ", page.extract_text() or "").strip()
        category = category_for(page_index, text)
        page_assets = []

        for image_index, image_file in enumerate(page.images, start=1):
            image = image_file.image
            width, height = image.size
            if width < 90 and height < 90:
                continue

            payload = image.tobytes()
            digest = hashlib.sha1(payload + f"{width}x{height}".encode()).hexdigest()[:14]
            filename = seen.get(digest)
            if not filename:
                filename = f"p{page_index:02d}-{image_index:02d}-{digest}.png"
                save_image(image, ASSET_DIR / filename)
                seen[digest] = filename

            page_assets.append(
                {
                    "src": f"/portfolio/assets/{filename}",
                    "width": width,
                    "height": height,
                }
            )

        pages.append(
            {
                "page": page_index,
                "title": title_for(page_index, text, category),
                "category": category,
                "text": text,
                "assets": page_assets,
            }
        )

    all_text = " ".join(page["text"] for page in pages)
    phone = re.search(r"(?:\+?\d[\d\s().-]{7,}\d)", all_text)
    instagram = re.search(r"@?\s*FASEEHUL\s+LISAN", all_text, re.I)

    category_order = [
        "Logo Design",
        "Branding",
        "Packaging Design",
        "Brochure Design",
        "Menu Card Design",
        "Social Media Posters",
    ]
    categories = [
        {"name": name, "pages": [page for page in pages if page["category"] == name and page["assets"]]}
        for name in category_order
    ]

    content = {
        "designer": "Fazeehul Lisan",
        "role": "Graphic Designer",
        "about": "I am a graphic designer specializing in branding and social media design for personal brands. I focus on creating clean, visually strong designs that communicate clearly and leave a lasting impression.",
        "specialties": [
            "Branding Design",
            "Graphic Design",
            "Logo Design",
            "Print Design",
            "Social Media Design",
        ],
        "software": ["Photoshop", "Illustrator", "Premiere Pro", "Lightroom"],
        "process": ["Research", "Strategy", "Concept", "Design", "Delivery"],
        "contact": {
            "phone": phone.group(0).strip() if phone else "+91 9746 408 257",
            "instagram": "@FASEEHUL LISAN" if instagram else "",
        },
        "pages": pages,
        "categories": categories,
    }

    (DATA_DIR / "portfolio.ts").write_text(
        "export const portfolio = "
        + json.dumps(content, indent=2)
        + " as const;\n",
        encoding="utf-8",
    )
    print(f"Extracted {sum(len(p['assets']) for p in pages)} assets from {len(pages)} PDF pages.")


if __name__ == "__main__":
    main()
