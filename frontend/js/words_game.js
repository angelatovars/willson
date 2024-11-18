const niveles = {
    1: { anagramas: ['ORERP', 'OGAT', 'OLRO', 'EPZ'], palabras: ['PERRO', 'GATO', 'LORO', 'PEZ'], puntajeCorrecto: 2, puntajeError: -1 },
    2: { anagramas: ['CCAINOUDE', 'OMUSE', 'QPRAUE', 'EOCHC'], palabras: ['EDUCACION', 'MUSEO', 'PARQUE', 'COCHE'], puntajeCorrecto: 4, puntajeError: -2 },
    3: { anagramas: ['VANOI', 'ETLAERSLA', 'ATÑOMNA', 'MLFAIAI'], palabras: ['AVION', 'ESTRELLA', 'MONTAÑA', 'FAMILIA'], puntajeCorrecto: 6, puntajeError: -3 }
};

let nivelActual = 1;
let puntaje = 0;
let palabraActual = 0;

// Mostrar el anagrama actual
function mostrarAnagrama() {
    document.getElementById('anagrama').innerText = niveles[nivelActual].anagramas[palabraActual];
}

// Verificar si la respuesta es correcta
document.getElementById('validarRespuesta').addEventListener('click', function() {
    const respuesta = document.getElementById('respuesta').value.toUpperCase();
    const palabraCorrecta = niveles[nivelActual].palabras[palabraActual];

    if (respuesta === palabraCorrecta) {
        puntaje += niveles[nivelActual].puntajeCorrecto;
        palabraActual++;
        animarCorrecto();
    } else {
        puntaje += niveles[nivelActual].puntajeError;
        animarError();
    }

    actualizarPuntaje();

    if (palabraActual < niveles[nivelActual].palabras.length) {
        document.getElementById('respuesta').value = '';
        mostrarAnagrama();
    } else {
        if (nivelActual < 3) {
            nivelActual++;
            palabraActual = 0;
            mostrarAnagrama();
            alert('¡Nivel completado! Pasando al siguiente nivel.');
        } else {
            alert(`¡Felicidades! Has completado el juego con un puntaje de ${puntaje}`);
            guardarPuntajeBD();
            guardarActividadBD();
        }
    }
});

// Actualizar puntaje
function actualizarPuntaje() {
    document.getElementById('puntaje').innerText = puntaje + ' 🏆';
}

// Animación para respuesta correcta
function animarCorrecto() {
    const anagrama = document.getElementById('anagrama');
    anagrama.classList.add('correcto');
    setTimeout(() => anagrama.classList.remove('correcto'), 500);
}

// Animación para respuesta incorrecta
function animarError() {
    const anagrama = document.getElementById('anagrama');
    anagrama.classList.add('error');
    setTimeout(() => anagrama.classList.remove('error'), 500);
}

// Guardar el puntaje en la BD (simulado)
function guardarPuntajeBD() {
  const token = localStorage.getItem('token');
  const url = 'http://localhost:5000/api/ranking';

  fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ puntaje })
  })
  .then(response => response.json())
  .then(data => {
      console.log('Puntaje guardado:', data);
  })
  .catch(error => {
      console.error('Error al guardar el puntaje:', error);
  });
}

function guardarActividadBD() {
  const token = localStorage.getItem("token");
  const url = "http://localhost:5000/api/activities";

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      nombre_actividad: "Juegos de Palabra",
      puntaje: puntaje,
      puntaje_maximo: 40,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Actividad Guardada:", data);
    })
    .catch((error) => {
      console.error("Error al guardar la actividad:", error);
    });
}

// Iniciar el juego
window.onload = function() {
    mostrarAnagrama();
    document.getElementById('puntaje').innerText = puntaje + ' 🏆';

    const modal = document.getElementById('modalInstrucciones');
    modal.style.display = 'block';

    document.querySelector('.close').onclick = function() {
        modal.style.display = 'none';
    }

    document.getElementById('empezarJuego').onclick = function() {
        modal.style.display = 'none';
    }
};

// Volver al menú principal
function volverAlMenu() {
    window.location.href = '../index.html';
}
