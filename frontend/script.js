const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const send = document.getElementById("send");
const voiceBtn = document.getElementById("voice");
const voiceOn = document.getElementById("voiceOn");

function addMessage(text, type) {
    const message = document.createElement("div");
    message.className = type;
    message.textContent = text;

    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
}

function jarvisReply(text) {
    const command = text.toLowerCase().trim();

    if (command.includes("hello") || command.includes("hi")) {
        return "Hello! I am J.A.R.V.I.S. How may I assist you?";
    }

    if (command.includes("how are you")) {
        return "All systems are operating normally.";
    }

    if (command.includes("who are you")) {
        return "I am J.A.R.V.I.S., your personal AI assistant.";
    }

    if (command.includes("time")) {
        return "The current time is " +
            new Date().toLocaleTimeString();
    }

    if (command.includes("date")) {
        return "Today's date is " +
            new Date().toLocaleDateString();
    }

    if (command.includes("thank")) {
        return "You're welcome.";
    }

    if (command.includes("bye")) {
        return "Goodbye. J.A.R.V.I.S. standing by.";
    }

    return "I received your command: " + text;
}

function sendMessage() {
    const text = input.value.trim();

    if (!text) {
        return;
    }

    addMessage("YOU: " + text, "user");

    input.value = "";

    setTimeout(function () {
        const reply = jarvisReply(text);
        addMessage("J.A.R.V.I.S: " + reply, "ai");

        speak(reply);
    }, 300);
}

function speak(text) {
    if ("speechSynthesis" in window) {
        speechSynthesis.cancel();

        const voice = new SpeechSynthesisUtterance(text);
        voice.rate = 0.9;
        voice.pitch = 1;

        speechSynthesis.speak(voice);
    }
}

// SEND BUTTON
if (send) {
    send.addEventListener("click", sendMessage);
}

// ENTER KEY
if (input) {
    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });
}

// 🎤 VOICE BUTTON
if (voiceBtn) {
    voiceBtn.addEventListener("click", function () {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            addMessage(
                "J.A.R.V.I.S: Speech recognition is not supported. Please use Google Chrome.",
                "ai"
            );
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = "en-IN";
        recognition.continuous = false;
        recognition.interimResults = false;

        addMessage("J.A.R.V.I.S: 🎤 Listening...", "ai");

        recognition.onstart = function () {
            voiceBtn.textContent = "🎤 LISTENING...";
        };

        recognition.onresult = function (event) {
            const text = event.results[0][0].transcript;

            input.value = text;

            voiceBtn.textContent = "🎤 VOICE";

            sendMessage();
        };

        recognition.onerror = function (event) {
            voiceBtn.textContent = "🎤 VOICE";

            addMessage(
                "J.A.R.V.I.S: Microphone error: " + event.error,
                "ai"
            );
        };

        recognition.onend = function () {
            voiceBtn.textContent = "🎤 VOICE";
        };

        recognition.start();
    });
}

// VOICE ON/OFF
if (voiceOn) {
    voiceOn.addEventListener("click", function () {

        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
            voiceOn.textContent = "🔇 VOICE OFF";
        } else {
            voiceOn.textContent = "🔊 VOICE ON";
        }
    });
}

console.log("J.A.R.V.I.S JavaScript loaded successfully.");
