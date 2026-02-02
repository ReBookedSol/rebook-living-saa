import { useEffect } from "react";
import { useAccessControl } from "@/hooks/useAccessControl";

const ADSENSE_CLIENT_ID = "ca-pub-7763187849877535";
const ADSENSE_URL = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
const FUNDING_CHOICES_URL = `https://fundingchoicesmessages.google.com/i/${ADSENSE_CLIENT_ID}?ers=1`;

// Obfuscated ad-block recovery script - must be preserved exactly
const AD_BLOCK_DETECTOR_SCRIPT = `(function() {function signalGooglefcPresent() {if (!window.frames['googlefcPresent']) {if (document.body) {const iframe = document.createElement('iframe'); iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;'; iframe.style.display = 'none'; iframe.name = 'googlefcPresent'; document.body.appendChild(iframe);} else {setTimeout(signalGooglefcPresent, 0);}}}signalGooglefcPresent();})();`;

const OBFUSCATED_RECOVERY_SCRIPT = `window.__h82AlnkH6D91__("WyJwdWItNzc2MzE4Nzg0OTg3NzUzNSIsW251bGwsbnVsbCxudWxsLCJodHRwczovL2Z1bmRpbmdjaG9pY2VzbWVzc2FnZXMuZ29vZ2xlLmNvbS9iL3B1Yi03NzYzMTg3ODQ5ODc3NTM1Il0sbnVsbCxudWxsLCJodHRwczovL2Z1bmRpbmdjaG9pY2VzbWVzc2FnZXMuZ29vZ2xlLmNvbS9lbC9BR1NLV3hXanZnal8xelNiZ2cwZ2EzVWdtUzR3em1sLUt0LUpCZVNMQjJHUEV3dGdTVW42RXgxTEE1VWtyMlY5TVZKdVdOaThRRjRsRjk3RjdMMFAzOGw3YVpjcDNBXHUwMDNkXHUwMDNkP3RlXHUwMDNkVE9LRU5fRVhQT1NFRCIsImh0dHBzOi8vZnVuZGluZ2Nob2ljZXNtZXNzYWdlcy5nb29nbGUuY29tL2VsL0FHU0tXeFhhNy1adHVqWHRtaWtiSmJFU0FBRlU3bVQ2MUZRTVV3SWhPWkJyV0hjMGJ4NVhBTlIxbkRMc29YWndMYjZIRmZoNURJSWppSFljVEhlakthMVdXQWhNSXdcdTAwM2RcdTAwM2Q/YWJcdTAwM2QxXHUwMDI2c2JmXHUwMDNkMSIsImh0dHBzOi8vZnVuZGluZ2Nob2ljZXNtZXNzYWdlcy5nb29nbGUuY29tL2VsL0FHU0tXeFhtRnNORUEzT0loNDZ1TURCZkNyaFpoX2RPeVZoMnVTcm9EcXQ0RVhidnFNbVdUdnNiZ2pRUTluLTZ1akZiTk83dGd3UmZFU2FDbHhtV016Zk4xbGlPX2dcdTAwM2RcdTAwM2Q/YWJcdTAwM2QyXHUwMDI2c2JmXHUwMDNkMSIsImh0dHBzOi8vZnVuZGluZ2Nob2ljZXNtZXNzYWdlcy5nb29nbGUuY29tL2VsL0FHU0tXeFVIaTJsM3NGNXhNSkNTNENyY0czOVdYMTgzbHBTUHdVRHlIUmNSUnE5UlE5ZkpZd0RXU0tZclpJV19hZEtCRDdCWHFzVHk5NTY1VDZLX3FKMHd6TFBLa1FcdTAwM2RcdTAwM2Q/c2JmXHUwMDNkMiIsImRpdi1ncHQtYWQiLDIwLDEwMCwiY0hWaUxUYzNOak14T0RjNE5EazROemMxTXpVXHUwMDNkIixbbnVsbCxudWxsLG51bGwsImh0dHBzOi8vd3d3LmdzdGF0aWMuY29tLzBlbW4vZi9wL3B1Yi03NzYzMTg3ODQ5ODc3NTM1LmpzP3VzcXBcdTAwM2RDQWciXSwiaHR0cHM6Ly9mdW5kaW5nY2hvaWNlc21lc3NhZ2VzLmdvb2dsZS5jb20vZWwvQUdTS1d4VmJKWldyLTZCQnhrcVVQdE9FYnZOYlNzYVRvSktNWlhkSWtlR1h3NjJWbnlVZTZBanhLVHpRYk11bFJYcnV0NUMyYWpfTXVJdFpvWEJRMUNfOTgtZFZ...");`;

interface ScriptInjectionConfig {
  url?: string;
  code?: string;
  isAsync?: boolean;
  crossOrigin?: "anonymous" | "use-credentials";
  retryCount?: number;
}

export const AdManager = () => {
  const { accessLevel, isLoading } = useAccessControl();

  // Check if script already exists in DOM
  const scriptExists = (src: string): boolean => {
    return Array.from(document.getElementsByTagName("script")).some(
      (script) => script.src === src || script.src.includes(src)
    );
  };

  // Check if code script already exists
  const codeScriptExists = (code: string): boolean => {
    return Array.from(document.getElementsByTagName("script")).some(
      (script) => script.textContent?.includes("__h82AlnkH6D91__")
    );
  };

  // Inject external script with retry logic
  const injectScript = (config: ScriptInjectionConfig): Promise<void> => {
    return new Promise((resolve, reject) => {
      const {
        url,
        isAsync = true,
        crossOrigin = "anonymous",
        retryCount = 3,
      } = config;

      if (!url) {
        reject(new Error("URL is required for script injection"));
        return;
      }

      // Check if script already exists
      if (scriptExists(url)) {
        resolve();
        return;
      }

      const attemptInject = (attemptsLeft: number) => {
        try {
          const script = document.createElement("script");
          script.src = url;
          script.async = isAsync;
          if (crossOrigin) {
            script.crossOrigin = crossOrigin;
          }

          script.onload = () => {
            resolve();
          };

          script.onerror = () => {
            if (attemptsLeft > 0) {
              const delay = Math.pow(2, 3 - attemptsLeft) * 1000; // 1s, 2s, 4s
              setTimeout(() => attemptInject(attemptsLeft - 1), delay);
            } else {
              console.error(`Failed to load script: ${url}`);
              reject(new Error(`Failed to load script: ${url}`));
            }
          };

          document.head.appendChild(script);
        } catch (error) {
          console.error(`Error injecting script ${url}:`, error);
          if (attemptsLeft > 0) {
            const delay = Math.pow(2, 3 - attemptsLeft) * 1000;
            setTimeout(() => attemptInject(attemptsLeft - 1), delay);
          } else {
            reject(error);
          }
        }
      };

      attemptInject(retryCount);
    });
  };

  // Execute inline script code with retry logic
  const executeScript = (
    code: string,
    retryCount: number = 3
  ): Promise<void> => {
    return new Promise((resolve) => {
      const attemptExecute = (attemptsLeft: number) => {
        try {
          const script = document.createElement("script");
          script.textContent = code;
          document.head.appendChild(script);
          resolve();
        } catch (error) {
          console.error("Error executing inline script:", error);
          if (attemptsLeft > 0) {
            const delay = Math.pow(2, 3 - attemptsLeft) * 1000;
            setTimeout(() => attemptExecute(attemptsLeft - 1), delay);
          } else {
            // Don't reject, just resolve - inline scripts are non-blocking
            resolve();
          }
        }
      };

      attemptExecute(retryCount);
    });
  };

  // Load Google ad scripts for free users
  const loadAdScripts = async () => {
    try {
      // Inject AdSense script
      await injectScript({
        url: ADSENSE_URL,
        isAsync: true,
        crossOrigin: "anonymous",
        retryCount: 3,
      });

      // Inject Funding Choices script
      await injectScript({
        url: FUNDING_CHOICES_URL,
        isAsync: true,
        retryCount: 3,
      });

      // Inject ad-block detector
      if (!codeScriptExists(AD_BLOCK_DETECTOR_SCRIPT)) {
        await executeScript(AD_BLOCK_DETECTOR_SCRIPT, 3);
      }

      // Inject obfuscated recovery script
      if (!codeScriptExists(OBFUSCATED_RECOVERY_SCRIPT)) {
        await executeScript(OBFUSCATED_RECOVERY_SCRIPT, 3);
      }
    } catch (error) {
      // Log error but don't break the app
      console.error("AdManager: Error loading ad scripts:", error);
    }
  };

  useEffect(() => {
    // Skip if still loading auth status
    if (isLoading) {
      return;
    }

    // If user is paid, don't load any ad scripts
    if (accessLevel === "paid") {
      return;
    }

    // For free users, load all ad scripts
    if (accessLevel === "free") {
      loadAdScripts();
    }
  }, [accessLevel, isLoading]);

  // This component doesn't render anything
  return null;
};
