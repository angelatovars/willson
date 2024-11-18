document.addEventListener('DOMContentLoaded', function() {
    const correo = localStorage.getItem('correo');

    if (!correo) {
        alert('Debe iniciar sesión');
        window.location.href = '../pages/login.html';
        return;
    }

    // Cargar datos del usuario automáticamente
    cargarDatosUsuario(correo);

    // Función para cargar los datos del usuario
    function cargarDatosUsuario(correo) {
        fetch(`http://localhost:5000/api/profile?correo=${encodeURIComponent(correo)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data) {
                document.getElementById('nombre').value = data.nombre;
                document.getElementById('correo').value = data.correo;
                document.getElementById('edad').value = data.edad;
                document.getElementById('temaPreferido').value = data.tema_preferido;
                document.getElementById('nivelPreferido').value = data.nivel_preferido;
            } else {
                alert('No se encontraron datos del perfil');
            }
        })
        .catch(error => {
            console.error('Error al obtener el perfil:', error);
            alert('Hubo un problema al cargar el perfil.');
        });
    }

    // Botón para guardar los cambios (POST)
    document.getElementById('guardarCambios').addEventListener('click', function(e) {
        e.preventDefault();
        
        const edad = parseInt(document.getElementById('edad').value);
        
        // Validación de edad
        if (edad < 17 || edad > 28) {
            alert('La edad debe estar entre 17 y 28 años.');
            return;
        }

        const nombre = document.getElementById('nombre').value;
        const temaPreferido = document.getElementById('temaPreferido').value;
        const nivelPreferido = document.getElementById('nivelPreferido').value;

        // Hacer la solicitud de actualización
        fetch(`http://localhost:5000/api/profile?correo=${encodeURIComponent(correo)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                nombre,
                edad,
                tema_preferido: temaPreferido,
                nivel_preferido: nivelPreferido
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Perfil actualizado con éxito') {
                alert('Perfil actualizado correctamente.');
                window.location.href = '../pages/index.html'; // Regresar al menú
            } else {
                alert('Error al actualizar el perfil.');
            }
        })
        .catch(error => {
            console.error('Error al actualizar el perfil:', error);
            alert('Hubo un problema al intentar actualizar el perfil.');
        });
    });
});

// Función para volver al menú principal
function volverMenu() {
    window.location.href = '../pages/index.html';
}