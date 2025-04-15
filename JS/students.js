document.addEventListener("DOMContentLoaded", async () => {
  studentList = await LoadStudentsFromServer();
  ShowAllStudents(studentList);
  syncCheckboxes("header-checkbox", "header-checkbox-ref");
  console.log("Students loaded");
});

// Add input events to the form fields
window.onload = function () {
  const inputFields = GetFormInputFields();
  for (const key in inputFields) {
    if (inputFields[key] !== undefined && key !== "id") {
      inputFields[key].addEventListener("input", HideErrorMessage);
    }
  }
};
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
  constructor(
    id,
    isChecked,
    group_name,
    fname,
    lname,
    gender,
    bdate,
    status = "lightgray"
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
  formatDate() {
    if (!this.bdate) return "";

    const date = new Date(this.bdate); // Перетворюємо рядок на об'єкт Date
    const day = String(date.getDate()).padStart(2, "0"); // Додаємо нуль, якщо день однозначний
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Місяць (1-12), додаємо нуль
    const year = date.getFullYear(); // Рік (повний)

    return `${day}.${month}.${year}`;
  }

  defineStatusColor() {
    if (this.name === "Bohdan Kruk") this.status = "green";
    else this.status = "lightgray";

    return this.status;
  }
}

async function LoadStudentsFromServer() {
  try {
    const response = await fetch("./BackEnd/get_students.php");
    const data = await response.json();
    return data.map(
      (student) =>
        new Student(
          student.id,
          student.checkbox,
          student.group_name,
          student.fname,
          student.lname,
          student.gender,
          student.bdate,
          student.status
        )
    );
  } catch (error) {
    console.error("Помилка завантаження студентів:", error);
    return [];
  }
}
async function AddStToDatabase(newStudent) {
  try {
    const studentData = {
      id: newStudent.id,
      checkbox: newStudent.checkbox,
      group_name: newStudent.group_name,
      fname: newStudent.fname,
      lname: newStudent.lname,
      gender: newStudent.gender,
      bdate: newStudent.bdate,
      status: newStudent.status,
    };

    const response = await fetch("./BackEnd/add_student.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentData),
    });

    const result = await response.json();
    if (response.ok && result.success) {
      console.log("✅ Student added to DB:", result.message);
    } else {
      console.error("❌ Error from server:", result.error);
    }
  } catch (error) {
    console.error("❌ Network error:", error);
  }
}
async function UpdateStInDatabase(student) {
  try {
    const studentData = {
      id: student.id,
      checkbox: student.checkbox,
      group_name: student.group_name,
      fname: student.fname,
      lname: student.lname,
      gender: student.gender,
      bdate: student.bdate,
      status: student.status,
    };

    const response = await fetch("./BackEnd/update_student.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentData),
    });

    const result = await response.json();
    if (response.ok && result.success) {
      console.log("✅ Student updated in DB:", result.message);
    } else {
      console.error("❌ Error from server:", result.error);
    }
  } catch (error) {
    console.error("❌ Network error:", error);
  }
}
async function DeleteFromDataBase(listToDel) {
  try {
    const idsToDel = listToDel.map((s) => s.id);
    const response = await fetch("./BackEnd/delete_student.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: idsToDel }),
    });

    const result = await response.json();
    if (response.ok && result.success) {
      console.log("✅ Student removed from DB:", result.message);
    } else {
      console.error("❌ Error from server:", result.error);
    }
  } catch (error) {
    console.error("❌ Network error:", error);
  }
}
