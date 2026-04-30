import os
from PIL import Image, ImageDraw

def create_icon(size: int, filename: str) -> None:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Outer rounded rectangle
    outer_pad = int(size * 0.10)
    radius = int(size * 0.22)
    
    draw.rounded_rectangle(
        [outer_pad, outer_pad, size - outer_pad, size - outer_pad],
        radius=radius,
        fill=(5, 5, 5, 255),
        outline=(0, 122, 255, 255),
        width=max(2, size // 32)
    )
    
    # Calculate T dimensions
    cx, cy = size // 2, size // 2
    t_top_width = int(size * 0.32)
    t_top_height = int(size * 0.08)
    t_stem_width = int(size * 0.14)
    t_stem_height = int(size * 0.40)
    
    # Top bar of T (with rounded ends)
    top_x1 = cx - t_top_width // 2
    top_y1 = cy - t_stem_height // 2
    top_x2 = cx + t_top_width // 2
    top_y2 = top_y1 + t_top_height
    draw.rounded_rectangle(
        [top_x1, top_y1, top_x2, top_y2],
        radius=t_top_height // 2,
        fill=(0, 122, 255, 255)
    )
    
    # Stem of T (with rounded ends)
    stem_x1 = cx - t_stem_width // 2
    stem_y1 = top_y1
    stem_x2 = cx + t_stem_width // 2
    stem_y2 = stem_y1 + t_stem_height
    draw.rounded_rectangle(
        [stem_x1, stem_y1, stem_x2, stem_y2],
        radius=t_stem_width // 2,
        fill=(0, 122, 255, 255)
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
