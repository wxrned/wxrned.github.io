const audioPlayer = document.getElementById("audio");
const playPauseBtn = document.getElementById("play-pause");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const footer = document.getElementById("footer");
const platformsBtn = document.getElementById("platform-button");
const linksPopup = document.getElementById("pf-links");
const seekBar = document.getElementById("seek-bar");
const volumeSlider = document.getElementById("volume-slider");
const volumeButton = document.getElementById("volume-button");
const lyricsPopup = document.getElementById("lyrics-popup");
const lyricsDisplay = document.getElementById("lyricsDisplay");
const lyricsCloseBtn = document.getElementById("lyrics-close");
const lyricsButton = document.getElementById("lyrics-button");
const mainContent = document.querySelector("main");

const API_URL = "https://api.wxrn.lol/api/lyrics";

const defaultFooterText = "〤 CutNation 〤";

const tracks = [
  {
    title: "Destroy Lonely - if looks could kill",
    path: "assets/music/iflookscouldkill.mp3",
    lyricsQuery: "destroy lonely if looks could kill",
  },
  {
    title: "1nonly x Jasiah - GHOSTKILLA",
    path: "assets/music/GHOSTKILLA.mp3",
    lyricsQuery: "1nonly ghostkilla",
  },
  {
    title: "Yeat - bigger thën everything",
    path: "assets/music/BiggerThenEverything.mp3",
    lyricsQuery: "yeat bigger then everything",
  },
  {
    title: "Rich Amiri - One Call",
    path: "assets/music/OneCall.mp3",
    lyricsQuery: "rich amiri one call",
  },
  {
    title: "SoFaygo - Hell Yeah",
    path: "assets/music/HellYeah.mp3",
    lyricsQuery: "sofaygo hell yeah",
  },
  {
    title: "Polo G - Pop Out",
    path: "assets/music/PopOut.mp3",
    lyricsQuery: "polo g pop out",
  },
  {
    title: "YNW Melly - Virtual",
    path: "assets/music/Virtual.mp3",
    lyricsQuery: "ynw melly virtual",
  },
  {
    title: "Yeat - Heavy stunts",
    path: "assets/music/HeavyStunts.mp3",
    lyricsQuery: "yeat heavy stunts",
  },
  {
    title: "Yeat - Tell më",
    path: "assets/music/TellMe.mp3",
    lyricsQuery: "yeat tell me",
  },
  {
    title: "Destroy Lonely - how u feel?",
    path: "assets/music/HowUFeel.mp3",
    lyricsQuery: "destroy lonely how u feel",
  },
  {
    title: "Yeat - Luv monëy",
    path: "assets/music/LuvMoney.mp3",
    lyricsQuery: "yeat luv money",
  },
  {
    title: " Internet Money - His & Hers",
    path: "assets/music/HisAndHers.mp3",
    lyricsQuery: "internet money his & hers",
  },
  {
    title: " Lil Tjay - Zoo York",
    path: "assets/music/ZooYork.mp3",
    lyricsQuery: "lil tjay zoo york",
  },
  {
    title: "Ken Carson - Succubus",
    path: "assets/music/Succubus.mp3",
    lyricsQuery: "ken carson succubus",
  },
  {
    title: "Don Toliver - Bandit",
    path: "assets/music/Bandit.mp3",
    lyricsQuery: "don toliver bandit",
  },
  {
    title: "Yeat - Shade",
    path: "assets/music/Shade.mp3",
    lyricsQuery: "yeat shade",
  },
  {
    title: "Ndotz - Embrace It",
    path: "assets/music/EmbraceIt.mp3",
    lyricsQuery: "ndotz embrace it",
  },
  {
    title: "DJ Scheme - Blue Bills",
    path: "assets/music/BlueBills.mp3",
    lyricsQuery: "dj scheme blue bills",
  },
  {
    title: "Ken Carson - Green Room",
    path: "assets/music/GreenRoom.mp3",
    lyricsQuery: "ken carson green room",
  },
  {
    title: "Ken Carson - Lose It",
    path: "assets/music/LoseIt.mp3",
    lyricsQuery: "ken carson lose it",
  },
  {
    title: "Anuel AA - LHNA",
    path: "assets/music/LHNA.mp3",
    lyricsQuery: "anuel aa lhna",
  },
  {
    title: "Anuel AA - Diamantes en Mis Dientes",
    path: "assets/music/DiamantesEnMisDientes.mp3",
    lyricsQuery: "anuel aa diamantes en mis dientes",
  },
  {
    title: "$uicideboy$ - Bizarro",
    path: "assets/music/Bizarro.mp3",
    lyricsQuery: "$uicideboy$ bizarro",
  },
  {
    title: "King Von - 2 A.M.",
    path: "assets/music/2AM.mp3",
    lyricsQuery: "king von 2am",
  },
  {
    title: "$uicideboy$ - 1000 Blunts",
    path: "assets/music/1000Blunts.mp3",
    lyricsQuery: "$uicideboy$ 1000 blunts",
  },
  {
    title: "Khea x Duki - Loca",
    path: "assets/music/Loca.mp3",
    lyricsQuery: "khea duki loca",
  },
  {
    title: "che - GET NAKED",
    path: "assets/music/GetNaked.mp3",
    lyricsQuery: "che get naked",
  },
  {
    title: "Playboi Carti - Fell In Luv",
    path: "assets/music/FellInLuv.mp3",
    lyricsQuery: "playboi carti fell in luv",
  },
  {
    title: "Yeat - No morë talk",
    path: "assets/music/NoMoreTalk.mp3",
    lyricsQuery: "yeat no more talk",
  },
];

audioPlayer.volume = 0.1;
let currentTrack = 0;
let isDragging = false;
let lastTrackPlayed = null;
let lastRenderedIndex = -1;
let cachedLyrics = null;
let abortController;

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
    const seekPercentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    seekBar.value = seekPercentage || 0;
  }
}

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
  displayLyrics(currentTrack);
}

async function fetchLyrics(track, options = {}) {
  const response = await fetch(`${API_URL}?query=${encodeURIComponent(track)}`, options);
  if (!response.ok) throw new Error("Network response was not ok");
  const data = await response.json();
  return data;
}

async function displayLyrics() {
  const playingTrack = tracks[currentTrack].lyricsQuery;
  lyricsDisplay.innerHTML = "<div class='loading'></div>";
  lyricsDisplay.style.color = "white";
  isLoading = true;

  try {
    const lyricsArray = await fetchLyrics(playingTrack);

    if (!lyricsArray || lyricsArray.error) {
      lyricsDisplay.innerHTML = "No lyrics available.";
      isLoading = false;
      return;
    }

    lyricsDisplay.textContent = "";

    const lyricsWrapper = document.createElement("div");
    lyricsWrapper.className = "lyrics-wrapper";
    lyricsDisplay.appendChild(lyricsWrapper);

    // Extract only the song title without the artist name (assuming "artist - songName" format)
    const fullTitle = tracks[currentTrack].title;
    const songTitle = fullTitle.includes(" - ") ? fullTitle.split(" - ")[1] : fullTitle;

    // Display the song title until the first lyrics appear
    lyricsWrapper.innerHTML = `<div class="lyric-line title">${songTitle}</div>`;

    const firstLyricTimestamp = lyricsArray.length > 0 ? lyricsArray[0].seconds : 0;
    let lastRenderedIndex = -1;

    const updateDisplayedLyrics = () => {
      const currentTime = audioPlayer.currentTime;

      if (currentTime < firstLyricTimestamp) {
        lyricsWrapper.innerHTML = `<div class="lyric-line title">${songTitle}</div>`;
        return;
      }

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
    };

    updateDisplayedLyrics();

    audioPlayer.removeEventListener("timeupdate", updateDisplayedLyrics);
    audioPlayer.addEventListener("timeupdate", updateDisplayedLyrics);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn("Fetch aborted for lyrics.");
    } else {
      lyricsDisplay.innerHTML = "<div class='loading'>Error fetching lyrics.</div>";
      console.error("Error fetching lyrics:", error);
      setTimeout(() => {
        lyricsDisplay.innerHTML = "<div class='error-display'>Error fetching lyrics.</div>";
      }, 1000);
    }
  } finally {
    isLoading = false;
  }
}

lyricsCloseBtn.addEventListener("click", () => {
  lyricsPopup.classList.remove("show");
  mainContent.classList.remove('no-click');
  setTimeout(() => (lyricsPopup.style.display = "none"), 300);
});

lyricsButton.addEventListener("click", () => {
  lyricsPopup.style.display = "block";
  mainContent.classList.add('no-click');
  lyricsPopup.classList.add("show");
});

footer.addEventListener("click", () => {
  lyricsPopup.style.display = "block";
  mainContent.classList.add('no-click');
  lyricsPopup.classList.add("show");
});

function showDefaultFooter(animationClass) {
  footer.textContent = defaultFooterText;
  footer.classList.remove("slide-in-right", "slide-in-left");
  void footer.offsetWidth;
  footer.classList.add(animationClass);
}

window.onload = function () {
  loadRandomTrack();
  displayLyrics(currentTrack);

  nextBtn.addEventListener("click", playNextTrack);
  prevBtn.addEventListener("click", playPrevTrack);

  audioPlayer.addEventListener("ended", () => {
    playNextTrack();
  });

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

  showDefaultFooter('slide-in-right');
};
