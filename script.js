const sendBtn = document.getElementById("send-btn");
const messageInput = document.getElementById("message-input");
const chatBody = document.getElementById("chat-body");
const dropdown = document.getElementById('model-select-dropdown');
const dropdownMenu = document.getElementById('model-options');
const modelNameDisplay = document.getElementById('input-model-name');

const maxHeight = parseInt(
  window.getComputedStyle(messageInput).getPropertyValue("max-height")
);

let isLoading = false;
let selectedModel = modelNameDisplay.textContent; 

// State management for conversation flow
let conversationState = {
  stage: "initial", // Possible stages: initial, fault_or_progress, notification_method, notification_content, user_selection, progress_tracking, progress_selection
  selectedOption: null,
  notificationMethod: null,
};

// Resize textarea based on input
messageInput.addEventListener("input", () => {
  messageInput.style.height = "auto";
  const scrollHeight = messageInput.scrollHeight;
  if (scrollHeight <= maxHeight) {
    messageInput.style.overflowY = "hidden";
    messageInput.style.height = `${scrollHeight}px`;
  } else {
    messageInput.style.overflowY = "auto";
    messageInput.style.height = `${maxHeight}px`;
  }

  if (isLoading || messageInput.value.trim() === '') {
    sendBtn.disabled = true;
  } else {
    sendBtn.disabled = false;
  }
});

// Add message to chat body with streaming effect for AI messages
const addMessage = (text, type) => {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  let content = "";

  if (type === "user") {
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
    messageDiv.innerHTML = content;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  } else if (type === "ai") {
    content = `
    <img src="./resources/images/user-avatar.png" class="profile-pic" alt="">
    <div class="message-wrapper">
      <div class="timestamp">2025-07-10 08:23</div>
      <div class="message-content"></div>
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
    messageDiv.innerHTML = content;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Stream the text character by character
    const contentElement = messageDiv.querySelector(".message-content");
    let index = 0;
    const streamInterval = setInterval(() => {
      if (index < text.length) {
        contentElement.innerHTML += text[index];
        chatBody.scrollTop = chatBody.scrollHeight;
        index++;
      } else {
        clearInterval(streamInterval);
      }
    }, 25); // 50ms per character
  }
};

// Show loading animation
const showLoading = () => {
  isLoading = true;

  const loadingDiv = document.createElement("div");
  
  loadingDiv.className = "loading";
  loadingDiv.id = "loading";
  
  for (let i = 0; i < 8; i++) {
    const dot = document.createElement("div");
    loadingDiv.appendChild(dot);
  }
  
  chatBody.appendChild(loadingDiv);
  chatBody.scrollTop = chatBody.scrollHeight;

  sendBtn.disabled = true;
};

// Hide loading animation
const hideLoading = () => {
  isLoading = false;
  const loadingDiv = document.getElementById("loading");

  if (loadingDiv) {
    loadingDiv.remove();
    sendBtn.disabled = false;
  }
};

// Process user input and generate AI response based on state
const sendMessage = () => {
  const text = messageInput.value.trim();
  if (!text) return;

  console.log('Sending with model:', selectedModel);

  const formattedText = text.replace(/\n/g, "<br>");
  addMessage(formattedText, "user");
  messageInput.value = "";
  showLoading();

  setTimeout(() => {
    hideLoading(); // Hide loading before streaming starts
    let reply = "";
    const input = text.toUpperCase().trim();

    if (conversationState.stage === "initial") {
      if (input === "A") {
        conversationState.stage = "site_down";
        reply =
          "Please provide details about the site down issue you want to analyze.";
      } else if (input === "B") {
        conversationState.stage = "fault_or_progress";
        conversationState.selectedOption = "fault_ticket";
        reply =
          "Fine, for ticket handling I can help on Fault Notification or Progress Tracking. Which one do you want?";
      } else {
        reply =
          "Please select a valid option: A. I want to analyze a Site down. B. I want to handle a Fault/Ticket.";
      }
    } else if (conversationState.stage === "fault_or_progress") {
      if (input.toLowerCase().includes("fault notification")) {
        conversationState.stage = "notification_method";
        reply =
          "In what form would you like to notify? A. Telephone B. WhatsApp C. Welink D. SMS";
      } else if (input.toLowerCase().includes("progress tracking")) {
        conversationState.stage = "progress_selection";
        reply = "Whose progress do you want to track? A. BO B. FME";
      } else {
        reply =
          "Please specify either 'Fault Notification' or 'Progress Tracking'.";
      }
    } else if (conversationState.stage === "notification_method") {
      if (["A", "B", "C", "D"].includes(input)) {
        conversationState.notificationMethod = input;
        conversationState.stage = "notification_content";
        reply =
          "Please enter the content you wish to notify, which will be sent directly to the recipient.";
      } else {
        reply =
          "Please select a valid notification method: A. Telephone B. WhatsApp C. Welink D. SMS";
      }
    } else if (conversationState.stage === "notification_content") {
      conversationState.stage = "user_selection";
      reply =
        "Please select which user group/user you want to notify with a checkmark (e.g., type the group/user name).";
    } else if (conversationState.stage === "user_selection") {
      conversationState.stage = "notification_complete";
      reply = `Very good, you have completed all the necessary steps. We will notify you of the progress once the sending is completed. Please pay attention to the dialog box messages. The current progress is as follows: Complete/Total`;
      // Reset state after completion
      setTimeout(() => {
        conversationState = {
          stage: "initial",
          selectedOption: null,
          notificationMethod: null,
        };
      }, 2000);
    } else if (conversationState.stage === "progress_selection") {
      if (input === "A" || input === "B") {
        const group = input === "A" ? "BO" : "FME";
        reply = `Tracking progress for ${group}. The current progress is: Complete/Total. Would you like to track another group or return to the main menu? (Type 'main' to return or select another group: A. BO B. FME)`;
        conversationState.stage = "progress_tracking";
      } else {
        reply = "Please select a valid group: A. BO B. FME";
      }
    } else if (conversationState.stage === "progress_tracking") {
      if (input.toLowerCase() === "main") {
        conversationState.stage = "initial";
        conversationState.selectedOption = null;
        reply =
          "Hello, I am your AI troubleshooting assistant. You can start with the following options: A. I want to analyze a Site down. B. I want to handle a Fault/Ticket.";
      } else if (input === "A" || input === "B") {
        const group = input === "A" ? "BO" : "FME";
        reply = `Tracking progress for ${group}. The current progress is: Complete/Total. Would you like to track another group or return to the main menu? (Type 'main' to return or select another group: A. BO B. FME)`;
      } else {
        reply =
          "Please select a valid option: A. BO B. FME or type 'main' to return to the main menu.";
      }
    } else if (conversationState.stage === "site_down") {
      reply = `Received details: "${text}". Analysis complete. Would you like to analyze another site down issue or return to the main menu? (Type 'main' to return or provide new details.)`;
      conversationState.stage = "site_down_followup";
    } else if (conversationState.stage === "site_down_followup") {
      if (input.toLowerCase() === "main") {
        conversationState.stage = "initial";
        conversationState.selectedOption = null;
        reply =
          "Hello, I am your AI troubleshooting assistant. You can start with the following options: A. I want to analyze a Site down. B. I want to handle a Fault/Ticket.";
      } else {
        reply = `Received details: "${text}". Analysis complete. Would you like to analyze another site down issue or return to the main menu? (Type 'main' to return or provide new details.)`;
      }
    } else {
      reply =
        "Something went wrong. Let's start over. Hello, I am your AI troubleshooting assistant. You can start with the following options: A. I want to analyze a Site down. B. I want to handle a Fault/Ticket.";
      conversationState = {
        stage: "initial",
        selectedOption: null,
        notificationMethod: null,
      };
    }

    addMessage(reply, "ai");
  }, 4000); // Delay before streaming starts
};

// Event listeners
sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendBtn.click();
    messageInput.style.height = "auto";
  }
});

// Initialize conversation
setTimeout(() => {
  addMessage(
    "Hello, I am your AI troubleshooting assistant. You can start with the following options: A. I want to analyze a Site down. B. I want to handle a Fault/Ticket.",
    "ai"
  );
}, 500);

const initializeLandingPage = () => {
  const landingPage = document.getElementById("landing-page");
  const chatMain = document.getElementById("main");
  const modelButtons = document.querySelectorAll(".model-button");
  const confirmationMessage = document.getElementById("confirmation-message");

  // New elements for displaying model name
  // const headerModelName = document.getElementById('header-model-name');
  const inputModelName = document.getElementById("input-model-name");

  modelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedModel = button.getAttribute("data-model");
      window.selectedModel = selectedModel; // Store globally

      // Update model name display in both locations
      // headerModelName.textContent = selectedModel;
      inputModelName.textContent = selectedModel;

      confirmationMessage.textContent = `You have selected ${selectedModel}`;
      confirmationMessage.classList.add("show");

      setTimeout(() => {
        landingPage.classList.add("hidden");
        chatMain.classList.remove("hidden");
      }, 500); // Wait for confirmation message to be seen
    });
  });
};

const appWindow = document.getElementById("app-window");
const minimizeBtn = document.getElementById("minimize-btn");
const maximizeBtn = document.getElementById("maximize-btn");

let isMaximized = false;
let prevSize = {};

minimizeBtn?.addEventListener("click", () => {
  appWindow.style.height = appWindow.style.minHeight;
  appWindow.style.width = appWindow.style.minWidth;
  appWindow.style.overflow = "hidden";

  minimizeBtn.classList.add("hidden");
  maximizeBtn.classList.remove("hidden");
  isMaximized = false;
});

maximizeBtn?.addEventListener("click", () => {
  appWindow.style.top = "0";
  appWindow.style.left = "0";
  appWindow.style.width = "100vw";
  appWindow.style.height = "100vh";

  minimizeBtn.classList.remove("hidden");
  maximizeBtn.classList.add("hidden");
  isMaximized = true;
});

let isDragging = false;
let offset = { x: 0, y: 0 };

const header = document.getElementById("header");

header.style.cursor = "move";

header.addEventListener("mousedown", (e) => {
  isDragging = true;
  offset.x = e.clientX - appWindow.offsetLeft;
  offset.y = e.clientY - appWindow.offsetTop;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    appWindow.style.left = `${e.clientX - offset.x}px`;
    appWindow.style.top = `${e.clientY - offset.y}px`;
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

initializeLandingPage();

// Toggle dropdown
dropdown.addEventListener('click', (e) => {
  // Prevent toggle if clicking on a menu item
  if (e.target.closest('#model-options')) return;

  dropdownMenu.classList.toggle('hidden');
});

// Select model
dropdownMenu.addEventListener('click', (e) => {
  const item = e.target.closest("li");

  if (item) {
    selectedModel = item.dataset.model;
    modelNameDisplay.textContent = selectedModel;
    dropdownMenu.classList.add('hidden');
  }
});

// Optional: close dropdown if user clicks outside
document.addEventListener('click', (e) => {
  if (!dropdown.contains(e.target)) {
    dropdownMenu.classList.add('hidden');
  }
});
