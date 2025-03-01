async function fetchUsername() {
  try {
    let userId = "1158429903629336646";
    const response = await fetch(`https://api.wxrn.lol/api/discord/${userId}`);
    const data = await response.json();

    const username = `@${data.username}` || "@user";
    animateTitle(username, 300);
  } catch (error) {
    console.error("Error fetching username:", error);
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
