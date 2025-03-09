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

document.addEventListener("DOMContentLoaded", async () => {
  // Завантажити header та nav, після чого викликати AddFirstStudents
  try {
    await includeHTML("/Components/header.html", "header-placeholder");
    await includeHTML("/Components/nav.html", "nav-placeholder");

    // Тепер викликаємо AddFirstStudents
    AddFirstStudents();

    // Ваш код для MutationObserver
    let currentPath = window.location.pathname.split("/").pop();
    const observer = new MutationObserver(() => {
      const navItems = document.querySelectorAll(".nav-item");

      if (navItems.length > 0) {
        navItems.forEach((link) => {
          link.getAttribute("href") === "/Pages" + currentPath
            ? link.classList.add("active")
            : link.classList.remove("active");
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  } catch (error) {
    console.error(error);
  }
});

function AddFirstStudents() {
  const table = document.getElementById("students_table");

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
