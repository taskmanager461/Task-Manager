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

    # Drawing "T" over "M" in a list style
    line_w = max(2, size // 32)
    left = card_pad + int(size * 0.12)
    top = card_pad + int(size * 0.15)
    row_gap = int(size * 0.25)
    box_size = int(size * 0.18)
    
    # Draw two rows for "T" and "M"
    for row, char in enumerate(["T", "M"]):
        y = top + row * row_gap
        # Checkbox
        draw.rounded_rectangle(
            [left, y, left + box_size, y + box_size],
            radius=max(2, box_size // 4),
            outline=stroke,
            width=line_w,
        )
        # Checkmark
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
        
        # Text "T" or "M" next to the box
        try:
            char_font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", int(size * 0.22))
        except Exception:
            char_font = ImageFont.load_default()
            
        draw.text(
            (left + box_size + int(size * 0.08), y - int(size * 0.02)),
            char,
            fill=ink,
            font=char_font
        )

    # Save to frontend/static
    output_dir = os.path.join("frontend", "static")
    os.makedirs(output_dir, exist_ok=True)
    img.convert("RGBA").save(os.path.join(output_dir, filename), "PNG")
    print(f"Saved {filename} to {output_dir}")


if __name__ == "__main__":
    create_icon(32, "favicon.png")
    create_icon(192, "icon-192.png")
    create_icon(512, "icon-512.png")
