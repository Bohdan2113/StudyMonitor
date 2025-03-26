window.onload = function () {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("Service Worker registered"))
      .catch((err) => console.error("Service Worker registration failed", err));
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await includeHTML("/Components/header.html", "header-placeholder");
    await includeHTML("/Components/nav.html", "nav-placeholder");
  } catch (error) {
    console.error(error);
  }

  const curpage = updateActiveLink();
  console.log(
    "Cur page: " + (curpage !== undefined ? curpage : "noNavigationPage")
  );

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

function updateActiveLink() {
  const navItems = document.querySelectorAll(".nav-item");
  let currentPath = window.location.pathname;
  console.log("Path " + currentPath);
  if (currentPath === "/") currentPath += "index.html";

  let neededHref;
  navItems.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPath) {
      link.classList.add("active");
      neededHref = href;
    } else {
      link.classList.remove("active");
    }
  });
  return neededHref;
}
