class Chat {
  constructor(
    id,
    memberIds,
    type,
    name,
    initialMessages = [],
    createdBy = "",
    createdAt = new Date(),
    lastActivity = new Date(),
    hasUnread = false // <--- НОВЕ ПОЛЕ
  ) {
    this.id = id;
    this._name = name;
    this.memberIds = Array.isArray(memberIds) ? memberIds : [];
    this.type = type;
    this.messages = initialMessages;
    this.createdBy = createdBy;
    this.createdAt = new Date(createdAt);
    this.lastActivity = new Date(lastActivity);
    this.hasUnread = hasUnread; // <--- ІНІЦІАЛІЗАЦІЯ ПОЛЯ
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
      return this._name || "Direct Chat";
    }
    if (!this._name) {
      let chatName = this.memberIds
        .map(
          (username) => signedUsers.find((u) => u.username === username)?.fname
        )
        .filter((name) => name)
        .slice(0, 2)
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
    return this._name;
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
    return Chat.defaultGroupAvatarUrl();
  }

  static defaultGroupAvatarUrl() {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%239e9e9e' stroke-width='1.5'%3E%3Ccircle cx='12' cy='12' r='3'%3E%3C/circle%3E%3Ccircle cx='17' cy='8' r='2.5'%3E%3C/circle%3E%3Ccircle cx='7' cy='8' r='2.5'%3E%3C/circle%3E%3Cpath d='M12 15c-1.82-.31-3.53.11-5 .95M12 15c1.82-.31 3.53.11 5 .95M17 10.5c-.21 1.11-.8 2.14-1.63 2.95M7 10.5c.21 1.11.8 2.14 1.63 2.95'%3E%3C/path%3E%3C/svg%3E`;
  }

  addMessage(messageObject) {
    this.messages.push(messageObject);
    this.lastActivity = new Date(messageObject.timestamp);
  }
}

// Елементи DOM (без змін)
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

let chatsData = [];
let signedUsers = [];
let currentUserName;

let currentActiveChatId = null;
let selectedNewChatMembers = [];
let formMode = "new";
let chatBeingEdited = null;

let socket;
const NODE_JS_SERVER_HOST = window.location.hostname;
const NODE_JS_SERVER_PORT = 3001;

// --- WebSocket Logic ---
function connectWebSocket() {
  if (!currentUserName) {
    console.error(
      "WebSocket: currentUserName is not set. currentUser:",
      currentUser
    );
    return;
  }
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  socket = new WebSocket(
    `${wsProtocol}//${NODE_JS_SERVER_HOST}:${NODE_JS_SERVER_PORT}/`
  );

  socket.onopen = () => {
    console.log("WebSocket connected!");
    socket.send(
      JSON.stringify({ type: "register", username: currentUserName })
    );
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("CLIENT: Received from server:", data);

    switch (data.type) {
      case "error":
        alert(
          `Server error: ${data.message} ${
            data.details ? `(${data.details})` : ""
          }`
        );
        break;
      case "initialChatRooms":
        chatsData = data.rooms.map(
          (roomData) =>
            new Chat( // Використовуємо roomData, яке містить chatRoom та hasUnreadMessages
              roomData.chatRoom._id,
              roomData.chatRoom.members,
              roomData.chatRoom.type,
              roomData.chatRoom.name,
              [],
              roomData.chatRoom.createdBy,
              new Date(roomData.chatRoom.createdAt),
              new Date(roomData.chatRoom.lastActivity),
              roomData.hasUnreadMessages // Передаємо статус непрочитаності в конструктор
            )
        );
        renderChatList(); // renderChatList тепер має використовувати chat.hasUnread

        const lastActiveChatId = sessionStorage.getItem("lastActiveChatId");
        if (
          lastActiveChatId &&
          chatsData.find((c) => c.id === lastActiveChatId)
        ) {
          currentActiveChatId = lastActiveChatId;
          setActiveChat(currentActiveChatId, true); // true - завантажити повідомлення
        } else if (
          currentActiveChatId &&
          chatsData.find((c) => c.id === currentActiveChatId)
        ) {
          setActiveChat(currentActiveChatId, true);
        } else {
          updateChatWindow(null);
        }
        CheckAndHideNotifIndicator();
        break;

      case "newChatCreated": {
        const newChatFromServer = data.chat;
        if (!chatsData.some((c) => c.id === newChatFromServer._id)) {
          const newChat = new Chat(
            newChatFromServer._id,
            newChatFromServer.members,
            newChatFromServer.type,
            newChatFromServer.name,
            [],
            newChatFromServer.createdBy,
            new Date(newChatFromServer.createdAt),
            new Date(newChatFromServer.lastActivity),
            newChatFromServer.hasUnreadMessages // Сервер надсилає hasUnreadMessages: false для ініціатора
          );
          chatsData.push(newChat);
          renderChatList();
          if (newChatFromServer.createdBy === currentUserName) {
            switchToTab("chat-rooms-list");
            setActiveChat(newChat.id);
          } else {
            // Інший учасник, якого додали
            if (newChat.hasUnread) ShowNotifIndicator(); // Якщо сервер позначив як непрочитаний для цього користувача
          }
        }
        break;
      }
      case "chatCreationFailed":
        alert(data.message);
        if (data.existingChat) {
          switchToTab("chat-rooms-list");
          setActiveChat(data.existingChat._id);
        }
        break;

      case "chatUpdated": {
        // Сервер надсилає оновлений чат з полем hasUnreadMessages
        const updatedChatData = data.chat;
        const chatIndex = chatsData.findIndex(
          (c) => c.id === updatedChatData._id
        );

        if (chatIndex > -1) {
          const oldChatInstance = chatsData[chatIndex];
          const isStillMember =
            updatedChatData.members.includes(currentUserName);

          if (!isStillMember) {
            chatsData.splice(chatIndex, 1);
            if (currentActiveChatId === updatedChatData._id) {
              currentActiveChatId = null;
              sessionStorage.removeItem("lastActiveChatId");
              updateChatWindow(null);
            }
          } else {
            chatsData[chatIndex] = new Chat(
              updatedChatData._id,
              updatedChatData.members,
              updatedChatData.type,
              updatedChatData.name,
              oldChatInstance.messages, // Зберігаємо старі повідомлення
              updatedChatData.createdBy,
              new Date(updatedChatData.createdAt),
              new Date(updatedChatData.lastActivity),
              updatedChatData.hasUnreadMessages // Використовуємо статус з сервера
            );
            if (updatedChatData.hasUnreadMessages) ShowNotifIndicator();

            if (currentActiveChatId === updatedChatData._id) {
              updateChatWindow(currentActiveChatId);
            }
          }
          renderChatList();
        } else if (updatedChatData.members.includes(currentUserName)) {
          // Чату не було, але користувача додали
          const newChat = new Chat(
            updatedChatData._id,
            updatedChatData.members,
            updatedChatData.type,
            updatedChatData.name,
            [],
            updatedChatData.createdBy,
            new Date(updatedChatData.createdAt),
            new Date(updatedChatData.lastActivity),
            updatedChatData.hasUnreadMessages
          );
          chatsData.push(newChat);
          renderChatList();
          if (updatedChatData.hasUnreadMessages) ShowNotifIndicator();
        }
        CheckAndHideNotifIndicator();
        break;
      }
      case "chatRemoved": {
        const { chatId } = data;
        const chatIndex = chatsData.findIndex((c) => c.id === chatId);
        if (chatIndex > -1) {
          chatsData.splice(chatIndex, 1);
          renderChatList();
          if (currentActiveChatId === chatId) {
            currentActiveChatId = null;
            sessionStorage.removeItem("lastActiveChatId");
            updateChatWindow(null);
          }
          CheckAndHideNotifIndicator();
        }
        break;
      }
      case "newMessage": {
        const { message: newMessageData, chatId: targetChatId } = data;
        const chat = chatsData.find((c) => c.id === targetChatId);
        if (chat) {
          chat.addMessage(newMessageData);
          chat.lastActivity = new Date(newMessageData.timestamp);

          if (currentActiveChatId === targetChatId) {
            displayMessage(newMessageData, chat);
            if (socket && socket.readyState === WebSocket.OPEN) {
              socket.send(
                JSON.stringify({
                  type: "markChatAsRead",
                  payload: { chatId: targetChatId },
                })
              );
            }
            chat.hasUnread = false; // Ми щойно прочитали
          } else {
            if (newMessageData.senderUsername !== currentUserName) {
              chat.hasUnread = true; // Позначаємо непрочитаним локально
              ShowNotifIndicator();
            }
          }
          renderChatList(); // Оновити список
        }
        break;
      }
      case "messagesHistory": {
        const chat = chatsData.find((c) => c.id === data.chatId);
        if (chat) {
          chat.messages = data.messages;
          renderMessagesForActiveChat();

          chat.hasUnread = false; // Позначили як прочитаний, коли завантажили історію
          if (socket && socket.readyState === WebSocket.OPEN) {
            // Повідомляємо сервер
            socket.send(
              JSON.stringify({
                type: "markChatAsRead",
                payload: { chatId: data.chatId },
              })
            );
          }
          renderChatList(); // Оновити список, щоб зняти .has-unread візуально
          CheckAndHideNotifIndicator();
        }
        break;
      }
    }
  };

  socket.onclose = (event) => {
    console.log("WebSocket disconnected:", event.reason, event.code);
  };
  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    alert("WebSocket connection error.");
  };
}

// --- DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", async () => {
  if (!currentUser || !currentUser.username) {
    console.error("CRITICAL: currentUser is not available. Chat disabled.");
    const layout = document.querySelector(".messages-layout");
    if (layout)
      layout.innerHTML =
        '<div class="chat-window-placeholder" style="display:flex; width:100%;"><p>Error: User not authenticated. Cannot load chat.</p></div>';
    return;
  }
  currentUserName = currentUser.username;

  try {
    signedUsers = await LoadUsers();
    console.log("Signed users loaded for chat:", signedUsers);
  } catch (error) {
    console.error("Failed to load signed users for chat:", error);
  }

  connectWebSocket();

  // Обробники подій
  createChatButton.addEventListener("click", () => {
    if (formMode === "edit") handleSaveChanges();
    else handleCreateNewChat();
  });
  chatListULElement.addEventListener("click", (event) => {
    const clickedChatItem = event.target.closest(".chat-item");
    if (!clickedChatItem) return;
    const chatId = clickedChatItem.dataset.chatId;
    setActiveChat(chatId); // setActiveChat тепер сам обробляє has-unread і markChatAsRead
  });
  tabButtonsContainer.addEventListener("click", (event) => {
    const clickedButton = event.target.closest(".tab-button");
    if (clickedButton && !clickedButton.classList.contains("active"))
      switchToTab(clickedButton.dataset.tabTarget);
  });
  cancelCreateChatButton.addEventListener("click", () =>
    switchToTab("chat-rooms-list")
  );
  sendMessageButton.addEventListener("click", sendChatMessage);
  messageInputField.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendChatMessage();
    }
  });

  const lastActiveChatId = sessionStorage.getItem("lastActiveChatId");
  if (lastActiveChatId) currentActiveChatId = lastActiveChatId;

  switchToTab("chat-rooms-list");
  updateChatWindow(currentActiveChatId);

  setTimeout(CheckAndHideNotifIndicator, 700); // Невеликий таймаут, щоб дати чатам завантажитися і відрендеритися
});

// --- Функції для управління чатами (UI) ---
function setActiveChat(chatId, fetchMsgs = true) {
  const previouslyActive = chatListULElement.querySelector(
    ".chat-item.active-chat"
  );
  if (previouslyActive) previouslyActive.classList.remove("active-chat");

  const chat = chatsData.find((c) => c.id === chatId);
  const newActiveChatItem = chatListULElement.querySelector(
    `.chat-item[data-chat-id="${chatId}"]`
  );

  if (newActiveChatItem && chat) {
    newActiveChatItem.classList.add("active-chat");
    if (chat.hasUnread) {
      chat.hasUnread = false; // Оновлюємо локальний стан
      newActiveChatItem.classList.remove("has-unread"); // Знімаємо візуально
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
  sessionStorage.setItem("lastActiveChatId", chatId);
  updateChatWindow(chatId);

  if (fetchMsgs && socket && socket.readyState === WebSocket.OPEN) {
    if (chat) {
      socket.send(
        JSON.stringify({ type: "fetchMessages", payload: { chatId: chatId } })
      );
    } else {
      console.warn(
        `setActiveChat: Chat with ID ${chatId} not found in local chatsData.`
      );
    }
  }
  CheckAndHideNotifIndicator();
}
function renderNewChatMembersList() {
  if (!signedUsers || signedUsers.length === 0) {
    newChatMembersListULElement.innerHTML = `<div class="chat-window-placeholder" style="padding: 10px; text-align:center;"><p>Loading users or no other users available.</p></div>`;
    if (
      signedUsers &&
      signedUsers.length === 1 &&
      signedUsers[0].username === currentUserName
    ) {
      newChatMembersListULElement.innerHTML = `<div class="chat-window-placeholder" style="padding: 10px; text-align:center;"><p>You are the only user on this platform.</p></div>`;
    }
    updateNewChatNameInputVisibility();
    return;
  }
  newChatMembersListULElement.innerHTML = "";
  const otherUsers = signedUsers.filter(
    (user) => user.username !== currentUserName
  );
  if (otherUsers.length === 0) {
    newChatMembersListULElement.innerHTML = `<div class="chat-window-placeholder" style="padding: 10px; text-align:center;"><p>No other users to create a chat with.</p></div>`;
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
    checkbox.id = `user-sel-${user.username}`;
    checkbox.value = user.username;
    checkbox.checked = selectedNewChatMembers.includes(user.username);
    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.textContent = user.name;
    li.addEventListener("click", (event) => {
      if (event.target.type !== "checkbox" && event.target.tagName !== "LABEL")
        checkbox.checked = !checkbox.checked;
      handleMemberSelection(checkbox, user.username);
    });
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
    if (!selectedNewChatMembers.includes(userId))
      selectedNewChatMembers.push(userId);
  } else
    selectedNewChatMembers = selectedNewChatMembers.filter(
      (username) => username !== userId
    );
  updateNewChatNameInputVisibility();
}
function updateNewChatNameInputVisibility() {
  if (
    selectedNewChatMembers.length > 1 ||
    (formMode === "edit" && chatBeingEdited && chatBeingEdited.type === "group")
  )
    newChatNameInputContainer.style.display = "flex";
  else {
    newChatNameInputContainer.style.display = "none";
    if (formMode === "new") newChatNameInput.value = "";
  }
}
function resetNewChatForm() {
  selectedNewChatMembers = [];
  newChatNameInput.value = "";
  const formIsVisible =
    newChatFormContainer.style.display === "flex" ||
    newChatFormContainer.style.display === "block";
  if (
    formIsVisible &&
    newChatFormTabButton &&
    newChatFormTabButton.classList.contains("active")
  )
    renderNewChatMembersList();
  updateNewChatNameInputVisibility();
}
function switchToTab(targetTabId) {
  tabButtons.forEach((button) => {
    const tabId = button.dataset.tabTarget;
    const contentElement = document.getElementById(tabId);
    if (tabId === targetTabId) {
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");
      if (contentElement) contentElement.style.display = "flex";
    } else {
      button.classList.remove("active");
      button.setAttribute("aria-selected", "false");
      if (contentElement) contentElement.style.display = "none";
    }
  });
  if (targetTabId === "new-chat-form") {
    if (formMode === "edit" && chatBeingEdited) {
      if (newChatFormTabButton)
        newChatFormTabButton.textContent = "Edit chat room";
      createChatButton.textContent = "Save Changes";
      populateFormForEditing();
    } else {
      formMode = "new";
      chatBeingEdited = null;
      if (newChatFormTabButton)
        newChatFormTabButton.textContent = "+ New chat room";
      createChatButton.textContent = "Create Chat";
      resetNewChatForm();
      renderNewChatMembersList();
      updateNewChatNameInputVisibility();
    }
  } else if (targetTabId === "chat-rooms-list") {
    formMode = "new";
    chatBeingEdited = null;
    if (newChatFormTabButton)
      newChatFormTabButton.textContent = "+ New chat room";
    createChatButton.textContent = "Create Chat";
    resetNewChatForm();
  }
}
function handleEditChatHeaderClick(event) {
  const headerElement = event.currentTarget;
  const chatIdToEdit = headerElement.dataset.chatIdForEdit;
  if (!chatIdToEdit) return;
  const chat = chatsData.find((c) => c.id === chatIdToEdit);
  if (chat && chat.type === "group") {
    formMode = "edit";
    chatBeingEdited = chat;
    switchToTab("new-chat-form");
  }
}
function populateFormForEditing() {
  if (!chatBeingEdited) return;
  selectedNewChatMembers = chatBeingEdited.memberIds.filter(
    (username) => username !== currentUserName
  );
  newChatNameInput.value = chatBeingEdited._name || "";
  renderNewChatMembersList();
  updateNewChatNameInputVisibility();
}
function handleCreateNewChat() {
  if (selectedNewChatMembers.length === 0) {
    alert("Please select at least one member for the chat.");
    return;
  }
  const chatType = selectedNewChatMembers.length === 1 ? "direct" : "group";
  let chatName = "";
  if (chatType === "group") chatName = newChatNameInput.value.trim();
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "createChat",
        payload: {
          memberUsernames: selectedNewChatMembers,
          chatName: chatName,
          type: chatType,
        },
      })
    );
  } else alert("Not connected to chat server. Please try again.");
}
function handleSaveChanges() {
  if (!chatBeingEdited) return;
  const updatedName = newChatNameInput.value.trim();
  if (chatBeingEdited.type === "group" && selectedNewChatMembers.length === 0) {
    alert("A group chat must have at least one other member besides yourself.");
    return;
  }
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "editChat",
        payload: {
          chatId: chatBeingEdited.id,
          newName: updatedName,
          newMemberUsernames: selectedNewChatMembers,
        },
      })
    );
  } else alert("Not connected to chat server. Please try again.");
}

// --- Функції для рендерингу списку чатів та вікна чату
function createChatItemElement(chatInstance) {
  const listItem = document.createElement("li");
  listItem.classList.add("chat-item");
  listItem.dataset.chatId = chatInstance.id;
  if (chatInstance.hasUnread) {
    // Використовуємо поле об'єкта
    listItem.classList.add("has-unread");
  }

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
  chatsData.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  chatListULElement.innerHTML = "";
  if (chatsData.length < 1) {
    chatListULElement.innerHTML = `<div class="chat-window-placeholder" style="padding: 10px; text-align:center;"><p>You have no chats yet. <br>Create one using the '+ New chat room' tab.</p></div>`;
    CheckAndHideNotifIndicator();
    return;
  }
  chatsData.forEach((chat) => {
    const chatElement = createChatItemElement(chat);
    if (chat.id === currentActiveChatId) {
      chatElement.classList.add("active-chat");
    }
    chatListULElement.appendChild(chatElement);
  });
  CheckAndHideNotifIndicator();
}
function updateChatWindow(chatId) {
  const selectedChat = chatsData.find((chat) => chat.id === chatId);
  const membersInfoDiv = chatWindowContent.querySelector(".members-info");
  const memberIconsListDiv = membersInfoDiv.querySelector(".member-icons-list");
  const addMemberIconSpan = membersInfoDiv.querySelector(".add-member-icon");
  chatWindowHeader.removeEventListener("click", handleEditChatHeaderClick);
  chatWindowHeader.classList.remove("clickable-header");
  delete chatWindowHeader.dataset.chatIdForEdit;

  if (selectedChat) {
    chatWindowPlaceholder.style.display = "none";
    chatWindowContent.style.display = "flex";
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
    memberIconsListDiv.innerHTML = "";
    if (selectedChat.type === "direct") {
      membersInfoDiv.style.display = "flex";
      addMemberIconSpan.style.display = "none";
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
      chatWindowHeader.classList.add("clickable-header");
      chatWindowHeader.dataset.chatIdForEdit = selectedChat.id;
      chatWindowHeader.addEventListener("click", handleEditChatHeaderClick);
      membersInfoDiv.style.display = "flex";
      addMemberIconSpan.style.display = "flex";
      const memberIdsInGroup = selectedChat.memberIds;
      const maxAvatarsToShow = 3;
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
        ellipsisSpan.classList.add("ellipsis-icon");
        ellipsisSpan.textContent = "...";
        ellipsisSpan.title = `${
          memberIdsInGroup.length - maxAvatarsToShow
        } more member(s)`;
        memberIconsListDiv.appendChild(ellipsisSpan);
      }
    } else membersInfoDiv.style.display = "none";
    renderMessagesForActiveChat();
  } else {
    chatWindowPlaceholder.style.display = "flex";
    chatWindowContent.style.display = "none";
    chatRoomTitleElement.textContent = "";
    messageInputField.placeholder = "Select a chat to start messaging";
    messageInputField.disabled = true;
    sendMessageButton.disabled = true;
    membersInfoDiv.style.display = "none";
  }
}
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
        payload: { chatId: currentActiveChatId, contentText: contentText },
      })
    );
    messageInputField.value = "";
    messageInputField.focus();
  } else if (!currentActiveChatId) alert("Please select a chat first.");
  else if (!socket || socket.readyState !== WebSocket.OPEN)
    alert("Not connected to chat server. Please try again.");
}
function renderMessagesForActiveChat() {
  messagesDisplayArea.innerHTML = `<h3 class="messages-area-sub-title">Messages</h3>`;
  const activeChat = chatsData.find((c) => c.id === currentActiveChatId);
  if (activeChat && activeChat.messages && activeChat.messages.length > 0) {
    activeChat.messages.forEach((msgObj) => displayMessage(msgObj, activeChat));
    messagesDisplayArea.scrollTop = messagesDisplayArea.scrollHeight;
  } else if (activeChat) {
    messagesDisplayArea.innerHTML += `<div class="chat-window-placeholder" style="padding: 20px; text-align:center; flex-grow: 1; display:flex; align-items:center; justify-content:center;"><p>No messages yet in this chat. Be the first to write!</p></div>`;
  } else if (!activeChat && currentActiveChatId) {
    messagesDisplayArea.innerHTML += `<div class="chat-window-placeholder" style="padding: 20px; text-align:center; flex-grow: 1; display:flex; align-items:center; justify-content:center;"><p>Loading messages...</p></div>`;
  }
}
function displayMessage(messageObject, chatContext) {
  const messageEntry = document.createElement("div");
  messageEntry.classList.add("message-entry");
  const sender = signedUsers.find(
    (u) => u.username === messageObject.senderUsername
  );
  const senderName = sender ? sender.fname : messageObject.senderUsername;
  const avatarColumn = document.createElement("div");
  avatarColumn.classList.add("avatar-column");
  const messageAvatar = document.createElement("img");
  messageAvatar.classList.add("message-avatar", "user-icon-small");
  messageAvatar.src = sender
    ? sender.getAvatarUrl()
    : Chat.defaultGroupAvatarUrl();
  messageAvatar.alt = senderName;
  const messageSenderNameSpan = document.createElement("span");
  messageSenderNameSpan.classList.add("message-sender-name");
  messageSenderNameSpan.textContent = senderName;
  avatarColumn.appendChild(messageAvatar);
  avatarColumn.appendChild(messageSenderNameSpan);
  const messageContentColumn = document.createElement("div");
  messageContentColumn.classList.add("message-content-column");
  const messageBubble = document.createElement("div");
  messageBubble.classList.add("message-bubble");
  messageBubble.textContent = messageObject.content;
  const messageTimestamp = document.createElement("span");
  messageTimestamp.classList.add("message-timestamp");
  messageTimestamp.textContent = new Date(
    messageObject.timestamp
  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  messageBubble.appendChild(messageTimestamp);
  messageContentColumn.appendChild(messageBubble);
  messageEntry.appendChild(avatarColumn);
  messageEntry.appendChild(messageContentColumn);
  if (messageObject.senderUsername === currentUserName)
    messageEntry.classList.add("sent-message");
  else messageEntry.classList.add("received-message");
  messagesDisplayArea.appendChild(messageEntry);
  messagesDisplayArea.scrollTo({
    top: messagesDisplayArea.scrollHeight,
    behavior: "smooth",
  });
}

// --- Індикатор нотифікацій ---
function CheckAndHideNotifIndicator() {
  if (!chatListULElement) {
    console.warn("CheckAndHideNotifIndicator: chatListULElement not found.");
    return;
  }
  // Перевіряємо стан hasUnread в об'єктах Chat, а не тільки клас в DOM
  const hasAnyUnread = chatsData.some((chat) => chat.hasUnread);
  if (hasAnyUnread) ShowNotifIndicator();
  else HideNotifIndicator();
}

async function LoadUsers() {
  try {
    const response = await fetch("./BackEnd/feProcessing/getUsers.php", {
      method: "POST",
    });
    if (!response.ok)
      throw new Error(
        `HTTP error! status: ${
          response.status
        }, message: ${await response.text()}`
      );
    const data = await response.json();
    if (typeof User === "undefined") {
      console.error("User class is not defined.");
      return [];
    }
    return data.map(
      (user) => new User(user.username, user.fname, user.lname, user.imageURL)
    );
  } catch (error) {
    console.error("❌ Error loading users for chat:", error);
    return [];
  }
}
