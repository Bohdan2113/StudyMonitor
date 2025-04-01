// Additional function holders
let saveDeleteListener;
let saveEditListener;
const $ = document.querySelector.bind(document);

// Add input events to the form fields
window.onload = function () {
  const inputFields = GetFormInputFields();
  for (const key in inputFields) {
    if (inputFields[key] !== undefined && key !== "id") {
      inputFields[key].addEventListener("input", HideErrorMessage);
    }
  }
};

// burger menu open and close
function burgerMenu() {
  let nav = document.querySelector("#nav-holder");
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
// Close menu when resizing window
window.addEventListener("resize", function () {
  let nav = document.querySelector("#nav-holder");
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
  let nav = document.querySelector("#nav-holder");
  let placeholder = document.querySelector("#nav-placeholder");

  // Перевіряємо, чи клік був поза меню або кнопкою для його відкриття
  if (!nav.contains(event.target) && !placeholder.contains(event.target)) {
    nav.classList.remove("open");
    placeholder.classList.remove("open");
  }
});

// Interface buttons evants
function addStudentButton() {
  //Show window
  let editBlock = document.getElementById("edit-student-block");
  editBlock.style.display = "flex";
  ChangeBackgroundDisplay("shadow-wraper");

  // Change window info for edit block
  let header = document.getElementById("edit-block-header");
  header.textContent = "Add student";
  let confirmButton = document.getElementById("confirm-edit-button");
  confirmButton.textContent = "Create";

  // Chanel student id into save button
  confirmButton.addEventListener("click", CreateAdd);

  // Set value into a hidden idField
  const inputFields = GetFormInputFields();
  const lastStudentID = studentList?.length ? studentList.at(-1).id : 0;
  inputFields.id.value = lastStudentID + 1;
}
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

  inputFields.id.value = curStudent.id;
  inputFields.group.value = curStudent.group;
  inputFields.fname.value = curStudent.fname;
  inputFields.lname.value = curStudent.lname;
  inputFields.gender.value = curStudent.gender;
  inputFields.bdate.value = curStudent.bdate;
}
function deleteStudentButton(studentId_num) {
  let stToDelList = studentList.filter((s) => s.id === studentId_num);

  LoadInfoToDeleteModal(stToDelList);
}
function DeleteAllChoosen() {
  let stToDelList = studentList.filter((s) => s.checkbox === true);

  LoadInfoToDeleteModal(stToDelList);
}

// Fields getting
function GetFormInputFields() {
  return {
    id: document.getElementById("id"),
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

// Student options confirmation
function CreateAdd() {
  const inputFields = GetFormInputFields();
  if (!ValidateStudentFormInput(inputFields)) return;

  const lastStudentID = studentList?.length ? studentList.at(-1).id : 0;

  let newStudent = new Student(
    parseInt(inputFields.id.value),
    false,
    inputFields.group.value,
    inputFields.fname.value.replace(/\s+/g, " ").trim(),
    inputFields.lname.value.replace(/\s+/g, " ").trim(),
    inputFields.gender.value,
    inputFields.bdate.value
  );
  studentList.push(newStudent);
  addStudentToTable(newStudent);
  ToLocalStorage(newStudent);

  CloseEdit("edit-student-block");

  function ToLocalStorage(newS) {
    // output JSON to console
    const myJSON = JSON.stringify(newS);
    console.log("Added: " + myJSON);
    // Sava into storage
    let students = JSON.parse(localStorage.getItem("students")) || [];
    students.push(newS);
    localStorage.setItem("students", JSON.stringify(students));
  }
}
function SaveEdit(studentId_num) {
  let inputFields = GetFormInputFields();
  if (!ValidateStudentFormInput(inputFields)) return;

  let studentTableFields = GetStudentTableFields(studentId_num);
  let curStudent = studentList.find((s) => s.id === studentId_num);
  if (!curStudent) {
    console.log("Studen`t not in the list");
    return;
  }

  // Update student data in the studentList
  curStudent.id = parseInt(inputFields.id.value);
  curStudent.group = inputFields.group.value;
  curStudent.fname = inputFields.fname.value.replace(/\s+/g, " ").trim();
  curStudent.lname = inputFields.lname.value.replace(/\s+/g, " ").trim();
  curStudent.gender = inputFields.gender.value;
  curStudent.bdate = inputFields.bdate.value;
  UpdateInLocalStorage(curStudent);

  // Update data in table
  studentTableFields.studentGroup.textContent = curStudent.group;
  studentTableFields.studentName.textContent = curStudent.name;
  studentTableFields.studentGender.textContent = curStudent.gender;
  studentTableFields.studentBdate.textContent = curStudent.formatDate();
  studentTableFields.studentStatus.style.backgroundColor =
    curStudent.defineStatusColor();

  CloseEdit("edit-student-block");

  function UpdateInLocalStorage(student) {
    // output JSON to console
    const myJSON = JSON.stringify(student);
    console.log("Edited: " + myJSON);
    // Save into storage
    let students = JSON.parse(localStorage.getItem("students")) || [];
    let index = students.findIndex((s) => s.id === student.id);
    if (index !== -1) {
      students[index] = student; // Оновлюємо знайденого студента
      localStorage.setItem("students", JSON.stringify(students));
    } else {
      console.warn("Student not found!");
    }
    localStorage.setItem("students", JSON.stringify(students));
  }
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

  DeleteFromStorage(stToDelList);

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

  function DeleteFromStorage(listToDel) {
    // Delete from storage
    let students = JSON.parse(localStorage.getItem("students")) || [];
    students = students.filter(
      (student) => !listToDel.some((sD) => sD.id === student.id)
    );
    localStorage.setItem("students", JSON.stringify(students));
  }
}

// Student form validation
function ValidateStudentFormInput(inputFields) {
  let isValid = true;
  let message = "Error input";

  // Перевіряєм групу на присутність
  ValidateField(
    inputFields.group,
    inputFields.group.value,
    "group-erinput",
    "Fill this field"
  );

  // Перевіряєм ім'я на присутність та коректність
  ValidateField(
    inputFields.fname,
    IsValidName(inputFields.fname.value),
    "fname-erinput",
    message
  );

  // Перевіряєм прізвище на присутність та коректність
  ValidateField(
    inputFields.lname,
    IsValidName(inputFields.lname.value),
    "lname-erinput",
    message
  );

  // Перевіряєм гендер на присутність
  ValidateField(
    inputFields.gender,
    inputFields.bdate.value,
    "gender-erinput",
    "Fill this field"
  );

  // Перевіряєм вік на присутність та коректність в межах [16; 80]
  ValidateField(
    inputFields.bdate,
    IsValidBDate(inputFields.bdate.value),
    "bdate-erinput",
    message
  );

  return isValid;

  function ValidateField(field, predicat, messageId, message = "Error input") {
    const errOutput = document.getElementById(messageId);
    if (!predicat) {
      field.style.borderColor = "red";
      errOutput.style.display = "block";
      errOutput.textContent = message;

      isValid = false;
    } else {
      field.style.borderColor = "black";
      errOutput.style.display = "none";
    }
  }

  function IsValidName(text) {
    if (!text) {
      message = "Fill this field";
      return false;
    }

    const testPettern = /SELECT/;
    if (testPettern.test(text)) {
      message = "Ви зловмисник";
      alert("Ви зловмисник");
      return false;
    }

    const errPattern = /[^a-zA-Z\s-]+/;
    if (errPattern.test(text)) {
      message =
        "Wrong input. Alowed characters are: [a-z], [A-Z], -, whitespace.";
      return false;
    }

    const pattern = /^\s*([A-Za-z]+(-[A-Za-z]+)*\s*)+$/;
    if (!pattern.test(text)) {
      message = "Wrong input format.";
      return false;
    }
    return true;
  }
  function IsValidBDate(input, minAge = 16, maxAge = 80) {
    if (!input) {
      message = "Fill this field";
      return false;
    }

    const today = new Date();
    const birthDate = new Date(input);

    let yearsAge = today.getFullYear() - birthDate.getFullYear();
    // Перевірка, чи вже був день народження цього року
    const hasHadBirthday =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());
    if (!hasHadBirthday) yearsAge--; // Якщо день народження ще не настав, зменшуємо вік на 1

    if (yearsAge < minAge || yearsAge > maxAge) {
      message = `Age must be from ${minAge} to ${maxAge} years`;
      return false;
    } else return true;
  }
}
function HideErrorMessage(event) {
  const message = $(`#${event.target.id}-erinput`);
  message.style.display = "none";
  event.target.style.borderColor = "black";
  console.log("Hide " + `${event.target.id}-erinput`);
}

// Additional functions
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
function ChangeBackgroundDisplay(blockId_str) {
  let shadowWraper = document.getElementById(blockId_str);

  if (shadowWraper.style.display === "flex") {
    shadowWraper.style.display = "none";
    // shadowWraper.style.pointerEvents = "none";
  } else {
    shadowWraper.style.display = "flex";
    // shadowWraper.style.pointerEvents = "auto";
  }
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

// Notifacator indicator
function HideNotifIndicator(event) {
  updateActiveLink(event);

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

// Close and clear
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

  document.getElementById("group-erinput").style.display = "none";
  document.getElementById("fname-erinput").style.display = "none";
  document.getElementById("lname-erinput").style.display = "none";
  document.getElementById("gender-erinput").style.display = "none";
  document.getElementById("bdate-erinput").style.display = "none";

  const inputFields = GetFormInputFields();
  inputFields.group.style.borderColor = "black";
  inputFields.fname.style.borderColor = "black";
  inputFields.lname.style.borderColor = "black";
  inputFields.gender.style.borderColor = "black";
  inputFields.bdate.style.borderColor = "black";
}
