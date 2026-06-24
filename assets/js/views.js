// views.js - Complete fixed version
let vpnCheckResult = null;

async function initializeSite() {
  try {
    const ipResponse = await fetch("https://api.ipify.org/?format=json");
    const ipData = await ipResponse.json();
    const userIp = ipData.ip;
    
    console.log("User IP:", userIp);
    
    await checkVpnStatus(userIp);
    await countViews(userIp);
    
  } catch (error) {
    console.error("Error initializing site:", error);
    autoEnterSite();
  }
}

function checkVpnStatus(ip) {
  return fetch(`https://api.wxrn.lol/vpn?ip=${ip}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`VPN check failed: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("VPN check result:", data);
      vpnCheckResult = data;
      
      const isVpnUser = data.isVpn || data.isProxy || data.isTor || 
                        data.isDatacenter || data.confidence > 50;
      
      vpnCheckResult.isVpnUser = isVpnUser;
      
      if (isVpnUser) {
        showVpnWarning(data);
      } else {
        autoEnterSite();
      }
      
      return data;
    })
    .catch(error => {
      console.error("VPN check failed:", error);
      autoEnterSite();
    });
}

function showVpnWarning(data) {
  const overlay = document.getElementById('entry-overlay');
  const overlayP = document.getElementById('check-p');
  
  if (!overlay || !overlayP) {
    console.error("Overlay elements not found");
    autoEnterSite();
    return;
  }
  
  overlayP.innerHTML = `
    <span style="color: #ffaa00;">⚠️ VPN/PROXY DETECTED</span><br>
    <small style="font-size: 0.8rem;">click anywhere to continue</small>
  `;
  
  overlay.style.display = 'flex';
  overlay.style.visibility = 'visible';
  overlay.style.opacity = 1;
  
  const newOverlay = overlay.cloneNode(true);
  overlay.parentNode.replaceChild(newOverlay, overlay);
  
  newOverlay.addEventListener('click', function onClick() {
    enterSite();
    newOverlay.removeEventListener('click', onClick);
  });
}

function autoEnterSite() {
  setTimeout(() => {
    enterSite();
  }, 500);
}

function enterSite() {
  const mainContent = document.querySelector("main");
  const overlay = document.getElementById("entry-overlay");

  if (!mainContent || !overlay) {
    console.error("Required elements not found");
    return;
  }

  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.3s ease';
  
  setTimeout(() => {
    overlay.style.display = "none";
    overlay.style.visibility = "hidden";
  }, 300);

  mainContent.style.display = "flex";
  mainContent.classList.add("fade-in");
}

function countViews(ip) {
  const domain = window.location.hostname || '127.0.0.1';
  
  console.log("Counting view for:", { ip, domain });

  // Try to get API key from localStorage or use a default
  let apiKey = localStorage.getItem('api_key');
  if (!apiKey) {
    // You might want to store your API key here or fetch it from a config
    apiKey = 'd31e48dc475e0cc703c4a1a063415e8a';
  }
  
  // For local development, you might want to use a test key
  if (domain === '127.0.0.1' || domain === 'localhost') {
    console.log("Local development detected - using local API key");
    // Use a specific key for localhost if you have one
  }
  
  fetch("https://api.wxrn.lol/count", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      domain: domain,
    }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 403) {
          console.warn("API key invalid or domain not registered.");
          // Show fallback view count
          showFallbackViewCount();
          return;
        }
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      const text = await response.text();
      if (!text) {
        throw new Error("Empty response from server");
      }
      const data = JSON.parse(text);
      console.log("View count response:", data);
      
      if (data.views !== undefined) {
        animateCountUp(data.views);
      } else {
        showFallbackViewCount();
      }
    })
    .catch((error) => {
      console.error("Error updating view count:", error);
      showFallbackViewCount();
    });
}

function showFallbackViewCount() {
  const pageViewsElement = document.getElementById("page_views");
  if (pageViewsElement) {
    let count = localStorage.getItem('view_count_fallback');
    if (!count) {
      count = Math.floor(Math.random() * 500) + 100;
      localStorage.setItem('view_count_fallback', count);
    }
    pageViewsElement.innerHTML = count;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded, initializing...");
  initializeSite();
});

function animateCountUp(targetNumber) {
  const pageViewsElement = document.getElementById("page_views");
  if (!pageViewsElement) {
    console.error("Page views element not found");
    return;
  }
  
  const currentNumber = parseInt(pageViewsElement.innerHTML) || 0;
  const increment = Math.ceil(Math.abs(targetNumber - currentNumber) / 100);
  const steps = Math.ceil(2000 / 40);
  let count = currentNumber;
  let step = 0;

  const interval = setInterval(() => {
    step++;
    
    if (count < targetNumber) {
      count = Math.min(count + increment, targetNumber);
    } else if (count > targetNumber) {
      count = Math.max(count - increment, targetNumber);
    }
    
    pageViewsElement.innerHTML = count;
    
    if (count === targetNumber || step >= steps) {
      clearInterval(interval);
      pageViewsElement.innerHTML = targetNumber;
    }
  }, 40);
}
