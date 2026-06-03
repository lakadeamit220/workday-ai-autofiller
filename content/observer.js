export function waitForFormReady(timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    let timeout;
    let stableTimer;

    const observer = new MutationObserver(() => {
      clearTimeout(stableTimer);
      stableTimer = setTimeout(() => {
        cleanup();
        resolve();
      }, 800);
    });

    const cleanup = () => {
      observer.disconnect();
      clearTimeout(timeout);
      clearTimeout(stableTimer);
    };

    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    stableTimer = setTimeout(() => {
      cleanup();
      resolve();
    }, 800);

    timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Timeout waiting for form to stabilize"));
    }, timeoutMs);
  });
}

export function onStepChange(callback) {
  let timer;
  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback();
    }, 500);
  });

  const target = document.querySelector('[data-automation-id="progressBar"]') || document.body;
  if (target) {
    observer.observe(target, { childList: true, subtree: true, attributes: true, characterData: true });
  }

  return () => {
    clearTimeout(timer);
    observer.disconnect();
  };
}
