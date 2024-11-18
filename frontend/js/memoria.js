// memoria.js

// Configuración del juego
const icons = ['🍓', '🍇', '🍉', '🍒', '🍍', '🍌', '🍎', '🍑']; // Iconos de ejemplo
let gameBoard = document.getElementById('gameBoard');
let flippedCards = [];
let matchedCards = 0;
let attempts = 0;
let score = 0;
let currentLevel = 'easy'; // Nivel por defecto

// Configuración de niveles
const levels = {
    easy: { pairs: 6, penalty: -3, reward: 5, showTime: 3000 },
    medium: { pairs: 12, penalty: -5, reward: 10, showTime: 5000 },
    hard: { pairs: 18, penalty: -7, reward: 15, showTime: 6000 }
};

// Función para volver al menú
function volverMenu() {
    window.location.href = '../index.html';
}

// Función para inicializar el tablero de juego con un nivel específico
function initializeGame(level = 'easy') {
    currentLevel = level;
    const { pairs, showTime } = levels[currentLevel];
    let cardIcons = [...icons.slice(0, pairs / 2), ...icons.slice(0, pairs / 2)]; // Selecciona las cartas según el nivel

    cardIcons = shuffleArray(cardIcons); // Mezclamos las cartas

    // Limpiamos el tablero antes de agregar nuevas cartas
    gameBoard.innerHTML = '';
    flippedCards = [];
    matchedCards = 0;
    attempts = 0;
    score = 0;

    // Actualizar el puntaje en la pantalla
    document.getElementById('score').textContent = score;
    document.getElementById('nextLevelBtn').classList.add('hidden');

    // Creamos cada carta
    cardIcons.forEach((icon, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('data-icon', icon);
        card.setAttribute('data-index', index);

        // Mostrar temporalmente el icono
        card.classList.add('flipped');
        card.innerHTML = icon;

        gameBoard.appendChild(card);
    });

    // Después del tiempo de visualización, ocultamos las cartas
    setTimeout(() => {
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('flipped');
            card.innerHTML = '';
            card.addEventListener('click', flipCard); // Agregar evento solo después de voltear
        });
    }, showTime);
}

// Función para mezclar las cartas
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Función para voltear una carta
function flipCard(event) {
    const selectedCard = event.target;

    // Verificamos que no esté ya volteada o que ya haya sido emparejada
    if (flippedCards.length < 2 && !selectedCard.classList.contains('flipped')) {
        selectedCard.classList.add('flipped');
        selectedCard.innerHTML = selectedCard.getAttribute('data-icon');
        flippedCards.push(selectedCard);

        if (flippedCards.length === 2) {
            attempts++;
            checkMatch();
        }
    }
}

// Función para verificar si las cartas coinciden
function checkMatch() {
    const [card1, card2] = flippedCards;
    const { penalty, reward } = levels[currentLevel];

    if (card1.getAttribute('data-icon') === card2.getAttribute('data-icon')) {
        // Coincidencia encontrada
        matchedCards += 2;
        score += reward;
        flippedCards = [];

        // Actualizar el puntaje en la pantalla
        document.getElementById('score').textContent = score;

        if (matchedCards === levels[currentLevel].pairs) {
            setTimeout(() => {
                alert(`¡Ganaste! Puntaje: ${score}`);
                saveScore(score); // Guardar el puntaje
                guardarJuegoBD();

                if (currentLevel === 'hard') {
                    // Si terminamos el nivel difícil, mostramos el puntaje final y la opción de ir a la página de ranking
                    alert(`¡Juego Completado! Puntaje Final: ${score}`);
                    window.location.href = '../pages/ranking.html'; // Redirigir a la página de ranking
                } else {
                    document.getElementById('nextLevelBtn').classList.remove('hidden');
                }
            }, 500);
        }
    } else {
        // Las cartas no coinciden
        score += penalty;
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.innerHTML = '';
            card2.innerHTML = '';
            flippedCards = [];
        }, 1000);

        // Actualizar el puntaje en la pantalla
        document.getElementById('score').textContent = score;
    }
}


// Función para guardar el puntaje en la tabla de ranking
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

function saveScore(score) {
  const token = localStorage.getItem("token");
  const url = "http://localhost:5000/api/ranking";

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ score }),
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
      nombre_juego: "Memoria Visual",
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



// Función para pasar al siguiente nivel
function goToNextLevel() {
    const levelsArray = Object.keys(levels);
    const currentIndex = levelsArray.indexOf(currentLevel);
    if (currentIndex < levelsArray.length - 1) {
        const nextLevel = levelsArray[currentIndex + 1];
        initializeGame(nextLevel);
        alert(`Nivel: ${nextLevel.toUpperCase()}`);
    } else {
        alert('¡Has completado todos los niveles!');
        volverMenu();
    }
}

// Inicializamos el juego al cargar la página
window.onload = () => {
    // Aquí puedes permitir al usuario seleccionar el nivel antes de inicializar el juego
    // Por ahora, inicializamos el nivel 'easy' por defecto
    initializeGame('easy');
};

// Mostrar el modal de instrucciones
const instruccionesModal = document.getElementById('instruccionesModal');
const closeModal = document.getElementsByClassName('close')[0];
const startGameBtn = document.getElementById('startGameBtn');

// Mostrar el modal al cargar la página
window.onload = () => {
    instruccionesModal.style.display = 'block';
};

// Cerrar el modal
closeModal.onclick = function () {
    instruccionesModal.style.display = 'none';
};

// Comenzar el juego al presionar el botón de inicio
startGameBtn.onclick = function () {
    instruccionesModal.style.display = 'none';
    initializeGame('easy');
};

// Cerrar el modal al hacer clic fuera del mismo
window.onclick = function (event) {
    if (event.target === instruccionesModal) {
        instruccionesModal.style.display = 'none';
    }
};