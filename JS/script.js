const $ = document.querySelector.bind(document);

// burger menu open and close
function burgerMenu() {
  let nav = document.querySelector("#nav-holder");
  let placeholder = document.querySelector("#nav-placeholder");

  if (nav.classList.contains("open")) {
    // Приховати меню
    nav.classList.remove("open");
    placeholder.classList.remove("open");
  } else {
    // Показати меню
    nav.classList.add("open");
    placeholder.classList.add("open");
  }
}
// Close menu when resizing window
window.addEventListener("resize", function () {
  let nav = document.querySelector("#nav-holder");
  let placeholder = document.querySelector("#nav-placeholder");

  if (!nav) return;

  if (window.innerWidth > 948) {
    // Якщо ширина екрану більша за 948px, то меню повинно залишатися відкритим
    if (nav.classList.contains("open")) {
      nav.classList.add("open");
      placeholder.classList.add("open");
    }
  } else {
    // Якщо ширина екрану менша за 948px, закриваємо меню
    nav.classList.remove("open");
    placeholder.classList.remove("open");
  }
});
// Закриття меню при кліку поза ним
document.addEventListener("click", function (event) {
  let nav = document.querySelector("#nav-holder");
  let placeholder = document.querySelector("#nav-placeholder");

  // Перевіряємо, чи клік був поза меню або кнопкою для його відкриття
  if (!nav.contains(event.target) && !placeholder.contains(event.target)) {
    nav.classList.remove("open");
    placeholder.classList.remove("open");
  }
});


// Interface buttons evants
function LogOutBut() {
  removeActiveLink();
  ClearProfile();
  window.location.href = "index.html";
  localStorage.removeItem("profileInfo");
}

// Notifacator indicator
function HideNotifIndicator(event) {
  const notifIndicator = document.getElementById("notif-indicator");
  if (notifIndicator) {
    notifIndicator.style.display = "none";
    localStorage.setItem("notifHidden", "true"); // Запам'ятати стан
  }
}
function ShowNotifIndicator() {
  const notifImg = document.getElementById("notif-img");
  notifImg.animate(
    [
      { transform: "rotate(0deg)" },
      { transform: "rotate(-15deg)" },
      { transform: "rotate(15deg)" },
      { transform: "rotate(-10deg)" },
      { transform: "rotate(10deg)" },
      { transform: "rotate(0deg)" },
    ],
    {
      duration: 500, // Час анімації (0.5 сек)
      iterations: 1, // Виконати один раз
    }
  );

  const notifIndicator = document.getElementById("notif-indicator");
  if (notifIndicator) {
    notifIndicator.style.display = "block";
    localStorage.setItem("notifHidden", "false"); // Запам'ятати стан
  }
}

// Close and clear
function CloseEdit(id_str) {
  Close(id_str);
  ClearForm();

  let confirmButton = document.getElementById("confirm-edit-button");
  confirmButton.removeEventListener("click", saveEditListener);
  confirmButton.removeEventListener("click", CreateAdd);
}
function CloseDelete(id_str) {
  Close(id_str);

  confirmButton = document.getElementById("ok_button");
  confirmButton.removeEventListener("click", saveDeleteListener);
}
function Close(id_str) {
  let element = document.getElementById(id_str);
  if (element) {
    element.style.display = "none";
  } else {
    console.error("Element with id '" + id_str + "' not found.");
  }

  ChangeBackgroundDisplay("shadow-wraper");
}
function ClearForm() {
  document.getElementById("student-form").reset();

  document.getElementById("group-erinput").style.display = "none";
  document.getElementById("fname-erinput").style.display = "none";
  document.getElementById("lname-erinput").style.display = "none";
  document.getElementById("gender-erinput").style.display = "none";
  document.getElementById("bdate-erinput").style.display = "none";

  const inputFields = GetFormInputFields();
  inputFields.group.style.borderColor = "black";
  inputFields.fname.style.borderColor = "black";
  inputFields.lname.style.borderColor = "black";
  inputFields.gender.style.borderColor = "black";
  inputFields.bdate.style.borderColor = "black";
}
function ClearProfile() {
  $("#profile-name").textContent = "";
}
