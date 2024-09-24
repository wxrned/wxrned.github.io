// Firebase initialization code
const firebaseConfig = {
  apiKey: "AIzaSyCTzKMUnEqwoEiiYN-NEqZO5fbcUPJFYxY",
  authDomain: "wxrnlol-eb507.firebaseapp.com",
  databaseURL:
    "https://wxrnlol-eb507-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "wxrnlol-eb507",
  storageBucket: "wxrnlol-eb507.appspot.com",
  messagingSenderId: "130600299639",
  appId: "1:130600299639:web:8c24f992f6be60898a6a72",
  measurementId: "G-4MHBKXVH15",
};

firebase.initializeApp(firebaseConfig);

var database = firebase.database();

function get_viewers_ip(json) {
  let ip = json.ip;

  // Check if the user is on a VPN
  if (json.security.vpn || json.security.proxy) {
    // Show the entry overlay for VPN users
    document.getElementById("entry-overlay").style.display = "flex"; // Show overlay
    console.log("VPN detected. Click to enter the site.");
  } else {
    console.log("Viewer IP:", ip);
    countViews(ip); // Directly count views if not on a VPN
  }
}

function countViews(ip) {
  var views;
  var ip_to_string = ip.toString().replace(/\./g, "-");

  firebase
    .database()
    .ref()
    .child("page_views/" + ip_to_string)
    .set({
      viewers_ip: ip,
    });

  firebase
    .database()
    .ref()
    .child("page_views")
    .on("value", function (snapshot) {
      views = snapshot.numChildren();
      document.getElementById("page_views").innerHTML = views;
    });
}

// Function to handle the Enter button click
document.getElementById("enter-site-button").onclick = function () {
  const overlay = document.getElementById("entry-overlay");
  overlay.style.display = "none"; // Hide the overlay
  // Call countViews or any necessary functions after entering
  fetch("https://api.ipify.org/?format=json")
    .then((response) => response.json())
    .then((data) => {
      const ip = data.ip; // Get IP again when user agrees to enter
      console.log("Viewer IP on entry:", ip);
      countViews(ip);
    })
    .catch((error) => {
      console.error("Error fetching IP:", error); // Log any errors
    });
};

// Example usage to fetch the user's IP with security check
fetch("https://api.ipify.org/?format=json")
  .then((response) => response.json())
  .then((data) => {
    // Assuming your security check API is set up to fetch the IP's security status
    fetch(
      `https://vpnapi.io/api/${data.ip}?key=09743a6399ca4bc4a635c51ecb847a6c`
    )
      .then((response) => response.json())
      .then((securityData) => {
        get_viewers_ip(securityData); // Pass the security data to the function
      });
  })
  .catch((error) => {
    console.error("Error fetching IP:", error); // Log any errors
  });
