const firebaseConfig = {
  apiKey: "AIzaSyDpNoW4lIKHLgA2BSHoJfJ-Me1YoyEkFnk",
  authDomain: "shiku-wtf.firebaseapp.com",
  projectId: "shiku-wtf",
  storageBucket: "shiku-wtf.firebasestorage.app",
  messagingSenderId: "4241050687",
  appId: "1:4241050687:web:7aca502b0b87a130bf7c8a",
  measurementId: "G-VPEHTYG15M",
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

function get_viewers_ip(json) {
  let ip = json.ip;

  if (json.security.vpn || json.security.proxy) {
    document.getElementById("check-p").innerHTML =
      "vpn/proxy detected.<br>click to enter.";
    document.getElementById("entry-overlay").style.display = "flex";
    window.addEventListener("click", enterSite);
  } else {
    countViews(ip);
    enterSite();
  }
}

function enterSite() {
  const mainContent = document.querySelector("main");

  document.getElementById("entry-overlay").style.display = "none";
  document.getElementById("entry-overlay").style.visibility = "hidden";
  document.getElementById("entry-overlay").style.opacity = 0;

  mainContent.style.display = "flex";
  mainContent.classList.add("fade-in");

  window.removeEventListener("click", enterSite);

  fetch("https://api.ipify.org/?format=json")
    .then((response) => response.json())
    .then((data) => {
      const ip = data.ip;
      countViews(ip);
    })
    .catch((error) => {
      console.error("Error fetching IP:", error);
    });
}

function countViews(ip) {
  const domain = window.location.hostname;

  fetch("https://api.wxrn.lol/count", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer d31e48dc475e0cc703c4a1a063415e8a",
    },
    body: JSON.stringify({
      ip: ip,
      domain: domain,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.views !== undefined) {
        animateCountUp(data.views);
      }
    })
    .catch((error) => {
      console.error("Error updating view count:", error);
    });
}

fetch("https://api.ipify.org/?format=json")
  .then((response) => response.json())
  .then((data) => {
    fetch(
      `https://vpnapi.io/api/${data.ip}?key=0840c7c180ee4f9a81d591f222762774`
    )
      .then((response) => response.json())
      .then((securityData) => {
        get_viewers_ip(securityData);
      });
  })
  .catch((error) => {
    console.error("Error fetching IP:", error);
  });

function animateCountUp(targetNumber) {
  const pageViewsElement = document.getElementById("page_views");
  const currentNumber = parseInt(pageViewsElement.innerHTML);
  const increment = Math.ceil((targetNumber - currentNumber) / 100); // Increment step
  const duration = 1000; // Duration of the animation in milliseconds
  const steps = Math.ceil(duration / 50); // Number of steps for the animation
  let count = currentNumber;

  const interval = setInterval(() => {
    count += increment;
    if (increment > 0 && count >= targetNumber) {
      count = targetNumber; // Stop at target number
      clearInterval(interval);
    } else if (increment < 0 && count <= targetNumber) {
      count = targetNumber; // Stop at target number
      clearInterval(interval);
    }
    pageViewsElement.innerHTML = count;
  }, 40);
}
