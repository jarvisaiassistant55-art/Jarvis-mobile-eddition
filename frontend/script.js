/* =========================================================
   J.A.R.V.I.S. MOBILE EDITION
   ADVANCED FUNCTION SCRIPT
   MEMORY + VOICE + CHAT + SYSTEM + TIME + DATE
   ========================================================= */

"use strict";

/* =========================================================
   ELEMENTS
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

let memoryUnlocked = true;

localStorage.setItem(
    UNLOCK_KEY,
    "true"
);

let voiceEnabled = true;
let listening = false;
let processing = false;
let recognition = null;

let pendingQuestion = null;


/* =========================================================
   STORAGE
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
            "Storage error:",
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
            "Save error:",
            error
        );
    }
}


/* =========================================================
   TEXT
========================================================= */

function cleanText(text) {

    return String(text || "")
        .replace(/\s+/g, " ")
        .trim();
}


/* =========================================================
   MEMORY STATUS
========================================================= */

function getMemoryStatusElement() {

    const boxes =
        document.querySelectorAll(".status");

    for (const box of boxes) {

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
   MEMORY
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
        "I am ready to remember."
    );
}


function lockMemory() {

    memoryUnlocked = false;

    localStorage.setItem(
        UNLOCK_KEY,
        "false"
    );

    updateMemoryStatus();

    return "Memory system locked.";
}


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
        lower.includes("favourite") ||
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


function addMemory(
    text,
    category = "general"
) {

    text =
        cleanText(text);

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

        text,

        category,

        created:
            new Date().toISOString()
    });

    saveData(
        MEMORY_KEY,
        memories
    );

    return true;
}


function removeMemory(query) {

    query =
        cleanText(query).toLowerCase();

    const oldLength =
        memories.length;

    memories =
        memories.filter(
            item =>
                !item.text
                    .toLowerCase()
                    .includes(query)
        );

    saveData(
        MEMORY_KEY,
        memories
    );

    return (
        oldLength !== memories.length
    );
}


function searchMemory(query) {

    query =
        cleanText(query).toLowerCase();

    return memories.filter(
        item =>
            item.text
                .toLowerCase()
                .includes(query)
    );
}


function clearMemories() {

    memories = [];

    saveData(
        MEMORY_KEY,
        memories
    );
}


/* =========================================================
   REMEMBER
========================================================= */

function rememberInformation(text) {

    if (!memoryUnlocked) {

        return (
            "Memory is locked."
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
            "Tell me what you want me to remember."
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
   RECALL
========================================================= */

function recallMemory() {

    if (!memoryUnlocked) {

        return "Memory is locked.";
    }

    if (!memories.length) {

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
   MEMORY SEARCH COMMAND
========================================================= */

function memorySearchCommand(text) {

    const query =
        text
            .replace(
                /^search my memories for\s+/i,
                ""
            )
            .replace(
                /^search memories for\s+/i,
                ""
            )
            .trim();

    if (!query) {

        return (
            "Tell me what you want me to search for."
        );
    }

    const results =
        searchMemory(query);

    if (!results.length) {

        return (
            `I couldn't find any memory matching "${query}".`
        );
    }

    let response =
        `Memory search results for "${query}":\n\n`;

    results.forEach(
        (item, index) => {

            response +=
                `${index + 1}. ${item.text}\n`;
        }
    );

    return response;
}


/* =========================================================
   FORGET
========================================================= */

function forgetInformation(text) {

    if (!memoryUnlocked) {

        return "Memory is locked.";
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
            "Tell me which memory to forget."
        );
    }

    if (
        removeMemory(query)
    ) {

        return (
            `I've forgotten the memory matching "${query}".`
        );
    }

    return (
        `I couldn't find a memory matching "${query}".`
    );
}


/* =========================================================
   TIME
========================================================= */

function getCurrentTime() {

    return new Date()
        .toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );
}


/* =========================================================
   DATE
========================================================= */

function getCurrentDate() {

    return new Date()
        .toLocaleDateString(
            [],
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
}


/* =========================================================
   BATTERY
========================================================= */

async function getBatteryStatus() {

    if (
        !navigator.getBattery
    ) {

        return (
            "Battery information is not available on this device."
        );
    }

    try {

        const battery =
            await navigator.getBattery();

        const percentage =
            Math.round(
                battery.level * 100
            );

        const charging =
            battery.charging
                ? "charging"
                : "not charging";

        return (
            `Battery level is ${percentage} percent and ${charging}.`
        );

    } catch (error) {

        return (
            "I couldn't access the battery information."
        );
    }
}


/* =========================================================
   NETWORK
========================================================= */

function getNetworkStatus() {

    if (
        navigator.onLine
    ) {

        return (
            "Network connection is online."
        );
    }

    return (
        "Network connection is offline."
    );
}


/* =========================================================
   SYSTEM STATUS
========================================================= */

async function getSystemStatus() {

    const battery =
        await getBatteryStatus();

    const network =
        getNetworkStatus();

    return (
        "J.A.R.V.I.S. SYSTEM STATUS\n\n" +
        "Memory: ONLINE\n" +
        `Memories: ${memories.length}\n` +
        "Voice: " +
        (
            recognition
                ? "AVAILABLE"
                : "UNAVAILABLE"
        ) +
        "\n" +
        `Network: ${network.includes("online") ? "ONLINE" : "OFFLINE"}\n` +
        battery
    );
}


/* =========================================================
   CHAT HISTORY
========================================================= */

function saveChat(
    role,
    text
) {

    chatHistory.push({

        role,

        text,

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


function clearChat() {

    chatHistory = [];

    saveData(
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


/* =========================================================
   CHAT UI
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
   THINKING STATUS
========================================================= */

function setProcessing(state) {

    processing = state;

    if (!voiceStatus) return;

    if (state) {

        voiceStatus.textContent =
            "PROCESSING...";

    } else if (!listening) {

        voiceStatus.textContent =
            "READY";
    }
}


/* =========================================================
   MEMORY QUESTIONS
========================================================= */

function answerMemoryQuestion(text) {

    if (!memoryUnlocked) {

        return null;
    }

    const lower =
        text.toLowerCase();


    /* NAME */

    if (
        lower === "what is my name" ||
        lower === "what's my name" ||
        lower.includes("do you know my name")
    ) {

        const matches =
            memories.filter(
                item =>
                    /my name is/i
                        .test(item.text) ||
                    /call me/i
                        .test(item.text)
            );

        if (!matches.length) {

            return (
                "You haven't told me your name yet."
            );
        }

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


    /* FAVOURITE COLOUR */

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
        ) ||
        lower.includes(
            "what's my favourite colour"
        ) ||
        lower.includes(
            "what's my favorite colour"
        )
    ) {

        const matches =
            memories.filter(
                item =>
                    /favou?rite\s+colou?r/i
                        .test(item.text)
            );

        if (!matches.length) {

            return (
                "I don't have your favourite colour saved yet."
            );
        }

        const latest =
            matches[
                matches.length - 1
            ].text;

        const match =
            latest.match(
                /favou?rite\s+colou?r\s+(?:is|=)\s+(.+)/i
            );

        return match
            ? `Your favourite colour is ${match[1].trim()}.`
            : latest;
    }


    /* FAVOURITE FOOD */

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

        const matches =
            memories.filter(
                item =>
                    /favou?rite\s+food/i
                        .test(item.text)
            );

        if (!matches.length) {

            return (
                "I don't have your favourite food saved yet."
            );
        }

        const latest =
            matches[
                matches.length - 1
            ].text;

        const match =
            latest.match(
                /favou?rite\s+food\s+(?:is|=)\s+(.+)/i
            );

        return match
            ? `Your favourite food is ${match[1].trim()}.`
            : latest;
    }

    return null;
}


/* =========================================================
   MAIN RESPONSE ENGINE
========================================================= */

async function getResponse(text) {

    const command =
        cleanText(text);

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

        return unlockMemory();
    }


    /* MEMORY LOCK */

    if (
        lower === "memory lock" ||
        lower === "lock memory"
    ) {

        return lockMemory();
    }


    /* REMEMBER */

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


    /* RECALL */

    if (
        lower === "what do you remember" ||
        lower === "show my memories" ||
        lower === "show memories" ||
        lower === "recall my memories" ||
        lower === "my memories"
    ) {

        return recallMemory();
    }


    /* MEMORY SEARCH */

    if (
        lower.startsWith(
            "search my memories for "
        ) ||
        lower.startsWith(
            "search memories for "
        )
    ) {

        return memorySearchCommand(
            command
        );
    }


    /* MEMORY STATUS */

    if (
        lower === "memory status" ||
        lower === "memory count" ||
        lower === "how many memories"
    ) {

        return (
            `Memory is online. ` +
            `I have ${memories.length} saved memor${
                memories.length === 1
                    ? "y"
                    : "ies"
            }.`
        );
    }


    /* FORGET ALL */

    if (
        lower === "forget everything" ||
        lower === "forget all memories" ||
        lower === "clear memory" ||
        lower 
