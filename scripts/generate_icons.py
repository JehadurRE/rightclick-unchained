import math
import os
from PIL import Image, ImageDraw, ImageFont

def draw_icon(size):
    # Create high-res supersampled canvas (4x) for ultra-sharp downsampling
    scale = 4
    canvas_size = size * scale
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Padding and geometry
    pad = int(canvas_size * 0.08)
    corner_radius = int(canvas_size * 0.24)

    # Background squircle with vibrant modern gradient (Indigo -> Electric Cyan/Blue)
    # Generate gradient background
    bg = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    
    # Rounded rectangle mask
    mask = Image.new("L", (canvas_size, canvas_size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(
        [pad, pad, canvas_size - pad, canvas_size - pad],
        radius=corner_radius,
        fill=255
    )

    # Fill gradient
    for y in range(canvas_size):
        ratio = y / canvas_size
        # Indigo (#4F46E5) to Cyan/Teal (#06B6D4)
        r = int(79 * (1 - ratio) + 6 * ratio)
        g = int(70 * (1 - ratio) + 182 * ratio)
        b = int(229 * (1 - ratio) + 212 * ratio)
        bg_draw.line([(0, y), (canvas_size, y)], fill=(r, g, b, 255))

    img.paste(bg, (0, 0), mask)

    # Icon foreground: An unlocked lock + lightning / cursor
    fg_draw = ImageDraw.Draw(img)
    center_x = canvas_size / 2
    center_y = canvas_size / 2

    # Draw lock body (Rounded rect)
    body_w = canvas_size * 0.44
    body_h = canvas_size * 0.34
    body_x0 = center_x - body_w / 2
    body_y0 = center_y - body_h / 2 + (canvas_size * 0.12)
    body_x1 = center_x + body_w / 2
    body_y1 = body_y0 + body_h
    body_radius = int(canvas_size * 0.08)

    fg_draw.rounded_rectangle(
        [body_x0, body_y0, body_x1, body_y1],
        radius=body_radius,
        fill=(255, 255, 255, 255)
    )

    # Draw lock shackle (unlocked / rotated open)
    # Shackle arc thickness
    shackle_w = canvas_size * 0.30
    shackle_h = canvas_size * 0.32
    shackle_thickness = max(int(canvas_size * 0.08), 2 * scale)
    shackle_x0 = center_x - shackle_w / 2 - (canvas_size * 0.06)
    shackle_y0 = body_y0 - shackle_h + (canvas_size * 0.04)
    shackle_x1 = shackle_x0 + shackle_w
    shackle_y1 = shackle_y0 + shackle_h

    # Shackle arc (open swing)
    fg_draw.arc(
        [shackle_x0, shackle_y0, shackle_x1, shackle_y1],
        start=180, end=360,
        fill=(255, 255, 255, 255),
        width=shackle_thickness
    )
    # Left vertical leg of shackle going into body
    fg_draw.line(
        [(shackle_x0 + shackle_thickness / 2, (shackle_y0 + shackle_y1) / 2),
         (shackle_x0 + shackle_thickness / 2, body_y0 + scale * 2)],
        fill=(255, 255, 255, 255),
        width=shackle_thickness
    )

    # Keyhole in lock body
    keyhole_radius = int(canvas_size * 0.05)
    kh_cx = center_x
    kh_cy = body_y0 + body_h * 0.38
    fg_draw.ellipse(
        [kh_cx - keyhole_radius, kh_cy - keyhole_radius,
         kh_cx + keyhole_radius, kh_cy + keyhole_radius],
        fill=(79, 70, 229, 255)
    )
    kh_stem_w = int(canvas_size * 0.04)
    kh_stem_h = int(canvas_size * 0.12)
    fg_draw.rectangle(
        [kh_cx - kh_stem_w / 2, kh_cy,
         kh_cx + kh_stem_w / 2, kh_cy + kh_stem_h],
        fill=(79, 70, 229, 255)
    )

    # Downsample cleanly to final requested size with Lanczos filter
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

def main():
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets", "icons"))
    os.makedirs(out_dir, exist_ok=True)
    sizes = [16, 32, 48, 128]

    for s in sizes:
        icon = draw_icon(s)
        path = os.path.join(out_dir, f"icon-{s}.png")
        icon.save(path, "PNG")
        print(f"Generated {path} ({s}x{s})")

if __name__ == "__main__":
    main()
