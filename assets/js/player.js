const audioPlayer = document.getElementById("audio");
const playPauseBtn = document.getElementById("play-pause");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const footer = document.getElementById("footer");
const platformsBtn = document.getElementById("platform-button");
const linksPopup = document.getElementById("pf-links");
const seekBar = document.getElementById("seek-bar"); // Seek bar reference
const volumeSlider = document.getElementById("volume-slider");
const volumeButton = document.getElementById("volume-button");
const lyricsButton = document.getElementById("lyrics-button");
const lyricsPopup = document.getElementById("lyrics-popup");
const lyricsDisplay = document.getElementById("lyricsDisplay");
const lyricsCloseBtn = document.getElementById("lyrics-close");

const API_URL = "https://api.wxrn.lol/api/lyrics";
let lastRenderedIndex = -1;

const defaultFooterText = "〤 CutNation 〤";

const tracks = [
  {
    title: "Destroy Lonely - if looks could kill",

    path: "assets/music/iflookscouldkill.mp3",

    spotifyId: "7cFLFmj3fLV5wxhcFfol7u",
  },

  {
    title: "Ken Carson - Succubus",

    path: "assets/music/Succubus.mp3",

    spotifyId: "2pcv4nUQqaZnJk1kYvCfXV",
  },

  {
    title: "Don Toliver - Bandit",

    path: "assets/music/Bandit.mp3",

    spotifyId: "7sTyAjxDXq9afwfSQy6D0s",
  },

  {
    title: "Yeat - Shade",

    path: "assets/music/Shade.mp3",

    spotifyId: "3vpocwyn0RvKzeXo1tzSrW",
  },

  {
    title: "che x SEMATARY - 666",

    path: "assets/music/666.mp3",

    spotifyId: "24NLox01SY6fAwwGS3qr0g",
  },

  {
    title: "SGGKobe - thrax",

    path: "assets/music/thrax.mp3",

    spotifyId: "1P6ZWbU95Y5issu4KXTpwz",
  },

  {
    title: "Ndotz - Embrace It",

    path: "assets/music/EmbraceIt.mp3",

    spotifyId: "0io16MKpbeDIdYzmGpQaES",
  },

  {
    title: "DJ Scheme - Blue Bills",

    path: "assets/music/BlueBills.mp3",

    spotifyId: "2ODUTBkiOWoYSUjKpGJxQE",
  },

  {
    title: "Ken Carson - Green Room",

    path: "assets/music/GreenRoom.mp3",

    spotifyId: "3MtB4aOzFkXJvAREmsy1Dj",
  },

  {
    title: "Ken Carson - RICK OWENS",

    path: "assets/music/RickOwens.mp3",

    spotifyId: "6VASMtJitNcGLlsWhPb9BC",
  },

  {
    title: "Ken Carson - Lose It",

    path: "assets/music/LoseIt.mp3",

    spotifyId: "5ZY2fIqxuKDr5pdz0ucpRz",
  },

  {
    title: "Anuel AA - LHNA",

    path: "assets/music/LHNA.mp3",

    spotifyId: "0pLZ7PPAId3OLfVIPTVAz5",
  },

  {
    title: "Anuel AA - Diamantes en Mis Dientes",

    path: "assets/music/DiamantesEnMisDientes.mp3",

    spotifyId: "5c3idBIe2HEX04QkMyfmTY",
  },

  {
    title: "$uicideboy$ - Bizarro",

    path: "assets/music/Bizarro.mp3",

    spotifyId: "3wYnfIWrBYOHx9MR3EcJzu",
  },

  {
    title: "King Von - 2 A.M.",

    path: "assets/music/2AM.mp3",

    spotifyId: "3PjSkZGM7rpNPymaesfZte",
  },

  {
    title: "$uicideboy$ - 1000 Blunts",

    path: "assets/music/1000Blunts.mp3",

    spotifyId: "09riz9pAPJyYYDVynE5xxY",
  },

  {
    title: "Yeat - Mountain Climbërs",

    path: "assets/music/MountainClimbers.mp3",

    spotifyId: "3Mq0oy9rLoyu6OEN10nbBt",
  },

  {
    title: "Khea x Duki - Loca",

    path: "assets/music/Loca.mp3",

    spotifyId: "0vnrhysrKKRdNYFKLAGzRc",
  },

  {
    title: "Destroy Lonely - NEVEREVER",

    path: "assets/music/NEVEREVER.mp3",

    spotifyId: "610gzNqwaSz89u6YIpDlyZ",
  },

  {
    title: "Duki - Goteo",

    path: "assets/music/Goteo.mp3",

    spotifyId: "1EoEU4HY57qaITp06TkC6B",
  },

  {
    title: "che - GET NAKED",

    path: "assets/music/GetNaked.mp3",

    spotifyId: "0MpX5XdebuePxim7XJBp8d",
  },

  {
    title: "Playboi Carti - Fell In Luv",

    path: "assets/music/FellInLuv.mp3",

    spotifyId: "1s9DTymg5UQrdorZf43JQm",
  },

  {
    title: "Probleemkind - Who's back",

    path: "assets/music/WhosBack.mp3",

    spotifyId: "5pvJTtwDTjiXJLHcH9putR",
  },

  {
    title: "Yeat - No morë talk",

    path: "assets/music/NoMoreTalk.mp3",

    spotifyId: "7qPiAhk71D2RqLRtnjDL76",
  },
];

let currentTrack = 0;
audioPlayer.volume = 0.1;
let isDragging = false;
let isHovering = false;

function showSlider() {
  volumeSlider.style.display = "block";
  setTimeout(() => volumeSlider.classList.add("show"), 10);
}

function hideSlider() {
  volumeSlider.classList.remove("show");
  setTimeout(() => (volumeSlider.style.display = "none"), 300);
}

function playNextTrack() {
  currentTrack = (currentTrack + 1) % tracks.length;
  playPauseBtn.innerHTML = '<i class="icon fa-solid fa-pause"></i>';
  loadTrack(currentTrack, "slide-in-right");
  audioPlayer.play();
}

function playPrevTrack() {
  currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
  playPauseBtn.innerHTML = '<i class="icon fa-solid fa-pause"></i>';
  loadTrack(currentTrack, "slide-in-left");
  audioPlayer.play();
}

function updateSeekBar() {
  if (!isDragging) {
    const seekPercentage =
      (audioPlayer.currentTime / audioPlayer.duration) * 100;
    seekBar.value = seekPercentage || 0;
  }
}

seekBar.addEventListener("input", (e) => {
  isDragging = true;
  const seekTo = (e.target.value / 100) * audioPlayer.duration;
  audioPlayer.currentTime = seekTo;
  isDragging = false;
});

playPauseBtn.addEventListener("click", () => {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playPauseBtn.innerHTML = '<i class="icon fa-solid fa-pause"></i>';
    footer.textContent = `ʚ ${tracks[currentTrack].title} ɞ`;
    footer.classList.remove("slide-in-right", "slide-in-left");
    void footer.offsetWidth;
    footer.classList.add("slide-in-right");
  } else {
    audioPlayer.pause();
    playPauseBtn.innerHTML = '<i class="icon fa-solid fa-play"></i>';
    showDefaultFooter("slide-in-right");
  }
});

function loadTrack(index, animationClass) {
  currentTrack = index;
  audioPlayer.src = tracks[currentTrack].path;
  footer.textContent = `〤 ${tracks[currentTrack].title} 〤`;
  footer.classList.remove("slide-in-right", "slide-in-left");
  void footer.offsetWidth;
  footer.classList.add(animationClass);
}

lyricsButton.addEventListener("click", () => {
  lyricsPopup.style.display = "block";
  setTimeout(() => lyricsPopup.classList.add("show"), 10);
  displayLyrics();
});

lyricsCloseBtn.addEventListener("click", () => {
  lyricsPopup.classList.remove("show");
  setTimeout(() => (lyricsPopup.style.display = "none"), 300);
});

function shuffleTracks() {
  for (let i = tracks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
  }
}

function loadRandomTrack() {
  shuffleTracks();
  loadTrack(0, "slide-in-right");
}

async function fetchLyrics(track) {
  try {
    const response = await fetch(
      `${API_URL}?query=${encodeURIComponent(track)}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return null;
  }
}

async function displayLyrics() {
  const lyricsArray = await fetchLyrics(tracks[currentTrack].title);
  if (lyricsArray.error) {
    lyricsDisplay.innerHTML = "No lyrics available.";
    return;
  }
  else lyricsDisplay.innerHTML = "";

  const lyricsWrapper = document.createElement("div");
  lyricsWrapper.className = "lyrics-wrapper";
  lyricsDisplay.appendChild(lyricsWrapper);

  audioPlayer.addEventListener("timeupdate", () => {
    const currentTime = audioPlayer.currentTime;
    let currentIndex = 0;

    for (let i = 0; i < lyricsArray.length; i++) {
      if (currentTime >= lyricsArray[i].seconds) {
        currentIndex = i;
      } else {
        break;
      }
    }

    if (currentIndex !== lastRenderedIndex) {
      lastRenderedIndex = currentIndex;

      lyricsWrapper.innerHTML = "";

      if (currentIndex > 0) {
        const prevLine = document.createElement("div");
        prevLine.className = "lyric-line previous";
        prevLine.textContent = lyricsArray[currentIndex - 1].lyrics;
        lyricsWrapper.appendChild(prevLine);
      }

      const currentLine = document.createElement("div");
      currentLine.className = "lyric-line highlight slide-in";
      currentLine.textContent = lyricsArray[currentIndex].lyrics;
      lyricsWrapper.appendChild(currentLine);

      if (currentIndex < lyricsArray.length - 1) {
        const nextLine = document.createElement("div");
        nextLine.className = "lyric-line next slide-in";
        nextLine.textContent = lyricsArray[currentIndex + 1].lyrics;
        lyricsWrapper.appendChild(nextLine);
      }

      lyricsWrapper.style.display = "block";

      currentLine.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

function showDefaultFooter(animationClass) {
  footer.textContent = defaultFooterText;

  footer.classList.remove("slide-in-right", "slide-in-left");
  void footer.offsetWidth;
  footer.classList.add(animationClass);
}

nextBtn.addEventListener("click", playNextTrack);
prevBtn.addEventListener("click", playPrevTrack);

audioPlayer.addEventListener("ended", playNextTrack);
audioPlayer.addEventListener("timeupdate", updateSeekBar);

volumeSlider.addEventListener("input", function () {
  volumeValue = this.value / 100;
  document.documentElement.style.setProperty("--volume", volumeValue);
});

volumeButton.addEventListener("mouseenter", showSlider);
volumeButton.addEventListener("mouseleave", () => {
  setTimeout(() => {
    if (!volumeSlider.matches(":hover")) {
      hideSlider();
    }
  }, 100);
});

volumeSlider.addEventListener("mouseenter", () => {
  isHovering = true;
});

volumeSlider.addEventListener("mouseleave", () => {
  setTimeout(() => {
    if (!volumeButton.matches(":hover")) {
      hideSlider();
    }
  }, 100);
});

volumeSlider.addEventListener("input", (e) => {
  audioPlayer.volume = e.target.value;
});

volumeSlider.value = audioPlayer.volume;

window.addEventListener("load", () => {
  loadRandomTrack();
  showDefaultFooter("slide-in-right");
});
