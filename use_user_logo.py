import os
from PIL import Image

PUBLIC_ASSETS_DIR = os.path.join("frontend", "public", "assets")
STATIC_DIR = os.path.join("frontend", "static")
USER_LOGO_PATH = "Screenshot 2026-05-01 133245.png"

def crop_to_content(img: Image.Image) -> Image.Image:
    bbox = img.getbbox()
    if bbox:
        cropped = img.crop(bbox)
        square_size = max(cropped.width, cropped.height)
        square_img = Image.new("RGBA", (square_size, square_size), (0, 0, 0, 255))
        paste_x = (square_size - cropped.width) // 2
        paste_y = (square_size - cropped.height) // 2
        square_img.paste(cropped, (paste_x, paste_y))
        return square_img
    return img

def resize_and_save(img: Image.Image, size: int, output_path: str) -> None:
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(output_path, "PNG")
    print(f"Saved: {output_path}")

def main() -> None:
    os.makedirs(PUBLIC_ASSETS_DIR, exist_ok=True)
    os.makedirs(STATIC_DIR, exist_ok=True)

    img = Image.open(USER_LOGO_PATH).convert("RGBA")
    img = crop_to_content(img)

    resize_and_save(img, 1024, os.path.join(PUBLIC_ASSETS_DIR, "logo.png"))
    resize_and_save(img, 512, os.path.join(PUBLIC_ASSETS_DIR, "logo-512.png"))
    resize_and_save(img, 256, os.path.join(PUBLIC_ASSETS_DIR, "logo-256.png"))
    resize_and_save(img, 64, os.path.join(PUBLIC_ASSETS_DIR, "logo-64.png"))

    resize_and_save(img, 64, os.path.join(STATIC_DIR, "favicon.png"))
    resize_and_save(img, 192, os.path.join(STATIC_DIR, "icon-192.png"))
    resize_and_save(img, 512, os.path.join(STATIC_DIR, "icon-512.png"))

    print("\nAll logos updated successfully!")

if __name__ == "__main__":
    main()
