/**
 * RightClick Unchained - Service Worker (Manifest V3)
 * Handles lifecycle, context menus, shortcuts, badge states, and stats aggregation.
 */

const DEFAULT_SETTINGS = {
  globalEnabled: true,
  defaultMode: 'smart',
  unblockRightClick: true,
  unblockSelect: true,
  unblockCopy: true,
  unblockPaste: true,
  removeOverlays: true,
  domainRules: {},
  stats: {
    totalUnblocked: 0,
    domainsCount: {}
  }
};

/**
 * Initialize extension defaults on install
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  const existing = await chrome.storage.local.get(null);
  const toSet = {};

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    if (existing[key] === undefined) {
      toSet[key] = value;
    }
  }

  if (Object.keys(toSet).length > 0) {
    await chrome.storage.local.set(toSet);
  }

  setupContextMenus();
});

/**
 * Setup Context Menus
 */
function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'rcu-root',
      title: 'RightClick Unchained',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      id: 'rcu-toggle-site',
      parentId: 'rcu-root',
      title: 'Toggle Unblock for This Site',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      id: 'rcu-force-copy',
      parentId: 'rcu-root',
      title: 'Force Copy Selection',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'rcu-lasso',
      parentId: 'rcu-root',
      title: 'Launch Smart Text Lasso',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      id: 'rcu-sep-1',
      parentId: 'rcu-root',
      type: 'separator',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      id: 'rcu-options',
      parentId: 'rcu-root',
      title: 'Settings & Options...',
      contexts: ['all']
    });
  });
}

/**
 * Context Menu Click Dispatcher
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === 'rcu-toggle-site') {
    await toggleSiteState(tab);
  } else if (info.menuItemId === 'rcu-force-copy') {
    chrome.tabs.sendMessage(tab.id, { type: 'RCU_FORCE_COPY' }).catch(() => {});
  } else if (info.menuItemId === 'rcu-lasso') {
    chrome.tabs.sendMessage(tab.id, { type: 'RCU_TOGGLE_LASSO' }).catch(() => {});
  } else if (info.menuItemId === 'rcu-options') {
    chrome.runtime.openOptionsPage();
  }
});

/**
 * Keyboard Commands Listener
 */
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (!tab || !tab.id) return;

  if (command === 'toggle-site') {
    await toggleSiteState(tab);
  } else if (command === 'force-copy') {
    chrome.tabs.sendMessage(tab.id, { type: 'RCU_FORCE_COPY' }).catch(() => {});
  }
});

/**
 * Toggle site enabled/disabled state
 */
async function toggleSiteState(tab) {
  if (!tab.url || !tab.url.startsWith('http')) return;

  const url = new URL(tab.url);
  const host = url.hostname;
  const data = await chrome.storage.local.get(['domainRules', 'globalEnabled', 'defaultMode']);
  const domainRules = data.domainRules || {};
  const currentRule = domainRules[host];

  const currentEnabled = currentRule !== undefined ? currentRule.enabled : (data.globalEnabled !== false);
  const newEnabled = !currentEnabled;

  domainRules[host] = {
    enabled: newEnabled,
    mode: (currentRule && currentRule.mode) ? currentRule.mode : (data.defaultMode || 'smart'),
    updatedAt: Date.now()
  };

  await chrome.storage.local.set({ domainRules });

  // Update badge immediately
  updateBadge(tab.id, newEnabled);

  // Broadcast to tab
  chrome.tabs.sendMessage(tab.id, { type: 'RCU_SETTINGS_CHANGED' }).catch(() => {});
}

/**
 * Update Extension Badge
 */
function updateBadge(tabId, isEnabled, mode = 'smart') {
  if (isEnabled) {
    chrome.action.setBadgeBackgroundColor({ tabId, color: mode === 'absolute' ? '#7C3AED' : '#10B981' });
    chrome.action.setBadgeText({ tabId, text: mode === 'absolute' ? 'MAX' : 'ON' });
  } else {
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#6B7280' });
    chrome.action.setBadgeText({ tabId, text: 'OFF' });
  }
}

/**
 * Tab change listeners for updating badge state
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (!tab.url || !tab.url.startsWith('http')) {
      chrome.action.setBadgeText({ tabId: tab.id, text: '' });
      return;
    }

    const host = new URL(tab.url).hostname;
    const data = await chrome.storage.local.get(['globalEnabled', 'domainRules', 'defaultMode']);
    const domainRules = data.domainRules || {};
    const rule = domainRules[host];

    const isEnabled = rule !== undefined ? rule.enabled : (data.globalEnabled !== false);
    const mode = (rule && rule.mode) ? rule.mode : (data.defaultMode || 'smart');

    updateBadge(tab.id, isEnabled, mode);
  } catch (err) {}
});

/**
 * Runtime Message Handler
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'RCU_PAGE_STATUS_UPDATE' && sender.tab) {
    updateBadge(sender.tab.id, message.enabled, message.mode);
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === 'RCU_STATS_INCREMENT') {
    const domain = message.domain || 'unknown';
    chrome.storage.local.get(['stats'], (data) => {
      const stats = data.stats || { totalUnblocked: 0, domainsCount: {} };
      stats.totalUnblocked = (stats.totalUnblocked || 0) + 1;
      stats.domainsCount[domain] = (stats.domainsCount[domain] || 0) + 1;
      chrome.storage.local.set({ stats });
    });
    sendResponse({ ok: true });
    return true;
  }
});
