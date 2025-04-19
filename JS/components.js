document.addEventListener("DOMContentLoaded", async () => {
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

  // Профіль інфо
  LoadProfileInfo();
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
function LoadProfileInfo() {
  const profileInfo = JSON.parse(localStorage.getItem("profileInfo"));
  $("#profile-name").textContent = profileInfo.fname + " " + profileInfo.lname;
}
function removeActiveLink() {
  document
    .querySelectorAll(".nav-item")
    .forEach((link) => link.classList.remove("active"));
  sessionStorage.removeItem("activeLink");
}
