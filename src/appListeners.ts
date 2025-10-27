// import type { Storage } from "./initController";
import { highlightButton, videoSrc } from "./initController";

export const speederListeners = (
  speederToggle: HTMLDivElement,
  speederDisplay: HTMLSpanElement,
  sliderContainer: HTMLElement,
  slider: HTMLInputElement,
  buttonContainer: HTMLElement,
  ytVideo: HTMLVideoElement,
  speederContainer: HTMLElement,
  ytPlayer: Element,
) => {
  let debounceTimer: NodeJS.Timeout;
  let debounceTimer1: NodeJS.Timeout;

  slider.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  slider.ondblclick = () => {
    ytVideo.playbackRate = 1;
    speederDisplay.innerText = `${ytVideo.playbackRate.toFixed(2)}x`;
    slider.value = ytVideo.playbackRate.toString();
    highlightButton(1, buttonContainer);
    chrome.storage.sync.set({ playbackRate: 1 });
  };

  slider.addEventListener("change", (event) => {
    const speed = Number.parseFloat((event.target as HTMLInputElement).value);
    ytVideo.playbackRate = speed;
    speederDisplay.innerText = `${speed.toFixed(2)}x`;
    highlightButton(speed, buttonContainer);
    chrome.storage.sync.set({ playbackRate: speed });
  });

  slider.addEventListener("input", (event) => {
    const speed = Number.parseFloat((event.target as HTMLInputElement).value);
    ytVideo.playbackRate = speed;
    speederDisplay.innerText = `${speed.toFixed(2)}x`;
    highlightButton(speed, buttonContainer);

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      chrome.storage.sync.set({ playbackRate: speed });
      // console.log("[Speeder] Save new speed:", speed);
    }, 300);
  });

  buttonContainer.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;

    if (target.tagName === "BUTTON") {
      event.preventDefault();
      event.stopPropagation();

      const speed = Number.parseFloat(target.innerText || "1");
      ytVideo.playbackRate = speed;
      chrome.storage.sync.set({ playbackRate: speed });

      // Сброс существующего выделения
      const buttons = buttonContainer.getElementsByTagName("button");
      for (const btn of buttons) {
        btn.style.backgroundColor = ""; // Возвращаем фоновый цвет
        btn.style.color = ""; // Возвращаем цвет текста
      }

      slider.value = speed.toString();
      speederDisplay.innerText = `${speed.toFixed(2)}x`;
      highlightButton(speed, buttonContainer);
      target.style.backgroundColor = "white";
    }
  });

  speederToggle.addEventListener("click", () => {
    const isVisible =
      window.getComputedStyle(speederDisplay).display !== "none" &&
      window.getComputedStyle(sliderContainer).display !== "none";

    if (isVisible) {
      chrome.storage.sync.set({ hiddenSlider: true });
      speederDisplay.style.display = "none";
      sliderContainer.style.display = "none";
    } else {
      chrome.storage.sync.set({ hiddenSlider: false });
      speederDisplay.style.display = "";
      sliderContainer.style.display = "";
    }
  });

  // Этот код запускается при переходе на видео внутри YT
  ytVideo.addEventListener("play", () => {
    console.log("[Speeder] Video started playing");

    // console.log("[Speeder] ytVideo.src:", ytVideo.src);

    videoSrc.current = ytVideo.src;
    // console.log("[Speeder] Current currentVideoSrc:", videoSrc.current);
    // console.log("[Speeder] latestVideoSrc video:", videoSrc.latest);

    if (videoSrc.current !== videoSrc.latest) {
      // console.log(
      //   "[Speeder] Video changed (latest/current)",
      //   videoSrc.latest,
      //   videoSrc.current,
      // );

      videoSrc.latest = videoSrc.current;

      ytVideo.playbackRate = 1;
      speederDisplay.innerText = `${ytVideo.playbackRate.toFixed(2)}x`;
      slider.value = "1";
      highlightButton(1, buttonContainer);
    }

    // const channelUsernameElement = document.querySelector(
    //   "ytd-video-owner-renderer > a",
    // ) as HTMLAnchorElement | null;
    // const channelUsername = channelUsernameElement?.href
    //   ? channelUsernameElement.href.split("@")[1]
    //   : undefined;
    // console.log("[Speeder] ChannelUsername:", channelUsername);

    // const storage: Storage = await chrome.storage.sync.get(null);
    // if (storage.playbackRate) {
    //   ytVideo.playbackRate = storage.playbackRate;
    //   speederDisplay.innerText = `${storage.playbackRate.toFixed(2)}x`;
    //   slider.value = storage.playbackRate.toString();
    //   highlightButton(storage.playbackRate, buttonContainer);
    // } else {
    //   ytVideo.playbackRate = 1;
    //   speederDisplay.innerText = `${ytVideo.playbackRate.toFixed(2)}x`;
    //   slider.value = ytVideo.playbackRate.toString();
    //   highlightButton(1, buttonContainer);
    // }
  });

  // Добавляем обработчик события нажатия клавиш
  document.addEventListener("keydown", (event) => {
    const target = event.target as HTMLElement;
    if (target.id === "contenteditable-root") return;

    if (event.code === "KeyV") {
      if (getComputedStyle(speederContainer).visibility === "hidden") {
        speederContainer.style.visibility = "visible";
        chrome.storage.sync.set({ hiddenController: false });
      } else {
        speederContainer.style.visibility = "hidden";
        chrome.storage.sync.set({ hiddenController: true });
      }
    }

    // Toggle slider
    if (event.code === "KeyB") {
      speederToggle.click();

      if (getComputedStyle(speederContainer).visibility === "hidden") {
        speederContainer.style.visibility = "visible";
      }

      clearTimeout(debounceTimer1);
      debounceTimer1 = setTimeout(() => {
        chrome.storage.sync.get("hiddenController", (storage) => {
          const hidden: boolean = storage.hiddenController || false;

          if (hidden) {
            speederContainer.style.visibility = "hidden";
            return;
          }

          if (ytPlayer.classList.contains("ytp-autohide")) {
            speederContainer.style.visibility = "hidden";
          }
        });
      }, 3000);
    }

    // Decrease speed
    if (event.code === "KeyS") {
      if (ytVideo.playbackRate > 0.1) {
        ytVideo.playbackRate = Number((ytVideo.playbackRate - 0.1).toFixed(1));
      }
      speederDisplay.innerText = `${ytVideo.playbackRate.toFixed(2)}x`;
      slider.value = ytVideo.playbackRate.toString();
      highlightButton(ytVideo.playbackRate, buttonContainer);

      if (getComputedStyle(speederContainer).visibility === "hidden") {
        speederContainer.style.visibility = "visible";
      }

      clearTimeout(debounceTimer1);
      debounceTimer1 = setTimeout(() => {
        chrome.storage.sync.get("hiddenController", (storage) => {
          const hidden: boolean = storage.hiddenController || false;

          if (hidden) {
            speederContainer.style.visibility = "hidden";
            return;
          }

          if (ytPlayer.classList.contains("ytp-autohide")) {
            speederContainer.style.visibility = "hidden";
          }
        });
      }, 3000);
    }

    // Increase speed
    if (event.code === "KeyD") {
      if (ytVideo.playbackRate < 16) {
        ytVideo.playbackRate = Number((ytVideo.playbackRate + 0.1).toFixed(1));
      }
      speederDisplay.innerText = `${ytVideo.playbackRate.toFixed(2)}x`;
      slider.value = ytVideo.playbackRate.toString();
      highlightButton(ytVideo.playbackRate, buttonContainer);

      if (getComputedStyle(speederContainer).visibility === "hidden") {
        speederContainer.style.visibility = "visible";
      }

      clearTimeout(debounceTimer1);
      debounceTimer1 = setTimeout(() => {
        chrome.storage.sync.get("hiddenController", (storage) => {
          const hidden: boolean = storage.hiddenController || false;

          if (hidden) {
            speederContainer.style.visibility = "hidden";
            return;
          }

          if (ytPlayer.classList.contains("ytp-autohide")) {
            speederContainer.style.visibility = "hidden";
          }
        });
      }, 3000);
    }

    // Reset speed
    if (event.code === "KeyR") {
      ytVideo.playbackRate = 1;
      speederDisplay.innerText = `${ytVideo.playbackRate.toFixed(2)}x`;
      slider.value = ytVideo.playbackRate.toString();
      highlightButton(1, buttonContainer);

      if (getComputedStyle(speederContainer).visibility === "hidden") {
        speederContainer.style.visibility = "visible";
      }

      clearTimeout(debounceTimer1);
      debounceTimer1 = setTimeout(() => {
        chrome.storage.sync.get("hiddenController", (storage) => {
          const hidden: boolean = storage.hiddenController || false;

          if (hidden) {
            speederContainer.style.visibility = "hidden";
            return;
          }

          if (ytPlayer.classList.contains("ytp-autohide")) {
            speederContainer.style.visibility = "hidden";
          }
        });
      }, 3000);
    }

    // Set favorite speed
    if (event.code === "KeyG") {
      ytVideo.playbackRate = ytVideo.playbackRate === 2 ? 1 : 2;
      speederDisplay.innerText = `${ytVideo.playbackRate.toFixed(2)}x`;
      slider.value = ytVideo.playbackRate.toString();
      highlightButton(ytVideo.playbackRate, buttonContainer);
      // chrome.storage.sync.set({ favoriteSpeed: ytVideo.playbackRate });

      if (getComputedStyle(speederContainer).visibility === "hidden") {
        speederContainer.style.visibility = "visible";
      }

      clearTimeout(debounceTimer1);
      debounceTimer1 = setTimeout(() => {
        chrome.storage.sync.get("hiddenController", (storage) => {
          const hidden: boolean = storage.hiddenController || false;

          if (hidden) {
            speederContainer.style.visibility = "hidden";
            return;
          }

          if (ytPlayer.classList.contains("ytp-autohide")) {
            speederContainer.style.visibility = "hidden";
          }
        });
      }, 3000);
    }
  });
};
