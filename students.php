<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="A site with students table" />

    <title>Students</title>

    <link rel="stylesheet" href="CSS/students.css" />
    <link rel="stylesheet" href="CSS/general.css" />
    <link rel="stylesheet" href="CSS/header.css" />
    <link rel="stylesheet" href="CSS/nav.css" />

    <script src="JS/cashe.js" defer></script>
    <script src="JS/components.js"></script>
    <link rel="manifest" href="manifest.json" />
  </head>

  <body>
    <header id="header-placeholder"></header>
    <nav id="nav-placeholder"></nav>

    <section>
      <div class="table_header">
        <h2 class="text_edit tableName">Students</h2>
        <div id="th_control_wreper">
          <button
            id="add_student_btn"
            aria-label="Add new student"
            title="Add new student"
            onclick="addStudentButton()"
          >
            +
          </button>
          <button
            id="del_all_btn"
            aria-label="Delete all choosen students"
            title="Delete all choosen students"
            onclick="DeleteAllChoosen()"
          >
            <img src="./Images/bin.png" alt="bucket" />
          </button>
        </div>
      </div>

      <div class="table-container">
        <div id="media-select-all">
          <label for="header-checkbox-ref" class="checkbox-text"
            >Select all</label
          >
          <input
            type="checkbox"
            title="Select all"
            aria-label="Select all student"
            id="header-checkbox-ref"
          />
        </div>

        <table id="students_table">
          <thead>
            <tr>
              <th class="checkAll" scope="col">
                <div class="checkbox-text">All</div>
                <input
                  type="checkbox"
                  title="Select all"
                  aria-label="Select all student"
                  id="header-checkbox"
                  onchange="toggleAllCheckbox('header-checkbox')"
                />
              </th>
              <th scope="col" class="group">Group</th>
              <th scope="col" class="name">Name</th>
              <th scope="col" class="gender">Gender</th>
              <th scope="col" class="birthday">Birthday</th>
              <th scope="col" class="status">Status</th>
              <th scope="col" class="options">Options</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>

      <div id="paginationContainer" class="tableNext"></div>
    </section>

    <div id="shadow-wraper">
      <div id="del-student-block">
        <div class="newBlock-header">
          <h3 class="text_edit">Warning</h3>
          <button
            class="close_button"
            onclick="CloseDelete('del-student-block')"
          >
            <span>+</span>
          </button>
        </div>

        <div class="block-data-container">
          <p class="text_edit warningdel-message"></p>
        </div>

        <div class="btn-container">
          <button
            class="cancel_button"
            onclick="CloseDelete('del-student-block')"
          >
            Cancel
          </button>
          <button id="ok_button">Ok</button>
        </div>
      </div>

      <div id="edit-student-block">
        <div class="newBlock-header">
          <h3 class="text_edit" id="edit-block-header">Add student</h3>
          <button
            class="close_button"
            onclick="CloseEdit('edit-student-block')"
          >
            <span>+</span>
          </button>
        </div>

        <div class="block-data-container">
          <form id="student-form">
            <input type="hidden" id="id" name="id" />
            <div class="input-group">
              <label for="group">Group:</label>
              <div class="input-error-group">
                <select id="group" name="group" required>
                  <option value="" hidden selected>Select group</option>
                  <option value="PZ-21">PZ-21</option>
                  <option value="PZ-22">PZ-22</option>
                  <option value="PZ-23">PZ-23</option>
                  <option value="PZ-24">PZ-24</option>
                  <option value="PZ-25">PZ-25</option>
                  <option value="PZ-26">PZ-26</option>
                </select>
                <p class="erinput-message text_edit" id="group-erinput">
                  Error input
                </p>
              </div>
            </div>
            <div class="input-group">
              <label for="fname">First name:</label>
              <div class="input-error-group">
                <input type="text" id="fname" name="fname" required />
                <p class="erinput-message text_edit" id="fname-erinput">
                  Error input
                </p>
              </div>
            </div>
            <div class="input-group">
              <label for="lname">Last name:</label>
              <div class="input-error-group">
                <input type="text" id="lname" name="lname" required />
                <p class="erinput-message text_edit" id="lname-erinput">
                  Error input
                </p>
              </div>
            </div>
            <div class="input-group">
              <label for="gender">Gender:</label>
              <div class="input-error-group">
                <select id="gender" name="gender" required>
                  <option value="" hidden selected>Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <p class="erinput-message text_edit" id="gender-erinput">
                  Error input
                </p>
              </div>
            </div>
            <div class="input-group">
              <label for="bdate">Birthday:</label>
              <div class="input-error-group">
                <input type="date" id="bdate" name="bdate" required />
                <p class="erinput-message text_edit" id="bdate-erinput">
                  Error input
                </p>
              </div>
            </div>
          </form>
        </div>

        <div class="btn-container">
          <button
            class="cancel_button"
            onclick="CloseEdit('edit-student-block')"
          >
            Cancel
          </button>
          <button id="confirm-edit-button">Save</button>
        </div>
      </div>
    </div>

    <script src="JS/script.js" defer></script>
    <script src="JS/students.js" defer></script>
  </body>
</html>
