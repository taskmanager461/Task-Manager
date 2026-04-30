import os
from PIL import Image, ImageDraw

def draw_bezier(draw, points, color, width, scale):
    # points is list of (start, c1, c2, end) tuples
    for segment in points:
        start = (int(segment[0][0]*scale), int(segment[0][1]*scale))
        c1 = (int(segment[1][0]*scale), int(segment[1][1]*scale))
        c2 = (int(segment[2][0]*scale), int(segment[2][1]*scale))
        end = (int(segment[3][0]*scale), int(segment[3][1]*scale))
        
        path_points = []
        for t in range(101):
            t = t / 100
            x = (1-t)**3*start[0] + 3*(1-t)**2*t*c1[0] + 3*(1-t)*t**2*c2[0] + t**3*end[0]
            y = (1-t)**3*start[1] + 3*(1-t)**2*t*c1[1] + 3*(1-t)*t**2*c2[1] + t**3*end[1]
            path_points.append((x, y))
        if len(path_points) > 1:
            draw.line(path_points, fill=color, width=int(width*scale), joint="curve")

def create_icon(size: int, filename: str) -> None:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    scale = size / 200
    
    # Define the segments
    segments1 = [
        ((100, 20), (70, 20), (50, 40), (50, 60)),
        ((50, 60), (50, 80), (65, 100), (80, 120)),
        ((80, 120), (90, 135), (90, 155), (80, 170)),
        ((100, 20), (130, 20), (150, 40), (150, 60))
    ]
    segments2 = [
        ((150, 60), (150, 40), (130, 20), (100, 20)),
        ((100, 20), (70, 20), (50, 40), (50, 60)),
        ((50, 60), (50, 80), (65, 100), (80, 120)),
        ((80, 120), (90, 135), (90, 155), (80, 170))
    ]
    
    draw_bezier(draw, segments1, (59, 130, 246, 255), 16, scale)
    draw_bezier(draw, segments2, (96, 165, 250, 255), 8, scale)
    
    output_dir = os.path.join("frontend", "static")
    os.makedirs(output_dir, exist_ok=True)
    img.save(os.path.join(output_dir, filename))
    print(f"Saved {filename} to {output_dir}")


if __name__ == "__main__":
    create_icon(32, "favicon.png")
    create_icon(192, "icon-192.png")
    create_icon(512, "icon-512.png")
