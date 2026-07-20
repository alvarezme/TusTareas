const URL_API = 'http://localhost:3000/api/tareas';
const datosUsuario = JSON.parse(localStorage.getItem('usuario'));

if (!datosUsuario) {
  window.location.href = 'index.html';
}

const contenedorTareas = document.getElementById('contenedor-tareas');
const formularioTarea = document.getElementById('formulario-tarea');
const botonCerrarSesion = document.getElementById('btn-cerrar-sesion');

// constantes para el filtrado y orden
const inputFiltroTitulo = document.getElementById('filtro-titulo');
const selectFiltroEstado = document.getElementById('filtro-estado');
const botonOrdenar = document.getElementById('boton-ordenar');
const botonLimpiarFiltros = document.getElementById('boton-limpiar-filtros');

let todasLasTareas = [];
let ordenDescendente = true;

const configuracionEstados = {
  'pendiente': { clase: 'bg-secondary text-white', texto: 'Pendiente' },
  'en curso': { clase: 'bg-primary text-white', texto: 'En curso' },
  'en espera': { clase: 'bg-warning text-dark', texto: 'En espera' },
  'finalizada': { clase: 'bg-success text-white', texto: 'Finalizada' }
};

// Cambio el formato de la fecha para que sea legible
function formatearFecha(isoString) {
  if (!isoString) return '';
  const fecha = new Date(isoString);
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(fecha);
}

function obtenerCabeceras() {
  return {
    'Content-Type': 'application/json',
    'id-usuario': datosUsuario.id
  };
}

async function cargarTareas() {
  try {
    const respuesta = await fetch(URL_API, { headers: obtenerCabeceras() });
    todasLasTareas = await respuesta.json();
    aplicarFiltro();
  } catch (error) {
    console.error('Error al cargar lista:', error);
  }
}

// Dibujo las tareas en el HTML
function renderizarTareas(tareas) {
  contenedorTareas.innerHTML = '';

  if (tareas.length === 0) {
    contenedorTareas.innerHTML = '<p class="text-center text-muted m-0 my-2">No se encontraron tareas con los filtros aplicados.</p>';
    return;
  }

  tareas.forEach(tarea => {
    const div = document.createElement('div');
    div.className = 'list-group-item d-flex justify-content-between align-items-center mb-2 p-3 border rounded bg-white shadow-sm';
    
    const configEstado = configuracionEstados[tarea.estado] || configuracionEstados['pendiente'];
    const esFinalizada = tarea.estado === 'finalizada';

    const tituloEscapado = tarea.titulo.replace(/'/g, "\\'");
    const descEscapada = tarea.descripcion ? tarea.descripcion.replace(/'/g, "\\'") : '';
    
    // Agrego etiquetas de fechas
    const fechaCreacion = formatearFecha(tarea.createdAt);
    const fechaModificacion = formatearFecha(tarea.updatedAt);
    const trackingFechas = tarea.createdAt === tarea.updatedAt 
      ? `Creada: ${fechaCreacion}` 
      : `Modificada: ${fechaModificacion}`;

    div.innerHTML = `
      <div class="d-flex align-items-start flex-grow-1 me-3" style="min-width: 0;">
        <div class="text-break w-100">
          <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
            <span class="${esFinalizada ? 'text-decoration-line-through text-muted' : 'fw-bold'} fs-5">${tarea.titulo}</span>
            <span class="badge ${configEstado.clase} rounded-pill px-2 py-1 small" style="font-size: 0.75rem;">${configEstado.texto}</span>
          </div>
          <p class="text-muted m-0 mb-2 small">${tarea.descripcion || '<em>Sin descripción</em>'}</p>
          <div class="text-muted" style="font-size: 0.70rem;">
            <i class="bi bi-clock me-1"></i>${trackingFechas}
          </div>
        </div>
      </div>
      <div class="d-flex gap-2 flex-shrink-0 align-items-center">
        <button class="btn btn-sm btn-outline-primary" onclick="abrirModalEdicion('${tarea.id}', '${tituloEscapado}', '${descEscapada}', '${tarea.estado}')">
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

// FIltros para las tareas
function aplicarFiltro() {
  const textoBusqueda = inputFiltroTitulo.value.toLowerCase().trim();
  const estadoSeleccionado = selectFiltroEstado.value;

  // filtro
  let tareasFiltradas = todasLasTareas.filter(tarea => {
    const titulo = tarea.titulo ? tarea.titulo.toLowerCase() : '';
    const descripcion = tarea.descripcion ? tarea.descripcion.toLowerCase() : '';
    
    const coincideTexto = !textoBusqueda || titulo.includes(textoBusqueda) || descripcion.includes(textoBusqueda);
    const coincideEstado = estadoSeleccionado === 'todos' || tarea.estado === estadoSeleccionado;

    return coincideTexto && coincideEstado;
  });

  // orden segun fecha de creacion
  tareasFiltradas.sort((a, b) => {
    const fechaA = new Date(a.createdAt);
    const fechaB = new Date(b.createdAt);
    
    return ordenDescendente ? (fechaB - fechaA) : (fechaA - fechaB);
  });

  renderizarTareas(tareasFiltradas);
}

// detecto los cambios de fuiltrado
if (inputFiltroTitulo) inputFiltroTitulo.addEventListener('input', aplicarFiltro);
if (selectFiltroEstado) selectFiltroEstado.addEventListener('change', aplicarFiltro);

// Estoy pendiente de alternar el orden de vista de tareas
if (botonOrdenar) {
  botonOrdenar.addEventListener('click', () => {
    ordenDescendente = !ordenDescendente;
    
    if (ordenDescendente) {
      botonOrdenar.classList.replace('btn-outline-secondary', 'btn-outline-primary');
      botonOrdenar.innerHTML = '<i class="bi bi-sort-down me-1"></i> <span id="texto-orden">Nuevos</span>';
    } else {
      botonOrdenar.classList.replace('btn-outline-primary', 'btn-outline-secondary');
      botonOrdenar.innerHTML = '<i class="bi bi-sort-up me-1"></i> <span id="texto-orden">Antiguos</span>';
    }
    aplicarFiltro();
  });
}

// Botón limpiar filtros
if (botonLimpiarFiltros) {
  botonLimpiarFiltros.addEventListener('click', () => {
    inputFiltroTitulo.value = '';
    selectFiltroEstado.value = 'todos';
    ordenDescendente = true;
    if (botonOrdenar) {
      botonOrdenar.classList.replace('btn-outline-secondary', 'btn-outline-primary');
      botonOrdenar.innerHTML = '<i class="bi bi-sort-down me-1"></i> <span id="texto-orden">Nuevos</span>';
    }
    aplicarFiltro();
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

// este es el control del modal para la edicion de tareas
let modalInstancia = null;
window.abrirModalEdicion = (id, titulo, descripcion, estadoActual) => {
  document.getElementById('edit-tarea-id').value = id;
  document.getElementById('edit-tarea-titulo').value = titulo;
  document.getElementById('edit-tarea-desc').value = descripcion;
  document.getElementById('edit-tarea-estado').value = estadoActual;

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
  const estado = document.getElementById('edit-tarea-estado').value;

  try {
    const respuesta = await fetch(`${URL_API}/${id}`, {
      method: 'PUT',
      headers: obtenerCabeceras(),
      body: JSON.stringify({ titulo, descripcion, estado })
    });
    if (respuesta.ok) {
      modalInstancia.hide();
      cargarTareas();
    }
  } catch (error) {
    alert('Error al guardar cambios');
  }
});

// cierro la sesión
botonCerrarSesion.addEventListener('click', () => {
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
});

// inicio la vista de las tareas
cargarTareas();