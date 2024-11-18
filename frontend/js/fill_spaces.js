const niveles = {
  1: {
    dificultad: "fácil",
    oracion: "El ___ está en el jardín.",
    opciones: ["perro", "gato", "pájaro"],
    respuesta: "perro",
    puntosCorrecta: 2,
    puntosIncorrecta: -1,
  },
  2: {
    dificultad: "fácil",
    oracion: "El ___ saltó la valla.",
    opciones: ["gato", "perro", "conejo"],
    respuesta: "gato",
    puntosCorrecta: 2,
    puntosIncorrecta: -1,
  },
  3: {
    dificultad: "fácil",
    oracion: "La ___ brilla en el cielo.",
    opciones: ["estrella", "luna", "nube"],
    respuesta: "luna",
    puntosCorrecta: 2,
    puntosIncorrecta: -1,
  },
  4: {
    dificultad: "fácil",
    oracion: "El coche está en el ___.",
    opciones: ["garaje", "calle", "parque"],
    respuesta: "garaje",
    puntosCorrecta: 2,
    puntosIncorrecta: -1,
  },
  5: {
    dificultad: "fácil",
    oracion: "La ___ está sobre la mesa.",
    opciones: ["manzana", "pera", "naranja"],
    respuesta: "manzana",
    puntosCorrecta: 2,
    puntosIncorrecta: -1,
  },
  6: {
    dificultad: "medio",
    oracion: "La ___ está encendida.",
    opciones: ["computadora", "ventana", "mesa", "pantalla"],
    respuesta: "computadora",
    puntosCorrecta: 4,
    puntosIncorrecta: -2,
  },
  7: {
    dificultad: "medio",
    oracion: "El ___ se desbordó tras la lluvia.",
    opciones: ["río", "arroyo", "mar"],
    respuesta: "río",
    puntosCorrecta: 4,
    puntosIncorrecta: -2,
  },
  8: {
    dificultad: "medio",
    oracion: "La ___ ilumina la sala.",
    opciones: ["ventana", "lámpara", "puerta", "pintura"],
    respuesta: "lámpara",
    puntosCorrecta: 4,
    puntosIncorrecta: -2,
  },
  9: {
    dificultad: "difícil",
    oracion: "El coche está en el ___ de la casa.",
    opciones: ["jardín", "garaje", "puerta", "calle"],
    respuesta: "garaje",
    puntosCorrecta: 6,
    puntosIncorrecta: -3,
  },
  10: {
    dificultad: "difícil",
    oracion: "El ___ voló sobre la montaña.",
    opciones: ["águila", "condor", "halcón"],
    respuesta: "águila",
    puntosCorrecta: 6,
    puntosIncorrecta: -3,
  },
  11: {
    dificultad: "difícil",
    oracion: "El tren cruzó el ___.",
    opciones: ["puente", "túnel", "valle"],
    respuesta: "túnel",
    puntosCorrecta: 6,
    puntosIncorrecta: -3,
  },
};

let nivelActual = 1;
let puntaje = 0;

function cargarNivel() {
  const { oracion, opciones } = niveles[nivelActual];
  document.getElementById("oracion").innerHTML = oracion.replace(
    "___",
    "<span class='espacio'>___</span>"
  );

  const palabrasContainer = document.getElementById("palabras");
  palabrasContainer.innerHTML = ""; // Limpiar opciones anteriores

  opciones.forEach((opcion) => {
    const button = document.createElement("button");
    button.innerText = opcion;
    button.addEventListener("click", () => verificarRespuesta(button, opcion));
    palabrasContainer.appendChild(button);
  });
}

function verificarRespuesta(button, opcion) {
  const { respuesta, puntosCorrecta, puntosIncorrecta } = niveles[nivelActual];

  if (opcion === respuesta) {
    puntaje += puntosCorrecta;
    button.classList.add("correct");
    document.querySelector(".espacio").innerText = respuesta;

    setTimeout(() => {
      if (nivelActual < 11) {
        nivelActual++;
        cargarNivel();
      } else {
        alert("¡Felicidades! Has completado todos los niveles.");
        guardarPuntajeBD();
        guardarActividadBD();
      }
    }, 1000);
  } else {
    puntaje += puntosIncorrecta;
    button.classList.add("incorrect");
    setTimeout(() => {
      button.classList.remove("incorrect");
    }, 500);
  }

  actualizarPuntaje();
}

// Actualizar puntaje
function actualizarPuntaje() {
  document.getElementById("puntaje").innerText = `🏆 Puntaje: ${puntaje}`;
}

// Guardar puntaje en la base de datos
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
      nombre_actividad: "Llenar los Espacios",
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

// Mostrar instrucciones y empezar juego
document.getElementById("empezarJuego").addEventListener("click", () => {
  document.getElementById("instruccionesModal").style.display = "none";
  cargarNivel();
});

// Mostrar instrucciones al cargar la página
window.onload = function () {
  const modal = document.getElementById("instruccionesModal");
  modal.style.display = "block";

  document.querySelector(".close").onclick = function () {
    modal.style.display = "none";
  };
};

function volverMenu() {
  window.location.href = "../index.html";
}
