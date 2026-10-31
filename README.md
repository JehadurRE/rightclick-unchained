# RightClick Unchained 🔓⚡

> **The modern, privacy-first Manifest V3 Chrome Extension that restores right-click context menus, unblocks text selection, enables copy & cut, and frees password pasting on restricted websites.**

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success?style=flat-square&logo=googlechrome)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Zero Telemetry](https://img.shields.io/badge/Privacy-100%25%20Zero%20Telemetry-emerald?style=flat-square)](#-privacy--security-guarantee)
[![Tests Passing](https://img.shields.io/badge/Tests-31%2F31%20Passing-brightgreen?style=flat-square)](tests/run-tests.js)

---

## 💡 Why RightClick Unchained?

Google Chrome's mandatory migration to **Manifest V3** disabled classic extensions like *Absolute Enable Right Click & Copy*, leaving millions of users stranded on hostile websites that:
- 🚫 Disable right-click context menus (`e.preventDefault()` on `contextmenu`)
- 🚫 Block text selection and dragging (`user-select: none !important`)
- 🚫 Intercept `Ctrl+C` / `Ctrl+X` or pollute copied text with unwanted attribution spam
- 🚫 Block pasting passwords and 2FA tokens into form fields
- 🚫 Overlay transparent blocking `<div>` elements over articles and code blocks

**RightClick Unchained** is built from scratch as a pure Manifest V3 solution. It uses native `world: "MAIN"` execution at `document_start` to neutralize hostile listeners before site scripts can run, without breaking legitimate web applications or violating Content Security Policies (CSP).

---

## ✨ Features

- 🖱️ **Universal Right-Click Enabler**: Restores browser context menus to inspect elements, save images, and search.
- ✍️ **Universal Text Selection**: Injects high-priority CSS rules overcoming `-webkit-user-select: none`.
- 📋 **Copy & Cut Freedom**: Unblocks `copy` and `cut` events, preserving the pure selected text.
- 🔑 **Form & Password Paste Unblocker**: Defeats arbitrary `paste` blocks in billing, banking, and password inputs.
- 🎯 **Smart Text Lasso (`Alt + Shift + X`)**: Interactive overlay tool. Click any element or drag a bounding box to extract clean, unformatted plaintext directly from stubborn tables, canvas, or locked DOM trees.
- ⚡ **Dual Engine Modes**:
  - **Smart Mode (Default)**: Selectively defuses hostile preventDefault handlers while preserving dropdown menus and interactive widgets.
  - **Absolute Mode**: Aggressively strips all hostile listeners and removes transparent blocking overlays.
- 🌐 **Per-Domain Memory & Whitelist**: Configure custom rules per website with instant toggle support.
- 🔒 **Zero Telemetry**: No tracking, no external API calls, 100% client-side privacy.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `Alt + Shift + U` | **Open Popup** | Launches the RightClick Unchained control center |
| `Alt + Shift + R` | **Toggle Site** | Instantly toggles unblocking for the active website |
| `Alt + Shift + C` | **Force Copy** | Copies active selection directly to clipboard |

*(Customize anytime via `chrome://extensions/shortcuts`)*

---

## 📦 Installation & Setup

### Option 1: Load Unpacked in Developer Mode (Instant)
1. Clone or download this repository:
   ```bash
   git clone https://github.com/JehadurRE/rightclick-unchained.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the `rightclick-unchained` folder.
5. Pin the extension to your browser toolbar and browse freely!

### Option 2: Pre-packaged ZIP
1. Download the latest release from the [dist/](dist/) folder (`rightclick-unchained-v1.0.0.zip`).
2. Unzip into a folder and load unpacked via `chrome://extensions/`.

---

## 🏗️ Architecture & Technical Highlights

```
rightclick-unchained/
├── manifest.json            # Manifest V3 configuration with dual-world content scripts
├── background.js            # Background service worker (badge, context menus, shortcuts)
├── content/
│   ├── main-world.js        # Executes in page context (patches EventTarget prototype)
│   ├── isolated.js          # Privileged script (CSS injection, Lasso tool, storage)
│   └── content.css          # Text selection overrides & Lasso UI styles
├── popup/                   # Sleek Obsidian-dark popup UI
├── options/                 # Domain rules & global configuration manager
├── assets/icons/            # Crisp SVG and 16, 32, 48, 128px PNG icons
├── tests/                   # 31-point automated test suite
├── scripts/                 # Icon generation & Chrome Web Store packaging utilities
└── store-assets/            # Complete store listing, privacy policy & marketing kit
```

---

## 🧪 Testing

Run the included automated test suite (31 comprehensive assertions covering manifest schema, syntax trees, event neutralization, and lasso deduplication):

```bash
node tests/run-tests.js
```

---

## 🛡️ Privacy & Security Guarantee

RightClick Unchained complies with the highest standards of user privacy:
- **No data collection** of any kind.
- **No network requests** are initiated by the extension.
- **No remote code execution**.
- Review our full [Privacy Policy](store-assets/privacy-policy.md).

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

**Created by [JehadurRE](https://github.com/JehadurRE)**
