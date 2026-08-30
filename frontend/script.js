document.addEventListener("DOMContentLoaded", function () {

    const chat = document.getElementById("chat");
    const input = document.getElementById("msg");
    const send = document.getElementById("send");

    if (!chat || !input || !send) {
        console.error("J.A.R.V.I.S: Required HTML elements not found.");
        return;
    }

    /* =========================
       VOICE SETTINGS
    ========================= */

    let voiceEnabled = true;

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    let recognition = null;

    if (SpeechRecognition) {

        recognition = new SpeechRecognition();

        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = function () {
            addMessage(
                "J.A.R.V.I.S: Listening...",
                "ai"
            );

            voiceButton.textContent = "🔴 LISTENING";
        };

        recognition.onresult = function (event) {

            const spokenText =
                event.results[0][0].transcript;

            input.value = spokenText;

            addMessage(
                "YOU: " + spokenText,
                "user"
            );

            input.value = "";

            processCommand(spokenText);
        };

        recognition.onerror = function (event) {

            console.error(
                "Voice recognition error:",
                event.error
            );

            addMessage(
                "J.A.R.V.I.S: I could not understand that.",
                "ai"
            );

            voiceButton.textContent = "🎤 VOICE";
        };

        recognition.onend = function () {
            voiceButton.textContent = "🎤 VOICE";
        };

    } else {

        console.warn(
            "Speech Recognition is not supported."
        );
    }


    /* =========================
       CHAT
    ========================= */

    function addMessage(text, type) {

        const message =
            document.createElement("p");

        message.className = type;
        message.textContent = text;

        chat.appendChild(message);

        chat.scrollTop =
            chat.scrollHeight;
    }


    /* =========================
       JARVIS BRAIN
    ========================= */

    function jarvisReply(text) {

        const command =
            text.toLowerCase().trim();


        if (
            command.includes("hello") ||
            command.includes("hi") ||
            command.includes("hey")
        ) {

            return "Hello. I am J.A.R.V.I.S. How may I assist you?";
        }


        if (
            command.includes("who are you") ||
            command.includes("your name")
        ) {

            return "I am J.A.R.V.I.S., your personal AI assistant.";
        }


        if (command.includes("status")) {

            return "All primary systems are operational. AI Core, Network, Voice System and Security are online.";
        }


        if (command.includes("time")) {

            return "The current time is " +
                new Date().toLocaleTimeString();
        }


        if (command.includes("date")) {

            return "Today's date is " +
                new Date().toLocaleDateString();
        }


        if (
            command.includes("thank") ||
            command.includes("thanks")
        ) {

            return "You're welcome. Always at your service.";
        }


        if (command.includes("how are you")) {

            return "All systems are functioning normally.";
        }


        if (command.includes("help")) {

            return "You can ask me for the time, date, system status, or simply say hello.";
        }


        return "Command received. I am ready to assist you.";
    }


    /* =========================
       VOICE REPLY
    ========================= */

    function speak(text) {

        if (!voiceEnabled) {
            return;
        }

        if (!("speechSynthesis" in window)) {
            return;
        }

        window.speechSynthesis.cancel();

        const speech =
            new SpeechSynthesisUtterance(text);

        speech.lang = "en-US";
        speech.rate = 0.9;
        speech.pitch = 0.85;
        speech.volume = 1;

        window.speechSynthesis.speak(speech);
    }


    /* =========================
       PROCESS COMMAND
    ========================= */

    function processCommand(text) {

        const processing =
            document.createElement("p");

        processing.className = "ai";

        processing.textContent =
            "J.A.R.V.I.S: Processing...";

        chat.appendChild(processing);

        chat.scrollTop =
            chat.scrollHeight;


        setTimeout(function () {

            const reply =
                jarvisReply(text);

            processing.textContent =
                "J.A.R.V.I.S: " + reply;

            chat.scrollTop =
                chat.scrollHeight;

            speak(reply);

        }, 700);
    }


    /* =========================
       TEXT SEND
    ========================= */

    function sendMessage() {

        const text =
            input.value.trim();

        if (!text) {
            return;
        }

        addMessage(
            "YOU: " + text,
            "user"
        );

        input.value = "";

        processCommand(text);
    }


    /* =========================
       SEND BUTTON
    ========================= */

    send.addEventListener(
        "click",
        sendMessage
    );


    /* =========================
       ENTER KEY
    ========================= */

    input.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();
            }
        }
    );


    /* =========================
       VOICE BUTTON
    ========================= */

    const voiceButton =
        document.createElement("button");

    voiceButton.id =
        "voiceButton";

    voiceButton.textContent =
        "🎤 VOICE";

    voiceButton.type = "button";

    voiceButton.style.width = "130px";
    voiceButton.style.border = "none";
    voiceButton.style.borderRadius = "15px";
    voiceButton.style.background = "#00d9ff";
    voiceButton.style.color = "#001018";
    voiceButton.style.fontSize = "16px";
    voiceButton.style.fontWeight = "bold";
    voiceButton.style.cursor = "pointer";


    send.parentNode.insertBefore(
        voiceButton,
        send
    );


    voiceButton.addEventListener(
        "click",
        function () {

            if (!recognition) {

                addMessage(
                    "J.A.R.V.I.S: Voice recognition is not supported in this browser.",
                    "ai"
                );

                return;
            }

            try {

                recognition.start();

            } catch (error) {

                console.log(
                    "Recognition already running."
                );
            }
        }
    );


    /* =========================
       VOICE ENABLE / DISABLE
    ========================= */

    const voiceToggle =
        document.createElement("button");

    voiceToggle.id =
        "voiceToggle";

    voiceToggle.textContent =
        "🔊 VOICE ON";

    voiceToggle.type = "button";

    voiceToggle.style.display = "block";
    voiceToggle.style.margin = "10px auto 25px";
    voiceToggle.style.padding = "10px 20px";
    voiceToggle.style.border = "1px solid #00d9ff";
    voiceToggle.style.borderRadius = "10px";
    voiceToggle.style.background = "transparent";
    voiceToggle.style.color = "#08d9ff";
    voiceToggle.style.cursor = "pointer";


    voiceButton.parentNode.after(
        voiceToggle
    );


    voiceToggle.addEventListener(
        "click",
        function () {

            voiceEnabled =
                !voiceEnabled;

            if (voiceEnabled) {

                voiceToggle.textContent =
                    "🔊 VOICE ON";

            } else {

                voiceToggle.textContent =
                    "🔇 VOICE OFF";

                window.speechSynthesis.cancel();
            }
        }
    );


    /* =========================
       STARTUP
    ========================= */

    addMessage(
        "J.A.R.V.I.S: Voice systems online. Say \"Hello JARVIS\".",
        "ai"
    );

});
