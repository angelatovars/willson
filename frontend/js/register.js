document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const contraseña = document.getElementById('contraseña').value;

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, correo, contraseña })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registro exitoso. Ahora puedes iniciar sesión.');
            // Redirigir al inicio de sesión
            window.location.href = 'login.html';
        } else {
            alert('Error: ' + data.message);
        }

    } catch (error) {
        console.error('Error al registrar:', error);
        alert('Hubo un problema al intentar registrarse.');
    }
});