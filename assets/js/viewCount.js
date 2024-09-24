// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTzKMUnEqwoEiiYN-NEqZO5fbcUPJFYxY",
  authDomain: "wxrnlol-eb507.firebaseapp.com",
  projectId: "wxrnlol-eb507",
  storageBucket: "wxrnlol-eb507.appspot.com",
  messagingSenderId: "130600299639",
  appId: "1:130600299639:web:8c24f992f6be60898a6a72",
  measurementId: "G-4MHBKXVH15"
};

Firebase.initializeApp(firebaseConfig);

function get_viewers_ip(json) {
  let ip = json.ip;
  countViews(ip);
}

function countViews(ip) {
    var views;
    var ip_to_string = ip.toString().replace(/\./g, "-");

    Firebase.database().ref().child("page_views/" + ip_to_string).set({
        viewers_ip: ip
    });

    Firebase.database().ref().child("page_views").on("value", function (snapshot) {
        views = snapshot.numChildren();
        document.getElementById("page_views").innerHTML = views;
    });
}
