const audioPlayer = document.getElementById('audio'); 
const playPauseBtn = document.getElementById('play-pause');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const footer = document.getElementById('footer');
const seekBar = document.getElementById('seek-bar');

const defaultFooterText = '〤 CutNation 〤';

let tracks = []; // Empty for now, will be populated by API
let currentTrack = 0;
audioPlayer.volume = 0.10;
let isDragging = false;

// Function to fetch playlist songs from the API
async function fetchPlaylistSongs() {
    try {
        const response = await fetch(`https://185.228.81.59:3000/api/refresh_music`);
        const data = await response.json();
        
        if (data.success) {
            // Update the tracks array with the downloaded songs
            tracks = data.downloadedSongs.map(song => ({
                title: song.replace('.mp3', ''),
                path: `/songs/${song}`
            }));
            console.log('Tracks updated:', tracks);
            
            loadRandomTrack();
        } else {
            console.error('Failed to download playlist:', data.message);
        }
    } catch (error) {
        console.error('Error fetching playlist songs:', error);
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

    // Apply animation
    footer.classList.remove('slide-in-right', 'slide-in-left');
    void footer.offsetWidth;
    footer.classList.add(animationClass);
}

function loadRandomTrack() {
    if (tracks.length > 0) {
        shuffleTracks();
        loadTrack(0, 'slide-in-right');
    }
}

function showDefaultFooter(animationClass) {
    footer.textContent = defaultFooterText;
    footer.classList.remove('slide-in-right', 'slide-in-left');
    void footer.offsetWidth;
    footer.classList.add(animationClass);
}

playPauseBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="icon fa-solid fa-pause"></i>';
        footer.textContent = `ʚ ${tracks[currentTrack].title} ɞ`;
        footer.classList.remove('slide-in-right', 'slide-in-left');
        void footer.offsetWidth;
        footer.classList.add('slide-in-right');
    } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="icon fa-solid fa-play"></i>';
        showDefaultFooter('slide-in-right');
    }
});

function playNextTrack() {
    const nextTrack = (currentTrack + 1) % tracks.length;
    loadTrack(nextTrack, 'slide-in-right');
    audioPlayer.play();
    playPauseBtn.innerHTML = '<i class="icon fa-solid fa-pause"></i>';
}

nextBtn.addEventListener('click', playNextTrack);

prevBtn.addEventListener('click', () => {
    const prevTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    loadTrack(prevTrack, 'slide-in-left');
    audioPlayer.play();
    playPauseBtn.innerHTML = '<i class="icon fa-solid fa-pause"></i>';
});

function updateSeekBar() {
    if (!isDragging) {
        seekBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
    }
}

seekBar.addEventListener('input', () => {
    isDragging = true;
    audioPlayer.currentTime = (seekBar.value / 100) * audioPlayer.duration;
});

seekBar.addEventListener('change', () => {
    isDragging = false;
});

audioPlayer.addEventListener('timeupdate', updateSeekBar);

audioPlayer.addEventListener('ended', playNextTrack);

window.addEventListener('load', () => {
    showDefaultFooter('slide-in-right');
    fetchPlaylistSongs();
});
