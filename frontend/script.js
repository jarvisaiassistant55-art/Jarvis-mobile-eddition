const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const send = document.getElementById("send");

function addMessage(text, type) {
  const message = document.createElement("p");

  message.className = type;
  message.textContent = text;

  chat.appendChild(message);

  chat.scrollTop = chat.scrollHeight;
}

function jarvisReply(text) {

  const command = text.toLowerCase();

  if (command.includes("hello") ||
      command.includes("hi") ||
      command.includes("hey")) {

    return "Hello. I am J.A.R.V.I.S. How may I assist you?";

  }

  if (command.includes("who are you")) {

    return "I am J.A.R.V.I.S., your personal AI assistant.";

  }

  if (command.includes("status")) {

    return "All primary systems are operational. AI Core and Network are online.";

  }

  if (command.includes("time")) {

    return "Current time: " +
      new Date().toLocaleTimeString();

  }

  if (command.includes("date")) {

    return "Today's date: " +
      new Date().toLocaleDateString();

  }

  if (command.includes("thank")) {

    return "You're welcome. Always at your service.";

  }

  return "Command received. I am ready to assist you.";
}

function sendMessage() {

  const text = input.value.trim();

  if (text === "") {
    return;
  }

  addMessage("YOU: " + text, "user");

  input.value = "";

  const processing = document.createElement("p");

  processing.className = "ai";

  processing.textContent =
    "J.A.R.V.I.S: Processing...";

  chat.appendChild(processing);

  setTimeout(() => {

    processing.textContent =
      "J.A.R.V.I.S: " + jarvisReply(text);

    chat.scrollTop = chat.scrollHeight;

  }, 700);
}

send.addEventListener("click", sendMessage);

input.addEventListener("keydown", function(event) {

  if (event.key === "Enter") {
    sendMessage();
  }

});
