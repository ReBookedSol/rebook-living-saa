/**
 * Utility to handle production mode behavior
 * When VITE_PRODUCTION is true, all console logs and debugger statements are blocked
 * When false, developer mode is active and allows full debugging
 */

export const isProduction = (): boolean => {
  const prodMode = (import.meta.env as any).VITE_PRODUCTION;
  return prodMode === 'true' || prodMode === true;
};

export const isDeveloperMode = (): boolean => {
  return !isProduction();
};

/**
 * Initialize production mode settings
 * Call this once at app startup to set up console blocking if needed
 */
export const initializeProductionMode = () => {
  if (isProduction()) {
    // Block console methods
    const noop = () => {};
    (window as any).console.log = noop;
    (window as any).console.debug = noop;
    (window as any).console.info = noop;
    
    // Block debugger statement
    const originalErrorHandler = window.onerror;
    window.onerror = function(msg, url, lineNo, columnNo, error) {
      if (typeof msg === 'string' && msg.includes('debugger')) {
        return true; // Suppress the error
      }
      return originalErrorHandler ? originalErrorHandler(msg, url, lineNo, columnNo, error) : false;
    };
  }
};
