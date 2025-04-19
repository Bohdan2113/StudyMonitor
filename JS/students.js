document.addEventListener("DOMContentLoaded", async () => {
  studentList = await LoadStudentsFromServer();
  ShowAllStudents(studentList);
  syncCheckboxes("header-checkbox", "header-checkbox-ref");
  console.log("Students loaded");
});

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

function ShowAllStudents(stList) {
  stList.forEach((s) => addStudentToTable(s));
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
    console.error("❌ Network error:", error);
    alert("❌ Network error: check your internet connection");
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
