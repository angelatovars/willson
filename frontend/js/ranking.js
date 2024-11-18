document.addEventListener("DOMContentLoaded", function () {
  cargarRanking();
});

function cargarRanking() {
  fetch("http://localhost:5000/api/ranking", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data && data.length > 0) {
        const datosAgrupados = agruparPuntosPorUsuario(data);
        mostrarRanking(datosAgrupados);
      } else {
        alert("No se encontraron datos del ranking.");
      }
    })
    .catch((error) => {
      console.error("Error al cargar el ranking:", error);
      alert("Hubo un problema al cargar el ranking.");
    });
}

// Función para agrupar los puntajes de cada usuario

function agruparPuntosPorUsuario(data) {
  const puntajesPorUsuario = {};
  data.forEach((jugador) => {
    if (puntajesPorUsuario[jugador.nombre]) {
      puntajesPorUsuario[jugador.nombre] += jugador.puntaje_total;
    } else {
      puntajesPorUsuario[jugador.nombre] = jugador.puntaje_total;
    }
  });

  // Convierte el objeto en un array y ordena por puntaje en orden descendente
  const datosAgrupados = Object.keys(puntajesPorUsuario).map((nombre) => ({
    nombre,
    puntaje_total: puntajesPorUsuario[nombre],
  }));

  // Ordena por puntaje de mayor a menor
  datosAgrupados.sort((a, b) => b.puntaje_total - a.puntaje_total);

  // Limita el resultado a los 25 mejores jugadores
  return datosAgrupados.slice(0, 25);
}

function mostrarRanking(rankingData) {
  const rankingBody = document.getElementById("rankingBody");
  rankingBody.innerHTML = ""; // Limpia el contenido anterior

  // Crear las filas de la tabla de ranking
  rankingData.forEach((jugador, index) => {
    const fila = document.createElement("tr");

    // Columna del puesto
    const puestoCelda = document.createElement("td");
    if (index === 0) {
      puestoCelda.innerHTML = "🥇 1er";
    } else if (index === 1) {
      puestoCelda.innerHTML = "🥈 2do";
    } else if (index === 2) {
      puestoCelda.innerHTML = "🥉 3ro";
    } else {
      puestoCelda.innerText = `${index + 1}º`;
    }

    // Columna del nombre del jugador
    const nombreCelda = document.createElement("td");
    nombreCelda.innerText = jugador.nombre;

    // Columna del puntaje
    const puntajeCelda = document.createElement("td");
    puntajeCelda.innerText = jugador.puntaje_total;

    // Agregar las celdas a la fila
    fila.appendChild(puestoCelda);
    fila.appendChild(nombreCelda);
    fila.appendChild(puntajeCelda);

    // Agregar la fila al cuerpo de la tabla
    rankingBody.appendChild(fila);
  });
}

function volverAlMenu() {
  window.location.href = "../pages/index.html";
}
