// views.js - Updated with VPN/Proxy detection and view counting
// Safe users auto-enter, VPN users must click to enter

// Store VPN check result globally
let vpnCheckResult = null;

// Function to get IP and handle everything
async function initializeSite() {
  try {
    // First get the user's IP
    const ipResponse = await fetch("https://api.ipify.org/?format=json");
    const ipData = await ipResponse.json();
    const userIp = ipData.ip;
    
    console.log("User IP:", userIp); // Debug log
    
    // Check VPN status first
    await checkVpnStatus(userIp);
    
    // Then count the view (this will happen regardless of VPN status)
    await countViews(userIp);
    
  } catch (error) {
    console.error("Error initializing site:", error);
    // On error, still try to enter the site
    autoEnterSite();
  }
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
      console.log("VPN check result:", data); // Debug log
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
  
  if (!overlay || !overlayP) {
    console.error("Overlay elements not found");
    autoEnterSite();
    return;
  }
  
  // Update overlay message for VPN users
  overlayP.innerHTML = `
    <span style="color: #ffaa00;">⚠️ VPN/PROXY DETECTED</span><br>
    <small style="font-size: 0.8rem;">click anywhere to continue</small>
  `;
  
  // Make sure overlay is visible
  overlay.style.display = 'flex';
  overlay.style.visibility = 'visible';
  overlay.style.opacity = 1;
  
  // Remove any existing listeners to prevent duplicates
  const newOverlay = overlay.cloneNode(true);
  overlay.parentNode.replaceChild(newOverlay, overlay);
  
  // Add click listener for VPN users to enter
  newOverlay.addEventListener('click', function onClick() {
    enterSite();
    newOverlay.removeEventListener('click', onClick);
  });
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

  if (!mainContent || !overlay) {
    console.error("Required elements not found");
    return;
  }

  // Fade out overlay
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.3s ease';
  
  // After fade animation, hide completely
  setTimeout(() => {
    overlay.style.display = "none";
    overlay.style.visibility = "hidden";
  }, 300);

  // Show main content
  mainContent.style.display = "flex";
  mainContent.classList.add("fade-in");
}

function countViews(ip) {
  const domain = window.location.hostname;
  
  console.log("Counting view for:", { ip, domain }); // Debug log

  // Based on your count.ts, the endpoint expects:
  // POST /count with x-api-key header
  // The body should contain { ip, domain } or just domain?
  // Let's check what your count.ts expects
  
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
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      return response.text();
    })
    .then((text) => {
      console.log("Raw response:", text); // Debug log
      if (!text) {
        throw new Error("Empty response from server");
      }
      const data = JSON.parse(text);
      console.log("View count response:", data); // Debug log
      
      if (data.views !== undefined) {
        animateCountUp(data.views);
      } else {
        console.warn("No views in response:", data);
      }
    })
    .catch((error) => {
      console.error("Error updating view count:", error);
    });
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded, initializing..."); // Debug log
  initializeSite();
});

// Also keep the old function for compatibility
function get_viewers_ip(json) {
  console.log("get_viewers_ip called with:", json); // Debug log
  let ip = json.ip;
  checkVpnStatus(ip).then(() => {
    countViews(ip);
  });
}

function animateCountUp(targetNumber) {
  const pageViewsElement = document.getElementById("page_views");
  if (!pageViewsElement) {
    console.error("Page views element not found");
    return;
  }
  
  const currentNumber = parseInt(pageViewsElement.innerHTML) || 0;
  const increment = Math.ceil(Math.abs(targetNumber - currentNumber) / 100);
  const steps = Math.ceil(2000 / 40); // 2000ms / 40ms = 50 steps
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