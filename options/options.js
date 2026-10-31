/**
 * RightClick Unchained - Options Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const rulesTbody = document.getElementById('rules-tbody');
  const noRulesPlaceholder = document.getElementById('no-rules-placeholder');
  const newDomainInput = document.getElementById('new-domain-input');
  const newDomainMode = document.getElementById('new-domain-mode');
  const btnAddDomain = document.getElementById('btn-add-domain');

  const prefDefaultMode = document.getElementById('pref-default-mode');
  const prefRemoveOverlays = document.getElementById('pref-remove-overlays');
  const prefGlobalEnabled = document.getElementById('pref-global-enabled');

  const btnOpenShortcuts = document.getElementById('btn-open-chrome-shortcuts');
  const btnExportSettings = document.getElementById('btn-export-settings');
  const fileImportSettings = document.getElementById('file-import-settings');
  const btnResetDefaults = document.getElementById('btn-reset-defaults');

  /**
   * Load and render all options
   */
  async function loadOptions() {
    const data = await chrome.storage.local.get([
      'domainRules',
      'defaultMode',
      'removeOverlays',
      'globalEnabled'
    ]);

    // Preferences
    prefDefaultMode.value = data.defaultMode || 'smart';
    prefRemoveOverlays.checked = data.removeOverlays !== false;
    prefGlobalEnabled.checked = data.globalEnabled !== false;

    // Rules
    renderRulesTable(data.domainRules || {});
  }

  /**
   * Render rules table
   */
  function renderRulesTable(rules) {
    rulesTbody.innerHTML = '';
    const domains = Object.keys(rules);

    if (domains.length === 0) {
      noRulesPlaceholder.style.display = 'block';
      return;
    }

    noRulesPlaceholder.style.display = 'none';

    domains.sort().forEach((domain) => {
      const rule = rules[domain];
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td style="font-weight: 600; color: #FFFFFF;">${escapeHtml(domain)}</td>
        <td>
          <select class="select-control mode-selector" data-domain="${escapeHtml(domain)}" style="padding: 4px 8px; font-size: 12px;">
            <option value="smart" ${rule.mode === 'smart' ? 'selected' : ''}>Smart</option>
            <option value="absolute" ${rule.mode === 'absolute' ? 'selected' : ''}>Absolute</option>
          </select>
        </td>
        <td>
          <span style="color: ${rule.enabled !== false ? '#10B981' : '#94A3B8'}; font-weight: 500;">
            ${rule.enabled !== false ? 'Active' : 'Disabled'}
          </span>
        </td>
        <td>
          <button class="btn-sm-danger btn-delete-rule" data-domain="${escapeHtml(domain)}">Delete</button>
        </td>
      `;

      rulesTbody.appendChild(tr);
    });

    // Attach listeners
    document.querySelectorAll('.btn-delete-rule').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const d = e.target.getAttribute('data-domain');
        await deleteRule(d);
      });
    });

    document.querySelectorAll('.mode-selector').forEach((sel) => {
      sel.addEventListener('change', async (e) => {
        const d = e.target.getAttribute('data-domain');
        const mode = e.target.value;
        await updateRuleMode(d, mode);
      });
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /**
   * Add new domain rule
   */
  btnAddDomain.addEventListener('click', async () => {
    let domain = newDomainInput.value.trim().toLowerCase();
    if (!domain) return;

    // Strip http/https or paths
    try {
      if (domain.startsWith('http://') || domain.startsWith('https://')) {
        domain = new URL(domain).hostname;
      } else if (domain.includes('/')) {
        domain = domain.split('/')[0];
      }
    } catch (e) {}

    const mode = newDomainMode.value;
    const data = await chrome.storage.local.get(['domainRules']);
    const rules = data.domainRules || {};

    rules[domain] = {
      enabled: true,
      mode: mode,
      updatedAt: Date.now()
    };

    await chrome.storage.local.set({ domainRules: rules });
    newDomainInput.value = '';
    renderRulesTable(rules);
  });

  /**
   * Delete rule
   */
  async function deleteRule(domain) {
    const data = await chrome.storage.local.get(['domainRules']);
    const rules = data.domainRules || {};
    delete rules[domain];
    await chrome.storage.local.set({ domainRules: rules });
    renderRulesTable(rules);
  }

  /**
   * Update rule mode
   */
  async function updateRuleMode(domain, mode) {
    const data = await chrome.storage.local.get(['domainRules']);
    const rules = data.domainRules || {};
    if (rules[domain]) {
      rules[domain].mode = mode;
      rules[domain].updatedAt = Date.now();
      await chrome.storage.local.set({ domainRules: rules });
    }
  }

  /**
   * Preferences listeners
   */
  prefDefaultMode.addEventListener('change', () => {
    chrome.storage.local.set({ defaultMode: prefDefaultMode.value });
  });

  prefRemoveOverlays.addEventListener('change', () => {
    chrome.storage.local.set({ removeOverlays: prefRemoveOverlays.checked });
  });

  prefGlobalEnabled.addEventListener('change', () => {
    chrome.storage.local.set({ globalEnabled: prefGlobalEnabled.checked });
  });

  /**
   * Open chrome shortcuts
   */
  btnOpenShortcuts.addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });

  /**
   * Export settings
   */
  btnExportSettings.addEventListener('click', async () => {
    const allData = await chrome.storage.local.get(null);
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rightclick-unchained-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  /**
   * Import settings
   */
  fileImportSettings.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (typeof imported === 'object' && imported !== null) {
          await chrome.storage.local.set(imported);
          await loadOptions();
          alert('Settings imported successfully!');
        }
      } catch (err) {
        alert('Failed to parse settings JSON file.');
      }
    };
    reader.readAsText(file);
  });

  /**
   * Reset defaults
   */
  btnResetDefaults.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all RightClick Unchained settings to default?')) {
      await chrome.storage.local.clear();
      await chrome.storage.local.set({
        globalEnabled: true,
        defaultMode: 'smart',
        unblockRightClick: true,
        unblockSelect: true,
        unblockCopy: true,
        unblockPaste: true,
        removeOverlays: true,
        domainRules: {}
      });
      await loadOptions();
      alert('Reset completed.');
    }
  });

  // Initial load
  loadOptions();
});
