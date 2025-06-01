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
      <img src="./Images/user.png" id="main-profile-img" alt="user" />
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

<div id="profile-modal" class="modal-overlay" style="display: none;">
  <div class="modal-content profile-modal-content">
    <button class="modal-close-button" aria-label="Close profile editor">×</button>
    <h2>Edit Profile</h2>
    
    <form id="profile-edit-form">
      <div class="profile-avatar-section">
        <img id="profile-avatar-preview" src="" alt="Current Avatar" class="profile-avatar-img">
        <label for="profile-avatar-upload" class="avatar-upload-label">
          <span>Change Photo</span>
          <input type="file" id="profile-avatar-upload" name="profileAvatar" accept="image/png, image/jpeg, image/gif">
        </label>
      </div>

      <div class="form-group">
        <label for="profile-fname">First Name</label>
        <input type="text" id="profile-fname" name="profileFname" required>
      </div>

      <div class="form-group">
        <label for="profile-lname">Last Name</label>
        <input type="text" id="profile-lname" name="profileLname" required>
      </div>

      <div class="form-group">
        <label for="profile-username">Username</label>
        <input type="text" id="profile-username" name="profileUsername" readonly disabled> 
        <!-- readonly і disabled, щоб не можна було змінити і не відправлялось з формою -->
      </div>
      
      <div class="profile-modal-actions">
        <button type="submit" class="button-primary">Save Changes</button>
        <button type="button" class="button-secondary" id="cancel-profile-edit">Cancel</button>
      </div>
    </form>
  </div>
</div>
