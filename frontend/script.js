document.addEventListener("DOMContentLoaded", () => {

    const chat = document.getElementById("chat");
    const input = document.getElementById("msg");
    const send = document.getElementById("send");
    const voiceStatus = document.getElementById("voiceStatus");

    if (!chat || !input || !send) {
        console.error("J.A.R.V.I.S: HTML elements missing.");
        return;
    }

    let isListening = false;
    let voiceEnabled = true;

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    let recognition = null;

    function addMessage(text, type) {
        const message = document.createElement("p");

        message.className = type;
        message.textContent = text;

        chat.appendChild(message);
        chat.scrollTop = chat.scrollHeight;
    }

    function jarvisReply(text) {

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

        if (command.includes("help")) {
            return "You can ask me for the time, date, system status, or simply say hello.";
        }

        return "Command received. I am ready to assist you.";
    }

    function speak(text) {

        if (!voiceEnabled) return;

        if (!("speechSynthesis" in window)) return;

        window.speechSynthesis.cancel();

        const speech =
            new SpeechSynthesisUtterance(text);

        speech.lang = "en-US";
        speech.rate = 0.9;
        speech.pitch = 0.85;
        speech.volume = 1;

        window.speechSynthesis.speak(speech);
    }

    function processCommand(text) {

        const processing =
            document.createElement("p");

        processing.className = "ai";

        processing.textContent =
            "J.A.R.V.I.S: Processing...";

        chat.appendChild(processing);

        chat.scrollTop =
            chat.scrollHeight;

        setTimeout(() => {

            const reply =
                jarvisReply(text);

            processing.textContent =
                "J.A.R.V.I.S: " + reply;

            chat.scrollTop =
                chat.scrollHeight;

            speak(reply);

        }, 600);
    }

    function sendMessage() {

        const text =
            input.value.trim();

        if (!text) return;

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
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();
            }
        }
    );

    /* VOICE BUTTON */

    const voiceButton =
        document.createElement("button");

    voiceButton.id =
        "voiceButton";

    voiceButton.type =
        "button";

    voiceButton.textContent =
        "🎤 VOICE";

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

    /* SPEECH RECOGNITION */

    if (SpeechRecognition) {

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

        recognition.onstart = () => {

            isListening = true;

            voiceButton.textContent =
                "🔴 LISTENING";

            if (voiceStatus) {
                voiceStatus.textContent =
                    "LISTENING";
            }

            addMessage(
                "J.A.R.V.I.S: Listening...",
                "ai"
            );
        };

        recognition.onresult = event => {

            const result =
                event.results[0][0].transcript.trim();

            if (!result) return;

            addMessage(
                "YOU: " + result,
                "user"
            );

            processCommand(result);
        };

        recognition.onerror = event => {

            console.log(
                "Voice error:",
                event.error
            );

            isListening = false;

            voiceButton.textContent =
                "🎤 VOICE";

            if (voiceStatus) {
                voiceStatus.textContent =
                    "ERROR";
            }

            if (event.error === "not-allowed") {

                addMessage(
                    "J.A.R.V.I.S: Microphone permission is blocked.",
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

        recognition.onend = () => {

            isListening = false;

            voiceButton.textContent =
                "🎤 VOICE";

            if (voiceStatus) {
                voiceStatus.textContent =
                    "READY";
            }
        };

        voiceButton.addEventListener(
            "click",
            () => {

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

                    isListening = false;

                    voiceButton.textContent =
                        "🎤 VOICE";

                    if (voiceStatus) {
                        voiceStatus.textContent =
                            "READY";
                    }
                }
            }
        );

    } else {

        voiceButton.textContent =
            "🎤 NOT SUPPORTED";

        voiceButton.disabled = true;

        if (voiceStatus) {
            voiceStatus.textContent =
                "UNSUPPORTED";
        }

        addMessage(
            "J.A.R.V.I.S: Voice recognition is not supported by this browser.",
            "ai"
        );
    }

    /* VOICE REPLY TOGGLE */

    const toggle =
        document.createElement("button");

    toggle.id =
        "voiceToggle";

    toggle.type =
        "button";

    toggle.textContent =
        "🔊 VOICE ON";

    toggle.style.display =
        "block";

    toggle.style.margin =
        "12px auto 25px";

    toggle.style.padding =
        "10px 20px";

    toggle.style.border =
        "1px solid #00d9ff";

    toggle.style.borderRadius =
        "10px";

    toggle.style.background =
        "transparent";

    toggle.style.color =
        "#08d9ff";

    toggle.style.cursor =
        "pointer";

    voiceButton.parentNode.after(
        toggle
    );

    toggle.addEventListener(
        "click",
        () => {

            voiceEnabled =
                !voiceEnabled;

            if (voiceEnabled) {

                toggle.textContent =
                    "🔊 VOICE ON";

            } else {

                toggle.textContent =
                    "🔇 VOICE OFF";

                if ("speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                }
            }
        }
    );

    addMessage(
        "J.A.R.V.I.S: Voice systems ready.",
        "ai"
    );

});
