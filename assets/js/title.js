async function fetchUsername() {
  try {
    let userId = "1158429903629336646";
    // FIXED: Use the new /discord/user/:userId endpoint
    const response = await fetch(`https://api.wxrn.lol/user/${userId}`);
    const data = await response.json();

    // Check for API errors
    if (data.error) {
      console.error("API Error:", data.error);
      animateTitle("@user", 300);
      return;
    }

    const username = data.username || "user";
    animateTitle(`@${username}`, 300);
  } catch (error) {
    console.error("Error fetching username:", error);
    animateTitle("@user", 300);
  }
}

function animateTitle(Title, delay) {
  let counter = 0;
  let direction = true;

  setInterval(function () {
    if (counter == Title.length) direction = false;
    if (counter == 0) direction = true;
    counter = direction == true ? ++counter : --counter;
    newtitle = counter == 0 ? "_" : Title.slice(0, counter);
    document.title = newtitle;
  }, delay);
}

fetchUsername();