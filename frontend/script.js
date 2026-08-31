/* =========================================================
   J.A.R.V.I.S. MOBILE EDITION
   COMPLETE STABLE REPLACEMENT SCRIPT
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", function () {

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
       STORAGE
    ===================================================== */

    const MEMORY_KEY = "JARVIS_MEMORY_V4";
    const CHAT_KEY = "JARVIS_CHAT_V4";
    const MEMORY_UNLOCK_KEY = "JARVIS_MEMORY_UNLOCKED";

    let memories = load(MEMORY_KEY, []);
    let chatHistory = load(CHAT_KEY, []);

    let memoryUnlocked =
        localStorage.getItem(MEMORY_UNLOCK_KEY) !== "false";

    let recognition = null;
    let listening = false;


    /* =====================================================
       SAFE STORAGE
    ===================================================== */

    function load(key, fallback) {
        try {
            const data = localStorage.getItem(key);

            if (!data) {
                return fallback;
            }

            const parsed = JSON.parse(data);

            return parsed;
        } catch (error) {
            console.error("JARVIS storage load error:", error);
            return fallback;
        }
    }


    function save(key, data) {
        try {
            localStorage.setItem(
                key,
                JSON.stringify(data)
            );
        } catch (error) {
            console.error("JARVIS storage save error:", error);
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
       CHAT
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

            label.textContent = "J.A.R.V.I.S.";


            const p =
                document.createElement("p");

            p.textContent = text;


            const time =
                document.createElement("time");

            time.textContent = getTime();


            bubble.appendChild(label);
            bubble.appendChild(p);
            bubble.appendChild(time);

            message.appendChild(avatar);
            message.appendChild(bubble);

        } else {

            const bubble =
                document.createElement("div");

            bubble.className = "bubble";


            const label =
                document.createElement("label");

            label.textContent = "YOU";


            const p =
                document.createElement("p");

            p.textContent = text;


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
       MEMORY STATUS
    ===================================================== */

    function updateMemoryStatus() {

        const statuses =
            document.querySelectorAll(".status");

        statuses.forEach(function (box) {

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

                    strong.textContent = "ONLINE";

                    strong.classList.remove("yellow");
                    strong.classList.add("green");

                } else {

                    strong.textContent = "LOCKED";

                    strong.classList.remove("green");
                    strong.classList.add("yellow");
                }
            }
        });
    }


    /* =====================================================
       VOICE SUPPORT
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

                voiceState.classList.remove("green");
                voiceState.classList.add("yellow");
            }

            return;
        }


        recognition =
            new SpeechRecognition();


        recognition.lang = "en-IN";

        recognition.continuous = false;

        recognition.interimResults = false;

        recognition.maxAlternatives = 1;


        recognition.onstart = function () {

            listening = true;

            if (voiceStatus) {
                voiceStatus.textContent =
                    "LISTENING...";
            }

            if (voiceState) {

                voiceState.textContent =
                    "LISTENING";

                voiceState.classList.remove("yellow");
                voiceState.classList.add("green");
            }
        };


        recognition.onresult = function (event) {

            const result =
                event.results[0][0].transcript;

            if (input) {
                input.value = result;
            }

            if (voiceStatus) {
                voiceStatus.textContent =
                    "VOICE RECEIVED";
            }

            /* Automatically send voice command */
            setTimeout(function () {

                sendMessage();

            }, 100);
        };


        recognition.onerror = function (event) {

            console.error(
                "Voice recognition error:",
                event.error
            );

            listening = false;

            if (voiceStatus) {
                voiceStatus.textContent =
                    "VOICE ERROR";
            }

            updateVoiceUI();
        };


        recognition.onend = function () {

            listening = false;

            updateVoiceUI();
        };


        if (voiceStatus) {
            voiceStatus.textContent =
                "VOICE READY";
        }

        if (voiceState) {

            voiceState.textContent =
                "ONLINE";

            voiceState.classList.remove("yellow");
            voiceState.classList.add("green");
        }
    }


    function updateVoiceUI() {

        if (!voiceState) return;

        if (!recognition) {

            voiceState.textContent =
                "UNAVAILABLE";

            voiceState.classList.remove("green");
            voiceState.classList.add("yellow");

            return;
        }


        if (listening) {

            voiceState.textContent =
                "LISTENING";

            voiceState.classList.remove("yellow");
            voiceState.classList.add("green");

        } else {

            voiceState.textContent =
                "ONLINE";

            voiceState.classList.remove("yellow");
            voiceState.classList.add("green");
        }
    }


    function toggleVoice() {

        if (!recognition) {

            if (voiceStatus) {
                voiceStatus.textContent =
                    "VOICE NOT SUPPORTED";
            }

            return;
        }


        try {

            if (listening) {

                recognition.stop();

            } else {

                recognition.start();
            }

        } catch (error) {

            console.error(
                "Voice start/stop error:",
                error
            );

            listening = false;

            updateVoiceUI();
        }
    }


    /* =====================================================
       TEXT TO SPEECH
    ===================================================== */

    function speak(text) {

        if (
            !window.speechSynthesis ||
            typeof SpeechSynthesisUtterance === "undefined"
        ) {
            return;
        }


        try {

            window.speechSynthesis.cancel();


            const cleanText =
                String(text)
                    .replace(/\n/g, ". ")
                    .trim();


            if (!cleanText) return;


            const utterance =
                new SpeechSynthesisUtterance(
                    cleanText
                );


            utterance.lang = "en-IN";

            utterance.rate = 0.95;

            utterance.pitch = 1.0;

            utterance.volume = 1.0;


            utterance.onstart = function () {

                if (voiceStatus) {
                    voiceStatus.textContent =
                        "J.A.R.V.I.S. SPEAKING";
                }
            };


            utterance.onend = function () {

                if (voiceStatus) {
                    voiceStatus.textContent =
                        recognition
                            ? "VOICE READY"
                            : "VOICE STANDBY";
                }
            };


            utterance.onerror = function () {

                if (voiceStatus) {
                    voiceStatus.textContent =
                        "VOICE STANDBY";
                }
            };


            window.speechSynthesis.speak(
                utterance
            );

        } catch (error) {

            console.error(
                "Speech synthesis error:",
                error
            );
        }
    }


    /* =====================================================
       MEMORY
    ===================================================== */

    function remember(text) {

        if (!memoryUnlocked) {
            return "Memory is locked.";
        }


        let value =
            text
                .replace(/^remember that\s+/i, "")
                .replace(/^remember\s+/i, "")
                .replace(/^save that\s+/i, "")
                .replace(/^save\s+/i, "")
                .trim();


        if (!value) {
            return "Tell me what you want me to remember.";
        }


        const exists =
            memories.some(function (item) {

                return item.toLowerCase() ===
                    value.toLowerCase();
            });


        if (!exists) {

            memories.push(value);

            save(
                MEMORY_KEY,
                memories
            );
        }


        updateMemoryStatus();

        return "Memory saved: " + value;
    }


    function recall() {

        if (!memoryUnlocked) {
            return "Memory is locked.";
        }


        if (!memories.length) {
            return "My memory database is empty.";
        }


        return (
            "Here is what I remember:\n\n" +
            memories
                .map(function (item, index) {
                    return (
                        (index + 1) +
                        ". " +
                        item
                    );
                })
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
            return "Tell me which memory to forget.";
        }


        const oldLength =
            memories.length;


        memories =
            memories.filter(function (item) {

                return !item
                    .toLowerCase()
                    .includes(query);
            });


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


        return "I couldn't find that memory.";
    }


    function memoryQuestion(text) {

        const lower =
            text.toLowerCase();


        /* NAME */

        if (
            lower === "what is my name" ||
            lower === "what's my name"
        ) {

            const found =
                memories.filter(function (item) {

                    return (
                        /^my name is /i.test(item) ||
                        /^call me /i.test(item)
                    );
                });


            if (!found.length) {
                return "You haven't told me your name yet.";
            }


            const latest =
                found[found.length - 1];


            const name =
                latest
                    .replace(/^my name is /i, "")
                    .replace(/^call me /i, "");


            return "Your name is " + name + ".";
        }


        /* FAVOURITE COLOUR */

        if (
            lower.includes("what is my favourite colour") ||
            lower.includes("what is my favorite colour") ||
            lower.includes("what is my favourite color") ||
            lower.includes("what is my favorite color")
        ) {

            const found =
                memories.filter(function (item) {

                    return (
                        /my favourite colour is /i.test(item) ||
                        /my favorite colour is /i.test(item) ||
                        /my favourite color is /i.test(item) ||
                        /my favorite color is /i.test(item)
                    );
                });


            if (!found.length) {

                return (
                    "I don't have your favourite colour saved yet."
                );
            }


            const latest =
                found[found.length - 1];


            const colour =
                latest.replace(
                    /^my favou?rite colou?r is /i,
                    ""
                );


            return (
                "Your favourite colour is " +
                colour +
                "."
            );
        }


        /* FAVOURITE FOOD */

        if (
            lower.includes("what is my favourite food") ||
            lower.includes("what is my favorite food")
        ) {

            const found =
                memories.filter(function (item) {

                    return (
                        /my favourite food is /i.test(item) ||
                        /my favorite food is /i.test(item)
                    );
                });


            if (!found.length) {

                return (
                    "I don't have your favourite food saved yet."
                );
            }


            const latest =
                found[found.length - 1];


            const food =
                latest.replace(
                    /^my favou?rite food is /i,
                    ""
                );


            return (
                "Your favourite food is " +
                food +
                "."
            );
        }


        return null;
    }


    /* =====================================================
       RESPONSE ENGINE
    ===================================================== */

    function getResponse(text) {

        const command =
            text.trim();


        const lower =
            command.toLowerCase();


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
                MEMORY_UNLOCK_KEY,
                "true"
            );

            updateMemoryStatus();

            return (
                "Memory system unlocked. I am ready to remember."
            );
        }


        /* MEMORY LOCK */

        if (
            lower === "memory lock" ||
            lower === "lock memory"
        ) {

            memoryUnlocked = false;

            localStorage.setItem(
                MEMORY_UNLOCK_KEY,
                "false"
            );

            updateMemoryStatus();

            return "Memory system locked.";
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


            return "All memories have been cleared.";
        }


        /* MEMORY QUESTIONS */

        const memoryAnswer =
            memoryQuestion(command);


        if (memoryAnswer) {
            return memoryAnswer;
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


            return "Chat history cleared.";
        }


        /* HELP */

        if (
            lower === "help" ||
            lower === "jarvis help"
        ) {

            return (
                "J.A.R.V.I.S. COMMANDS\n\n" +
                "Memory unlock\n" +
                "Remember that...\n" +
                "What do you remember?\n" +
                "What is my name?\n" +
                "What is my favourite colour?\n" +
                "What is my favourite food?\n" +
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


        /* IDENTITY */

        if (
            lower.includes("who are you")
        ) {

            return (
                "I am J.A.R.V.I.S., your personal AI assistant."
            );
        }


        /* DEFAULT */

        return (
            'I received: "' +
            command +
            '"'
        );
    }


    /* =====================================================
       SEND MESSAGE
    ===================================================== */

    function sendMessage() {

        if (!input) return;


        const text =
            input.value.trim();


        if (!text) return;


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


        let response;


        try {

            response =
                getResponse(text);

        } catch (error) {

            console.error(
                "JARVIS response error:",
                error
            );

            response =
                "Sorry, Sir. I encountered an internal error.";
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
    }


    /* =====================================================
       BUTTON EVENTS
    ===================================================== */

    if (send) {

        send.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                sendMessage();
            }
        );
    }


    if (input) {

        input.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    sendMessage();
                }
            }
        );
    }


    if (voiceButton) {

        voiceButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                toggleVoice();
            }
        );
    }


    if (voiceHead) {

        voiceHead.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                toggleVoice();
            }
        );
    }


    /* =====================================================
       CORE BUTTON
    ===================================================== */

    if (coreButton) {

        coreButton.addEventListener(
            "click",
            function () {

                if (voiceStatus) {

                    voiceStatus.textContent =
                        "J.A.R.V.I.S. CORE ACTIVE";
                }

                addMessage(
                    "jarvis",
                    "Core systems are active. How may I assist you?"
                );

                speak(
                    "Core systems are active. How may I assist you?"
                );
            }
        );
    }


    /* =====================================================
       MENU BUTTON
    ===================================================== */

    if (menuBtn) {

        menuBtn.addEventListener(
            "click",
            function () {

                addMessage(
                    "jarvis",
                    "System menu is ready. Try saying 'help' for available commands."
                );
            }
        );
    }


    /* =====================================================
       RESTORE CHAT
    ===================================================== */

    function restoreChat() {

        if (!chat) return;


        /*
         * Keep the original HTML welcome messages.
         * Restore saved messages after them.
         */

        chatHistory.forEach(function (item) {

            if (!item || !item.text) return;

            addMessage(
                item.role === "user"
                    ? "user"
                    : "jarvis",
                item.text
            );
        });
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    updateMemoryStatus();

    setupVoice();

    /*
     * Focus input after startup.
     */
    if (input) {
        setTimeout(function () {
            input.focus();
        }, 300);
    }


    console.log(
        "J.A.R.V.I.S. initialized successfully."
    );

});
