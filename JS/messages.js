// JS/messages.js

class Chat {
  constructor(
    id,
    memberIds,
    type,
    name,
    initialMessages = [],
    createdBy = "",
    createdAt = new Date(),
    lastActivity = new Date()
  ) {
    this.id = id; // Це буде MongoDB _id
    this._name = name;
    this.memberIds = Array.isArray(memberIds) ? memberIds : [];
    this.type = type;
    this.messages = initialMessages; // Масив об'єктів повідомлень з сервера
    this.createdBy = createdBy;
    this.createdAt = new Date(createdAt);
    this.lastActivity = new Date(lastActivity);
  }

  getDisplayName(allUsers, currentUsernameParam) {
    if (this.type === "direct") {
      const otherMemberId = this.memberIds.find(
        (username) => username !== currentUsernameParam
      );
      if (otherMemberId) {
        const otherUser = allUsers.find(
          (user) => user.username === otherMemberId
        );
        return otherUser ? otherUser.name : "Unknown User";
      }
      return this._name || "Direct Chat"; // Запасний варіант
    }

    // Для групових чатів
    if (!this._name) {
      // signedUsers - глобальна змінна, яка має бути завантажена до виклику цього методу
      let chatName = this.memberIds
        .map(
          (username) => signedUsers.find((u) => u.username === username)?.fname
        )
        .filter((name) => name)
        .slice(0, 2) // Імена перших двох
        .join(", ");

      if (
        (!chatName && this.memberIds.length > 0) ||
        (this.memberIds.length > 2 && chatName)
      ) {
        chatName += (chatName ? " " : "") + "& others";
      } else if (!chatName && this.memberIds.length === 0) {
        chatName = "Empty Group";
      } else if (!chatName) {
        chatName = "New Group";
      }
      return chatName || "Group Chat";
    }
    return this._name; // Якщо назва групи задана явно
  }

  getChatAvatarUrl(allUsers, currentUsernameParam) {
    if (this.type === "direct") {
      const otherMemberId = this.memberIds.find(
        (username) => username !== currentUsernameParam
      );
      if (otherMemberId) {
        const otherUser = allUsers.find(
          (user) => user.username === otherMemberId
        );
        return otherUser
          ? otherUser.getAvatarUrl()
          : Chat.defaultGroupAvatarUrl();
      }
    }
    // Для групових чатів або якщо щось пішло не так з direct
    return Chat.defaultGroupAvatarUrl();
  }

  static defaultGroupAvatarUrl() {
    // Ваш SVG для групового аватара
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%239e9e9e' stroke-width='1.5'%3E%3Ccircle cx='12' cy='12' r='3'%3E%3C/circle%3E%3Ccircle cx='17' cy='8' r='2.5'%3E%3C/circle%3E%3Ccircle cx='7' cy='8' r='2.5'%3E%3C/circle%3E%3Cpath d='M12 15c-1.82-.31-3.53.11-5 .95M12 15c1.82-.31 3.53.11 5 .95M17 10.5c-.21 1.11-.8 2.14-1.63 2.95M7 10.5c.21 1.11.8 2.14 1.63 2.95'%3E%3C/path%3E%3C/svg%3E`;
  }

  addMessage(messageObject) {
    // messageObject - це об'єкт повідомлення з сервера
    this.messages.push(messageObject);
    this.lastActivity = new Date(messageObject.timestamp); // Оновлюємо з часом повідомлення
  }
}

// Елементи DOM
const chatListULElement = document.querySelector(".chat-items-list");
const chatWindowPlaceholder = document.querySelector(
  ".chat-window-placeholder"
);
const chatWindowContent = document.querySelector(".chat-window-content");
const chatRoomTitleElement =
  chatWindowContent.querySelector(".chat-room-title");
const messagesDisplayArea = chatWindowContent.querySelector(
  ".messages-display-area"
);
const messageInputField = chatWindowContent.querySelector(
  ".message-input-field"
);
const sendMessageButton = chatWindowContent.querySelector(
  ".send-message-button"
);

const tabButtonsContainer = document.querySelector(".chat-list-tabs");
const tabButtons = tabButtonsContainer.querySelectorAll(".tab-button");
const newChatFormContainer = document.getElementById("new-chat-form");
const chatWindowHeader = chatWindowContent.querySelector(".chat-window-header");
const newChatFormTabButton = Array.from(tabButtons).find(
  (btn) => btn.dataset.tabTarget === "new-chat-form"
);
const newChatMembersListULElement = newChatFormContainer.querySelector(
  ".new-chat-members-list"
);
const newChatNameInputContainer = newChatFormContainer.querySelector(
  ".new-chat-name-input-container"
);
const newChatNameInput = newChatFormContainer.querySelector("#new-chat-name");
const createChatButton = newChatFormContainer.querySelector(
  "#create-chat-button"
);
const cancelCreateChatButton = newChatFormContainer.querySelector(
  "#cancel-create-chat-button"
);

let chatsData = []; // Масив екземплярів Chat
let signedUsers = []; // Масив екземплярів User (з PHP), завантажується асинхронно
let currentUserName; // Встановлюється з currentUser.username

let currentActiveChatId = null;
let selectedNewChatMembers = []; // usernames обраних для нового чату
let formMode = "new"; // 'new' або 'edit' для форми створення/редагування чату
let chatBeingEdited = null; // Екземпляр Chat, що редагується

let socket;
const NODE_JS_SERVER_HOST = window.location.hostname; // Або 'localhost' для локальної розробки
const NODE_JS_SERVER_PORT = 3001; // Порт вашого Node.js WebSocket сервера

// --- WebSocket Logic ---
function connectWebSocket() {
  if (!currentUserName) {
    console.error(
      "WebSocket connection attempt without currentUserName. currentUser:",
      currentUser
    );
    // Якщо GetUserFromLocalStorage вже відпрацював і currentUser не валідний, то він вже мав би зробити LogOutBut()
    // Тому тут просто виходимо, щоб уникнути помилок
    return;
  }
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  socket = new WebSocket(
    `${wsProtocol}//${NODE_JS_SERVER_HOST}:${NODE_JS_SERVER_PORT}/`
  );

  socket.onopen = () => {
    console.log("WebSocket connected to Node.js server!");
    // Реєстрація користувача на WebSocket сервері
    socket.send(
      JSON.stringify({ type: "register", username: currentUserName })
    );
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received from server:", data);

    switch (data.type) {
      case "error":
        alert(
          `Server error: ${data.message} ${
            data.details ? `(${data.details})` : ""
          }`
        );
        break;
      case "initialChatRooms":
        console.log("Processing initialChatRooms:", data.rooms);
        chatsData = data.rooms.map((room) => {
          return new Chat(
            room.chatRoom._id,
            room.chatRoom.members,
            room.chatRoom.type,
            room.chatRoom.name,
            [], // Повідомлення завантажуються окремо при активації чату
            room.chatRoom.createdBy,
            new Date(room.chatRoom.createdAt),
            new Date(room.chatRoom.lastActivity)
          );
        });
        renderChatList(); // Рендеримо список, renderChatList має врахувати room.hasUnreadMessages

        // Після рендерингу, встановлюємо .has-unread на основі даних з сервера
        data.rooms.forEach((room) => {
          if (room.hasUnreadMessages) {
            const chatListItem = chatListULElement.querySelector(
              `.chat-item[data-chat-id="${room.chatRoom._id}"]`
            );
            console.log(chatListItem);
            if (chatListItem) {
              chatListItem.classList.add("has-unread");
            }
          }
        });

        if (
          currentActiveChatId &&
          chatsData.find((c) => c.id === currentActiveChatId)
        ) {
          setActiveChat(currentActiveChatId, true); // true - завантажити повідомлення
        } else if (chatsData.length > 0) {
          updateChatWindow(null);
        } else {
          updateChatWindow(null);
        }
        CheckAndHideNotifIndicator(); // Перевірити глобальний індикатор
        break;
      case "newChatCreated": {
        const newChat = new Chat(
          data.chat._id,
          data.chat.members,
          data.chat.type,
          data.chat.name,
          [],
          data.chat.createdBy,
          new Date(data.chat.createdAt),
          new Date(data.chat.lastActivity)
        );
        chatsData.push(newChat);
        renderChatList();
        if (data.chat.createdBy === currentUserName) {
          switchToTab("chat-rooms-list");
          setActiveChat(newChat.id);
        } else {
          console.log(
            `You've been added to a new chat: ${newChat.getDisplayName(
              signedUsers,
              currentUserName
            )}`
          );
          const chatListItem = chatListULElement.querySelector(
            `.chat-item[data-chat-id="${newChat.id}"]`
          );
          if (chatListItem) {
            chatListItem.classList.add("has-unread");
            CheckAndHideNotifIndicator(); // Показати глобальний індикатор
          }
        }
        break;
      }
      case "chatCreationFailed": // Наприклад, direct чат вже існує
        alert(data.message);
        if (data.existingChat) {
          switchToTab("chat-rooms-list");
          setActiveChat(data.existingChat._id); // Активувати існуючий чат
        }
        break;
      case "chatUpdated": {
        const updatedChatData = data.chat;
        const chatIndex = chatsData.findIndex(
          (c) => c.id === updatedChatData._id
        );
        if (chatIndex > -1) {
          const oldMessages = chatsData[chatIndex].messages; // Зберігаємо старі повідомлення
          chatsData[chatIndex] = new Chat(
            updatedChatData._id,
            updatedChatData.members,
            updatedChatData.type,
            updatedChatData.name,
            oldMessages,
            updatedChatData.createdBy,
            new Date(updatedChatData.createdAt),
            new Date(updatedChatData.lastActivity)
          );
          renderChatList();
          // Тут можна перевірити, чи не з'явились непрочитані, якщо змінився lastActivity
          // Але це складніше, поки що залишимо як є. Непрочитані з'являться з 'newMessage'.

          if (currentActiveChatId === updatedChatData._id) {
            updateChatWindow(currentActiveChatId);
          }
          // Можливо, також потрібно показати індикатор, якщо оновлення робить чат "новим" для користувача
          if (
            !updatedChatData.members.includes(currentUserName) &&
            chatsData[chatIndex].memberIds.includes(currentUserName)
          ) {
            // Якщо користувача видалили з чату, то він має зникнути зі списку
            chatsData.splice(chatIndex, 1);
            renderChatList();
            if (currentActiveChatId === updatedChatData._id) {
              currentActiveChatId = null;
              updateChatWindow(null);
            }
          } else if (
            updatedChatData.members.includes(currentUserName) &&
            !chatsData[chatIndex].memberIds.some((mId) =>
              updatedChatData.members.includes(mId)
            )
          ) {
            // Якщо користувача додали до чату
            const chatListItem = chatListULElement.querySelector(
              `.chat-item[data-chat-id="${updatedChatData._id}"]`
            );
            if (chatListItem) {
              chatListItem.classList.add("has-unread");
              CheckAndHideNotifIndicator();
            }
          }
        }
        break;
      }
      case "newMessage": {
        const chat = chatsData.find((c) => c.id === data.chatId);
        if (chat) {
          chat.addMessage(data.message);
          chat.lastActivity = new Date(data.message.timestamp);
          renderChatList(); // Важливо для оновлення порядку та можливого .has-unread

          if (currentActiveChatId === data.chatId) {
            displayMessage(data.message, chat);
            // Якщо чат активний, повідомляємо сервер, що ми його прочитали
            if (socket && socket.readyState === WebSocket.OPEN) {
              socket.send(
                JSON.stringify({
                  type: "markChatAsRead",
                  payload: { chatId: data.chatId },
                })
              );
            }
          } else {
            // Додаємо .has-unread, якщо чат не активний
            const chatListItem = chatListULElement.querySelector(
              `.chat-item[data-chat-id="${data.chatId}"]`
            );
            if (
              chatListItem &&
              data.message.senderUsername !== currentUserName
            ) {
              // Не позначати як непрочитане, якщо сам собі написав
              chatListItem.classList.add("has-unread");
              CheckAndHideNotifIndicator(); // Показати глобальний індикатор
            }
          }
        }
        break;
      }
      case "messagesHistory": {
        const chat = chatsData.find((c) => c.id === data.chatId);
        if (chat) {
          chat.messages = data.messages;
          renderMessagesForActiveChat();
          // Повідомляємо сервер, що чат прочитано, коли завантажили історію
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                type: "markChatAsRead",
                payload: { chatId: data.chatId },
              })
            );
          }
          // Після markChatAsRead, знімаємо has-unread з елемента списку
          const chatListItem = chatListULElement.querySelector(
            `.chat-item[data-chat-id="${data.chatId}"]`
          );
          if (chatListItem) chatListItem.classList.remove("has-unread");
          CheckAndHideNotifIndicator(); // Оновити глобальний індикатор
        }
        break;
      }
    }
  };

  socket.onclose = (event) => {
    console.log("WebSocket disconnected:", event.reason, event.code);
    // Можна спробувати перепідключитися або показати повідомлення користувачу
    // alert("Connection to chat server lost. Please refresh the page to reconnect.");
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    alert("WebSocket connection error. The chat service might be unavailable.");
  };
}

// --- DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", async () => {
  // currentUser вже має бути встановлений з вашого script.js
  // Перевірка, чи currentUser доступний глобально (встановлений з script.js)
  if (!currentUser || !currentUser.username) {
    console.error(
      "CRITICAL: currentUser is not available or not valid. Chat functionality disabled."
    );
    // Можливо, показати повідомлення користувачу або заблокувати інтерфейс чату
    // Наприклад, сховати messages-layout або показати заглушку
    const layout = document.querySelector(".messages-layout");
    if (layout)
      layout.innerHTML =
        '<div class="chat-window-placeholder" style="display:flex; width:100%;"><p>Error: User not authenticated. Cannot load chat.</p></div>';
    return; // Зупинити подальше виконання, якщо користувач не автентифікований
  }
  currentUserName = currentUser.username;

  try {
    signedUsers = await LoadUsers(); // Завантаження списку всіх користувачів
    console.log("Signed users loaded for chat:", signedUsers);
  } catch (error) {
    console.error("Failed to load signed users for chat:", error);
    // Можна показати помилку користувачу, але чат може працювати з обмеженнями
  }

  connectWebSocket(); // Підключаємося до WebSocket після того, як currentUserName встановлено

  // Обробники подій (як у вашому оригінальному messages.js)
  createChatButton.addEventListener("click", () => {
    if (formMode === "edit") {
      handleSaveChanges();
    } else {
      handleCreateNewChat();
    }
  });

  chatListULElement.addEventListener("click", (event) => {
    const clickedChatItem = event.target.closest(".chat-item");
    if (!clickedChatItem) return;

    const chatId = clickedChatItem.dataset.chatId;
    if (currentActiveChatId !== chatId) {
      setActiveChat(chatId);
    }
    // Зняти позначку "непрочитано" при кліку
    if (clickedChatItem.classList.contains("has-unread")) {
      clickedChatItem.classList.remove("has-unread");
    }
    CheckAndHideNotifIndicator(chatListULElement);
  });

  tabButtonsContainer.addEventListener("click", (event) => {
    const clickedButton = event.target.closest(".tab-button");
    if (clickedButton && !clickedButton.classList.contains("active")) {
      switchToTab(clickedButton.dataset.tabTarget);
    }
  });

  cancelCreateChatButton.addEventListener("click", () => {
    switchToTab("chat-rooms-list"); // Це вже викликає reset і очищення форми
  });

  sendMessageButton.addEventListener("click", sendChatMessage);
  messageInputField.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      // Відправка по Enter, якщо не затиснутий Shift
      event.preventDefault();
      sendChatMessage();
    }
  });

  // Початкова ініціалізація UI
  switchToTab("chat-rooms-list"); // Показати список чатів за замовчуванням
  updateChatWindow(chatBeingEdited); // Показати placeholder, бо чат ще не обрано
});

// --- Функції для управління чатами (UI) ---

function setActiveChat(chatId, fetchMsgs = true) {
  const previouslyActive = chatListULElement.querySelector(
    ".chat-item.active-chat"
  );
  if (previouslyActive) {
    previouslyActive.classList.remove("active-chat");
  }

  const newActiveChatItem = chatListULElement.querySelector(
    `.chat-item[data-chat-id="${chatId}"]`
  );
  if (newActiveChatItem) {
    newActiveChatItem.classList.add("active-chat");
    if (newActiveChatItem.classList.contains("has-unread")) {
      newActiveChatItem.classList.remove("has-unread");
      // Коли чат стає активним і був непрочитаним, повідомляємо сервер
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "markChatAsRead",
            payload: { chatId: chatId },
          })
        );
      }
    }
  }

  currentActiveChatId = chatId;
  updateChatWindow(chatId);

  if (fetchMsgs && socket && socket.readyState === WebSocket.OPEN) {
    const chat = chatsData.find((c) => c.id === chatId);
    if (chat) {
      socket.send(
        JSON.stringify({ type: "fetchMessages", payload: { chatId: chatId } })
      );
    } else {
      console.warn(
        `Chat with ID ${chatId} not found in local chatsData when trying to fetch messages.`
      );
    }
  }
  // CheckAndHideNotifIndicator(); // Перевірити глобальний індикатор
}

function renderNewChatMembersList() {
  // Перевірка, чи signedUsers завантажені. Якщо ні, можна показати завантажувач або повідомлення.
  if (!signedUsers || signedUsers.length === 0) {
    newChatMembersListULElement.innerHTML = `<div class="chat-window-placeholder" style="padding: 10px; text-align:center;">
            <p>Loading users or no other users available.</p>
         </div>`;
    // Якщо signedUsers порожній (тільки поточний користувач), то для нього самого список не потрібен.
    if (
      signedUsers &&
      signedUsers.length === 1 &&
      signedUsers[0].username === currentUserName
    ) {
      newChatMembersListULElement.innerHTML = `<div class="chat-window-placeholder" style="padding: 10px; text-align:center;">
                <p>You are the only user on this platform.</p>
             </div>`;
    }
    updateNewChatNameInputVisibility(); // Оновити видимість поля імені
    return;
  }

  newChatMembersListULElement.innerHTML = ""; // Очистити перед рендерингом

  const otherUsers = signedUsers.filter(
    (user) => user.username !== currentUserName
  );

  if (otherUsers.length === 0) {
    newChatMembersListULElement.innerHTML = `<div class="chat-window-placeholder" style="padding: 10px; text-align:center;">
            <p>No other users to create a chat with.</p>
         </div>`;
    updateNewChatNameInputVisibility();
    return;
  }

  otherUsers.forEach((user) => {
    const li = document.createElement("li");
    li.dataset.userId = user.username;

    const avatarImg = document.createElement("img");
    avatarImg.classList.add("new-chat-member-avatar");
    avatarImg.src = user.getAvatarUrl();
    avatarImg.alt = user.name;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `user-sel-${user.username}`; // Унікальний ID для чекбокса
    checkbox.value = user.username;

    // В режимі редагування, відмічаємо учасників поточного чату
    // selectedNewChatMembers зберігає username *інших* учасників
    checkbox.checked = selectedNewChatMembers.includes(user.username);

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.textContent = user.name;

    // Обробник кліку на весь елемент списку для зручності
    li.addEventListener("click", (event) => {
      // Якщо клік не по самому чекбоксу (щоб уникнути подвійного спрацювання)
      if (
        event.target.type !== "checkbox" &&
        event.target.tagName !== "LABEL"
      ) {
        checkbox.checked = !checkbox.checked;
      }
      handleMemberSelection(checkbox, user.username);
    });
    // Окремий обробник для зміни стану чекбокса (наприклад, через клавіатуру)
    checkbox.addEventListener("change", () =>
      handleMemberSelection(checkbox, user.username)
    );

    li.appendChild(checkbox);
    li.appendChild(avatarImg);
    li.appendChild(label);
    newChatMembersListULElement.appendChild(li);
  });
  updateNewChatNameInputVisibility();
}

function handleMemberSelection(checkboxElement, userId) {
  if (checkboxElement.checked) {
    if (!selectedNewChatMembers.includes(userId)) {
      selectedNewChatMembers.push(userId);
    }
  } else {
    selectedNewChatMembers = selectedNewChatMembers.filter(
      (username) => username !== userId
    );
  }
  updateNewChatNameInputVisibility();
}

function updateNewChatNameInputVisibility() {
  // Показувати поле для імені, якщо обрано більше одного учасника (для групового чату)
  // Або якщо це режим редагування і чат є груповим
  if (
    selectedNewChatMembers.length > 1 ||
    (formMode === "edit" && chatBeingEdited && chatBeingEdited.type === "group")
  ) {
    newChatNameInputContainer.style.display = "flex"; // Або "block", залежно від CSS
  } else {
    newChatNameInputContainer.style.display = "none";
    if (formMode === "new") newChatNameInput.value = ""; // Очистити, якщо ховаємо в режимі створення
  }
}

function resetNewChatForm() {
  selectedNewChatMembers = [];
  newChatNameInput.value = "";
  // Перерендерити список з очищеними чекбоксами, якщо форма видима
  const formIsVisible =
    newChatFormContainer.style.display === "flex" ||
    newChatFormContainer.style.display === "block";
  if (
    formIsVisible &&
    newChatFormTabButton &&
    newChatFormTabButton.classList.contains("active")
  ) {
    renderNewChatMembersList();
  }
  updateNewChatNameInputVisibility();
}

function switchToTab(targetTabId) {
  tabButtons.forEach((button) => {
    const tabId = button.dataset.tabTarget;
    const contentElement = document.getElementById(tabId);
    if (tabId === targetTabId) {
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");
      if (contentElement) contentElement.style.display = "flex"; // Використовуємо flex для .tab-content.active
    } else {
      button.classList.remove("active");
      button.setAttribute("aria-selected", "false");
      if (contentElement) contentElement.style.display = "none";
    }
  });

  if (targetTabId === "new-chat-form") {
    if (formMode === "edit" && chatBeingEdited) {
      // Режим редагування існуючого чату
      if (newChatFormTabButton)
        newChatFormTabButton.textContent = "Edit chat room";
      createChatButton.textContent = "Save Changes";
      populateFormForEditing(); // Заповнити форму даними чату, що редагується
    } else {
      // Режим створення нового чату
      formMode = "new";
      chatBeingEdited = null;
      if (newChatFormTabButton)
        newChatFormTabButton.textContent = "+ New chat room";
      createChatButton.textContent = "Create Chat";
      resetNewChatForm(); // Очистити форму
      renderNewChatMembersList(); // Рендер списку користувачів для вибору
      updateNewChatNameInputVisibility();
    }
  } else if (targetTabId === "chat-rooms-list") {
    // При переході на список чатів, завжди скидаємо режим редагування
    formMode = "new";
    chatBeingEdited = null;
    if (newChatFormTabButton)
      newChatFormTabButton.textContent = "+ New chat room";
    createChatButton.textContent = "Create Chat";
    resetNewChatForm(); // Очищаємо форму, бо вона прихована
  }
}

function handleEditChatHeaderClick(event) {
  const headerElement = event.currentTarget; // Це .chat-window-header
  const chatIdToEdit = headerElement.dataset.chatIdForEdit;

  if (!chatIdToEdit) return;

  const chat = chatsData.find((c) => c.id === chatIdToEdit);
  if (chat && chat.type === "group") {
    // Тільки групи можна редагувати через заголовок
    formMode = "edit";
    chatBeingEdited = chat; // Зберігаємо екземпляр чату
    switchToTab("new-chat-form"); // Переходимо на вкладку форми
  }
}

function populateFormForEditing() {
  if (!chatBeingEdited) return;
  // selectedNewChatMembers - це usernames *інших* учасників (не поточного)
  selectedNewChatMembers = chatBeingEdited.memberIds.filter(
    (username) => username !== currentUserName
  );
  // Заповнюємо назву чату (використовуємо _name, щоб отримати збережену назву групи)
  newChatNameInput.value = chatBeingEdited._name || "";
  renderNewChatMembersList(); // Рендерить список з попередньо обраними
  updateNewChatNameInputVisibility(); // Показує/ховає поле імені
}

function handleCreateNewChat() {
  if (selectedNewChatMembers.length === 0) {
    alert("Please select at least one member for the chat.");
    return;
  }

  const chatType = selectedNewChatMembers.length === 1 ? "direct" : "group";
  let chatName = "";

  if (chatType === "group") {
    chatName = newChatNameInput.value.trim();
  }

  // Відправляємо запит на сервер для створення чату
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "createChat",
        payload: {
          memberUsernames: selectedNewChatMembers, // Масив username *інших* учасників
          chatName: chatName, // Назва для групового чату
          type: chatType,
        },
      })
    );
  } else {
    alert("Not connected to chat server. Please try again.");
  }
  // Очищення форми та перехід на список чатів відбудеться після відповіді сервера ('newChatCreated' або 'chatCreationFailed')
}

function handleSaveChanges() {
  if (!chatBeingEdited) return;

  const updatedName = newChatNameInput.value.trim();
  // selectedNewChatMembers - це масив username *інших* учасників

  if (chatBeingEdited.type === "group") {
    if (selectedNewChatMembers.length === 0) {
      // Група повинна мати хоча б одного *іншого* учасника
      alert(
        "A group chat must have at least one other member besides yourself."
      );
      return;
    }
  }
  // Для direct чатів логіка редагування учасників зазвичай інша (створення нового чату)
  // Ця функція викликається тільки для груп, згідно з handleEditChatHeaderClick.

  // Відправляємо запит на сервер для оновлення чату
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "editChat",
        payload: {
          chatId: chatBeingEdited.id,
          newName: updatedName, // Нова назва групи (якщо змінилася)
          newMemberUsernames: selectedNewChatMembers, // Оновлений список *інших* учасників
        },
      })
    );
  } else {
    alert("Not connected to chat server. Please try again.");
  }
  // Скидання режиму редагування та форми відбудеться після відповіді сервера ('chatUpdated')
}

// --- Функції для рендерингу списку чатів та вікна чату ---
function createChatItemElement(chatInstance) {
  const listItem = document.createElement("li");
  listItem.classList.add("chat-item");
  listItem.dataset.chatId = chatInstance.id;

  const iconContainer = document.createElement("span");
  iconContainer.classList.add("chat-item-icon");

  const avatarImg = document.createElement("img");
  avatarImg.classList.add("chat-item-avatar-img");
  avatarImg.src = chatInstance.getChatAvatarUrl(signedUsers, currentUserName);
  const chatDisplayName = chatInstance.getDisplayName(
    signedUsers,
    currentUserName
  );
  avatarImg.alt = chatDisplayName;
  iconContainer.appendChild(avatarImg);

  const nameSpan = document.createElement("span");
  nameSpan.classList.add("chat-item-name");
  nameSpan.textContent = chatDisplayName;

  listItem.appendChild(iconContainer);
  listItem.appendChild(nameSpan);

  return listItem;
}

function renderChatList() {
  // Сортуємо чати за часом останньої активності (новіші зверху)
  chatsData.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

  chatListULElement.innerHTML = ""; // Очистити список перед рендерингом
  if (chatsData.length < 1) {
    chatListULElement.innerHTML = `<div class="chat-window-placeholder" style="padding: 10px; text-align:center;">
            <p>You have no chats yet. <br>Create one using the '+ New chat room' tab.</p>
         </div>`;
    return;
  }

  chatsData.forEach((chat) => {
    const chatElement = createChatItemElement(chat);
    if (chat.id === currentActiveChatId) {
      chatElement.classList.add("active-chat");
    }
    // Якщо є непрочитані повідомлення (логіка для цього ще не додана на сервері, але можна розширити)
    // if (chat.hasUnread) chatElement.classList.add('has-unread');
    chatListULElement.appendChild(chatElement);
  });
}

function updateChatWindow(chatId) {
  const selectedChat = chatsData.find((chat) => chat.id === chatId);

  const membersInfoDiv = chatWindowContent.querySelector(".members-info");
  const memberIconsListDiv = membersInfoDiv.querySelector(".member-icons-list");
  const addMemberIconSpan = membersInfoDiv.querySelector(".add-member-icon");

  // Завжди видаляємо попередній обробник перед додаванням нового, щоб уникнути дублікатів
  chatWindowHeader.removeEventListener("click", handleEditChatHeaderClick);
  chatWindowHeader.classList.remove("clickable-header"); // Зняти стиль клікабельності
  delete chatWindowHeader.dataset.chatIdForEdit; // Видалити дані для редагування

  if (selectedChat) {
    chatWindowPlaceholder.style.display = "none";
    chatWindowContent.style.display = "flex"; // Показати контент чату
    chatRoomTitleElement.textContent = selectedChat.getDisplayName(
      signedUsers,
      currentUserName
    );
    messageInputField.placeholder = `Message ${selectedChat.getDisplayName(
      signedUsers,
      currentUserName
    )}`;
    messageInputField.disabled = false;
    sendMessageButton.disabled = false;

    memberIconsListDiv.innerHTML = ""; // Очистити попередні іконки учасників
    if (selectedChat.type === "direct") {
      membersInfoDiv.style.display = "flex"; // Показати блок .members-info
      addMemberIconSpan.style.display = "none"; // Ховаємо іконку "+" для direct чатів

      const otherMemberId = selectedChat.memberIds.find(
        (username) => username !== currentUserName
      );
      if (otherMemberId) {
        const otherUser = signedUsers.find((u) => u.username === otherMemberId);
        if (otherUser) {
          const avatarImg = document.createElement("img");
          avatarImg.classList.add("member-icon", "user-icon-small");
          avatarImg.src = otherUser.getAvatarUrl();
          avatarImg.alt = otherUser.name;
          memberIconsListDiv.appendChild(avatarImg);
        }
      }
    } else if (selectedChat.type === "group") {
      // Робимо заголовок клікабельним для редагування груп
      chatWindowHeader.classList.add("clickable-header");
      chatWindowHeader.dataset.chatIdForEdit = selectedChat.id; // Зберігаємо ID для обробника
      chatWindowHeader.addEventListener("click", handleEditChatHeaderClick);

      membersInfoDiv.style.display = "flex"; // Показати блок
      addMemberIconSpan.style.display = "flex"; // Показати "+" (переконайтеся, що CSS для .add-member-icon встановлює display: flex або inline-flex)

      const memberIdsInGroup = selectedChat.memberIds;
      const maxAvatarsToShow = 3; // Максимальна кількість аватарів для показу

      for (
        let i = 0;
        i < Math.min(memberIdsInGroup.length, maxAvatarsToShow);
        i++
      ) {
        const memberId = memberIdsInGroup[i];
        const member = signedUsers.find((u) => u.username === memberId);
        if (member) {
          const avatarImg = document.createElement("img");
          avatarImg.classList.add("member-icon", "user-icon-small");
          avatarImg.src = member.getAvatarUrl();
          avatarImg.alt = member.name;
          memberIconsListDiv.appendChild(avatarImg);
        }
      }

      if (memberIdsInGroup.length > maxAvatarsToShow) {
        const ellipsisSpan = document.createElement("span");
        ellipsisSpan.classList.add("ellipsis-icon"); // Ваш CSS клас для "..."
        ellipsisSpan.textContent = "...";
        ellipsisSpan.title = `${
          memberIdsInGroup.length - maxAvatarsToShow
        } more member(s)`;
        memberIconsListDiv.appendChild(ellipsisSpan);
      }
    } else {
      // Якщо тип чату не визначений або не direct/group
      membersInfoDiv.style.display = "none";
    }

    renderMessagesForActiveChat(); // Відобразити повідомлення для обраного чату
  } else {
    // Жоден чат не обрано, показуємо placeholder
    chatWindowPlaceholder.style.display = "flex";
    chatWindowContent.style.display = "none";
    chatRoomTitleElement.textContent = ""; // Очистити заголовок
    messageInputField.placeholder = "Select a chat to start messaging";
    messageInputField.disabled = true;
    sendMessageButton.disabled = true;
    membersInfoDiv.style.display = "none"; // Ховаємо інформацію про учасників
  }
}

// --- Функції для відправки та відображення повідомлень ---
function sendChatMessage() {
  const contentText = messageInputField.value.trim();
  if (
    contentText &&
    currentActiveChatId &&
    socket &&
    socket.readyState === WebSocket.OPEN
  ) {
    socket.send(
      JSON.stringify({
        type: "sendMessage",
        payload: {
          chatId: currentActiveChatId,
          contentText: contentText,
        },
      })
    );
    messageInputField.value = ""; // Очистити поле вводу після відправки
    messageInputField.focus(); // Повернути фокус на поле вводу
  } else if (!currentActiveChatId) {
    alert("Please select a chat first.");
  } else if (!socket || socket.readyState !== WebSocket.OPEN) {
    alert("Not connected to chat server. Please try again.");
  }
}

function renderMessagesForActiveChat() {
  messagesDisplayArea.innerHTML = `<h3 class="messages-area-sub-title">Messages</h3>`; // Очистити перед рендером
  const activeChat = chatsData.find((c) => c.id === currentActiveChatId);

  if (activeChat && activeChat.messages && activeChat.messages.length > 0) {
    activeChat.messages.forEach((msgObj) => displayMessage(msgObj, activeChat));
    messagesDisplayArea.scrollTop = messagesDisplayArea.scrollHeight; // Прокрутка до останнього повідомлення
  } else if (activeChat) {
    // Чат є, але повідомлень немає
    messagesDisplayArea.innerHTML += `<div class="chat-window-placeholder" style="padding: 20px; text-align:center; flex-grow: 1; display:flex; align-items:center; justify-content:center;">
            <p>No messages yet in this chat. Be the first to write!</p>
          </div>`;
  } else if (!activeChat && currentActiveChatId) {
    // Чат обраний, але дані ще не завантажились
    messagesDisplayArea.innerHTML += `<div class="chat-window-placeholder" style="padding: 20px; text-align:center; flex-grow: 1; display:flex; align-items:center; justify-content:center;">
            <p>Loading messages...</p>
          </div>`;
  }
  // Якщо currentActiveChatId == null, то placeholder вже показаний функцією updateChatWindow
}

function displayMessage(messageObject, chatContext) {
  // messageObject - з сервера
  const messageEntry = document.createElement("div");
  messageEntry.classList.add("message-entry");

  // Визначення відправника
  const sender = signedUsers.find(
    (u) => u.username === messageObject.senderUsername
  );
  const senderName = sender ? sender.fname : messageObject.senderUsername; // Використовуємо ім'я, якщо є

  // Колонка з аватаром
  const avatarColumn = document.createElement("div");
  avatarColumn.classList.add("avatar-column");

  const messageAvatar = document.createElement("img");
  messageAvatar.classList.add("message-avatar", "user-icon-small"); // Ваші CSS класи
  messageAvatar.src = sender
    ? sender.getAvatarUrl()
    : Chat.defaultGroupAvatarUrl();
  messageAvatar.alt = senderName;

  const messageSenderNameSpan = document.createElement("span");
  messageSenderNameSpan.classList.add("message-sender-name");
  messageSenderNameSpan.textContent = senderName;

  avatarColumn.appendChild(messageAvatar);
  avatarColumn.appendChild(messageSenderNameSpan);

  // Колонка з контентом повідомлення
  const messageContentColumn = document.createElement("div");
  messageContentColumn.classList.add("message-content-column");

  const messageBubble = document.createElement("div");
  messageBubble.classList.add("message-bubble");
  // Для безпеки, якщо контент може містити HTML, його треба екранувати
  // Поки що просто встановлюємо textContent
  messageBubble.textContent = messageObject.content;

  // Додаємо час повідомлення
  const messageTimestamp = document.createElement("span");
  messageTimestamp.classList.add("message-timestamp"); // Потрібен CSS для цього класу
  messageTimestamp.textContent = new Date(
    messageObject.timestamp
  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  messageBubble.appendChild(messageTimestamp);

  messageContentColumn.appendChild(messageBubble);

  // Додаємо колонки до головного елемента повідомлення
  messageEntry.appendChild(avatarColumn);
  messageEntry.appendChild(messageContentColumn);

  // Визначаємо, чи це надіслане чи отримане повідомлення
  if (messageObject.senderUsername === currentUserName) {
    messageEntry.classList.add("sent-message");
  } else {
    messageEntry.classList.add("received-message");
  }

  messagesDisplayArea.appendChild(messageEntry);
  // Плавна прокрутка до нового повідомлення
  messagesDisplayArea.scrollTo({
    top: messagesDisplayArea.scrollHeight,
    behavior: "smooth",
  });
}

// --- Утиліта для завантаження користувачів (з вашого script.js, але тут для повноти) ---
async function LoadUsers() {
  try {
    const response = await fetch("./BackEnd/feProcessing/getUsers.php", {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${
          response.status
        }, message: ${await response.text()}`
      );
    }
    const data = await response.json();
    // Переконуємось, що клас User доступний (він має бути глобальним з script.js)
    if (typeof User === "undefined") {
      console.error(
        "User class is not defined. Make sure script.js is loaded before messages.js and User class is global."
      );
      return [];
    }
    return data.map(
      (user) => new User(user.username, user.fname, user.lname, user.imageURL)
    );
  } catch (error) {
    console.error(
      "❌ Network error or JSON parsing error while loading users for chat:",
      error
    );
    // alert("❌ Error loading user list. Some chat features might not work correctly.");
    // Повертаємо порожній масив, щоб уникнути подальших помилок, але логуємо проблему
    return [];
  }
}

function CheckAndHideNotifIndicator() {
  // Знаходимо всі елементи чатів, які все ще мають позначку непрочитаних
  const unreadChats = chatListULElement.querySelectorAll(
    ".chat-item.has-unread"
  );

  const globalNotifIndicator = document.getElementById("notif-indicator"); // Отримуємо тут, якщо він глобальний

  if (globalNotifIndicator)
    if (unreadChats.length === 0) HideNotifIndicator();
    else ShowNotifIndicator();
  else console.warn("Global notification indicator element not found.");
}
