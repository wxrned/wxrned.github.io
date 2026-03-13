// views.js - Updated with VPN/Proxy detection
// Safe users auto-enter, VPN users must click to enter

// Store VPN check result globally
let vpnCheckResult = null;

function get_viewers_ip(json) {
  let ip = json.ip;
  
  // First check if user is using VPN/proxy
  checkVpnStatus(ip).then(() => {
    // Count views for all users (both safe and VPN)
    // You might want to track VPN views separately in analytics
    countViews(ip);
  });
}

function checkVpnStatus(ip) {
  return fetch(`https://api.wxrn.lol/vpn/${ip}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`VPN check failed: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      vpnCheckResult = data;
      
      // Determine if user is using VPN/proxy
      const isVpnUser = data.isVpn || data.isProxy || data.isTor || 
                        data.isDatacenter || data.confidence > 50;
      
      vpnCheckResult.isVpnUser = isVpnUser;
      
      // Update overlay based on VPN status
      if (isVpnUser) {
        // VPN user - show warning and require click
        showVpnWarning(data);
      } else {
        // Safe user - auto-enter immediately
        autoEnterSite();
      }
      
      return data;
    })
    .catch(error => {
      console.error("VPN check failed:", error);
      // On error, auto-enter (fail open)
      autoEnterSite();
    });
}

function showVpnWarning(data) {
  const overlay = document.getElementById('entry-overlay');
  const overlayP = document.getElementById('check-p');
  
  // Update overlay message for VPN users
  overlayP.innerHTML = `
    <span style="color: #ffaa00;">⚠️ VPN/PROXY DETECTED</span><br>
    <small style="font-size: 0.8rem;">click anywhere to continue</small>
  `;
  
  // Make sure overlay is visible
  overlay.style.display = 'flex';
  overlay.style.visibility = 'visible';
  overlay.style.opacity = 1;
  
  // Add click listener for VPN users to enter
  overlay.addEventListener('click', function onClick() {
    enterSite();
    overlay.removeEventListener('click', onClick);
  });
  
  // Also allow clicking on the main content? No - keep overlay blocking
}

function autoEnterSite() {
  // Safe users auto-enter without click
  setTimeout(() => {
    enterSite();
  }, 500); // Small delay for smooth transition
}

function enterSite() {
  const mainContent = document.querySelector("main");
  const overlay = document.getElementById("entry-overlay");

  // Fade out overlay
  overlay.style.opacity = '0';
  
  // After fade animation, hide completely
  setTimeout(() => {
    overlay.style.display = "none";
    overlay.style.visibility = "hidden";
  }, 300);

  // Show main content
  mainContent.style.display = "flex";
  mainContent.classList.add("fade-in");

  // Remove any leftover event listeners
  window.removeEventListener("click", enterSite);
}

function countViews(ip) {
  const domain = window.location.hostname;

  fetch("https://api.wxrn.lol/count", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "d31e48dc475e0cc703c4a1a063415e8a",
    },
    body: JSON.stringify({
      ip: ip,
      domain: domain,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response.text();
    })
    .then((text) => {
      if (!text) {
        throw new Error("Empty response from server");
      }
      return JSON.parse(text);
    })
    .then((data) => {
      if (data.views !== undefined) {
        animateCountUp(data.views);
      }
    })
    .catch((error) => {
      console.error("Error updating view count:", error);
    });
}

// Initial IP fetch and VPN check
fetch("https://api.ipify.org/?format=json")
  .then((response) => response.json())
  .then((data) => {
    // First check VPN status (this will trigger either autoEnter or showVpnWarning)
    return checkVpnStatus(data.ip).then(() => {
      // Count views for all users
      countViews(data.ip);
    });
  })
  .catch((error) => {
    console.error("Error fetching IP:", error);
    // On error, auto-enter
    autoEnterSite();
  });

function animateCountUp(targetNumber) {
  const pageViewsElement = document.getElementById("page_views");
  const currentNumber = parseInt(pageViewsElement.innerHTML) || 0;
  const increment = Math.ceil(Math.abs(targetNumber - currentNumber) / 100);
  const duration = 2000;
  const steps = Math.ceil(duration / 40);
  let count = currentNumber;

  const interval = setInterval(() => {
    if (count < targetNumber) {
      count = Math.min(count + increment, targetNumber);
    } else if (count > targetNumber) {
      count = Math.max(count - increment, targetNumber);
    }
    
    pageViewsElement.innerHTML = count;
    
    if (count === targetNumber) {
      clearInterval(interval);
    }
  }, steps);
}