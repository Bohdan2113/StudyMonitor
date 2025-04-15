window.onload = function () {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => console.log("Service Worker registered"))
      .catch((err) => console.error("Service Worker registration failed", err));
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await includeHTML("./Components/header.php", "header-placeholder");
    await includeHTML("./Components/nav.php", "nav-placeholder");
  } catch (error) {
    console.error(error);
  }

  // Update active page
  let activePath = sessionStorage.getItem("activeLink");
  if (!activePath) {
    activePath = "./index.php";
    localStorage.setItem("activeLink", activePath);
  }
  if (activePath) {
    let activeLink = document.querySelector(`.nav-item[href='${activePath}']`);
    if (activePath === "./index.php")
      activeLink = document.querySelector("#main-paige");
    if (activeLink) {
      activeLink.classList.add("active");
    }
  }
  console.log("Cur page: " + (activePath ? activePath : "noNavigationPage"));

  const notifIndicator = document.getElementById("notif-indicator");
  if (notifIndicator) {
    // Відновлюємо стан індикатора з localStorage
    const isHidden = localStorage.getItem("notifHidden");
    if (isHidden === "true") notifIndicator.style.display = "none";
    else notifIndicator.style.display = "block";
  }
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

function updateActiveLink(event) {
  let clickedLink = event.target.closest("a");
  if (!clickedLink) return;

  // Перевіряємо, чи це лого (не змінюємо active)
  if (clickedLink.classList.contains("logo"))
    clickedLink = document.getElementById("main-paige");

  removeActiveLink();
  clickedLink.classList.add("active");
  sessionStorage.setItem("activeLink", clickedLink.getAttribute("href"));
}

function removeActiveLink() {
  document
    .querySelectorAll(".nav-item")
    .forEach((link) => link.classList.remove("active"));
  sessionStorage.removeItem("activeLink");
}
