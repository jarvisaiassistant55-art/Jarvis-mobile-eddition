const chat =
    document.getElementById("chat");

const input =
    document.getElementById("msg");

const send =
    document.getElementById("send");

const voiceButton =
    document.getElementById("voiceButton");

const voiceHead =
    document.getElementById("voiceHead");

const voiceStatus =
    document.getElementById("voiceStatus");

const voiceState =
    document.getElementById("voiceState");

const coreButton =
    document.getElementById("coreButton");


/* =========================
   TIME
========================= */

function currentTime() {

    return new Date().toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================
   ADD MESSAGE
========================= */

function addMessage(text, type) {

    const message =
        document.createElement("div");

    message.className =
        "message " + type;


    if (type === "jarvis") {

        const avatar =
            document.createElement("div");

        avatar.className =
            "avatar";

        avatar.textContent = "◆";

        message.appendChild(avatar);
    }


    const bubble =
        document.createElement("div");

    bubble.className = "bubble";


    const label =
        document.createElement("label");

    label.textContent =
        type === "user"
            ? "YOU"
            : "J.A.R.V.I.S.";


    const paragraph =
        document.createElement("p");

    paragraph.textContent = text;


    const time =
        document.createElement("time");

    time.textContent =
        currentTime();


    bubble.appendChild(label);
    bubble.appendChild(paragraph);
    bubble.appendChild(time);

    message.appendChild(bubble);

    chat.appendChild(message);

    chat.scrollTop =
        chat.scrollHeight;
}


/* =========================
   JARVIS RESPONSE
========================= */

function getResponse(text) {

    const command =
        text.toLowerCase();


    if (
        command.includes("hello") ||
        command.includes("hi") ||
        command.includes("hey")
    ) {

        return "Hello, sir. How can I assist you?";
    }


    if (
        command.includes("how are you")
    ) {

        return "All systems are operational, sir.";
    }


    if (
        command.includes("status")
    ) {

        return (
            "System status: AI core online, " +
            "network connected, system stable."
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
        command.includes("memory")
    ) {

        return (
            "Memory module is ready. " +
            "Access is currently locked."
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


    return (
        "Command received, sir. " +
        "J.A.R.V.I.S. is ready."
    );
}


/* =========================
   SEND
========================= */

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
            getResponse(text);

        addMessage(
            reply,
            "jarvis"
        );

        speak(reply);

    }, 350);
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


/* =========================
   TEXT TO SPEECH
========================= */

function speak(text) {

    if (
        !window.speechSynthesis
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


/* =========================
   VOICE RECOGNITION
========================= */

const Recognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


let recognition = null;
let listening = false;


if (Recognition) {

    recognition =
        new Recognition();


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
            "green";
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
                "yellow";
        };

}


/* =========================
   VOICE BUTTON
========================= */

function startVoice() {

    if (!recognition) {

        addMessage(
            "Voice recognition is not supported in this browser.",
            "jarvis"
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


voiceHead.addEventListener(
    "click",
    startVoice
);


/* =========================
   CORE BUTTON
========================= */

coreButton.addEventListener(
    "click",
    () => {

        const message =
            "J.A.R.V.I.S. core active. Awaiting your command.";

        addMessage(
            message,
            "jarvis"
        );

        speak(message);
    }
);


/* =========================
   STARTUP
========================= */

window.addEventListener(
    "load",
    () => {

        setTimeout(() => {

            addMessage(
                "All systems initialized. J.A.R.V.I.S. online.",
                "jarvis"
            );

        }, 500);

    }
);
