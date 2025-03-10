document.addEventListener("DOMContentLoaded", async () => {
  try {
    await includeHTML("/Components/nav.html", "nav-placeholder");
    await includeHTML("/Components/header.html", "header-placeholder");
    AddFirstStudents();

    updateActiveLink();
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

function AddFirstStudents() {
  const table = document.getElementById("students_table");
  if (!table) return;

  let newStudent = {
    id: studentId++,
    group: "PZ-21",
    fname: "Bohdan",
    lname: "Kruk",
    gender: "Male",
    bdate: "2006-05-01",
  };
  studentList.push(newStudent);
  addStudentToTable(newStudent, table);

  newStudent = {
    id: studentId++,
    group: "PZ-21",
    fname: "Victor",
    lname: "Piznak",
    gender: "Other",
    bdate: "2005-08-27",
  };
  studentList.push(newStudent);
  addStudentToTable(newStudent, table);
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
