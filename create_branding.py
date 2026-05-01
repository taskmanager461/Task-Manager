import os
from PIL import Image, ImageDraw, ImageFilter

def create_icon(size: int, filename: str) -> None:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    scale = size / 100

    core = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(core)

    stroke = max(2, round(3.5 * scale))

    # Top capsule (close to reference)
    top_bbox = (
        round(18 * scale),
        round(12 * scale),
        round(84 * scale),
        round(36 * scale),
    )
    radius = max(4, round(12 * scale))
    draw.rounded_rectangle(top_bbox, radius=radius, outline=(10, 134, 255, 255), width=stroke)

    # Stem with curved shoulder (closer to reference)
    stem_points = [
        (53, 33), (44, 34), (37, 39), (34, 47),
        (31, 76), (30, 83), (35, 89), (42, 88),
        (48, 87), (53, 83), (55, 76), (60, 52),
        (62, 43), (60, 33), (53, 33),
    ]
    stem_points_scaled = [(round(x * scale), round(y * scale)) for x, y in stem_points]
    draw.line(stem_points_scaled, fill=(10, 134, 255, 255), width=stroke, joint="curve")

    # Soft inner highlight
    hi = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    hi_draw = ImageDraw.Draw(hi)
    hi_draw.rounded_rectangle(
        (round(24 * scale), round(16 * scale), round(76 * scale), round(30 * scale)),
        radius=max(3, round(7 * scale)),
        outline=(223, 246, 255, 150),
        width=max(1, round(1.0 * scale)),
    )

    glow_soft = core.filter(ImageFilter.GaussianBlur(radius=max(1, round(3.8 * scale))))
    glow_hard = core.filter(ImageFilter.GaussianBlur(radius=max(1, round(1.2 * scale))))

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
