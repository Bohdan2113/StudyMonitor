document.addEventListener("DOMContentLoaded", async () => {
  try {
    await includeHTML("/Components/nav.html", "nav-placeholder");
    await includeHTML("/Components/header.html", "header-placeholder");

    studentList = LoadStudents();
    updateActiveLink();
    ShowAllStudents(studentList);
  } catch (error) {
    console.error(error);
  }

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

function ShowAllStudents(stList) {
  const curPage = window.location.pathname;
  if (curPage !== "/Pages/students.html") return;

  stList.forEach((s) => addStudentToTable(s));
}

function updateActiveLink() {
  const navItems = document.querySelectorAll(".nav-item");
  const currentPath = window.location.pathname;

  navItems.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPath) {
      sessionStorage.setItem("activPage", currentPath); // Запам'ятати стан
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function LoadStudents() {
  return [
    {
      id: studentId++,
      checkbox: false,
      group: "PZ-21",
      fname: "Bohdan",
      lname: "Kruk",
      gender: "Male",
      bdate: "2006-05-01",
    },
    {
      id: studentId++,
      checkbox: false,
      group: "PZ-21",
      fname: "Victor",
      lname: "Piznak",
      gender: "Male",
      bdate: "2005-08-27",
    },
    {
      id: studentId++,
      checkbox: false,
      group: "PZ-21",
      fname: "Liza",
      lname: "Zapisotska",
      gender: "Female",
      bdate: "2006-01-25",
    },
  ];
}

let studentId = 0;
let studentList = [];
