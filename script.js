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
  const shuffleButton = document.getElementById("shuffleButton");
  const playlistButton = document.getElementById("playlistButton");
  const playlistPanel = document.getElementById("playlistPanel");
  const playlist = document.getElementById("playlist");
  const closePlaylist = document.getElementById("closePlaylist");

  let trackIndex = 0;
  let shuffleEnabled = false;
  const durations = new Map();

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

  function updatePlaylistSelection() {
    playlist.querySelectorAll(".track-button").forEach((button, index) => {
      button.setAttribute("aria-current", index === trackIndex ? "true" : "false");
    });
  }

  function updatePlaylistDurations() {
    playlist.querySelectorAll(".track-button").forEach((button, index) => {
      const durationEl = button.querySelector(".playlist-duration");
      const value = durations.get(index);
      durationEl.textContent = value ? formatTime(value) : "--:--";
    });
  }

  function renderPlaylist() {
    playlist.innerHTML = "";

    tracks.forEach((track, index) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "track-button";
      button.setAttribute("aria-current", index === trackIndex ? "true" : "false");
      button.innerHTML = `
        <span>${index + 1}.</span>
        <span class="playlist-meta">
          <span class="playlist-title">${track.title}</span>
          <span class="playlist-artist">${track.artist}</span>
        </span>
        <span class="playlist-duration">--:--</span>
      `;
      button.addEventListener("click", () => loadTrack(index, true));
      item.appendChild(button);
      playlist.appendChild(item);
    });
  }

  function scanDurations() {
    tracks.forEach((track, index) => {
      const probe = document.createElement("audio");
      probe.preload = "metadata";
      probe.src = track.src;
      probe.addEventListener("loadedmetadata", () => {
        durations.set(index, probe.duration);
        updatePlaylistDurations();
      }, { once: true });
    });
  }

  function getNextIndex(direction = 1) {
    if (shuffleEnabled && tracks.length > 1) {
      let nextIndex = trackIndex;
      while (nextIndex === trackIndex) {
        nextIndex = Math.floor(Math.random() * tracks.length);
      }
      return nextIndex;
    }

    return (trackIndex + direction + tracks.length) % tracks.length;
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
    updatePlaylistSelection();
    audio.load();

    if (autoplay) {
      audio.play().catch(error => console.error("Playback failed:", error));
    }
  }

  function setPlaylistOpen(open) {
    playlistPanel.hidden = !open;
    playlistButton.setAttribute("aria-expanded", String(open));
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

  previous.addEventListener("click", () => {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    loadTrack(getNextIndex(-1), true);
  });

  next.addEventListener("click", () => loadTrack(getNextIndex(1), true));

  shuffleButton.addEventListener("click", () => {
    shuffleEnabled = !shuffleEnabled;
    shuffleButton.setAttribute("aria-pressed", String(shuffleEnabled));
  });

  playlistButton.addEventListener("click", () => {
    setPlaylistOpen(playlistPanel.hidden);
  });

  closePlaylist.addEventListener("click", () => {
    setPlaylistOpen(false);
  });

  audio.addEventListener("play", () => setPlayState(true));
  audio.addEventListener("pause", () => setPlayState(false));

  audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
    durations.set(trackIndex, audio.duration);
    updatePlaylistDurations();
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

  audio.addEventListener("ended", () => loadTrack(getNextIndex(1), true));

  renderPlaylist();
  scanDurations();
  loadTrack(0, false);
})();
