import os
from PIL import Image, ImageDraw

def create_icon(size: int, filename: str) -> None:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Calculate dimensions
    outer_pad = int(size * 0.06)
    radius = int(size * 0.22)
    
    # Draw rounded rectangle background
    draw.rounded_rectangle(
        [outer_pad, outer_pad, size - outer_pad, size - outer_pad],
        radius=radius,
        fill=(10, 10, 10, 255),
        outline=(96, 165, 250, 255),
        width=max(2, size // 32)
    )
    
    # Calculate T dimensions
    t_width = int(size * 0.3)
    t_height = int(size * 0.44)
    t_top_height = int(size * 0.08)
    t_stem_width = int(size * 0.14)
    
    t_center_x = size // 2
    t_center_y = size // 2
    
    # Top bar of T
    top_bar_left = t_center_x - (t_width // 2)
    top_bar_top = t_center_y - (t_height // 2)
    top_bar_right = top_bar_left + t_width
    top_bar_bottom = top_bar_top + t_top_height
    draw.rounded_rectangle(
        [top_bar_left, top_bar_top, top_bar_right, top_bar_bottom],
        radius=max(1, t_top_height // 2),
        fill=(96, 165, 250, 255)
    )
    
    # Stem of T
    stem_left = t_center_x - (t_stem_width // 2)
    stem_top = top_bar_top
    stem_right = stem_left + t_stem_width
    stem_bottom = stem_top + t_height
    draw.rounded_rectangle(
        [stem_left, stem_top, stem_right, stem_bottom],
        radius=max(1, t_stem_width // 2),
        fill=(96, 165, 250, 255)
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
