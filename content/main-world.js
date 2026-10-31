/**
 * RightClick Unchained - Main World Interceptor
 * Runs in the webpage execution context at document_start.
 * Directly neutralizes hostile DOM event listeners, setters, and prevention methods.
 */
(() => {
  if (window.__RCU_MAIN_LOADED__) return;
  window.__RCU_MAIN_LOADED__ = true;

  // Internal configuration state
  let config = {
    enabled: true,
    mode: 'smart', // 'smart' | 'absolute'
    unblockRightClick: true,
    unblockSelect: true,
    unblockCopy: true,
    unblockPaste: true
  };

  // Synchronize configuration from isolated world via CustomEvent
  window.addEventListener('__RCU_CONFIG_UPDATE__', (e) => {
    if (e && e.detail) {
      config = { ...config, ...e.detail };
    }
  }, { capture: true });

  const HOSTILE_EVENTS = new Set([
    'contextmenu',
    'copy',
    'cut',
    'paste',
    'selectstart',
    'dragstart'
  ]);

  // Keep original references
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  const originalPreventDefault = Event.prototype.preventDefault;
  const originalStopPropagation = Event.prototype.stopPropagation;

  /**
   * Safe event checker: Should this event type be guarded?
   */
  function isGuardedEventType(type) {
    if (!config.enabled) return false;
    if (type === 'contextmenu' && config.unblockRightClick) return true;
    if ((type === 'copy' || type === 'cut') && config.unblockCopy) return true;
    if (type === 'selectstart' && config.unblockSelect) return true;
    if (type === 'paste' && config.unblockPaste) return true;
    if (type === 'dragstart' && config.unblockSelect) return true;
    return false;
  }

  /**
   * 1. Patch EventTarget.prototype.addEventListener
   */
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    const eventType = String(type).toLowerCase();

    if (isGuardedEventType(eventType)) {
      if (config.mode === 'absolute') {
        // Absolute Mode: Completely reject site registration of hostile block listeners
        return;
      }

      // Smart Mode: Wrap listener so that e.preventDefault() cannot block user actions
      if (typeof listener === 'function') {
        const wrappedListener = function (event) {
          try {
            // Guard preventDefault on this event instance
            if (event) {
              const origPD = event.preventDefault;
              event.preventDefault = function () {
                // Ignore preventDefault if we are unblocking this event type
                if (isGuardedEventType(event.type)) {
                  return;
                }
                return origPD.apply(this, arguments);
              };
            }
            return listener.apply(this, arguments);
          } catch (err) {
            // Suppress errors caused by ill-behaved site scripts
          }
        };

        // Cache wrapper to allow proper removeEventListener
        if (!this.__rcu_listeners) this.__rcu_listeners = new WeakMap();
        this.__rcu_listeners.set(listener, wrappedListener);

        return originalAddEventListener.call(this, type, wrappedListener, options);
      }
    }

    return originalAddEventListener.call(this, type, listener, options);
  };

  /**
   * 2. Patch EventTarget.prototype.removeEventListener
   */
  const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
  EventTarget.prototype.removeEventListener = function (type, listener, options) {
    if (this.__rcu_listeners && this.__rcu_listeners.has(listener)) {
      const wrapped = this.__rcu_listeners.get(listener);
      return originalRemoveEventListener.call(this, type, wrapped, options);
    }
    return originalRemoveEventListener.call(this, type, listener, options);
  };

  /**
   * 3. Neutralize inline event setters (e.g. document.oncontextmenu = () => false)
   */
  const targetPrototypes = [
    Window.prototype,
    Document.prototype,
    HTMLElement.prototype,
    HTMLBodyElement ? HTMLBodyElement.prototype : null
  ].filter(Boolean);

  const PROPERTY_EVENTS = [
    'oncontextmenu',
    'oncopy',
    'oncut',
    'onpaste',
    'onselectstart',
    'ondragstart'
  ];

  PROPERTY_EVENTS.forEach((prop) => {
    const eventName = prop.slice(2); // 'contextmenu'

    targetPrototypes.forEach((proto) => {
      try {
        const originalDescriptor = Object.getOwnPropertyDescriptor(proto, prop);

        Object.defineProperty(proto, prop, {
          get: function () {
            if (originalDescriptor && originalDescriptor.get) {
              return originalDescriptor.get.call(this);
            }
            return this['__' + prop] || null;
          },
          set: function (fn) {
            if (isGuardedEventType(eventName)) {
              if (config.mode === 'absolute') {
                return; // Discard setter completely in Absolute Mode
              }
              // In Smart Mode, if handler returns false or prevents default, ignore
              const safeFn = typeof fn === 'function' ? function (e) {
                const res = fn.apply(this, arguments);
                return res === false ? true : res;
              } : fn;

              if (originalDescriptor && originalDescriptor.set) {
                return originalDescriptor.set.call(this, safeFn);
              }
              this['__' + prop] = safeFn;
              return;
            }

            if (originalDescriptor && originalDescriptor.set) {
              return originalDescriptor.set.call(this, fn);
            }
            this['__' + prop] = fn;
          },
          configurable: true,
          enumerable: true
        });
      } catch (e) {
        // Prototype property might be non-configurable on some edge engines
      }
    });
  });

  /**
   * 4. Intercept keyboard shortcuts blocker (e.g. site blocking Ctrl+C / Ctrl+V / Ctrl+A)
   */
  originalAddEventListener.call(window, 'keydown', (e) => {
    if (!config.enabled) return;

    const isCtrlOrMeta = e.ctrlKey || e.metaKey;
    if (isCtrlOrMeta) {
      const key = (e.key || '').toLowerCase();
      // Unblock Ctrl+C (copy), Ctrl+X (cut), Ctrl+A (select all), Ctrl+V (paste)
      if (['c', 'x', 'a', 'v', 'u'].includes(key)) {
        e.stopImmediatePropagation();
      }
    }
  }, { capture: true, passive: true });

})();
