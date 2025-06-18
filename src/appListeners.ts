import { highlightButton } from "./initController";

export const speederListeners = (
	speederToggle: HTMLDivElement,
	speederDisplay: HTMLSpanElement,
	sliderContainer: HTMLElement,
	slider: HTMLInputElement,
	buttonContainer: HTMLElement,
	ytVideo: HTMLVideoElement,
) => {
	let debounceTimer: NodeJS.Timeout;

	slider.onclick = (event) => {
		event.preventDefault();
		event.stopPropagation();
	};

	slider.ondblclick = () => {
		console.log("[Speeder] slider.ondblclick");
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
			console.log("[Speeder] Save new speed:", speed);
		}, 300);
	});

	buttonContainer.addEventListener("click", (event) => {
		const target = event.target as HTMLElement;

		if (target.tagName === "BUTTON") {
			event.preventDefault();
			event.stopPropagation();

			const speed = Number.parseFloat(target.dataset.speed || "1");
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
	ytVideo.addEventListener("play", async () => {
		console.log("[Speeder] Video started playing");

		const channelUsernameElement = document.querySelector(
			"#owner > ytd-video-owner-renderer > a",
		) as HTMLAnchorElement | null;
		const channelUsername = channelUsernameElement?.href
			? channelUsernameElement.href.split("@")[1]
			: undefined;
		console.log("[Speeder] ChannelUsername:", channelUsername);

		const storage: Storage = await chrome.storage.sync.get(null);

		if (storage.playbackRate) {
			ytVideo.playbackRate = storage.playbackRate;
			speederDisplay.innerText = `${storage.playbackRate.toFixed(2)}x`;
			slider.value = storage.playbackRate.toString();
			highlightButton(storage.playbackRate, buttonContainer);
		} else {
			ytVideo.playbackRate = 1;
			speederDisplay.innerText = `${ytVideo.playbackRate.toFixed(2)}x`;
			slider.value = ytVideo.playbackRate.toString();
			highlightButton(1, buttonContainer);
		}
	});
};
