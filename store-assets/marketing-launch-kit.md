# Digital Marketing Launch Kit: RightClick Unchained

This kit provides ready-to-copy, high-conversion launch copy and social media posts for launching **RightClick Unchained** across tech communities.

---

## 1. Reddit Strategy & Ready-to-Post Copy

### Post A: r/chrome
**Target Subreddit:** `r/chrome`  
**Flair:** `Extension / Discussion`  
**Title:** Chrome disabled "Absolute Enable Right Click & Copy" for Manifest V3. I got tired of broken alternatives and built a 100% open-source MV3 replacement with a Smart Text Lasso tool.

**Body:**
> Hey r/chrome!
>
> If you used extensions like *Absolute Enable Right Click & Copy* or *Allow Copy*, you probably noticed Chrome has been aggressively disabling them due to the Manifest V2 deprecation.
>
> When looking for Manifest V3 replacements on the Web Store, I ran into three frustrating problems:
> 1. Many old extensions are abandoned and no longer work.
> 2. Several alternatives on the store ask for broad permissions and inject adware or tracking code.
> 3. Complex websites still block copying via canvas, shadow DOMs, or transparent overlay blockers.
>
> So I built **RightClick Unchained** — a clean, zero-tracking, open-source Manifest V3 extension.
>
> **What it does:**
> - **Restores Native Right-Click:** Neutralizes `contextmenu` blockers so you can inspect, search, and save images.
> - **Unlocks Text Selection & Drag:** Strips `user-select: none` across blogs, journals, and paywalls.
> - **Unblocks Form / Password Paste:** Never get blocked from pasting passwords from your password manager into stubborn input fields again.
> - **Smart Text Lasso (`Alt+Shift+X`):** For protected canvas or nested tables, drag a box over any text and it extracts clean plaintext directly to your clipboard.
> - **100% Manifest V3 & Zero Telemetry:** Pure client-side code, zero external server calls, zero data logging.
>
> It’s completely free and open-source under the MIT license on GitHub:  
> 🔗 https://github.com/JehadurRE/rightclick-unchained
>
> Feel free to test it, inspect the code, or drop feedback. Hope this helps anyone frustrated with locked-down sites!

---

### Post B: r/webdev
**Target Subreddit:** `r/webdev`  
**Flair:** `Showoff Saturday / Project`  
**Title:** Show r/webdev: How I built an MV3 right-click & copy unblocker using Chrome's native MAIN world script execution

**Body:**
> Hey devs!
>
> When Manifest V3 rolled out, a lot of utility extensions broke because they relied on persistent background pages or injected inline `<script>` tags that violated modern CSP policies.
>
> I wanted to create a resilient, modern right-click and selection enabler (**RightClick Unchained**) without hacky workarounds.
>
> **Technical Architecture Highlights:**
> 1. **Native Main-World Script Execution:** Using Chrome 111+ `"world": "MAIN"` in `manifest.json`, the interceptor executes directly in the page context at `document_start` before any host scripts run.
> 2. **Capture-Phase Prototype Wrapping:** Instead of brute-forcing `document.oncontextmenu = null`, it wraps `EventTarget.prototype.addEventListener` to strip `e.preventDefault()` calls exclusively on hostile event targets (`contextmenu`, `copy`, `selectstart`, `paste`) while preserving legitimate site UI listeners.
> 3. **Smart Text Lasso:** Built a lightweight geometry-based text extractor that finds intersecting bounding boxes across text nodes to pull unformatted plaintext from stubborn canvas/overlay structures.
> 4. **Dual World Synchronization:** Communication between the privileged isolated script and main-world script is handled cleanly via dispatched custom events with JSON payloads.
>
> Source code is open on GitHub: https://github.com/JehadurRE/rightclick-unchained
>
> Would love your thoughts on edge cases or DOM event interception techniques!

---

### Post C: r/productivity & r/browsers
**Title:** The ultimate fix for websites that block right-click, copying text, or pasting passwords (MV3 Open-Source)

**Body:**
> Ever visit a recipe blog, research paper, or coding tutorial and find out you can't highlight a single sentence? Or try pasting a generated 24-character password into a banking form only for the site to say *"Pasting is not allowed"*?
>
> I built a free, privacy-first Chrome extension called **RightClick Unchained**.
>
> It instantly restores:
> - Right-click context menus
> - Text highlighting & dragging
> - Copying without unwanted attribution spam
> - Pasting into restricted password & verification fields
> - Plus a Smart Lasso tool to grab text from anywhere on the screen
>
> Zero ads, zero tracking, open-source: https://github.com/JehadurRE/rightclick-unchained
>
> Enjoy!

---

## 2. Hacker News: "Show HN"

**Title:** Show HN: RightClick Unchained – A zero-telemetry Manifest V3 text select and copy enabler  
**URL:** https://github.com/JehadurRE/rightclick-unchained

**First Comment by Author (`JehadurRE`):**
> Hi HN!
>
> With the retirement of Manifest V2 in Chromium browsers, classic tools like "Absolute Enable Right Click & Copy" were disabled, leaving a void that is frequently filled by closed-source extensions requesting intrusive permissions.
>
> I built RightClick Unchained as a clean, modern, MIT-licensed Manifest V3 utility:
> - **Main World Interception**: Utilizes Chrome's native `world: "MAIN"` content script configuration to safely patch event listeners at `document_start` without CSP violations.
> - **Dual Engine**: "Smart Mode" allows standard UI widgets (dropdown menus, video players) to operate while only defusing hostile `preventDefault()` calls on selection and copy events. "Absolute Mode" strips blocking overlays and forces selectable CSS.
> - **Password Paste Restoration**: Overrides artificial paste-blocking listeners in sensitive form inputs.
> - **Privacy**: 0 trackers, 0 remote API calls, no background analytics.
>
> The repository includes the full test suite, icons, and automated packaging scripts. Feedback and contributions are very welcome!

---

## 3. Twitter / X Launch Thread

**Tweet 1 (Hook):**
> Google Chrome killed popular right-click & copy enablers with Manifest V3. 
> 
> Most alternatives in the Chrome Web Store are either broken or bloated with sketchy tracking permissions.
> 
> So I built **RightClick Unchained** — a 100% open-source, privacy-first MV3 extension. 🧵👇

**Tweet 2 (The Problem):**
> Websites that:
> 🚫 Disable right-click
> 🚫 Block text selection (`user-select: none`)
> 🚫 Stop you from copying text
> 🚫 Prevent pasting passwords into form fields
> 
> We’ve all dealt with this user-hostile pattern. It’s time to take control back.

**Tweet 3 (The Solution):**
> RightClick Unchained runs at `document_start` and neutralizes hostile event listeners before site scripts can run:
> 
> ⚡ Smart Mode (preserves UI widgets)
> 🔥 Absolute Mode (maximum force)
> 🔑 Unblock password & OTP pasting
> 🎯 Smart Text Lasso (`Alt+Shift+X`) to box & grab any text block!

**Tweet 4 (Privacy First):**
> Built with zero compromises:
> 🔒 0 tracking or telemetry
> 🔒 0 remote servers
> 🔒 100% client-side
> 🔒 Fully open-source on GitHub
> 
> Check out the repo and star it ⭐:
> https://github.com/JehadurRE/rightclick-unchained

**Tweet 5 (Call to Action):**
> Try it out, install from source in 30 seconds via Developer Mode, or download the release package:
> https://github.com/JehadurRE/rightclick-unchained
> 
> Let me know what features you want next! 🚀
> #webdev #chrome #opensource #productivity #coding

---

## 4. Product Hunt Submission Metadata

* **Product Name:** RightClick Unchained
* **Tagline:** Restore right-click, text selection & paste on restricted sites
* **Topic Tags:** Chrome Extensions, Productivity, Open Source, Developer Tools, Privacy
* **Thumbnail Headline:** Take back control of your browser.
* **Maker First Comment:**
  > "Hey Product Hunt! 👋 We’ve all landed on a website that arbitrarily disables right-click, blocks text selection, or refuses to let us paste our password from 1Password/Bitwarden. Older extensions that bypassed this were wiped out by the Manifest V3 rollout. I built RightClick Unchained to be the cleanest, fastest, and most privacy-conscious solution available. It’s 100% open-source and free forever. Would love your feedback!"
