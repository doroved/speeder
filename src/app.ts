// <div style="
//     position: absolute;
//     right: 0.5rem;
//     top: 0.5rem;
//     /* width: 100%; */
//     line-height: 1;
// "><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x" style="
//     /* width: 21px; */
//     /* height: 21px; */
// "><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></div>

interface Channel {
  username: string;
  name: string;
}

interface AppState {
  playbackRate: number;
  hiddenSlider: boolean;
  channel: Channel[];
}

let appState: AppState = {
  playbackRate: 1,
  hiddenSlider: false,
  channel: [],
};

const syncAppState = () => {
  chrome.storage.sync.set(appState, () => {
    console.log("App state synchronized:", appState);
  });
};

const initStorage = async () => {
  const storage = await chrome.storage.sync.get(null);

  console.log("STORAGE", storage);

  if (Object.keys(storage).length) {
    console.log("initStorage:", storage);

    const keysToRemove = Object.keys(storage).filter(
      (key) => !(key in appState),
    );

    if (keysToRemove.length > 0) {
      // const newStorage = { ...storage };
      for (const key of keysToRemove) {
        delete storage[key];
      }
    }

    console.log("before AppState", appState);
    appState = { ...appState, ...storage } as AppState;
    console.log("after 1 AppState", appState);
  } else {
    console.log("initStorage: No data found in storage");
  }

  await chrome.storage.sync.clear();
  await chrome.storage.sync.set(appState);
  console.log("after 2 AppState", appState);
  console.log("From chrome.storage", await chrome.storage.sync.get(null));
};

const createSpeederApp = () => {
  console.log("Creating Speeder app");

  // const pathname = window.location.pathname;
  // if (pathname !== "/watch" && !pathname.includes("/shorts/")) {
  //   console.log("Not a video or shorts page");
  //   return;
  // }
  // if (document.querySelector("speeder")) return;

  let debounceTimer: NodeJS.Timeout;

  const moviePlayer = document.querySelector(".html5-video-player");
  const player = document.querySelector("video");

  if (!moviePlayer || !player) {
    console.log("No video player found");
    return;
  }

  const speederContainer = document.createElement("speeder");
  speederContainer.className = "speeder-container";

  // Observer to watch for class changes on moviePlayer
  // const classObserver = new MutationObserver(() => {
  //   speederContainer.style.visibility =
  //     moviePlayer.classList.contains("ytp-progress-bar-hover") ||
  //     moviePlayer.classList.contains("ytp-autohide") ||
  //     moviePlayer.classList.contains("ended-mode")
  //       ? // ||moviePlayer.classList.contains("paused-mode")
  //         "hidden"
  //       : "visible";
  // });

  let hideTimer: NodeJS.Timeout;
  const classObserver = new MutationObserver(() => {
    if (moviePlayer.classList.contains("ytp-progress-bar-hover")) {
      clearTimeout(hideTimer); // Очищаем текущий таймер, если класс появился
    } else if (
      moviePlayer.classList.contains("ytp-autohide") ||
      moviePlayer.classList.contains("ended-mode") ||
      moviePlayer.classList.contains("ytp-player-minimized")
    ) {
      speederContainer.style.visibility = "hidden";
    } else {
      // Если ни один из классов не присутствует, показываем контейнер
      speederContainer.style.visibility = "visible";
    }

    // Запускаем таймер на 30ms, чтобы скрыть контейнер, если класс не появляется
    hideTimer = setTimeout(() => {
      if (moviePlayer.classList.contains("ytp-progress-bar-hover")) {
        speederContainer.style.visibility = "hidden";
      }
    }, 30);
  });

  // Start observing the moviePlayer for attribute changes
  classObserver.observe(moviePlayer, {
    attributes: true,
    attributeFilter: ["class"], // Only listen for class changes
  });

  // Check if the current URL is a Shorts video
  if (window.location.pathname.includes("/shorts/")) {
    setTimeout(() => {
      const metadataContainer = document.querySelector(
        ".metadata-container",
      ) as HTMLElement;

      if (metadataContainer) {
        console.log("metadata found", metadataContainer);
        speederContainer.style.bottom = `${metadataContainer.offsetHeight}px`;
      } else {
        console.log("metadata not found", metadataContainer);
      }
    }, 300);
  }

  if (document.querySelector("speeder")) {
    console.log("speeder found");
    chrome.storage.sync.get(appState, (state) => {
      if (state.playbackRate) {
        player.playbackRate = state.playbackRate;
        speedDisplay.innerText = `${state.playbackRate.toFixed(2)}x`;
        slider.value = state.playbackRate;
        highlightButton(state.playbackRate);
      } else {
        player.playbackRate = 1;
        speedDisplay.innerText = `${player.playbackRate.toFixed(2)}x`;
        slider.value = player.playbackRate.toString();
        highlightButton(1);
      }
    });

    return;
  }

  const sliderContainer = document.createElement("div");
  sliderContainer.className = "speeder-slider-container";

  // Create and append the 0.1x label
  const minLabel = document.createElement("span");
  minLabel.className = "speeder-slider-label";
  minLabel.innerText = "0.1x";
  sliderContainer.appendChild(minLabel);

  const slider = document.createElement("input");
  slider.className = "speeder-slider";
  slider.type = "range";
  slider.min = "0.1";
  slider.max = "16";
  slider.step = "0.05";
  sliderContainer.appendChild(slider);

  // Create and append the 6x label
  const maxLabel = document.createElement("span");
  maxLabel.className = "speeder-slider-label";
  maxLabel.innerText = "16x";
  sliderContainer.appendChild(maxLabel);

  const speedDisplay = document.createElement("span");
  speedDisplay.className = "speeder-display";
  speedDisplay.innerText = `${player.playbackRate.toFixed(2)}x`;

  if (!appState.hiddenSlider) {
    speederContainer.appendChild(speedDisplay);
  }

  chrome.storage.sync.get(appState, (state) => {
    console.log("appState", state, state.playbackRate);
    if (state.playbackRate) {
      player.playbackRate = state.playbackRate;
      speedDisplay.innerText = `${state.playbackRate.toFixed(2)}x`;
      slider.value = state.playbackRate;
      highlightButton(state.playbackRate);
    } else {
      player.playbackRate = 1;
      speedDisplay.innerText = `${player.playbackRate.toFixed(2)}x`;
      slider.value = player.playbackRate.toString();
      highlightButton(1);
    }
  });

  slider.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  slider.ondblclick = () => {
    console.log(" slider.ondblclick ");
    player.playbackRate = 1;
    speedDisplay.innerText = `${player.playbackRate.toFixed(2)}x`;
    slider.value = player.playbackRate.toString();
    highlightButton(1);
    chrome.storage.sync.set({ playbackRate: 1 });
  };

  slider.addEventListener("change", (event) => {
    const speed = Number.parseFloat((event.target as HTMLInputElement).value);
    player.playbackRate = speed;
    speedDisplay.innerText = `${speed.toFixed(2)}x`;
    highlightButton(speed);
    chrome.storage.sync.set({ playbackRate: speed });
  });

  slider.addEventListener("input", (event) => {
    const speed = Number.parseFloat((event.target as HTMLInputElement).value);
    player.playbackRate = speed;
    speedDisplay.innerText = `${speed.toFixed(2)}x`;
    highlightButton(speed);

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      chrome.storage.sync.set({ playbackRate: speed });
      console.log("Сохранили новую скорость:", speed);
    }, 300);
  });

  if (!appState.hiddenSlider) {
    speederContainer.appendChild(sliderContainer);
  }

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "speeder-btns";

  const speeds = [1.0, 1.25, 1.5, 1.75, 2, 2.25, 2.5];
  for (const speed of speeds) {
    const button = document.createElement("button");
    button.innerText = speed.toString();
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      player.playbackRate = speed;
      chrome.storage.sync.set({ playbackRate: speed });
      // Сброс существующего выделения
      const buttons = buttonContainer.getElementsByTagName("button");
      for (const btn of buttons) {
        btn.style.backgroundColor = ""; // Возвращаем фоновый цвет
        btn.style.color = ""; // Возвращаем цвет текста
      }
      slider.value = speed.toString();
      speedDisplay.innerText = `${speed.toFixed(2)}x`;

      highlightButton(speed);

      const target = event.target as HTMLElement; // Type assertion to HTMLElement
      target.style.backgroundColor = "white"; // Цвет фона для выделенной кнопки
    });
    buttonContainer.appendChild(button);
  }

  speederContainer.appendChild(buttonContainer);
  moviePlayer.appendChild(speederContainer);
  // player.parentNode.insertBefore(speederContainer, player.nextSibling);

  const highlightButton = (speed: number) => {
    const buttons = buttonContainer.getElementsByTagName("button");

    for (const btn of buttons) {
      btn.style.backgroundColor = ""; // Возвращаем фоновый цвет
      btn.style.color = ""; // Возвращаем цвет текста
    }

    // Выделяем кнопку, соответствующую текущей скорости
    const activeButton = Array.from(buttons).find(
      (btn) => btn.innerText === `${speed}`,
    );
    if (activeButton) {
      activeButton.style.backgroundColor = "white"; // Цвет фона для выделенной кнопки
    }
  };
};

function extractAuthorInfo(): { username: string; name: string } | null {
  // Получаем элемент с itemprop="author"
  const authorElement = document.querySelector(
    '[itemprop="author"]',
  ) as HTMLElement;

  if (!authorElement) {
    console.error("Author element not found");
    return null;
  }

  // Извлекаем ссылку и имя автора
  const urlElement = authorElement.querySelector(
    '[itemprop="url"]',
  ) as HTMLAnchorElement;
  const nameElement = authorElement.querySelector(
    '[itemprop="name"]',
  ) as HTMLMetaElement;

  if (!urlElement || !nameElement) {
    console.error("URL or Name element not found");
    return null;
  }

  const url = urlElement.getAttribute("href");
  const name = nameElement.getAttribute("content");

  if (!url || !name) {
    console.error("URL or Name is null");
    return null;
  }

  // Извлекаем username из URL
  const username = url.split("@")[1].toLowerCase();

  return {
    username,
    name,
  };
}

// const authorInfo = extractAuthorInfo();
// console.log(authorInfo);
// if (authorInfo) {
//   appState.channel.push(authorInfo);
//   chrome.storage.sync.set(appState);
// } else {
//   console.log("Author info not found");
// }

const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (
      mutation.type === "attributes" &&
      mutation.target.nodeName === "VIDEO" &&
      mutation.attributeName === "src"
    ) {
      console.log("VIDEO src Changed:", mutation.target);
      createSpeederApp();
    }
  }
});

observer.observe(document, {
  childList: true,
  subtree: true,
});

// initStorage();
// createSpeederApp();

const startApp = async () => {
  await initStorage();
  createSpeederApp();
};

startApp();

// chrome.storage.onChanged.addListener((changes, namespace) => {
//   for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
//     console.log(
//       `Storage key "${key}" in namespace "${namespace}" changed.`,
//       `Old value was "${oldValue}", new value is "${newValue}".`,
//     );
//   }
// });
