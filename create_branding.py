import os
from PIL import Image, ImageDraw, ImageFilter

PUBLIC_ASSETS_DIR = os.path.join("frontend", "public", "assets")
STATIC_DIR = os.path.join("frontend", "static")


def _draw_t_logo(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    scale = size / 256.0

    neon = (0, 150, 255, 255)
    stroke = max(2, round(10 * scale))

    core = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(core)

    # Top horizontal bar
    top_box = (
        round(40 * scale),
        round(30 * scale),
        round(216 * scale),
        round(90 * scale),
    )
    top_radius = round(30 * scale)
    draw.rounded_rectangle(top_box, radius=top_radius, outline=neon, width=stroke)

    # Vertical stem
    stem_box = (
        round(100 * scale),
        round(80 * scale),
        round(156 * scale),
        round(226 * scale),
    )
    stem_radius = round(28 * scale)
    draw.rounded_rectangle(stem_box, radius=stem_radius, outline=neon, width=stroke)

    # Glow effect
    glow_soft = core.filter(ImageFilter.GaussianBlur(radius=max(1, round(6 * scale))))
    glow_hard = core.filter(ImageFilter.GaussianBlur(radius=max(1, round(3 * scale))))
    blue_soft = Image.new("RGBA", (size, size), (0, 150, 255, 0))
    alpha_soft = glow_soft.split()[3].point(lambda a: int(a * 0.4))
    blue_soft.putalpha(alpha_soft)
    blue_hard = Image.new("RGBA", (size, size), (0, 150, 255, 0))
    alpha_hard = glow_hard.split()[3].point(lambda a: int(a * 0.3))
    blue_hard.putalpha(alpha_hard)

    img = Image.alpha_composite(img, blue_soft)
    img = Image.alpha_composite(img, blue_hard)
    img = Image.alpha_composite(img, core)
    return img


def _write_svg(path: str) -> None:
    svg = """<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 256 256">
  <defs>
    <filter id="g1" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="b"/>
      <feFlood flood-color="#0096FF" flood-opacity="0.4" result="c"/>
      <feComposite in="c" in2="b" operator="in" result="g"/>
      <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect x="0" y="0" width="256" height="256" fill="#000"/>
  <g fill="none" stroke="#0096FF" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" filter="url(#g1)">
    <rect x="40" y="30" width="176" height="60" rx="30"/>
    <rect x="100" y="80" width="56" height="146" rx="28"/>
  </g>
</svg>
"""
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg)


def main() -> None:
    os.makedirs(PUBLIC_ASSETS_DIR, exist_ok=True)
    os.makedirs(STATIC_DIR, exist_ok=True)

    _draw_t_logo(1024).save(os.path.join(PUBLIC_ASSETS_DIR, "logo.png"), "PNG")
    _draw_t_logo(512).save(os.path.join(PUBLIC_ASSETS_DIR, "logo-512.png"), "PNG")
    _draw_t_logo(256).save(os.path.join(PUBLIC_ASSETS_DIR, "logo-256.png"), "PNG")
    _draw_t_logo(64).save(os.path.join(PUBLIC_ASSETS_DIR, "logo-64.png"), "PNG")
    _write_svg(os.path.join(PUBLIC_ASSETS_DIR, "logo.svg"))

    _draw_t_logo(64).save(os.path.join(STATIC_DIR, "favicon.png"), "PNG")
    _draw_t_logo(192).save(os.path.join(STATIC_DIR, "icon-192.png"), "PNG")
    _draw_t_logo(512).save(os.path.join(STATIC_DIR, "icon-512.png"), "PNG")

    print("Generated logo set in frontend/public/assets and frontend/static")


if __name__ == "__main__":
    main()
