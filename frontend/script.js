/* =========================================================
   J.A.R.V.I.S. MOBILE EDITION
   COMPLETE REPLACEMENT SCRIPT
   MEMORY AUTO-UNLOCK + VOICE + CHAT
   ========================================================= */

"use strict";

/* =========================================================
   ELEMENTS — MATCHES YOUR INDEX.HTML
   ========================================================= */

const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const send = document.getElementById("send");

const voiceButton = document.getElementById("voiceButton");
const voiceHead = document.getElementById("voiceHead");
const voiceStatus = document.getElementById("voiceStatus");

const voiceState = document.getElementById("voiceState");
const coreButton = document.getElementById("coreButton");
const menuBtn = document.getElementById("menuBtn");


/* =========================================================
   STORAGE
   ========================================================= */

const MEMORY_KEY = "JARVIS_MEMORY_V2";
const CHAT_KEY = "JARVIS_CHAT_V2";
const SETTINGS_KEY = "JARVIS_SETTINGS_V2";
const UNLOCK_KEY = "JARVIS_MEMORY_UNLOCKED";


/* =========================================================
   STATE
   ========================================================= */

let memories = loadData(MEMORY_KEY, []);
let chatHistory = loadData(CHAT_KEY, []);

/*
   MEMORY IS AUTOMATICALLY UNLOCKED
*/

let memoryUnlocked = true;

localStorage.setItem(
    UNLOCK_KEY,
    "true"
);

let voiceEnabled = true;
let listening = false;
let recognition = null;

let pendingQuestion = null;


/* =========================================================
   STORAGE FUNCTIONS
   ========================================================= */

function loadData(key, fallback) {

    try {

        const data =
            localStorage.getItem(key);

        if (!data) return fallback;

        const parsed =
            JSON.parse(data);

        return parsed;

    } catch (error) {

        console.error(
            "JARVIS storage error:",
            error
        );

        return fallback;
    }
}


function saveData(key, data) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error(
            "JARVIS save error:",
            error
        );
    }
}


/* =========================================================
   MEMORY UNLOCK
   ========================================================= */

function unlockMemory() {

    memoryUnlocked = true;

    localStorage.setItem(
        UNLOCK_KEY,
        "true"
    );

    updateMemoryStatus();

    return (
        "Memory system unlocked. " +
        "I am ready to remember information."
    );
}


/* =========================================================
   MEMORY LOCK
   ========================================================= */

function lockMemory() {

    /*
       Lock command is still available,
       but startup automatically unlocks memory.
    */

    memoryUnlocked = false;

    localStorage.setItem(
        UNLOCK_KEY,
        "false"
    );

    updateMemoryStatus();

    return "Memory system locked.";
}


/* =========================================================
   AUTO MEMORY INITIALIZATION
   ========================================================= */

function initializeMemory() {

    memoryUnlocked = true;

    localStorage.setItem(
        UNLOCK_KEY,
        "true"
    );

    updateMemoryStatus();
}


/* =========================================================
   FIND MEMORY STATUS ELEMENT
   ========================================================= */

function getMemoryStatusElement() {

    const statusBoxes =
        document.querySelectorAll(".status");

    for (const box of statusBoxes) {

        const small =
            box.querySelector("small");

        if (
            small &&
            small.textContent
                .trim()
                .toUpperCase() === "MEMORY"
        ) {

            return box.querySelector("strong");
        }
    }

    return null;
}


/* =========================================================
   UPDATE MEMORY STATUS
   ========================================================= */

function updateMemoryStatus() {

    const element =
        getMemoryStatusElement();

    if (!element) return;

    if (memoryUnlocked) {

        element.textContent = "ONLINE";

        element.classList.remove("yellow");
        element.classList.add("green");

    } else {

        element.textContent = "LOCKED";

        element.classList.remove("green");
        element.classList.add("yellow");
    }
}


/* =========================================================
   VOICE STATUS
   ========================================================= */

function updateVoiceStatus(online) {

    if (!voiceState) return;

    if (online) {

        voiceState.textContent = "ONLINE";

        voiceState.classList.remove("yellow");
        voiceState.classList.add("green");

    } else {

        voiceState.textContent = "LOCKED";

        voiceState.classList.remove("green");
        voiceState.classList.add("yellow");
    }
}


/* =========================================================
   CLEAN TEXT
   ========================================================= */

function cleanText(text) {

    return String(text || "")
        .replace(/\s+/g, " ")
        .trim();
}


/* =========================================================
   MEMORY DATABASE
   ========================================================= */

function addMemory(
    text,
    category = "general"
) {

    text = cleanText(text);

    if (!text) return false;

    const duplicate =
        memories.some(
            item =>
                item.text &&
                item.text.toLowerCase() ===
                text.toLowerCase()
        );

    if (duplicate) {
        return true;
    }

    memories.push({

        id:
            Date.now() +
            "-" +
            Math.random(),

        text: text,

        category: category,

        created:
            new Date().toISOString()
    });

    saveData(
        MEMORY_KEY,
        memories
    );

    return true;
}


/* =========================================================
   REMOVE MEMORY
   ========================================================= */

function removeMemory(search) {

    search =
        cleanText(search).toLowerCase();

    if (!search) return false;

    const oldLength =
        memories.length;

    memories =
        memories.filter(
            memory =>
                !memory.text
                    .toLowerCase()
                    .includes(search)
        );

    saveData(
        MEMORY_KEY,
        memories
    );

    return memories.length < oldLength;
}


/* =========================================================
   CLEAR ALL MEMORIES
   ========================================================= */

function clearMemories() {

    memories = [];

    saveData(
        MEMORY_KEY,
        memories
    );
}


/* =========================================================
   SEARCH MEMORY
   ========================================================= */

function searchMemory(query) {

    query =
        cleanText(query).toLowerCase();

    return memories.filter(
        memory =>
            memory.text
                .toLowerCase()
                .includes(query)
    );
}


/* =========================================================
   MEMORY CATEGORY
   ========================================================= */

function getCategory(text) {

    const lower =
        text.toLowerCase();

    if (
        lower.includes("name") ||
        lower.includes("call me")
    ) {

        return "identity";
    }

    if (
        lower.includes("favorite") ||
        lower.includes("favourite")
    ) {

        return "preference";
    }

    if (
        lower.includes("like") ||
        lower.includes("love") ||
        lower.includes("prefer")
    ) {

        return "preference";
    }

    if (
        lower.includes("project") ||
        lower.includes("jarvis")
    ) {

        return "project";
    }

    return "general";
}


/* =========================================================
   REMEMBER INFORMATION
   ========================================================= */

function rememberInformation(text) {

    if (!memoryUnlocked) {

        return (
            "Memory is currently locked. " +
            "Say \"Memory unlock\" to enable it."
        );
    }

    let memory =
        cleanText(text);

    memory =
        memory
            .replace(
                /^remember that\s+/i,
                ""
            )
            .replace(
                /^remember\s+/i,
                ""
            )
            .replace(
                /^save that\s+/i,
                ""
            )
            .replace(
                /^save\s+/i,
                ""
            )
            .trim();

    if (!memory) {

        return (
            "Tell me what you want " +
            "me to remember."
        );
    }

    addMemory(
        memory,
        getCategory(memory)
    );

    return (
        `Memory saved: ${memory}`
    );
}


/* =========================================================
   RECALL MEMORY
   ========================================================= */

function recallMemory() {

    if (!memoryUnlocked) {

        return (
            "Memory is locked. " +
            "Say \"Memory unlock\" first."
        );
    }

    if (memories.length === 0) {

        return (
            "My memory database is empty."
        );
    }

    let result =
        "Here is what I remember:\n\n";

    memories.forEach(
        (memory, index) => {

            result +=
                `${index + 1}. ${memory.text}\n`;
        }
    );

    return result;
}


/* =========================================================
   FORGET MEMORY
   ========================================================= */

function forgetInformation(text) {

    if (!memoryUnlocked) {

        return (
            "Memory is locked. " +
            "Say \"Memory unlock\" first."
        );
    }

    let query =
        cleanText(text);

    query =
        query
            .replace(
                /^forget that\s+/i,
                ""
            )
            .replace(
                /^forget\s+/i,
                ""
            )
            .replace(
                /^delete memory\s+/i,
                ""
            )
            .replace(
                /^remove memory\s+/i,
                ""
            )
            .trim();

    if (!query) {

        return (
            "Tell me which memory " +
            "to forget."
        );
    }

    const removed =
        removeMemory(query);

    if (removed) {

        return (
            `I've forgotten the memory ` +
            `matching "${query}".`
        );
    }

    return (
        `I couldn't find a memory ` +
        `matching "${query}".`
    );
}


/* =========================================================
   MEMORY QUESTION ENGINE
   ========================================================= */

function answerMemoryQuestion(text) {

    const lower =
        text.toLowerCase();


    /* =========================================
       FAVOURITE COLOUR
       ========================================= */

    if (
        lower.includes(
            "what is my favourite colour"
        ) ||
        lower.includes(
            "what is my favorite colour"
        ) ||
        lower.includes(
            "what's my favourite colour"
        ) ||
        lower.includes(
            "what's my favorite colour"
        ) ||
        lower.includes(
            "what is my favourite color"
        ) ||
        lower.includes(
            "what is my favorite color"
        ) ||
        lower.includes(
            "what's my favourite color"
        ) ||
        lower.includes(
            "what's my favorite color"
        )
    ) {

        if (!memoryUnlocked) {

            return (
                "Memory is currently locked."
            );
        }

        const matches =
            memories.filter(
                memory =>
                    /favou?rite\s+colou?r/i
                        .test(memory.text)
            );

        if (matches.length > 0) {

            const latest =
                matches[matches.length - 1];

            const match =
                latest.text.match(
                    /favou?rite\s+colou?r\s+(?:is|=)\s+(.+)/i
                );

            if (
                match &&
                match[1]
            ) {

                return (
                    `Your favourite colour is ` +
                    `${match[1].trim()}.`
                );
            }

            return latest.text;
        }

        return (
            "I don't have your favourite " +
            "colour saved yet."
        );
    }


    /* =========================================
       FAVOURITE FOOD
       ========================================= */

    if (
        lower.includes(
            "what is my favourite food"
        ) ||
        lower.includes(
            "what is my favorite food"
        ) ||
        lower.includes(
            "what's my favourite food"
        ) ||
        lower.includes(
            "what's my favorite food"
        )
    ) {

        if (!memoryUnlocked) {

            return (
                "Memory is currently locked."
            );
        }

        const matches =
            memories.filter(
                memory =>
                    /favou?rite\s+food/i
                        .test(memory.text)
            );

        if (matches.length > 0) {

            const latest =
                matches[matches.length - 1];

            const match =
                latest.text.match(
                    /favou?rite\s+food\s+(?:is|=)\s+(.+)/i
                );

            if (
                match &&
                match[1]
            ) {

                return (
                    `Your favourite food is ` +
                    `${match[1].trim()}.`
                );
            }

            return latest.text;
        }

        return (
            "I don't have your favourite " +
            "food saved yet."
        );
    }


    /* =========================================
       NAME
       ========================================= */

    if (
        lower === "what is my name" ||
        lower === "what's my name" ||
        lower.includes(
            "do you know my name"
        )
    ) {

        if (!memoryUnlocked) {

            return (
                "Memory is currently locked."
            );
        }

        const matches =
            memories.filter(
                memory =>
                    /my name is/i
                        .test(memory.text) ||
                    /call me/i
                        .test(memory.text)
            );

        if (matches.length > 0) {

            const value =
                matches[
                    matches.length - 1
                ].text
                    .replace(
                        /^my name is\s+/i,
                        ""
                    )
                    .replace(
                        /^call me\s+/i,
                        ""
                    );

            return (
                `Your name is ${value}.`
            );
        }

        return (
            "You haven't told me your " +
            "name yet."
        );
    }

    return null;
}


/* =========================================================
   CHAT HISTORY
   ========================================================= */

function saveChat(
    role,
    text
) {

    chatHistory.push({

        role: role,

        text: text,

        time:
            new Date().toISOString()
    });

    if (
        chatHistory.length > 100
    ) {

        chatHistory =
            chatHistory.slice(-100);
    }

    saveData(
        CHAT_KEY,
        chatHistory
    );
}


/* =========================================================
   TIME
   ========================================================= */

function getTime() {

    return new Date()
        .toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
}


/* =========================================================
   CHAT MESSAGE
   ========================================================= */

function addMessage(
    type,
    text
) {

    if (!chat) return;

    const message =
        document.createElement("div");

    message.className =
        type === "user"
            ? "message user"
            : "message jarvis";


    if (type === "jarvis") {

        message.innerHTML = `
            <div class="avatar">◆</div>

            <div class="bubble">

                <label>J.A.R.V.I.S.</label>

                <p></p>

                <time>${getTime()}</time>

            </div>
        `;

    } else {

        message.innerHTML = `
            <div class="bubble">

                <label>YOU</label>

                <p></p>

                <time>${getTime()} ✓</time>

            </div>
        `;
    }


    const paragraph =
        message.querySelector("p");

    paragraph.textContent =
        text;

    chat.appendChild(
        message
    );

    chat.scrollTop =
        chat.scrollHeight;
}


/* =========================================================
   SIMPLE ANSWER DETECTION
   ========================================================= */

function isSimpleAnswer(text) {

    const lower =
        text.toLowerCase();

    if (
        lower.startsWith("what ") ||
        lower.startsWith("who ") ||
        lower.startsWith("where ") ||
        lower.startsWith("why ") ||
        lower.startsWith("how ")
    ) {

        return false;
    }

    return (
        text.length < 80
    );
}


/* =========================================================
   SAVE CONTEXTUAL ANSWER
   ========================================================= */

function saveAnswerToQuestion(
    question,
    answer
) {

    answer =
        cleanText(answer);

    if (!answer) return;


    if (
        question ===
        "favourite colour"
    ) {

        addMemory(
            `My favourite colour is ${answer}`,
            "preference"
        );

        return;
    }


    if (
        question ===
        "favourite food"
    ) {

        addMemory(
            `My favourite food is ${answer}`,
            "preference"
        );

        return;
    }


    if (
        question === "name"
    ) {

        addMemory(
            `My name is ${answer}`,
            "identity"
        );

        return;
    }


    addMemory(
        answer,
        "general"
    );
}


/* =========================================================
   JARVIS RESPONSE ENGINE
   ========================================================= */

function getResponse(text) {

    const command =
        cleanText(text);

    const lower =
        command.toLowerCase();


    if (!command) {

        return "Please say something.";
    }


    /* =========================================
       MEMORY UNLOCK
       ========================================= */

    if (
        lower === "memory unlock" ||
        lower === "unlock memory" ||
        lower === "unlock my memory"
    ) {

        return unlockMemory();
    }


    /* =========================================
       MEMORY LOCK
       ========================================= */

    if (
        lower === "memory lock" ||
        lower === "lock memory"
    ) {

        return lockMemory();
    }


    /* =========================================
       REMEMBER
       ========================================= */

    if (
        lower.startsWith("remember ") ||
        lower.startsWith("remember that ") ||
        lower.startsWith("save ") ||
        lower.startsWith("save that ")
    ) {

        return rememberInformation(
            command
        );
    }


    /* =========================================
       RECALL
       ========================================= */

    if (
        lower === "what do you remember" ||
        lower === "show my memories" ||
        lower === "show memories" ||
        lower === "recall my memories" ||
        lower === "my memories"
    ) {

        return recallMemory();
    }


    /* =========================================
       MEMORY STATUS
       ========================================= */

    if (
        lower === "memory status" ||
        lower === "how many memories" ||
        lower === "memory count"
    ) {

        return memoryUnlocked
            ? `Memory is online. I have ${
                memories.length
            } saved memor${
                memories.length === 1
                    ? "y"
                    : "ies"
            }.`
            : "Memory is currently locked.";
    }


    /* =========================================
       FORGET EVERYTHING
       ========================================= */

    if (
        lower === "forget everything" ||
        lower === "forget all memories" ||
        lower === "clear memory" ||
        lower === "clear all memory"
    ) {

        if (!memoryUnlocked) {

            return (
                "Memory is locked. " +
                "Unlock it before " +
                "clearing memories."
            );
        }

        clearMemories();

        return (
            "All JARVIS memories " +
            "have been cleared."
        );
    }


    /* =========================================
       FORGET ONE
       ========================================= */

    if (
        lower.startsWith("forget ") ||
        lower.startsWith("forget that ") ||
        lower.startsWith("delete memory ") ||
        lower.startsWith("remove memory ")
    ) {

        return forgetInformation(
            command
        );
    }


    /* =========================================
       MEMORY QUESTION
       ========================================= */

    const memoryAnswer =
        answerMemoryQuestion(
            command
        );

    if (memoryAnswer) {

        return memoryAnswer;
    }


    /* =========================================
       CONTEXTUAL ANSWER
       ========================================= */

    if (
        pendingQuestion &&
        isSimpleAnswer(command)
    ) {

        if (memoryUnlocked) {

            saveAnswerToQuestion(
                pendingQuestion,
                command
            );

            const question =
                pendingQuestion;

            pendingQuestion = null;

            if (
                question ===
                "favourite colour"
            ) {

                return (
                    `Understood. I'll remember ` +
                    `that your favourite colour ` +
                    `is ${command}.`
                );
            }

            if (
                question ===
                "favourite food"
            ) {

                return (
                    `Understood. I'll remember ` +
                    `that your favourite food ` +
                    `is ${command}.`
                );
            }

            return (
                `Understood. I'll remember ` +
                `that: ${command}.`
            );
        }
    }


    /* =========================================
       FAVOURITE COLOUR QUESTION
       ========================================= */

    if (
        lower.includes(
            "favourite colour"
        ) ||
        lower.includes(
            "favorite colour"
        ) ||
        lower.includes(
            "favourite color"
        ) ||
        lower.includes(
            "favorite color"
        )
    ) {

        pendingQuestion =
            "favourite colour";

        return (
            "What is your favourite colour?"
        );
    }


    /* =========================================
       FAVOURITE FOOD QUESTION
       ========================================= */

    if (
        lower.includes(
            "favourite food"
        ) ||
        lower.includes(
            "favorite food"
        )
    ) {

        pendingQuestion =
            "favourite food";

        return (
            "What is your favourite food?"
        );
    }


    /* =========================================
       GREETINGS
       ========================================= */

    if (
        lower === "hello" ||
        lower === "hi" ||
        lower === "hey" ||
        lower === "hello jarvis"
    ) {

        return (
            "Hello. J.A.R.V.I.S. " +
            "systems are online."
        );
    }


    /* =========================================
       WHO ARE YOU
       ========================================= */

    if (
        lower.includes(
            "who are you"
        ) ||
        lower.includes(
            "what are you"
        )
    ) {

        return (
            "I am J.A.R.V.I.S., " +
            "your personal AI assistant."
        );
    }


    /* =========================================
       ARE YOU THERE
       ========================================= */

    if (
        lower.includes(
            "are you there"
        ) ||
        lower.includes(
            "jarvis are you there"
        )
    ) {

        return (
            "Always online and ready."
        );
    }


    /* =========================================
       HELP
       ========================================= */

    if (
        lower === "help" ||
        lower === "jarvis help"
    ) {

        return (
            "J.A.R.V.I.S. commands:\n\n" +
            "Memory unlock\n" +
            "Remember that...\n" +
            "What do you remember?\n" +
            "What is my favourite colour?\n" +
            "What is my favourite food?\n" +
            "Memory status\n" +
            "Forget...\n" +
            "Forget everything\n" +
            "Memory lock"
        );
    }


    /* =========================================
       DEFAULT
       ========================================= */

    return (
        `I received: "${command}"`
    );
}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

function sendMessage() {

    if (!input) return;

    const text =
        cleanText(input.value);

    if (!text) return;

    addMessage(
        "user",
        text
    );

    saveChat(
        "user",
        text
    );

    input.value = "";

    const response =
        getResponse(text);

    setTimeout(
        () => {

            addMessage(
                "jarvis",
                response
            );

            saveChat(
                "jarvis",
                response
            );

            speak(response);

        },
        180
    );
}


/* =========================================================
   BUTTON
   ========================================================= */

if (send) {

    send.addEventListener(
        "click",
        sendMessage
    );
}


/* =========================================================
   ENTER KEY
   ========================================================= */

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


/* =========================================================
   TEXT TO SPEECH
   ========================================================= */

function speak(text) {

    if (
        !voiceEnabled ||
        !("speechSynthesis" in window)
    ) {

        return;
    }

    try {

        window.speechSynthesis.cancel();

        const utterance =
            new SpeechSynthesisUtterance(
                text
            );

        utterance.rate = 0.95;
        utterance.pitch = 0.9;
        utterance.volume = 1;

        window.speechSynthesis.speak(
            utterance
        );

    } catch (error) {

        console.error(
            "JARVIS speech error:",
            error
        );
    }
}


/* =========================================================
   VOICE RECOGNITION
   ========================================================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.lang = "en-IN";


    recognition.onstart = () => {

        listening = true;

        if (voiceStatus) {

            voiceStatus.textContent =
                "LISTENING...";
        }

        updateVoiceStatus(true);
    };


    recognition.onresult = event => {

        const result =
            event.results[
                event.results.length - 1
            ];

        if (!result) return;

        const transcript =
            result[0].transcript.trim();

        if (!transcript) return;

        if (input) {

            input.value =
                transcript;
        }

        sendMessage();
    };


    recognition.onerror = event => {

        console.error(
            "Voice recognition error:",
            event.error
        );

        listening = false;

        if (voiceStatus) {

            voiceStatus.textContent =
                "VOICE ERROR";
        }
    };


    recognition.onend = () => {

        listening = false;

        if (voiceStatus) {

            voiceStatus.textContent =
                "READY";
        }
    };

} else {

    updateVoiceStatus(false);
}


/* =========================================================
   VOICE BUTTON
   ========================================================= */

function startVoice() {

    if (!recognition) {

        if (voiceStatus) {

            voiceStatus.textContent =
                "VOICE NOT SUPPORTED";
        }

        return;
    }

    if (listening) {

        recognition.stop();

        return;
    }

    try {

        recognition.start();

    } catch (error) {

        console.error(
            "Voice start error:",
            error
        );
    }
}


if (voiceButton) {

    voiceButton.addEventListener(
        "click",
        startVoice
    );
}


if (voiceHead) {

    voiceHead.addEventListener(
        "click",
        startVoice
    );
}


/* =========================================================
   CORE BUTTON
   ========================================================= */

if (coreButton) {

    coreButton.addEventListener(
        "click",
        () => {

            if (voiceEnabled) {

                startVoice();

            } else {

                speak(
                    "J.A.R.V.I.S. systems ready."
                );
            }
        }
    );
}


/* =========================================================
   MENU BUTTON
   ========================================================= */

if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        () => {

            addMessage(
                "jarvis",
                "J.A.R.V.I.S. menu online. Say \"help\" for available commands."
            );
        }
    );
}


/* =========================================================
   RESTORE CHAT HISTORY
   ========================================================= */

function restoreChat() {

    if (!chat) return;

    chat.innerHTML = "";

    chatHistory.forEach(
        item => {

            addMessage(
                item.role === "user"
                    ? "user"
                    : "jarvis",
                item.text
            );
        }
    );
}


/* =========================================================
   STARTUP
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
           Force memory ONLINE every time
           J.A.R.V.I.S. starts.
        */

        initializeMemory();

        updateVoiceStatus(
            !!recognition
        );

        restoreChat();

        /*
           If there is no previous chat,
           show startup message.
        */

        if (
            chatHistory.length === 0
        ) {

            addMessage(
                "jarvis",
                "J.A.R.V.I.S. systems online. Memory is unlocked and ready."
            );
        }

        console.log(
            "J.A.R.V.I.S. ONLINE"
        );

        console.log(
            "Memory:",
            memoryUnlocked
                ? "UNLOCKED"
                : "LOCKED"
        );

        console.log(
            "Saved memories:",
            memories.length
        );
    }
);


/* =========================================================
   GLOBAL ACCESS
   Useful for testing from console
   ========================================================= */

window.JARVIS = {

    unlockMemory,

    lockMemory,

    addMemory,

    removeMemory,

    clearMemories,

    recallMemory,

    searchMemory,

    getResponse,

    sendMessage,

    speak,

    memories: () =>
        memories
};


/* =========================================================
   END
   ========================================================= */
