import os
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = os.path.join("frontend", "static")

# Exact 1024 geometry spec
CANVAS = 1024
CENTER_X = 512
CENTER_Y = 512
CONTAINER_SIZE = 880
CONTAINER_RADIUS = 220
CONTAINER_LEFT = (CANVAS - CONTAINER_SIZE) // 2  # 72
CONTAINER_TOP = (CANVAS - CONTAINER_SIZE) // 2   # 72
STROKE = 64
TOP_Y = 360
TOP_X1 = 152
TOP_X2 = 872
STEM_X1 = 512
STEM_Y1 = 380
STEM_X2 = 628.430
STEM_Y2 = 927.763


def _scale(value: float, size: int) -> float:
    return value * (size / CANVAS)


def _draw(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)

    # Container
    l = round(_scale(CONTAINER_LEFT, size))
    t = round(_scale(CONTAINER_TOP, size))
    r = round(_scale(CONTAINER_LEFT + CONTAINER_SIZE, size))
    b = round(_scale(CONTAINER_TOP + CONTAINER_SIZE, size))
    rad = round(_scale(CONTAINER_RADIUS, size))
    draw.rounded_rectangle((l, t, r, b), radius=rad, fill=(10, 10, 10, 255))

    # Optional very subtle inner shadow (<10%)
    inner = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    idraw = ImageDraw.Draw(inner)
    idraw.rounded_rectangle((l, t, r, b), radius=rad, outline=(0, 0, 0, 20), width=max(1, round(_scale(4, size))))
    img = Image.alpha_composite(img, inner)

    # T core shape layer
    core = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(core)
    sw = max(1, round(_scale(STROKE, size)))
    cdraw.line(
        (round(_scale(TOP_X1, size)), round(_scale(TOP_Y, size)), round(_scale(TOP_X2, size)), round(_scale(TOP_Y, size))),
        fill=(37, 99, 235, 255),
        width=sw,
    )
    cdraw.line(
        (round(_scale(STEM_X1, size)), round(_scale(STEM_Y1, size)), round(_scale(STEM_X2, size)), round(_scale(STEM_Y2, size))),
        fill=(37, 99, 235, 255),
        width=sw,
    )

    # Tight outer glow: 25% opacity, blur 20px, spread 0
    glow = core.copy()
    gauss = max(1, _scale(20, size))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=gauss))
    rgba = glow.split()
    alpha = rgba[3].point(lambda a: int(a * 0.25))
    glow_colored = Image.new("RGBA", (size, size), (37, 99, 235, 0))
    glow_colored.putalpha(alpha)

    img = Image.alpha_composite(img, glow_colored)
    img = Image.alpha_composite(img, core)
    return img


def _write_svg(path: str) -> None:
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{CANVAS}" height="{CANVAS}" viewBox="0 0 {CANVAS} {CANVAS}">
  <defs>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="20" result="blur"/>
      <feFlood flood-color="#2563EB" flood-opacity="0.25" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="glow"/>
      <feMerge>
        <feMergeNode in="glow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect x="0" y="0" width="{CANVAS}" height="{CANVAS}" fill="#000000"/>
  <rect x="{CONTAINER_LEFT}" y="{CONTAINER_TOP}" width="{CONTAINER_SIZE}" height="{CONTAINER_SIZE}" rx="{CONTAINER_RADIUS}" fill="#0A0A0A"/>
  <g fill="none" stroke="#2563EB" stroke-width="{STROKE}" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)">
    <line x1="{TOP_X1}" y1="{TOP_Y}" x2="{TOP_X2}" y2="{TOP_Y}"/>
    <line x1="{STEM_X1}" y1="{STEM_Y1}" x2="{STEM_X2}" y2="{STEM_Y2}"/>
  </g>
</svg>
"""
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg)


def main() -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    _draw(1024).save(os.path.join(OUTPUT_DIR, "logo-primary-1024.png"), "PNG")
    _draw(512).save(os.path.join(OUTPUT_DIR, "logo-primary-512.png"), "PNG")
    _draw(256).save(os.path.join(OUTPUT_DIR, "logo-primary-256.png"), "PNG")
    _draw(64).save(os.path.join(OUTPUT_DIR, "logo-primary-64.png"), "PNG")

    _draw(64).save(os.path.join(OUTPUT_DIR, "favicon-64.png"), "PNG")
    _draw(64).save(os.path.join(OUTPUT_DIR, "favicon.png"), "PNG")
    _draw(512).save(os.path.join(OUTPUT_DIR, "icon-512.png"), "PNG")
    _draw(256).save(os.path.join(OUTPUT_DIR, "icon-256.png"), "PNG")
    _draw(192).save(os.path.join(OUTPUT_DIR, "icon-192.png"), "PNG")

    _write_svg(os.path.join(OUTPUT_DIR, "logo-primary.svg"))

    print(f"Saved strict branding assets in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
