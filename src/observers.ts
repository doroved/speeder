import { initSpeederController } from "./initController";

export function initPlayerObserver(
  ytPlayer: Element,
  speederContainer: HTMLElement,
) {
  let hideTimer: NodeJS.Timeout;

  const classObserver = new MutationObserver(() => {
    if (ytPlayer.classList.contains("ytp-progress-bar-hover")) {
      clearTimeout(hideTimer); // Очищаем текущий таймер, если класс появился
    } else if (
      ytPlayer.classList.contains("ytp-autohide") || // Нет фокуса курсора мышки на плеере
      ytPlayer.classList.contains("ended-mode") || // Видео завершено
      ytPlayer.classList.contains("ytp-player-minimized") // Мини-плеер
    ) {
      speederContainer.style.visibility = "hidden";
    } else {
      speederContainer.style.visibility = "visible";
    }

    // Запускаем таймер на 20ms, чтобы скрыть контейнер, если класс не появляется
    hideTimer = setTimeout(() => {
      if (ytPlayer.classList.contains("ytp-progress-bar-hover")) {
        speederContainer.style.visibility = "hidden";
      }
    }, 20);
  });

  classObserver.observe(ytPlayer, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

export function initVideoObserver() {
  const videoObserver = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      for (const node of mutation.addedNodes) {
        if (node.nodeName === "VIDEO") {
          initSpeederController(node as HTMLVideoElement);
        }
      }
    }
  });

  videoObserver.observe(document, {
    childList: true,
    subtree: true,
  });
}

export function initShortsObserver(speederContainer: HTMLElement) {
  const shortsObserver = new MutationObserver(() => {
    const metadataContainer = document.querySelector(".metadata-container");

    if (metadataContainer) {
      const updatePosition = () => {
        const height = (metadataContainer as HTMLElement).offsetHeight;
        if (height > 0) {
          (speederContainer as HTMLElement).style.bottom = `${height}px`;
          // console.log("[Speeder] metadata height updated:", height);
        } else {
          setTimeout(updatePosition, 10);
        }
      };
      updatePosition();
    }
  });

  shortsObserver.observe(document, {
    childList: true,
    subtree: true,
  });
}
