const getElement = document.querySelector.bind(document);

document.addEventListener("DOMContentLoaded", function () {
  AddEvent();

  const profileInfo = localStorage.getItem("profileInfo");
  if (profileInfo) {
    window.location.href = "students.php";
  }
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

  // ClearForm(loginForm);
  ClearForm(getElement("#register-form"));

  // Обробка логіну
  async function LoginToDB(form) {
    const formData = new FormData(form);

    try {
      const response = await fetch("./BackEnd/feProcessing/login.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        if (result.success) {
          console.log("✅ Sign in successfully:", result.message);
          localStorage.setItem("profileInfo", JSON.stringify(result.profile));
          return true;
        } else if (result.badLogin) {
          ShowErrMessage("usernameL-erinput", result.message);
          return false;
        } else if (result.badPassword) {
          ShowErrMessage("passwordL-erinput", result.message);
          return false;
        }
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
          console.log(result.error);
        }
        return false;
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      alert("❌ Network error: check your internet connection");
      return false;
    }
  }
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

  // Обробка реєстрації
  async function RegisterToDB(form) {
    const formData = new FormData(form);

    try {
      const response = await fetch("./BackEnd/feProcessing/signin.php", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      console.log(JSON.stringify(result, null, 2));
      if (response.ok) {
        if (result.success) {
          console.log("✅ Sign in successfully:", result.message);
          localStorage.setItem("profileInfo", JSON.stringify(result.profile));
          return true;
        } else if (result.alreadyExists) {
          console.log("Username is occupied:", result.message);
          ShowErrMessage("usernameR-erinput", result.message);
          return false;
        }
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
function ShowErrMessage(targetId, message) {
  const target = getElement(`#${targetId}`);
  target.style.display = "block";
  target.textContent = message;

  const siblingInput = target.previousElementSibling;
  if (siblingInput.tagName !== "INPUT") {
    console.log(siblingInput);
    siblingInput.style.borderColor = "red";
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
