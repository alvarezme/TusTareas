const URL_API = 'http://localhost:3000/api/tareas';
const datosUsuario = JSON.parse(localStorage.getItem('usuario'));

// Si no inició sesión, lo devuelve al index
if (!datosUsuario) {
  window.location.href = 'index.html';
}

const contenedorTareas = document.getElementById('contenedor-tareas');
const formularioTarea = document.getElementById('formulario-tarea');
const botonCerrarSesion = document.getElementById('btn-cerrar-sesion');

// Helper para las cabeceras con el id de usuario
function obtenerCabeceras() {
  return {
    'Content-Type': 'application/json',
    'id-usuario': datosUsuario.id
  };
}

// Cargar tareas del servidor
async function cargarTareas() {
  try {
    const respuesta = await fetch(URL_API, { headers: obtenerCabeceras() });
    const tareas = await respuesta.json();
    renderizarTareas(tareas);
  } catch (error) {
    console.error('Error al cargar lista:', error);
  }
}

// Dibujar tareas en el HTML
function renderizarTareas(tareas) {
  contenedorTareas.innerHTML = '';

  if (tareas.length === 0) {
    contenedorTareas.innerHTML = '<p class="text-center text-muted">No tienes tareas creadas.</p>';
    return;
  }

  tareas.forEach(tarea => {
    const div = document.createElement('div');
    div.className = 'list-group-item d-flex justify-content-between align-items-center mb-2 p-3 border rounded bg-white shadow-sm';
    
    const tituloEscapado = tarea.titulo.replace(/'/g, "\\'");
    const descEscapada = tarea.descripcion ? tarea.descripcion.replace(/'/g, "\\'") : '';

    div.innerHTML = `
      <div class="d-flex align-items-start flex-grow-1 me-3" style="min-width: 0;">
        <div class="text-break">
          <span class="${tarea.completada ? 'text-decoration-line-through text-muted' : 'fw-bold'}">${tarea.titulo}</span>
          <small class="d-block text-muted mt-1">${tarea.descripcion || ''}</small>
        </div>
      </div>
      <div class="d-flex gap-2 flex-shrink-0 align-items-center">
        <input type="checkbox" class="form-check-input me-0 mt-0 flex-shrink-0" ${tarea.completada ? 'checked' : ''} onclick="alternarEstado('${tarea.id}', ${tarea.completada})"style="width: 31px; height: 31px; cursor: pointer;">
        <button class="btn btn-sm btn-outline-primary" onclick="abrirModalEdicion('${tarea.id}', '${tituloEscapado}', '${descEscapada}')">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminarTarea('${tarea.id}')">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;
    contenedorTareas.appendChild(div);
  });
}

// Crear Tarea
formularioTarea.addEventListener('submit', async (e) => {
  e.preventDefault();
  const titulo = document.getElementById('tarea-titulo').value.trim();
  const descripcion = document.getElementById('tarea-desc').value.trim();

  try {
    const respuesta = await fetch(URL_API, {
      method: 'POST',
      headers: obtenerCabeceras(),
      body: JSON.stringify({ titulo, descripcion })
    });
    if (respuesta.ok) {
      formularioTarea.reset();
      cargarTareas();
    }
  } catch (error) {
    alert('No se pudo crear la tarea');
  }
});

// Modificar (Cambiar estado completado/pendiente)
window.alternarEstado = async (id, estadoActual) => {
  try {
    await fetch(`${URL_API}/${id}`, {
      method: 'PUT',
      headers: obtenerCabeceras(),
      body: JSON.stringify({ completada: !estadoActual })
    });
    cargarTareas();
  } catch (error) {
    console.error(error);
  }
};

// Eliminar Tarea
window.eliminarTarea = async (id) => {
  if (!confirm('¿Deseas eliminar esta tarea?')) return;
  try {
    await fetch(`${URL_API}/${id}`, {
      method: 'DELETE',
      headers: obtenerCabeceras()
    });
    cargarTareas();
  } catch (error) {
    alert('Error al eliminar');
  }
};

// Control del Modal de Edición
let modalInstancia = null;
window.abrirModalEdicion = (id, titulo, descripcion) => {
  document.getElementById('edit-tarea-id').value = id;
  document.getElementById('edit-tarea-titulo').value = titulo;
  document.getElementById('edit-tarea-desc').value = descripcion;

  if (!modalInstancia) {
    modalInstancia = new bootstrap.Modal(document.getElementById('editTaskModal'));
  }
  modalInstancia.show();
};

document.getElementById('formulario-editar-tarea').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('edit-tarea-id').value;
  const titulo = document.getElementById('edit-tarea-titulo').value.trim();
  const descripcion = document.getElementById('edit-tarea-desc').value.trim();

  try {
    const respuesta = await fetch(`${URL_API}/${id}`, {
      method: 'PUT',
      headers: obtenerCabeceras(),
      body: JSON.stringify({ titulo, descripcion })
    });
    if (respuesta.ok) {
      modalInstancia.hide();
      cargarTareas();
    }
  } catch (error) {
    alert('Error al guardar cambios');
  }
});

// Cerrar Sesión
botonCerrarSesion.addEventListener('click', () => {
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
});

// Inicializar vista
cargarTareas();