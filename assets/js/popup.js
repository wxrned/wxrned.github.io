document.getElementById("dc-pfp").addEventListener("click", function () {
  const popup = document.getElementById("popup");
  const overlay = document.getElementById("overlay");
  const avatarDecoration = document.getElementById("avatar-decoration");

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

  popup.classList.remove("show");
  overlay.classList.remove("show");
  if (avatarDecoration) {
    avatarDecoration.classList.remove("fade-out");
  }

  setTimeout(() => {
    popup.style.display = "none";
    overlay.style.display = "none";
  }, 300);
}
