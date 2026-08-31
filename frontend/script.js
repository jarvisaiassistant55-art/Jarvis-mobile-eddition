"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const input = document.getElementById("msg");
    const send = document.getElementById("send");
    const chat = document.getElementById("chat");

    function time() {
        return new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function addMessage(type, text) {

        const message = document.createElement("div");
        message.className =
            type === "user"
                ? "message user"
                : "message jarvis";

        const bubble = document.createElement("div");
        bubble.className = "bubble";

        const label = document.createElement("label");
        label.textContent =
            type === "user" ? "YOU" : "J.A.R.V.I.S.";

        const p = document.createElement("p");
        p.textContent = text;

        const t = document.createElement("time");
        t.textContent = time();

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


    function reply(text) {

        const q = text.toLowerCase().trim();

        if (
            q === "hello" ||
            q === "hi" ||
            q === "hey" ||
            q.includes("hello jarvis")
        ) {
            return "Hello, Sir. J.A.R.V.I.S. is online.";
        }

        if (
            q.includes("time")
        ) {
            return "The current time is " +
                new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                }) + ".";
        }

        if (
            q.includes("date")
        ) {
            return "Today is " +
                new Date().toLocaleDateString([], {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }) + ".";
        }

        if (
            q.includes("who are you")
        ) {
            return "I am J.A.R.V.I.S., your personal AI assistant.";
        }

        if (
            q === "status" ||
            q.includes("system status")
        ) {
            return "All primary systems are online.";
        }

        if (
            q === "help" ||
            q.includes("what can you do")
        ) {
            return "I can handle chat, time, date, system status and voice commands.";
        }

        return 'I received: "' + text + '"';
    }


    function sendMessage() {

        if (!input || !chat) return;

        const text = input.value.trim();

        if (!text) return;

        addMessage("user", text);

        input.value = "";

        setTimeout(() => {

            const answer = reply(text);

            addMessage("jarvis", answer);

            if (
                window.speechSynthesis &&
                typeof SpeechSynthesisUtterance !== "undefined"
            ) {
                try {
                    const speech =
                        new SpeechSynthesisUtterance(answer);

                    speech.lang = "en-IN";
                    speech.rate = 0.95;

                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(speech);

                } catch (e) {
                    console.log("Voice unavailable:", e);
                }
            }

        }, 300);
    }


    if (send) {
        send.addEventListener("click", (e) => {
            e.preventDefault();
            sendMessage();
        });
    }


    if (input) {
        input.addEventListener("keydown", (e) => {

            if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
            }

        });
    }


    console.log("J.A.R.V.I.S. READY");
});
