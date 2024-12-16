// Load tasks from local storage on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});

function toggleTask(taskHeader) {
    const taskSteps = taskHeader.nextElementSibling;
    const arrow = taskHeader.querySelector('.arrow');
    if (taskSteps.classList.contains('hidden')) {
        taskSteps.classList.remove('hidden');
        arrow.textContent = '▲';
    } else {
        taskSteps.classList.add('hidden');
        arrow.textContent = '▼';
    }
}

function markStep(step) {
    const bubble = step.querySelector('.bubble');
    bubble.classList.toggle('checked');
    bubble.innerHTML = bubble.classList.contains('checked') ? '✔' : '';
    saveTasks();
}

function addExtraStep(taskSteps, locked) {
    if (locked) return; // Prevent adding steps when locked
    const step = document.createElement('div');
    step.className = 'step';
    step.onclick = () => markStep(step);
    step.innerHTML = `
        <div class="bubble"></div>
        <span ondblclick="renameElement(this)">New Step</span>
    `;
    step.ondblclick = () => renameElement(step.querySelector('span'));
    taskSteps.appendChild(step);
    saveTasks();
}

function addTask(taskName = 'New Task', steps = [], locked = false) {
    const taskContainer = document.querySelector('.task-container');

    const task = document.createElement('div');
    task.className = 'task';

    // Task Header
    const taskHeader = document.createElement('div');
    taskHeader.className = 'task-header';
    taskHeader.innerHTML = `
        <span ondblclick="renameElement(this)">${taskName}</span>
        <span class="arrow">▼</span>
    `;
    taskHeader.onclick = () => toggleTask(taskHeader);

    const taskSteps = document.createElement('div');
    taskSteps.className = `task-steps ${locked ? '' : 'hidden'}`;

    // Add saved steps or default steps
    if (steps.length > 0) {
        steps.forEach(stepData => {
            const step = document.createElement('div');
            step.className = 'step';
            step.onclick = () => markStep(step);
            step.innerHTML = `
                <div class="bubble ${stepData.checked ? 'checked' : ''}">${stepData.checked ? '✔' : ''}</div>
                <span ondblclick="renameElement(this)">${stepData.name}</span>
            `;
            taskSteps.appendChild(step);
        });
    } else {
        taskSteps.innerHTML = `
            <div class="step" onclick="markStep(this)">
                <div class="bubble"></div>
                <span ondblclick="renameElement(this)">Step 1: Understand basic tags</span>
            </div>
            <div class="step" onclick="markStep(this)">
                <div class="bubble"></div>
                <span ondblclick="renameElement(this)">Step 2: Learn semantic elements</span>
            </div>
        `;
    }

    // Add Extra Step Button
    const addStepButton = document.createElement('button');
    addStepButton.textContent = 'Add Extra Step';
    addStepButton.className = 'add-step-btn';
    addStepButton.onclick = (e) => {
        e.stopPropagation();
        addExtraStep(taskSteps, locked);
    };

    // Lock/Unlock Buttons
    const lockButton = document.createElement('button');
    lockButton.textContent = 'Set in Place';
    lockButton.className = 'lock-btn';
    lockButton.onclick = () => {
        lockTask(true);
    };

    const modifyButton = document.createElement('button');
    modifyButton.textContent = 'Modify';
    modifyButton.className = 'modify-btn';
    modifyButton.style.display = locked ? 'inline' : 'none';
    modifyButton.onclick = () => {
        lockTask(false);
    };

    function lockTask(isLocked) {
        const allInputs = task.querySelectorAll('span[ondblclick]');
        allInputs.forEach(span => {
            span.ondblclick = isLocked ? null : () => renameElement(span);
        });
        addStepButton.disabled = isLocked;
        lockButton.style.display = isLocked ? 'none' : 'inline';
        modifyButton.style.display = isLocked ? 'inline' : 'none';
        saveTasks();
    }

    // Delete Button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete Task';
    deleteButton.className = 'delete-task-btn';
    deleteButton.onclick = () => {
        task.remove();
        saveTasks();
    };

    task.appendChild(taskHeader);
    task.appendChild(taskSteps);
    task.appendChild(addStepButton);
    task.appendChild(lockButton);
    task.appendChild(modifyButton);
    task.appendChild(deleteButton);

    taskContainer.appendChild(task);
    saveTasks();
}

function renameElement(element) {
    const newName = prompt('Enter new name:', element.textContent);
    if (newName !== null && newName.trim() !== '') {
        element.textContent = newName;
        saveTasks();
    }
}

// Save tasks to local storage
function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.task').forEach(task => {
        const taskName = task.querySelector('.task-header span').textContent;
        const steps = [];
        task.querySelectorAll('.step').forEach(step => {
            steps.push({
                name: step.querySelector('span').textContent,
                checked: step.querySelector('.bubble').classList.contains('checked')
            });
        });
        const locked = task.querySelector('.add-step-btn').disabled;
        tasks.push({ name: taskName, steps, locked });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from local storage
function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(taskData => {
        addTask(taskData.name, taskData.steps, taskData.locked);
    });
}

// Event Listener for "Add Task" Button
document.querySelector('#add-task-button').addEventListener('click', () => addTask());
