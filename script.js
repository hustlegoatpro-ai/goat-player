(() => {
  "use strict";

  const STARTING_VOLUME = 0.78;
  const STORAGE_KEY = "goatPlayerVolume";

  const audio = document.getElementById("audio");
  const play = document.getElementById("play");
  const previous = document.getElementById("previous");
  const next = document.getElementById("next");
  const seek = document.getElementById("seek");
  const volume = document.getElementById("volume");
  const currentTime = document.getElementById("currentTime");
  const duration = document.getElementById("duration");
  const journey = document.getElementById("journey");

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${String(secs).padStart(2, "0")}`;
  };

  const savedVolume = Number(localStorage.getItem(STORAGE_KEY));
  audio.volume = Number.isFinite(savedVolume) ? savedVolume : STARTING_VOLUME;
  volume.value = audio.volume;

  volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
    localStorage.setItem(STORAGE_KEY, String(audio.volume));
  });

  play.addEventListener("click", async () => {
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
    play.textContent = "Ⅱ";
    play.setAttribute("aria-label", "Pause");
  });

  audio.addEventListener("pause", () => {
    play.textContent = "▶";
    play.setAttribute("aria-label", "Play");
  });

  audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const ratio = audio.currentTime / audio.duration;
    seek.value = String(Math.round(ratio * 1000));
    currentTime.textContent = formatTime(audio.currentTime);

    // Keep Goaty fully visible at both ends.
    const percent = 4 + ratio * 82;
    journey.style.setProperty("--progress", `${percent}%`);
  });

  seek.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration)) return;
    audio.currentTime = (Number(seek.value) / 1000) * audio.duration;
  });

  previous.addEventListener("click", () => {
    audio.currentTime = 0;
  });

  next.addEventListener("click", () => {
    audio.currentTime = Math.max(0, audio.duration - 0.05);
  });

  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    journey.style.setProperty("--progress", "4%");
  });

  journey.style.setProperty("--progress", "4%");
})();
