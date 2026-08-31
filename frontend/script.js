const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const send = document.getElementById("send");

const voiceButton = document.getElementById("voiceButton");
const voiceHead = document.getElementById("voiceHead");
const voiceStatus = document.getElementById("voiceStatus");
const voiceState = document.getElementById("voiceState");
const coreButton = document.getElementById("coreButton");

let recognition = null;
let listening = false;
let voiceUnlocked = false;


/* =========================
   TIME
========================= */

function currentTime() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* =========================
   CHAT MESSAGE
========================= */

function addMessage(text, type) {

    if (!chat) return;

    const message = document.createElement("div");
    message.className = "message " + type;

    if (type === "jarvis") {

        const avatar = document.createElement("div");
        avatar.className = "avatar";
        avatar.textContent = "◆";

        message.appendChild(avatar);
    }

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    const label = document.createElement("label");
    label.textContent =
        type === "user" ? "YOU" : "J.A.R.V.I.S.";

    const paragraph = document.createElement("p");
    paragraph.textContent = text;

    const time = document.createElement("time");
    time.textContent = currentTime();

    bubble.appendChild(label);
    bubble.appendChild(paragraph);
    bubble.appendChild(time);

    message.appendChild(bubble);
    chat.appendChild(message);

    chat.scrollTop = chat.scrollHeight;
}


/* =========================
   JARVIS RESPONSE
========================= */

function getResponse(text) {

    const command = text.toLowerCase().trim();

    if (
        command.includes("hello") ||
        command.includes("hi") ||
        command.includes("hey")
    ) {
        return "Hello, sir. How can I assist you?";
    }

    if (command.includes("how are you")) {
        return "All systems are operational, sir.";
    }

    if (command.includes("status")) {
        return "System status: AI core online, network connected, system stable.";
    }

    if (command.includes("time")) {
        return "The current time is " +
            new Date().toLocaleTimeString();
    }

    if (command.includes("memory")) {
        return "Memory module is ready.";
    }

    if (
        command.includes("who are you") ||
        command.includes("your name")
    ) {
        return "I am J.A.R.V.I.S., your personal AI assistant.";
    }

    return "Command received, sir. J.A.R.V.I.S. is ready.";
}


/* =========================
   SEND MESSAGE
========================= */

function sendMessage() {

    if (!input) return;

    const text = input.value.trim();

    if (!text) return;

    addMessage(text, "user");

    input.value = "";

    setTimeout(() => {

        const reply = getResponse(text);

        addMessage(reply, "jarvis");

        speak(reply);

    }, 350);
}


if (send) {
    send.addEventListener("click", sendMessage);
}


if (input) {
    input.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }

    });
}


/* =========================
   TEXT TO SPEECH
========================= */

function speak(text) {

    if (!("speechSynthesis" in window)) {
        return;
    }

    speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.lang = "en-IN";
    speech.rate = 0.95;
    speech.pitch = 1;
    speech.volume = 1;

    speechSynthesis.speak(speech);
}


/* =========================
   VOICE UI
========================= */

function setVoiceState(state) {

    if (!voiceState) return;

    voiceState.textContent = state;

    if (
        state === "UNLOCKED" ||
        state === "ACTIVE"
    ) {

        voiceState.className = "green";

    } else {

        voiceState.className = "yellow";
    }
}


function setVoiceStatus(text) {

    if (voiceStatus) {
        voiceStatus.textContent = text;
    }
}


/* =========================
   VOICE UNLOCK
========================= */

function unlockVoice() {

    if (voiceUnlocked) {
        return;
    }

    voiceUnlocked = true;

    setVoiceState("UNLOCKED");

    setVoiceStatus("VOICE UNLOCKED");
}


/* =========================
   SPEECH RECOGNITION
========================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;


    recognition.onstart = function() {

        listening = true;

        unlockVoice();

        setVoiceState("ACTIVE");

        setVoiceStatus("● LISTENING...");
    };


    recognition.onresult = function(event) {

        const result =
            event.results[0][0];

        if (!result) return;

        const text =
            result.transcript.trim();

        if (!text) return;

        input.value = text;

        sendMessage();
    };


    recognition.onerror = function(event) {

        console.log(
            "Voice error:",
            event.error
        );

        listening = false;

        setVoiceState(
            voiceUnlocked
                ? "UNLOCKED"
                : "LOCKED"
        );

        setVoiceStatus(
            event.error === "not-allowed"
                ? "MIC PERMISSION REQUIRED"
                : "VOICE ERROR"
        );
    };


    recognition.onend = function() {

        listening = false;

        setVoiceState(
            voiceUnlocked
                ? "UNLOCKED"
                : "LOCKED"
        );

        setVoiceStatus(
            voiceUnlocked
                ? "VOICE UNLOCKED"
                : "VOICE STANDBY"
        );
    };
}


/* =========================
   START VOICE
========================= */

function startVoice() {

    if (!recognition) {

        addMessage(
            "Voice recognition is not supported on this device/browser.",
            "jarvis"
        );

        setVoiceStatus(
            "VOICE NOT SUPPORTED"
        );

        return;
    }


    if (listening) {

        recognition.stop();

        return;
    }


    unlockVoice();

    setVoiceStatus(
        "STARTING VOICE..."
    );


    try {

        recognition.start();

    } catch (error) {

        console.log(error);

        setVoiceStatus(
            "VOICE READY"
        );
    }
}


/* =========================
   VOICE BUTTONS
========================= */

if (voiceButton) {

    voiceButton.addEventListener(
        "click",
        startVoice
    );
}


if (voiceHead) {

    voiceHead.addEventListener(
        "click",
        startVoice
    );
}


/* =========================
   CORE BUTTON
========================= */

if (coreButton) {

    coreButton.addEventListener(
        "click",
        function() {

            const message =
                "J.A.R.V.I.S. core active. Awaiting your command.";

            addMessage(
                message,
                "jarvis"
            );

            speak(message);
        }
    );
}


/* =========================
   STARTUP
========================= */

window.addEventListener(
    "load",
    function() {

        setVoiceState("LOCKED");

        setVoiceStatus(
            "VOICE STANDBY"
        );

        setTimeout(function() {

            addMessage(
                "All systems initialized. J.A.R.V.I.S. online.",
                "jarvis"
            );

        }, 500);

    }
);
