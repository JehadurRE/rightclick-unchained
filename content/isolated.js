/**
 * RightClick Unchained - Isolated Content Script
 * Coordinates settings, CSS overrides, DOM capture handlers, and Smart Text Lasso.
 */
(() => {
  if (window.__RCU_ISOLATED_LOADED__) return;
  window.__RCU_ISOLATED_LOADED__ = true;

  const currentHost = window.location.hostname;
  let activeConfig = {
    enabled: true,
    mode: 'smart', // 'smart' | 'absolute'
    unblockRightClick: true,
    unblockSelect: true,
    unblockCopy: true,
    unblockPaste: true,
    removeOverlays: true
  };

  let unblockedCount = 0;
  let styleElement = null;
  let isLassoActive = false;

  /**
   * Load settings from storage and apply to current page
   */
  async function loadAndApplySettings() {
    try {
      const data = await chrome.storage.local.get([
        'globalEnabled',
        'defaultMode',
        'unblockRightClick',
        'unblockSelect',
        'unblockCopy',
        'unblockPaste',
        'removeOverlays',
        'domainRules'
      ]);

      const globalEnabled = data.globalEnabled !== false;
      const domainRules = data.domainRules || {};
      const domainRule = domainRules[currentHost];

      let isDomainEnabled = globalEnabled;
      let effectiveMode = data.defaultMode || 'smart';

      if (domainRule) {
        if (typeof domainRule.enabled === 'boolean') {
          isDomainEnabled = domainRule.enabled;
        }
        if (domainRule.mode) {
          effectiveMode = domainRule.mode;
        }
      }

      activeConfig = {
        enabled: isDomainEnabled,
        mode: effectiveMode,
        unblockRightClick: data.unblockRightClick !== false,
        unblockSelect: data.unblockSelect !== false,
        unblockCopy: data.unblockCopy !== false,
        unblockPaste: data.unblockPaste !== false,
        removeOverlays: data.removeOverlays !== false
      };

      // Notify Main World
      syncToMainWorld();

      // Apply or remove DOM / CSS modifications
      applyDomOverrides();

      // Update badge in background
      chrome.runtime.sendMessage({
        type: 'RCU_PAGE_STATUS_UPDATE',
        enabled: activeConfig.enabled,
        mode: activeConfig.mode
      }).catch(() => {});
    } catch (err) {
      // In early page load before runtime connects
    }
  }

  /**
   * Send config to main-world script via CustomEvent
   */
  function syncToMainWorld() {
    window.dispatchEvent(
      new CustomEvent('__RCU_CONFIG_UPDATE__', {
        detail: activeConfig
      })
    );
  }

  /**
   * Apply CSS overrides and remove blocking overlay attributes
   */
  function applyDomOverrides() {
    if (!activeConfig.enabled) {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
        styleElement = null;
      }
      document.documentElement.classList.remove('rcu-force-selectable', 'rcu-nuke-overlays');
      return;
    }

    document.documentElement.classList.add('rcu-force-selectable');
    if (activeConfig.mode === 'absolute') {
      document.documentElement.classList.add('rcu-nuke-overlays');
    } else {
      document.documentElement.classList.remove('rcu-nuke-overlays');
    }

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'rcu-dynamic-style';
      const target = document.head || document.documentElement;
      if (target) {
        target.appendChild(styleElement);
      }
    }

    let cssRules = '';
    if (activeConfig.unblockSelect) {
      cssRules += `
        * {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
        }
      `;
    }

    if (activeConfig.mode === 'absolute') {
      cssRules += `
        [oncontextmenu], [onselectstart], [oncopy], [oncut], [onpaste] {
          pointer-events: auto !important;
        }
      `;
    }

    if (styleElement) {
      styleElement.textContent = cssRules;
    }
  }

  /**
   * Record unblocked action
   */
  function recordUnblocked() {
    unblockedCount++;
    chrome.runtime.sendMessage({
      type: 'RCU_STATS_INCREMENT',
      domain: currentHost
    }).catch(() => {});
  }

  /**
   * Capture-phase event guards
   */
  window.addEventListener('contextmenu', (e) => {
    if (!activeConfig.enabled || !activeConfig.unblockRightClick) return;
    // Allow context menu by preventing site's stopPropagation / cancellation
    if (e.defaultPrevented) {
      recordUnblocked();
    }
  }, { capture: true });

  window.addEventListener('selectstart', (e) => {
    if (!activeConfig.enabled || !activeConfig.unblockSelect) return;
    if (e.defaultPrevented) {
      recordUnblocked();
    }
  }, { capture: true });

  window.addEventListener('copy', (e) => {
    if (!activeConfig.enabled || !activeConfig.unblockCopy) return;
    // If site tries to block copy or inject garbage attribution
    const selection = window.getSelection().toString();
    if (selection && e.clipboardData) {
      try {
        e.clipboardData.setData('text/plain', selection);
        recordUnblocked();
      } catch (err) {}
    }
  }, { capture: true });

  window.addEventListener('paste', (e) => {
    if (!activeConfig.enabled || !activeConfig.unblockPaste) return;
    // If site blocked paste in inputs or password boxes
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
      recordUnblocked();
    }
  }, { capture: true });

  /**
   * Floating Toast Notification Helper
   */
  function showToast(message, type = 'success') {
    let container = document.getElementById('rcu-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'rcu-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'rcu-toast';

    const iconSvg = `
      <svg class="rcu-toast-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
    `;

    toast.innerHTML = `
      ${iconSvg}
      <div class="rcu-toast-body">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'rcu-toast-out 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 2800);
  }

  /**
   * Force Copy Action
   */
  async function performForceCopy() {
    let text = window.getSelection().toString();

    if (!text && document.activeElement) {
      const el = document.activeElement;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        const start = el.selectionStart;
        const end = el.selectionEnd;
        if (start !== end) {
          text = el.value.substring(start, end);
        } else {
          text = el.value;
        }
      }
    }

    if (!text) {
      showToast('No text selected to copy!', 'warn');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      const wordCount = text.trim().split(/\s+/).length;
      showToast(`Force-copied ${wordCount} words to clipboard!`);
      recordUnblocked();
    } catch (err) {
      // Fallback: execCommand copy
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(`Copied ${text.length} characters to clipboard!`);
    }
  }

  /**
   * Smart Text Lasso Tool
   */
  function activateLassoTool() {
    if (isLassoActive) return;
    isLassoActive = true;

    const overlay = document.createElement('div');
    overlay.id = 'rcu-lasso-overlay';

    let hoveredEl = null;
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let dragBox = null;

    showToast('Text Lasso Active: Click any block or drag to grab text (Esc to cancel)');

    function cleanup() {
      if (hoveredEl) {
        hoveredEl.classList.remove('rcu-lasso-highlight');
      }
      if (dragBox && dragBox.parentNode) {
        dragBox.parentNode.removeChild(dragBox);
      }
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      window.removeEventListener('keydown', onKeyDown, true);
      isLassoActive = false;
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        cleanup();
        showToast('Text Lasso cancelled.');
      }
    }

    overlay.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const currentX = e.clientX;
        const currentY = e.clientY;
        const x = Math.min(startX, currentX);
        const y = Math.min(startY, currentY);
        const w = Math.abs(currentX - startX);
        const h = Math.abs(currentY - startY);

        if (!dragBox) {
          dragBox = document.createElement('div');
          dragBox.className = 'rcu-lasso-box';
          document.body.appendChild(dragBox);
        }

        dragBox.style.left = `${x}px`;
        dragBox.style.top = `${y}px`;
        dragBox.style.width = `${w}px`;
        dragBox.style.height = `${h}px`;
        return;
      }

      // Find underlying element
      overlay.style.pointerEvents = 'none';
      const el = document.elementFromPoint(e.clientX, e.clientY);
      overlay.style.pointerEvents = 'auto';

      if (el && el !== hoveredEl && el !== overlay && el !== document.body) {
        if (hoveredEl) hoveredEl.classList.remove('rcu-lasso-highlight');
        hoveredEl = el;
        hoveredEl.classList.add('rcu-lasso-highlight');
      }
    });

    overlay.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
    });

    overlay.addEventListener('mouseup', async (e) => {
      if (!isDragging) return;
      isDragging = false;

      const endX = e.clientX;
      const endY = e.clientY;
      const dragDistance = Math.hypot(endX - startX, endY - startY);

      let extractedText = '';

      if (dragDistance > 10) {
        // Drag box selection: grab text of all elements intersecting box
        const rect = {
          left: Math.min(startX, endX),
          right: Math.max(startX, endX),
          top: Math.min(startY, endY),
          bottom: Math.max(startY, endY)
        };

        const allElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span, td, th, pre, code');
        const collected = [];

        allElements.forEach((node) => {
          const r = node.getBoundingClientRect();
          if (
            r.left < rect.right &&
            r.right > rect.left &&
            r.top < rect.bottom &&
            r.bottom > rect.top
          ) {
            const str = node.innerText || node.textContent;
            if (str && str.trim()) collected.push(str.trim());
          }
        });

        extractedText = [...new Set(collected)].join('\n\n');
      } else if (hoveredEl) {
        // Clicked single element
        extractedText = hoveredEl.innerText || hoveredEl.textContent || '';
      }

      cleanup();

      if (extractedText && extractedText.trim()) {
        try {
          await navigator.clipboard.writeText(extractedText.trim());
          const words = extractedText.trim().split(/\s+/).length;
          showToast(`Lasso extracted & copied ${words} words!`);
          recordUnblocked();
        } catch (err) {
          showToast('Failed to copy to clipboard', 'warn');
        }
      } else {
        showToast('No text found in selected area.', 'warn');
      }
    });

    window.addEventListener('keydown', onKeyDown, true);
    document.body.appendChild(overlay);
  }

  /**
   * Runtime Message Dispatcher
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'RCU_GET_PAGE_STATUS') {
      sendResponse({
        domain: currentHost,
        enabled: activeConfig.enabled,
        mode: activeConfig.mode,
        unblockedCount
      });
      return true;
    }

    if (message.type === 'RCU_SETTINGS_CHANGED') {
      loadAndApplySettings();
      sendResponse({ success: true });
      return true;
    }

    if (message.type === 'RCU_FORCE_COPY') {
      performForceCopy();
      sendResponse({ success: true });
      return true;
    }

    if (message.type === 'RCU_TOGGLE_LASSO') {
      activateLassoTool();
      sendResponse({ success: true });
      return true;
    }
  });

  // Initialize immediately
  loadAndApplySettings();

  // Re-verify when DOM is fully interactive
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyDomOverrides();
    });
  } else {
    applyDomOverrides();
  }
})();
