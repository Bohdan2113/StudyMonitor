class Student {
  // static studentId = 0;
  constructor(
    id,
    isChecked,
    group_name,
    fname,
    lname,
    gender,
    bdate,
    status = "offline"
  ) {
    this.id = id;
    this.checkbox = isChecked;
    this.group_name = group_name;
    this.fname = fname;
    this.lname = lname;
    this.gender = gender;
    this.bdate = bdate;
    this.status = status;
  }
  get name() {
    return this.fname + " " + this.lname;
  }

  copy() {
    return new Student(
      this.id,
      this.checkbox,
      this.group_name,
      this.fname,
      this.lname,
      this.gender,
      this.bdate,
      this.status
    );
  }
  formatDate() {
    if (!this.bdate) return "";

    const date = new Date(this.bdate); // Перетворюємо рядок на об'єкт Date
    const day = String(date.getDate()).padStart(2, "0"); // Додаємо нуль, якщо день однозначний
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Місяць (1-12), додаємо нуль
    const year = date.getFullYear(); // Рік (повний)

    return `${day}.${month}.${year}`;
  }
  statusColor() {
    const profileInfo = JSON.parse(localStorage.getItem("profileInfo"));

    if (this.name === profileInfo.fname + " " + profileInfo.lname)
      this.status = "online";
    else this.status = "offline";

    return this.status === "online" ? "green" : "lightgray";
  }
}
class Pagination {
  constructor(perPage, currentPage = 1) {
    this.currentPage = currentPage;
    this.perPage = perPage;
  }
  get lastPage() {
    return Math.ceil(studentList.length / this.perPage);
  }
}

// Additional function holders
let saveDeleteListener;
let saveEditListener;
// Constants
const studentsPerPage = 4;
const seenPages = 2;
let studentList = [];
const stPagination = new Pagination(studentsPerPage);

// Add input events to the form fields
document.addEventListener("DOMContentLoaded", async () => {
  studentList = await LoadStudentsFromServer();
  renderTablePage(stPagination, studentList);
  syncCheckboxes("header-checkbox", "header-checkbox-ref");
  console.log("Students loaded");
});
window.onload = function () {
  const inputFields = GetFormInputFields();
  for (const key in inputFields) {
    if (inputFields[key] !== undefined && key !== "id") {
      inputFields[key].addEventListener("input", HideErrorMessage);
    }
  }
};

// Table rendering and pagination
function addStudentToTable(newStudent, table) {
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
  checkbox.checked = newStudent.checkbox;
  checkbox.onchange = () => toggleStudentCheckbox(newStudent.id);
  tdCheckbox.appendChild(checkbox);
  tdCheckbox.setAttribute("data-label", "Select");

  // Група
  const tdGroup = document.createElement("td");
  tdGroup.id = `${newStudent.id}-group`;
  tdGroup.textContent = newStudent.group_name;
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
  statusBar.style.backgroundColor = newStudent.statusColor();
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
  editImg.src = "./Images/pencil.png";
  editImg.alt = "edit";
  editButton.appendChild(editImg);

  const deleteButton = document.createElement("button");
  deleteButton.title = "Delete";
  deleteButton.ariaLabel = "Delete";
  deleteButton.onclick = () => deleteStudentButton(newStudent.id);
  const deleteImg = document.createElement("img");
  deleteImg.src = "./Images/bin.png";
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
function renderTablePage(paginationInfo, data, page = 1) {
  if (page < 0 || page > paginationInfo.lastPage) return;

  paginationInfo.currentPage = page;
  const tableBody = document.querySelector("#students_table tbody"); // або твоя таблиця
  tableBody.innerHTML = ""; // очищаємо таблицю

  const start = (page - 1) * paginationInfo.perPage;
  const end = start + paginationInfo.perPage;
  const pageStudents = data.slice(start, end);

  pageStudents.forEach((el) => {
    addStudentToTable(el, tableBody);
  });

  renderPagination(paginationInfo, data);
}
function renderPagination(paginationInfo, data) {
  const pagination = document.getElementById("paginationContainer");
  pagination.innerHTML = "";

  if (data.length === 0) return;

  const lastPage = paginationInfo.lastPage;
  const totalPages = lastPage;
  const curPage = paginationInfo.currentPage;

  const prevBtn = document.createElement("button");
  prevBtn.className = "text_edit";
  prevBtn.classList.add("arrow");
  prevBtn.innerHTML = "&lt;";
  prevBtn.disabled = curPage === 1;
  prevBtn.onclick = () => renderTablePage(paginationInfo, data, curPage - 1);
  pagination.appendChild(prevBtn);

  if (totalPages > seenPages + 4) {
    const leftSeenCount = Math.floor((seenPages - 1) / 2);
    const rightSeenCount = leftSeenCount + ((seenPages - 1) % 2);

    Display(1);

    if (curPage <= 3 + leftSeenCount) {
      // Починаємо з 2 сторінки бо перша завжи виводиться,
      // показуємо seenPages блоків + 1 замість одних крапочок
      for (let i = 2; i < 2 + seenPages + 1; i++) Display(i);
      Display(0);
    } else if (curPage > totalPages - 3 - rightSeenCount) {
      Display(0);
      // Показуємо передостанні seenPages блоків + 1 замість одних крапочок
      for (let i = lastPage - 1 - seenPages; i < lastPage; i++) Display(i);
    } else {
      Display(0);
      for (let i = curPage - leftSeenCount; i <= curPage + rightSeenCount; i++)
        Display(i);
      Display(0);
    }

    Display(paginationInfo.lastPage);
  } else {
    for (let i = 1; i <= totalPages; i++) {
      Display(i);
    }
  }

  const nextBtn = document.createElement("button");
  nextBtn.className = "text_edit";
  nextBtn.classList.add("arrow");
  nextBtn.innerHTML = "&gt;";
  nextBtn.disabled = curPage === totalPages;
  nextBtn.onclick = () => renderTablePage(paginationInfo, data, curPage + 1);
  pagination.appendChild(nextBtn);

  function Display(i) {
    const pageBtn = document.createElement("button");
    pageBtn.className = "text_edit";
    if (i > 0) {
      pageBtn.innerText = i;
      pageBtn.onclick = () => renderTablePage(paginationInfo, data, i);
      if (i === curPage) {
        pageBtn.classList.add("active");
      }
    } else if (i === 0) {
      pageBtn.classList.add("spaceDots");
      pageBtn.innerText = "...";
      pageBtn.disabled = true;
    }
    pagination.appendChild(pageBtn);
  }
}

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
  inputFields.group.value = curStudent.group_name;
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

// Student options confirmation
async function CreateAdd() {
  const inputFields = GetFormInputFields();
  if (!ValidateStudentFormInput(inputFields)) return;

  let newStudent = new Student(
    parseInt(inputFields.id.value),
    false,
    inputFields.group.value,
    inputFields.fname.value.replace(/\s+/g, " ").trim(),
    inputFields.lname.value.replace(/\s+/g, " ").trim(),
    inputFields.gender.value,
    inputFields.bdate.value
  );

  if (!(await AddStToDatabase(newStudent))) return;

  studentList.push(newStudent);
  renderTablePage(stPagination, studentList, stPagination.lastPage);
  // addStudentToTable(newStudent);
  CloseEdit("edit-student-block");
}
async function SaveEdit(studentId_num) {
  let inputFields = GetFormInputFields();
  if (!ValidateStudentFormInput(inputFields)) return;

  let studentTableFields = GetStudentTableFields(studentId_num);
  let curStudent = studentList.find((s) => s.id === studentId_num);
  if (!curStudent) {
    console.log("Studen`t not in the list");
    return;
  }

  // Update student data of student copy to check in backend
  const curStudentCpy = curStudent.copy();
  curStudentCpy.id = parseInt(inputFields.id.value);
  curStudentCpy.group_name = inputFields.group.value;
  curStudentCpy.fname = inputFields.fname.value.replace(/\s+/g, " ").trim();
  curStudentCpy.lname = inputFields.lname.value.replace(/\s+/g, " ").trim();
  curStudentCpy.gender = inputFields.gender.value;
  curStudentCpy.bdate = inputFields.bdate.value;
  if (!(await UpdateStInDatabase(curStudentCpy))) return;

  // Assign fields from curStudentCpy to curStudent
  Object.assign(curStudent, curStudentCpy);

  // Update data in table
  studentTableFields.studentGroup.textContent = curStudent.group_name;
  studentTableFields.studentName.textContent = curStudent.name;
  studentTableFields.studentGender.textContent = curStudent.gender;
  studentTableFields.studentBdate.textContent = curStudent.formatDate();
  studentTableFields.studentStatus.style.backgroundColor =
    curStudent.statusColor();

  CloseEdit("edit-student-block");
}
async function OkDelete(stToDelList) {
  if (!(await DeleteFromDataBase(stToDelList))) return;

  // Remove students from studentList
  studentList = studentList.filter((student) => !stToDelList.includes(student));
  renderTablePage(
    stPagination,
    studentList,
    Math.min(stPagination.currentPage, stPagination.lastPage)
  );

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
    inputFields.gender.value,
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
  function IsValidBDate(input, minAge = 0, maxAge = 80) {
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
function ShowErrMessage(targetId, message) {
  const target = $(`#${targetId}`);
  target.style.display = "block";
  target.textContent = message;

  const siblingInput = target.previousElementSibling;
  if (siblingInput.tagName !== "INPUT" || siblingInput.tagName !== "SELECT") {
    siblingInput.style.borderColor = "red";
  }
}
function HideErrorMessage(event) {
  const message = $(`#${event.target.id}-erinput`);
  message.style.display = "none";
  event.target.style.borderColor = "black";
}

// Additional functions
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
      if (checkbox && checkbox.checked !== final) {
        toggleTableCheckBox(checkbox);
      } else {
        // Перемикаємо стан чекбокса для поточного студента
        toggleStudentCheckbox(s.id);
      }
    }
  });

  function toggleTableCheckBox(checkbox) {
    checkbox.checked = checkbox.checked ? false : true;
    checkbox.dispatchEvent(new Event("change"));
  }
}

// DataBase interaction
async function LoadStudentsFromServer() {
  try {
    const response = await fetch("./BackEnd/feProcessing/get_students.php");
    const data = await response.json();
    return data.map(
      (student) =>
        new Student(
          student.id,
          false,
          student.group_name,
          student.fname,
          student.lname,
          student.gender,
          student.bdate,
          student.status
        )
    );
  } catch (error) {
    console.error("❌ Network error:", error);
    alert("❌ Network error: check your internet connection");
    return [];
  }
}
async function AddStToDatabase(newStudent) {
  try {
    const response = await fetch("./BackEnd/feProcessing/add_student.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStudent),
    });

    const result = await response.json();
    if (response.ok && result.success) {
      console.log("✅ Student added to DB:", result.message);
      return true;
    } else {
      if (result.field) {
        if (result.max) {
          ShowErrMessage(
            `${result.field}-erinput`,
            `Length must be less then ${result.max} characters`
          );
        } else if (result.error) {
          ShowErrMessage(`${result.field}-erinput`, result.error);
        }
      } else if (result.error) {
        alert(result.error);
      }
      return false;
    }
  } catch (error) {
    console.error("❌ Network error:", error);
    alert("❌ Network error: check your internet connection");
    return false;
  }
}
async function UpdateStInDatabase(student) {
  try {
    const response = await fetch("./BackEnd/feProcessing/update_student.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(student),
    });

    const result = await response.json();
    if (response.ok && result.success) {
      console.log("✅ Student updated in DB:", result.message);
      return true;
    } else {
      if (result.field) {
        if (result.max) {
          ShowErrMessage(
            `${result.field}-erinput`,
            `Length must be less then ${result.max} characters`
          );
        } else if (result.error) {
          ShowErrMessage(`${result.field}-erinput`, result.error);
        }
      } else if (result.error) {
        alert(result.error);
      }
      return false;
    }
  } catch (error) {
    console.error("❌ Network error:", error);
    alert("❌ Network error: check your internet connection");
    return false;
  }
}
async function DeleteFromDataBase(listToDel) {
  try {
    const idsToDel = listToDel.map((s) => s.id);
    const response = await fetch("./BackEnd/feProcessing/delete_student.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: idsToDel }),
    });

    const result = await response.json();
    if (response.ok && result.success) {
      console.log("✅ Student removed from DB:", result.message);
      return true;
    } else {
      console.error("❌ Error from server:", result.error);
      return false;
    }
  } catch (error) {
    console.error("❌ Network error:", error);
    alert("❌ Network error: check your internet connection");
    return false;
  }
}
