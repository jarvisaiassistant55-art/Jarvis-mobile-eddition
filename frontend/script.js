"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       J.A.R.V.I.S. MOBILE EDITION
       CLEAN REPLACEMENT SCRIPT
       CHAT + MEMORY + VOICE
       ========================================================= */

    const input = document.getElementById("msg");
    const send = document.getElementById("send");
    const chat = document.getElementById("chat");

    const voiceButton = document.getElementById("voiceButton");
    const voiceStatus = document.getElementById("voiceStatus");

    /* =========================================================
       MEMORY
       ========================================================= */

    const MEMORY_KEY = "jarvis_memory";

    function getMemory() {
        try {
            return JSON.parse(localStorage.getItem(MEMORY_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveMemory(text) {
        const memories = getMemory();

        memories.push({
            text: text,
            time: new Date().toISOString()
        });

        localStorage.setItem(
            MEMORY_KEY,
            JSON.stringify(memories)
        );
    }

    function clearMemory() {
        localStorage.removeItem(MEMORY_KEY);
    }

    function showMemory() {
        const memories = getMemory();

        if (memories.length === 0) {
            return "My memory is currently empty.";
        }

        let result = "I remember:\n";

        memories.forEach((item, index) => {
            result += (index + 1) + ". " + item.text + "\n";
        });

        return result.trim();
    }

    /* =========================================================
       TIME
       ========================================================= */

    function getTime() {
        return new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    /* =========================================================
       ADD CHAT MESSAGE
       ========================================================= */

    function addMessage(type, text) {

        if (!chat) return;

        const message = document.createElement("div");

        message.className =
            type === "user"
                ? "message user"
                : "message jarvis";

        const bubble = document.createElement("div");
        bubble.className = "bubble";

        const label = document.createElement("label");

        label.textContent =
            type === "user"
                ? "YOU"
                : "J.A.R.V.I.S.";

        const p = document.createElement("p");

        // Preserve line breaks
        p.textContent = text;

        const t = document.createElement("time");
        t.textContent = getTime();

        bubble.appendChild(label);
        bubble.appendChild(p);
        bubble.appendChild(t);

        if (type === "jarvis") {

            const avatar = document.createElement("div");

            avatar.className = "avatar";
            avatar.textContent = "◆";

            message.appendChild(avatar);
        }

        message.appendChild(bubble);
        chat.appendChild(message);

        chat.scrollTop = chat.scrollHeight;
    }

    /* =========================================================
       VOICE OUTPUT
       ========================================================= */

    function speak(text) {

        if (
            !window.speechSynthesis ||
            typeof SpeechSynthesisUtterance === "undefined"
        ) {
            return;
        }

        try {

            window.speechSynthesis.cancel();

            const speech =
                new SpeechSynthesisUtterance(text);

            speech.lang = "en-IN";
            speech.rate = 0.95;
            speech.pitch = 1.0;
            speech.volume = 1.0;

            window.speechSynthesis.speak(speech);

        } catch (error) {
            console.log("Speech error:", error);
        }
    }

    /* =========================================================
       UPDATE VOICE STATUS
       ========================================================= */

    function setVoiceStatus(text) {

        if (voiceStatus) {
            voiceStatus.textContent = text;
        }

        // Also update common status elements if present
        const possibleStatus =
            document.querySelectorAll(
                "#voiceStatus, .voice-status, [data-voice-status]"
            );

        possibleStatus.forEach(el => {
            el.textContent = text;
        });
    }

    /* =========================================================
       VOICE RECOGNITION
       ========================================================= */

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    let recognition = null;
    let listening = false;

    if (SpeechRecognition) {

        recognition = new SpeechRecognition();

        recognition.lang = "en-IN";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {

            listening = true;

            setVoiceStatus("LISTENING");

            if (voiceButton) {
                voiceButton.classList.add("active");
            }
        };

        recognition.onresult = (event) => {

            const transcript =
                event.results[0][0].transcript.trim();

            if (!transcript) return;

            if (input) {
                input.value = transcript;
            }

            sendMessage();
        };

        recognition.onerror = (event) => {

            console.log(
                "Voice recognition:",
                event.error
            );

            listening = false;

            setVoiceStatus("VOICE READY");

            if (voiceButton) {
                voiceButton.classList.remove("active");
            }
        };

        recognition.onend = () => {

            listening = false;

            setVoiceStatus("VOICE READY");

            if (voiceButton) {
                voiceButton.classList.remove("active");
            }
        };

    } else {

        setVoiceStatus("VOICE READY");
    }

    /* =========================================================
       START VOICE
       ========================================================= */

    function startVoice() {

        if (!recognition) {

            addMessage(
                "jarvis",
                "Voice recognition is not supported by this browser."
            );

            return;
        }

        if (listening) {

            try {
                recognition.stop();
            } catch (e) {}

            return;
        }

        try {

            recognition.start();

        } catch (error) {

            console.log(
                "Unable to start voice:",
                error
            );
        }
    }

    if (voiceButton) {

        voiceButton.addEventListener("click", (event) => {

            event.preventDefault();
            startVoice();

        });
    }

    /* =========================================================
       J.A.R.V.I.S. RESPONSE ENGINE
       ========================================================= */

    function reply(text) {

        const original = text.trim();
        const q = original.toLowerCase();

        /* -------------------------
           GREETING
           ------------------------- */

        if (
            q === "hello" ||
            q === "hi" ||
            q === "hey" ||
            q.includes("hello jarvis")
        ) {
            return "Hello, Sir. J.A.R.V.I.S. is online and ready.";
        }

        /* -------------------------
           TIME
           ------------------------- */

        if (
            q === "time" ||
            q.includes("what time") ||
            q.includes("current time")
        ) {
            return "The current time is " + getTime() + ".";
        }

        /* -------------------------
           DATE
           ------------------------- */

        if (
            q === "date" ||
            q.includes("today's date") ||
            q.includes("what is the date") ||
            q.includes("what's the date")
        ) {

            return "Today is " +
                new Date().toLocaleDateString([], {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }) + ".";
        }

        /* -------------------------
           IDENTITY
           ------------------------- */

        if (
            q.includes("who are you") ||
            q.includes("your name")
        ) {
            return "I am J.A.R.V.I.S., your personal AI assistant.";
        }

        /* -------------------------
           STATUS
           ------------------------- */

        if (
            q === "status" ||
            q.includes("system status")
        ) {
            return "All primary systems are online. Voice is ready. Memory is active.";
        }

        /* -------------------------
           HELP
           ------------------------- */

        if (
            q === "help" ||
            q.includes("what can you do")
        ) {
            return "I can chat with you, tell the time and date, remember information, recall memories, speak responses, and accept voice commands.";
        }

        /* =====================================================
           MEMORY COMMANDS
           ===================================================== */

        if (
            q.startsWith("remember ")
        ) {

            const memoryText =
                original.substring(9).trim();

            if (!memoryText) {
                return "What would you like me to remember?";
            }

            saveMemory(memoryText);

            return "Understood, Sir. I have saved that to my memory.";
        }

        if (
            q.startsWith("remember that ")
        ) {

            const memoryText =
                original.substring(14).trim();

            if (!memoryText) {
                return "What would you like me to remember?";
            }

            saveMemory(memoryText);

            return "Understood, Sir. I have saved that to my memory.";
        }

        if (
            q.includes("show my memories") ||
            q.includes("show memories") ||
            q.includes("what do you remember") ||
            q.includes("my memory")
        ) {
            return showMemory();
        }

        if (
            q.includes("clear memory") ||
            q.includes("delete memory") ||
            q.includes("forget everything")
        ) {

            clearMemory();

            return "Memory has been cleared.";
        }

        /* -------------------------
           VOICE STATUS
           ------------------------- */

        if (
            q.includes("voice status") ||
            q.includes("is voice active")
        ) {
            return "Voice system is ready.";
        }

        /* -------------------------
           DEFAULT
           ------------------------- */

        return 'I received: "' + original + '"';
    }

    /* =========================================================
       SEND MESSAGE
       ========================================================= */

    function sendMessage() {

        if (!input || !chat) return;

        const text =
            input.value.trim();

        if (!text) return;

        addMessage(
            "user",
            text
        );

        input.value = "";

        setTimeout(() => {

            const answer =
                reply(text);

            addMessage(
                "jarvis",
                answer
            );

            speak(answer);

        }, 250);
    }

    /* =========================================================
       SEND BUTTON
       ========================================================= */

    if (send) {

        send.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                sendMessage();
            }
        );
    }

    /* =========================================================
       ENTER KEY
       ========================================================= */

    if (input) {

        input.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    sendMessage();
                }
            }
        );
    }

    /* =========================================================
       REMOVE OLD LOCKED STATES
       ========================================================= */

    function activateSystems() {

        // Voice
        setVoiceStatus("VOICE READY");

        // Find elements that may contain LOCKED
        const elements =
            document.querySelectorAll(
                "*"
            );

        elements.forEach(el => {

            const text =
                el.textContent.trim();

            if (
                text === "VOICE LOCKED" ||
                text === "MEMORY LOCKED"
            ) {

                if (
                    text === "VOICE LOCKED"
                ) {
                    el.textContent =
                        "VOICE READY";
                }

                if (
                    text === "MEMORY LOCKED"
                ) {
                    el.textContent =
                        "MEMORY ACTIVE";
                }
            }
        });
    }

    /* =========================================================
       STARTUP
       ========================================================= */

    activateSystems();

    console.log(
        "J.A.R.V.I.S. CORE ACTIVE"
    );

    console.log(
        "Memory:",
        getMemory().length,
        "items"
    );

});
