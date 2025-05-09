document.getElementById("dc-pfp").addEventListener("click", function () {
  const popup = document.getElementById("popup");
  const overlay = document.getElementById("overlay");
  const avatarDecoration = document.getElementById("avatar-decoration");
  const visualizer = document.getElementById("visualizer");

  if (visualizer) {
    visualizer.style.display = "none";
  }

  popup.style.display = "block";
  overlay.style.display = "block";

  setTimeout(() => {
    popup.classList.add("show");
    overlay.classList.add("show");
    if (avatarDecoration) {
      avatarDecoration.classList.add("fade-out");
    }
  }, 10);
});

function closePopup() {
  const popup = document.getElementById("popup");
  const overlay = document.getElementById("overlay");
  const avatarDecoration = document.getElementById("avatar-decoration");
  const visualizer = document.getElementById("visualizer");

  popup.classList.remove("show");
  overlay.classList.remove("show");
  if (avatarDecoration) {
    avatarDecoration.classList.remove("fade-out");
  }

  if (visualizer) {
    visualizer.style.display = "none";
  }

  setTimeout(() => {
    popup.style.display = "none";
    overlay.style.display = "none";
  }, 300);
}

lyricsCloseBtn.addEventListener("click", () => {
  const avatarDecoration = document.getElementById("avatar-decoration");
  const visualizer = document.getElementById("visualizer");

  lyricsPopup.classList.remove("show");
  mainContent.classList.remove("no-click");
  overlay.style.display = "block";
  overlay.classList.remove("show");
  if (avatarDecoration) {
    avatarDecoration.classList.remove("fade-out");
  }

  if (visualizer) {
    visualizer.style.display = "none";
  }

  setTimeout(() => {
    lyricsPopup.style.display = "none";
    overlay.style.display = "none";
  }, 250);
});

lyricsButton.addEventListener("click", () => {
  const avatarDecoration = document.getElementById("avatar-decoration");
  const visualizer = document.getElementById("visualizer");

  lyricsPopup.style.display = "block";
  overlay.style.display = "block";
  mainContent.classList.add("no-click");
  lyricsPopup.classList.add("show");
  overlay.classList.add("show");
  if (avatarDecoration) {
    avatarDecoration.classList.add("fade-out");
  }

  if (visualizer) {
    visualizer.style.display = "block";
  }
});

footer.addEventListener("click", () => {
  const avatarDecoration = document.getElementById("avatar-decoration");
  const visualizer = document.getElementById("visualizer");

  lyricsPopup.style.display = "block";
  overlay.style.display = "block";
  mainContent.classList.add("no-click");
  lyricsPopup.classList.add("show");
  overlay.classList.add("show");
  if (avatarDecoration) {
    avatarDecoration.classList.add("fade-out");
  }

  if (visualizer) {
    visualizer.style.display = "block";
  }
});
