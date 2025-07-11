import { speederListeners } from "./appListeners";
import { initPlayerObserver, initShortsObserver } from "./observers";

export interface Channel {
  username: string;
  name: string;
}

export interface Storage {
  playbackRate: number;
  hiddenSlider: boolean;
  channel: Channel[];
}

interface VideoState {
  current: string | null;
  latest: string | null;
}

export const videoSrc: VideoState = {
  current: null,
  latest: null,
};

export const initSpeederController = async (ytVideo: HTMLVideoElement) => {
  const storage: Storage = await chrome.storage.sync.get(null);

  const speederContainer = document.createElement("speeder");
  speederContainer.className = "speeder-container";

  const speederToggle = document.createElement("div");
  speederToggle.className = "speeder-toggle";

  const toggleIcon = createSvgChevronsUpDownIcon();

  const speederDisplay = document.createElement("span");
  speederDisplay.className = "speeder-display";
  speederDisplay.innerText = `${ytVideo.playbackRate.toFixed(2)}x`;

  const sliderContainer = document.createElement("div");
  sliderContainer.className = "speeder-slider-container";

  // Create and append the 0.1x label
  const minLabel = document.createElement("span");
  minLabel.className = "speeder-slider-label";
  minLabel.innerText = "0.1x";

  const slider = document.createElement("input");
  slider.className = "speeder-slider";
  slider.type = "range";
  slider.min = "0.1";
  slider.max = "16";
  slider.step = "0.05";

  // Create and append the 6x label
  const maxLabel = document.createElement("span");
  maxLabel.className = "speeder-slider-label";
  maxLabel.innerText = "16x";

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "speeder-buttons";

  const speeds = [1.0, 1.25, 1.5, 1.75, 2, 2.25, 2.5];
  for (const speed of speeds) {
    const button = document.createElement("button");
    button.innerText = speed.toString();
    buttonContainer.appendChild(button);
  }

  speederToggle.appendChild(toggleIcon);
  speederContainer.appendChild(speederToggle);
  speederContainer.appendChild(speederDisplay);
  sliderContainer.appendChild(minLabel);
  sliderContainer.appendChild(slider);
  sliderContainer.appendChild(maxLabel);
  speederContainer.appendChild(sliderContainer);
  speederContainer.appendChild(buttonContainer);

  const ytPlayer = ytVideo.closest("#movie_player, #shorts-player");

  if (ytPlayer) {
    if (ytPlayer.id === "shorts-player") {
      console.log("[Speeder] Setting up MutationObserver for shorts-player");
      initShortsObserver(speederContainer);
    }

    videoSrc.current = ytVideo.src;
    // console.log("[Speeder] Current currentVideoSrc:", videoSrc.current);
    // console.log("[Speeder] latestVideoSrc video:", videoSrc.latest);

    if (videoSrc.current && videoSrc.current !== videoSrc.latest) {
      // console.log(
      //   "[Speeder] Video changed (latest/current)",
      //   videoSrc.latest,
      //   videoSrc.current,
      // );

      videoSrc.latest = videoSrc.current;

      // if (storage.playbackRate) {
      //   ytVideo.playbackRate = storage.playbackRate;
      //   speederDisplay.innerText = `${storage.playbackRate.toFixed(2)}x`;
      //   slider.value = storage.playbackRate.toString();
      //   highlightButton(storage.playbackRate, buttonContainer);
      // } else {
      //   ytVideo.playbackRate = 1;
      speederDisplay.innerText = `${ytVideo.playbackRate.toFixed(2)}x`;
      slider.value = ytVideo.playbackRate.toString();
      highlightButton(1, buttonContainer);
      // }
    }

    if (storage.hiddenSlider) {
      speederDisplay.style.display = "none";
      sliderContainer.style.display = "none";
    }

    speederListeners(
      speederToggle,
      speederDisplay,
      sliderContainer,
      slider,
      buttonContainer,
      ytVideo,
    );

    ytPlayer.appendChild(speederContainer);
    initPlayerObserver(ytPlayer, speederContainer);

    console.log("[Speeder] init", ytPlayer.id);
  }
};

export const highlightButton = (
  speed: number,
  buttonContainer: HTMLElement,
) => {
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

// Функция для создания SVG иконки "chevrons up down"
function createSvgChevronsUpDownIcon() {
  // Создаём SVG элемент
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "#c0c0c0");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute(
    "class",
    "lucide lucide-chevrons-up-down-icon lucide-chevrons-up-down",
  );
  svg.style.background = "#2e2e2e";
  svg.style.borderRadius = "100%";

  // Создаём первый path элемент для верхней стрелки
  const pathUp = document.createElementNS(svgNS, "path");
  pathUp.setAttribute("d", "m7 9 5-5 5 5");

  // Создаём второй path элемент для нижней стрелки
  const pathDown = document.createElementNS(svgNS, "path");
  pathDown.setAttribute("d", "m7 15 5 5 5-5");

  // Добавляем path элементы в SVG
  svg.appendChild(pathUp);
  svg.appendChild(pathDown);

  return svg;
}

// function extractAuthorInfo(): { username: string; name: string } | null {
// 	// Получаем элемент с itemprop="author"
// 	const authorElement = document.querySelector('[itemprop="author"]');

// 	if (!authorElement) {
// 		console.info("Author element not found");
// 		return null;
// 	}

// 	// Извлекаем ссылку и имя автора
// 	const urlElement = authorElement.querySelector('[itemprop="url"]');
// 	const nameElement = authorElement.querySelector('[itemprop="name"]');

// 	if (!urlElement || !nameElement) {
// 		console.info("URL or Name element not found");
// 		return null;
// 	}

// 	const url = urlElement.getAttribute("href");
// 	const name = nameElement.getAttribute("content");

// 	if (!url || !name) {
// 		console.info("URL or Name is null");
// 		return null;
// 	}

// 	// Извлекаем username из URL
// 	const username = url.split("@")[1].toLowerCase();

// 	return {
// 		username,
// 		name,
// 	};
// }

// const getVideoOwnerInfo = () => {
//   const videoOwner =
//     ytInitialData.contents.twoColumnWatchNextResults.results.results.contents[1]
//       .videoSecondaryInfoRenderer.owner.videoOwnerRenderer;

//   return {
//     thumbnail: videoOwner.thumbnail.thumbnails[0].url,
//     channelName: videoOwner.title.runs[0].text,
//     username:
//       videoOwner.title.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url.slice(
//         1,
//       ),
//   };
// };

// export const getVideoOwnerInfo = () => {
//   const videoOwner = (window as any).ytInitialPlayerResponse.microformat
//     .playerMicroformatRenderer;

//   return {
//     // thumbnail: videoOwner.thumbnail.thumbnails[0].url,
//     channelName: videoOwner.ownerChannelName,
//     username: videoOwner.ownerProfileUrl.split("@")[1],
//     externalVideoId: videoOwner.externalVideoId,
//   };
// };
