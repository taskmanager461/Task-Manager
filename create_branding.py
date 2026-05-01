import os
from PIL import Image, ImageDraw, ImageFilter

PUBLIC_ASSETS_DIR = os.path.join("frontend", "public", "assets")
STATIC_DIR = os.path.join("frontend", "static")


def _draw_t_logo(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    scale = size / 256.0

    neon = (10, 123, 255, 255)
    stroke = max(2, round(8 * scale))

    core = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(core)

    # Top pill stroke
    top_box = (
        round(54 * scale),
        round(44 * scale),
        round(204 * scale),
        round(88 * scale),
    )
    top_radius = round(22 * scale)
    draw.rounded_rectangle(top_box, radius=top_radius, outline=neon, width=stroke)

    # Stem stroke: straight rounded rectangle, rotated to the right
    stem = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(stem)
    stem_box = (
        round(104 * scale),
        round(88 * scale),
        round(144 * scale),
        round(188 * scale),
    )
    stem_radius = round(20 * scale)
    sdraw.rounded_rectangle(stem_box, radius=stem_radius, outline=neon, width=stroke)
    stem = stem.rotate(12, resample=Image.Resampling.BICUBIC, center=(round(122 * scale), round(92 * scale)))
    core = Image.alpha_composite(core, stem)
    draw = ImageDraw.Draw(core)

    # Critical middle junction where lines merge and change side
    # This creates the visible "switch" at the center (as in reference).
    junction_pts = [
        (114, 95), (112, 88), (116, 83), (126, 79), (142, 78), (160, 79)
    ]
    junction_scaled = [(round(x * scale), round(y * scale)) for x, y in junction_pts]
    draw.line(junction_scaled, fill=neon, width=stroke, joint="curve")

    # Short return curve to blend into top bar lower edge
    blend_pts = [
        (140, 82), (136, 87), (130, 91), (122, 94)
    ]
    blend_scaled = [(round(x * scale), round(y * scale)) for x, y in blend_pts]
    draw.line(blend_scaled, fill=neon, width=max(2, round(stroke * 0.92)), joint="curve")

    # Tight controlled glow
    glow_soft = core.filter(ImageFilter.GaussianBlur(radius=max(1, round(4 * scale))))
    glow_hard = core.filter(ImageFilter.GaussianBlur(radius=max(1, round(2 * scale))))
    blue_soft = Image.new("RGBA", (size, size), (10, 123, 255, 0))
    alpha_soft = glow_soft.split()[3].point(lambda a: int(a * 0.32))
    blue_soft.putalpha(alpha_soft)
    blue_hard = Image.new("RGBA", (size, size), (10, 123, 255, 0))
    alpha_hard = glow_hard.split()[3].point(lambda a: int(a * 0.24))
    blue_hard.putalpha(alpha_hard)

    img = Image.alpha_composite(img, blue_soft)
    img = Image.alpha_composite(img, blue_hard)
    img = Image.alpha_composite(img, core)
    return img


def _write_svg(path: str) -> None:
    svg = """<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 256 256">
  <defs>
    <filter id="g1" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b"/>
      <feFlood flood-color="#0A7BFF" flood-opacity="0.32" result="c"/>
      <feComposite in="c" in2="b" operator="in" result="g"/>
      <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect x="0" y="0" width="256" height="256" fill="#000"/>
  <g fill="none" stroke="#0A7BFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" filter="url(#g1)">
    <rect x="54" y="44" width="150" height="44" rx="22"/>
    <rect x="104" y="88" width="40" height="100" rx="20" transform="rotate(12 122 92)"/>
    <path d="M116 93C114 87 118 82 128 79C142 78 156 79 156 79"/>
    <path d="M134 82C131 86 126 89 120 91"/>
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
