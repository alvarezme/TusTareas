const authSection = document.getElementById('auth-section');
const todoSection = document.getElementById('todo-section');
const userNavProfile = document.getElementById('user-nav-profile');
const userDisplayName = document.getElementById('user-display-name');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const taskForm = document.getElementById('task-form');
const btnLogout = document.getElementById('btn-logout');

const tasksContainer = document.getElementById('tasks-container');
const tasksPlaceholder = document.getElementById('tasks-placeholder');

// Filtros de tareas (botones de radio)
const filterAll = document.getElementById('filter-all');
const filterPending = document.getElementById('filter-pending');
const filterCompleted = document.getElementById('filter-completed');


/**
 * DECISIÓN 2: VARIABLES DE ESTADO LOCALES (Simulación del Backend)
 * En una aplicación real, los usuarios y las tareas viven en la base de datos del servidor.
 * Para poder desarrollar el frontend de forma independiente, simulamos esa base de datos
 * usando 'localStorage' del navegador. Esto permite que los datos no se borren al refrescar la pantalla.
 */
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];


/**
 * DECISIÓN 3: GESTIÓN DE VISTAS (¿Qué debe ver el usuario?)
 * Creamos una función centralizada encargada de ocultar o mostrar las secciones de la página.
 * Si hay un usuario logueado, ocultamos el formulario de login/registro y mostramos el To-Do.
 * Usamos la clase 'd-none' (Display None) de Bootstrap para manejar esta visibilidad de forma limpia.
 */
function updateUI() {
  if (currentUser) {
    // Si hay un usuario activo:
    authSection.classList.add('d-none');         // Oculta Login / Registro
    todoSection.classList.remove('d-none');      // Muestra panel de tareas
    userNavProfile.classList.remove('d-none');   // Muestra el botón de "Salir" en el Navbar
    userDisplayName.textContent = `¡Hola, ${currentUser.name}!`; // Saludo personalizado
    renderTasks();                               // Dibuja las tareas de este usuario
  } else {
    // Si no hay ningún usuario activo:
    authSection.classList.remove('d-none');      // Muestra Login / Registro
    todoSection.classList.add('d-none');         // Oculta panel de tareas
    userNavProfile.classList.add('d-none');      // Oculta perfil en el navbar
  }
}


/**
 * DECISIÓN 4: MANEJO DEL REGISTRO DE USUARIOS
 * Escuchamos el evento 'submit' del formulario de registro.
 * Encriptar contraseñas es tarea del backend, pero aquí simulamos la lógica guardando
 * el nuevo usuario en un array dentro de localStorage.
 */
registerForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Evita que la página se recargue (comportamiento por defecto de los formularios)

  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  // Traemos los usuarios ya registrados o creamos un array vacío si es el primero
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];

  // Verificamos si el correo ya existe (validación básica de integridad de datos)
  const userExists = registeredUsers.some(user => user.email === email);
  if (userExists) {
    alert('Este correo ya está registrado.');
    return;
  }

  // Creamos el nuevo objeto usuario
  const newUser = { id: Date.now().toString(), name, email, password };
  registeredUsers.push(newUser);
  
  // Guardamos la lista actualizada de usuarios
  localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

  // Iniciamos sesión automáticamente con el nuevo usuario
  currentUser = newUser;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  // Limpiamos el formulario y actualizamos la interfaz
  registerForm.reset();
  updateUI();
});


/**
 * DECISIÓN 5: MANEJO DEL INICIO DE SESIÓN (LOGIN)
 * Buscamos si las credenciales ingresadas coinciden con algún usuario de nuestro "localStorage".
 */
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];

  // Buscamos coincidencia de email y contraseña
  const user = registeredUsers.find(u => u.email === email && u.password === password);

  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    loginForm.reset();
    updateUI();
  } else {
    alert('Credenciales incorrectas. Por favor, verifica tu correo y contraseña.');
  }
});


/**
 * DECISIÓN 6: CERRAR SESIÓN (LOGOUT)
 * Limpiar el usuario actual de la memoria y del localStorage para devolver la app al estado inicial.
 */
btnLogout.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  updateUI();
});


/**
 * DECISIÓN 7: RENDERIZADO DINÁMICO DE TAREAS CON SEGURIDAD DE DATOS
 * Esta función limpia el contenedor de tareas y lo vuelve a llenar basándose en el estado actual.
 * Clave: Filtramos las tareas para mostrar únicamente las que pertenecen al usuario logueado.
 */
function renderTasks() {
  tasksContainer.innerHTML = ''; // Limpiamos el contenedor para evitar duplicados al redibujar

  // Filtramos las tareas por el ID del usuario logueado
  let userTasks = tasks.filter(task => task.userId === currentUser.id);

  // Aplicamos los filtros de Bootstrap (Todas, Pendientes, Completadas)
  if (filterPending.checked) {
    userTasks = userTasks.filter(task => !task.completed);
  } else if (filterCompleted.checked) {
    userTasks = userTasks.filter(task => task.completed);
  }

  // Si el usuario no tiene tareas que coincidan con el filtro, mostramos el aviso visual
  if (userTasks.length === 0) {
    tasksPlaceholder.classList.remove('d-none');
    tasksContainer.appendChild(tasksPlaceholder);
    return;
  }

  // Ocultamos el aviso visual si hay tareas para mostrar
  tasksPlaceholder.classList.add('d-none');

  // Construimos el HTML de cada tarea usando las clases nativas de Bootstrap
  userTasks.forEach(task => {
    const taskItem = document.createElement('div');
    taskItem.className = `list-group-item d-flex justify-content-between align-items-center py-3 border rounded mb-2 shadow-sm ${task.completed ? 'bg-light' : 'bg-white'}`;
    
    // Decisión de diseño: si la tarea está completada, tachamos el texto y lo ponemos grisáceo
    const titleStyle = task.completed ? 'text-decoration-line-through text-muted' : 'fw-bold text-dark';
    const descStyle = task.completed ? 'text-decoration-line-through text-muted' : 'text-secondary';

    taskItem.innerHTML = `
      <div style="max-width: 75%;">
        <h6 class="mb-1 ${titleStyle}">${task.title}</h6>
        <small class="${descStyle}">${task.description || 'Sin descripción'}</small>
      </div>
      <div class="btn-group" role="group">
        <!-- Botón Completar -->
        <button class="btn btn-sm ${task.completed ? 'btn-secondary' : 'btn-success'}" onclick="toggleTaskStatus('${task.id}')" title="Marcar estado">
          <i class="bi ${task.completed ? 'bi-arrow-counterclockwise' : 'bi-check-lg'}"></i>
        </button>
        <!-- Botón Eliminar -->
        <button class="btn btn-sm btn-outline-danger" onclick="deleteTask('${task.id}')" title="Eliminar">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;
    tasksContainer.appendChild(taskItem);
  });
}


/**
 * DECISIÓN 8: CREACIÓN DE NUEVAS TAREAS
 * Capturamos los datos del formulario de tareas, les asignamos un ID único usando Date.now()
 * y las asociamos al ID del usuario actualmente logueado.
 */
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-desc').value.trim();

  const newTask = {
    id: Date.now().toString(),
    userId: currentUser.id, // Vinculación clave usuario <-> tarea
    title,
    description,
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  taskForm.reset();
  renderTasks();
});


/**
 * DECISIÓN 9: FUNCIONES GLOBALES DE MANIPULACIÓN (Cambiar estado y Eliminar)
 * Al crear los botones dinámicamente en 'renderTasks', les inyectamos funciones 'onclick'.
 * Estas funciones modifican el array en memoria, guardan los cambios y redibujan la pantalla.
 */
window.toggleTaskStatus = function(taskId) {
  tasks = tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  saveTasks();
  renderTasks();
};

window.deleteTask = function(taskId) {
  if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
  }
};

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}


/**
 * DECISIÓN 10: ESCUCHADORES DE FILTROS Y ARRANQUE DE LA APLICACIÓN
 * Hacemos que la pantalla se actualice inmediatamente cuando el usuario haga clic en los filtros.
 * Por último, llamamos a 'updateUI' para decidir qué vista mostrar apenas se abre el navegador.
 */
filterAll.addEventListener('change', renderTasks);
filterPending.addEventListener('change', renderTasks);
filterCompleted.addEventListener('change', renderTasks);

// Arrancamos la aplicación evaluando si hay sesión abierta
updateUI();