/* =========================================================
   J.A.R.V.I.S. MOBILE EDITION
   STABLE REPLACEMENT SCRIPT
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const chat = document.getElementById("chat");
    const input = document.getElementById("msg");
    const send = document.getElementById("send");

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

    const menuBtn =
        document.getElementById("menuBtn");


    /* =====================================================
       STORAGE
    ===================================================== */

    const MEMORY_KEY = "JARVIS_MEMORY_V3";
    const CHAT_KEY = "JARVIS_CHAT_V3";

    let memories =
        load(MEMORY_KEY, []);

    let chatHistory =
        load(CHAT_KEY, []);

    let memoryUnlocked = true;
    let recognition = null;
    let listening = false;
    let speaking = false;
    let pendingQuestion = null;


    /* =====================================================
       STORAGE FUNCTIONS
    ===================================================== */

    function load(key, fallback) {

        try {

            const data =
                localStorage.getItem(key);

            if (!data) return fallback;

            return JSON.parse(data);

        } catch (error) {

            console.error(
                "JARVIS LOAD ERROR:",
                error
            );

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

            console.error(
                "JARVIS SAVE ERROR:",
                error
            );
        }
    }


    /* =====================================================
       MEMORY STATUS
    ===================================================== */

    function updateMemoryStatus() {

        const boxes =
            document.querySelectorAll(".status");

        boxes.forEach(box => {

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

                    strong.classList.remove(
                        "yellow"
                    );

                    strong.classList.add(
                        "green"
                    );

                } else {

                    strong.textContent = "LOCKED";

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
       VOICE STATUS
    ===================================================== */

    function updateVoiceStatus() {

        if (!voiceState) return;

        if (recognition) {

            voiceState.textContent =
                "ONLINE";

            voiceState.classList.remove(
                "yellow"
            );

            voiceState.classList.add(
                "green"
            );

        } else {

            voiceState.textContent =
                "UNAVAILABLE";

            voiceState.classList.remove(
                "green"
            );

            voiceState.classList.add(
                "yellow"
            );
        }
    }


    /* =====================================================
       ADD CHAT MESSAGE
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

            p.textContent = text;

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
       TIME
    ===================================================== */

    function getTime() {

        return new Date()
            .toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });
    }


    /* =====================================================
       MEMORY
    ===================================================== */

    function remember(text) {

        if (!memoryUnlocked) {

            return "Memory is locked. Say Memory unlock.";
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
            memories.some(
                item =>
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
                .replace(/^forget\s+/i, "")
                .replace(/^forget that\s+/i, "")
                .trim()
                .toLowerCase();

        if (!query) {

            return "Tell me which memory to forget.";
        }

        const old =
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

        if (memories.length < old) {

            return "Memory forgotten.";
        }

        return "I couldn't find that memory.";
    }


    /* =====================================================
       MEMORY QUESTION
    ===================================================== */

    function memoryQuestion(text) {

        const lower =
            text.toLowerCase();


        /* NAME */

        if (
            lower === "what is my name" ||
            lower === "what's my name"
        ) {

            const found =
                memories.filter(
                    item =>
                        /^my name is /i.test(item) ||
                        /^call me /i.test(item)
                );

            if (!found.length) {

                return "You haven't told me your name yet.";
            }

            const latest =
                found[found.length - 1];

            const name =
                latest
                    .replace(
                        /^my name is /i,
                        ""
                    )
                    .replace(
                        /^call me /i,
                        ""
                    );

            return "Your name is " + name + ".";
        }


        /* COLOUR */

        if (
            lower.includes(
                "what is my favourite colour"
            ) ||
            lower.includes(
                "what is my favorite colour"
            ) ||
            lower.includes(
                "what is my favourite color"
            ) ||
            lower.includes(
                "what is my favorite color"
            )
        ) {

            const found =
                memories.filter(
                    item =>
                        /my favourite colour is /i
                            .test(item) ||
                        /my favorite colour is /i
                            .test(item) ||
                        /my favourite color is /i
                            .test(item) ||
                        /my favorite color is /i
                            .test(item)
                );

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


        /* FOOD */

        if (
            lower.includes(
                "what is my favourite food"
            ) ||
            lower.includes(
                "what is my favorite food"
            )
        ) {

            const found =
                memories.filter(
                    item =>
                        /my favourite food is /i
                            .test(item) ||
                        /my favorite food is /i
                            .test(item)
                );

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
       TIME / DATE
    ===================================================== */

    function currentTime() {

        return (
            "The current time is " +
            new Date().toLocaleTimeString()
        );
    }


    function currentDate() {

        return (
            "Today is " +
            new Date().toLocaleDateString(
                [],
                {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            )
        );
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
                "JARVIS_MEMORY_UNLOCKED",
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
                "JARVIS_MEMORY_UNLOCKED",
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


        /* MEMORY QUESTION */

        const answer =
            memoryQuestion(command);

        if (answer) {

            return answer;
        }


        /* TIME */

        if (
            lower === "time" ||
            lower === "what time is it" ||
            lower === "what's the time"
        ) {

            return currentTime();
        }


        /* DATE */

        if (
            lower === "date" ||
            lower === "what is today's date" ||
            lower === "what's today's date"
        ) {

            return currentDate();
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


        /* GREETING */

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

    async function sendMessage() {

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
            text: text
        });

        save(
            CHAT_KEY,
            chatHistory
        );

        input.value = "";

        const response =
            getResponse(text);

        addMessage(
            "jarvis",
            response
        );

        chatHistory.push({
            role: "jarvis",
            text: response
        });

        save(
            CHAT_KEY,
            chatHistory
        );

        speak(response);
    }


    /* =====================================================
       SEND BUTTON
    ===================================================== */

    if (send) {

        send.addEventListener(
            "click",
            sendMessage
        );
    }


    /* =====================================================
       ENTER KEY
    ===================================================== */

    if (input) {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    sendMessage();
                }
            }
        );
    }


    /* =====================================================
       TEXT TO SPEECH
    ===================================================== */

    function speak(text) {

        if (
            !window.speechSynthesis
        ) return;

        try {

            window.speechSynthesis.cancel();

            const utterance =
                new SpeechSynthesisUtterance(
                
