const getElement = document.querySelector.bind(document);

document.addEventListener("DOMContentLoaded", function () {
  AddEvent();
});

function AddEvent() {
  const loginBlock = document.getElementById("loginBlock");
  const registerBlock = document.getElementById("registerBlock");
  const showRegister = document.getElementById("showRegister");
  const showLogin = document.getElementById("showLogin");
  showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    loginBlock.classList.add("hidden");
    registerBlock.classList.remove("hidden");
  });
  showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    registerBlock.classList.add("hidden");
    loginBlock.classList.remove("hidden");
  });

  AddInputEvent(getElement("#login-form"));
  AddInputEvent(getElement("#register-form"));
  function AddInputEvent(form) {
    const elements = form.elements;
    for (let i = 0; i < elements.length; i++) {
      elements[i].addEventListener("input", HideErrorMessage);
    }
  }
}

async function LoginBut(event) {
  event.preventDefault();
  const loginForm = getElement("#login-form");
  if (!loginForm.checkValidity()) {
    loginForm.reportValidity();
    return;
  }

  if (!ValidateLoginFormInput(loginForm)) return;
  if (!(await LoginToDB(loginForm))) return;
  window.location.href = "students.php";

  ClearForm(loginForm);
  ClearForm(getElement("#register-form"));
}
async function SigninBut(event) {
  event.preventDefault();
  const registerForm = getElement("#register-form");
  if (!registerForm.checkValidity()) {
    registerForm.reportValidity();
    return;
  }

  if (!ValidateRegisterFormInput(registerForm)) return;
  if (!(await RegisterToDB(registerForm))) return;
  window.location.href = "students.php";

  ClearForm(registerForm);
  ClearForm(getElement("#login-form"));
}

function ValidateLoginFormInput(form) {
  let isValid = true;
  let message = "Error input";
  const username = form["usernameL"];
  const password = form["passwordL"];

  // Перевіряєм username на присутність та коректність
  ValidateField(
    username,
    IsValidUsername(username.value),
    `${username.name}-erinput`,
    message
  );

  // // Перевіряєм пароль на присутність
  // ValidateField(
  //   password,
  //   password.value,
  //   `${password.name}-erinput`,
  //   "Fill this field"
  // );

  return isValid;

  function ValidateField(field, predicat, messageId, message = "Error input") {
    const errOutput = document.getElementById(messageId);
    if (!predicat) {
      field.style.borderColor = "red";
      errOutput.style.display = "block";
      errOutput.textContent = message;

      isValid = false;
    } else {
      field.style.borderColor = "#ccc";
      errOutput.style.display = "none";
    }
  }
  function IsValidUsername(text) {
    // if (!text) {
    //   message = "Fill this field";
    //   return false;
    // }

    const errPattern = /[^a-zA-Z0-9-]+/;
    if (errPattern.test(text)) {
      message = "Wrong input. Alowed characters are: [a-z], [A-Z], -";
      return false;
    }

    return true;
  }
}
function ValidateRegisterFormInput(form) {
  let isValid = true;
  let message = "Error input";
  const fname = form["fnameR"];
  const lname = form["lnameR"];
  const username = form["usernameR"];
  const password = form["passwordR"];

  // Перевіряєм ім'я на присутність та коректність
  ValidateField(
    fname,
    IsValidName(fname.value),
    `${fname.name}-erinput`,
    message
  );

  // Перевіряєм прізвище на присутність та коректність
  ValidateField(
    lname,
    IsValidName(lname.value),
    `${lname.name}-erinput`,
    message
  );

  // Перевіряєм username на присутність та коректність
  ValidateField(
    username,
    IsValidUsername(username.value),
    `${username.name}-erinput`,
    message
  );

  // // Перевіряєм пароль на присутність
  // ValidateField(
  //   password,
  //   password.value,
  //   `${password.name}-erinput`,
  //   "Fill this field"
  // );

  return isValid;

  function ValidateField(field, predicat, messageId, message = "Error input") {
    const errOutput = document.getElementById(messageId);
    if (!predicat) {
      field.style.borderColor = "red";
      errOutput.style.display = "block";
      errOutput.textContent = message;

      isValid = false;
    } else {
      field.style.borderColor = "#ccc";
      errOutput.style.display = "none";
    }
  }

  function IsValidUsername(text) {
    // if (!text) {
    //   message = "Fill this field";
    //   return false;
    // }

    const errPattern = /[^a-zA-Z-]+/;
    if (errPattern.test(text)) {
      message = "Wrong input. Alowed characters are: [a-z], [A-Z], -";
      return false;
    }

    return true;
  }
  function IsValidName(text) {
    // if (!text) {
    //   message = "Fill this field";
    //   return false;
    // }

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
}
function HideErrorMessage(event) {
  const message = getElement(`#${event.target.name}-erinput`);
  message.style.display = "none";
  event.target.style.borderColor = "#ccc";
}
function ClearForm(form) {
  form.reset();

  const inputFields = form.querySelectorAll("input, select");
  inputFields.forEach((field) => {
    field.style.borderColor = "#ccc";
    const errorElement = document.getElementById(`${field.name}-erinput`);
    if (errorElement) {
      errorElement.style.display = "none";
    }
  });

  const loginBlock = getElement("#loginBlock");
  const registerBlock = getElement("#registerBlock");
  loginBlock.classList.remove("hidden");
  registerBlock.classList.add("hidden");
}

// Обробка логіну
async function LoginToDB(form) {
  const formData = new FormData(form);
  formData.append("action", "login");

  try {
    const response = await fetch("./Backend/auth.php", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    console.log(JSON.stringify(result, null, 2));
    if (response.ok) {
      if (result.success) {
        console.log("✅ Sign in successfully:", result.message);
        sessionStorage.setItem("profileInfo", JSON.stringify(result.profile));
        return true;
      } else if (result.badLogin) {
        console.log("Wrong username:", result.message);
        return false;
      } else if (result.badPassword) {
        console.log("Wrong password:", result.message);
        return true;
      }
    } else {
      console.error("❌ Error from server:", result.error);
      return false;
    }
  } catch (error) {
    console.error("❌ Network error:", error);
    return false;
  }
}
// Обробка реєстрації
async function RegisterToDB(form) {
  const formData = new FormData(form);
  formData.append("action", "register");

  try {
    const response = await fetch("./Backend/auth.php", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    console.log(JSON.stringify(result, null, 2));
    if (response.ok) {
      if (result.success) {
        console.log("✅ Sign in successfully:", result.message);
        sessionStorage.setItem("profileInfo", JSON.stringify(result.profile));
        return true;
      } else if (result.alreadyExists) {
        console.log("Username is occupied:", result.message);
        return false;
      }
    } else {
      console.error("❌ Error from server:", result.error);
      return false;
    }
  } catch (error) {
    console.error("❌ Network error:", error);
    return false;
  }
}
