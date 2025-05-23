<div id="header-holder">
  <a
    href="./students.php"
    class="text_edit clickable logo"
    aria-label="Main page"
  >
    <h1>CMS</h1>
  </a>
  <div class="headerItem">
    <div class="notif clickable notif-dropbtn">
      <a
        href="./messages.php"
        aria-label="Notifications"
        onclick="HideNotifIndicator(event)"
        oncontextmenu="ShowNotifIndicator()"
      >
        <img src="./Images/notification.svg" alt="notification" id="notif-img" />
        <span id="notif-indicator" id="notif-indicator"></span>
      </a>

      <div class="notif-dropdown-block">
        <ul>
          <li>
            <a href="#" class="clickable" aria-label="New message shortcut">
              <div class="sender-info">
                <img src="./Images/user.png" alt="User photo" />
                <p class="text_edit">Jhon D.</p>
              </div>
              <div class="message-oversee"></div>
            </a>
          </li>
          <li>
            <a href="#" class="clickable" aria-label="New message shortcut">
              <div class="sender-info">
                <img src="./Images/user.png" alt="User photo" />
                <p class="text_edit">Jhon D.</p>
              </div>
              <div class="message-oversee"></div>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div
      class="profile clickable profile-dropbtn"
      tabindex="0"
      ;
      aria-label="My account"
    >
      <img src="./Images/user.png" alt="user" />
      <span class="text_edit name" id="profile-name"></span>

      <div class="profile-dropdown-block">
        <a href="#" class="clickable" aria-label="Profile"
          ><p class="text_edit">Profile</p></a
        >
        <a href="#" class="clickable" aria-label="Log out" onclick="LogOutBut()"
          ><p class="text_edit">Log Out</p></a
        >
      </div>
    </div>
  </div>
</div>
