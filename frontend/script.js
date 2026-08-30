const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const send = document.getElementById("send");

const voiceInput = document.getElementById("voiceInput");
const voiceButton = document.getElementById("voiceButton");
const voiceStatus = document.getElementById("voiceStatus");

let voiceEnabled = true;


// =========================
// JARVIS MEMORY SYSTEM
// =========================

const MEMORY_KEY = "JARVIS_MEMORY_V1";

function getMemories() {
    try {
        return JSON.parse(
            localStorage.getItem(MEMORY_KEY)
        ) || [];
    } catch (error) {
        console.log("Memory read error:", error);
        return [];
    }
}

function saveMemories(memories) {
    localStorage.setItem(
        MEMORY_KEY,
        JSON.stringify(memories)
    );
}

function remember(text) {

    const memories = getMemories();

    const cleanText = text
        .trim()
        .replace(/[.!?]+$/, "");

    if (!cleanText) {
        return "I need some information to remember.";
    }

    // Prevent exact duplicates
    const exists = memories.some(
        memory =>
            memory.text.toLowerCase() ===
            cleanText.toLowerCase()
    );

    if (exists) {
        return "I already have that information in my memory.";
    }

    memories.push({
        id: Date.now(),
        text: cleanText,
        created: new Date().toISOString()
    });

    saveMemories(memories);

    return "Understood. I have saved that to my memory.";
}


function forgetMemory(text) {

    const memories = getMemories();

    const query = text
        .trim()
        .toLowerCase();

    if (!query) {
        return "Please tell me what you want me to forget.";
    }

    const remaining = memories.filter(
        memory =>
            !memory.text
                .toLowerCase()
                .includes(query)
    );

    if (remaining.length === memories.length) {
        return "I couldn't find that information in my memory.";
    }

    saveMemories(remaining);

    return "Understood. I have forgotten that information.";
}


function clearMemories() {

    const memories = getMemories();

    if (memories.length === 0) {
        return "My memory is already empty.";
    }

    localStorage.removeItem(MEMORY_KEY);

    return "All saved memories have been cleared.";
}


function memoryList() {

    const memories = getMemories();

    if (memories.length === 0) {
        return "My memory is currently empty.";
    }

    let response =
        "Here is what I currently remember:\n";

    memories.forEach(
        (memory, index) => {

            response +=
                (index + 1) +
                ". " +
                memory.text +
                "\n";
        }
    );

    return response.trim();
}


// =========================
// MEMORY COMMAND DETECTION
// =========================

function handleMemoryCommand(command) {

    // REMEMBER
    if (
        command.startsWith("remember ") ||
        command.startsWith("remember that ")
    ) {

        let memoryText = command
            .replace(/^remember that\s+/i, "")
            .replace(/^remember\s+/i, "");

        return remember(memoryText);
    }


    // WHAT DO YOU REMEMBER?
    if (
        command.includes("what do you remember") ||
        command.includes("show my memories") ||
        command.includes("show memories") ||
        command.includes("list my memories") ||
        command.includes("what is in your memory")
    ) {

        return memoryList();
    }


    // FORGET EVERYTHING
    if (
        command.includes("forget everything") ||
        command.includes("forget all memories") ||
        command.includes("clear all memories") ||
        command.includes("clear memory")
    ) {

        return clearMemories();
    }


    // FORGET SPECIFIC MEMORY
    if (command.startsWith("forget ")) {

        const memoryText =
            command.replace(
                /^forget\s+/i,
                ""
            );

        return forgetMemory(memoryText);
    }


    return null;
}


// =========================
// ADD MESSAGE
// =========================

function addMessage(text, type) {

    const message =
        document.createElement("p");

    message.className = type;
    message.textContent = text;

    chat.appendChild(message);

    chat.scrollTop =
        chat.scrollHeight;
}


// =========================
// JARVIS REPLY
// =========================

function jarvisReply(text) {

    const command =
        text.toLowerCase().trim();


    // =========================
    // MEMORY COMMANDS
    // =========================

    const memoryResponse =
        handleMemoryCommand(text);

    if (memoryResponse !== null) {
        return memoryResponse;
    }


    // =========================
    // GREETINGS
    // =========================

    if (
        command.includes("hello") ||
        command.includes("hi") ||
        command.includes("hey")
    ) {

        return "Hello! I am J.A.R.V.I.S. How may I assist you?";
    }


    // =========================
    // HOW ARE YOU
    // =========================

    if (
        command.includes("how are you")
    ) {

        return "All systems are operating normally.";
    }


    // =========================
    // WHO ARE YOU
    // =========================

    if (
        command.includes("who are you") ||
        command.includes("what are you")
    ) {

        return "I am J.A.R.V.I.S., your personal AI assistant.";
    }


    // =========================
    // STATUS
    // =========================

    if (
        command.includes("status")
    ) {

        return "All primary systems are operational.";
    }


    // =========================
    // TIME
    // =========================

    if (
        command.includes("time")
    ) {

        return "The current time is " +
            new Date().toLocaleTimeString();
    }


    // =========================
    // DATE
    // =========================

    if (
        command.includes("date")
    ) {

        return "Today's date is " +
            new Date().toLocaleDateString();
    }


    // =========================
    // THANK YOU
    // =========================

    if (
        command.includes("thank")
    ) {

        return "You're welcome. Always at your service.";
    }


    // =========================
    // BYE
    // =========================

    if (
        command.includes("bye")
    ) {

        return "Goodbye. J.A.R.V.I.S. standing by.";
    }


    // =========================
    // DEFAULT
    // =========================

    return "I received your command: " +
        text;
}


// =========================
// SPEAK
// =========================

function speak(text) {

    if (!voiceEnabled) return;

    if (!("speechSynthesis" in window))
        return;

    speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;

    speechSynthesis.speak(speech);
}


// =========================
// SEND MESSAGE
// =========================

function sendMessage() {

    const text =
        input.value.trim();

    if (!text) return;


    // USER MESSAGE

    addMessage(
        "YOU: " + text,
        "user"
    );

    input.value = "";


    // PROCESSING MESSAGE

    const processing =
        document.createElement("p");

    processing.className = "ai";

    processing.textContent =
        "J.A.R.V.I.S: Processing...";

    chat.appendChild(processing);


    // JARVIS PROCESSING

    setTimeout(function() {

        const reply =
            jarvisReply(text);

        processing.textContent =
            "J.A.R.V.I.S: " + reply;

        chat.scrollTop =
            chat.scrollHeight;

        speak(reply);

    }, 300);
}


// =========================
// SEND BUTTON
// =========================

if (send) {

    send.addEventListener(
        "click",
        sendMessage
    );
}


// =========================
// ENTER KEY
// =========================

if (input) {

    input.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();
            }
        }
    );
}


// =========================
// VOICE ON / OFF
// =========================

if (voiceButton) {

    voiceButton.addEventListener(
        "click",
        function() {

            voiceEnabled =
                !voiceEnabled;


            if (voiceEnabled) {

                voiceButton.textContent =
                    "🔊 VOICE ON";

                if (voiceStatus) {

                    voiceStatus.textContent =
                        "READY";
                }

                speak(
                    "Voice system enabled."
                );

            } else {

                speechSynthesis.cancel();

                voiceButton.textContent =
                    "🔇 VOICE OFF";

                if (voiceStatus) {

                    voiceStatus.textContent =
                        "OFF";
                }
            }
        }
    );
}


// =========================
// MICROPHONE
// =========================

if (voiceInput) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    // SPEECH RECOGNITION NOT AVAILABLE

    if (!SpeechRecognition) {

        voiceInput.addEventListener(
            "click",
            function() {

                addMessage(
                    "J.A.R.V.I.S: Speech recognition is not supported. Please use Google Chrome.",
                    "ai"
                );
            }
        );

    } else {

        const recognition =
            new SpeechRecognition();

        recognition.lang =
            "en-IN";

        recognition.continuous =
            false;

        recognition.interimResults =
            false;

        recognition.maxAlternatives =
            1;


        // =========================
        // MIC BUTTON
        // =========================

        voiceInput.addEventListener(
            "click",
            function() {

                try {

                    if (voiceStatus) {

                        voiceStatus.textContent =
                            "LISTENING";
                    }

                    voiceInput.textContent =
                        "🎤";

                    voiceInput.classList.add(
                        "listening"
                    );

                    recognition.start();

                } catch (error) {

                    console.log(
                        "Mic start:",
                        error
                    );
                }
            }
        );


        // =========================
        // SPEECH RESULT
        // =========================

        recognition.onresult =
            function(event) {

                const spokenText =
                    event.results[0][0]
                        .transcript;

                input.value =
                    spokenText;

                if (voiceStatus) {

                    voiceStatus.textContent =
                        "READY";
                }

                voiceInput.classList.remove(
                    "listening"
                );

                sendMessage();
            };


        // =========================
        // MIC ERROR
        // =========================

        recognition.onerror =
            function(event) {

                console.log(
                    "Microphone error:",
                    event.error
                );

                if (voiceStatus) {

                    voiceStatus.textContent =
                        "READY";
                }

                voiceInput.classList.remove(
                    "listening"
                );


                if (
                    event.error ===
                    "not-allowed"
                ) {

                    addMessage(
                        "J.A.R.V.I.S: Microphone permission denied. Allow microphone access in Chrome.",
                        "ai"
                    );

                } else if (
                    event.error ===
                    "no-speech"
                ) {

                    addMessage(
                        "J.A.R.V.I.S: I didn't hear anything. Please try again.",
                        "ai"
                    );

                } else {

                    addMessage(
                        "J.A.R.V.I.S: Microphone error: " +
                        event.error,
                        "ai"
                    );
                }
            };


        // =========================
        // MIC FINISHED
        // =========================

        recognition.onend =
            function() {

                if (voiceStatus) {

                    voiceStatus.textContent =
                        "READY";
                }

                voiceInput.classList.remove(
                    "listening"
                );
            };
    }
}


// =========================
// STARTUP
// =========================

console.log(
    "J.A.R.V.I.S JavaScript loaded successfully."
);

console.log(
    "J.A.R.V.I.S Memory System initialized."
);
