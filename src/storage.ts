export async function getStorage() {
  return await chrome.storage.local.get(null);
}
