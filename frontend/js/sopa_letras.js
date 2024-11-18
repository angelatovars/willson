// Configuración de niveles
const niveles = {
    facil: {
        palabras: ['PERRO', 'GATO', 'VACA', 'POLLO'],
        tiempo: 180,
        puntosPorPalabra: 100
    },
    intermedio: {
        palabras: ['MESA', 'SILLA', 'CAMA', 'LIBRO', 'TAZA', 'PLATO', 'RELOJ'],
        tiempo: 150,
        puntosPorPalabra: 150
    },
    dificil: {
        palabras: ['ROJO', 'AZUL', 'VERDE', 'NEGRO', 'BLANCO', 'GRIS', 'ROSA', 'CAFE', 'CORAL'],
        tiempo: 120,
        puntosPorPalabra: 200
    }
};

// Variables globales
let nivelActual = 'facil';
let palabras = [];
let palabrasEncontradas = new Set();
let seleccionActual = [];
let puntaje = 0;
let seleccionInicial = null;
let tiempoRestante = 0;
let timerInterval;

// Matrices de sopa de letras para cada nivel
const sopaLetrasNiveles = {
    facil: [
        ['P', 'E', 'R', 'R', 'O', 'M', 'N', 'O'],
        ['P', 'A', 'T', 'O', 'L', 'A', 'L', 'P'],
        ['G', 'A', 'T', 'O', 'L', 'R', 'U', 'Q'],
        ['V', 'A', 'C', 'A', 'K', 'J', 'N', 'W'],
        ['P', 'O', 'L', 'L', 'O', 'U', 'T', 'S'],
        ['R', 'Q', 'P', 'O', 'N', 'M', 'L', 'K']
    ],
    intermedio: [
        ['M', 'E', 'S', 'A', 'P', 'M', 'N', 'O'],
        ['S', 'I', 'L', 'L', 'A', 'A', 'L', 'P'],
        ['C', 'A', 'M', 'A', 'L', 'R', 'U', 'Q'],
        ['L', 'I', 'B', 'R', 'O', 'J', 'N', 'W'],
        ['T', 'A', 'Z', 'A', 'B', 'C', 'A', 'E'],
        ['P', 'L', 'A', 'T', 'O', 'G', 'H', 'I'],
        ['R', 'E', 'L', 'O', 'J', 'U', 'T', 'S'],
        ['R', 'Q', 'P', 'O', 'N', 'M', 'L', 'K']
    ],
    dificil: [
        ['R', 'O', 'J', 'O', 'P', 'M', 'N', 'O'],
        ['A', 'Z', 'U', 'L', 'O', 'A', 'L', 'P'],
        ['V', 'E', 'R', 'D', 'E', 'R', 'U', 'Q'],
        ['N', 'E', 'G', 'R', 'O', 'J', 'N', 'W'],
        ['B', 'L', 'A', 'N', 'C', 'O', 'A', 'E'],
        ['G', 'R', 'I', 'S', 'F', 'G', 'H', 'I'],
        ['R', 'O', 'S', 'A', 'C', 'A', 'F', 'E'],
        ['C', 'O', 'R', 'A', 'L', 'M', 'L', 'K']
    ]
};

// Posiciones posibles para las palabras
const posiciones = [
    { fila: 0, col: 0, direccion: 'horizontal' },
    { fila: 1, col: 2, direccion: 'horizontal' },
    { fila: 2, col: 0, direccion: 'vertical' },
    { fila: 3, col: 3, direccion: 'horizontal' },
    { fila: 4, col: 1, direccion: 'horizontal' },
    { fila: 0, col: 2, direccion: 'vertical' },
    { fila: 2, col: 5, direccion: 'vertical' },
    { fila: 5, col: 0, direccion: 'horizontal' }
];

// Mezclar las posiciones
shuffleArray(posiciones);

// Función para mezclar array
function shuffleArray(array) {
for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
}
return array;
}

// Manejo del modal y selección de nivel
document.addEventListener('DOMContentLoaded', () => {
    const botonEmpezar = document.getElementById('botonEmpezar');
    const pantallaInicial = document.getElementById('pantallaInicial');
    const seleccionNivel = document.getElementById('seleccionNivel');
    const contenidoJuego = document.getElementById('contenidoJuego');

    botonEmpezar.addEventListener('click', () => {
        pantallaInicial.style.display = 'none';
        seleccionNivel.classList.remove('oculto');
    });
});

// Seleccionar nivel y comenzar juego
function seleccionarNivel(nivel) {
    nivelActual = nivel;
    palabras = niveles[nivel].palabras;
    tiempoRestante = niveles[nivel].tiempo;
    
    document.getElementById('seleccionNivel').classList.add('oculto');
    document.getElementById('contenidoJuego').classList.remove('oculto');
    
    iniciarJuego();
}

// Inicializar juego
function iniciarJuego() {
    palabrasEncontradas.clear();
    puntaje = 0;
    crearTablero();
    crearListaPalabras();
    actualizarPuntaje();
    iniciarTimer();
}

// Crear tablero
function crearTablero() {
    const tablero = document.getElementById('sopaLetras');
    tablero.innerHTML = '';
    const sopaLetras = sopaLetrasNiveles[nivelActual];

    for (let i = 0; i < sopaLetras.length; i++) {
        for (let j = 0; j < sopaLetras[i].length; j++) {
            const letra = document.createElement('div');
            letra.className = 'letra';
            letra.textContent = sopaLetras[i][j];
            letra.dataset.fila = i;
            letra.dataset.columna = j;
            
            letra.addEventListener('mousedown', (e) => iniciarSeleccion(i, j, letra, e));
            letra.addEventListener('mouseover', (e) => continuarSeleccion(i, j, letra, e));
            letra.addEventListener('mouseup', () => finalizarSeleccion());
            
            tablero.appendChild(letra);
        }
    }

    document.addEventListener('selectstart', (e) => e.preventDefault());
}

// Crear lista de palabras
function crearListaPalabras() {
    const listaPalabras = document.getElementById('palabras');
    listaPalabras.innerHTML = '';
    palabras.forEach(palabra => {
        const li = document.createElement('li');
        li.textContent = palabra;
        li.id = `palabra-${palabra}`;
        listaPalabras.appendChild(li);
    });
}

// Iniciar timer
function iniciarTimer() {
    const timerElement = document.createElement('div');
    timerElement.id = 'timer';
    document.querySelector('.info-container').appendChild(timerElement);

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        tiempoRestante--;
        const minutos = Math.floor(tiempoRestante / 60);
        const segundos = tiempoRestante % 60;
        timerElement.textContent = `⏱️ Tiempo: ${minutos}:${segundos.toString().padStart(2, '0')}`;

        if (tiempoRestante <= 0) {
            clearInterval(timerInterval);
            finalizarJuego(false);
        }
    }, 1000);
}

// Iniciar selección
function iniciarSeleccion(fila, columna, elemento, evento) {
    if (evento.button !== 0) return;
    limpiarSeleccion();
    seleccionInicial = { fila, columna };
    seleccionarLetra(fila, columna, elemento);
}

// Continuar selección
function continuarSeleccion(fila, columna, elemento, evento) {
    if (!seleccionInicial || evento.buttons !== 1) return;

    const deltaFila = fila - seleccionInicial.fila;
    const deltaColumna = columna - seleccionInicial.columna;

    if (deltaFila === 0 || deltaColumna === 0 || Math.abs(deltaFila) === Math.abs(deltaColumna)) {
        limpiarSeleccion();
        seleccionarPalabra(seleccionInicial.fila, seleccionInicial.columna, fila, columna);
    }
}

// Finalizar selección
function finalizarSeleccion() {
    if (seleccionActual.length > 0) {
        verificarPalabra();
    }
    seleccionInicial = null;
}

// Seleccionar palabra
function seleccionarPalabra(filaInicio, colInicio, filaFin, colFin) {
    const deltaFila = Math.sign(filaFin - filaInicio);
    const deltaCol = Math.sign(colFin - colInicio);
    let fila = filaInicio;
    let col = colInicio;

    while (true) {
        const letra = document.querySelector(
            `.letra[data-fila="${fila}"][data-columna="${col}"]`
        );
        seleccionarLetra(fila, col, letra);

        if (fila === filaFin && col === colFin) break;
        
        fila += deltaFila;
        col += deltaCol;
    }
}

// Seleccionar letra
function seleccionarLetra(fila, columna, elemento) {
    if (elemento.classList.contains('encontrada')) return;

    elemento.classList.add('seleccionada');
    seleccionActual.push({
        fila,
        columna,
        letra: elemento.textContent
    });
}

// Verificar palabra
function verificarPalabra() {
    const palabraFormada = seleccionActual.map(pos => pos.letra).join('');
    const palabraReversa = palabraFormada.split('').reverse().join('');
    
    if ((palabras.includes(palabraFormada) || palabras.includes(palabraReversa)) && 
        !palabrasEncontradas.has(palabraFormada) && 
        !palabrasEncontradas.has(palabraReversa)) {
        
        const palabraCorrecta = palabras.includes(palabraFormada) ? palabraFormada : palabraReversa;
        palabrasEncontradas.add(palabraCorrecta);
        puntaje += niveles[nivelActual].puntosPorPalabra;
        
        seleccionActual.forEach(pos => {
            const letra = document.querySelector(
                `.letra[data-fila="${pos.fila}"][data-columna="${pos.columna}"]`
            );
            letra.classList.remove('seleccionada');
            letra.classList.add('encontrada');
        });

        const palabraElement = document.getElementById(`palabra-${palabraCorrecta}`);
        if (palabraElement) {
            palabraElement.classList.add('encontrada');
        }

        actualizarPuntaje();

        if (palabrasEncontradas.size === palabras.length) {
            clearInterval(timerInterval);
            setTimeout(() => {
                finalizarJuego(true);
            }, 500);
        }
    } else {
        limpiarSeleccion();
    }
}

// Limpiar selección
function limpiarSeleccion() {
    seleccionActual.forEach(pos => {
        const letra = document.querySelector(
            `.letra[data-fila="${pos.fila}"][data-columna="${pos.columna}"]`
        );
        if (!letra.classList.contains('encontrada')) {
            letra.classList.remove('seleccionada');
        }
    });
    seleccionActual = [];
}

// Actualizar puntaje
function actualizarPuntaje() {
    document.getElementById('puntaje').textContent = `🏆 Puntaje: ${puntaje}`;
}

// Finalizar juego
function finalizarJuego(victoria) {
    clearInterval(timerInterval);
    const mensaje = victoria ? 
        `¡Felicitaciones! Has completado el nivel ${nivelActual}.\nPuntaje final: ${puntaje}` :
        `¡Se acabó el tiempo! Nivel ${nivelActual}.\nPuntaje final: ${puntaje}`;
    
    alert(mensaje);
    guardarPuntajeBD();
    guardarJuegoBD();
}

// Guardar puntaje
function guardarPuntajeBD() {
  const token = localStorage.getItem("token");
  const url = "http://localhost:5000/api/ranking";

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ puntaje }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Puntaje guardado:", data);
    })
    .catch((error) => {
      console.error("Error al guardar el puntaje:", error);
    });
}

function guardarJuegoBD() {
  const token = localStorage.getItem("token");
  const url = "http://localhost:5000/api/games";

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      nombre_juego: "Sopa de Letras",
      puntaje: puntaje,
      puntaje_maximo: 1000,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Juego Guardado:", data);
    })
    .catch((error) => {
      console.error("Error al guardar el Juego:", error);
    });
}


// Volver al menú
function volverMenu() {
    window.location.href = '../index.html';
}

// Event Listeners
document.addEventListener('contextmenu', function(e) {
    if (e.target.classList.contains('letra')) {
        e.preventDefault();
        limpiarSeleccion();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        limpiarSeleccion();
    }
});

document.getElementById('sopaLetras').addEventListener('mouseleave', () => {
    if (seleccionInicial) {
        finalizarSeleccion();
    }
});