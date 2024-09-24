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

console.log("Firebase initialized:", firebase.apps.length > 0);
const database = firebase.database();
console.log("Database initialized:", !!database);

// Fetch viewer IP
fetch("https://api.ipify.org/?format=json")
  .then((response) => response.json())
  .then((data) => {
    get_viewers_ip(data);
  })
  .catch((error) => {
    console.error("Error fetching IP:", error);
  });

function get_viewers_ip(json) {
  let ip = json.ip;
  console.log("Viewer IP:", ip);
  countViews(ip);
}

function countViews(ip) {
  var views;
  var ip_to_string = ip.toString().replace(/\./g, "-");

  checkForProxy(ip).then((isProxy) => {
    if (isProxy) {
      console.log("Proxy detected. Ignoring IP:", ip);
      return;
    }

    firebase
      .database()
      .ref()
      .child("page_views/" + ip_to_string)
      .set({
        viewers_ip: ip,
      })
      .then(() => {
        console.log("IP logged successfully:", ip);
      })
      .catch((error) => {
        console.error("Error logging IP:", error);
      });

    // Retrieve the total views
    firebase
      .database()
      .ref()
      .child("page_views")
      .on("value", function (snapshot) {
        views = snapshot.numChildren();
        animateCountUp(views);
      });
  });
}

function checkForProxy(ip) {
  return fetch(`https://ipinfo.io/${ip}/json?token=7adaea64ae0991`)
    .then((response) => response.json())
    .then((data) => data.proxy || false)
    .catch((error) => {
      console.error("Error checking IP:", error);
      return false;
    });
}

function animateCountUp(targetNumber) {
  const pageViewsElement = document.getElementById("page_views");
  const currentNumber = parseInt(pageViewsElement.innerHTML);
  const increment = Math.ceil((targetNumber - currentNumber) / 100);
  const duration = 1000;
  const steps = Math.ceil(duration / 50);
  let count = currentNumber;

  const interval = setInterval(() => {
    count += increment;
    if (increment > 0 && count >= targetNumber) {
      count = targetNumber;
      clearInterval(interval);
    } else if (increment < 0 && count <= targetNumber) {
      count = targetNumber;
      clearInterval(interval);
    }
    pageViewsElement.innerHTML = count;
  }, 50);
}
