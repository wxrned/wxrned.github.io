function enterSite() {
  const mainContent = document.querySelector("main");

  document.getElementById("entry-overlay").style.display = "none";
  document.getElementById("entry-overlay").style.visibility = "hidden";
  document.getElementById("entry-overlay").style.opacity = 0;

  mainContent.style.display = "flex";
  mainContent.classList.add("fade-in");

  window.removeEventListener("click", enterSite);
}

document.getElementById("check-p").innerHTML = "click to enter";
document.getElementById("entry-overlay").style.display = "flex";
window.addEventListener("click", enterSite);
