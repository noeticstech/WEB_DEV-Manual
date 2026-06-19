/*
  STUDYFLOW - BEGINNER-FRIENDLY JAVASCRIPT

  Main ideas used from your DOM notes:
  1. getElementById() selects HTML elements.
  2. addEventListener() listens for user actions.
  3. value reads what the user entered.
  4. createElement() creates new HTML elements.
  5. textContent adds safe text to an element.
  6. remove() deletes an element.
*/

// STEP 1: Select the HTML elements we need.
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const subjectInput = document.getElementById("subject-input");
const priorityInput = document.getElementById("priority-input");
const dateInput = document.getElementById("date-input");
const formMessage = document.getElementById("form-message");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const taskSummary = document.getElementById("task-summary");
const clearButton = document.getElementById("clear-button");
const totalCount = document.getElementById("total-count");
const completedCount = document.getElementById("completed-count");
const progressPercent = document.getElementById("progress-percent");
const progressFill = document.getElementById("progress-fill");
const todayDate = document.getElementById("today-date");
const filterButtons = document.querySelectorAll(".filter");

/*
  STEP 2: Store application data.
  JSON.parse changes saved text back into a JavaScript array.
  If nothing is saved yet, we start with an empty array.
*/
let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];
let currentFilter = "all";

// Show today's date in the header.
todayDate.textContent = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

// Give the date input today's date as its minimum allowed date.
dateInput.min = new Date().toISOString().split("T")[0];

// STEP 3: Save the tasks array in the browser.
function saveTasks() {
  localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

// Change a date such as 2026-06-19 into 19 Jun.
function formatDate(dateText) {
  if (!dateText) {
    return "No due date";
  }

  const date = new Date(dateText + "T00:00:00");
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

// Decide which tasks should appear for the selected filter.
function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter(function (task) {
      return task.completed === false;
    });
  }

  if (currentFilter === "completed") {
    return tasks.filter(function (task) {
      return task.completed === true;
    });
  }

  return tasks;
}

// STEP 4: Create one <li> task using JavaScript.
function createTaskElement(task) {
  const listItem = document.createElement("li");
  listItem.className = task.completed ? "task-item completed" : "task-item";
  listItem.dataset.id = task.id;

  const completeButton = document.createElement("button");
  completeButton.className = "complete-button";
  completeButton.type = "button";
  completeButton.textContent = "✓";
  completeButton.setAttribute("aria-label", "Mark task complete");

  const taskContent = document.createElement("div");

  const taskName = document.createElement("p");
  taskName.className = "task-name";
  taskName.textContent = task.name;

  const taskMeta = document.createElement("div");
  taskMeta.className = "task-meta";

  const subjectTag = document.createElement("span");
  subjectTag.className = "tag";
  subjectTag.textContent = task.subject;

  const priorityTag = document.createElement("span");
  priorityTag.className = "tag priority-" + task.priority;
  priorityTag.textContent = task.priority + " priority";

  const dueDate = document.createElement("span");
  dueDate.textContent = "Due: " + formatDate(task.date);

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "×";
  deleteButton.setAttribute("aria-label", "Delete task");

  // Put the small elements inside their parent elements.
  taskMeta.appendChild(subjectTag);
  taskMeta.appendChild(priorityTag);
  taskMeta.appendChild(dueDate);
  taskContent.appendChild(taskName);
  taskContent.appendChild(taskMeta);
  listItem.appendChild(completeButton);
  listItem.appendChild(taskContent);
  listItem.appendChild(deleteButton);

  // When the circle is clicked, complete or uncomplete this task.
  completeButton.addEventListener("click", function () {
    toggleTask(task.id);
  });

  // When × is clicked, remove this task.
  deleteButton.addEventListener("click", function () {
    deleteTask(task.id);
  });

  return listItem;
}

// STEP 5: Draw all visible tasks on the page.
function renderTasks() {
  taskList.innerHTML = "";

  const visibleTasks = getFilteredTasks();

  visibleTasks.forEach(function (task) {
    const taskElement = createTaskElement(task);
    taskList.appendChild(taskElement);
  });

  emptyState.style.display = visibleTasks.length === 0 ? "block" : "none";
  updateStatistics();
}

// Update task numbers and the green progress bar.
function updateStatistics() {
  const finishedTasks = tasks.filter(function (task) {
    return task.completed === true;
  }).length;

  const remainingTasks = tasks.length - finishedTasks;
  const percent =
    tasks.length === 0 ? 0 : Math.round((finishedTasks / tasks.length) * 100);

  totalCount.textContent = tasks.length;
  completedCount.textContent = finishedTasks;
  progressPercent.textContent = percent + "%";
  progressFill.style.width = percent + "%";

  taskSummary.textContent =
    remainingTasks === 1
      ? "1 task remaining"
      : remainingTasks + " tasks remaining";
}

// STEP 6: Add a new object to the tasks array.
function addTask(event) {
  // Prevent the form from refreshing the web page.
  event.preventDefault();

  const taskName = taskInput.value.trim();

  if (taskName === "") {
    formMessage.textContent = "Please write a task name.";
    taskInput.focus();
    return;
  }

  const newTask = {
    id: Date.now(),
    name: taskName,
    subject: subjectInput.value,
    priority: priorityInput.value,
    date: dateInput.value,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  formMessage.textContent = "Task added successfully!";
  taskForm.reset();
  priorityInput.value = "Medium";
  taskInput.focus();

  setTimeout(function () {
    formMessage.textContent = "";
  }, 2500);
}

// Find one task and change its completed value.
function toggleTask(taskId) {
  tasks = tasks.map(function (task) {
    if (task.id === taskId) {
      task.completed = !task.completed;
    }
    return task;
  });

  saveTasks();
  renderTasks();
}

// Remove one task from the array.
function deleteTask(taskId) {
  tasks = tasks.filter(function (task) {
    return task.id !== taskId;
  });

  saveTasks();
  renderTasks();
}

// Remove every completed task.
function clearCompletedTasks() {
  tasks = tasks.filter(function (task) {
    return task.completed === false;
  });

  saveTasks();
  renderTasks();
}

// STEP 7: Listen for form submission.
taskForm.addEventListener("submit", addTask);
clearButton.addEventListener("click", clearCompletedTasks);

// Listen for clicks on the All, Active and Completed buttons.
filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(function (filterButton) {
      filterButton.classList.remove("active");
    });

    button.classList.add("active");
    renderTasks();
  });
});

// Draw saved tasks when the page first opens.
renderTasks();
