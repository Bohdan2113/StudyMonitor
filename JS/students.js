document.addEventListener("DOMContentLoaded", () => {
  studentList = LoadStudents();
  ShowAllStudents(studentList);
  syncCheckboxes("header-checkbox", "header-checkbox-ref");
  console.log("Students loaded");
});

function LoadStudents() {
  let id = 1;
  return (JSON.parse(localStorage.getItem("students")) || []).map(
    student => new Student(
      student.id,
      student.checkbox,  // Замініть на реальні поля
      student.group,
      student.fname,
      student.lname,
      student.gender,
      student.bdate
    )
  );
}

function ShowAllStudents(stList) {
  stList.forEach((s) => addStudentToTable(s));
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

let studentList = [];
class Student {
  // static studentId = 0;
  constructor(id, isChecked, group, fname, lname, gender, bdate, status = "lightgray") {
    // this.id = Student.studentId++;
    this.id = id;
    this.checkbox = isChecked;
    this.group = group;
    this.fname = fname;
    this.lname = lname;
    this.gender = gender;
    this.bdate = bdate;
    this.status = status;
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
    if (this.name === "Bohdan Kruk")
      this.status = "green";
    else this.status = "lightgray";

    return this.status;
  }
}
