document.addEventListener("DOMContentLoaded", function () {

    const chat = document.getElementById("chat");
    const input = document.getElementById("msg");
    const send = document.getElementById("send");
    const voiceButton = document.getElementById("voiceButton");
    const voiceStatus = document.getElementById("voiceStatus");
    const voiceToggle = document.getElementById("voiceToggle");

    let isListening = false;
    let voiceEnabled = true;

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    let recognition = null;


    /* =========================
       CHAT MESSAGE
    ========================= */

    function addMessage(text, type) {

        const message = document.createElement("p");

        message.className = type;
        message.textContent = text;

        chat.appendChild(message);

        chat.scrollTop = chat.scrollHeight;
    }


    /* =========================
       JARVIS REPLY
    ========================= */

    function getReply(text) {

        const command = text.toLowerCase().trim();


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
            return "All primary systems are operational. AI Core and Network are online.";
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


        if (command.includes("bye")) {
            return "Goodbye. J.A.R.V.I.S systems remain on standby.";
        }


        if (command.includes("help")) {
            return "You can ask me for the time, date, system status, or simply say hello.";
        }


        return "Command received. I am ready to assist you.";
    }


    /* =========================
       JARVIS VOICE REPLY
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
                getReply(text);

            processing.textContent =
                "J.A.R.V.I.S: " + reply;

            chat.scrollTop =
                chat.scrollHeight;

            speak(reply);

        }, 600);
    }


    /* =========================
       TEXT MESSAGE
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


    send.addEventListener(
        "click",
        sendMessage
    );


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
       VOICE RECOGNITION
    ========================= */

    if (SpeechRecognition && voiceButton) {

        recognition =
            new SpeechRecognition();

        recognition.lang =
            "en-US";

        recognition.continuous =
            false;

        recognition.interimResults =
            false;

        recognition.maxAlternatives =
            1;


        recognition.onstart = function () {

            isListening = true;

            voiceButton.textContent =
                "🔴 LISTENING";

            voiceButton.classList.add(
                "listening"
            );

            if (voiceStatus) {

                voiceStatus.textContent =
                    "LISTENING";

            }

            addMessage(
                "J.A.R.V.I.S: Listening...",
                "ai"
            );
        };


        recognition.onresult = function (event) {

            const result =
                event.results[0][0].transcript.trim();

            if (!result) {
                return;
            }

            addMessage(
                "YOU: " + result,
                "user"
            );

            processCommand(result);
        };


        recognition.onerror = function (event) {

            console.log(
                "J.A.R.V.I.S Voice Error:",
                event.error
            );

            isListening = false;

            voiceButton.textContent =
                "🎤 VOICE";

            voiceButton.classList.remove(
                "listening"
            );


            if (voiceStatus) {
                voiceStatus.textContent =
                    "ERROR";
            }


            if (event.error === "not-allowed") {

                addMessage(
                    "J.A.R.V.I.S: Please allow microphone permission.",
                    "ai"
                );

            } else if (event.error === "no-speech") {

                addMessage(
                    "J.A.R.V.I.S: I didn't hear anything.",
                    "ai"
                );

            } else {

                addMessage(
                    "J.A.R.V.I.S: Voice error: " +
                    event.error,
                    "ai"
                );
            }
        };


        recognition.onend = function () {

            isListening = false;

            voiceButton.textContent =
                "🎤 VOICE";

            voiceButton.classList.remove(
                "listening"
            );


            if (voiceStatus) {

                voiceStatus.textContent =
                    "READY";

            }
        };


        voiceButton.addEventListener(
            "click",
            function () {

                if (isListening) {

                    recognition.stop();

                    return;
                }


                try {

                    recognition.start();

                } catch (error) {

                    console.log(
                        "Recognition start error:",
                        error
                    );
                }
            }
        );

    } else {

        if (voiceButton) {

            voiceButton.textContent =
                "🎤 NOT SUPPORTED";

            voiceButton.disabled =
                true;
        }


        if (voiceStatus) {

            voiceStatus.textContent =
                "UNSUPPORTED";
        }


        addMessage(
            "J.A.R.V.I.S: Voice recognition is not supported by this browser.",
            "ai"
        );
    }


    /* =========================
       VOICE ON / OFF
    ========================= */

    if (voiceToggle) {

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


                    if ("speechSynthesis" in window) {

                        window.speechSynthesis.cancel();

                    }
                }
            }
        );
    }


    /* =========================
       STARTUP
    ========================= */

    addMessage(
        "J.A.R.V.I.S: Voice systems ready.",
        "ai"
    );

});
