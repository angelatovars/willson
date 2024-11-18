// Archivo principal de JavaScript para la interactividad general

document.addEventListener('DOMContentLoaded', function () {
    verificarSesion();
    animarBarraNavegacion();
    cargarPerfilSiEsNecesario();
    mostrarNotificaciones();
    cargarRankingSiEsNecesario();
    agregarEventosDeJuegos();
    agregarEventosDeActividades();
    gestionarFormularioDeLogin();
    gestionarFormularioDeRegistro();
    gestionarActualizacionPerfil();
    gestionarCambioContraseña();
    gestionarLecturaCronometro();
});


// Aquí iría el resto de la lógica de la página después de la validación del token

// Función para animar la barra de navegación al hacer scroll
function animarBarraNavegacion() {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scroll');
        } else {
            navbar.classList.remove('navbar-scroll');
        }
    });
}

// Función para verificar si hay un usuario autenticado
function verificarSesion() {
    const token = localStorage.getItem('jwt-token');
    if (token) {
        document.querySelector('#btnLogin').style.display = 'none';
        document.querySelector('#btnProfile').style.display = 'block';
        document.querySelector('#btnLogout').style.display = 'block';
    } else {
        document.querySelector('#btnLogin').style.display = 'block';
        document.querySelector('#btnProfile').style.display = 'none';
        document.querySelector('#btnLogout').style.display = 'none';
        redirigirSiNoAutenticado();
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('jwt-token');
    alert('Sesión cerrada con éxito.');
    verificarSesion();
    window.location.href = 'login.html';
}

// Añadiendo el evento de clic al botón de logout
document.querySelector('#btnLogout').addEventListener('click', logout);

// Función para redirigir al usuario si no está autenticado
function redirigirSiNoAutenticado() {
    const paginasProtegidas = ['profile.html', 'ranking.html'];
    const paginaActual = window.location.pathname.split('/').pop();
    if (paginasProtegidas.includes(paginaActual)) {
        window.location.href = 'login.html';
    }
}

// Función para cargar el perfil del usuario
function cargarPerfilSiEsNecesario() {
    const paginaActual = window.location.pathname.split('/').pop();
    if (paginaActual === 'profile.html') {
        // Realiza una solicitud a la API para obtener el perfil del usuario
        fetch('http://localhost:5000/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data) {
                    // Actualiza los elementos del perfil con los datos obtenidos
                    document.querySelector('#nombreUsuario').textContent = data.nombre;
                    document.querySelector('#correoUsuario').textContent = data.correo;
                    document.querySelector('#edadUsuario').textContent = data.edad;
                    document.querySelector('#notificacionesUsuario').textContent = data.notificaciones ? 'Activadas' : 'Desactivadas';
                }
            })
            .catch(err => {
                console.error('Error al cargar el perfil:', err);
                mostrarMensaje('No se pudo cargar el perfil. Por favor, intenta nuevamente.', 'error');
            });
    }
}

// Función para mostrar notificaciones al usuario
function mostrarNotificaciones() {
    const notificaciones = [
        '¡Bienvenido de nuevo!',
        'Recuerda completar tus actividades diarias.',
        'Nuevo ranking disponible, ¡échale un vistazo!'
    ];
    const indice = Math.floor(Math.random() * notificaciones.length);
    mostrarMensaje(notificaciones[indice], 'info');
}

// Función para cargar el ranking si la página es ranking.html
function cargarRankingSiEsNecesario() {
    const paginaActual = window.location.pathname.split('/').pop();
    if (paginaActual === 'ranking.html') {
        // Realiza una solicitud a la API para obtener el ranking
        fetch('http://localhost:5000/ranking', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                if (data) {
                    // Actualiza la tabla de ranking con los datos obtenidos
                    const tablaRanking = document.querySelector('#tablaRanking');
                    data.forEach(jugador => {
                        const fila = document.createElement('tr');
                        fila.innerHTML = `
                            <td>${jugador.nombre}</td>
                            <td>${jugador.puntaje}</td>
                            <td>${jugador.nivel}</td>
                        `;
                        tablaRanking.appendChild(fila);
                    });
                }
            })
            .catch(err => {
                console.error('Error al cargar el ranking:', err);
                mostrarMensaje('No se pudo cargar el ranking. Por favor, intenta nuevamente.', 'error');
            });
    }
}

// Función para agregar eventos de clic a las tarjetas de juegos
function agregarEventosDeJuegos() {
    document.querySelectorAll('.card-game').forEach(card => {
        card.addEventListener('click', function () {
            const url = card.getAttribute('data-url');
            abrirPagina(url);
        });
    });
}

// Función para agregar eventos de clic a las tarjetas de actividades
function agregarEventosDeActividades() {
    document.querySelectorAll('.card-activity').forEach(card => {
        card.addEventListener('click', function () {
            const url = card.getAttribute('data-url');
            abrirPagina(url);
        });
    });
}

// Función para redirigir a la página del juego o actividad
function abrirPagina(url) {
    window.location.href = url;
}

// Función para gestionar el formulario de inicio de sesión
function gestionarFormularioDeLogin() {
    const formularioLogin = document.querySelector('#formularioLogin');
    if (formularioLogin) {
        formularioLogin.addEventListener('submit', function (e) {
            e.preventDefault();
            const correo = document.querySelector('#correo').value;
            const contraseña = document.querySelector('#contraseña').value;

            // Solicitud de inicio de sesión
            fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ correo, contraseña })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.access_token) {
                        localStorage.setItem('jwt-token', data.access_token);
                        window.location.href = 'index.html';
                    } else {
                        mostrarMensaje('Inicio de sesión fallido. Por favor, revisa tus credenciales.', 'error');
                    }
                })
                .catch(err => {
                    console.error('Error al iniciar sesión:', err);
                    mostrarMensaje('Hubo un problema con el servidor. Intenta de nuevo.', 'error');
                });
        });
    }
}

// Función para gestionar el formulario de registro de usuario
function gestionarFormularioDeRegistro() {
    const formularioRegistro = document.querySelector('#formularioRegistro');
    if (formularioRegistro) {
        formularioRegistro.addEventListener('submit', function (e) {
            e.preventDefault();
            const nombre = document.querySelector('#nombre').value;
            const correo = document.querySelector('#correo').value;
            const contraseña = document.querySelector('#contraseña').value;
            const edad = document.querySelector('#edad').value;

            // Solicitud de registro
            fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre, correo, contraseña, edad })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Usuario registrado con éxito') {
                        mostrarMensaje('Registro exitoso. Inicia sesión ahora.', 'success');
                        window.location.href = 'login.html';
                    } else {
                        mostrarMensaje('Error en el registro. Intenta de nuevo.', 'error');
                    }
                })
                .catch(err => {
                    console.error('Error al registrar usuario:', err);
                    mostrarMensaje('Hubo un problema con el servidor. Intenta de nuevo.', 'error');
                });
        });
    }
}

// Función para gestionar la actualización del perfil del usuario
function gestionarActualizacionPerfil() {
    const formularioPerfil = document.querySelector('#formularioPerfil');
    if (formularioPerfil) {
        formularioPerfil.addEventListener('submit', function (e) {
            e.preventDefault();
            const nombre = document.querySelector('#nombre').value;
            const correo = document.querySelector('#correo').value;
            const notificaciones = document.querySelector('#notificaciones').checked;

            // Solicitud de actualización de perfil
            fetch('http://localhost:5000/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre, correo, notificaciones })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Perfil actualizado con éxito') {
                        mostrarMensaje('Perfil actualizado con éxito.', 'success');
                    } else {
                        mostrarMensaje('Error al actualizar perfil.', 'error');
                    }
                })
                .catch(err => {
                    console.error('Error al actualizar perfil:', err);
                    mostrarMensaje('Hubo un problema con el servidor. Intenta de nuevo.', 'error');
                });
        });
    }
}

// Función para gestionar el cambio de contraseña
function gestionarCambioContraseña() {
    const formularioCambioContraseña = document.querySelector('#formularioCambioContraseña');
    if (formularioCambioContraseña) {
        formularioCambioContraseña.addEventListener('submit', function (e) {
            e.preventDefault();
            const contraseñaActual = document.querySelector('#contraseñaActual').value;
            const nuevaContraseña = document.querySelector('#nuevaContraseña').value;

            // Solicitud de cambio de contraseña
            fetch('http://localhost:5000/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ contraseñaActual, nuevaContraseña })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Contraseña actualizada con éxito') {
                        mostrarMensaje('Contraseña actualizada con éxito.', 'success');
                    } else {
                        mostrarMensaje('Error al actualizar contraseña.', 'error');
                    }
                })
                .catch(err => {
                    console.error('Error al actualizar contraseña:', err);
                    mostrarMensaje('Hubo un problema con el servidor. Intenta de nuevo.', 'error');
                });
        });
    }
}

// Función para gestionar la actividad de lectura con cronómetro
function gestionarLecturaCronometro() {
    const botonInicioLectura = document.querySelector('#btnIniciarLectura');
    if (botonInicioLectura) {
        let inicioTiempo;
        botonInicioLectura.addEventListener('click', function () {
            inicioTiempo = new Date();
            mostrarMensaje('Cronómetro iniciado.', 'info');
        });

        const botonTerminarLectura = document.querySelector('#btnTerminarLectura');
        botonTerminarLectura.addEventListener('click', function () {
            const tiempoLectura = (new Date() - inicioTiempo) / 1000;
            mostrarMensaje(`Tiempo de lectura: ${tiempoLectura} segundos.`, 'info');
        });
    }
}

// Función para mostrar un mensaje flotante
function mostrarMensaje(mensaje, tipo = 'info') {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.classList.add('mensaje-flotante', tipo);
    mensajeDiv.textContent = mensaje;

    document.body.appendChild(mensajeDiv);
    setTimeout(() => {
        mensajeDiv.remove();
    }, 3000);
}
// Ejemplo de cómo mostrar un mensaje (para pruebas, se puede eliminar más adelante)
mostrarMensaje('¡Bienvenido a la plataforma!', 'success');
