import { initSpeederController } from "./initController";
import { initVideoObserver } from "./observers";

// const initStorage = async () => {
// 	const storage = await chrome.storage.sync.get(null);

// 	console.log("STORAGE", storage);

// 	if (Object.keys(storage).length) {
// 		console.log("initStorage:", storage);

// 		const keysToRemove = Object.keys(storage).filter(
// 			(key) => !(key in appState),
// 		);

// 		if (keysToRemove.length > 0) {
// 			// const newStorage = { ...storage };
// 			for (const key of keysToRemove) {
// 				delete storage[key];
// 			}
// 		}

// 		console.log("before AppState", appState);
// 		appState = { ...appState, ...storage } as AppState;
// 		console.log("after 1 AppState", appState);
// 	} else {
// 		console.log("initStorage: No data found in storage");
// 	}

// 	await chrome.storage.sync.clear();
// 	await chrome.storage.sync.set(appState);
// 	console.log("after 2 AppState", appState);
// 	console.log("From chrome.storage", await chrome.storage.sync.get(null));
// };

const createApp = () => {
  for (const ytVideo of document.getElementsByTagName("video")) {
    initSpeederController(ytVideo);
  }
};

const startApp = async () => {
  // await initStorage();
  createApp();
  initVideoObserver();
};

startApp();
