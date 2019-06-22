const socket = io();
//elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const linkTemplate = document.querySelector("#link-template").innerHTML;
const sideBarTemplate = document.querySelector("#sidebar-template").innerHTML;

//options query the url for queryString
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

//server(emit)-> client(recieve)--acknowlegment --> server
//client(emit)->server(recieve)--acknowledgment->client

socket.on("message", message => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", location => {
  const link = Mustache.render(linkTemplate, {
    username: location.username,
    link: location.url,
    createdAt: moment(location.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", link);
  // console.log(location);
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sideBarTemplate, {
    room,
    users
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", e => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");
  //disable
  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, mess => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (mess) {
      console.log(mess);
    }
    console.log("the message was delievered");
  });
});

document.querySelector("#send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }

  navigator.geolocation.getCurrentPosition(position => {
    $locationButton.setAttribute("disabled", "disabled");
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
        console.log("location shared");
        $locationButton.removeAttribute("disabled");
      }
    );
  });
});

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
