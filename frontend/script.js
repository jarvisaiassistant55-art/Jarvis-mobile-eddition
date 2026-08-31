/* =========================================================
   J.A.R.V.I.S. MOBILE EDITION
   COMPLETE REPLACEMENT SCRIPT
   MEMORY + VOICE + CHAT
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

/* =========================================================
   STATE
   ========================================================= */

let memories = loadData(MEMORY_KEY, []);
let chatHistory = loadData(CHAT_KEY, []);

let memoryUnlocked =
    localStorage.getItem("JARVIS_MEMORY_UNLOCKED") === "true";

let voiceEnabled = true;
let listening = false;
let recognition = null;

/*
   Used when the user says:

   "What is my favourite colour?"
   "Blue"

   JARVIS can understand that the answer belongs
   to the previous question.
*/
let pendingQuestion = null;


/* =========================================================
   STORAGE FUNCTIONS
   ========================================================= */

function loadData(key, fallback) {
    try {
        const data = localStorage.getItem(key);

        if (!data) return fallback;

        return JSON.parse(data);
    } catch (error) {
        console.error("JARVIS storage error:", error);
        return fallback;
    }
}


function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error("JARVIS save error:", error);
    }
}


/* =========================================================
   MEMORY UNLOCK
   ========================================================= */

function unlockMemory() {

    memoryUnlocked = true;

    localStorage.setItem(
        "JARVIS_MEMORY_UNLOCKED",
        "true"
    );

    updateMemoryStatus();

    return "Memory system unlocked. I am ready to remember information.";
}


function lockMemory() {

    memoryUnlocked = false;

    localStorage.setItem(
        "JARVIS_MEMORY_UNLOCKED",
        "false"
    );

    updateMemoryStatus();

    return "Memory system locked.";
}


/* =========================================================
   FIND MEMORY STATUS ELEMENT
   ========================================================= */

function getMemoryStatusElement() {

    const statusBoxes =
        document.querySelectorAll(".status");

    for (const box of statusBoxes) {

        const small = box.querySelector("small");

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
   MEMORY DATABASE
   ========================================================= */

function addMemory(text, category = "general") {

    text = cleanText(text);

    if (!text) return false;

    /*
       Don't save duplicates.
    */

    const duplicate = memories.some(
        item =>
            item.text.toLowerCase() ===
            text.toLowerCase()
    );

    if (duplicate) {
        return true;
    }

    memories.push({
        id: Date.now() + "-" + Math.random(),
        text: text,
        category: category,
        created: new Date().toISOString()
    });

    saveData(MEMORY_KEY, memories);

    return true;
}


function removeMemory(search) {

    search = cleanText(search).toLowerCase();

    if (!search) return false;

    const oldLength = memories.length;

    memories = memories.filter(memory => {

        return !memory.text
            .toLowerCase()
            .includes(search);

    });

    saveData(MEMORY_KEY, memories);

    return memories.length < oldLength;
}


function clearMemories() {

    memories = [];

    saveData(
        MEMORY_KEY,
        memories
    );
}


/* =========================================================
   MEMORY SEARCH
   ========================================================= */

function searchMemory(query) {

    query = query.toLowerCase();

    return memories.filter(memory =>
        memory.text
            .toLowerCase()
            .includes(query)
    );
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
   CATEGORY
   ========================================================= */

function getCategory(text) {

    const lower = text.toLowerCase();

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
   REMEMBER COMMAND
   ========================================================= */

function rememberInformation(text) {

    if (!memoryUnlocked) {

        return (
            "Memory is currently locked. " +
            "Say \"Memory unlock\" to enable it."
        );
    }

    let memory = cleanText(text);

    /*
       Remove command words.
    */

    memory = memory
        .replace(/^remember that\s+/i, "")
        .replace(/^remember\s+/i, "")
        .replace(/^save that\s+/i, "")
        .replace(/^save\s+/i, "")
        .trim();

    if (!memory) {

        return "Tell me what you want me to remember.";
    }

    addMemory(
        memory,
        getCategory(memory)
    );

    return `Memory saved: ${memory}`;
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

        return "My memory database is empty.";
    }

    let result =
        "Here is what I remember:\n\n";

    memories.forEach((memory, index) => {

        result +=
            `${index + 1}. ${memory.text}\n`;

    });

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

    let query = cleanText(text)
        .replace(/^forget that\s+/i, "")
        .replace(/^forget\s+/i, "")
        .replace(/^delete memory\s+/i, "")
        .replace(/^remove memory\s+/i, "")
        .trim();

    if (!query) {

        return "Tell me which memory to forget.";
    }

    const removed = removeMemory(query);

    if (removed) {

        return `I've forgotten the memory matching "${query}".`;

    }

    return `I couldn't find a memory matching "${query}".`;
}


/* =========================================================
   MEMORY QUESTION ENGINE
   ========================================================= */

function answerMemoryQuestion(text) {

    const lower = text.toLowerCase();

    /*
       FAVOURITE / FAVORITE COLOUR
    */

    if (
        lower.includes("what is my favourite colour") ||
        lower.includes("what is my favorite colour") ||
        lower.includes("what's my favourite colour") ||
        lower.includes("what's my favorite colour") ||
        lower.includes("what is my favourite color") ||
        lower.includes("what is my favorite color")
    ) {

        const matches = memories.filter(memory =>
            /favou?rite\s+colou?r/i.test(memory.text)
        );

        if (matches.length > 0) {

            return extractValue(
                matches[matches.length - 1].text,
                /favou?rite\s+colou?r\s+(?:is|=)\s+(.+)/i
            );
        }

        return "I don't have your favourite colour saved yet.";
    }


    /*
       FAVOURITE FOOD
    */

    if (
        lower.includes("what is my favourite food") ||
        lower.includes("what is my favorite food")
    ) {

        const matches = memories.filter(memory =>
            /favou?rite\s+food/i.test(memory.text)
        );

        if (matches.length > 0) {

            return extractValue(
                matches[matches.length - 1].text,
                /favou?rite\s+food\s+(?:is|=)\s+(.+)/i
            );
        }

        return "I don't have your favourite food saved yet.";
    }


    /*
       NAME
    */

    if (
        lower === "what is my name" ||
        lower === "what's my name" ||
        lower.includes("do you know my name")
    ) {

        const matches = memories.filter(memory =>
            /my name is/i.test(memory.text) ||
            /call me/i.test(memory.text)
        );

        if (matches.length > 0) {

            const value =
                matches[matches.length - 1].text
                    .replace(/^my name is\s+/i, "")
                    .replace(/^call me\s+/i, "");

            return `Your name is ${value}.`;
        }

        return "You haven't told me your name yet.";
    }


    return null;
}


/* =========================================================
   EXTRACT MEMORY VALUE
   ========================================================= */

function extractValue(text, regex) {

    const match = text.match(regex);

    if (match && match[1]) {

        return `Your favourite colour is ${match[1].trim()}.`;
    }

    return text;
}


/* =========================================================
   CHAT HISTORY
   ========================================================= */

function saveChat(role, text) {

    chatHistory.push({
        role: role,
        text: text,
        time: new Date().toISOString()
    });

    /*
       Keep last 100 messages.
    */

    if (chatHistory.length > 100) {

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

    return new Date().toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   CHAT MESSAGE — MATCHES YOUR HTML
   ========================================================= */

function addMessage(type, text) {

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


    /*
       textContent prevents HTML injection.
    */

    const paragraph =
        message.querySelector("p");

    paragraph.textContent = text;

    chat.appendChild(message);

    chat.scrollTop =
        chat.scrollHeight;
}


/* =========================================================
   JARVIS RESPONSE
   ========================================================= */

function getResponse(text) {

    const command =
        cleanText(text);

    const lower =
        command.toLowerCase();


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

        return rememberInformation(command);
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
       MEMORY COUNT
       ========================================= */

    if (
        lower === "memory status" ||
        lower === "how many memories" ||
        lower === "memory count"
    ) {

        return memoryUnlocked
            ? `Memory is online. I have ${memories.length} saved memor${memories.length === 1 ? "y" : "ies"}.`
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
                "Unlock it before clearing memories."
            );
        }

        clearMemories();

        return "All JARVIS memories have been cleared.";
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

        return forgetInformation(command);
    }


    /* =========================================
       MEMORY QUESTION
       ========================================= */

    const memoryAnswer =
        answerMemoryQuestion(command);

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

            pendingQuestion = null;

            return `Understood. I'll remember that your answer is ${command}.`;
        }
    }


    /* =========================================
       FAVOURITE COLOUR QUESTION
       ========================================= */

    if (
        lower.includes("favourite colour") ||
        lower.includes("favorite colour") ||
        lower.includes("favourite color") ||
        lower.includes("favorite color")
    ) {

        pendingQuestion =
            "favourite colour";

        return answerMemoryQuestion(
            "what is my favourite colour"
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

        return "Hello. J.A.R.V.I.S. systems are online.";
    }


    /* =========================================
       WHO ARE YOU
       ========================================= */

    if (
        lower.includes("who are you") ||
        lower.includes("what are you")
    ) {

        return "I am J.A.R.V.I.S., your personal AI assistant.";
    }


    /* =========================================
       ARE YOU THERE
       ========================================= */

    if (
        lower.includes("are you there") ||
        lower.includes("jarvis are you there")
    ) {

        return "Always online and ready.";
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
            "Memory status\n" +
            "Forget...\n" +
            "Forget everything\n" +
            "Memory lock"
        );
    }


    /* =========================================
       DEFAULT
       ========================================= */

    return `I received: "${command}"`;
}


/* =========================================================
   SIMPLE ANSWER DETECTION
   ========================================================= */

function isSimpleAnswer(text) {

    const lower = text.toLowerCase();

    if (
        lower.startsWith("what ") ||
        lower.startsWith("who ") ||
        lower.startsWith("where ") ||
        lower.startsWith("why ") ||
        lower.startsWith("how ")
    ) {
        return false;
    }

    return text.length < 80;
}


/* =========================================================
   SAVE CONTEXTUAL ANSWER
   ========================================================= */
