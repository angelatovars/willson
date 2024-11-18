document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const correo = document.getElementById('correo').value;
    const contraseña = document.getElementById('contraseña').value;

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ correo, contraseña })
        });

        const data = await response.json();

        if (response.ok) {
            const token = data.access_token;
            
            // Guardar el token y el correo en localStorage
            localStorage.setItem('token', token); //que es token exactamente?
            localStorage.setItem('correo', correo);  // Guardar el correo también
        
            alert('Inicio de sesión exitoso!');
        
            // Redirigir al menú principal
            window.location.href = '../pages/index.html';
        } else {
            alert('Error: ' + data.message);
        }
        
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        alert('Hubo un problema al intentar iniciar sesión.');
    }
});
