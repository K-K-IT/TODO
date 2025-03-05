document.getElementById("taskForm").addEventListener("submit", addTask);
document.getElementById("taskFormModal").addEventListener("submit", updateTask);





let title, description, deadline, category;
let categoryName;
const today = new Date()
today.setHours(1, 0, 0, 0);
init();

function init() {
  readTasks();
  displayTasks();
}

function addTask(e) {
  e.preventDefault();
  title = document.getElementById("taskTitle").value;
  description = document.getElementById("taskDescription").value;
  deadline = document.getElementById("taskDeadline").value;
  const task = {
    id: Date.now(),
    title: title,
    description: description,
    deadline: deadline,
    completed: false,
    subtasks: [],
    pinned: false,
  };
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  e.target.reset();
  displayTasks();
}

function readTasks() {
  // tasks = JSON.parse(localStorage.getItem("tasks")) || [];
   tasks = JSON.parse(localStorage.getItem("tasks"));
    if (!tasks) {
      tasks = [];
    }
}



function createContext() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  let sortedTasks = sortTasks(tasks);

  sortedTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    let formCheck = document.createElement("div");
    li.setAttribute("data-id", task.id);
    let taskCheckbox = document.createElement("input");
    taskCheckbox.className = "form-check-input taskTitle";
    taskCheckbox.type = "checkbox";
    taskCheckbox.onchange = function() {
      checkboxChange(task.id, taskCheckbox.checked);
    }
    
    if (task.completed) {
      taskCheckbox.checked = true;
    }
    taskCheckbox.id = "checkbox-" + task.id;
    taskCheckbox.setAttribute("data-id", task.id);
    let titleLabel = document.createElement("label");
    titleLabel.textContent = task.title;
    titleLabel.id = "label-" + task.title;
    titleLabel.setAttribute("style","font-weight: 600;")
    if (task.completed) {
      titleLabel.innerHTML = `<s>${titleLabel.textContent}</s>`;
    }
    // titleLabel.setAttribute("for", "checkbox-" + task.id);
    titleLabel.setAttribute("data-bs-toggle", "collapse");
    titleLabel.setAttribute("data-bs-target", "#" + "details-" + task.id);
    titleLabel.setAttribute("aria-expanded", "false");
    titleLabel.setAttribute("aria-controls", "details-" + task.id);
    const date = document.createElement("span");
    let data = task.deadline
    if ( new Date(data).getTime() > today.getTime()){
      date.className =  "badge float-center text-bg-success"
    }
    if (new Date(data).getTime()  === today.getTime()){
      date.className = "badge float-center text-bg-warning"
    }
    if (new Date(data).getTime()  < today.getTime()){
      date.className = "badge float-center text-bg-danger"
    }

    date.textContent = task.deadline;
    formCheck.className = "form-check";
    formCheck.appendChild(taskCheckbox);
    formCheck.appendChild(titleLabel);

    const buttonsGroup = document.createElement("div");
    buttonsGroup.className = "btn-group float-right";
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edytuj";
    editButton.className = "btn btn-primary"
    editButton.setAttribute("data-bs-toggle","modal")
    editButton.setAttribute("data-bs-target","#editModal")
    editButton.onclick = function(){
     fillModal(task) ;
    }
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.onclick = function(){
      document.getElementById("confirmRemove").onclick = function(){
        deleteTask(task.id) ;
       }
    }
    removeButton.className = "btn btn-danger remove-task float-right";
    removeButton.textContent = "Usuń";
    removeButton.id = task.id;
    removeButton.setAttribute("data-bs-toggle","modal")
    removeButton.setAttribute("data-bs-target","#confirmRemoveModal")

    // ="modal" ="#exampleModal"

    const detailsButton = document.createElement("button");
    detailsButton.type = "button";
    detailsButton.className = "btn btn-success add-task float-right";
    detailsButton.textContent = "Szczegóły";
    // detailsButton.id = task.id;
    detailsButton.setAttribute("data-bs-toggle", "collapse");
    detailsButton.setAttribute("data-bs-target", "#" + "details-" + task.id);
    detailsButton.setAttribute("aria-expanded", "false");
    detailsButton.setAttribute("aria-controls", "details-" + task.id);
    // let detailsIcon = document.createElement('img')
    // detailsIcon.src ='src/svg/details.svg'
    // detailsButton.appendChild(detailsIcon)

    buttonsGroup.appendChild(detailsButton);
    buttonsGroup.appendChild(editButton);
    buttonsGroup.appendChild(removeButton);
    formCheck.appendChild(buttonsGroup);
    formCheck.appendChild(document.createElement("br"));
    formCheck.appendChild(date);
    li.appendChild(formCheck);
    let details = document.createElement("div");
    details.className = "collapse";
    details.id = "details-" + task.id;
    let detailsBody = document.createElement("div");
    detailsBody.className = "card card-body";
    detailsBody.innerText = task.description;
    details.appendChild(detailsBody);
    li.appendChild(details);
    taskList.appendChild(li);
  });
}

function displayTasks() {
  createContext();

  deleteButtons = document.querySelectorAll(".remove-task");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const taskId = parseInt(button.getAttribute("id"));
      const task = tasks.find((t) => t.id === taskId);

      document.getElementById("removeTaskWarningTaskTitle").innerText = task.title
      // deleteTask(taskId);
    });
  });
}


function checkboxChange(taskId, completed) {

  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    if (completed) {
      task.completed = true;
    } else {
      task.completed = false;
    }

    localStorage.setItem("tasks", JSON.stringify(tasks));

    init()
  }
}

function sortTasks(tasks) {
  return tasks.sort((a, b) => {
    // 1. Sortowanie według pinned
    if (a.pinned && !b.pinned) {
      return -1; // a jest pinned, więc powinno być przed b
    }
    if (!a.pinned && b.pinned) {
      return 1; // b jest pinned, więc a powinno być za b
    }

    // 2. Sortowanie według completed
    if (a.completed && !b.completed) {
      return 1; // a jest completed, więc powinno być za b
    }
    if (!a.completed && b.completed) {
      return -1; // b jest completed, więc a powinno być przed b
    }

    // 3. Sortowanie według deadline
    if (!a.deadline && !b.deadline) {
      return 0; // Oba są puste, nie zmieniaj ich kolejności
    }
    if (!a.deadline) {
      return 1; // a jest puste, więc powinno być na końcu
    }
    if (!b.deadline) {
      return -1; // b jest puste, więc a powinno być przed b
    }

    // Porównanie dat
    return new Date(a.deadline) - new Date(b.deadline);
  });
}



function deleteTask(taskId) {
  // 1. Pobierz tablicę tasks z localStorage
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // 2. Filtruj tablicę, aby usunąć zadanie o podanym id
  const updatedTasks = tasks.filter((task) => task.id !== taskId);

  // 3. Zaktualizuj localStorage
  localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  const listItem = document.querySelector(`li[data-id="${taskId}"]`);
  listItem.remove();
  readTasks();
  createContext();
}


function fillModal(task) {
  document.getElementById("taskTitleModal").value = task.title
  document.getElementById("taskDeadlineModal").value = task.deadline
  document.getElementById("taskDescriptionModal").value = task.description
  document.getElementById("taskFormModal").setAttribute("data-id", task.id)


}

function updateTask(){
  // e.preventDefault();
  let id = document.getElementById("taskFormModal").getAttribute("data-id")
  let updatedTask = tasks.filter((task) => task.id == id);

  // const updatedTasks = tasks.map((task) => {
  //   if (task.id === id) {
  //     task.title = document.getElementById("taskTitleModal").value
  //     task.description = document.getElementById("taskDescriptionModal").value
  //     task.deadline = document.getElementById("taskDeadlineModal").value
  //   }
  //   return task;
  // });
  
  tasks.forEach((task)=>{
    // console.log("before: " + task.title)
    if (task.id == id) {
      // console.log("znaleziono task: " + task.title )
      task.title = document.getElementById("taskTitleModal").value
      task.description = document.getElementById("taskDescriptionModal").value
      task.deadline = document.getElementById("taskDeadlineModal").value
    }
    console.log("after: " + task.title)
  })

  localStorage.setItem("tasks", JSON.stringify(tasks));
  // e.target.reset();
  displayTasks();
}