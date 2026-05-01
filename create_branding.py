import os
from PIL import Image, ImageDraw, ImageFilter


OUTPUT_DIR = os.path.join("frontend", "static")
BASE_STROKE = 3.4


def _p(scale: float, x: float, y: float) -> tuple[int, int]:
    return (round(x * scale), round(y * scale))


def _draw_logo(size: int, stroke_multiplier: float = 1.0) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    scale = size / 100

    # Container
    container = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(container)
    box = (round(10 * scale), round(10 * scale), round(90 * scale), round(90 * scale))
    radius = round(20 * scale)
    cdraw.rounded_rectangle(box, radius=radius, fill=(10, 10, 10, 255))
    cdraw.rounded_rectangle(box, radius=radius, outline=(31, 41, 55, 90), width=max(1, round(1 * scale)))
    img = Image.alpha_composite(img, container)

    # T strokes
    stroke = max(2, round(BASE_STROKE * stroke_multiplier * scale))
    core = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(core)

    top_bbox = (round(18 * scale), round(23 * scale), round(82 * scale), round(43 * scale))
    top_radius = round(10 * scale)
    draw.rounded_rectangle(top_bbox, radius=top_radius, outline=(37, 99, 235, 255), width=stroke)

    # Main stem with smooth blending at the intersection
    stem = [
        (50, 43), (44, 44), (40, 48), (38, 54),
        (34, 77), (33, 84), (37, 89), (43, 89),
        (46, 89), (52, 89), (56, 85), (58, 79),
        (64, 55), (65, 49), (62, 44), (56, 43),
    ]
    draw.line([_p(scale, x, y) for x, y in stem], fill=(37, 99, 235, 255), width=stroke, joint="curve")

    connector = [(46, 45), (46, 40), (50, 37), (56, 36), (63, 35)]
    draw.line([_p(scale, x, y) for x, y in connector], fill=(37, 99, 235, 255), width=stroke, joint="curve")

    # Subtle glow (20-30% feel)
    glow_soft = core.filter(ImageFilter.GaussianBlur(radius=max(1, round(2.0 * scale))))
    glow_hard = core.filter(ImageFilter.GaussianBlur(radius=max(1, round(0.7 * scale))))
    img = Image.alpha_composite(img, glow_soft)
    img = Image.alpha_composite(img, glow_hard)
    img = Image.alpha_composite(img, core)

    # Inner highlight
    hi = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    hdraw = ImageDraw.Draw(hi)
    hdraw.rounded_rectangle(
        (round(22 * scale), round(26 * scale), round(76 * scale), round(33 * scale)),
        radius=max(2, round(4 * scale)),
        outline=(219, 234, 254, 90),
        width=max(1, round(0.8 * scale)),
    )
    img = Image.alpha_composite(img, hi)
    return img


def _write_svg(file_path: str) -> None:
    svg = """<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 100 100">
  <defs>
    <filter id="glow-soft" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="2.0"/>
    </filter>
    <filter id="glow-core" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="0.7"/>
    </filter>
  </defs>
  <rect x="10" y="10" width="80" height="80" rx="20" fill="#0A0A0A"/>
  <rect x="10" y="10" width="80" height="80" rx="20" fill="none" stroke="rgba(31,41,55,0.35)" stroke-width="1"/>
  <rect x="18" y="23" width="64" height="20" rx="10" fill="none" stroke="#2563EB" stroke-width="3.4"/>
  <path d="M50 43C44 44 40 48 38 54L34 77C33 84 37 89 43 89H46C52 89 56 85 58 79L64 55C65 49 62 44 56 43Z" fill="none" stroke="#2563EB" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M46 45C46 40 50 37 56 36L63 35" fill="none" stroke="#2563EB" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
"""
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(svg)


def main() -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Primary exports
    _draw_logo(1024, stroke_multiplier=1.0).save(os.path.join(OUTPUT_DIR, "logo-primary-1024.png"), "PNG")
    _write_svg(os.path.join(OUTPUT_DIR, "logo-primary.svg"))

    # Favicon 64x64
    _draw_logo(64, stroke_multiplier=1.0).save(os.path.join(OUTPUT_DIR, "favicon-64.png"), "PNG")
    _draw_logo(64, stroke_multiplier=1.0).save(os.path.join(OUTPUT_DIR, "favicon.png"), "PNG")

    # App icon set with slightly thicker strokes
    _draw_logo(192, stroke_multiplier=1.14).save(os.path.join(OUTPUT_DIR, "icon-192.png"), "PNG")
    _draw_logo(512, stroke_multiplier=1.14).save(os.path.join(OUTPUT_DIR, "icon-512.png"), "PNG")

    print(f"Saved branding assets in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
