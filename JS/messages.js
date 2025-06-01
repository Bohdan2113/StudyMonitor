class Chat {
  constructor(id, memberIds, type, name, initialMessages = []) {
    this.id = id;
    this._name = name; // Приватна властивість для назви, щоб геттер міг бути розумнішим
    this.memberIds = Array.isArray(memberIds) ? memberIds : []; // Масив ID учасників
    this.type = type; // 'direct' або 'group'
    this.messages = initialMessages; // Масив повідомлень
    this.createdAt = new Date(); // Дата створення чату
    this.lastActivity = new Date(); // Для сортування, оновлюється при новому повідомленні
  }

  getDisplayName(allUsers, currentUserName) {
    if (this.type === "direct") {
      const otherMemberId = this.memberIds.find(
        (username) => username !== currentUserName
      );
      if (otherMemberId) {
        const otherUser = allUsers.find(
          (user) => user.username === otherMemberId
        );
        return otherUser ? otherUser.name : "Unknown User";
      }
      return this._name || "Direct Chat"; // Запасний варіант
    }

    if (!this._name) {
      let chatName = this.memberIds
        .map(
          (username) => signedUsers.find((u) => u.username === username)?.fname
        )
        .filter((name) => name)
        .slice(0, 2) // Імена перших двох + поточний
        .join(", ");
      if (!chatName || this.memberIds.length > 2) chatName += " & others";
      if (!chatName) chatName = "New Group";
      return chatName || "Group Chat"; // Для групових чатів
    } else return this._name;
  }

  getChatAvatarUrl(allUsers, currentUserName) {
    if (this.type === "direct") {
      const otherMemberId = this.memberIds.find(
        (username) => username !== currentUserName
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

  // Статичний метод для отримання URL групового аватара за замовчуванням
  static defaultGroupAvatarUrl() {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%239e9e9e' stroke-width='1.5'%3E%3Ccircle cx='12' cy='12' r='3'%3E%3C/circle%3E%3Ccircle cx='17' cy='8' r='2.5'%3E%3C/circle%3E%3Ccircle cx='7' cy='8' r='2.5'%3E%3C/circle%3E%3Cpath d='M12 15c-1.82-.31-3.53.11-5 .95M12 15c1.82-.31 3.53.11 5 .95M17 10.5c-.21 1.11-.8 2.14-1.63 2.95M7 10.5c.21 1.11.8 2.14 1.63 2.95'%3E%3C/path%3E%3C/svg%3E`;
  }

  addMessage(message) {
    this.messages.push(message);
    this.lastActivity = new Date();
  }
}

// Елементи DOM для чатів
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
// Елементи DOM для вкладок та форми створення нового чату
const tabButtonsContainer = document.querySelector(".chat-list-tabs");
const tabButtons = tabButtonsContainer.querySelectorAll(".tab-button");
const chatRoomsListContainer = document.getElementById("chat-rooms-list");
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
let formMode = "new"; // 'new' або 'edit'
let chatBeingEdited = null; // Зберігатиме екземпляр Chat, що редагується

document.addEventListener("DOMContentLoaded", () => {
  signedUsers = [
    new User("admin_user_id", "Admin", "System", null),
    new User("ann_user_id", "Ann", "Smith", "./Images/helloKitty.png"),
    new User("john_user_id", "John", "Bond", null),
    new User("ivon_user_id", "Ivon", "Stan", "./Images/helloKitty.png"),
    currentUser,
  ];
  currentUserName = currentUser.username;
  // Перетворюємо початкові дані чатів на екземпляри класу Chat
  chatsData = [
    // Важливо: memberIds має містити ВСІХ учасників, включаючи currentUser
    new Chat(
      "chat_admin_direct",
      [currentUserName, "admin_user_id"],
      "direct",
      "Admin System"
    ),
    new Chat(
      "chat_ann_direct",
      [currentUserName, "ann_user_id"],
      "direct",
      "Ann Smith"
    ),
    new Chat(
      "chat_john_direct",
      [currentUserName, "john_user_id"],
      "direct",
      "John Bond"
    ),
    new Chat(
      "chat_ivon_direct",
      [currentUserName, "ivon_user_id"],
      "direct",
      "Ivon Stan"
    ),
    new Chat(
      "group_work_chat",
      [currentUserName, "ann_user_id", "admin_user_id"],
      "group",
      "Work Group"
    ),
  ];

  // --- Обробники подій ---
  // Обробник для головної кнопки форми додавання чатів
  createChatButton.addEventListener("click", () => {
    if (formMode === "edit") {
      handleSaveChanges();
    } else {
      // formMode === 'new'
      handleCreateNewChat();
    }
  });
  // Обробник кліку на список чатів
  chatListULElement.addEventListener("click", (event) => {
    const clickedChatItem = event.target.closest(".chat-item");
    if (!clickedChatItem) return;
    const chatId = clickedChatItem.dataset.chatId;
    if (currentActiveChatId !== chatId) {
      setActiveChat(chatId);
    }
  });
  // Обробник кліку на кнопки вкладок
  tabButtonsContainer.addEventListener("click", (event) => {
    const clickedButton = event.target.closest(".tab-button");
    if (clickedButton && !clickedButton.classList.contains("active")) {
      switchToTab(clickedButton.dataset.tabTarget);
    }
  });
  // Кнопка "Скасувати" у формі створення чату
  cancelCreateChatButton.addEventListener("click", () => {
    switchToTab("chat-rooms-list"); // Це вже викликає resetNewChatForm
  });

  // --- Початкова ініціалізація ---
  renderChatList();
  updateChatWindow(currentActiveChatId);
  switchToTab("chat-rooms-list");
});

// --- Функції для чатів ---

function setActiveChat(chatId) {
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
  }
  currentActiveChatId = chatId;
  updateChatWindow(chatId);
}

function renderNewChatMembersList() {
  newChatMembersListULElement.innerHTML = "";
  signedUsers.forEach((user) => {
    if (user.username === currentUserName) return;
    const li = document.createElement("li");
    li.dataset.userId = user.username;

    // Створення елемента для аватара
    const avatarImg = document.createElement("img");
    avatarImg.classList.add("new-chat-member-avatar");
    avatarImg.src = user.getAvatarUrl(); // Використовуємо метод для отримання URL
    avatarImg.alt = user.name; // Альтернативний текст - ім'я користувача

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `user-${user.username}`;
    checkbox.value = user.username;
    checkbox.checked = selectedNewChatMembers.includes(user.username);

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.textContent = user.name; // Використовуємо властивість name

    li.addEventListener("click", (event) => {
      if (
        event.target.type !== "checkbox" &&
        event.target !== checkbox &&
        event.target !== label
      ) {
        // Щоб клік по img теж працював
        checkbox.checked = !checkbox.checked;
      }
      handleMemberSelection(checkbox, user.username);
    });

    checkbox.addEventListener("change", () => {
      handleMemberSelection(checkbox, user.username);
    });

    li.appendChild(checkbox);
    li.appendChild(avatarImg); // Додаємо аватар
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
  if (selectedNewChatMembers.length > 1) {
    newChatNameInputContainer.style.display = "flex";
  } else {
    newChatNameInputContainer.style.display = "none";
    newChatNameInput.value = ""; // Очистити, якщо ховаємо
  }
}

function resetNewChatForm() {
  selectedNewChatMembers = [];
  newChatNameInput.value = "";
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
      // 'new' mode
      if (newChatFormTabButton)
        newChatFormTabButton.textContent = "+ New chat room";
      createChatButton.textContent = "Create Chat";
      resetNewChatForm(); // Очистити дані
      renderNewChatMembersList(); // Рендер з порожніми виборами
      updateNewChatNameInputVisibility();
    }
  } else if (targetTabId === "chat-rooms-list") {
    // При переході зі списку чатів завжди скидаємо режим редагування
    formMode = "new";
    chatBeingEdited = null;
    if (newChatFormTabButton)
      newChatFormTabButton.textContent = "+ New chat room";
    createChatButton.textContent = "Create Chat";
    resetNewChatForm(); // Очищаємо форму
    // renderNewChatMembersList() тут не потрібен, бо форма прихована
  }
}

function handleEditChatHeaderClick(event) {
  // // Переконуємось, що клік не по інтерактивному елементу всередині хедера (якщо такі є)
  // if (event.target.closest('.members-info')) {
  //     // Якщо клікнули на блок з учасниками, не відкриваємо редагування
  //     // Можливо, в майбутньому тут буде інша логіка (наприклад, показ повного списку учасників)
  //     return;
  // }

  const headerElement = event.currentTarget; // Це сам .chat-window-header
  const chatIdToEdit = headerElement.dataset.chatIdForEdit;

  if (!chatIdToEdit) return;

  const chat = chatsData.find((c) => c.id === chatIdToEdit);
  if (chat && chat.type === "group") {
    // Тільки групи можна редагувати таким чином
    formMode = "edit";
    chatBeingEdited = chat; // Зберігаємо екземпляр чату
    switchToTab("new-chat-form"); // Переходимо на вкладку форми
  }
}

function populateFormForEditing() {
  if (!chatBeingEdited) return;

  // Заповнюємо обраних учасників (всі, крім поточного користувача)
  selectedNewChatMembers = chatBeingEdited.memberIds.filter(
    (username) => username !== currentUserName
  );

  // Заповнюємо назву чату (використовуємо _name, щоб отримати збережену назву групи)
  newChatNameInput.value = chatBeingEdited._name || "";

  renderNewChatMembersList(); // Рендерить список з попередньо обраними
  updateNewChatNameInputVisibility(); // Показує/ховає поле імені
}

// Перейменуємо стару логіку кнопки "Створити чат" в окрему функцію
function handleCreateNewChat() {
  if (selectedNewChatMembers.length === 0) {
    alert("Please select at least one member for the chat.");
    return;
  }

  const newMemberIds = [...selectedNewChatMembers];
  const allMemberIdsForNewChat = [currentUserName, ...newMemberIds];
  const chatType = newMemberIds.length === 1 ? "direct" : "group";
  let chatName = "";

  if (chatType === "direct") {
    const otherUser = signedUsers.find(
      (user) => user.username === newMemberIds[0]
    );
    // Для direct чатів назва в конструкторі Chat може бути тимчасовою, getDisplayName її уточнить
    chatName = otherUser ? otherUser.name : "Direct Chat";

    const participantsKey = allMemberIdsForNewChat.slice().sort().join("-");
    const existingDirectChat = chatsData.find(
      (chat) =>
        chat.type === "direct" &&
        chat.memberIds.slice().sort().join("-") === participantsKey
    );
    if (existingDirectChat) {
      alert(
        `A chat with ${
          otherUser ? otherUser.name : "this user"
        } already exists.`
      );
      resetNewChatForm(); // resetNewChatForm зараз не викликає render
      renderNewChatMembersList(); // тому викликаємо явно
      updateNewChatNameInputVisibility();
      switchToTab("chat-rooms-list");
      setActiveChat(existingDirectChat.id);
      return;
    }
  } else {
    // group chat
    chatName = newChatNameInput.value.trim();
  }

  const newChatId = `chat_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 5)}`;
  const newChatInstance = new Chat(
    newChatId,
    allMemberIdsForNewChat,
    chatType,
    chatName
  );
  chatsData.push(newChatInstance);

  // Очищення і перехід
  const originalFormMode = formMode; // Зберігаємо, бо switchToTab може змінити
  resetNewChatForm();
  if (originalFormMode === "new") renderNewChatMembersList(); // Перемалювати список після очищення

  renderChatList();
  switchToTab("chat-rooms-list"); // Це скине formMode на 'new'
  setActiveChat(newChatInstance.id);
  console.log("New chat created:", newChatInstance);
}
function handleSaveChanges() {
  if (!chatBeingEdited) return;

  const updatedName = newChatNameInput.value.trim();
  // selectedNewChatMembers - це ID *інших* учасників
  const updatedMemberIds = [currentUserName, ...selectedNewChatMembers];

  if (chatBeingEdited.type === "group") {
    if (selectedNewChatMembers.length === 0) {
      // Група не може бути без інших учасників. Можна додати логіку видалення чату або заборонити.
      alert(
        "A group chat must have at least one other member besides yourself."
      );
      return;
    }
  }
  // Для direct чатів редагування учасників/імені зазвичай не передбачено таким чином.
  // Ця функція викликається тільки для груп, згідно з handleEditChatHeaderClick.

  // Оновлюємо дані існуючого чату
  if (updatedName) chatBeingEdited._name = updatedName; // Оновлюємо внутрішнє ім'я
  chatBeingEdited.memberIds = updatedMemberIds;
  chatBeingEdited.lastActivity = new Date(); // Позначаємо активність

  const idOfEditedChat = chatBeingEdited.id;

  // Скидаємо режим редагування ПЕРЕД переходом на іншу вкладку
  formMode = "new";
  chatBeingEdited = null;
  resetNewChatForm(); // Очистити дані форми
  // renderNewChatMembersList() тут не потрібен, бо переходимо на іншу вкладку

  renderChatList(); // Перемалювати список чатів з оновленими даними
  switchToTab("chat-rooms-list"); // Це оновить тексти кнопок і очистить форму
  setActiveChat(idOfEditedChat); // Зробити відредагований чат активним

  console.log(
    "Chat updated:",
    chatsData.find((c) => c.id === idOfEditedChat)
  );
}

function createChatItemElement(chatInstance) {
  // Тепер приймає екземпляр Chat
  const listItem = document.createElement("li");
  listItem.classList.add("chat-item");
  listItem.dataset.chatId = chatInstance.id;

  const iconContainer = document.createElement("span");
  iconContainer.classList.add("chat-item-icon");

  const avatarImg = document.createElement("img");
  avatarImg.classList.add("chat-item-avatar-img");
  // Використовуємо методи класу Chat
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
  chatsData.sort((a, b) => b.lastActivity - a.lastActivity);

  chatListULElement.innerHTML = "";
  chatsData.forEach((chat) => {
    // chat тут - це екземпляр Chat
    const chatElement = createChatItemElement(chat);
    if (chat.id === currentActiveChatId) {
      chatElement.classList.add("active-chat");
    }
    chatListULElement.appendChild(chatElement);
  });
}
function updateChatWindow(chatId) {
  const selectedChat = chatsData.find((chat) => chat.id === chatId); // selectedChat - екземпляр Chat

  // Отримуємо елементи для керування учасниками в заголовку
  const membersInfoDiv = chatWindowContent.querySelector(".members-info");
  const memberIconsListDiv = membersInfoDiv.querySelector(".member-icons-list");
  const addMemberIconSpan = membersInfoDiv.querySelector(".add-member-icon");

  // Завжди видаляємо попередній обробник перед додаванням нового
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

    // Очищаємо попередній список іконок учасників
    memberIconsListDiv.innerHTML = "";

    if (selectedChat.type === "direct") {
      membersInfoDiv.style.display = "flex"; // Показуємо блок .members-info
      addMemberIconSpan.style.display = "none"; // Ховаємо іконку "+"

      const otherMemberId = selectedChat.memberIds.find(
        (username) => username !== currentUserName
      );
      if (otherMemberId) {
        const otherUser = signedUsers.find((u) => u.username === otherMemberId);
        if (otherUser) {
          const avatarSpan = document.createElement("span");
          avatarSpan.classList.add("member-icon", "user-icon-small");
          // Встановлюємо фон або src для img, якщо використовуєте img
          avatarSpan.style.backgroundImage = `url("${otherUser.getAvatarUrl()}")`;
          avatarSpan.title = otherUser.name; // Для підказки
          memberIconsListDiv.appendChild(avatarSpan);
        }
      }
    } else if (selectedChat.type === "group") {
      // Робимо заголовок клікабельним для груп
      chatWindowHeader.classList.add("clickable-header");
      chatWindowHeader.dataset.chatIdForEdit = selectedChat.id; // Зберігаємо ID для обробника
      chatWindowHeader.addEventListener("click", handleEditChatHeaderClick);

      membersInfoDiv.style.display = "flex"; // Показуємо блок
      addMemberIconSpan.style.display = "flex"; // Показуємо "+" (переконайтеся, що flex або inline-flex для .add-member-icon)

      const otherMemberIdsInGroup = selectedChat.memberIds.filter(
        (username) => username !== currentUserName
      );
      const maxAvatarsToShow = 3;

      for (
        let i = 0;
        i < Math.min(otherMemberIdsInGroup.length, maxAvatarsToShow);
        i++
      ) {
        const memberId = otherMemberIdsInGroup[i];
        const member = signedUsers.find((u) => u.username === memberId);
        if (member) {
          const avatarSpan = document.createElement("span");
          avatarSpan.classList.add("member-icon", "user-icon-small");
          avatarSpan.style.backgroundImage = `url("${member.getAvatarUrl()}")`;
          avatarSpan.title = member.name;
          memberIconsListDiv.appendChild(avatarSpan);
        }
      }

      if (otherMemberIdsInGroup.length > maxAvatarsToShow) {
        const ellipsisSpan = document.createElement("span");
        ellipsisSpan.classList.add("ellipsis-icon"); // Використовуємо наш новий клас
        ellipsisSpan.textContent = "...";
        // Можна додати title, наприклад, "+ X more"
        ellipsisSpan.title = `${
          otherMemberIdsInGroup.length - maxAvatarsToShow
        } more member(s)`;
        memberIconsListDiv.appendChild(ellipsisSpan);
      }
    } else {
      // Якщо тип чату не визначений або не direct/group, ховаємо інформацію про учасників
      membersInfoDiv.style.display = "none";
    }

    // Логіка відображення повідомлень
    messagesDisplayArea.innerHTML = `
      <h3 class="messages-area-sub-title">Messages</h3>
      <p style="text-align:center; padding: 20px; color: #999;">
        Messages for ${selectedChat.getDisplayName(
          signedUsers,
          currentUserName
        )} would load here.
        <br>Total messages: ${selectedChat.messages.length}
      </p>`;
  } else {
    // Жоден чат не обрано
    chatWindowPlaceholder.style.display = "flex";
    chatWindowContent.style.display = "none";
    chatRoomTitleElement.textContent = "";
    membersInfoDiv.style.display = "none"; // Ховаємо інформацію про учасників
  }
}