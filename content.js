// tv-app.html からの音量・ミュート操作命令を受け取り、ページ内メディアとタブ全体に適用
window.addEventListener("message", (event) => {
  if (event.source !== window || !event.data || event.data.source !== "PERSONAL_WEB_TV") {
    return;
  }

  if (event.data.type === "VOLUME_CHANGE") {
    const { volume, muted } = event.data;

    // タブ自体のミュート制御を background.js へ依頼（最も確実な消音）
    chrome.runtime.sendMessage({
      type: "SET_MUTE",
      muted: muted || volume === 0
    });
  }
});

// 拡張機能が有効であることをページ側へ通知
window.addEventListener("DOMContentLoaded", () => {
  window.postMessage({ source: "PERSONAL_WEB_TV_EXT", status: "READY" }, "*");
});