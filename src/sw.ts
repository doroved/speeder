chrome.storage.onChanged.addListener((changes, namespace) => {
  for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`,
    );
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  switch (details.reason) {
    case "update":
      chrome.tabs.create({
        url: "https://github.com/doroved/speeder/blob/main/CHANGELOG.md",
      });
      break;
  }
});
