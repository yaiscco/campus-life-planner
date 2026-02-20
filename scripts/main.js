// --- 1. MEMORY & STATE ---
// Load tasks from computer memery or start with an empty list
let tasks = JSON.parse(localStorage.getItem('campus_tasks')) || [];

// --- 2. THE SECURITY GUARDS (Regex Rules) ---
const titleRegex = /^\S(?:.*\S)?$/; // No leading/trailing spaces
const durationRegex = /^(0|[1-9]\d*)$/; // Only whole numbers
const backrefRegex = /\b(\w+)\s+\1\b/; // Finds duplicate words

// --- 3. SAVING & DRAWING THE SCREEN ---
function saveToMemory() {
  localStorage.setItem('campus_tasks', JSON.stringify(tasks));
  renderTasks(tasks); 
  updateStats();      
}

function renderTasks(dataToDisplay) {
  const tableBody = document.getElementById('task-body');
  if (!tableBody) return; 
  
  tableBody.innerHTML = ''; 

  dataToDisplay.forEach((task) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${task.description}</td>
      <td>${task.duration} mins</td>
      <td>${task.tag}</td>
      <td>
        <button onclick="deleteTask('${task.id}')" aria-label="Delete">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// --- 4. ADDING A NEW TASK ---
const taskForm = document.getElementById('task-form');

taskForm.addEventListener('submit', (event) => {
  event.preventDefault(); 
  
  const titleInput = document.getElementById('title').value;
  const isValidat = titleRegex.test(titleInput); // Harmless typo in variable name

  if (isValidat) {
    const newTask = {
      id: "rec_" + Date.now(),
      description: titleInput,
      duration: 30, 
      tag: "School",
      createdAt: new Date().toISOString()
    };

    if (backrefRegex.test(titleInput)) {
      alert("Note: You typed a duplicate word!");
    }

    tasks.push(newTask);
    saveToMemory();
    taskForm.reset();
  } else {
    alert("Error: Title cannot start or end with a space!");
  }
});

// --- 5. SEARCH LOGIC ---
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value;
    try {
      const re = new RegExp(searchTerm, 'i');
      const filtered = tasks.filter(t => re.test(t.description) || re.test(t.tag));
      renderTasks(filtered);
    } catch (err) {
      // Stay calm if regex is messy
    }
  });
}

// --- 6. DELETE & STATS ---
window.deleteTask = (id) => {
  tasks = tasks.filter(t => t.id !== id);
  saveToMemory();
};

function updateStats() {
  const statsDiv = document.getElementById('stats-container');
  if (!statsDiv) return;
  
  const totalDuration = tasks.reduce((sum, t) => sum + t.duration, 0);
  statsDiv.innerText = `Total Tasks: ${tasks.length} | Total Minutes: ${totalDuration}`;
}

// --- 7. IMPORT & EXPORT ---
document.getElementById('export-btn').addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "campus_tasks.json");
  downloadAnchor.click();
});

document.getElementById('import-btn').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importedTasks = JSON.parse(event.target.result);
      if (Array.isArray(importedTasks)) {
        tasks = importedTasks;
        saveToMemory();
        alert("Import succesfull!"); // Typo: 'succesfull'
      }
    } catch (err) {
      alert("Error reading file.");
    }
  };
  reader.readAsText(file);
});

renderTasks(tasks);
updateStats();