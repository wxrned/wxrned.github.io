// player.js - Fully updated with minimal lyrics style

const mainContent = document.querySelector("main");
const overlay = document.getElementById("overlay");
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
const pfpImage = document.getElementById("dc-pfp");

const defaultFooterText = "𝖗𝖊𝖕𝖚𝖙𝖆𝖙𝖎𝖔𝖓";

const tracks = [
  { title: "Playboi Carti - 24 Songs", path: "assets/music/24Songs.mp3" },
  { title: "Yeat - The Bell", path: "assets/music/TheBell.mp3" },
  { title: "Destroy Lonely - how u feel?", path: "assets/music/HowUFeel.mp3" },
  { title: "Ken Carson - Succubus", path: "assets/music/Succubus.mp3" },
  { title: "Ken Carson - Green Room", path: "assets/music/GreenRoom.mp3" },
  { title: "Yeat - No morë talk", path: "assets/music/NoMoreTalk.mp3" },
  { title: "Yeat - ILUV", path: "assets/music/ILUV.mp3" },
  { title: "Ken Carson - Money Spread", path: "assets/music/MoneySpread.mp3" },
  { title: "Yeat - Talk", path: "assets/music/Talk.mp3" },
  { title: "Destroy Lonely - THRILL", path: "assets/music/THRILL.mp3" },
  { title: "Ken Carson - loading", path: "assets/music/Loading.mp3" },
  { title: "Che - I Rot, I Rot", path: "assets/music/IRotIRot.mp3" },
  { title: "yuke - my bad", path: "assets/music/mybad.mp3" },
  { title: "yuke - RRegret", path: "assets/music/RRegret.mp3" },
  { title: "OsamaSon - Troops", path: "assets/music/Troops.mp3" },
  { title: "OsamaSon - Freestyle", path: "assets/music/Freestyle.mp3" },
  { title: "Nettspend - F*CK SWAG", path: "assets/music/FCKSWAG.mp3" },
  { title: "Che - Sayso", path: "assets/music/Sayso.mp3" },
  { title: "Che - sos", path: "assets/music/sos.mp3" },
  { title: "Yeat - Cali", path: "assets/music/Cali.mp3" },
  { title: "Ufo361 - RICK OWENS", path: "assets/music/RICKOWENS.mp3" },
  { title: "Yeat - TURNMEUP", path: "assets/music/TURNMEUP.mp3" },
  { title: "Devstacks - 4pf", path: "assets/music/4pf.mp3" },
  { title: "LUCKI - Where I Be", path: "assets/music/WhereIBe.mp3" },
  { title: "Summrs - nobody knows", path: "assets/music/NobodyKnows.mp3" },
  { title: "ksuuvi - runnin", path: "assets/music/runnin.mp3" },
  { title: "ksuuvi - bape shit", path: "assets/music/BapeShit.mp3" },
  { title: "ksuuvi - not tuesday", path: "assets/music/NotTuesday.mp3" },
  { title: "Nettspend - What they say", path: "assets/music/WhatTheySay.mp3" },
  {
    title: "Nettspend - nothing like uuu",
    path: "assets/music/NothingLikeUuu.mp3",
  },
  { title: "Nettspend - Tommy", path: "assets/music/Tommy.mp3" },
  {
    title: "Nettspend - Skipping Class",
    path: "assets/music/SkippingClass.mp3",
  },
  { title: "Swapa - Nugget", path: "assets/music/Nugget.mp3" },
  { title: "Che - ON FLEEK", path: "assets/music/OnFleek.mp3" },
  { title: "Che - SLAM PUNK", path: "assets/music/SlamPunk.mp3" },
  { title: "Che - ROLLING STONE", path: "assets/music/RollingStone.mp3" },
  { title: "Ken Carson - 200 Kash", path: "assets/music/200Kash.mp3" },
  { title: "snakechildpain - kookoo", path: "assets/music/kookoo.mp3" },
  { title: "snakechildpain - hilfiger", path: "assets/music/hilfiger.mp3" },
  {
    title: "Destroy Lonely - vvs valentine",
    path: "assets/music/vvsvalentine.mp3",
  },
];

tracks.forEach((track) => {
  const [artist, song] = track.title.split(" - ");
  track.artist = artist;
  track.song = song;
});

audioPlayer.volume = 0.1;
let currentTrack = 0;
let isDragging = false;
let lastTrackPlayed = null;
let lastRenderedIndex = -1;
let cachedLyrics = null;
let abortController;

// ============================================
// ALBUM COVER FUNCTIONS
// ============================================

async function fetchLastFmAlbumCover(artist, title) {
  try {
    const apiUrl = `https://api.wxrn.lol/lastfm/cover?artist=${encodeURIComponent(
      artist
    )}&track=${encodeURIComponent(title)}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error("Last.fm API error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    if (data.imageUrl) {
      return data.imageUrl;
    }
    return null;
  } catch (error) {
    console.error("Error fetching Last.fm album cover:", error);
    return null;
  }
}

function updateAlbumCover(imageUrl) {
  if (imageUrl) {
    if (!pfpImage.dataset.originalSrc) {
      pfpImage.dataset.originalSrc = pfpImage.src;
      pfpImage.dataset.originalWidth = pfpImage.style.width || "";
      pfpImage.dataset.originalHeight = pfpImage.style.height || "";
      pfpImage.dataset.originalObjectFit = pfpImage.style.objectFit || "";
    }
    pfpImage.dataset.isAlbumCover = "true";
    pfpImage.src = imageUrl;

    const img = new Image();
    img.onload = () => {
      pfpImage.style.width = img.width + "px";
      pfpImage.style.height = img.height + "px";
      pfpImage.style.objectFit = "cover";
    };
    img.src = pfpImage.dataset.originalSrc || pfpImage.src;
  } else {
    if (pfpImage.dataset.originalSrc) {
      pfpImage.dataset.isAlbumCover = "false";
      pfpImage.src = pfpImage.dataset.originalSrc;
      pfpImage.style.width = pfpImage.dataset.originalWidth;
      pfpImage.style.height = pfpImage.dataset.originalHeight;
      pfpImage.style.objectFit = pfpImage.dataset.originalObjectFit;
      delete pfpImage.dataset.originalSrc;
      delete pfpImage.dataset.originalWidth;
      delete pfpImage.dataset.originalHeight;
      delete pfpImage.dataset.originalObjectFit;
    }
  }
}

// ============================================
// PLAYER CONTROLS
// ============================================

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

function createLyricsQuery(track) {
  const accentsMap = {
    à: "a",
    á: "a",
    â: "a",
    ä: "a",
    å: "a",
    æ: "ae",
    ç: "c",
    è: "e",
    é: "e",
    ê: "e",
    ë: "e",
    ì: "i",
    í: "i",
    î: "i",
    ï: "i",
    ð: "d",
    ñ: "n",
    ò: "o",
    ó: "o",
    ô: "o",
    ö: "o",
    ø: "o",
    ù: "u",
    ú: "u",
    û: "u",
    ü: "u",
    ý: "y",
    ÿ: "y",
    ß: "ss",
  };

  const normalizedTitle = track.title
    .toLowerCase()
    .replace(/ - /g, " ")
    .split("")
    .map((char) => accentsMap[char] || char)
    .join("");

  track.lyricsQuery = normalizedTitle;
}

function showDefaultFooter(animationClass) {
  footer.textContent = defaultFooterText;
  footer.classList.remove("slide-in-right", "slide-in-left");
  void footer.offsetWidth;
  footer.classList.add(animationClass);
}

// ============================================
// LYRICS FETCHING
// ============================================

async function fetchLyrics(songName, artistName) {
  const response = await fetch(
    `https://api.wxrn.lol/lyrics?song=${encodeURIComponent(
      songName
    )}&artist=${encodeURIComponent(artistName)}`
  );

  if (!response.ok) throw new Error("Network response was not ok");

  const data = await response.json();

  if (!data.lyrics) {
    throw new Error("No lyrics found");
  }

  return data.lyrics;
}

// ============================================
// LYRICS DISPLAY - MINIMAL STYLE
// ============================================

// Ensure lyrics display container exists
function getLyricsDisplay() {
  let lyricsDisplay = document.getElementById('lyricsDisplay');
  if (!lyricsDisplay) {
    lyricsDisplay = document.createElement('div');
    lyricsDisplay.id = 'lyricsDisplay';
    lyricsDisplay.className = 'lyrics-display';
    
    let lyricsPopup = document.getElementById('lyrics-popup');
    if (!lyricsPopup) {
      lyricsPopup = document.createElement('div');
      lyricsPopup.id = 'lyrics-popup';
      lyricsPopup.innerHTML = `
        <div class="lyrics-header">
          <h2>𐕣 lyrics 𐕣</h2>
          <button class="lyrics-close" id="lyrics-close">✕</button>
        </div>
        <div class="lyrics-display-container" id="lyrics-display-container">
          <div id="lyricsDisplay"><div class="loading"></div></div>
        </div>
      `;
      document.body.appendChild(lyricsPopup);
      lyricsDisplay = lyricsPopup.querySelector('#lyricsDisplay');
    } else {
      const container = lyricsPopup.querySelector('.lyrics-display-container');
      if (container && !container.querySelector('#lyricsDisplay')) {
        container.innerHTML = '';
        const newDisplay = document.createElement('div');
        newDisplay.id = 'lyricsDisplay';
        newDisplay.className = 'lyrics-display';
        newDisplay.innerHTML = '<div class="loading"></div>';
        container.appendChild(newDisplay);
        lyricsDisplay = newDisplay;
      } else if (container) {
        lyricsDisplay = container.querySelector('#lyricsDisplay');
      }
    }
  }
  return lyricsDisplay;
}

// MINIMAL LYRICS DISPLAY - Shows previous, current, and next lines
async function displayLyrics(songName, artistName, audioPlayer) {
  const lyricsDisplay = getLyricsDisplay();
  
  if (!lyricsDisplay) {
    console.warn('Lyrics display element not found');
    return;
  }
  
  console.log("🎵 Displaying lyrics for:", songName, artistName);
  
  if (!songName || !artistName) {
    lyricsDisplay.innerHTML = "<div class='error-display'>No lyrics available</div>";
    return;
  }
  
  lyricsDisplay.innerHTML = "<div class='loading'>Loading lyrics...</div>";
  lyricsDisplay.style.color = "white";

  try {
    const lyricsArray = await fetchLyrics(songName, artistName);
    console.log("Fetched lyrics array:", lyricsArray);

    if (!lyricsArray || !lyricsArray.length) {
      lyricsDisplay.innerHTML = "<div class='error-display'>No lyrics available</div>";
      return;
    }

    // Build minimal lyrics HTML
    let lyricsHTML = `<div class="lyrics-wrapper">`;
    lyricsHTML += `<div class="lyric-line title">${artistName}<br><span style="font-size:14px;opacity:0.2;">—</span><br>${songName}</div>`;
    
    // Store all lyric lines with their indices
    lyricsHTML += `<div class="lyrics-container">`;
    lyricsArray.forEach((line, index) => {
      const className = index === 0 ? 'lyric-line highlight' : 'lyric-line';
      lyricsHTML += `<div class="${className}" data-time="${line.timestamp}" data-index="${index}">${line.lyrics}</div>`;
    });
    lyricsHTML += `</div>`;
    lyricsHTML += `</div>`;
    
    lyricsDisplay.innerHTML = lyricsHTML;
    
    // Initialize highlight state
    setTimeout(() => {
      updateMinimalLyricsHighlight();
    }, 100);
    
    // Add timeupdate listener for highlighting
    if (audioPlayer) {
      audioPlayer.removeEventListener('timeupdate', updateMinimalLyricsHighlight);
      audioPlayer.addEventListener('timeupdate', updateMinimalLyricsHighlight);
    }
    
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    lyricsDisplay.innerHTML = "<div class='error-display'>No lyrics available</div>";
  }
}

// MINIMAL HIGHLIGHT - Shows previous, current, and next lines
function updateMinimalLyricsHighlight() {
  const lyricsContainer = document.querySelector('.lyrics-container');
  if (!lyricsContainer) return;
  
  const currentTime = audioPlayer.currentTime * 1000;
  const allLines = lyricsContainer.querySelectorAll('.lyric-line');
  
  if (allLines.length === 0) return;
  
  // Find current line index
  let currentIndex = -1;
  allLines.forEach((line, index) => {
    const timestamp = parseInt(line.dataset.time);
    if (timestamp && currentTime >= timestamp) {
      currentIndex = index;
    }
  });
  
  // If no line found, show first line
  if (currentIndex === -1 && allLines.length > 0) {
    currentIndex = 0;
  }
  
  // Update visibility - only show previous, current, and next
  allLines.forEach((line, index) => {
    // Hide all lines by default
    line.style.display = 'none';
    line.classList.remove('highlight', 'previous', 'next');
    
    // Only show previous, current, and next lines
    if (index === currentIndex) {
      line.style.display = 'block';
      line.classList.add('highlight');
    } else if (index === currentIndex - 1) {
      line.style.display = 'block';
      line.classList.add('previous');
    } else if (index === currentIndex + 1) {
      line.style.display = 'block';
      line.classList.add('next');
    }
  });
  
  // Ensure at least one line is visible
  const visibleLines = lyricsContainer.querySelectorAll('.lyric-line[style*="display: block"]');
  if (visibleLines.length === 0 && allLines.length > 0) {
    allLines[0].style.display = 'block';
    allLines[0].classList.add('highlight');
  }
}

// ============================================
// LYRICS POPUP CONTROLS
// ============================================

function closeLyricsPopup() {
  const lyricsPopup = document.getElementById('lyrics-popup');
  const overlay = document.getElementById('overlay');
  const avatarDecoration = document.getElementById('avatar-decoration');
  
  if (lyricsPopup) {
    lyricsPopup.classList.remove('show');
  }
  if (overlay) {
    overlay.classList.remove('show');
    overlay.style.display = 'block';
  }
  if (mainContent) {
    mainContent.classList.remove('no-click');
  }
  if (avatarDecoration) {
    avatarDecoration.classList.remove('fade-out');
  }
  
  setTimeout(() => {
    if (lyricsPopup) lyricsPopup.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
  }, 300);
}

function openLyricsPopup() {
  const lyricsPopup = document.getElementById('lyrics-popup');
  const overlay = document.getElementById('overlay');
  const avatarDecoration = document.getElementById('avatar-decoration');
  const visualizer = document.getElementById('visualizer');
  
  if (lyricsPopup) {
    lyricsPopup.style.display = 'block';
    setTimeout(() => {
      lyricsPopup.classList.add('show');
    }, 10);
  }
  if (overlay) {
    overlay.style.display = 'block';
    setTimeout(() => {
      overlay.classList.add('show');
    }, 10);
  }
  if (mainContent) {
    mainContent.classList.add('no-click');
  }
  if (avatarDecoration) {
    avatarDecoration.classList.add('fade-out');
  }
  if (visualizer) {
    visualizer.style.display = 'block';
  }
}

// ============================================
// LOAD TRACK
// ============================================

function loadTrack(index, animationClass) {
  currentTrack = index;
  audioPlayer.src = tracks[currentTrack].path;
  footer.textContent = `𐕣 ${tracks[currentTrack].title} 𐕣`;
  footer.classList.remove("slide-in-right", "slide-in-left");
  void footer.offsetWidth;
  footer.classList.add(animationClass);
  displayLyrics(
    tracks[currentTrack].song,
    tracks[currentTrack].artist,
    audioPlayer
  );
}

// ============================================
// EVENT LISTENERS
// ============================================

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
    footer.textContent = `𐕣 ${tracks[currentTrack].title} 𐕣`;
    footer.classList.remove("slide-in-right", "slide-in-left");
    void footer.offsetWidth;
    footer.classList.add("slide-in-right");
  } else {
    audioPlayer.pause();
    playPauseBtn.innerHTML = '<i class="icon fa-solid fa-play"></i>';
    showDefaultFooter("slide-in-right");
  }
});

if (lyricsCloseBtn) {
  lyricsCloseBtn.addEventListener('click', closeLyricsPopup);
}

if (lyricsButton) {
  lyricsButton.addEventListener('click', openLyricsPopup);
}

if (footer) {
  footer.addEventListener('click', openLyricsPopup);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const lyricsPopup = document.getElementById('lyrics-popup');
    if (lyricsPopup && lyricsPopup.classList.contains('show')) {
      closeLyricsPopup();
    }
  }
});

if (overlay) {
  overlay.addEventListener('click', (e) => {
    const lyricsPopup = document.getElementById('lyrics-popup');
    if (lyricsPopup && lyricsPopup.classList.contains('show')) {
      closeLyricsPopup();
    }
  });
}

// ============================================
// VOLUME CONTROLS
// ============================================

if (volumeSlider) {
  volumeSlider.addEventListener("input", function () {
    audioPlayer.volume = this.value;
  });
  volumeSlider.value = audioPlayer.volume;
}

if (volumeButton) {
  volumeButton.addEventListener("mouseenter", showSlider);
  volumeButton.addEventListener("mouseleave", () => {
    setTimeout(() => {
      if (!volumeSlider.matches(":hover")) {
        hideSlider();
      }
    }, 100);
  });
}

if (volumeSlider) {
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
}

// ============================================
// WINDOW ONLOAD
// ============================================

window.onload = async function () {
  tracks.forEach((track) => {
    createLyricsQuery(track);
  });

  loadRandomTrack();
  
  const currentTrackData = tracks[currentTrack];
  if (currentTrackData && currentTrackData.song && currentTrackData.artist) {
    displayLyrics(currentTrackData.song, currentTrackData.artist, audioPlayer);
  }

  if (nextBtn) nextBtn.addEventListener("click", playNextTrack);
  if (prevBtn) prevBtn.addEventListener("click", playPrevTrack);

  if (audioPlayer) {
    audioPlayer.addEventListener("ended", playNextTrack);
    audioPlayer.addEventListener("timeupdate", updateSeekBar);
  }

  showDefaultFooter("slide-in-right");
};

// ============================================
// MUSIC FILES FETCHING (for dynamic loading)
// ============================================

async function fetchMusicFiles() {
  try {
    const response = await fetch("/assets/music/");
    if (!response.ok) throw new Error("Failed to fetch music files");

    const text = await response.text();
    const fileNames = [...text.matchAll(/href="([^"]+\.m4a)"/g)].map(
      (match) => match[1]
    );

    if (fileNames.length === 0) throw new Error("No music files found");

    const trackPromises = fileNames.map(async (file) => {
      const cleanName = decodeURIComponent(
        file.replace(".m4a", "").replace(/_/g, " ")
      );

      const [artist, title] = cleanName.includes(" - ")
        ? cleanName.split(" - ")
        : ["Unknown", cleanName];

      const track = {
        title: `${artist} - ${title.split(" [")[0]}`,
        path: `/assets/music/${file}`,
      };

      try {
        const blob = await fetch(track.path).then((res) => res.blob());
        const fileObj = new File([blob], file, { type: "audio/m4a" });

        const tagData = await new Promise((resolve, reject) => {
          jsmediatags.read(fileObj, {
            onSuccess: function (tag) {
              resolve(tag.tags);
            },
            onError: function (error) {
              reject(error);
            },
          });
        });

        if (tagData) {
          track.title = tagData.title || track.title;
          track.artist = tagData.artist || artist;
        }
      } catch (error) {
        console.warn("Error fetching metadata for", track.path, error);
      }

      return track;
    });

    tracks = await Promise.all(trackPromises);

    loadRandomTrack();
  } catch (error) {
    console.error("Error fetching music files:", error);
  }
}

async function extractMetadata(filePath) {
  const response = await fetch(filePath);
  const arrayBuffer = await response.arrayBuffer();
  const blob = new Blob([arrayBuffer]);

  const jsmediatags = await import(
    "https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js"
  );

  return new Promise((resolve, reject) => {
    jsmediatags.default.read(blob, {
      onSuccess: (tag) => {
        let metadata = {
          title: tag.tags.title || null,
          artist: tag.tags.artist || null,
          albumCover: null,
        };

        if (tag.tags.picture) {
          let { data, format } = tag.tags.picture;
          let base64String = "";
          for (let i = 0; i < data.length; i++) {
            base64String += String.fromCharCode(data[i]);
          }
          metadata.albumCover = `data:${format};base64,${btoa(base64String)}`;
        }

        resolve(metadata);
      },
      onError: (error) => {
        console.error("Metadata extraction error:", error);
        resolve({});
      },
    });
  });
}

console.log("🎵 Player.js loaded");