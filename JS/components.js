class User {
  constructor(username, fname, lname, imageURL = null) {
    this.username = username;
    this.fname = fname;
    this.lname = lname;
    this.imageURL = imageURL;
  }

  get name() {
    return `${this.fname} ${this.lname}`;
  }

  getAvatarUrl() {
    if (this.imageURL && this.imageURL.trim() !== "") {
      return this.imageURL;
    }
    // Більш сучасний SVG плейсхолдер
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%237f8c8d'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E`;
  }
}
let currentUser = null;
document.addEventListener("DOMContentLoaded", async () => {
  // Профіль інфо
  const profileInfo = JSON.parse(localStorage.getItem("profileInfo"));
  currentUser = new User(
    profileInfo.username,
    profileInfo.fname,
    profileInfo.lname,
    profileInfo.imageURL
  );

  try {
    await includeHTML("./Components/header.php", "header-placeholder");
    await includeHTML("./Components/nav.php", "nav-placeholder");
  } catch (error) {
    console.error(error);
  }

  // Active page
  UpdateActivePage();

  // індикатор повідомлень
  RestoreNotifIndicator();

  const profileModal = document.getElementById("profile-modal");
  const profileLinks = document.querySelectorAll('a[aria-label="Profile"]'); // Знаходимо всі посилання "Profile"
  const closeModalButton = profileModal.querySelector(".modal-close-button");
  const cancelProfileEditButton = profileModal.querySelector(
    "#cancel-profile-edit"
  );
  const profileEditForm = document.getElementById("profile-edit-form");

  const profileFnameInput = document.getElementById("profile-fname");
  const profileLnameInput = document.getElementById("profile-lname");
  const profileUsernameInput = document.getElementById("profile-username");
  const profileAvatarPreview = document.getElementById(
    "profile-avatar-preview"
  );
  const profileAvatarUploadInput = document.getElementById(
    "profile-avatar-upload"
  );

  let newAvatarFile = null; // Для зберігання обраного файлу аватара
  UpdateProfileHeader(currentUser);

  function openProfileModal() {
    if (!currentUser) {
      console.error("Current user data not found!");
      alert("Could not load profile data.");
      return;
    }

    // Заповнюємо форму поточними даними користувача
    profileFnameInput.value = currentUser.fname || "";
    profileLnameInput.value = currentUser.lname || "";
    profileUsernameInput.value = currentUser.username;
    profileAvatarPreview.src = currentUser.getAvatarUrl(); // Використовуємо метод класу User
    console.log(currentUser);

    newAvatarFile = null; // Скидаємо обраний файл при відкритті
    profileAvatarUploadInput.value = null; // Скидаємо значення інпуту файлу

    profileModal.style.display = "flex"; // Показуємо оверлей
    setTimeout(() => {
      // Для анімації появи
      profileModal.classList.add("active");
      // ChangeBackgroundDisplay(document.getElementById("shadow-wraper"));
    }, 10);
  }

  function closeProfileModal() {
    profileModal.classList.remove("active");
    // ChangeBackgroundDisplay(document.getElementById("shadow-wraper"));
    setTimeout(() => {
      // Чекаємо завершення анімації перед тим, як сховати
      profileModal.style.display = "none";
    }, 300); // Час має відповідати transition-duration в CSS
  }

  // Додаємо обробник до кожного посилання "Profile"
  profileLinks.forEach((profileLink) => {
    profileLink.addEventListener("click", (event) => {
      event.preventDefault(); // Запобігаємо переходу за посиланням
      openProfileModal();
    });
  });

  if (closeModalButton) {
    closeModalButton.addEventListener("click", closeProfileModal);
  }
  if (cancelProfileEditButton) {
    cancelProfileEditButton.addEventListener("click", closeProfileModal);
  }

  // Закриття модального вікна при кліку на оверлей (поза контентом)
  profileModal.addEventListener("click", (event) => {
    if (event.target === profileModal) {
      closeProfileModal();
    }
  });

  // Обробка вибору файлу аватара
  profileAvatarUploadInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      newAvatarFile = file; // Зберігаємо файл
      const reader = new FileReader();
      reader.onload = (e) => {
        profileAvatarPreview.src = e.target.result; // Показуємо прев'ю
      };
      reader.readAsDataURL(file);
    }
  });

  // Обробка відправки форми
  profileEditForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Запобігаємо стандартній відправці форми

    if (!currentUser) {
      alert("Error: Current user not defined.");
      return;
    }

    // Оновлюємо дані об'єкта currentUser
    currentUser.fname = profileFnameInput.value.trim();
    currentUser.lname = profileLnameInput.value.trim();
    // currentUser.username не змінюємо, бо він readonly

    // Логіка завантаження/оновлення аватара
    if (newAvatarFile) {
      // Тут має бути ваша логіка завантаження файлу newAvatarFile на сервер
      // Після успішного завантаження сервер повинен повернути новий URL аватара
      // Наприклад:
      await uploadAvatarToServer(newAvatarFile)
        .then((newImageUrl) => {
          currentUser.imageURL = newImageUrl;
          console.log("Profile updated with new avatar:", currentUser);
          // Оновити відображення аватара в інших місцях (хедер, список чатів), якщо потрібно
          UpdateProfileGlobally(currentUser);
        })
        .catch((error) => {
          console.error("Avatar upload failed:", error);
          alert("Failed to upload new avatar.");
        });
      console.log("Profile data updated:", currentUser);
    }

    closeProfileModal();
  });
});

function includeHTML(file, elementId) {
  return new Promise((resolve, reject) => {
    fetch(file)
      .then((response) => response.text())
      .then((data) => {
        document.getElementById(elementId).innerHTML = data;
        resolve(); // Завершити Promise після завантаження
      })
      .catch((error) => reject(`Error loading ${file}: ${error}`));
  });
}
function UpdateActivePage() {
  let activePath = window.location.href;
  activePath = activePath.split("/").pop();
  activePath = "./" + activePath;
  if (activePath) {
    let activeLink = document.querySelector(`.nav-item[href='${activePath}']`);
    if (activeLink) {
      removeActiveLink();
      activeLink.classList.add("active");
    }
  }
  console.log("Cur page: " + activePath);
}
function RestoreNotifIndicator() {
  const notifIndicator = document.getElementById("notif-indicator");
  if (notifIndicator) {
    // Відновлюємо стан індикатора з localStorage
    const isHidden = localStorage.getItem("notifHidden");
    if (isHidden === "true") notifIndicator.style.display = "none";
    else notifIndicator.style.display = "block";
  }
}
function removeActiveLink() {
  document
    .querySelectorAll(".nav-item")
    .forEach((link) => link.classList.remove("active"));
  sessionStorage.removeItem("activeLink");
}
function ChangeBackgroundDisplay(blockId_str) {
  let shadowWraper = document.getElementById(blockId_str);

  if (shadowWraper.style.display === "flex") {
    shadowWraper.style.display = "none";
    // shadowWraper.style.pointerEvents = "none";
  } else {
    shadowWraper.style.display = "flex";
    // shadowWraper.style.pointerEvents = "auto";
  }
}

function UpdateProfileHeader(user) {
  $("#profile-name").textContent = user.name;
  $("#main-profile-img").src = user.imageURL;
}
async function UpdateProfileGlobally(user) {
  UpdateProfileHeader(user);
  localStorage.setItem("profileInfo", JSON.stringify(user));

  if (typeof renderChatList === "function") renderChatList();
  if (typeof updateChatWindow === "function" && currentActiveChatId)
    updateChatWindow(currentActiveChatId);

  await UpdateInfoToDB(user);
}
async function UpdateInfoToDB(user) {
  try {
    const response = await fetch("./BackEnd/feProcessing/updateUser.php", {
      method: "POST",
      body: JSON.stringify(user),
    });

    const result = await response.json();
    if (response.ok) {
      if (result.success) {
        console.log("✅ Updated successfully:", result.message);
        return true;
      }
    } else {
      if (result.field) {
        if (result.max) {
          ShowErrMessage(
            `${result.field}-erinput`,
            `Length must be less then ${result.max} characters`
          );
        } else if (result.error) {
          ShowErrMessage(`${result.field}-erinput`, result.error);
        }
      } else if (result.error) {
        console.log(result.error);
      }
      return false;
    }
  } catch (error) {
    console.error("❌ Network error:", error);
    alert("❌ Network error: check your internet connection");
    return false;
  }
}
async function uploadAvatarToServer(file) {
  const formData = new FormData();
  formData.append("avatarFile", file);

  try {
    const response = await fetch("./BackEnd/feProcessing/upload_avatar.php", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Server error: ${response.status} - ${
          errorText || "Unknown upload error"
        }`
      );
    }

    const data = await response.json(); // Очікуємо JSON відповідь від PHP

    if (data.success && data.imageURL) {
      return data.imageURL;
    } else {
      throw new Error(
        data.message ||
          "Server did not return a valid image URL or success status."
      );
    }
  } catch (error) {
    console.error("Error uploading avatar:", error);
    alert(`Upload failed: ${error.message}`);
    throw error;
  }
}
