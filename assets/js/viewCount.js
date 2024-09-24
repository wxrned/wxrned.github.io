// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Check if Firebase is initialized
console.log("Firebase initialized:", firebase.apps.length > 0);
const database = firebase.database();
console.log("Database initialized:", !!database);

// Fetch viewer IP
fetch("https://api.ipify.org/?format=json")
  .then((response) => response.json())
  .then((data) => {
    get_viewers_ip(data); // Call your function with the IP data
  })
  .catch((error) => {
    console.error("Error fetching IP:", error); // Log any errors
  });

function get_viewers_ip(json) {
  let ip = json.ip;
  console.log("Viewer IP:", ip);
  countViews(ip);
}

function countViews(ip) {
  var views;
  var ip_to_string = ip.toString().replace(/\./g, "-");

  // Attempt to set the viewer's IP in the database
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
      console.error("Error logging IP:", error); // Log any errors when writing
    });

  // Retrieve the total views
  firebase
    .database()
    .ref()
    .child("page_views")
    .on("value", function (snapshot) {
      views = snapshot.numChildren();
      animateCountUp(views); // Call the animation function
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
