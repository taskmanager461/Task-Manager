import os
from PIL import Image, ImageDraw, ImageFont

def create_icon(size: int, filename: str):
    # Deep Blue background (#020617)
    bg_color = (2, 6, 23)
    # Checkbox border color (White-ish)
    border_color = (248, 250, 252)
    # Text color (Darker Navy #0f172a)
    text_color = (15, 23, 42)
    
    img = Image.new('RGB', (size, size), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Draw Checklist box (White background)
    padding = size // 6
    box_size = size - (2 * padding)
    box_rect = [padding, padding, size - padding, size - padding]
    draw.rounded_rectangle(box_rect, radius=size // 10, fill=border_color)
    
    # Try to load a font, or use default
    try:
        # Using a default system font for Windows (Segoe UI) or similar
        font_path = "C:/Windows/Fonts/seguihis.ttf" # A bold-ish font
        if not os.path.exists(font_path):
            font_path = "C:/Windows/Fonts/arial.ttf"
        
        # T over M effect
        font_size = int(size * 0.45)
        font = ImageFont.truetype(font_path, font_size)
        
        # Draw T (Upper)
        t_text = "T"
        t_bbox = draw.textbbox((0, 0), t_text, font=font)
        t_w = t_bbox[2] - t_bbox[0]
        t_h = t_bbox[3] - t_bbox[1]
        draw.text(((size - t_w) // 2, padding + (box_size * 0.1)), t_text, fill=text_color, font=font)
        
        # Draw M (Lower)
        m_text = "M"
        m_bbox = draw.textbbox((0, 0), m_text, font=font)
        m_w = m_bbox[2] - m_bbox[0]
        m_h = m_bbox[3] - m_bbox[1]
        draw.text(((size - m_w) // 2, padding + (box_size * 0.45)), m_text, fill=text_color, font=font)
        
    except Exception as e:
        print(f"Font error: {e}, using default")
        draw.text((size//3, size//3), "TM", fill=text_color)

    # Save to frontend/static
    output_dir = os.path.join("frontend", "static")
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    img.save(os.path.join(output_dir, filename), "PNG")
    print(f"Saved {filename} to {output_dir}")

if __name__ == "__main__":
    create_icon(192, "icon-192.png")
    create_icon(512, "icon-512.png")
