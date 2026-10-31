# Privacy Policy for RightClick Unchained

**Last Updated:** November 1, 2026  
**Developer:** JehadurRE  
**Repository:** [https://github.com/JehadurRE/rightclick-unchained](https://github.com/JehadurRE/rightclick-unchained)

---

## 1. Overview
RightClick Unchained ("the Extension") is committed to protecting your privacy. This Privacy Policy explicitly outlines our commitment to transparency: **we do not collect, transmit, store, or sell any of your personal data or browsing activity.**

---

## 2. Information We Do Not Collect
RightClick Unchained adheres to strict client-side privacy standards:
- **No Personal Information**: We do not collect names, email addresses, IP addresses, location data, or device identifiers.
- **No Browsing History**: We do not log, monitor, or track the URLs you visit, the content you view, or your search history.
- **No Keystroke / Clipboard Logging**: Text selection and clipboard operations are performed solely within the local execution context of your web browser to restore default user capabilities. No captured text is ever sent off your machine.
- **No Analytics / Telemetry**: We do not use third-party analytics services (such as Google Analytics, Mixpanel, or Sentry).

---

## 3. Local Storage Usage
The Extension utilizes the `chrome.storage.local` API exclusively on your local device to remember your configuration settings:
- Per-domain toggle states (e.g. whether a user enabled Smart or Absolute mode on a specific website).
- User interface preferences (e.g. default engine mode, feature toggles).
- Local unblock statistics (simple local counter of how many times block scripts were bypassed).

All stored configuration data remains strictly on your local machine and can be cleared or exported at any time via the Extension's Options page.

---

## 4. Permissions Used
The Extension requests only permissions essential for its stated functionality:
- `storage`: To save your local preferences and domain rules.
- `activeTab`: To inspect and modify the active webpage when invoked by user command.
- `scripting`: To apply CSS style overrides and event patches to unblock text selection and right-click menus.
- `contextMenus`: To add quick-access options ("Unblock this site", "Force Copy") to the browser's context menu.
- `<all_urls>` (Host Permissions): Required to remove JavaScript block listeners and inject text-selection CSS across arbitrary websites that impose anti-copy restrictions.

---

## 5. Third-Party Sharing
We do not share, disclose, or transfer any data to third parties, advertising networks, or data brokers.

---

## 6. Open Source Verification
RightClick Unchained is free and open-source software under the MIT License. Anyone can audit the complete source code, manifest, and dependencies directly on GitHub:  
[https://github.com/JehadurRE/rightclick-unchained](https://github.com/JehadurRE/rightclick-unchained)

---

## 7. Contact
For questions regarding this Privacy Policy or the Extension, please file an issue on GitHub or reach out to:  
**Developer:** JehadurRE  
**GitHub:** [https://github.com/JehadurRE](https://github.com/JehadurRE)
