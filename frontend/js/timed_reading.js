let startTime;
let elapsedTime = 0;
let cronometroInterval;
let puntaje = 0;
let nivelActual = 1;
let recognition;
let vidas = 3;
let fraseCompletada = false;

// Textos y tiempo por nivel
const niveles = {
    1: {
        texto: 'El sol brilla en el cielo. Los niños juegan en el parque. Es un día perfecto para disfrutar al aire libre.',
        tiempoMax: 60
    },
    2: {
        texto: 'Los animales en la selva viven en armonía. Cada especie tiene su propio papel en el ecosistema.',
        tiempoMax: 50
    },
    3: {
        texto: 'La tecnología ha avanzado rápidamente en los últimos años, transformando la forma en que nos comunicamos.',
        tiempoMax: 40
    },
    4: {
        texto: 'A lo largo de la historia, el ser humano ha mostrado una increíble capacidad de adaptación.',
        tiempoMax: 30
    },
    5: {
        texto: 'El universo es vasto y misterioso. Desde las galaxias distantes hasta los planetas en nuestro propio sistema solar.',
        tiempoMax: 20
    }
};

// Iniciar el cronómetro
function iniciarCronometro() {
    fraseCompletada = false;
    mostrarTextoNivel();
    actualizarVidas();
    startTime = Date.now() - elapsedTime;
    cronometroInterval = setInterval(actualizarCronometro, 1000);
    document.getElementById('startButton').disabled = true;
    document.getElementById('btnTerminado').style.display = 'block';
}

// función actualizar displa de vidas
function actualizarVidas() {
    document.getElementById('vidas').innerHTML = '❤️'.repeat(vidas);
}

// Función para verificar si la frase fue completada correctamente
function verificarFrase() {
    const textoNivel = niveles[nivelActual].texto.toLowerCase();
    const vozDetectada = document.getElementById('vozDetectada').innerText.toLowerCase();

//Comparar las palabras detectadas con el texto del nivel
const palabrasTexto = textoNivel.split(' ');
    const palabrasDetectadas = vozDetectada.split(' ');
    
    const coincidencias = palabrasTexto.filter(palabra => 
        palabrasDetectadas.includes(palabra)
    ).length;
    
    const porcentajeCoincidencia = (coincidencias / palabrasTexto.length) * 100;
    
    if (porcentajeCoincidencia >= 80) { // Si coincide al menos el 80%
        mostrarExito();
        calcularPuntaje();
    } else {
        perderVida();
    }
}

// Función para mostrar éxito
function mostrarExito() {
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.innerHTML = `
        <div class="mensaje-exito">
            <h3>¡Excelente trabajo! 🎉</h3>
            <p>Has completado correctamente la lectura</p>
            <p>+100 puntos</p>
            <button onclick="siguienteNivel()" class="btn-siguiente">Siguiente nivel</button>
        </div>
    `;
    mensajeDiv.style.display = 'block';
    detenerCronometro();
}



// Detener el cronómetro
function detenerCronometro() {
    clearInterval(cronometroInterval);
    document.getElementById('startButton').disabled = false;
}

// Función para perder vida
function perderVida() {
    vidas--;
    actualizarVidas();
    
    const mensajeDiv = document.getElementById('mensaje');
    if (vidas > 0) {
        mensajeDiv.innerHTML = `
            <div class="mensaje-error">
                <h3>¡Ups! 😕</h3>
                <p>No has completado correctamente la frase.</p>
                <p>Te quedan ${vidas} vidas</p>
                <button onclick="reintentar()" class="btn-reintentar">Intentar de nuevo</button>
            </div>
        `;
    } else {
        gameOver();
    }
    mensajeDiv.style.display = 'block';
}

// Función de Game Over
function gameOver() {
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.innerHTML = `
        <div class="mensaje-gameover">
            <h3>¡Game Over! 😢</h3>
            <p>Has perdido todas tus vidas</p>
            <p>Puntaje final: ${puntaje}</p>
            <button onclick="reiniciarJuego()" class="btn-reiniciar">Jugar de nuevo</button>
            <button onclick="volverAlMenu()" class="btn-menu">Volver al menú</button>
        </div>
    `;
    mensajeDiv.style.display = 'block';
    detenerCronometro();
    guardarPuntajeBD();
}

function reiniciarJuego() {
    vidas = 3;
    puntaje = 0;
    nivelActual = 1;
    elapsedTime = 0;
    document.getElementById('mensaje').style.display = 'none';
    document.getElementById('puntaje').innerText = `🏆 Puntaje: 0`;
    iniciarCronometro();
}



// Actualizar el cronómetro en pantalla
function actualizarCronometro() {
    elapsedTime = Date.now() - startTime;
    const tiempoFormateado = formatearTiempo(elapsedTime);
    document.getElementById('tiempo').innerText = `⏱ Tiempo: ${tiempoFormateado}`;
}

// Formatear el tiempo en formato mm:ss
function formatearTiempo(tiempoEnMilisegundos) {
    const totalSegundos = Math.floor(tiempoEnMilisegundos / 1000);
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

// Mostrar el texto correspondiente al nivel actual
function mostrarTextoNivel() {
    const textoLectura = document.getElementById('textoLectura');
    textoLectura.innerText = niveles[nivelActual].texto;
}

// Calcular puntaje basado en el tiempo
function calcularPuntaje() {
    const totalSegundos = Math.floor(elapsedTime / 1000);
    const tiempoMaximo = niveles[nivelActual].tiempoMax;

    if (totalSegundos <= tiempoMaximo) {
        puntaje += 100;
    } else if (totalSegundos <= tiempoMaximo + 10) {
        puntaje += 80;
    } else if (totalSegundos <= tiempoMaximo + 20) {
        puntaje += 50;
    } else {
        puntaje += 20;
    }

    document.getElementById('puntaje').innerText = `🏆 Puntaje: ${puntaje}`;

    if (nivelActual < 5) {
        setTimeout(() => {
            alert(`¡Nivel ${nivelActual} completado!`);
            siguienteNivel();
        }, 500);
    } else {
        alert(`¡Juego completado! Puntaje final: ${puntaje} 🏆`);
        guardarPuntajeBD();
        guardarActividadBD();
    }
}

// Pasar al siguiente nivel
function siguienteNivel() {
    if (nivelActual < 5) {
        nivelActual++;
        elapsedTime = 0;
        document.getElementById('mensaje').style.display = 'none';
        // Dar vida extra si tiene menos de 3
        if (vidas < 3) {
            vidas++;
            actualizarVidas();
            alert('¡Has ganado una vida extra! ❤️');
        }
        iniciarCronometro();
    } else {
        mostrarVictoria();
    }
}

// Función para mostrar victoria
function mostrarVictoria() {
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.innerHTML = `
        <div class="mensaje-victoria">
            <h3>¡Felicitaciones! 🏆</h3>
            <p>Has completado todos los niveles</p>
            <p>Puntaje final: ${puntaje}</p>
            <button onclick="volverAlMenu()" class="btn-menu">Volver al menú</button>
        </div>
    `;
    mensajeDiv.style.display = 'block';
    guardarPuntajeBD();
}

// Guardar el puntaje en la base de datos
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
      nombre_actividad: "Lectura con Cronómetro",
      puntaje: puntaje,
      puntaje_maximo: 100,
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


// Volver al menú
function volverAlMenu() {
    window.location.href = '../index.html';
}

// Activar reconocimiento de voz
function activarReconocimientoVoz() {
    if (!('webkitSpeechRecognition' in window)) {
        alert('El reconocimiento de voz no es compatible con tu navegador.');
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
        console.log('Reconocimiento de voz activado.');
    };

    recognition.onresult = (event) => {
        const palabraDetectada = event.results[0][0].transcript.trim().toUpperCase();
        document.getElementById('vozDetectada').innerText = `🎤 Palabra Detectada: ${palabraDetectada}`;
        resaltarPalabra(palabraDetectada);
    };

    recognition.onerror = (event) => {
        console.error('Error en reconocimiento de voz:', event.error);
    };

    recognition.onend = () => {
        console.log('Reconocimiento de voz finalizado.');
    };

    recognition.start();
}

// Resaltar la palabra dicha en el texto
function resaltarPalabra(palabraDicha) {
    const textoLectura = document.getElementById('textoLectura');
    const palabras = textoLectura.innerText.split(' ');

    const textoModificado = palabras
        .map(palabra => (palabra.toUpperCase() === palabraDicha ? `<span class="highlight">${palabra}</span>` : palabra))
        .join(' ');

    textoLectura.innerHTML = textoModificado;
}
