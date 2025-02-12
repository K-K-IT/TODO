document.addEventListener('DOMContentLoaded', loadTasks);
document.getElementById('taskForm').addEventListener('submit', addTask);

// const task = {
//     id: Date.now(),
//     title,
//     description,
//     deadline,
//     completed: false,
//     subtasks: [],
//     pinned: false // Dodane pole do oznaczania przypięcia
// };



function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Sortowanie zadań
    tasks.sort((a, b) => {
        // Najpierw przypięte zadania
        if (a.pinned !== b.pinned) {
            return a.pinned ? -1 : 1; // Przypięte na górze
        }
        
        // Następnie sortuj według terminu
        if (a.completed === b.completed) {
            if (a.deadline && b.deadline) {
                return new Date(a.deadline) - new Date(b.deadline); // Sortuj według daty
            }
            return a.deadline ? -1 : 1; // Zadania z terminem przed tymi bez
        }
        
        // Na końcu sortuj według statusu ukończenia
        return a.completed ? 1 : -1; // Ukończone na końcu
    });

    tasks.forEach(task => displayTask(task));
}



function addTask(e) {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const deadline = document.getElementById('taskDeadline').value;

    const task = {
        id: Date.now(),
        title,
        description,
        deadline,
        completed: false,
        subtasks: []
    };

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    displayTask(task);
    e.target.reset();
}


// function displayTask(task) {
//     const taskList = document.getElementById('taskList');
//     const li = document.createElement('li');
//     li.className = 'list-group-item';
//     li.innerHTML = `
//         <div>
//             <i class="float-right fas fa-star ${task.pinned ? 'text-warning' : 'text-muted'}" style="cursor: pointer;" onclick="togglePin(${task.id})"></i>
//             <strong>${task.title}</strong> <br>
//             <div class="task-description">${task.description}</div> <br>
//             ${task.deadline ? `<span class="badge badge-info">Termin: ${task.deadline}</span>` : ''}<br/><br/>
//             <button class="btn btn-secondary btn-sm" onclick="editTask(${task.id})">Edytuj</button>
//             <button class="btn btn-${task.completed ? 'warning' : 'success'} btn-sm" onclick="toggleComplete(${task.id})">${task.completed ? 'Oznacz jako nieukończone' : 'Zakończ'}</button>
//             <div class="mt-2">
//                 <input type="text" placeholder="Dodaj podzadanie" id="subtaskInput${task.id}" class="form-control d-inline w-50">
//                 <input type="date" id="subtaskDeadline${task.id}" class="form-control d-inline w-25">
//                 <button class="btn btn-primary btn-sm" onclick="addSubtask(${task.id}, document.getElementById('subtaskInput${task.id}').value, document.getElementById('subtaskDeadline${task.id}').value)">Dodaj podzadanie</button>
//             </div>
//             <ul class="list-group mt-2">
//                 ${task.subtasks.map(subtask => `
//                     <li class="list-group-item">
//                         <input type="checkbox" onchange="toggleSubtaskComplete(${task.id}, ${subtask.id})" ${subtask.completed ? 'checked' : ''}>
                  
//                         ${subtask.title} 
//                         <br/>${subtask.deadline ? `<span class="badge badge-info">Termin: ${subtask.deadline}</span>` : ''}
//                         <button class="btn btn-danger btn-sm float-right" onclick="removeSubtask(${task.id}, ${subtask.id})">Usuń</button>
//                     </li>
//                 `).join('')}
//             </ul>
//         </div>
//     `;
//     taskList.appendChild(li);
// }


function displayTask(task) {
    const taskList = document.getElementById('taskList');
    const li = document.createElement('li');
    li.className = 'list-group-item';
    
    li.innerHTML = `
        <div>
            <i class="float-right fas fa-star ${task.pinned ? 'text-warning' : 'text-muted'}" style="cursor: pointer;" data-id="${task.id}" class="toggle-pin"></i>
            <strong>${task.title}</strong> <br>
            <div class="task-description">${task.description}</div> <br>
            ${task.deadline ? `<span class="badge badge-info">Termin: ${task.deadline}</span>` : ''}<br/><br/>
            <button class="btn btn-secondary btn-sm edit-task" data-id="${task.id}">Edytuj</button>
            <button class="btn btn-${task.completed ? 'warning' : 'success'} btn-sm toggle-complete" data-id="${task.id}">${task.completed ? 'Oznacz jako nieukończone' : 'Zakończ'}</button>
            <div class="mt-2">
                <input type="text" placeholder="Dodaj podzadanie" id="subtaskInput${task.id}" class="form-control d-inline w-50">
                <input type="date" id="subtaskDeadline${task.id}" class="form-control d-inline w-25">
                <button class="btn btn-primary btn-sm add-subtask" data-id="${task.id}">Dodaj podzadanie</button>
            </div>
            <ul class="list-group mt-2" id="subtaskList${task.id}">
                ${task.subtasks.map(subtask => `
                    <li class="list-group-item">
                        <input type="checkbox" class="toggle-subtask-complete" data-task-id="${task.id}" data-subtask-id="${subtask.id}" ${subtask.completed ? 'checked' : ''}>
                        ${subtask.title} 
                        <br/>${subtask.deadline ? `<span class="badge badge-info">Termin: ${subtask.deadline}</span>` : ''}
                        <button class="btn btn-danger btn-sm float-right remove-subtask" data-task-id="${task.id}" data-subtask-id="${subtask.id}">Usuń</button>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;

    taskList.appendChild(li);

    // Przypisz zdarzenia
    const togglePinIcon = li.querySelector('.toggle-pin');
    if (togglePinIcon) {
        togglePinIcon.addEventListener('click', () => togglePin(task.id));
    }

    const editButton = li.querySelector('.edit-task');
    if (editButton) {
        editButton.addEventListener('click', () => editTask(task.id));
    }

    const toggleCompleteButton = li.querySelector('.toggle-complete');
    if (toggleCompleteButton) {
        toggleCompleteButton.addEventListener('click', () => toggleComplete(task.id));
    }

    const addSubtaskButton = li.querySelector('.add-subtask');
    if (addSubtaskButton) {
        addSubtaskButton.addEventListener('click', () => {
            const subtaskInput = document.getElementById(`subtaskInput${task.id}`).value;
            const subtaskDeadline = document.getElementById(`subtaskDeadline${task.id}`).value;
            addSubtask(task.id, subtaskInput, subtaskDeadline);
        });
    }

    // Przypisz zdarzenia dla podzadań
    const subtaskCheckboxes = li.querySelectorAll('.toggle-subtask-complete');
    subtaskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const subtaskId = checkbox.getAttribute('data-subtask-id');
            toggleSubtaskComplete(task.id, subtaskId);
        });
    });

    const removeButtons = li.querySelectorAll('.remove-subtask');
    removeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const subtaskId = button.getAttribute('data-subtask-id');
            removeSubtask(task.id, subtaskId);
        });
    });
}





function editTask(id) {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    const task = tasks.find(t => t.id === id);
    if (task) {
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskDeadline').value = task.deadline;
        removeTask(id);
    }
}

function toggleComplete(id) {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    const task = tasks.find(t => t.id === id);
    if (task) {
        if (task.subtasks.length > 0 && task.subtasks.some(sub => !sub.completed)) {
            alert("Nie można zakończyć zadania, ponieważ ma nieukończone podzadania.");
            return;
        }
        task.completed = !task.completed;
        if (task.completed) {
            task.completedDate = new Date().toISOString(); // Ustaw datę ukończenia
        } else {
            delete task.completedDate; // Usuń datę ukończenia, jeśli zadanie jest nieukończone
        }
        localStorage.setItem('tasks', JSON.stringify(tasks));
        refreshTaskList();
    }
}


function removeTask(id) {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    refreshTaskList();
}

function refreshTaskList() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    loadTasks();
}

// Funkcja do dodawania podzadań
function addSubtask(taskId, subtaskTitle, subtaskDeadline) {
    if (!subtaskTitle) {
        alert("Tytuł podzadania nie może być pusty.");
        return;
    }
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        const subtask = {
            id: Date.now(),
            title: subtaskTitle,
            completed: false,
            deadline: subtaskDeadline // Dodaj pole daty ukończenia
        };
        task.subtasks.push(subtask);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        refreshTaskList();
    }
}


// Funkcja do oznaczania podzadań jako ukończone
function toggleSubtaskComplete(taskId, subtaskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        const subtask = task.subtasks.find(s => s.id === subtaskId);
        if (subtask) {
            subtask.completed = !subtask.completed;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            refreshTaskList();
        }
    }
}

// Funkcja do usuwania podzadań
function removeSubtask(taskId, subtaskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        refreshTaskList();
    }
}



function togglePin(id) {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.pinned = !task.pinned; // Zmień status przypięcia
        localStorage.setItem('tasks', JSON.stringify(tasks));
        refreshTaskList();
    }
}

