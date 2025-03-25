document.addEventListener("DOMContentLoaded", () => {
  studentList = LoadStudents();
  ShowAllStudents(studentList);
  syncCheckboxes("header-checkbox", "header-checkbox-ref");
  console.log("Students loaded");
});

function LoadStudents() {
  return [
    new Student(false, "PZ-21", "Bohdan", "Kruk", "Male", "2006-05-01"),
    new Student(false, "PZ-21", "Victor", "Piznak", "Male", "2005-08-27"),
    new Student(false, "PZ-21", "Liza", "Zapisotska", "Female", "2006-01-25"),
    new Student(false, "PZ-21", "Ivanna", "Pavlushyn", "Female", "2006-01-25"),
  ];
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
    const fullName = profileName
      ? profileName.textContent.trim()
      : "not loaded";
    // console.log("Profile name: " + fullName);

    if (fullName !== null && this.name.trim() === fullName)
      this.status = "green";
    else this.status = "lightgray";

    return this.status;
  }
}
