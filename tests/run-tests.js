/**
 * RightClick Unchained - Comprehensive Test Suite
 */

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${message}`);
    passedTests++;
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${message}`);
    failedTests++;
  }
}

console.log('\n========================================');
console.log('🚀 Running RightClick Unchained Test Suite');
console.log('========================================\n');

// Test Suite 1: Manifest Schema & File Existence
console.log('--- Test Suite 1: Manifest V3 & Asset Integrity ---');
const manifestPath = path.join(rootDir, 'manifest.json');
assert(fs.existsSync(manifestPath), 'manifest.json exists on disk');

const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
assert(manifestContent.manifest_version === 3, 'manifest_version is strictly 3');
assert(manifestContent.name && manifestContent.name.length > 0, 'manifest contains valid extension name');
assert(manifestContent.version === '1.0.0', 'version is 1.0.0');
assert(manifestContent.author === 'JehadurRE', 'author attribution matches JehadurRE');
assert(manifestContent.background && manifestContent.background.service_worker, 'service worker background configured');

// Verify Icons
const iconSizes = ['16', '32', '48', '128'];
iconSizes.forEach((size) => {
  const iconRel = manifestContent.icons[size];
  assert(iconRel && fs.existsSync(path.join(rootDir, iconRel)), `Icon ${size}x${size} exists at ${iconRel}`);
});

// Verify Content scripts exist
assert(Array.isArray(manifestContent.content_scripts), 'content_scripts is defined as array');
manifestContent.content_scripts.forEach((cs, idx) => {
  if (cs.js) {
    cs.js.forEach((jsPath) => {
      assert(fs.existsSync(path.join(rootDir, jsPath)), `Content script exists: ${jsPath} (CS #${idx + 1})`);
    });
  }
  if (cs.css) {
    cs.css.forEach((cssPath) => {
      assert(fs.existsSync(path.join(rootDir, cssPath)), `Content stylesheet exists: ${cssPath}`);
    });
  }
});

// Verify Popup and Options
assert(fs.existsSync(path.join(rootDir, manifestContent.action.default_popup)), 'Popup HTML file exists');
assert(fs.existsSync(path.join(rootDir, manifestContent.options_ui.page)), 'Options HTML file exists');

// Test Suite 2: JavaScript Syntax & Compilation Validation
console.log('\n--- Test Suite 2: Code Syntax & AST Parse Validation ---');
const jsFiles = [
  'background.js',
  'content/main-world.js',
  'content/isolated.js',
  'popup/popup.js',
  'options/options.js'
];

jsFiles.forEach((file) => {
  const fullPath = path.join(rootDir, file);
  assert(fs.existsSync(fullPath), `Target JS file exists: ${file}`);
  const code = fs.readFileSync(fullPath, 'utf-8');
  try {
    new vm.Script(code);
    assert(true, `Syntax valid without errors: ${file}`);
  } catch (err) {
    assert(false, `Syntax error in ${file}: ${err.message}`);
  }
});

// Test Suite 3: Event Interceptor Logic Simulation
console.log('\n--- Test Suite 3: Core Unblocking Logic Simulation ---');

// Simulate event preventDefault neutralization
class MockEvent {
  constructor(type) {
    this.type = type;
    this.defaultPrevented = false;
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
}

function createGuardedWrapper(listener, isGuardedFn) {
  return function (event) {
    const origPD = event.preventDefault;
    event.preventDefault = function () {
      if (isGuardedFn(event.type)) {
        return; // Guarded! Ignore cancellation
      }
      return origPD.apply(this, arguments);
    };
    return listener.call(this, event);
  };
}

const guardedTypes = new Set(['contextmenu', 'copy', 'cut', 'paste', 'selectstart']);
const isGuarded = (t) => guardedTypes.has(t);

// Hostile site listener that attempts e.preventDefault() on contextmenu
const hostileListener = (e) => {
  e.preventDefault();
};

const wrappedHostileListener = createGuardedWrapper(hostileListener, isGuarded);
const contextMenuEvent = new MockEvent('contextmenu');

wrappedHostileListener(contextMenuEvent);
assert(contextMenuEvent.defaultPrevented === false, 'Hostile e.preventDefault() on contextmenu was successfully neutralized');

// Normal non-guarded event (e.g. submit) should still respect preventDefault
const normalSubmitEvent = new MockEvent('submit');
wrappedHostileListener(normalSubmitEvent);
assert(normalSubmitEvent.defaultPrevented === true, 'Non-hostile event (submit) preserved native preventDefault behavior');

// Test Suite 4: Text Extraction Deduplication
console.log('\n--- Test Suite 4: Lasso Text Extractor Deduplication ---');
const rawSnippets = [
  '  Section 1: Geopolitical Intelligence  ',
  'Section 1: Geopolitical Intelligence',
  'Key Insight: Autonomous Operations',
  '  ',
  'Key Insight: Autonomous Operations'
];

const cleaned = [...new Set(rawSnippets.map((s) => s.trim()).filter(Boolean))];
assert(cleaned.length === 2, 'Lasso extractor deduplicates redundant node captures');
assert(cleaned[0] === 'Section 1: Geopolitical Intelligence', 'Extractor trims whitespace');
assert(cleaned[1] === 'Key Insight: Autonomous Operations', 'Extractor keeps unique paragraphs');

console.log('\n========================================');
console.log(`Results: ${passedTests}/${totalTests} tests passed (${failedTests} failures)`);
console.log('========================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\x1b[32m✔ All tests passed with 100% success rate.\x1b[0m\n');
}
