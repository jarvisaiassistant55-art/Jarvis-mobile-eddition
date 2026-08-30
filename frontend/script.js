document.addEventListener("DOMContentLoaded", () => {

    const chat = document.getElementById("chat");
    const input = document.getElementById("msg");
    const send = document.getElementById("send");

    function addMessage(text, type) {
        const message = document.createElement("div");
        message.className = "message " + type;
        message.textContent = text;

        chat.appendChild(message);

        // Scroll to newest message
        chat.scrollTop = chat.scrollHeight;
    }

    function jarvisReply(text) {

        const msg = text.toLowerCase();

        if (msg.includes("hello") || msg.includes("hi")) {
            return "Hello. I am J.A.R.V.I.S. Systems are fully operational.";
        }

        if (msg.includes("who are you")) {
            return "I am J.A.R.V.I.S., your personal mobile AI assistant.";
        }

        if (msg.includes("how are you")) {
            return "All systems are online and operating normally.";
        }

        if (msg.includes("time")) {
            return "Current device time is " +
                   new Date().toLocaleTimeString();
        }

        if (msg.includes("status")) {
            return "System status: AI Core ONLINE. Network ONLINE. Voice LOCKED. Memory LOCKED.";
        }

        if (msg.includes("thank")) {
            return "You're welcome. Always at your service.";
        }

        return "Command received. I am processing your request.";
    }

    function sendMessage() {

        const text = input.value.trim();

        if (text === "") {
            return;
        }

        // User message
        addMessage("YOU: " + text, "user");

        // Clear input
        input.value = "";

        // JARVIS processing
        setTimeout(() => {

            const reply = jarvisReply(text);

            addMessage("J.A.R.V.I.S: " + reply, "ai");

        }, 500);
    }

    // SEND button
    send.addEventListener("click", sendMessage);

    // ENTER key
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });

});
