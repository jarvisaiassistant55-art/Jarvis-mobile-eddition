const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const send = document.getElementById("send");

const voiceInput = document.getElementById("voiceInput");
const voiceButton = document.getElementById("voiceButton");
const voiceStatus = document.getElementById("voiceStatus");

let voiceEnabled = true;


// =========================
// ADD MESSAGE
// =========================

function addMessage(text, type) {
    const message = document.createElement("p");

    message.className = type;
    message.textContent = text;

    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
}


// =========================
// JARVIS REPLY
// =========================

function jarvisReply(text) {

    const command = text.toLowerCase().trim();

    if (
        command.includes("hello") ||
        command.includes("hi") ||
        command.includes("hey")
    ) {
        return "Hello! I am J.A.R.V.I.S. How may I assist you?";
    }

    if (command.includes("how are you")) {
        return "All systems are operating normally.";
    }

    if (
        command.includes("who are you") ||
        command.includes("what are you")
    ) {
        return "I am J.A.R.V.I.S., your personal AI assistant.";
    }

    if (command.includes("status")) {
        return "All primary systems are operational.";
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
        return "You're welcome. Always at your service.";
    }

    if (command.includes("bye")) {
        return "Goodbye. J.A.R.V.I.S. standing by.";
    }

    return "I received your command: " + text;
}


// =========================
// SPEAK
// =========================

function speak(text) {

    if (!voiceEnabled) return;

    if (!("speechSynthesis" in window)) return;

    speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;

    speechSynthesis.speak(speech);
}


// =========================
// SEND MESSAGE
// =========================

function sendMessage() {

    const text = input.value.trim();

    if (!text) return;

    addMessage(
        "YOU: " + text,
        "user"
    );

    input.value = "";

    const processing =
        document.createElement("p");

    processing.className = "ai";
    processing.textContent =
        "J.A.R.V.I.S: Processing...";

    chat.appendChild(processing);

    setTimeout(function() {

        const reply = jarvisReply(text);

        processing.textContent =
            "J.A.R.V.I.S: " + reply;

        chat.scrollTop = chat.scrollHeight;

        speak(reply);

    }, 300);
}


// =========================
// SEND BUTTON
// =========================

if (send) {
    send.addEventListener(
        "click",
        sendMessage
    );
}


// =========================
// ENTER KEY
// =========================

if (input) {

    input.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();
            }
        }
    );
}


// =========================
// VOICE ON / OFF
// =========================

if (voiceButton) {

    voiceButton.addEventListener(
        "click",
        function() {

            voiceEnabled = !voiceEnabled;

            if (voiceEnabled) {

                voiceButton.textContent =
                    "🔊 VOICE ON";

                if (voiceStatus) {
                    voiceStatus.textContent =
                        "READY";
                }

                speak(
                    "Voice system enabled."
                );

            } else {

                speechSynthesis.cancel();

                voiceButton.textContent =
                    "🔇 VOICE OFF";

                if (voiceStatus) {
                    voiceStatus.textContent =
                        "OFF";
                }
            }
        }
    );
}


// =========================
// MICROPHONE
// =========================

if (voiceInput) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        voiceInput.addEventListener(
            "click",
            function() {

                addMessage(
                    "J.A.R.V.I.S: Speech recognition is not supported. Please use Google Chrome.",
                    "ai"
                );
            }
        );

    } else {

        const recognition =
            new SpeechRecognition();

        recognition.lang = "en-IN";
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;


        // MIC BUTTON

        voiceInput.addEventListener(
            "click",
            function() {

                try {

                    if (voiceStatus) {
                        voiceStatus.textContent =
                            "LISTENING";
                    }

                    voiceInput.textContent =
                        "🎤";

                    voiceInput.classList.add(
                        "listening"
                    );

                    recognition.start();

                } catch (error) {

                    console.log(
                        "Mic start:",
                        error
                    );
                }
            }
        );


        // SPEECH RESULT

        recognition.onresult =
            function(event) {

                const spokenText =
                    event.results[0][0]
                        .transcript;

                input.value =
                    spokenText;

                if (voiceStatus) {
                    voiceStatus.textContent =
                        "READY";
                }

                voiceInput.classList.remove(
                    "listening"
                );

                sendMessage();
            };


        // MIC ERROR

        recognition.onerror =
            function(event) {

                console.log(
                    "Microphone error:",
                    event.error
                );

                if (voiceStatus) {
                    voiceStatus.textContent =
                        "READY";
                }

                voiceInput.classList.remove(
                    "listening"
                );

                if (
                    event.error ===
                    "not-allowed"
                ) {

                    addMessage(
                        "J.A.R.V.I.S: Microphone permission denied. Allow microphone access in Chrome.",
                        "ai"
                    );

                } else if (
                    event.error ===
                    "no-speech"
                ) {

                    addMessage(
                        "J.A.R.V.I.S: I didn't hear anything. Please try again.",
                        "ai"
                    );

                } else {

                    addMessage(
                        "J.A.R.V.I.S: Microphone error: " +
                        event.error,
                        "ai"
                    );
                }
            };


        // MIC FINISHED

        recognition.onend =
            function() {

                if (voiceStatus) {
                    voiceStatus.textContent =
                        "READY";
                }

                voiceInput.classList.remove(
                    "listening"
                );
            };
    }
}


console.log(
    "J.A.R.V.I.S JavaScript loaded successfully."
);
