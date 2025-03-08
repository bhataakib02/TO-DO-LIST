// Get DOM Elements
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const categorySelect = document.getElementById('category-select');
const voiceInputButton = document.getElementById('voice-input-button');
const exportButton = document.getElementById('export-tasks');
const importButton = document.getElementById('import-tasks');
const dueDateInput = document.getElementById('due-date-input');
const searchInput = document.getElementById('search-input');
const statsCompleted = document.getElementById('stats-completed');
const statsPending = document.getElementById('stats-pending');
const progressBar = document.getElementById('progress');

// Global Task Array
let tasks = [];

// Function to Update Task Statistics and Progress Bar
const updateStatsAndProgress = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    statsCompleted.textContent = completedTasks;
    statsPending.textContent = pendingTasks;
    const progressPercent = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
    progressBar.style.width = `${progressPercent}%`;
};

// Function to Render Task List
const renderTaskList = () => {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item priority-${task.category.toLowerCase()}`;
        if (task.completed) taskItem.classList.add('completed');

        taskItem.innerHTML = `
            <span>${task.text}</span>
            ${task.dueDate ? `<small>Due: ${task.dueDate}</small>` : ''}
            <button class="complete-button" onclick="toggleComplete(${index})">✔️</button>
            <button class="delete-button" onclick="deleteTask(${index})">❌</button>
        `;
        taskList.appendChild(taskItem);
    });
    updateStatsAndProgress();
};

// Add New Task
const addTask = () => {
    const taskText = taskInput.value.trim();
    const category = categorySelect.value;
    const dueDate = dueDateInput.value;

    if (taskText === '') return;

    const newTask = {
        text: taskText,
        category: category,
        completed: false,
        dueDate: dueDate
    };

    tasks.push(newTask);
    taskInput.value = '';
    dueDateInput.value = '';
    categorySelect.value = 'Low';
    renderTaskList();
};

// Toggle Task Completion
const toggleComplete = (index) => {
    tasks[index].completed = !tasks[index].completed;
    renderTaskList();
};

// Delete Task
const deleteTask = (index) => {
    tasks.splice(index, 1);
    renderTaskList();
};

// Voice Input using Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    voiceInputButton.addEventListener('click', () => {
        recognition.start();
    });

    recognition.addEventListener('result', (event) => {
        const transcript = event.results[0][0].transcript;
        taskInput.value = transcript;
    });

    recognition.addEventListener('end', () => {
        recognition.stop();
    });
} else {
    alert("Your browser doesn't support Voice Recognition.");
}

// Export Tasks as JSON
exportButton.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.json';
    a.click();
    URL.revokeObjectURL(url);
});

// Import Tasks from JSON
importButton.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        tasks = JSON.parse(e.target.result);
        renderTaskList();
    };
    reader.readAsText(file);
});

// Search and Filter Tasks
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    document.querySelectorAll('.task-item').forEach(item => {
        const text = item.querySelector('span').textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'block' : 'none';
    });
});

// Add Task on Enter Key
taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Initial Render and Stats Update
renderTaskList();
