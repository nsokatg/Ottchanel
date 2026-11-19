const TARGET_FILENAME = "tv-app.html";

// 1. tv-app.html を開いているタブだけ iframe の表示制限（X-Frame-Options等）を解除
async function updateFrameRules() {
  const tabs = await chrome.tabs.query({});
  const tvTabIds = tabs
    .filter(tab => tab.url && tab.url.includes(TARGET_FILENAME))
    .map(tab => tab.id);

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map(rule => rule.id);

  const addRules = tvTabIds.length > 0 ? [{
    id: 1,
    priority: 1,
    action: {
      type: "modifyHeaders",
      responseHeaders: [
        { header: "x-frame-options", operation: "remove" },
        { header: "content-security-policy", operation: "remove" },
        { header: "frame-options", operation: "remove" }
      ]
    },
    condition: {
      tabIds: tvTabIds,
      resourceTypes: ["sub_frame"]
    }
  }] : [];

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: removeRuleIds,
    addRules: addRules
  });
}

chrome.tabs.onUpdated.addListener(updateFrameRules);
chrome.tabs.onRemoved.addListener(updateFrameRules);

// 2. ミュート状態と音量制御のメッセージ受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!sender.tab) return;
  const tabId = sender.tab.id;

  if (message.type === "SET_MUTE") {
    chrome.tabs.update(tabId, { muted: message.muted });
    sendResponse({ status: "ok" });
  }
});