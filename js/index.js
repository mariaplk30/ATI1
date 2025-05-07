function formatearLista(list) {
    if (list.length <= 1) {
        return list.join(", "); // Si solo hay uno, simplemente devuelve el elemento
    } else {
        const lastElement = list.pop(); // Extraemos el último elemento
        return list.join(", ") + " y " + lastElement; // Unimos el resto y añadimos "y" antes del último
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Cargar configuración
    fetch("./conf/configES.json")
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar configuración");
            return response.json(); 
        })
        .then(config => {
            console.log("Configuración cargada:", config);

            document.querySelector(".titulo").innerHTML = `
                ${config.sitio[0]}<span>${config.sitio[1]}</span> ${config.sitio[2]}
            `;
            document.querySelector(".texto-centro").textContent = config.saludo + ", ";
            document.querySelector('input[type="text"]').placeholder = config.nombre + "...";
            document.querySelector('input[type="submit"]').value = config.buscar;
            document.querySelector("footer").textContent = config.copyRight;
        })
        .catch(error => {
            console.error("Error:", error);
        });

    // Cargar estudiantes
    fetch("./datos/index.json")
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar estudiantes");
            return response.json();
        })
        .then(perfiles => {
            const lista = document.querySelector(".estudiantes");

            perfiles.forEach(est => {
                const li = document.createElement("li");
                li.classList.add("estudiante-item");

                li.innerHTML = `
                    <img src="${est.imagen}" alt="Foto de ${est.nombre}">
                    <p>${est.nombre}</p>
                `;

                // Hace que el <li> sea clickeable
                li.addEventListener("click", () => {
                    window.location.href = `perfil.html?ci=${est.ci}`;
                });

                // Opcional: cambia el cursor para dar feedback de que es clickeable
                li.style.cursor = "pointer";

                lista.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Error al cargar estudiantes:", error);
        });

    // Detectar si estamos en perfil.html
    if (window.location.pathname.includes("perfil.html")) {
        const params = new URLSearchParams(window.location.search);
        const ci = params.get("ci");

        if (ci) {
            fetch(`./${ci}/perfil.json`)
                .then(response => {
                    if (!response.ok) throw new Error("No se pudo cargar el perfil.");
                    return response.json();
                })
                .then(perfil => {
                    // Imagen principal
                    console.log("Perfil cargado:", perfil);
                    function buscarImagen(imageElement, ci) {
                        const imagePath = `${ci}/${ci}`;
                        imageElement.src = `${imagePath}.png`;
                
                        imageElement.onerror = function() {
                            imageElement.src = `${imagePath}.jpg`;
                        };
                    }

                    buscarImagen(document.getElementById("foto-perfil"), ci);
                    buscarImagen(document.getElementById("img-lg"), ci);
                    buscarImagen(document.getElementById("img-sm"), ci);                    
                                
                    // Nombre y descripción
                    document.getElementById("nombre-perfil").textContent = perfil.nombre;
                    document.getElementById("bio-perfil").textContent = perfil.descripcion;

                    // Preferencias
                    document.getElementById("pref-color").textContent = perfil.color;
                    document.getElementById("pref-libro").textContent = perfil.libro;
                    document.getElementById("pref-musica").textContent = formatearLista(perfil.musica || []);
                    document.getElementById("pref-videojuego").textContent = formatearLista(perfil.video_juego || []);
                    document.getElementById("pref-lenguajes").textContent = formatearLista(perfil.lenguajes || []);

                    // Contacto
                    const emailLink = document.getElementById("email-perfil");
                    emailLink.href = `mailto:${perfil.email}`;
                    emailLink.textContent = perfil.email;
                })
                .catch(error => {
                    console.error("Error al cargar el perfil:", error);
                    const infoContenedor = document.querySelector(".info-contenedor");
                    if (infoContenedor) {
                        infoContenedor.innerHTML = "<p>Error al cargar el perfil del estudiante.</p>";
                    }
                });
        } else {
            const infoContenedor = document.querySelector(".info-contenedor");
            if (infoContenedor) {
                infoContenedor.innerHTML = "<p>No se especificó un perfil válido.</p>";
            }
        }
    }
});
