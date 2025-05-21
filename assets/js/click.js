document.addEventListener("DOMContentLoaded", () => {
  const contextMenu = document.getElementById("custom-context-menu");
  const themeSwitcher = document.querySelector("#theme-switcher");
  const refreshPageBtn = document.getElementById("refresh-page");
  const toggleMusicBtn = document.querySelector("#toggle-music");
  const copyUrlBtn = document.getElementById("copy-url");
  const musicPlayer = document.querySelector(".music-player");
  const body = document.body;

  const themes = ["default", "amoled"];
  let currentThemeIndex = 0;

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme && themes.includes(savedTheme)) {
    currentThemeIndex = themes.indexOf(savedTheme);
    applyTheme(savedTheme);
  } else {
    applyTheme("default");
  }

  function applyTheme(theme) {
    body.classList.remove("amoled-theme");
    if (theme === "amoled") {
      body.classList.add("amoled-theme");
    }
    localStorage.setItem("theme", theme);
  }

  document.addEventListener("contextmenu", (e) => {
    const entryOverlay = document.getElementById("entry-overlay");
    if (entryOverlay) {
      const style = window.getComputedStyle(entryOverlay);
      if (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        parseFloat(style.opacity) > 0
      ) {
        if (entryOverlay.contains(e.target)) {
          e.preventDefault();
          return;
        }
      }
    }
    e.preventDefault();
    const clickX = e.clientX;
    const clickY = e.clientY;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const menuW = contextMenu.offsetWidth;
    const menuH = contextMenu.offsetHeight;

    const posX = clickX + menuW > screenW ? screenW - menuW - 5 : clickX;
    const posY = clickY + menuH > screenH ? screenH - menuH - 5 : clickY;

    contextMenu.style.left = posX + "px";
    contextMenu.style.top = posY + "px";
    contextMenu.style.display = "block";
  });

  let touchTimer = null;
  let touchX = 0;
  let touchY = 0;

  document.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchX = touch.clientX;
    touchY = touch.clientY;
    touchTimer = setTimeout(() => {
      e.preventDefault();
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const menuW = contextMenu.offsetWidth;
      const menuH = contextMenu.offsetHeight;

      const posX = touchX + menuW > screenW ? screenW - menuW - 5 : touchX;
      const posY = touchY + menuH > screenH ? screenH - menuH - 5 : touchY;

      contextMenu.style.left = posX + "px";
      contextMenu.style.top = posY + "px";
      contextMenu.style.display = "block";
    }, 600);
  });

  document.addEventListener("touchend", (e) => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      touchTimer = null;
    }
  });

  document.addEventListener("touchmove", (e) => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      touchTimer = null;
    }
  });

  document.addEventListener("click", (e) => {
    if (contextMenu.style.display === "block") {
      contextMenu.style.display = "none";
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && contextMenu.style.display === "block") {
      contextMenu.style.display = "none";
    }
  });

  themeSwitcher.addEventListener("click", () => {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    applyTheme(themes[currentThemeIndex]);
  });

  refreshPageBtn.addEventListener("click", () => {
    location.reload();
  });

  toggleMusicBtn.addEventListener("click", () => {
    if (
      musicPlayer.style.display === "none" ||
      getComputedStyle(musicPlayer).display === "none"
    ) {
      musicPlayer.style.display = "flex";
    } else {
      musicPlayer.style.display = "none";
    }
  });

  // Create notification popup element if it doesn't exist
  let copyNotification = document.querySelector(".copy-notification");
  if (!copyNotification) {
    copyNotification = document.createElement("div");
    copyNotification.className = "copy-notification";
    document.body.appendChild(copyNotification);
  }

  function showCopyNotification(message) {
    copyNotification.textContent = message;
    copyNotification.classList.add("show");
    setTimeout(() => {
      copyNotification.classList.remove("show");
    }, 3000);
  }

  copyUrlBtn.addEventListener("click", () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        showCopyNotification(`copied website url`);
      })
      .catch(() => {
        showCopyNotification("failed to copy url");
      });
  });
});
