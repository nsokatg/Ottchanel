const TARGET_URL_PREFIX = "https://nsokatg.github.io/PersonalWebTV/";

async function updateFrameRules() {
  const tabs = await chrome.tabs.query({});
  const tvTabIds = tabs
    .filter(tab => tab.url && (tab.url.startsWith(TARGET_URL_PREFIX) || decodeURIComponent(tab.url).includes("tv-app.html")))
    .map(tab => tab.id);

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map(rule => rule.id);

  const addRules = tvTabIds.length > 0 ? [{
    id: 1001,
    priority: 1,
    action: {
      type: "modifyHeaders",
      responseHeaders: [
        { header: "x-frame-options", operation: "remove" },
        { header: "content-security-policy", operation: "remove" },
        { header: "content-security-policy-report-only", operation: "remove" }
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

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url || changeInfo.status === "loading") {
    updateFrameRules();
  }
});
chrome.tabs.onRemoved.addListener(updateFrameRules);
chrome.runtime.onStartup.addListener(updateFrameRules);
chrome.runtime.onInstalled.addListener(updateFrameRules);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!sender.tab) return;
  const tabId = sender.tab.id;

  if (message.type === "SET_MUTE") {
    chrome.tabs.update(tabId, { muted: message.muted }, () => {
      sendResponse({ status: "ok" });
    });
    return true;
  }
});
