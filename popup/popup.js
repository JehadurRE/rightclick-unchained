/**
 * RightClick Unchained - Popup Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  let currentTab = null;
  let currentHost = '';

  // UI elements
  const currentDomainEl = document.getElementById('current-domain');
  const toggleSiteActive = document.getElementById('toggle-site-active');
  const modeSmartBtn = document.getElementById('mode-smart');
  const modeAbsoluteBtn = document.getElementById('mode-absolute');
  const btnOptions = document.getElementById('btn-options');
  const btnLasso = document.getElementById('btn-lasso');
  const btnForceCopy = document.getElementById('btn-force-copy');

  const toggleRightClick = document.getElementById('toggle-right-click');
  const toggleSelect = document.getElementById('toggle-select');
  const toggleCopy = document.getElementById('toggle-copy');
  const togglePaste = document.getElementById('toggle-paste');
  const statsCounter = document.getElementById('stats-counter');

  // Query active tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs.length > 0) {
    currentTab = tabs[0];
    if (currentTab.url && currentTab.url.startsWith('http')) {
      try {
        currentHost = new URL(currentTab.url).hostname;
        currentDomainEl.textContent = currentHost;
      } catch (e) {
        currentDomainEl.textContent = 'Active Page';
      }
    } else {
      currentDomainEl.textContent = 'System/Local Page';
      toggleSiteActive.disabled = true;
    }
  }

  // Load storage state
  const data = await chrome.storage.local.get([
    'globalEnabled',
    'defaultMode',
    'unblockRightClick',
    'unblockSelect',
    'unblockCopy',
    'unblockPaste',
    'domainRules',
    'stats'
  ]);

  const domainRules = data.domainRules || {};
  const currentRule = domainRules[currentHost];

  const isEnabled = currentRule !== undefined ? currentRule.enabled : (data.globalEnabled !== false);
  const currentMode = (currentRule && currentRule.mode) ? currentRule.mode : (data.defaultMode || 'smart');

  // Set toggle and mode states
  toggleSiteActive.checked = isEnabled;
  setModeUI(currentMode);

  toggleRightClick.checked = data.unblockRightClick !== false;
  toggleSelect.checked = data.unblockSelect !== false;
  toggleCopy.checked = data.unblockCopy !== false;
  togglePaste.checked = data.unblockPaste !== false;

  // Set stats
  const stats = data.stats || { totalUnblocked: 0, domainsCount: {} };
  const domainStats = currentHost && stats.domainsCount ? (stats.domainsCount[currentHost] || 0) : 0;
  statsCounter.textContent = `${domainStats} events unblocked`;

  // Function to update mode UI buttons
  function setModeUI(mode) {
    if (mode === 'absolute') {
      modeAbsoluteBtn.classList.add('active');
      modeSmartBtn.classList.remove('active');
    } else {
      modeSmartBtn.classList.add('active');
      modeAbsoluteBtn.classList.remove('active');
    }
  }

  // Save domain rule changes
  async function saveDomainState(enabled, mode) {
    if (!currentHost) return;
    const store = await chrome.storage.local.get(['domainRules']);
    const rules = store.domainRules || {};
    rules[currentHost] = {
      enabled,
      mode,
      updatedAt: Date.now()
    };
    await chrome.storage.local.set({ domainRules: rules });

    // Notify tab
    if (currentTab && currentTab.id) {
      chrome.tabs.sendMessage(currentTab.id, { type: 'RCU_SETTINGS_CHANGED' }).catch(() => {});
    }
  }

  // Toggle site active listener
  toggleSiteActive.addEventListener('change', async () => {
    const activeMode = modeAbsoluteBtn.classList.contains('active') ? 'absolute' : 'smart';
    await saveDomainState(toggleSiteActive.checked, activeMode);
  });

  // Mode selection listeners
  modeSmartBtn.addEventListener('click', async () => {
    setModeUI('smart');
    await saveDomainState(toggleSiteActive.checked, 'smart');
  });

  modeAbsoluteBtn.addEventListener('click', async () => {
    setModeUI('absolute');
    await saveDomainState(toggleSiteActive.checked, 'absolute');
  });

  // Feature toggle listeners
  async function saveGlobalFeature(key, val) {
    const update = {};
    update[key] = val;
    await chrome.storage.local.set(update);
    if (currentTab && currentTab.id) {
      chrome.tabs.sendMessage(currentTab.id, { type: 'RCU_SETTINGS_CHANGED' }).catch(() => {});
    }
  }

  toggleRightClick.addEventListener('change', () => saveGlobalFeature('unblockRightClick', toggleRightClick.checked));
  toggleSelect.addEventListener('change', () => saveGlobalFeature('unblockSelect', toggleSelect.checked));
  toggleCopy.addEventListener('change', () => saveGlobalFeature('unblockCopy', toggleCopy.checked));
  togglePaste.addEventListener('change', () => saveGlobalFeature('unblockPaste', togglePaste.checked));

  // Quick Tools listeners
  btnLasso.addEventListener('click', () => {
    if (currentTab && currentTab.id) {
      chrome.tabs.sendMessage(currentTab.id, { type: 'RCU_TOGGLE_LASSO' }).catch(() => {});
      window.close(); // Close popup so user interacts with page
    }
  });

  btnForceCopy.addEventListener('click', () => {
    if (currentTab && currentTab.id) {
      chrome.tabs.sendMessage(currentTab.id, { type: 'RCU_FORCE_COPY' }).catch(() => {});
      window.close();
    }
  });

  // Open settings
  btnOptions.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
