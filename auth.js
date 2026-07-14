const API_URL = 'http://localhost:3000/api/auth';

// REGISTRO
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al registrarse');

      // Guardamos únicamente el usuario directamente
      localStorage.setItem('user', JSON.stringify(data.user));

      alert('¡Registro exitoso!');
      window.location.href = 'tareas.html'; 

    } catch (error) {
      alert(error.message);
    }
  });
}

// INICIO DE SESIÓN
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al iniciar sesión');

      localStorage.setItem('user', JSON.stringify(data.user));

      alert('¡Sesión iniciada!');
      window.location.href = 'tareas.html';

    } catch (error) {
      alert(error.message);
    }
  });
}