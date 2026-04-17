import os
from PIL import Image, ImageDraw, ImageFont

def create_icon(size: int, filename: str) -> None:
    bg = (10, 31, 68, 255)
    paper = (245, 250, 255, 255)
    stroke = (130, 196, 255, 255)
    ink = (10, 31, 68, 255)

    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    outer_pad = int(size * 0.06)
    draw.rounded_rectangle(
        [outer_pad, outer_pad, size - outer_pad, size - outer_pad],
        radius=int(size * 0.22),
        fill=bg,
    )

    card_pad = int(size * 0.18)
    draw.rounded_rectangle(
        [card_pad, card_pad, size - card_pad, size - card_pad],
        radius=int(size * 0.12),
        fill=paper,
    )

    line_w = max(2, size // 34)
    left = card_pad + int(size * 0.09)
    top = card_pad + int(size * 0.12)
    row_gap = int(size * 0.16)
    box_size = int(size * 0.1)
    for row in range(3):
        y = top + row * row_gap
        draw.rounded_rectangle(
            [left, y, left + box_size, y + box_size],
            radius=max(2, box_size // 4),
            outline=stroke,
            width=line_w,
        )
        draw.line(
            [
                (left + box_size * 0.2, y + box_size * 0.55),
                (left + box_size * 0.45, y + box_size * 0.8),
                (left + box_size * 0.85, y + box_size * 0.25),
            ],
            fill=stroke,
            width=line_w,
            joint="curve",
        )
        draw.rounded_rectangle(
            [
                left + box_size + int(size * 0.035),
                y + int(box_size * 0.32),
                left + box_size + int(size * 0.23),
                y + int(box_size * 0.55),
            ],
            radius=max(2, box_size // 5),
            fill=(180, 208, 240, 255),
        )

    try:
        font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", int(size * 0.24))
    except Exception:
        font = ImageFont.load_default()

    tm_x = card_pad + int(size * 0.36)
    draw.text((tm_x, card_pad + int(size * 0.17)), "T", fill=ink, font=font)
    draw.text((tm_x, card_pad + int(size * 0.46)), "M", fill=ink, font=font)

    # Save to frontend/static
    output_dir = os.path.join("frontend", "static")
    os.makedirs(output_dir, exist_ok=True)
    img.convert("RGBA").save(os.path.join(output_dir, filename), "PNG")
    print(f"Saved {filename} to {output_dir}")


if __name__ == "__main__":
    create_icon(32, "favicon.png")
    create_icon(192, "icon-192.png")
    create_icon(512, "icon-512.png")
