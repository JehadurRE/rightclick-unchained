import os
from PIL import Image, ImageDraw, ImageFont

def create_gradient_bg(width, height, color1, color2):
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for y in range(height):
        r1, g1, b1 = color1
        r2, g2, b2 = color2
        ratio = y / height
        r = int(r1 * (1 - ratio) + r2 * ratio)
        g = int(g1 * (1 - ratio) + g2 * ratio)
        b = int(b1 * (1 - ratio) + b2 * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
    return img

def draw_browser_frame(draw, x, y, w, h, title_url):
    # Window shell
    draw.rounded_rectangle([x, y, x + w, y + h], radius=12, fill=(18, 24, 38, 255), outline=(255, 255, 255, 25), width=1)
    # Header bar
    draw.rounded_rectangle([x, y, x + w, y + 44], radius=12, fill=(24, 32, 48, 255))
    draw.rectangle([x, y + 36, x + w, y + 44], fill=(24, 32, 48, 255))
    # Traffic lights (red, yellow, green)
    draw.ellipse([x + 16, y + 16, x + 28, y + 28], fill=(239, 68, 68, 255))
    draw.ellipse([x + 36, y + 16, x + 48, y + 28], fill=(245, 158, 11, 255))
    draw.ellipse([x + 56, y + 16, x + 68, y + 28], fill=(16, 185, 129, 255))
    # URL bar
    url_x = x + 80
    url_w = w - 160
    draw.rounded_rectangle([url_x, y + 10, url_x + url_w, y + 34], radius=6, fill=(11, 15, 25, 255), outline=(255, 255, 255, 20), width=1)
    # Text in URL bar
    draw.text((url_x + 16, y + 14), title_url, fill=(148, 163, 184, 255))

def draw_popup_mock(draw, px, py, pw, ph):
    # Obsidian popup container
    draw.rounded_rectangle([px, py, px + pw, py + ph], radius=12, fill=(15, 21, 35, 255), outline=(99, 102, 241, 100), width=2)
    # Header
    draw.text((px + 16, py + 14), "RightClick Unchained", fill=(255, 255, 255, 255))
    draw.text((px + 16, py + 30), "v1.0 • Manifest V3 Native", fill=(100, 116, 139, 255))

    # Domain card
    draw.rounded_rectangle([px + 16, py + 52, px + pw - 16, py + 100], radius=8, fill=(21, 29, 47, 255), outline=(255, 255, 255, 15), width=1)
    draw.text((px + 26, py + 62), "PROTECTED WEBSITE", fill=(99, 102, 241, 255))
    draw.text((px + 26, py + 78), "academic-journal.org", fill=(255, 255, 255, 255))
    # Green toggle
    draw.rounded_rectangle([px + pw - 64, py + 68, px + pw - 24, py + 88], radius=10, fill=(16, 185, 129, 255))
    draw.ellipse([px + pw - 42, py + 70, px + pw - 26, py + 86], fill=(255, 255, 255, 255))

    # Mode switcher
    draw.rounded_rectangle([px + 16, py + 110, px + pw - 16, py + 146], radius=8, fill=(21, 29, 47, 255))
    draw.rounded_rectangle([px + 18, py + 112, px + pw/2 - 2, py + 144], radius=6, fill=(79, 70, 229, 180))
    draw.text((px + 40, py + 122), "Smart Mode", fill=(255, 255, 255, 255))
    draw.text((px + pw/2 + 25, py + 122), "Absolute Mode", fill=(148, 163, 184, 255))

    # Features
    features = [
        ("Right-Click Context Menu", "Unblocked"),
        ("Text Selection & Drag", "Bypassed"),
        ("Copy & Cut Hotkeys", "Active"),
        ("Password / Form Paste", "Allowed")
    ]
    fy = py + 160
    for title, status in features:
        draw.rounded_rectangle([px + 16, fy, px + pw - 16, fy + 36], radius=6, fill=(21, 29, 47, 200))
        draw.text((px + 26, fy + 10), title, fill=(241, 245, 249, 255))
        draw.rounded_rectangle([px + pw - 86, fy + 8, px + pw - 24, fy + 28], radius=4, fill=(16, 185, 129, 40))
        draw.text((px + pw - 80, fy + 11), status, fill=(16, 185, 129, 255))
        fy += 42

    # Stats footer
    draw.text((px + 16, py + ph - 24), "✔ 18 restrictions neutralized on this page", fill=(16, 185, 129, 255))

def generate_screenshot_1(out_path):
    img = create_gradient_bg(1280, 800, (11, 15, 25), (15, 23, 42))
    draw = ImageDraw.Draw(img)

    # Big Headline
    draw.text((70, 40), "RightClick Unchained", fill=(255, 255, 255, 255))
    draw.text((70, 72), "Restore Right-Click, Text Selection, Copy & Password Paste Across Any Website", fill=(148, 163, 184, 255))
    draw.rounded_rectangle([1050, 44, 1210, 74], radius=6, fill=(99, 102, 241, 40), outline=(99, 102, 241, 180), width=1)
    draw.text((1064, 52), "MANIFEST V3 NATIVE", fill=(165, 180, 252, 255))

    # Mock Browser Frame
    bx, by, bw, bh = 70, 120, 1140, 640
    draw_browser_frame(draw, bx, by, bw, bh, "https://academic-journal.org/research/global-security-governance-2026")

    # Inside page mock content
    cx = bx + 40
    cy = by + 70
    draw.text((cx, cy), "Global Security & Sovereign AI Governance Review", fill=(241, 245, 249, 255))
    cy += 30
    draw.text((cx, cy), "By Editorial Research Council • Published November 2026", fill=(100, 116, 139, 255))
    cy += 40

    paragraphs = [
        "In modern digital architecture, statecraft relies heavily on open information exchange and verifiability.",
        "Traditional web publications frequently impose artificial restrictions such as disabling context menus and",
        "forbidding text selection. RightClick Unchained safely defuses these client-side restrictions without breaking",
        "the underlying application runtime.",
        "",
        "\"Text selection freedom is fundamental to research, citation accuracy, and browser accessibility.\"",
        "",
        "Key Findings:",
        "1. Capture-phase prototype wrapping allows non-destructive unblocking.",
        "2. Form paste unblocking restores accessibility for password managers and multi-factor authentication.",
        "3. Zero-telemetry architecture ensures completely confidential research."
    ]

    for p in paragraphs:
        # Highlight selected text
        if "RightClick Unchained safely defuses" in p or "Text selection freedom is" in p:
            draw.rectangle([cx - 4, cy - 2, cx + 720, cy + 18], fill=(99, 102, 241, 80))
            draw.text((cx, cy), p, fill=(255, 255, 255, 255))
        else:
            draw.text((cx, cy), p, fill=(203, 213, 225, 255))
        cy += 24

    # Native context menu restored
    cm_x = cx + 220
    cm_y = by + 280
    draw.rounded_rectangle([cm_x, cm_y, cm_x + 200, cm_y + 140], radius=8, fill=(30, 41, 59, 255), outline=(255, 255, 255, 30), width=1)
    menu_items = ["Copy (Ctrl+C)", "Search Google for selection", "Print...", "Inspect Element (F12)"]
    my = cm_y + 10
    for mi in menu_items:
        if "Copy" in mi:
            draw.rectangle([cm_x + 4, my - 2, cm_x + 196, my + 20], fill=(79, 70, 229, 200))
            draw.text((cm_x + 14, my), mi, fill=(255, 255, 255, 255))
        else:
            draw.text((cm_x + 14, my), mi, fill=(203, 213, 225, 255))
        my += 28

    # Floating Extension Popup on Top Right of Browser
    draw_popup_mock(draw, bx + bw - 360, by + 56, 330, 390)

    img.save(out_path, "PNG")
    print(f"Generated {out_path}")

def generate_screenshot_2(out_path):
    img = create_gradient_bg(1280, 800, (15, 23, 42), (11, 15, 25))
    draw = ImageDraw.Draw(img)

    # Big Headline
    draw.text((70, 40), "Smart Text Lasso Grabber", fill=(6, 182, 212, 255))
    draw.text((70, 72), "Extract text from protected canvas, locked tables, and obfuscated DOM structures", fill=(148, 163, 184, 255))
    draw.rounded_rectangle([1030, 44, 1210, 74], radius=6, fill=(6, 182, 212, 40), outline=(6, 182, 212, 180), width=1)
    draw.text((1048, 52), "HOTKEY: ALT+SHIFT+X", fill=(165, 243, 252, 255))

    # Browser Frame
    bx, by, bw, bh = 70, 120, 1140, 640
    draw_browser_frame(draw, bx, by, bw, bh, "https://cloud-pricing-tables.internal/specs/matrix")

    cx = bx + 50
    cy = by + 80
    draw.text((cx, cy), "Encrypted System Architecture Specifications (Canvas & Protected Grid)", fill=(241, 245, 249, 255))
    cy += 50

    # Draw table
    cols = ["Node ID", "Protocol Layer", "Throughput Bandwidth", "Authentication Status"]
    col_x = [cx, cx + 180, cx + 380, cx + 640]
    draw.rounded_rectangle([cx, cy, cx + 920, cy + 34], radius=6, fill=(30, 41, 59, 255))
    for i, h in enumerate(cols):
        draw.text((col_x[i] + 12, cy + 8), h, fill=(148, 163, 184, 255))
    cy += 38

    table_data = [
        ("NODE-9481", "BGP-EVPN Mesh", "400 Gbps Core", "Verified"),
        ("NODE-9482", "WireGuard Overlay", "100 Gbps Edge", "Verified"),
        ("NODE-9483", "Zero-Trust Proxy", "10 Gbps Gateway", "Active (Protected)"),
        ("NODE-9484", "Hardware Security Module", "PCI-e Direct", "Secured")
    ]

    for row in table_data:
        draw.rectangle([cx, cy, cx + 920, cy + 36], fill=(21, 29, 47, 180), outline=(255, 255, 255, 10))
        for i, val in enumerate(row):
            draw.text((col_x[i] + 12, cy + 10), val, fill=(226, 232, 240, 255))
        cy += 40

    # Smart Lasso Selection Box overlay
    lasso_x0, lasso_y0 = cx - 10, by + 160
    lasso_x1, lasso_y1 = cx + 930, by + 320
    draw.rectangle([lasso_x0, lasso_y0, lasso_x1, lasso_y1], outline=(6, 182, 212, 255), width=3)
    draw.rectangle([lasso_x0, lasso_y0, lasso_x1, lasso_y1], fill=(6, 182, 212, 35))

    # Crosshair
    ch_x = lasso_x1
    ch_y = lasso_y1
    draw.line([(ch_x - 16, ch_y), (ch_x + 16, ch_y)], fill=(6, 182, 212, 255), width=2)
    draw.line([(ch_x, ch_y - 16), (ch_x, ch_y + 16)], fill=(6, 182, 212, 255), width=2)

    # Toast Notification on Top Right
    toast_x = bx + bw - 380
    toast_y = by + 60
    draw.rounded_rectangle([toast_x, toast_y, toast_x + 360, toast_y + 64], radius=10, fill=(17, 24, 39, 255), outline=(16, 185, 129, 180), width=2)
    draw.ellipse([toast_x + 16, toast_y + 22, toast_x + 36, toast_y + 42], fill=(16, 185, 129, 255))
    draw.text((toast_x + 22, toast_y + 24), "✔", fill=(255, 255, 255, 255))
    draw.text((toast_x + 48, toast_y + 16), "Smart Lasso Copied!", fill=(255, 255, 255, 255))
    draw.text((toast_x + 48, toast_y + 36), "4 rows (68 words) copied cleanly to clipboard", fill=(148, 163, 184, 255))

    img.save(out_path, "PNG")
    print(f"Generated {out_path}")

def generate_promo_tile(out_path):
    # 440 x 280
    img = create_gradient_bg(440, 280, (11, 15, 25), (79, 70, 229))
    draw = ImageDraw.Draw(img)

    # Icon body
    draw.rounded_rectangle([180, 28, 260, 108], radius=18, fill=(255, 255, 255, 255))
    draw.arc([196, 14, 244, 62], start=180, end=360, fill=(255, 255, 255, 255), width=8)
    draw.ellipse([214, 58, 226, 70], fill=(79, 70, 229, 255))
    draw.rectangle([218, 68, 222, 84], fill=(79, 70, 229, 255))

    # Title
    draw.text((90, 130), "RightClick Unchained", fill=(255, 255, 255, 255))
    draw.text((70, 160), "Absolute Copy, Select & Paste Enabler", fill=(203, 213, 225, 255))

    # Badges
    draw.rounded_rectangle([60, 205, 180, 235], radius=6, fill=(0, 0, 0, 80))
    draw.text((75, 214), "Manifest V3 Native", fill=(165, 243, 252, 255))

    draw.rounded_rectangle([195, 205, 305, 235], radius=6, fill=(0, 0, 0, 80))
    draw.text((210, 214), "Smart Lasso", fill=(254, 240, 138, 255))

    draw.rounded_rectangle([320, 205, 380, 235], radius=6, fill=(0, 0, 0, 80))
    draw.text((332, 214), "0 Telemetry", fill=(167, 243, 208, 255))

    img.save(out_path, "PNG")
    print(f"Generated {out_path}")

def main():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "store-assets", "screenshots"))
    os.makedirs(root, exist_ok=True)
    generate_screenshot_1(os.path.join(root, "screenshot-1-overview.png"))
    generate_screenshot_2(os.path.join(root, "screenshot-2-lasso.png"))
    generate_promo_tile(os.path.join(root, "promo-tile-440x280.png"))

if __name__ == "__main__":
    main()
