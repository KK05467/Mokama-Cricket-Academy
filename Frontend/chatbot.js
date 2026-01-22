const BACKEND_URL = "http://localhost:3000/chat";

const chatBody = document.getElementById("chatBody");
const userInput = document.getElementById("userInput");

window.onload = () => {
  addMessage(
    "Hello! I am the Mokama Cricket Academy assistant. Ask me cricket-related questions only.",
    "bot"
  );
};

function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";

  fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  })
    .then(res => res.json())
    .then(data => {
      addMessage(data.reply, "bot");
    })
    .catch(() => {
      addMessage(
        "Server not reachable. Please try again later.",
        "bot"
      );
    });
}

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = sender;
  div.textContent = text;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}
