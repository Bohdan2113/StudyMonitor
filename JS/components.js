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

  let curHref = updateActiveLink();
  console.log(curHref);
  if (curHref === "/index.html" || curHref === "/") OnlyIndex();

  const notifIndicator = document.getElementById("notif-indicator");
  if (notifIndicator) {
    // Відновлюємо стан індикатора з localStorage
    const isHidden = localStorage.getItem("notifHidden");
    if (isHidden === "true") notifIndicator.style.display = "none";
    else notifIndicator.style.display = "block";
  }
});

function OnlyIndex() {
  studentList = LoadStudents();
  ShowAllStudents(studentList);
  syncCheckboxes("header-checkbox", "header-checkbox-ref");
}

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

function ShowAllStudents(stList) {
  stList.forEach((s) => addStudentToTable(s));
}

function updateActiveLink() {
  const navItems = document.querySelectorAll(".nav-item");
  const currentPath = window.location.pathname;

  let neededHref;
  navItems.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPath) {
      sessionStorage.setItem("activPage", currentPath); // Запам'ятати стан
      link.classList.add("active");
      neededHref = href;
    } else {
      link.classList.remove("active");
    }
  });
  return neededHref;
}

function LoadStudents() {
  return [
    new Student(false, "PZ-21", "Bohdan", "Kruk", "Male", "2006-05-01"),
    new Student(false, "PZ-21", "Victor", "Piznak", "Male", "2005-08-27"),
    new Student(false, "PZ-21", "Liza", "Zapisotska", "Female", "2006-01-25"),
  ];
}

let studentList = [];
