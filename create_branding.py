import os
from PIL import Image, ImageDraw, ImageFilter

def create_icon(size: int, filename: str) -> None:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    scale = size / 100

    core = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(core)

    stroke = max(2, round(3.05 * scale))

    # Top capsule (close to reference)
    top_bbox = (
        round(14 * scale),
        round(15 * scale),
        round(86 * scale),
        round(39 * scale),
    )
    radius = max(4, round(12 * scale))
    draw.rounded_rectangle(top_bbox, radius=radius, outline=(10, 134, 255, 255), width=stroke)

    # Stem with curved shoulder (same geometry as SVG)
    stem_points = [
        (39, 56), (39, 49), (44, 45), (52, 44),
        (62, 43), (68, 43), (72, 46), (71, 52),
        (66, 84), (65, 91), (59, 96), (51, 96),
        (41, 96), (34, 96), (28, 91), (29, 83),
        (33, 63), (34, 60), (36, 57), (39, 56),
    ]
    stem_points_scaled = [(round(x * scale), round(y * scale)) for x, y in stem_points]
    draw.line(stem_points_scaled, fill=(10, 134, 255, 255), width=stroke, joint="curve")
    connector_points = [(48, 45), (48, 41), (51, 38), (56, 37), (64, 36)]
    connector_scaled = [(round(x * scale), round(y * scale)) for x, y in connector_points]
    draw.line(connector_scaled, fill=(10, 134, 255, 255), width=stroke, joint="curve")

    # Soft inner highlight
    hi = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    hi_draw = ImageDraw.Draw(hi)
    hi_draw.rounded_rectangle(
        (round(20 * scale), round(20 * scale), round(78 * scale), round(32 * scale)),
        radius=max(3, round(7 * scale)),
        outline=(223, 246, 255, 150),
        width=max(1, round(1.0 * scale)),
    )

    glow_soft = core.filter(ImageFilter.GaussianBlur(radius=max(1, round(3.0 * scale))))
    glow_hard = core.filter(ImageFilter.GaussianBlur(radius=max(1, round(0.9 * scale))))

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
