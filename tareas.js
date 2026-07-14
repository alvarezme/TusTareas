const API_URL = 'http://localhost:3000/api/tasks';

// 1. RECUPERAR EL USUARIO GUARDADO
const rawUser = localStorage.getItem('user');
let user = null;

try {
  user = rawUser ? JSON.parse(rawUser) : null;
} catch (e) {
  console.error("Error al parsear el usuario de localStorage:", e);
}

// Redirección de seguridad: si no hay sesión iniciada, de vuelta al login
if (!user || (!user.id && !user.user?.id)) {
  alert('Por favor, inicia sesión para acceder a tus tareas.');
  window.location.href = 'index.html';
}

// Tolerancia de ID: Extrae el ID real si el login guardó el objeto anidado { user: { id: ... } }
const userId = user.id || (user.user && user.user.id);
const userName = user.name || (user.user && user.user.name) || 'Usuario';

// 2. ELEMENTOS DEL DOM (Ajustados con tus IDs exactos del HTML)
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');
const tasksContainer = document.getElementById('tasks-container');
const btnLogout = document.getElementById('btn-logout');
const userDisplayName = document.getElementById('user-display-name');

// Elementos de filtros
const filterAll = document.getElementById('filter-all');
const filterPending = document.getElementById('filter-pending');
const filterCompleted = document.getElementById('filter-completed');

// Array local para almacenar temporalmente las tareas
let allTasks = [];

// Mostrar el nombre del usuario en el Navbar
if (userDisplayName) {
  userDisplayName.textContent = `¡Hola, ${userName}!`;
}

// Cabeceras configuradas con el identificador del usuario
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'user-id': userId
});

// 3. CARGAR TAREAS DESDE EL SERVIDOR
async function loadTasks() {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) throw new Error('Error al obtener las tareas de la base de datos');

    allTasks = await response.json();
    console.log("Tareas cargadas del servidor:", allTasks); // Diagnóstico en consola (F12)
    applyFilterAndRender(); 
  } catch (error) {
    console.error('Error de carga:', error);
  }
}

// 4. RENDERIZAR TAREAS SEGÚN EL FILTRO ACTIVO
function applyFilterAndRender() {
  let filteredTasks = [...allTasks];

  if (filterPending && filterPending.checked) {
    filteredTasks = allTasks.filter(task => !task.completed);
  } else if (filterCompleted && filterCompleted.checked) {
    filteredTasks = allTasks.filter(task => task.completed);
  }

  renderTasks(filteredTasks);
}

function renderTasks(tasks) {
  tasksContainer.innerHTML = '';

  if (!tasks || tasks.length === 0) {
    tasksContainer.innerHTML = `
      <div class="text-center py-5 text-muted" id="tasks-placeholder">
        <i class="bi bi-journal-x fs-1"></i>
        <p class="mt-2">No hay tareas creadas todavía.</p>
      </div>
    `;
    return;
  }

  tasks.forEach(task => {
    // Tolerancia de propiedad ID (Sequelize usa id)
    const taskId = task.id; 
    
    const div = document.createElement('div');
    div.className = `list-group-item d-flex justify-content-between align-items-center p-3 border rounded shadow-sm bg-white mb-2 ${task.completed ? 'opacity-75' : ''}`;
    
    div.innerHTML = `
      <div class="d-flex align-items-start gap-3">
        <input class="form-check-input mt-1" type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask('${taskId}', ${task.completed})">
        <div>
          <span class="fw-bold d-block ${task.completed ? 'text-decoration-line-through text-muted' : 'text-dark'}">${task.title}</span>
          ${task.description ? `<small class="text-muted d-block">${task.description}</small>` : ''}
        </div>
      </div>
      <button class="btn btn-sm btn-outline-danger" onclick="deleteTask('${taskId}')">
        <i class="bi bi-trash"></i>
      </button>
    `;
    tasksContainer.appendChild(div);
  });
}

// 5. GUARDAR NUEVA TAREA
if (taskForm) {
  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = taskTitleInput.value.trim();
    const description = taskDescInput.value.trim();

    if (!title) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title, description })
      });

      if (!response.ok) throw new Error('Error al guardar la tarea en el servidor');

      // Limpiar los inputs del formulario
      taskTitleInput.value = '';
      taskDescInput.value = '';
      
      // Asegurar que el filtro vuelva a "Todas" para que la tarea nueva aparezca inmediatamente
      if (filterAll) {
        filterAll.checked = true;
      }
      
      // Recargar tareas
      loadTasks();
    } catch (error) {
      alert(error.message);
    }
  });
}

// 6. MARCAR COMO COMPLETADA / PENDIENTE
window.toggleTask = async (id, currentStatus) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ completed: !currentStatus })
    });

    if (!response.ok) throw new Error('Error al actualizar la tarea');
    loadTasks();
  } catch (error) {
    alert(error.message);
  }
};

// 7. ELIMINAR UNA TAREA
window.deleteTask = async (id) => {
  if (!confirm('¿Seguro que deseas eliminar esta tarea?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) throw new Error('Error al eliminar la tarea');
    loadTasks();
  } catch (error) {
    alert(error.message);
  }
};

// 8. FILTROS (Vincular eventos para cambiar de vista)
[filterAll, filterPending, filterCompleted].forEach(filterInput => {
  if (filterInput) {
    filterInput.addEventListener('change', applyFilterAndRender);
  }
});

// 9. CERRAR SESIÓN
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });
}

// Cargar las tareas al iniciar la página
loadTasks();