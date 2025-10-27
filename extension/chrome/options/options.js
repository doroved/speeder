    document.addEventListener("DOMContentLoaded", function () {
        const slider = document.getElementById("hotkeySpeedDownRange");
        const sliderValueDisplay = document.getElementById("hotkeySpeedDownRangeValue");

        slider.addEventListener("input", function (event) {
            const value = event.target.value;
            console.log(event)
            sliderValueDisplay.innerText = `${value}x`; // Обновление значения в UI
        });
        const form = document.querySelector("form");

        form.addEventListener("submit", function (event) {
            event.preventDefault(); // предотвратить стандартное поведение отправки формы

            const hotkeySpeedUp =
                document.getElementById("hotkeySpeedUp").value;
            const hotkeySpeedDown =
                document.getElementById("hotkeySpeedDown").value;
            const hotkeyReset =
                document.getElementById("hotkeyReset").value;

            // Сохранение настроек в chrome.storage
            chrome.storage.sync.set(
                {
                    hotkeySpeedUp,
                    hotkeySpeedDown,
                    hotkeyReset,
                },
                function () {
                    console.log("Настройки сохранены");
                },
            );
        });
    });
