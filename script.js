document.addEventListener("DOMContentLoaded", function () {
  // Завантажуємо хедер
  fetch("Parts/header.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("header-placeholder").innerHTML = data;
    });

  // Завантажуємо навігацію
  fetch("Parts/nav.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("nav-placeholder").innerHTML = data;
    });
});

function showMenu() {
  let nav = document.querySelector("nav");
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

window.addEventListener("resize", function () {
  let nav = document.querySelector("nav");
  let placeholder = document.querySelector("#nav-placeholder");

  if (window.innerWidth > 1000) {
    // Якщо ширина екрану більша за 1000px, то меню повинно залишатися відкритим
    if (nav.classList.contains("open")) {
      nav.classList.add("open");
      placeholder.classList.add("open");
    }
  } else {
    // Якщо ширина екрану менша за 1000px, закриваємо меню
    nav.classList.remove("open");
    placeholder.classList.remove("open");
  }
});

// Закриття меню при кліку поза ним
document.addEventListener("click", function (event) {
  let nav = document.querySelector("nav");
  let placeholder = document.querySelector("#nav-placeholder");

  // Перевіряємо, чи клік був поза меню або кнопкою для його відкриття
  if (!nav.contains(event.target) && !placeholder.contains(event.target)) {
    nav.classList.remove("open");
    placeholder.classList.remove("open");
  }
});

// function GetFormInputFields()
// {
//   return {
    
//   };
// }

function addStudent() {
  const table = document.getElementById("students_table");
  let editBlock = document.getElementById("edit-student-block");
  editBlock.style.display = "flex";

  // let newStudent;
  // addStudentToTable(newStudent, table);
}

// let studentList = [];
// let studentId = 0;
// function addStudentToTable(newStudent, table) {
//   const tr = document.createElement("tr");
//   tr.id = `student-${studentId++}`;
//   tr.innerHTML = `
//             <td>
//               <input
//                 type="checkbox"
//                 title="Select"
//                 aria-label="Select student"
//               />
//             </td>
//             <td>PZ-21</td>
//             <td>Bohdan Kruk</td>
//             <td>Male</td>
//             <td>05.01.2006</td>
//             <td>
//               <div class="statusBar" style="background-color: green"></div>
//             </td>
//             <td>
//               <div class="option_cell">
//                 <button aria-label="Edit" title="Edit" onclick="editStudent('student-1')">
//                   <img src="../Images/pencil.png" />
//                 </button>
//                 <button
//                   aria-label="Delete"
//                   title="Delete"
//                   onclick="deleteStudent()"
//                 >
//                   <img src="../Images/bin.png" />
//                 </button>
//               </div>
//             </td>
//   `;

//   table.appendChild(tr);
// }

function editStudent(id) {
  let editBlock = document.getElementById("edit-student-block");
  editBlock.style.display = "flex";
}

function deleteStudent() {
  let deleteBlock = document.getElementById("del-student-block");

  deleteBlock.style.display = "flex";
}

function Close(id) {
  let element = document.getElementById(id);
  if (element) {
    element.style.display = "none"; // або будь-яка інша дія
  } else {
    console.error("Element with id '" + id + "' not found.");
  }

  ClearForm();
}

function SaveEdit(id) {
  Close(id);

  ClearForm();
}

function OkDelete(id) {
  Close(id);

  ClearForm();
}

function ClearForm() {
  document.getElementById("student-form").reset();
}
