/* =========================================================
   J.A.R.V.I.S. MOBILE EDITION
   COMPLETE SCRIPT.JS — MEMORY SYSTEM
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

/* =========================================================
   STORAGE KEYS
   ========================================================= */

const STORAGE = {
    memories: "jarvis_memories_v1",
    chat: "jarvis_chat_history_v1",
    settings: "jarvis_settings_v1"
};

/* =========================================================
   JARVIS STATE
   ========================================================= */

let memories = loadJSON(STORAGE.memories, []);
let chatHistory = loadJSON(STORAGE.chat, []);

let isListening = false;
let recognition = null;

/* =========================================================
   STORAGE FUNCTIONS
   ========================================================= */

function loadJSON(key, fallback) {
    try {
        const data = localStorage.getItem(key);

        if (!data) return fallback;

        const parsed = JSON.parse(data);

        return parsed ?? fallback;
    } catch (error) {
        console.warn("JARVIS storage error:", error);
        return fallback;
    }
}

function saveJSON(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.warn("JARVIS could not save:", error);
    }
}

/* =========================================================
   MEMORY SYSTEM
   ========================================================= */

function normalizeText(text) {
    return String(text || "")
        .trim()
        .replace(/\s+/g, " ");
}

function createMemory(text, category = "general") {

    text = normalizeText(text);

    if (!text) return null;

    const duplicate = memories.find(
        memory =>
            memory.text.toLowerCase() === text.toLowerCase()
    );

    if (duplicate) {
        return duplicate;
    }

    const memory = {
        id: Date.now().toString(),
        text: text,
        category: category,
        createdAt: new Date().toISOString()
    };

    memories.push(memory);

    saveJSON(STORAGE.memories, memories);

    return memory;
}

function remember(text, category = "general") {

    const memory = createMemory(text, category);

    if (!memory) {
        return "I couldn't find anything to remember.";
    }

    return `I'll remember that: ${memory.text}`;
}

function getMemories() {
    return memories;
}

function recallMemories() {

    if (!memories.length) {
        return "I don't have any saved memories yet.";
    }

    let response = "Here is what I remember:\n\n";

    memories.forEach((memory, index) => {
        response += `${index + 1}. ${memory.text}\n`;
    });

    return response;
}

function forgetMemory(query) {

    query = normalizeText(query).toLowerCase();

    if (!query) {
        return "Tell me which memory you want me to forget.";
    }

    const before = memories.length;

    memories = memories.filter(memory =>
        !memory.text.toLowerCase().includes(query)
    );

    const removed = before - memories.length;

    saveJSON(STORAGE.memories, memories);

    if (removed === 0) {
        return `I couldn't find a memory matching "${query}".`;
    }

    return `I've forgotten ${removed} memory${removed > 1 ? "ies" : ""} matching "${query}".`;
}

function clearAllMemories() {

    memories = [];

    saveJSON(STORAGE.memories, memories);

    return "All saved JARVIS memories have been cleared.";
}

/* =========================================================
   MEMORY DETECTION
   ========================================================= */

function detectMemoryCommand(text) {

    const lower = text.toLowerCase().trim();

    /* ---------- REMEMBER ---------- */

    const rememberPatterns = [
        /^remember that (.+)$/i,
        /^remember (.+)$/i,
        /^save that (.+)$/i,
        /^save (.+)$/i,
        /^memorize (.+)$/i,
        /^keep in memory (.+)$/i
    ];

    for (const pattern of rememberPatterns) {

        const match = lower.match(pattern);

        if (match) {

            let memoryText = text
                .replace(pattern, "$1")
                .trim();

            return {
                type: "remember",
                value: memoryText
            };
        }
    }

    /* ---------- RECALL ---------- */

    if (
        lower === "what do you remember" ||
        lower === "what can you remember" ||
        lower === "show my memories" ||
        lower === "show memories" ||
        lower === "my memories" ||
        lower === "recall my memories"
    ) {
        return {
            type: "recall"
        };
    }

    /* ---------- FORGET ALL ---------- */

    if (
        lower === "forget everything" ||
        lower === "forget all memories" ||
        lower === "clear my memory" ||
        lower === "clear all memories" ||
        lower === "delete all memories"
    ) {
        return {
            type: "forgetAll"
        };
    }

    /* ---------- FORGET ONE ---------- */

    const forgetPatterns = [
        /^forget that (.+)$/i,
        /^forget (.+)$/i,
        /^delete memory (.+)$/i,
        /^remove memory (.+)$/i
    ];

    for (const pattern of forgetPatterns) {

        const match = lower.match(pattern);

        if (match) {

            const value = text
                .replace(pattern, "$1")
                .trim();

            return {
                type: "forget",
                value: value
            };
        }
    }

    return null;
}

/* =========================================================
   SMART MEMORY CATEGORIES
   ========================================================= */

function detectCategory(text) {

    const lower = text.toLowerCase();

    if (
        lower.includes("my name") ||
        lower.includes("call me") ||
        lower.includes("nickname")
    ) {
        return "identity";
    }

    if (
        lower.includes("favorite") ||
        lower.includes("favourite") ||
        lower.includes("i like") ||
        lower.includes("i love")
    ) {
        return "preference";
    }

    if (
        lower.includes("project") ||
        lower.includes("jarvis") ||
        lower.includes("friday")
    ) {
        return "project";
    }

    if (
        lower.includes("prefer") ||
        lower.includes("always") ||
        lower.includes("usually")
    ) {
        return "preference";
    }

    return "general";
}

/* =========================================================
   AUTOMATIC MEMORY DETECTION
   ========================================================= */

function detectAutomaticMemory(text) {

    const lower = text.toLowerCase();

    /*
       Only save information when the user clearly
       presents it as something that should be remembered.
    */

    const patterns = [
        /^my name is (.+)$/i,
        /^call me (.+)$/i,
        /^i prefer (.+)$/i,
        /^my favorite (.+) is (.+)$/i,
        /^my favourite (.+) is (.+)$/i
    ];

    for (const pattern of patterns) {

        if (pattern.test(text)) {

            return {
                text: normalizeText(text),
                category: detectCategory(text)
            };
        }
    }

    return null;
}

/* =========================================================
   CHAT HISTORY
   ========================================================= */

function saveChatMessage(role, text) {

    chatHistory.push({
        role: role,
        text: text,
        timestamp: new Date().toISOString()
    });

    /*
       Keep storage lightweight.
    */

    if (chatHistory.length > 100) {
        chatHistory = chatHistory.slice(-100);
    }

    saveJSON(STORAGE.chat, chatHistory);
}

function clearChatHistory() {

    chatHistory = [];

    saveJSON(STORAGE.chat, chatHistory);

    if (chat) {
        chat.innerHTML = "";
    }

    addMessage(
        "system",
        "Conversation history cleared."
    );
}

/* =========================================================
   MESSAGE UI
   ========================================================= */

function addMessage(type, text) {

    if (!chat) return;

    const message = document.createElement("div");

    message.className =
        type === "user"
            ? "message user-message"
            : "message jarvis-message";

    /*
       Preserve line breaks safely.
    */

    message.textContent = text;

    chat.appendChild(message);

    chat.scrollTop = chat.scrollHeight;
}

/* =========================================================
   LOAD CHAT
   ========================================================= */

function loadChatHistory() {

    if (!chat) return;

    chat.innerHTML = "";

    if (!chatHistory.length) {

        addMessage(
            "jarvis",
            "JARVIS online. Memory system initialized."
        );

        return;
    }

    /*
       Only restore recent messages.
    */

    chatHistory
        .slice(-50)
        .forEach(message => {

            addMessage(
                message.role === "user"
                    ? "user"
                    : "jarvis",
                message.text
            );
        });
}

/* =========================================================
   JARVIS RESPONSE ENGINE
   ========================================================= */

function processCommand(text) {

    text = normalizeText(text);

    if (!text) {
        return "Please give me a command.";
    }

    /* MEMORY COMMAND */

    const memoryCommand = detectMemoryCommand(text);

    if (memoryCommand) {

        switch (memoryCommand.type) {

            case "remember":

                return remember(
                    memoryCommand.value,
                    detectCategory(memoryCommand.value)
                );

            case "recall":

                return recallMemories();

            case "forget":

                return forgetMemory(
                    memoryCommand.value
                );

            case "forgetAll":

                return clearAllMemories();
        }
    }

    /* AUTOMATIC MEMORY */

    const automaticMemory =
        detectAutomaticMemory(text);

    if (automaticMemory) {

        createMemory(
            automaticMemory.text,
            automaticMemory.category
        );
    }

    /* BASIC COMMANDS */

    const lower = text.toLowerCase();

    if (
        lower === "hello" ||
        lower === "hi" ||
        lower === "hey"
    ) {
        return "Hello. JARVIS systems are online.";
    }

    if (
        lower.includes("who are you") ||
        lower.includes("what are you")
    ) {
        return "I am JARVIS, your personal AI assistant.";
    }

    if (
        lower.includes("memory status") ||
        lower.includes("how many memories")
    ) {

        return `I currently have ${memories.length} saved memor${memories.length === 1 ? "y" : "ies"}.`;
    }

    if (
        lower === "clear chat" ||
        lower === "clear conversation"
    ) {
        clearChatHistory();
        return null;
    }

    if (
        lower === "help" ||
        lower === "jarvis help"
    ) {

        return (
            "Available commands:\n\n" +
            "• Remember that...\n" +
            "• What do you remember?\n" +
            "• Forget...\n" +
            "• Forget everything\n" +
            "• Memory status\n" +
            "• Clear chat"
        );
    }

    /* DEFAULT */

    return generateBasicResponse(text);
}

/* =========================================================
   BASIC RESPONSE
   ========================================================= */

function generateBasicResponse(text) {

    const lower = text.toLowerCase();

    if (lower.includes("thank")) {
        return "You're welcome.";
    }

    if (lower.includes("good morning")) {
        return "Good morning. JARVIS is ready.";
    }

    if (lower.includes("good night")) {
        return "Good night. I'll be here when you return.";
    }

    if (lower.includes("are you there")) {
        return "Always ready.";
    }

    /*
       This is the local fallback.
       You can replace this section later with
       Gemini/OpenAI/API integration.
    */

    return `I received: "${text}"`;
}

/* =========================================================
   SEND MESSAGE
   ========================================================= */

function sendMessage() {

    if (!input) return;

    const text = normalizeText(input.value);

    if (!text) return;

    addMessage("user", text);

    saveChatMessage("user", text);

    input.value = "";

    const response = processCommand(text);

    if (response === null) return;

    setTimeout(() => {

        addMessage("jarvis", response);

        saveChatMessage(
            "jarvis",
            response
        );

        speak(response);

    }, 250);
}

/* =========================================================
   ENTER KEY
   ========================================================= */

if (input) {

    input.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();
            }
        }
    );
}

/* =========================================================
   SEND BUTTON
   ========================================================= */

if (send) {

    send.addEventListener(
        "click",
        sendMessage
    );
}

/* =========================================================
   TEXT TO SPEECH
   ========================================================= */

function speak(text) {

    if (!("speechSynthesis" in window)) {
        return;
    }

    /*
       Don't read extremely long memory lists.
    */

    if (text.length > 600) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(
        utterance
    );
}

/* =========================================================
   VOICE INPUT
   ========================================================= */

function initializeVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        if (voiceStatus) {
            voiceStatus.textContent =
                "Voice input unavailable";
        }

        return;
    }

    recognition =
        new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.lang = "en-IN";

    recognition.onstart = () => {

        isListening = true;

        if (voiceStatus) {
            voiceStatus.textContent =
                "Listening...";
        }

        if (voiceButton) {
            voiceButton.classList.add(
                "active"
            );
        }

        if (voiceHead) {
            voiceHead.classList.add(
                "listening"
            );
        }
    };

    recognition.onresult = event => {

        const transcript =
            event.results[0][0].transcript;

        if (input) {
            input.value = transcript;
        }

        sendMessage();
    };

    recognition.onerror = event => {

        console.warn(
            "Voice error:",
            event.error
        );

        if (voiceStatus) {
            voiceStatus.textContent =
                "Voice error";
        }
    };

    recognition.onend = () => {

        isListening = false;

        if (voiceStatus) {
            voiceStatus.textContent =
                "Voice ready";
        }

        if (voiceButton) {
            voiceButton.classList.remove(
                "active"
            );
        }

        if (voiceHead) {
            voiceHead.classList.remove(
                "listening"
            );
        }
    };
}

if (voiceButton) {

    voiceButton.addEventListener(
        "click",
        () => {

            if (!recognition) {
                initializeVoice();
            }

            if (!recognition) return;

            if (isListening) {

                recognition.stop();

            } else {

                try {
                    recognition.start();
                } catch (error) {
                    console.warn(
                        "Voice start error:",
                        error
                    );
                }
            }
        }
    );
}

/* =========================================================
   MEMORY API
   ========================================================= */

/*
   These functions are exposed globally so
   other parts of your JARVIS UI can use them.

   Example:
       window.JARVIS.memory.remember("...");
*/

window.JARVIS = {

    memory: {

        remember: remember,

        recall: recallMemories,

        forget: forgetMemory,

        clear: clearAllMemories,

        count: () => memories.length,

        getAll: getMemories
    },

    chat: {

        clear: clearChatHistory,

        history: () => chatHistory
    },

    voice: {

        start: () => {

            if (!recognition) {
                initializeVoice();
            }

            if (recognition) {
                recognition.start();
            }
        },

        stop: () => {

            if (recognition) {
                recognition.stop();
            }
        }
    }
};

/* =========================================================
   START JARVIS
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadChatHistory();

        initializeVoice();

        console.log(
            "JARVIS online."
        );

        console.log(
            `Memory database: ${memories.length} entries`
        );
    }
);
