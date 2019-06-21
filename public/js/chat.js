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

//server(emit)-> client(recieve)--acknowlegment --> server
//client(emit)->server(recieve)--acknowledgment->client

socket.on("message", message => {
  const html = Mustache.render(messageTemplate, {
    message: message
  });
  $messages.insertAdjacentHTML("beforeend", html);
  console.log(message);
});

socket.on("locationMessage", location => {
  const link = Mustache.render(linkTemplate, {
    link: location
  });
  $messages.insertAdjacentHTML("beforeend", link);
  console.log(location);
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

// const socket = io();

// socket.on("messageToClient", message => {
//   console.log(message);
// });

// document.querySelector("#message-form").addEventListener("submit", e => {
//   e.preventDefault();

//   const message = e.target.elements.message.value;
//   console.log("value", message);

//   socket.emit("sendMessage", message);
// });

// document.querySelector("#location").addEventListener("click", () => {
//   if (!navigator.geolocation) {
//     return alert("error geolocation not supported");
//   }
//   navigator.geolocation.getCurrentPosition(position => {
//     // console.log(position);

//     socket.emit("sendLocation", {
//       longitude: position.coords.longitude,
//       latitude: position.coords.latitude
//     });
//     // console.log(location);
//     // socket.emit("sendLocation");
//   });
// });
