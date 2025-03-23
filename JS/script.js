class Student {
  static studentId = 0;
  constructor(isChecked, group, fname, lname, gender, bdate) {
    this.id = Student.studentId++;
    this.checkbox = isChecked;
    this.group = group;
    this.fname = fname;
    this.lname = lname;
    this.gender = gender;
    this.bdate = bdate;
    this.status = "lightgray";
  }

  get name() {
    return this.fname + " " + this.lname;
  }
  formatDate() {
    if (!this.bdate) return "";

    const date = new Date(this.bdate); // Перетворюємо рядок на об'єкт Date
    const day = String(date.getDate()).padStart(2, "0"); // Додаємо нуль, якщо день однозначний
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Місяць (1-12), додаємо нуль
    const year = date.getFullYear(); // Рік (повний)

    return `${day}.${month}.${year}`;
  }

  defineStatusColor() {
    const profileName = document.getElementById("profile-name");
    const fullName = profileName ? profileName.textContent.trim() : "";

    if (fullName !== null && this.name.trim() === fullName)
      this.status = "green";
    else this.status = "lightgray";

    return this.status;
  }
}

function burgerMenu() {
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
  let nav = document.querySelector("nav");
  let placeholder = document.querySelector("#nav-placeholder");

  // Перевіряємо, чи клік був поза меню або кнопкою для його відкриття
  if (!nav.contains(event.target) && !placeholder.contains(event.target)) {
    nav.classList.remove("open");
    placeholder.classList.remove("open");
  }
});

function ChangeBackgroundDisplay(blockId_str) {
  let shadowWraper = document.getElementById(blockId_str);

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

function GetStudentTableFields(studentId_num) {
  return {
    studentGroup: document.getElementById(`${studentId_num}-group`),
    studentName: document.getElementById(`${studentId_num}-name`),
    studentGender: document.getElementById(`${studentId_num}-gender`),
    studentBdate: document.getElementById(`${studentId_num}-bdate`),
    studentStatus: document.getElementById(`${studentId_num}-status`),
  };
}

function CreateAdd() {
  const inputFields = GetFormInputFields();

  let newStudent = new Student(
    false,
    inputFields.group.value,
    inputFields.fname.value.trim(),
    inputFields.lname.value.trim(),
    inputFields.gender.value,
    inputFields.bdate.value
  );
  studentList.push(newStudent);
  addStudentToTable(newStudent);

  CloseEdit("edit-student-block");
}

function addStudentToTable(newStudent) {
  const table = document.querySelector("#students_table tbody");
  const tr = document.createElement("tr");
  tr.id = `student-${newStudent.id}`;
  tr.scope = "row";

  // Чекбокс
  const tdCheckbox = document.createElement("td");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.title = "Select";
  checkbox.ariaLabel = "Select student";
  checkbox.id = `${newStudent.id}-checkbox`;
  checkbox.onchange = () => toggleStudentCheckbox(newStudent.id);
  tdCheckbox.appendChild(checkbox);
  tdCheckbox.setAttribute("data-label", "Select");

  // Група
  const tdGroup = document.createElement("td");
  tdGroup.id = `${newStudent.id}-group`;
  tdGroup.textContent = newStudent.group;
  tdGroup.setAttribute("data-label", "Group");

  // Ім'я
  const tdName = document.createElement("td");
  tdName.id = `${newStudent.id}-name`;
  tdName.textContent = `${newStudent.fname} ${newStudent.lname}`;
  tdName.setAttribute("data-label", "Name");

  // Стать
  const tdGender = document.createElement("td");
  tdGender.id = `${newStudent.id}-gender`;
  tdGender.textContent = newStudent.gender;
  tdGender.setAttribute("data-label", "Gender");

  // Дата народження
  const tdBdate = document.createElement("td");
  tdBdate.id = `${newStudent.id}-bdate`;
  tdBdate.textContent = newStudent.formatDate();
  tdBdate.setAttribute("data-label", "Birthday");

  // Статус
  const divStatusBtn = document.createElement("div");
  divStatusBtn.className = "status_cell";

  const tdStatus = document.createElement("td");
  const statusBar = document.createElement("div");
  statusBar.className = "statusBar";
  statusBar.id = `${newStudent.id}-status`;
  statusBar.style.backgroundColor = newStudent.defineStatusColor();
  divStatusBtn.appendChild(statusBar);
  tdStatus.appendChild(divStatusBtn);
  tdStatus.setAttribute("data-label", "Status");

  // Опції (Редагування/Видалення)
  const divOptionBtn = document.createElement("div");
  divOptionBtn.className = "option_cell";

  const tdOptions = document.createElement("td");
  tdOptions.setAttribute("data-label", "Options");

  const editButton = document.createElement("button");
  editButton.title = "Edit";
  editButton.ariaLabel = "Edit";
  editButton.onclick = () => editStudentButton(newStudent.id);
  const editImg = document.createElement("img");
  editImg.src = "../Images/pencil.png";
  editImg.alt = "edit";
  editButton.appendChild(editImg);

  const deleteButton = document.createElement("button");
  deleteButton.title = "Delete";
  deleteButton.ariaLabel = "Delete";
  deleteButton.onclick = () => deleteStudentButton(newStudent.id);
  const deleteImg = document.createElement("img");
  deleteImg.src = "../Images/bin.png";
  deleteImg.alt = "delete";
  deleteButton.appendChild(deleteImg);

  divOptionBtn.appendChild(editButton);
  divOptionBtn.appendChild(deleteButton);
  tdOptions.appendChild(divOptionBtn);

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

  // Перемикаємо стан чекбокса для поточного студента
  curStudent.checkbox = !curStudent.checkbox;

  // Перевіряємо, чи хоча б у одного студента вибрано чекбокс
  let deleteAllBtn = document.getElementById("del_all_btn");
  let isChoosen = studentList.some((s) => s.checkbox); // Перевіряємо всі чекбокси

  // Якщо хоча б один чекбокс обраний, показуємо кнопку
  if (isChoosen) {
    deleteAllBtn.style.display = "flex";
  } else {
    deleteAllBtn.style.display = "none";
    let hCheckbox = document.getElementById("header-checkbox");
    hCheckbox.checked = false;
    hCheckbox.dispatchEvent(new Event("change"));
  }
}

function toggleAllCheckbox(id_str) {
  let final = document.getElementById(id_str).checked;
  studentList.forEach((s) => {
    if (s.checkbox !== final) {
      let checkbox = document.getElementById(`${s.id}-checkbox`);
      if (checkbox.checked !== final) {
        toggleTableCheckBox(checkbox);
        checkbox.dispatchEvent(new Event("change"));
      }
    }
  });

  function toggleTableCheckBox(checkbox) {
    checkbox.checked = checkbox.checked ? false : true;
  }
}

function syncCheckboxes(sourceId, targetId) {
  let source = document.getElementById(sourceId);
  let target = document.getElementById(targetId);

  if (source && target) {
    source.addEventListener("change", function () {
      target.checked = source.checked;
      // target.dispatchEvent(new Event("change"));
    });

    target.addEventListener("change", function () {
      if (source.checked === target.checked) return;
      source.checked = target.checked;
      source.dispatchEvent(new Event("change"));
    });
  }
}

let saveEditListener;
function editStudentButton(studentId_num) {
  //Show window
  let editBlock = document.getElementById("edit-student-block");
  editBlock.style.display = "flex";
  ChangeBackgroundDisplay("shadow-wraper");

  // Change window info for edit block
  let header = document.getElementById("edit-block-header");
  header.textContent = "Edit student";
  let confirmButton = document.getElementById("confirm-edit-button");
  confirmButton.textContent = "Save";

  // Chanel student id into save button
  saveEditListener = () => {
    SaveEdit(studentId_num);
  };
  confirmButton.addEventListener("click", saveEditListener);

  // Find choosen student and load theit data into form
  let inputFields = GetFormInputFields();
  let curStudent = studentList.find((s) => s.id === studentId_num);
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

function SaveEdit(studentId_num) {
  let inputFields = GetFormInputFields();
  let studentTableFields = GetStudentTableFields(studentId_num);
  let curStudent = studentList.find((s) => s.id === studentId_num);
  if (!curStudent) {
    console.log("Studen`t not in the list");
    return;
  }

  // Update student data in the studentList
  curStudent.group = inputFields.group.value;
  curStudent.fname = inputFields.fname.value;
  curStudent.lname = inputFields.lname.value;
  curStudent.gender = inputFields.gender.value;
  curStudent.bdate = inputFields.bdate.value;

  // Update data in table
  studentTableFields.studentGroup.textContent = curStudent.group;
  studentTableFields.studentName.textContent = curStudent.name;
  studentTableFields.studentGender.textContent = curStudent.gender;
  studentTableFields.studentBdate.textContent = curStudent.formatDate();
  studentTableFields.studentStatus.style.backgroundColor =
    curStudent.defineStatusColor();

  CloseEdit("edit-student-block");
}

let saveDeleteListener;
function deleteStudentButton(studentId_num) {
  let stToDelList = studentList.filter((s) => s.id === studentId_num);

  LoadInfoToDeleteModal(stToDelList);
}

function DeleteAllChoosen() {
  let stToDelList = studentList.filter((s) => s.checkbox === true);

  LoadInfoToDeleteModal(stToDelList);
}

function LoadInfoToDeleteModal(stToDelList) {
  // Load students to OKdel event
  let confirmButton = document.getElementById("ok_button");
  saveDeleteListener = () => {
    OkDelete(stToDelList);
  };
  confirmButton.addEventListener("click", saveDeleteListener);

  // Write current student name into warning message
  const paragraph = document.querySelector(
    "#del-student-block .block-data-container p"
  );
  let paragraphText = `Are you sure you want to delete user${
    stToDelList.length > 1 ? "s" : ""
  }: `;

  let length = stToDelList.length;
  for (let i = 0; i < length; i++) {
    const fname = stToDelList[i].fname || "--"; // Використовуємо --, якщо ім'я відсутнє
    const lname = stToDelList[i].lname || "--"; // Використовуємо --, якщо прізвище відсутнє
    paragraphText += `${fname} ${lname}, `;
  }
  paragraphText = paragraphText.substring(0, paragraphText.length - 2); // видаляємо кому з останнього рядка
  paragraph.textContent = paragraphText;

  // Show block
  let deleteBlock = document.getElementById("del-student-block");
  deleteBlock.style.display = "flex";

  ChangeBackgroundDisplay("shadow-wraper");
}

function OkDelete(stToDelList) {
  // Remove current student from table
  stToDelList.forEach((s) => {
    const tr = document.getElementById(`student-${s.id}`);
    if (tr) tr.remove();

    // Remove all previous students from studentList
    studentList = studentList.filter(
      (student) => !stToDelList.includes(student)
    );
  });

  let addFunction = () => {
    // Перевіряємо, чи хоча б у одного студента вибрано чекбокс
    let deleteAllBtn = document.getElementById("del_all_btn");
    let isChoosen = studentList.some((s) => s.checkbox); // Перевіряємо всі чекбокси

    // Якщо хоча б один чекбокс обраний, показуємо кнопку
    if (isChoosen) {
      deleteAllBtn.style.display = "flex";
    } else {
      deleteAllBtn.style.display = "none";
      let hCheckbox = document.getElementById("header-checkbox");
      hCheckbox.checked = false;
      hCheckbox.dispatchEvent(new Event("change"));
    }
  };
  if (addFunction !== undefined) addFunction();
  CloseDelete("del-student-block");
}

// Close Edit block with form reset
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
}
