import os
from PIL import Image, ImageDraw, ImageFilter

def create_icon(size: int, filename: str) -> None:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    scale = size / 100

    core = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(core)

    stroke = max(2, round(4.6 * scale))

    # Top capsule (close to reference)
    top_bbox = (
        round(16 * scale),
        round(13 * scale),
        round(84 * scale),
        round(43 * scale),
    )
    radius = max(4, round(15 * scale))
    draw.rounded_rectangle(top_bbox, radius=radius, outline=(9, 135, 255, 255), width=stroke)

    # Angled stem
    stem_w = max(8, round(20 * scale))
    stem_h = max(16, round(50 * scale))
    stem_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    stem_draw = ImageDraw.Draw(stem_layer)
    stem_box = (
        round(41 * scale),
        round(41 * scale),
        round(41 * scale) + stem_w,
        round(41 * scale) + stem_h,
    )
    stem_draw.rounded_rectangle(stem_box, radius=max(5, round(9 * scale)), outline=(9, 135, 255, 255), width=stroke)
    stem_layer = stem_layer.rotate(12, resample=Image.Resampling.BICUBIC, center=(round(50 * scale), round(44 * scale)))
    core = Image.alpha_composite(core, stem_layer)

    # Soft inner highlight
    hi = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    hi_draw = ImageDraw.Draw(hi)
    hi_draw.rounded_rectangle(
        (round(22 * scale), round(18 * scale), round(75 * scale), round(34 * scale)),
        radius=max(3, round(8 * scale)),
        outline=(180, 227, 255, 180),
        width=max(1, round(1.2 * scale)),
    )

    glow_soft = core.filter(ImageFilter.GaussianBlur(radius=max(1, round(4.3 * scale))))
    glow_hard = core.filter(ImageFilter.GaussianBlur(radius=max(1, round(1.4 * scale))))

    img = Image.alpha_composite(img, glow_soft)
    img = Image.alpha_composite(img, glow_hard)
    img = Image.alpha_composite(img, core)
    img = Image.alpha_composite(img, hi)
    
    # Save to frontend/static
    output_dir = os.path.join("frontend", "static")
    os.makedirs(output_dir, exist_ok=True)
    img.save(os.path.join(output_dir, filename), "PNG")
    print(f"Saved {filename} to {output_dir}")


if __name__ == "__main__":
    create_icon(32, "favicon.png")
    create_icon(192, "icon-192.png")
    create_icon(512, "icon-512.png")
