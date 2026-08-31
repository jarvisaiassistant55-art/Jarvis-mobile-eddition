/* =========================================
   J.A.R.V.I.S. MOBILE EDITION
   COMPLETE REPLACEMENT SCRIPT
========================================= */

const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const send = document.getElementById("send");

const voiceButton = document.getElementById("voiceButton");
const voiceHead = document.getElementById("voiceHead");

const voiceStatus = document.getElementById("voiceStatus");
const voiceState = document.getElementById("voiceState");

const coreButton = document.getElementById("coreButton");

let voiceUnlocked = false;
let listening = false;
let recognition = null;


/* =========================================
   TIME
========================================= */

function currentTime() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* =========================================
   VOICE STATUS
========================================= */

function setVoiceState(state) {

    if (!voiceState) return;

    voiceState.textContent = state;

    if (state === "UNLOCKED" || state === "ACTIVE") {

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


/* =========================================
   ADD CHAT MESSAGE
========================================= */

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
        type === "user"
            ? "YOU"
            : "J.A.R.V.I.S.";


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


/* =========================================
   UNLOCK VOICE
========================================= */

function unlockVoice() {

    voiceUnlocked = true;

    setVoiceState("UNLOCKED");

    setVoiceStatus("VOICE UNLOCKED");
}


/* =========================================
   LOCK VOICE
========================================= */

function lockVoice() {

    voiceUnlocked = false;

    if (recognition && listening) {

        try {
            recognition.stop();
        } catch (e) {}

    }

    listening = false;

    setVoiceState("LOCKED");

    setVoiceStatus("VOICE STANDBY");
}


/* =========================================
   JARVIS RESPONSE
========================================= */

function getResponse(text) {

    const command = text.toLowerCase().trim();


    /* ---- VOICE UNLOCK ---- */

    if (
        command.includes("unlock my voice") ||
        command.includes("unlock voice") ||
        command.includes("unlock the voice") ||
        command.includes("activate my voice") ||
        command.includes("activate voice") ||
        command.includes("enable my voice") ||
        command.includes("enable voice")
    ) {

        unlockVoice();

        return "Voice system unlocked. I am ready to listen.";
    }


    /* ---- VOICE LOCK ---- */

    if (
        command.includes("lock my voice") ||
        command.includes("lock voice") ||
        command.includes("lock the voice") ||
        command.includes("disable voice")
    ) {

        lockVoice();

        return "Voice system locked.";
    }


    /* ---- STATUS ---- */

    if (
        command === "status" ||
        command.includes("system status") ||
        command.includes("check status")
    ) {

        return (
            "System status: " +
            "AI core online. " +
            "Network online. " +
            "Voice " +
            (voiceUnlocked ? "unlocked." : "locked.")
        );
    }


    /* ---- GREETING ---- */

    if (
        command === "hello" ||
        command === "hi" ||
        command === "hey" ||
        command.includes("hello jarvis") ||
        command.includes("hello jarvis")
    ) {

        return "Hello, sir. How can I assist you?";
    }


    /* ---- HOW ARE YOU ---- */

    if (
        command.includes("how are you")
    ) {

        return "All systems are operational, sir.";
    }


    /* ---- YOUR NAME ---- */

    if (
        command.includes("who are you") ||
        command.includes("your name")
    ) {

        return "I am J.A.R.V.I.S., your personal AI assistant.";
    }


    /* ---- MEMORY ---- */

    if (
        command.includes("memory") ||
        command.includes("show memories")
    ) {

        return "Memory module is ready. Memory access is available.";
    }


    /* ---- TIME ---- */

    if (
        command === "time" ||
        command.includes("what time")
    ) {

        return (
            "The current time is " +
            new Date().toLocaleTimeString()
        );
    }


    /* ---- HELP ---- */

    if (
        command === "help" ||
        command.includes("what can you do")
    ) {

        return (
            "I can respond to commands, " +
            "control the voice system, " +
            "check system status, and manage your assistant interface."
        );
    }


    /* ---- DEFAULT ---- */

    return (
        "Command received, sir. " +
        "J.A.R.V.I.S. is ready."
    );
}


/* =========================================
   SEND MESSAGE
========================================= */

function sendMessage() {

    if (!input) return;

    const text = input.value.trim();

    if (!text) return;


    addMessage(text, "user");

    input.value = "";


    setTimeout(function() {

        const reply = getResponse(text);

        addMessage(reply, "jarvis");

        speak(reply);

    }, 300);
}


/* =========================================
   SEND BUTTON
========================================= */

if (send) {

    send.addEventListener(
        "click",
        sendMessage
    );
}


/* =========================================
   ENTER KEY
========================================= */

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


/* =========================================
   TEXT TO SPEECH
========================================= */

function speak(text) {

    if (!window.speechSynthesis) {
        return;
    }

    window.speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(text);


    speech.lang = "en-IN";

    speech.rate = 0.95;

    speech.pitch = 1;

    speech.volume = 1;


    window.speechSynthesis.speak(
        speech
    );
}


/* =========================================
   SPEECH RECOGNITION
========================================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();


    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;


    /* ---- START ---- */

    recognition.onstart = function() {

        listening = true;

        unlockVoice();

        setVoiceState("ACTIVE");

        setVoiceStatus(
            "● LISTENING..."
        );
    };


    /* ---- RESULT ---- */

    recognition.onresult =
        function(event) {

            if (
                !event.results ||
                !event.results[0]
            ) {
                return;
            }


            const result =
                event.results[0][0];


            if (!result) {
                return;
            }


            const text =
                result.transcript.trim();


            if (!text) {
                return;
            }


            input.value = text;

            sendMessage();
        };


    /* ---- ERROR ---- */

    recognition.onerror =
        function(event) {

            console.log(
                "Speech recognition error:",
                event.error
            );


            listening = false;


            if (
                event.error ===
                "not-allowed"
            ) {

                setVoiceStatus(
                    "MIC PERMISSION REQUIRED"
                );

            } else {

                setVoiceStatus(
                    "VOICE ERROR"
                );
            }


            setVoiceState(
                voiceUnlocked
                    ? "UNLOCKED"
                    : "LOCKED"
            );
        };


    /* ---- END ---- */

    recognition.onend =
        function() {

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


/* =========================================
   START LISTENING
========================================= */

function startVoice() {

    if (!recognition) {

        setVoiceStatus(
            "VOICE NOT SUPPORTED"
        );

        addMessage(
            "Voice recognition is not supported by this browser.",
            "jarvis"
        );

        return;
    }


    if (listening) {

        try {
            recognition.stop();
        } catch (e) {}

        return;
    }


    /* IMPORTANT:
       Unlock BEFORE microphone starts */

    unlockVoice();

    setVoiceStatus(
        "STARTING VOICE..."
    );


    try {

        recognition.start();

    } catch (error) {

        console.log(
            "Recognition start error:",
            error
        );

        setVoiceStatus(
            "VOICE READY"
        );
    }
}


/* =========================================
   MICROPHONE BUTTON
========================================= */

if (voiceButton) {

    voiceButton.addEventListener(
        "click",
        startVoice
    );
}


/* =========================================
   HEADER VOICE BUTTON
========================================= */

if (voiceHead) {

    voiceHead.addEventListener(
        "click",
        startVoice
    );
}


/* =========================================
   CORE BUTTON
========================================= */

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


/* =========================================
   STARTUP
========================================= */

window.addEventListener(
    "load",
    function() {

        voiceUnlocked = false;

        setVoiceState("LOCKED");

        setVoiceStatus(
            "VOICE STANDBY"
        );

        setTimeout(
            function() {

                addMessage(
                    "All systems initialized. J.A.R.V.I.S. online.",
                    "jarvis"
                );

            },
            500
        );
    }
);
