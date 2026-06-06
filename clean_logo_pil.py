from PIL import Image, ImageFilter
import os

assets_dir = os.path.join(os.path.dirname(__file__), 'frontend', 'public', 'assets')
input_path = os.path.join(assets_dir, 'new_logo.png')
if not os.path.exists(input_path):
    input_path = os.path.join(assets_dir, 'logo_auth.png')

print(f"Processing {input_path}...")

img = Image.open(input_path).convert("RGBA")

# 1. First Pass: Remove dark, gray, and dark blue pixels (aggressive)
datas = img.getdata()
new_data = []
for item in datas:
    r, g, b, a = item
    
    max_rgb = max(r, g, b)
    min_rgb = min(r, g, b)
    saturation = max_rgb - min_rgb
    
    # We want to drop pixels that are:
    # - Very dark (max_rgb < 90)
    # - Dark blue/grayish (max_rgb < 160 and saturation < 60)
    # - Pure gray (saturation < 30)
    # This should leave only the bright colorful logo pixels.
    if max_rgb < 90 or (max_rgb < 160 and saturation < 60) or saturation < 30:
        new_data.append((255, 255, 255, 0))
    else:
        # Keep bright and colorful pixels
        new_data.append((r, g, b, a))

img.putdata(new_data)

# 2. Smooth the edges and remove noise
# We'll use a sequence of blurs and UnsharpMask or smooth filters.
img_smoothed = img.filter(ImageFilter.SMOOTH_MORE)
img_smoothed = img_smoothed.filter(ImageFilter.SMOOTH_MORE)

# We can also use a small GaussianBlur to smooth jagged edges from the pixel removal
img_smoothed = img_smoothed.filter(ImageFilter.GaussianBlur(radius=1.5))

# Optionally, let's bump the alpha of semi-transparent pixels back up slightly or clip them
datas = img_smoothed.getdata()
final_data = []
for item in datas:
    r, g, b, a = item
    # if it's very transparent, make it fully transparent to avoid halos
    if a < 30:
        final_data.append((255, 255, 255, 0))
    elif a > 150:
        final_data.append((r, g, b, 255))
    else:
        final_data.append((r, g, b, a))

img_smoothed.putdata(final_data)

# 3. Save auth logo
out_auth = os.path.join(assets_dir, 'logo_auth.png')
img_smoothed.save(out_auth, "PNG")
print(f"Saved {out_auth}")

# 4. Save small logo
out_small = os.path.join(assets_dir, 'logo_small.png')
# Resize with high-quality resampling
resized_small = img_smoothed.resize((128, 128), Image.Resampling.LANCZOS)
resized_small.save(out_small, "PNG")
print(f"Saved {out_small}")

print("Done smoothing and cleaning logo.")
