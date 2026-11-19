window.addEventListener("message", (event) => {
  if (event.source !== window || !event.data || event.data.source !== "PERSONAL_WEB_TV") {
    return;
  }

  if (event.data.type === "VOLUME_CHANGE") {
    const { volume, muted } = event.data;
    chrome.runtime.sendMessage({
      type: "SET_MUTE",
      muted: muted || volume === 0
    });
  }
});

window.addEventListener("DOMContentLoaded", () => {
  window.postMessage({ source: "PERSONAL_WEB_TV_EXT", status: "READY" }, "*");
});
