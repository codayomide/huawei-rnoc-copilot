const sendBtn = document.getElementById("send-btn");
const messageInput = document.getElementById("message-input");
const chatBody = document.getElementById("chat-body");

const maxHeight = parseInt(
  window.getComputedStyle(messageInput).getPropertyValue("max-height")
);

messageInput.addEventListener("input", () => {
  messageInput.style.height = "auto"; // Reset height to shrink if needed

  const scrollHeight = messageInput.scrollHeight;

  if (scrollHeight <= maxHeight) {
    messageInput.style.overflowY = "hidden";
    messageInput.style.height = `${scrollHeight}px`;
  } else {
    messageInput.style.overflowY = "auto";
    messageInput.style.height = `${maxHeight}px`; // Lock at max height
  }
});

const addMessage = (text, type) => {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  // let content = `<div class="message-content">${text}</div>`;

  let content = "";

  if (type == "user") {
    content = `<div class="message-wrapper">
              <div class="message-content-wrapper">
                <div class="message-content">
                  ${text}
                  <span class="timestamp">10:32</span>
                </div>

                <button class="util-button copy-button">
                  <img src="./resources/icons/copy-item-icon.png" alt="" />
                </button>
              </div>
              <img
                src="./resources/images/user-avatar.png"
                alt="User Avatar"
                class="avatar"
              />
            </div>`;
  }

  else if (type == "ai") {
    content = `<div class="message-wrapper">
              <div class="timestamp">2025-07-10 08:23</div>

              <div class="message-content">
               ${text}
              </div>

              <div class="btns-container">
                <button class="util-button copy-button">
                  <img src="./resources/icons/copy-item-icon.png" alt="" />
                </button>

                <button class="util-button like-button">
                  <img src="./resources/icons/thumbs-up-icon.png" alt="" />
                </button>

                <button class="util-button dislike-button">
                  <img src="./resources/icons/thumbs-down-icon.png" alt="" />
                </button>
              </div>
            </div>`;
  }

  messageDiv.innerHTML = content;

  chatBody.appendChild(messageDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
};

const sendMessage = () => {
  const text = messageInput.value.trim();

  if (!text) return;

  const formattedText = text.replace(/\n/g, "<br>");
  addMessage(formattedText, "user");

  messageInput.value = "";
  showLoading();

  setTimeout(() => {
    const reply = `Thanks for your message: "${text}". How can I assist you next?`;
    addMessage(reply, "ai");
    hideLoading();
  }, 1000);

  // MessageProcessor.process({
  //     serviceId: 'autin_copi_generate_ai_response',
  //     projectName: 'autin_copilot',
  //     moduleName: 'autin_copilot',
  //     data: { 'user_input': formattedText },
  //     success: (res) => {
  //         const aiResponse = md.render(res.data.llm_answer);
  //         hideLoading();
  //         addMessage(aiResponse, 'ai');
  //     }
  // });;
};

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();

    sendBtn.click();
    messageInput.style.height = "auto"; // reset height after sending
  }
});

const showLoading = () => {
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "loading";
  loadingDiv.id = "loading";
  for (let i = 0; i < 8; i++) {
    const dot = document.createElement("div");
    loadingDiv.appendChild(dot);
  }
  chatBody.appendChild(loadingDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
};

const hideLoading = () => {
  const loadingDiv = document.getElementById("loading");
  if (loadingDiv) {
    loadingDiv.remove();
  }
};
