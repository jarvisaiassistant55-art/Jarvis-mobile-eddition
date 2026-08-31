/* =========================================================
   J.A.R.V.I.S. MOBILE EDITION — V5
   LOCAL COMMANDS + MEMORY + VOICE + AI BACKEND
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const chat = document.getElementById("chat");
    const input = document.getElementById("msg");
    const send = document.getElementById("send");

    const voiceButton = document.getElementById("voiceButton");
    const voiceHead = document.getElementById("voiceHead");

    const voiceStatus = document.getElementById("voiceStatus");
    const voiceState = document.getElementById("voiceState");

    const coreButton = document.getElementById("coreButton");
    const menuBtn = document.getElementById("menuBtn");


    /* =====================================================
       CONFIG
       ===================================================== */

    const AI_ENDPOINT = "/api/chat";

    const MEMORY_KEY = "JARVIS_MEMORY_V5";
    const CHAT_KEY = "JARVIS_CHAT_V5";

    let memories = load(MEMORY_KEY, []);
    let chatHistory = load(CHAT_KEY, []);

    let memoryUnlocked =
        localStorage.getItem("JARVIS_MEMORY_UNLOCKED") !== "false";

    let recognition = null;
    let listening = false;
    let busy = false;


    /* =====================================================
       STORAGE
       ===================================================== */

    function load(key, fallback) {

        try {

            const value = localStorage.getItem(key);

            if (!value) {
                return fallback;
            }

            return JSON.parse(value);

        } catch (error) {

            console.error("Storage load error:", error);

            return fallback;
        }
    }


    function save(key, value) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

        } catch (error) {

            console.error("Storage save error:", error);
        }
    }


    /* =====================================================
       TIME
       ===================================================== */

    function getTime() {

        return new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }


    /* =====================================================
       CHAT MESSAGE
       ===================================================== */

    function addMessage(type, text) {

        if (!chat) return;


        const message =
            document.createElement("div");

        message.className =
            type === "user"
                ? "message user"
                : "message jarvis";


        if (type === "jarvis") {

            const avatar =
                document.createElement("div");

            avatar.className = "avatar";
            avatar.textContent = "◆";


            const bubble =
                document.createElement("div");

            bubble.className = "bubble";


            const label =
                document.createElement("label");

            label.textContent =
                "J.A.R.V.I.S.";


            const p =
                document.createElement("p");

            p.textContent =
                text;


            const time =
                document.createElement("time");

            time.textContent =
                getTime();


            bubble.appendChild(label);
            bubble.appendChild(p);
            bubble.appendChild(time);

            message.appendChild(avatar);
            message.appendChild(bubble);

        } else {

            const bubble =
                document.createElement("div");

            bubble.className =
                "bubble";


            const label =
                document.createElement("label");

            label.textContent =
                "YOU";


            const p =
                document.createElement("p");

            p.textContent =
                text;


            const time =
                document.createElement("time");

            time.textContent =
                getTime() + " ✓";


            bubble.appendChild(label);
            bubble.appendChild(p);
            bubble.appendChild(time);

            message.appendChild(bubble);
        }


        chat.appendChild(message);

        chat.scrollTop =
            chat.scrollHeight;
    }


    /* =====================================================
       TYPING INDICATOR
       ===================================================== */

    function showThinking() {

        if (!chat) return;


        const message =
            document.createElement("div");

        message.className =
            "message jarvis thinking";


        const avatar =
            document.createElement("div");

        avatar.className =
            "avatar";

        avatar.textContent =
            "◆";


        const bubble =
            document.createElement("div");

        bubble.className =
            "bubble";


        const label =
            document.createElement("label");

        label.textContent =
            "J.A.R.V.I.S.";


        const p =
            document.createElement("p");

        p.textContent =
            "Processing...";


        bubble.appendChild(label);
        bubble.appendChild(p);

        message.appendChild(avatar);
        message.appendChild(bubble);

        chat.appendChild(message);

        chat.scrollTop =
            chat.scrollHeight;

        return message;
    }


    /* =====================================================
       MEMORY STATUS
       ===================================================== */

    function updateMemoryStatus() {

        document
            .querySelectorAll(".status")
            .forEach(box => {

                const small =
                    box.querySelector("small");

                const strong =
                    box.querySelector("strong");

                if (!small || !strong) return;


                if (
                    small.textContent
                        .trim()
                        .toUpperCase() === "MEMORY"
                ) {

                    if (memoryUnlocked) {

                        strong.textContent =
                            "ONLINE";

                        strong.classList.remove(
                            "yellow"
                        );

                        strong.classList.add(
                            "green"
                        );

                    } else {

                        strong.textContent =
                            "LOCKED";

                        strong.classList.remove(
                            "green"
                        );

                        strong.classList.add(
                            "yellow"
                        );
                    }
                }
            });
    }


    /* =====================================================
       MEMORY
       ===================================================== */

    function remember(text) {

        if (!memoryUnlocked) {

            return "Memory is locked.";
        }


        const value =
            text
                .replace(/^remember that\s+/i, "")
                .replace(/^remember\s+/i, "")
                .replace(/^save that\s+/i, "")
                .replace(/^save\s+/i, "")
                .trim();


        if (!value) {

            return (
                "Tell me what you want me to remember."
            );
        }


        const exists =
            memories.some(item =>
                item.toLowerCase() ===
                value.toLowerCase()
            );


        if (!exists) {

            memories.push(value);

            save(
                MEMORY_KEY,
                memories
            );
        }


        updateMemoryStatus();

        return (
            "Memory saved: " +
            value
        );
    }


    function recall() {

        if (!memoryUnlocked) {

            return "Memory is locked.";
        }


        if (!memories.length) {

            return (
                "My memory database is empty."
            );
        }


        return (
            "Here is what I remember:\n\n" +
            memories
                .map(
                    (item, index) =>
                        `${index + 1}. ${item}`
                )
                .join("\n")
        );
    }


    function forget(text) {

        if (!memoryUnlocked) {

            return "Memory is locked.";
        }


        const query =
            text
                .replace(/^forget that\s+/i, "")
                .replace(/^forget\s+/i, "")
                .trim()
                .toLowerCase();


        if (!query) {

            return (
                "Tell me which memory to forget."
            );
        }


        const oldLength =
            memories.length;


        memories =
            memories.filter(
                item =>
                    !item
                        .toLowerCase()
                        .includes(query)
            );


        save(
            MEMORY_KEY,
            memories
        );


        if (
            memories.length <
            oldLength
        ) {

            return "Memory forgotten.";
        }


        return (
            "I couldn't find that memory."
        );
    }


    /* =====================================================
       LOCAL COMMANDS
       ===================================================== */

    function localCommand(text) {

        const command =
            text.trim();

        const lower =
            command.toLowerCase();


        /* EMPTY */

        if (!command) {

            return "Please say something.";
        }


        /* MEMORY UNLOCK */

        if (
            lower === "memory unlock" ||
            lower === "unlock memory" ||
            lower === "unlock my memory"
        ) {

            memoryUnlocked = true;

            localStorage.setItem(
                "JARVIS_MEMORY_UNLOCKED",
                "true"
            );

            updateMemoryStatus();

            return (
                "Memory system unlocked."
            );
        }


        /* MEMORY LOCK */

        if (
            lower === "memory lock" ||
            lower === "lock memory"
        ) {

            memoryUnlocked = false;

            localStorage.setItem(
                "JARVIS_MEMORY_UNLOCKED",
                "false"
            );

            updateMemoryStatus();

            return (
                "Memory system locked."
            );
        }


        /* REMEMBER */

        if (
            lower.startsWith("remember ") ||
            lower.startsWith("remember that ") ||
            lower.startsWith("save ") ||
            lower.startsWith("save that ")
        ) {

            return remember(command);
        }


        /* RECALL */

        if (
            lower === "what do you remember" ||
            lower === "show my memories" ||
            lower === "show memories" ||
            lower === "my memories"
        ) {

            return recall();
        }


        /* FORGET */

        if (
            lower.startsWith("forget ")
        ) {

            return forget(command);
        }


        /* CLEAR MEMORY */

        if (
            lower === "clear memory" ||
            lower === "forget everything"
        ) {

            if (!memoryUnlocked) {

                return "Memory is locked.";
            }


            memories = [];

            save(
                MEMORY_KEY,
                memories
            );

            return (
                "All memories have been cleared."
            );
        }


        /* MEMORY STATUS */

        if (
            lower === "memory status"
        ) {

            return (
                "Memory is " +
                (
                    memoryUnlocked
                        ? "ONLINE."
                        : "LOCKED."
                ) +
                " Saved memories: " +
                memories.length
            );
        }


        /* TIME */

        if (
            lower === "time" ||
            lower === "what time is it" ||
            lower === "what's the time"
        ) {

            return (
                "The current time is " +
                new Date().toLocaleTimeString()
            );
        }


        /* DATE */

        if (
            lower === "date" ||
            lower === "what is today's date" ||
            lower === "what's today's date"
        ) {

            return (
                "Today is " +
                new Date().toLocaleDateString([], {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                })
            );
        }


        /* CLEAR CHAT */

        if (
            lower === "clear chat"
        ) {

            chatHistory = [];

            save(
                CHAT_KEY,
                chatHistory
            );

            if (chat) {
                chat.innerHTML = "";
            }

            return (
                "Chat history cleared."
            );
        }


        /* HELP */

        if (
            lower === "help" ||
            lower === "jarvis help"
        ) {

            return (
                "Available commands:\n\n" +
                "Memory unlock\n" +
                "Remember that...\n" +
                "What do you remember?\n" +
                "Memory status\n" +
                "Forget...\n" +
                "Clear memory\n" +
                "Memory lock\n" +
                "What time is it?\n" +
                "What is today's date?\n" +
                "Clear chat"
            );
        }


        /* GREETINGS */

        if (
            lower === "hello" ||
            lower === "hi" ||
            lower === "hey" ||
            lower === "hello jarvis"
        ) {

            return (
                "Hello. J.A.R.V.I.S. systems are online."
            );
        }


        /* LOCAL COMMAND NOT FOUND */

        return null;
    }


    /* =====================================================
       AI BACKEND
       ===================================================== */

    async function askAI(text) {

        try {

            const response =
                await fetch(
                    AI_ENDPOINT,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            message: text,
                            history:
                                chatHistory.slice(-12),
                            memories:
                                memoryUnlocked
                                    ? memories
                                    : []
                        })
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "AI server returned " +
                    response.status
                );
            }


            const data =
                await response.json();


            if (
                data &&
                typeof data.reply === "string" &&
                data.reply.trim()
            ) {

                return data.reply.trim();
            }


            throw new Error(
                "Invalid AI response."
            );

        } catch (error) {

            console.error(
                "AI connection error:",
                error
            );


            return (
                "I can handle local commands, Sir, " +
                "but the AI connection is not available yet."
            );
        }
    }


    /* =====================================================
       SPEECH SYNTHESIS
       ===================================================== */

    function speak(text) {

        if (
            !window.speechSynthesis ||
            typeof SpeechSynthesisUtterance ===
                "undefined"
        ) {
            return;
        }


        try {

            window.speechSynthesis.cancel();


            const utterance =
                new SpeechSynthesisUtterance(
                    String(text)
                        .replace(/\n/g, ". ")
                );


            utterance.lang =
                "en-IN";

            utterance.rate =
                0.95;

            utterance.pitch =
                1;

            utterance.volume =
                1;


            utterance.onstart = () => {

                if (voiceStatus) {

                    voiceStatus.textContent =
                        "J.A.R.V.I.S. SPEAKING";
                }
            };


            utterance.onend = () => {

                if (voiceStatus) {

                    voiceStatus.textContent =
                        recognition
                            ? "VOICE READY"
                            : "VOICE STANDBY";
                }
            };


            window.speechSynthesis.speak(
                utterance
            );

        } catch (error) {

            console.error(
                "Speech error:",
                error
            );
        }
    }


    /* =====================================================
       SEND MESSAGE
       ===================================================== */

    async function sendMessage() {

        if (!input || busy) {
            return;
        }


        const text =
            input.value.trim();


        if (!text) {
            return;
        }


        busy = true;


        if (send) {
            send.disabled = true;
        }


        addMessage(
            "user",
            text
        );


        chatHistory.push({
            role: "user",
            text: text,
            time: getTime()
        });


        save(
            CHAT_KEY,
            chatHistory
        );


        input.value = "";


        /* LOCAL COMMAND FIRST */

        let response =
            localCommand(text);


        /* AI ONLY IF NO LOCAL COMMAND */

        if (response === null) {

            const thinking =
                showThinking();


            response =
                await askAI(text);


            if (thinking) {

                thinking.remove();
            }
        }


        addMessage(
            "jarvis",
            response
        );


        chatHistory.push({
            role: "jarvis",
            text: response,
            time: getTime()
        });


        save(
            CHAT_KEY,
            chatHistory
        );


        speak(response);


        busy = false;


        if (send) {
            send.disabled = false;
        }


        if (input) {
            input.focus();
        }
    }


    /* =====================================================
       VOICE RECOGNITION
       ===================================================== */

    function setupVoice() {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;


        if (!SpeechRecognition) {

            recognition = null;

            if (voiceStatus) {

                voiceStatus.textContent =
                    "VOICE NOT SUPPORTED";
            }


            if (voiceState) {

                voiceState.textContent =
                    "UNAVAILABLE";

                voiceState.classList.remove(
         
