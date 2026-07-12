(() => {
  "use strict";

  const STARTING_VOLUME = 0.78;
  const STORAGE_KEY = "goatPlayerVolume";

  const audio = document.getElementById("audio");
  const playButton = document.getElementById("play");
  const previousButton = document.getElementById("previous");
  const nextButton = document.getElementById("next");
  const seek = document.getElementById("seek");
  const volume = document.getElementById("volume");
  const volumeValue = document.getElementById("volumeValue");
  const currentTime = document.getElementById("currentTime");
  const duration = document.getElementById("duration");
  const journey = document.getElementById("journey");

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);
    return `${minutes}:${String(remaining).padStart(2, "0")}`;
  }

  function updateGoaty() {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
      journey.style.setProperty("--progress", "3%");
      return;
    }

    const ratio = audio.currentTime / audio.duration;
    const percent = 3 + ratio * 78;
    journey.style.setProperty("--progress", `${percent}%`);
  }

  const saved = Number(localStorage.getItem(STORAGE_KEY));
  const initialVolume = Number.isFinite(saved)
    ? Math.min(1, Math.max(0, saved))
    : STARTING_VOLUME;

  audio.volume = initialVolume;
  volume.value = String(initialVolume);
  volumeValue.textContent = `${Math.round(initialVolume * 100)}%`;

  volume.addEventListener("input", () => {
    const value = Number(volume.value);
    audio.volume = value;
    volumeValue.textContent = `${Math.round(value * 100)}%`;
    localStorage.setItem(STORAGE_KEY, String(value));
  });

  playButton.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        console.error("Playback failed:", error);
      }
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => {
    playButton.textContent = "Ⅱ";
    playButton.setAttribute("aria-label", "Pause");
  });

  audio.addEventListener("pause", () => {
    playButton.textContent = "▶";
    playButton.setAttribute("aria-label", "Play");
  });

  audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

    currentTime.textContent = formatTime(audio.currentTime);
    seek.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
    updateGoaty();
  });

  seek.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    audio.currentTime = (Number(seek.value) / 1000) * audio.duration;
    updateGoaty();
  });

  previousButton.addEventListener("click", () => {
    audio.currentTime = 0;
    updateGoaty();
  });

  nextButton.addEventListener("click", () => {
    if (Number.isFinite(audio.duration)) {
      audio.currentTime = Math.max(0, audio.duration - 0.05);
      updateGoaty();
    }
  });

  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    seek.value = "0";
    currentTime.textContent = "0:00";
    updateGoaty();
  });

  audio.addEventListener("error", () => {
    console.error("demo-tone.wav could not be loaded. Confirm it is in the repository root.");
  });

  updateGoaty();
})();
