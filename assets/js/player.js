const audioPlayer = document.getElementById("audio");
const playPauseBtn = document.getElementById("play-pause");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const footer = document.getElementById("footer");
const seekBar = document.getElementById("seek-bar");
const volumeSlider = document.getElementById("volume-slider");
const volumeButton = document.getElementById("volume-button");
const lyricsButton = document.getElementById('lyrics-button');
const lyricsOverlay = document.getElementById('lyrics-overlay');
const lyricsDisplay = document.getElementById('lyricsDisplay');

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
let sliderVisible = false;
let isHovering = false;

function showSlider() {
  isHovering = true;
  volumeSlider.style.display = 'block';
  setTimeout(() => {
    if (isHovering) {
      volumeSlider.classList.add('show');
    }
  }, 10);
}

function hideSlider() {
  isHovering = false;
  volumeSlider.classList.remove('show');
  setTimeout(() => {
    if (!isHovering) {
      volumeSlider.style.display = 'none';
    }
  }, 300);
}

async function fetchLyrics(currentSongName) {
  if (!currentSongName) return;

  try {
    let response = await fetch(`https://api.wxrn.lol/api/lyrics?query=${currentSongName}`);

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();

    if (data.lyrics) {
      return data.lyrics; // Return the fetched lyrics
    } else {
      console.warn('No lyrics available for this track.');
      return "Lyrics not available.";
    }
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return "Error fetching lyrics.";
  }
}

function loadTrack(index, animationClass) {
  currentTrack = index;
  audioPlayer.src = tracks[currentTrack].path;
  footer.textContent = `〤 ${tracks[currentTrack].title} 〤`;
  
  footer.classList.remove("slide-in-right", "slide-in-left");
  void footer.offsetWidth;
  footer.classList.add(animationClass);

  fetchLyrics(tracks[currentTrack].title).then(lyrics => {
    displayLyrics(lyrics); // Display the fetched lyrics
  });
}

function displayLyrics(lyrics) {
  lyricsDisplay.innerHTML = lyrics; // Set the fetched lyrics in the display
  lyricsOverlay.style.display = 'flex'; // Show the overlay
}

function closeLyrics() {
  lyricsOverlay.style.display = 'none'; // Hide overlay
  lyricsDisplay.innerHTML = ''; // Clear previous lyrics
}

function playNextTrack() {
  const nextTrack = (currentTrack + 1) % tracks.length;
  loadTrack(nextTrack, "slide-in-right");
  audioPlayer.play();
  playPauseBtn.innerHTML = '<i class="icon fa-solid fa-pause"></i>';
}

function loadRandomTrack() {
  const randomIndex = Math.floor(Math.random() * tracks.length);
  loadTrack(randomIndex, "slide-in-right");
  fetchLyrics(tracks[randomIndex].title).then(lyrics => {
    displayLyrics(lyrics); // Display lyrics for the randomly loaded track
  });
}

function showDefaultFooter(animationClass) {
  footer.textContent = defaultFooterText;

  // Apply animation
  footer.classList.remove("slide-in-right", "slide-in-left");
  void footer.offsetWidth;
  footer.classList.add(animationClass);
}

// Event listeners
playPauseBtn.addEventListener("click", () => {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playPauseBtn.innerHTML = '<i class="icon fa-solid fa-pause"></i>';
  } else {
    audioPlayer.pause();
    playPauseBtn.innerHTML = '<i class="icon fa-solid fa-play"></i>';
  }
});

prevBtn.addEventListener("click", () => {
  const prevTrack = (currentTrack - 1 + tracks.length) % tracks.length;
  loadTrack(prevTrack, "slide-in-left");
  audioPlayer.play();
  playPauseBtn.innerHTML = '<i class="icon fa-solid fa-pause"></i>';
});

nextBtn.addEventListener("click", playNextTrack);

volumeButton.addEventListener("mouseover", showSlider);
volumeButton.addEventListener("mouseout", hideSlider);

volumeSlider.addEventListener("mousemove", (e) => {
  const volume = e.clientX / volumeSlider.clientWidth;
  audioPlayer.volume = Math.min(Math.max(volume, 0), 1); // Clamp between 0 and 1
});

volumeSlider.addEventListener("mouseup", hideSlider);
volumeSlider.addEventListener("mouseleave", hideSlider);

lyricsButton.addEventListener('click', () => {
  displayLyrics(lyricsDisplay.innerHTML); // Show lyrics overlay when button is clicked
});

// Event listener to load random track
window.addEventListener("load", () => {
  loadRandomTrack();
  showDefaultFooter("slide-in-right");
});
