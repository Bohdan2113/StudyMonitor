<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="A site with students table" />

    <title>Messages</title>

    <link rel="stylesheet" href="CSS/general.css" />
    <link rel="stylesheet" href="CSS/header.css" />
    <link rel="stylesheet" href="CSS/nav.css" />
    <link rel="stylesheet" href="CSS/messages.css" />

    <script src="JS/cashe.js" defer></script>
    <script src="JS/components.js"></script>
    <link rel="manifest" href="manifest.json" />
  </head>

 <body>
    <div id="shadow-wraper">
      <header id="header-placeholder"></header>
      <nav id="nav-placeholder"></nav>


      <main class="messages-main-content">
        <!-- <h1 class="messages-title">Messages</h1> -->


        <div class="messages-layout">


          <!-- Ліва панель: Список чатів -->
          <aside class="chat-list-panel">
            <div class="chat-list-tabs">
              <button class="tab-button active" data-tab-target="chat-rooms-list" aria-selected="true">Chat rooms</button>
              <button class="tab-button" data-tab-target="new-chat-form" aria-selected="false">+ New chat room</button>
            </div>
            <!-- Контейнер для списку існуючих чатів -->
            <div id="chat-rooms-list" class="tab-content active">
              <ul class="chat-items-list">
                <!-- Сюди JavaScript буде додавати існуючі чати -->
              </ul>
            </div>


              <!-- Контейнер для форми створення нового чату (спочатку прихований) -->
            <div id="new-chat-form" class="tab-content">
              <div class="new-chat-form-content">
                  <p class="new-chat-form-title">Select members:</p>
                  <ul class="new-chat-members-list">
                      <!-- Сюди JavaScript буде додавати користувачів для вибору -->
                  </ul>
                  <div class="new-chat-name-input-container" style="display: none;">
                      <label for="new-chat-name">Chat Name:</label>
                      <input type="text" id="new-chat-name" name="new-chat-name" placeholder="Enter chat name">
                  </div>
                  <div class="new-chat-actions">
                      <button id="create-chat-button" class="action-button primary-button">Create Chat</button>
                      <button id="cancel-create-chat-button" class="action-button secondary-button">Cancel</button>
                  </div>
              </div>
            </div>
          </aside>


          <!-- Права панель: Вікно чату -->
          <section class="chat-window-panel">
            <!-- Блок-заповнювач, коли чат не обрано -->
            <div class="chat-window-placeholder">
              <p>Please select a chat to start messaging.</p>
            </div>


              <!-- Основний контент вікна чату (спочатку прихований) -->
            <div class="chat-window-content" style="display: none;">
              <header class="chat-window-header">
                <h2 class="chat-room-title">Chat name</h2>
                <div class="members-info">
                  <div class="member-icons-list">
                    <span class="member-icon user-icon-small"></span>
                  </div>
                  <span class="add-member-icon plus-icon"></span>
                </div>
              </header>


              <div class="messages-display-area">
                <!-- <h3 class="messages-area-sub-title">Messages</h3>
               
                <div class="message-entry received-message">
                  <div class="avatar-column">
                    <span class="message-avatar user-icon-small">
                    </span>
                    <span class="message-sender-name">Admin</span>
                  </div>
                  <div class="message-content-column">
                    <div class="message-bubble">
                      Тут буде текст повідомлення від Admin
                    </div>
                  </div>
                </div>


                <div class="message-entry sent-message">
                  <div class="avatar-column">
                    <span class="message-avatar user-icon-small">
                    </span>
                    <span class="message-sender-name">Me</span>
                  </div>
                  <div class="message-content-column">
                    <div class="message-bubble">
                      Тут буде текст повідомлення від Me
                    </div>
                  </div>
                </div> -->
              </div>


              <footer class="message-input-container">
                <input type="text" class="message-input-field" placeholder="" aria-label="Message input"/>
                <button class="send-message-button" aria-label="Send message">
                  <span class="send-icon"></span>
                </button>
              </footer>
           
            </div>
          </section>
        </div>
      </main>
    </div>


    <script src="JS/script.js" defer></script>
    <script src="JS/messages.js" defer></script>
  </body>

</html>


