let pending;

export function loadGoogleMaps(browserKey) {
  if (!browserKey) return Promise.reject(new Error("Map unavailable"));
  if (pending) return pending;
  pending = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) {
        script.remove();
        reject(new Error("Map unavailable"));
      } else resolve(window.google.maps);
    };
    const timer = setTimeout(() => finish(true), 12000);
    window.__ruchigoAddressMapsReady = () => finish(!window.google?.maps?.Map);
    const priorAuthFailure = window.gm_authFailure;
    window.gm_authFailure = () => {
      finish(true);
      window.dispatchEvent(new Event("ruchigo-map-auth-failure"));
      priorAuthFailure?.();
    };
    const url = new URL("https://maps.googleapis.com/maps/api/js");
    url.search = new URLSearchParams({
      key: browserKey,
      callback: "__ruchigoAddressMapsReady",
      loading: "async",
      v: "weekly",
      language: "en",
      region: "IN",
    });
    script.src = url.toString();
    script.async = true;
    script.onerror = () => finish(true);
    document.head.appendChild(script);
  }).catch((error) => {
    pending = null;
    throw error;
  });
  return pending;
}
