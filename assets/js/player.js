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
    { title: "Destroy Lonely - if looks could kill", path: "assets/music/iflookscouldkill.mp3", spotifyId: "7cFLFmj3fLV5wxhcFfol7u" },
    { title: "Ken Carson - Succubus", path: "assets/music/Succubus.mp3", spotifyId: "2pcv4nUQqaZnJk1kYvCfXV" },
    { title: "Don Toliver - Bandit", path: "assets/music/Bandit.mp3", spotifyId: "7sTyAjxDXq9afwfSQy6D0s" },
    { title: "Yeat - Shade", path: "assets/music/Shade.mp3", spotifyId: "3vpocwyn0RvKzeXo1tzSrW" },
    { title: "che x SEMATARY - 666", path: "assets/music/666.mp3", spotifyId: "24NLox01SY6fAwwGS3qr0g" },
    { title: "SGGKobe - thrax", path: "assets/music/thrax.mp3", spotifyId: "1P6ZWbU95Y5issu4KXTpwz" },
    { title: "Ndotz - Embrace It", path: "assets/music/EmbraceIt.mp3", spotifyId: "0io16MKpbeDIdYzmGpQaES" },
    { title: "DJ Scheme - Blue Bills", path: "assets/music/BlueBills.mp3", spotifyId: "2ODUTBkiOWoYSUjKpGJxQE" },
    { title: "Ken Carson - Green Room", path: "assets/music/GreenRoom.mp3", spotifyId: "3MtB4aOzFkXJvAREmsy1Dj" },
    { title: "Ken Carson - RICK OWENS", path: "assets/music/RickOwens.mp3", spotifyId: "6VASMtJitNcGLlsWhPb9BC" },
    { title: "Ken Carson - Lose It", path: "assets/music/LoseIt.mp3", spotifyId: "5ZY2fIqxuKDr5pdz0ucpRz" },
    { title: "Anuel AA - LHNA", path: "assets/music/LHNA.mp3", spotifyId: "0pLZ7PPAId3OLfVIPTVAz5" },
    { title: "Anuel AA - Diamantes en Mis Dientes", path: "assets/music/DiamantesEnMisDientes.mp3", spotifyId: "5c3idBIe2HEX04QkMyfmTY" },
    { title: "$uicideboy$ - Bizarro", path: "assets/music/Bizarro.mp3", spotifyId: "3wYnfIWrBYOHx9MR3EcJzu" },
    { title: "King Von - 2 A.M.", path: "assets/music/2AM.mp3", spotifyId: "3PjSkZGM7rpNPymaesfZte" },
    { title: "$uicideboy$ - 1000 Blunts", path: "assets/music/1000Blunts.mp3", spotifyId: "09riz9pAPJyYYDVynE5xxY" },
    { title: "Yeat - Mountain Climbërs", path: "assets/music/MountainClimbers.mp3", spotifyId: "3Mq0oy9rLoyu6OEN10nbBt" },
    { title: "Khea x Duki - Loca", path: "assets/music/Loca.mp3", spotifyId: "0vnrhysrKKRdNYFKLAGzRc" },
    { title: "Destroy Lonely - NEVEREVER", path: "assets/music/NEVEREVER.mp3", spotifyId: "610gzNqwaSz89u6YIpDlyZ" },
    { title: "Duki - Goteo", path: "assets/music/Goteo.mp3", spotifyId: "1EoEU4HY57qaITp06TkC6B" },
    { title: "che - GET NAKED", path: "assets/music/GetNaked.mp3", spotifyId: "0MpX5XdebuePxim7XJBp8d" },
    { title: "Playboi Carti - Fell In Luv", path: "assets/music/FellInLuv.mp3", spotifyId: "1s9DTymg5UQrdorZf43JQm" },
    { title: "Probleemkind - Who's back", path: "assets/music/WhosBack.mp3", spotifyId: "5pvJTtwDTjiXJLHcH9putR" },
    { title: "Yeat - No morë talk", path: "assets/music/NoMoreTalk.mp3", spotifyId: "7qPiAhk71D2RqLRtnjDL76" },
];

let currentTrack = 0;
audioPlayer.volume = 0.1;
let isDragging = false;
let sliderVisible = false;
let isHovering = false;

// Function to show lyrics in the overlay
function showLyrics(lyrics) {
    lyricsDisplay.innerHTML = lyrics.replace(/\n/g, "<br>"); // Replace newline with <br> for HTML display
}

// Fetch lyrics for the current song
async function fetchLyrics(currentSongName) {
    const apiUrl = `https://api.wxrn.lol/api/lyrics?query=${encodeURIComponent(currentSongName)}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);

        const data = await response.json();

        if (data && data.lyrics) {
            showLyrics(data.lyrics);
        } else {
            showLyrics("No lyrics found.");
        }
    } catch (error) {
        console.error("Failed to fetch lyrics:", error);
        showLyrics("Error fetching lyrics. Please try again later.");
    }
}

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

async function fetchLinks(currentSpotifyId) {
    if (!currentSpotifyId) return;

    try {
        let response = await fetch(`https://api.wxrn.lol/api/song_links/${currentSpotifyId}`);
        
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        if (data.linksByPlatform) {
            const pfLinks = data.linksByPlatform;

            const itunes = pfLinks.itunes ? pfLinks.itunes.url : '#';
            const soundcloud = pfLinks.soundcloud ? pfLinks.soundcloud.url : '#';
            const youtube = pfLinks.youtube ? pfLinks.youtube.url : '#';
            const spotify = pfLinks.spotify ? pfLinks.spotify.url : '#';

            linksPopup.innerHTML = `
                <a href="${spotify}" target="_blank"><i class="fa-brands fa-spotify"></i></a>
                <a href="${youtube}" target="_blank"><i class="fa-brands fa-youtube"></i></a>
                <a href="${itunes}" target="_blank"><i class="fa-brands fa-itunes"></i></a>
                <a href="${soundcloud}" target="_blank"><i class="fa-brands fa-soundcloud"></i></a>
            `;
        } else {
            console.warn('No links available for this track.');
        }
    } catch (error) {
        console.error('Error fetching links:', error);
    }
}

function shuffleTracks() {
    for (let i = tracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }
}

function loadTrack(index, animationClass) {
    currentTrack = index;
    audioPlayer.src = tracks[currentTrack].path;
    footer.textContent = `〤 ${tracks[currentTrack].title} 〤`;

    footer.classList.remove("slide-in-right", "slide-in-left");
    void footer.offsetWidth;
    footer.classList.add(animationClass);

    fetchLinks(tracks[currentTrack].spotifyId);
    fetchLyrics(tracks[currentTrack].title); // Automatically fetch lyrics for the current track
}

playPauseBtn.addEventListener("click", () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="icon fa-solid fa-pause"></i>';
    } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="icon fa-solid fa-play"></i>';
    }
});

nextBtn.addEventListener("click", () => {
    const nextTrack = (currentTrack + 1) % tracks.length;
    loadTrack(nextTrack, "slide-in-right");
    audioPlayer.play();
    playPauseBtn.innerHTML = '<i class="icon fa-solid fa-pause"></i>';
});

prevBtn.addEventListener("click", () => {
    const prevTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    loadTrack(prevTrack, "slide-in-left");
    audioPlayer.play();
    playPauseBtn.innerHTML = '<i class="icon fa-solid fa-pause"></i>';
});

audioPlayer.addEventListener("ended", () => {
    const nextTrack = (currentTrack + 1) % tracks.length;
    loadTrack(nextTrack, "slide-in-right");
    audioPlayer.play();
});

audioPlayer.addEventListener("timeupdate", () => {
    if (!isDragging) {
        seekBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    }
});

seekBar.addEventListener("input", () => {
    isDragging = true;
    audioPlayer.currentTime = (seekBar.value / 100) * audioPlayer.duration;
});

seekBar.addEventListener("mouseup", () => {
    isDragging = false;
});

volumeButton.addEventListener("mouseenter", showSlider);
volumeButton.addEventListener("mouseleave", hideSlider);
volumeSlider.addEventListener("mouseenter", () => { isHovering = true; });
volumeSlider.addEventListener("mouseleave", hideSlider);
volumeSlider.addEventListener("input", () => {
    audioPlayer.volume = volumeSlider.value / 100;
});

// Lyrics Overlay Logic
lyricsButton.addEventListener('click', () => {
    if (lyricsOverlay.style.display === 'block') {
        lyricsOverlay.style.display = 'none';
    } else {
        lyricsOverlay.style.display = 'block';
    }
});

function getRandomTrackIndex() {
    return Math.floor(Math.random() * tracks.length);
}

loadTrack(getRandomTrackIndex(), "slide-in-right");
