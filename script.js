(() => {
  "use strict";

  const STARTING_VOLUME = 0.78;
  const VOLUME_KEY = "goatPlayerVolume";

  const tracks = [
    { title: "Changing", artist: "Hustle Goat", src: "changing.mp3" },
    { title: "Peace", artist: "Hustle Goat", src: "peace.mp3" },
    { title: "Rever", artist: "Hustle Goat", src: "rever.mp3" },
    { title: "Onward", artist: "Hustle Goat", src: "onward.mp3" }
  ];

  const audio = document.getElementById("audio");
  const title = document.getElementById("trackTitle");
  const artist = document.getElementById("trackArtist");
  const count = document.getElementById("trackCount");
  const play = document.getElementById("play");
  const previous = document.getElementById("previous");
  const next = document.getElementById("next");
  const seek = document.getElementById("seek");
  const volume = document.getElementById("volume");
  const volumeValue = document.getElementById("volumeValue");
  const currentTime = document.getElementById("currentTime");
  const duration = document.getElementById("duration");
  const journey = document.getElementById("journey");

  let trackIndex = 0;

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
    journey.style.setProperty("--progress", `${3 + ratio * 76}%`);
  }

  function setPlayState(playing) {
    play.textContent = playing ? "Ⅱ" : "▶";
    play.setAttribute("aria-label", playing ? "Pause" : "Play");
  }

  function loadTrack(index, autoplay = false) {
    trackIndex = (index + tracks.length) % tracks.length;
    const track = tracks[trackIndex];

    audio.src = track.src;
    title.textContent = track.title;
    artist.textContent = track.artist;
    count.textContent = `${trackIndex + 1} / ${tracks.length}`;
    currentTime.textContent = "0:00";
    duration.textContent = "0:00";
    seek.value = "0";
    journey.style.setProperty("--progress", "3%");
    setPlayState(false);
    audio.load();

    if (autoplay) {
      audio.play().catch(error => console.error("Playback failed:", error));
    }
  }

  const saved = Number(localStorage.getItem(VOLUME_KEY));
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
    localStorage.setItem(VOLUME_KEY, String(value));
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

  previous.addEventListener("click", () => loadTrack(trackIndex - 1, true));
  next.addEventListener("click", () => loadTrack(trackIndex + 1, true));

  audio.addEventListener("play", () => setPlayState(true));
  audio.addEventListener("pause", () => setPlayState(false));

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

  audio.addEventListener("ended", () => loadTrack(trackIndex + 1, true));

  audio.addEventListener("error", () => {
    console.error(`Could not load ${tracks[trackIndex].src}`);
  });

  loadTrack(0, false);
})();
