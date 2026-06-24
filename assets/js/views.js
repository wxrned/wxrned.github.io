// views.js - Fix the VPN endpoint
function checkVpnStatus(ip) {
  // CHANGE THIS:
  // return fetch(`https://api.wxrn.lol/vpn/${ip}`)
  
  // TO THIS (use query parameter):
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
