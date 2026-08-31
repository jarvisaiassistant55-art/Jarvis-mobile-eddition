/* =====================================
   J.A.R.V.I.S. CORE
===================================== */

const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const send = document.getElementById("send");

const voiceButton =
    document.getElementById("voiceButton");

const voiceTop =
    document.getElementById("voiceTop");

const voiceStatus =
    document.getElementById("voiceStatus");

const voiceState =
    document.getElementById("voiceState");

const uptimeElement =
    document.getElementById("uptime");

const coreButton =
    document.getElementById("coreButton");


let startTime = Date.now();
let listening = false;


/* =====================================
   ADD CHAT MESSAGE
===================================== */

function addMessage(
    text,
    type = "jarvis"
) {

    const row =
        document.createElement("div");

    row.className =
        type === "user"
            ? "chat-row user-row"
            : "chat-row jarvis-row";


    if (type === "jarvis") {

        const avatar =
            document.createElement("div");

        avatar.className =
            "mini-avatar";

        avatar.innerHTML =
            "<div></div>";

        row.appendChild(avatar);
    }


    const bubble =
        document.createElement("div");

    bubble.className =
        type === "user"
            ? "bubble user-bubble"
            : "bubble jarvis-bubble";


    const label =
        document.createElement("label");

    label.textContent =
        type === "user"
            ? "YOU"
            : "J.A.R.V.I.S.";


    const message =
        document.createElement("p");

    message.textContent = text;


    const time =
        document.createElement("small");

    time.textContent =
        new Date().toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    bubble.appendChild(label);
    bubble.appendChild(message);
    bubble.appendChild(time);

    row.appendChild(bubble);

    chat.appendChild(row);

    chat.scrollTop =
        chat.scrollHeight;
}


/* =====================================
   JARVIS AI RESPONSE
===================================== */

function jarvisReply(text) {

    const command =
        text.toLowerCase().trim();


    if (
        command.includes("hello") ||
        command.includes("hi") ||
        command.includes("hey")
    ) {

        return (
            "Hello, sir. " +
            "How can I assist you today?"
        );
    }


    if (
        command.includes("who are you")
    ) {

        return (
            "I am J.A.R.V.I.S., " +
            "your personal AI assistant."
        );
    }


    if (
        command.includes("how are you")
    ) {

        return (
            "All systems are operational, sir."
        );
    }


    if (
        command.includes("status")
    ) {

        return (
            "All systems are operational. " +
            "AI core online. " +
            "Network online. " +
            "System stable."
        );
    }


    if (
        command.includes("time")
    ) {

        return (
            "The current time is " +
            new Date().toLocaleTimeString()
        );
    }


    if (
        command.includes("date")
    ) {

        return (
            "Today is " +
            new Date().toLocaleDateString()
        );
    }


    if (
        command.includes("memory")
    ) {

        return (
            "Memory module detected. " +
            "Access is currently locked."
        );
    }


    return (
        "Command received, sir. " +
        "J.A.R.V.I.S. is ready."
    );
}


/* =====================================
   SEND
===================================== */

function sendMessage() {

    const text =
        input.value.trim();

    if (!text) {
        return;
    }


    addMessage(
        text,
        "user"
    );


    input.value = "";


    setTimeout(() => {

        const reply =
            jarvisReply(text);

        addMessage(reply);

        speak(reply);

    }, 400);
}


send.addEventListener(
    "click",
    sendMessage
);


input.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            sendMessage();

        }

    }
);


/* =====================================
   TEXT TO SPEECH
===================================== */

function speak(text) {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(text);


    speech.rate = .95;
    speech.pitch = 1;
    speech.volume = 1;


    speechSynthesis.speak(
        speech
    );
}


/* =====================================
   SPEECH RECOGNITION
===================================== */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


let recognition = null;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-IN";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.onstart = () => {

        listening = true;

        voiceStatus.textContent =
            "● LISTENING...";

        voiceState.textContent =
            "ACTIVE";

        voiceState.className =
            "online";

    };


    recognition.onresult =
        event => {

            const text =
                event
                    .results[0][0]
                    .transcript;


            input.value =
                text;


            sendMessage();

        };


    recognition.onerror =
        () => {

            listening = false;

            voiceStatus.textContent =
                "VOICE ERROR";

        };


    recognition.onend =
        () => {

            listening = false;

            voiceStatus.textContent =
                "VOICE STANDBY";

            voiceState.textContent =
                "LOCKED";

            voiceState.className =
                "yellow-text";

        };

} else {

    voiceStatus.textContent =
        "VOICE NOT SUPPORTED";

}


/* =====================================
   START VOICE
===================================== */

function startVoice() {

    if (!recognition) {

        addMessage(
            "Voice recognition is not supported by this browser."
        );

        return;
    }


    if (listening) {

        recognition.stop();

        return;
    }


    try {

        recognition.start();

    } catch (error) {

        console.log(error);

    }
}


voiceButton.addEventListener(
    "click",
    startVoice
);


voiceTop.addEventListener(
    "click",
    startVoice
);


/* =====================================
   UPTIME
===================================== */

function updateUptime() {

    const totalSeconds =
        Math.floor(
            (Date.now() - startTime) / 1000
        );


    const hours =
        Math.floor(
            totalSeconds / 3600
        );


    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );


    const seconds =
        totalSeconds % 60;


    uptimeElement.textContent =
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


setInterval(
    updateUptime,
    1000
);


/* =====================================
   NAVIGATION
===================================== */

function showSection(section) {

    if (section === "chat") {

        document
            .querySelector(".chat-panel")
            .scrollIntoView({
                behavior: "smooth"
            });

        return;
    }


    if (section === "system") {

        document
            .querySelector(".system-panel")
            .scrollIntoView({
                behavior: "smooth"
            });

        return;
    }


    if (section === "memory") {

        addMessage(
            "Memory module is currently locked."
        );

        return;
    }


    if (section === "settings") {

        addMessage(
            "Settings module is ready."
        );

    }
}


/* =====================================
   MAIN CORE BUTTON
===================================== */

coreButton.addEventListener(
    "click",
    () => {

        const message =
            "J.A.R.V.I.S. core is active and awaiting your command.";

        addMessage(message);

        speak(message);

    }
);


/* =====================================
   STARTUP
===================================== */

window.addEventListener(
    "load",
    () => {

        setTimeout(() => {

            addMessage(
                "All systems initialized. J.A.R.V.I.S. online."
            );

        }, 500);

    }
);
