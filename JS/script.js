function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString); // Перетворюємо рядок на об'єкт Date
  const day = String(date.getDate()).padStart(2, "0"); // Додаємо нуль, якщо день однозначний
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Місяць (1-12), додаємо нуль
  const year = date.getFullYear(); // Рік (повний)

  return `${month}.${day}.${year}`;
}

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

function ChangeBackgroundDisplay(blockId) {
  let shadowWraper = document.getElementById(blockId);

  if (
    shadowWraper.style.pointerEvents === "auto" ||
    shadowWraper.style.pointerEvents === ""
  ) {
    shadowWraper.style.opacity = 0.3;
    shadowWraper.style.pointerEvents = "none";
  } else {
    shadowWraper.style.opacity = 1;
    shadowWraper.style.pointerEvents = "auto";
  }
}

function HideNotifIndicator() {
  const notifIndicator = document.getElementById("notif-indicator");
  if (notifIndicator) {
    notifIndicator.style.display = "none";
    localStorage.setItem("notifHidden", "true"); // Запам'ятати стан
  }
}

function ShowNotifIndicator() {
  const activePage = window.location.pathname;
  if (activePage === "/Pages/messages.html") return;

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

function addStudentButton() {
  let editBlock = document.getElementById("edit-student-block");
  editBlock.style.display = "flex";
  ChangeBackgroundDisplay("shadow-wraper");

  let header = document.getElementById("edit-block-header");
  header.textContent = "Add student";

  let confirmButton = document.getElementById("confirm-edit-button");
  confirmButton.textContent = "Create";
  confirmButton.addEventListener("click", CreateAdd);
}

function GetFormInputFields() {
  return {
    group: document.getElementById("group"),
    fname: document.getElementById("fname"),
    lname: document.getElementById("lname"),
    gender: document.getElementById("gender"),
    bdate: document.getElementById("bdate"),
  };
}

function GetStudentTableFields(id) {
  return {
    studentGroup: document.getElementById(`${id}-group`),
    studentName: document.getElementById(`${id}-name`),
    studentGender: document.getElementById(`${id}-gender`),
    studentBdate: document.getElementById(`${id}-bdate`),
  };
}

let studentList = [];
let studentId = 0;
function CreateAdd() {
  const table = document.getElementById("students_table");
  const inputFields = GetFormInputFields();

  let newStudent = {
    id: studentId++,
    checkbox: false,
    group: inputFields.group.value,
    fname: inputFields.fname.value,
    lname: inputFields.lname.value,
    gender: inputFields.gender.value,
    bdate: inputFields.bdate.value,
  };
  studentList.push(newStudent);
  addStudentToTable(newStudent, table);

  CloseEdit("edit-student-block");
}

function addStudentToTable(newStudent, table) {
  const profileName = document.getElementById("profile-name");
  const fullName = profileName ? profileName.textContent.trim() : "";
  const newFullName = newStudent.fname + " " + newStudent.lname;
  let statusColor = "lightgray";
  if (newFullName.trim() === fullName) {
    statusColor = "green";
  }

  const tr = document.createElement("tr");
  tr.id = `student-${newStudent.id}`;

  // Чекбокс
  const tdCheckbox = document.createElement("td");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.title = "Select";
  checkbox.ariaLabel = "Select student";
  checkbox.id = `${newStudent.id}-checkbox`;
  checkbox.onchange = () => toggleStudentCheckbox(newStudent.id);
  tdCheckbox.appendChild(checkbox);

  // Група
  const tdGroup = document.createElement("td");
  tdGroup.id = `${newStudent.id}-group`;
  tdGroup.textContent = newStudent.group;

  // Ім'я
  const tdName = document.createElement("td");
  tdName.id = `${newStudent.id}-name`;
  tdName.textContent = `${newStudent.fname} ${newStudent.lname}`;

  // Стать
  const tdGender = document.createElement("td");
  tdGender.id = `${newStudent.id}-gender`;
  tdGender.textContent = newStudent.gender;

  // Дата народження
  const tdBdate = document.createElement("td");
  tdBdate.id = `${newStudent.id}-bdate`;
  tdBdate.textContent = formatDate(newStudent.bdate);

  // Статус
  const tdStatus = document.createElement("td");
  const statusBar = document.createElement("div");
  statusBar.className = "statusBar";
  statusBar.id = `${newStudent.id}-status`;
  statusBar.style.backgroundColor = statusColor;
  tdStatus.appendChild(statusBar);

  // Опції (Редагування/Видалення)
  const tdOptions = document.createElement("td");
  tdOptions.className = "option_cell";

  const editButton = document.createElement("button");
  editButton.title = "Edit";
  editButton.ariaLabel = "Edit";
  editButton.onclick = () => editStudentButton(newStudent.id);
  const editImg = document.createElement("img");
  editImg.src = "../Images/pencil.png";
  editButton.appendChild(editImg);

  const deleteButton = document.createElement("button");
  deleteButton.title = "Delete";
  deleteButton.ariaLabel = "Delete";
  deleteButton.onclick = () => deleteStudentButton(newStudent.id);
  const deleteImg = document.createElement("img");
  deleteImg.src = "../Images/bin.png";
  deleteButton.appendChild(deleteImg);

  tdOptions.appendChild(editButton);
  tdOptions.appendChild(deleteButton);

  // Додаємо всі елементи в рядок
  tr.appendChild(tdCheckbox);
  tr.appendChild(tdGroup);
  tr.appendChild(tdName);
  tr.appendChild(tdGender);
  tr.appendChild(tdBdate);
  tr.appendChild(tdStatus);
  tr.appendChild(tdOptions);

  // Додаємо рядок у таблицю
  table.appendChild(tr);
}

function toggleStudentCheckbox(studentId_num) {
  let curStudent = studentList.find((s) => s.id === studentId_num);
  curStudent.checkbox = curStudent.checkbox ? false : true;
}

function toggleAllCheckbox(id_str) {
  let final = document.getElementById(id_str).checked;
  studentList.forEach((s) => {
    if (s.checkbox !== final) {
      s.checkbox = final;
      toggleTableCheckBox(`${s.id}-checkbox`, final);
    }
  });

  function toggleTableCheckBox(id_str, final) {
    let checkbox = document.getElementById(id_str);

    if (final !== undefined) {
      checkbox.checked = final;
    } else {
      checkbox.checked = !checkbox.checked;
    }
    return checkbox.checked;
  }
}

let saveEditListener;
function editStudentButton(id) {
  let editBlock = document.getElementById("edit-student-block");
  editBlock.style.display = "flex";
  ChangeBackgroundDisplay("shadow-wraper");

  let header = document.getElementById("edit-block-header");
  header.textContent = "Edit student";
  let confirmButton = document.getElementById("confirm-edit-button");
  confirmButton.textContent = "Save";

  saveEditListener = () => {
    SaveEdit(id);
  };
  confirmButton.addEventListener("click", saveEditListener);

  let inputFields = GetFormInputFields();
  let curStudent = studentList.find((s) => s.id === id);
  if (!curStudent) {
    console.log("Studen`t not in the list");
    return;
  }

  inputFields.group.value = curStudent.group;
  inputFields.fname.value = curStudent.fname;
  inputFields.lname.value = curStudent.lname;
  inputFields.gender.value = curStudent.gender;
  inputFields.bdate.value = curStudent.bdate;
}

function SaveEdit(id) {
  let inputFields = GetFormInputFields();
  let studentTableFields = GetStudentTableFields(id);
  let curStudent = studentList.find((s) => s.id === id);
  if (!curStudent) {
    console.log("Studen`t not in the list");
    return;
  }

  curStudent.group = inputFields.group.value;
  curStudent.fname = inputFields.fname.value;
  curStudent.lname = inputFields.lname.value;
  curStudent.gender = inputFields.gender.value;
  curStudent.bdate = inputFields.bdate.value;

  studentTableFields.studentGroup.textContent = curStudent.group;
  studentTableFields.studentName.textContent =
    curStudent.fname + " " + curStudent.lname;
  studentTableFields.studentGender.textContent = curStudent.gender;
  studentTableFields.studentBdate.textContent = formatDate(curStudent.bdate);

  CloseEdit("edit-student-block");
}

let saveDeleteListener;
function deleteStudentButton(id) {
  let deleteBlock = document.getElementById("del-student-block");
  deleteBlock.style.display = "flex";
  ChangeBackgroundDisplay("shadow-wraper");

  let confirmButton = document.getElementById("ok_button");
  saveDeleteListener = () => {
    OkDelete(id);
  };
  confirmButton.addEventListener("click", saveDeleteListener);
}

function OkDelete(studentId_num) {
  const tr = document.getElementById(`student-${studentId_num}`);
  if (tr) tr.remove();

  studentList.forEach((s) => {
    if (s.checkbox === true) {
      const tr = document.getElementById(`student-${s.id}`);
      if (tr) tr.remove();
    }
  });

  studentList = studentList.filter(
    (s) => s.id !== studentId_num && s.checkbox !== true
  );

  Close("del-student-block");
}

function CloseEdit(id) {
  Close(id);
  ClearForm();
}

function Close(id) {
  let element = document.getElementById(id);
  if (element) {
    element.style.display = "none"; // або будь-яка інша дія
  } else {
    console.error("Element with id '" + id + "' not found.");
  }

  let confirmButton = document.getElementById("confirm-edit-button");
  confirmButton.removeEventListener("click", saveEditListener);
  confirmButton.removeEventListener("click", CreateAdd);

  confirmButton = document.getElementById("ok_button");
  confirmButton.removeEventListener("click", saveDeleteListener);

  ChangeBackgroundDisplay("shadow-wraper");
}

function ClearForm() {
  document.getElementById("student-form").reset();
}
